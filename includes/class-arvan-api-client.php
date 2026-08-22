<?php
/**
 * Core ArvanCloud REST API Client & Sandbox Mock Engine (OpenAPI v3.0.1 Compliant).
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Core API Client for interacting with ArvanCloud REST APIs.
 *
 * Fully conforms to the ArvanCloud IaaS v3.0.1 OpenAPI specification
 * with dynamic regional endpoint routing (https://ecc.[region].arvanapis.ir/v3),
 * API Key / Bearer authentication, transient caching, unified error handling,
 * realistic sandbox simulation, and backward compatibility for legacy callers.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */
class Arvan_API_Client {

	/**
	 * Default fallback base URL for legacy ArvanCloud REST APIs.
	 */
	const BASE_URL = 'https://napi.arvancloud.ir';

	/**
	 * Regional IaaS v3 API Endpoint Template.
	 */
	const IAAS_V3_TEMPLATE = 'https://ecc.%s.arvanapis.ir/v3';

	/**
	 * General IaaS v3 Base URL (when region is not in subdomain).
	 */
	const IAAS_V3_BASE = 'https://ecc.arvanapis.ir/v3';

	/**
	 * S3 Storage Endpoint Base URL.
	 */
	const S3_BASE_URL = 'https://s3.ir-thr-at1.arvanstorage.ir';

	/**
	 * API Key for authentication.
	 *
	 * @var string
	 */
	protected $api_key;

	/**
	 * Request timeout in seconds.
	 *
	 * @var int
	 */
	protected $timeout = 30;

	/**
	 * Sandbox / Demo mode toggle.
	 *
	 * @var bool
	 */
	protected $sandbox_mode = false;

	/**
	 * Default availability zone / region.
	 *
	 * @var string
	 */
	protected $default_region = 'ir-thr-ba1';

	/**
	 * Constructor.
	 *
	 * @param string|null $api_key Optional custom API key. If null, loads from wp_options.
	 */
	public function __construct( $api_key = null ) {
		if ( null !== $api_key ) {
			$this->api_key = trim( $api_key );
		} else {
			$this->api_key = trim( (string) get_option( 'arvan_api_key', '' ) );
		}
		$this->sandbox_mode   = (bool) get_option( 'arvan_sandbox_mode', 1 );
		$this->default_region = (string) get_option( 'arvan_default_region', 'ir-thr-ba1' );
	}

	/**
	 * Check if API key is configured.
	 *
	 * @return bool
	 */
	public function is_configured() {
		return ! empty( $this->api_key );
	}

	/**
	 * Get whether sandbox mode is currently active.
	 *
	 * @return bool
	 */
	public function is_sandbox() {
		return $this->sandbox_mode || ! $this->is_configured();
	}

	/**
	 * Construct full URL for an IaaS v3 endpoint based on target availability zone / region.
	 *
	 * @param string      $endpoint Relative endpoint (e.g. '/availability-zones', '/servers').
	 * @param string|null $region   Availability zone (e.g. 'ir-thr-ba1').
	 * @return string Full URL.
	 */
	public function build_iaas_url( $endpoint, $region = null ) {
		if ( 0 === strpos( $endpoint, 'http://' ) || 0 === strpos( $endpoint, 'https://' ) ) {
			return $endpoint;
		}

		$clean_endpoint = '/' . ltrim( $endpoint, '/' );
		$target_region  = ! empty( $region ) ? sanitize_key( $region ) : $this->default_region;

		// Clean up region name (e.g., ir-thr-c2 -> ir-thr-ba1 fallback)
		if ( empty( $target_region ) ) {
			$target_region = 'ir-thr-ba1';
		}

		// Support legacy /ecc/v1 endpoints seamlessly
		if ( 0 === strpos( $clean_endpoint, '/ecc/v1' ) ) {
			return self::BASE_URL . $clean_endpoint;
		}

		// Use official v3 regional endpoint
		return sprintf( self::IAAS_V3_TEMPLATE, $target_region ) . $clean_endpoint;
	}

	/**
	 * Central request dispatcher utilizing wp_remote_request().
	 *
	 * @param string      $endpoint   Relative endpoint (e.g. '/availability-zones') or full URL.
	 * @param string      $method     HTTP verb: GET, POST, PUT, PATCH, DELETE.
	 * @param array       $body       Optional request payload array.
	 * @param array       $headers    Optional additional headers.
	 * @param int         $cache_ttl  Cache TTL in seconds for GET requests. 0 to disable cache.
	 * @param string|null $region     Optional availability zone / region.
	 * @return array|WP_Error Parsed JSON response data array or WP_Error on failure.
	 */
	public function request( $endpoint, $method = 'GET', $body = array(), $headers = array(), $cache_ttl = 0, $region = null ) {
		$method = strtoupper( $method );

		// If unconfigured or in sandbox mode, generate realistic mock responses
		if ( ! $this->is_configured() || $this->sandbox_mode ) {
			if ( $this->sandbox_mode ) {
				return $this->get_mock_response( $endpoint, $method, $body, $region );
			}
			return new WP_Error(
				'arvan_api_unconfigured',
				__( 'ArvanCloud API key is not configured. Please configure your API key in WP Admin > Arvan Reseller > Settings.', 'arv-seller' )
			);
		}

		// Build target URL based on endpoint category
		if ( 0 === strpos( $endpoint, 'http://' ) || 0 === strpos( $endpoint, 'https://' ) ) {
			$url = $endpoint;
		} elseif ( 0 === strpos( $endpoint, 'cdn/' ) || 0 === strpos( $endpoint, '/cdn/' ) || 0 === strpos( $endpoint, 'storage/' ) || 0 === strpos( $endpoint, '/storage/' ) || 0 === strpos( $endpoint, 'ecc/v1' ) || 0 === strpos( $endpoint, '/ecc/v1' ) ) {
			$url = self::BASE_URL . '/' . ltrim( $endpoint, '/' );
		} else {
			$url = $this->build_iaas_url( $endpoint, $region );
		}

		// Check transient cache for GET requests
		$cache_key = '';
		if ( 'GET' === $method && $cache_ttl > 0 ) {
			$cache_key = 'arvan_api_' . md5( $url . serialize( $body ) );
			$cached    = get_transient( $cache_key );
			if ( false !== $cached ) {
				return $cached;
			}
		}

		// Authentication Header (Supports "Apikey {uuid}", "apikey {uuid}", or "Bearer {token}")
		$auth_header = $this->api_key;
		if ( 0 !== stripos( $auth_header, 'apikey ' ) && 0 !== stripos( $auth_header, 'bearer ' ) ) {
			$auth_header = 'Apikey ' . $auth_header;
		}

		$default_headers = array(
			'Authorization' => $auth_header,
			'Content-Type'  => 'application/json',
			'Accept'        => 'application/json',
		);

		$request_headers = array_merge( $default_headers, $headers );

		$args = array(
			'method'      => $method,
			'timeout'     => $this->timeout,
			'redirection' => 5,
			'httpversion' => '1.1',
			'blocking'    => true,
			'headers'     => $request_headers,
			'sslverify'   => apply_filters( 'arvan_api_ssl_verify', true ),
		);

		if ( ! empty( $body ) ) {
			if ( 'GET' === $method ) {
				$url = add_query_arg( $body, $url );
			} else {
				$args['body'] = wp_json_encode( $body );
			}
		}

		$response = wp_remote_request( $url, $args );

		if ( is_wp_error( $response ) ) {
			if ( $this->sandbox_mode ) {
				return $this->get_mock_response( $endpoint, $method, $body, $region );
			}
			return new WP_Error(
				'arvan_http_error',
				sprintf( __( 'HTTP Request Failed: %s', 'arv-seller' ), $response->get_error_message() )
			);
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		$raw_body    = wp_remote_retrieve_body( $response );
		$data        = json_decode( $raw_body, true );

		if ( null === $data && ! empty( $raw_body ) ) {
			$data = array( 'raw' => $raw_body );
		}

		// Handle error status codes (4xx, 5xx)
		if ( $status_code < 200 || $status_code >= 300 ) {
			if ( $this->sandbox_mode ) {
				return $this->get_mock_response( $endpoint, $method, $body, $region );
			}
			$error_message = isset( $data['message'] ) ? $data['message'] : ( isset( $data['error'] ) ? $data['error'] : 'Unknown ArvanCloud API error.' );
			return new WP_Error(
				'arvan_api_error_' . $status_code,
				$error_message,
				array(
					'status_code' => $status_code,
					'response'    => $data,
				)
			);
		}

		// Cache successful GET response
		if ( 'GET' === $method && $cache_ttl > 0 && ! empty( $cache_key ) ) {
			set_transient( $cache_key, $data, $cache_ttl );
		}

		return $data;
	}

	/* =========================================================================
	   IaaS v3 (Cloud Server / ECC) API Endpoints
	   ========================================================================= */

	/**
	 * List availability zones in a region (OpenAPI: GET /availability-zones).
	 *
	 * @param int $cache_ttl Cache lifetime in seconds (default 1 hour).
	 * @return array|WP_Error
	 */
	public function get_availability_zones( $cache_ttl = 3600 ) {
		$res = $this->request( 'availability-zones', 'GET', array(), array(), $cache_ttl );
		if ( is_wp_error( $res ) && ! $this->sandbox_mode ) {
			// Fallback to legacy endpoint if regional v3 not reachable
			$fallback = $this->request( 'ecc/v1/regions', 'GET', array(), array(), $cache_ttl );
			if ( ! is_wp_error( $fallback ) ) {
				return $fallback;
			}
		}
		return $res;
	}

	/**
	 * Alias for get_availability_zones() providing backward compatibility with get_regions().
	 *
	 * @param int $cache_ttl Cache lifetime (default 1 hour).
	 * @return array|WP_Error
	 */
	public function get_regions( $cache_ttl = 3600 ) {
		return $this->get_availability_zones( $cache_ttl );
	}

	/**
	 * List all available server flavors/sizes (OpenAPI: GET /flavors).
	 *
	 * @param string $region    Availability zone / Region (e.g. 'ir-thr-ba1').
	 * @param int    $cache_ttl Cache lifetime in seconds (default 1 hour).
	 * @param array  $query     Optional query parameters (page, perPage, etc.).
	 * @return array|WP_Error
	 */
	public function get_flavors( $region = 'ir-thr-ba1', $cache_ttl = 3600, $query = array() ) {
		$res = $this->request( 'flavors', 'GET', $query, array(), $cache_ttl, $region );
		if ( is_wp_error( $res ) && ! $this->sandbox_mode ) {
			// Fallback to legacy endpoint
			$fallback = $this->request( "ecc/v1/regions/{$region}/sizes", 'GET', $query, array(), $cache_ttl );
			if ( ! is_wp_error( $fallback ) ) {
				return $fallback;
			}
		}
		return $res;
	}

	/**
	 * Get details of a specific server flavor by its ID (OpenAPI: GET /flavors/{id}).
	 *
	 * @param string $flavor_id Plan/Flavor ID (e.g. 'g2-2-2-0').
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function get_flavor( $flavor_id, $region = 'ir-thr-ba1' ) {
		return $this->request( "flavors/{$flavor_id}", 'GET', array(), array(), 3600, $region );
	}

	/**
	 * Calculate flavor price with additional volume size (OpenAPI: POST /flavors/{id}/calculate).
	 *
	 * @param string $flavor_id   Plan/Flavor ID.
	 * @param int    $volume_size Volume size in GB.
	 * @param string $region      Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function calculate_flavor_price( $flavor_id, $volume_size = 0, $region = 'ir-thr-ba1' ) {
		return $this->request(
			"flavors/{$flavor_id}/calculate",
			'POST',
			array( 'volumeSize' => absint( $volume_size ) ),
			array(),
			0,
			$region
		);
	}

	/**
	 * List OS and application images (OpenAPI: GET /images).
	 *
	 * @param string $region    Availability zone / Region.
	 * @param int    $cache_ttl Cache lifetime in seconds (default 1 hour).
	 * @param array  $query     Optional query parameters (page, perPage, type, etc.).
	 * @return array|WP_Error
	 */
	public function get_images( $region = 'ir-thr-ba1', $cache_ttl = 3600, $query = array() ) {
		$res = $this->request( 'images', 'GET', $query, array(), $cache_ttl, $region );
		if ( is_wp_error( $res ) && ! $this->sandbox_mode ) {
			// Fallback to legacy endpoint
			$fallback = $this->request( "ecc/v1/regions/{$region}/images", 'GET', $query, array(), $cache_ttl );
			if ( ! is_wp_error( $fallback ) ) {
				return $fallback;
			}
		}
		return $res;
	}

	/**
	 * Create a new Cloud Server instance (OpenAPI: POST /servers).
	 *
	 * Request Body conforms to CreateServer schema:
	 * - availabilityZone (string, required)
	 * - flavorId (string, required)
	 * - imageId (string UUID, required)
	 * - name (string, required)
	 * - rootVolumeSizeGigaBytes (int, required)
	 * - enableIpv4 (bool)
	 * - enableIpv6 (bool)
	 * - sshKeyName (string)
	 * - initScript (string)
	 * - firewallNames (array)
	 *
	 * @param array $params Parameter map supporting both v3 and legacy keys.
	 * @return array|WP_Error
	 */
	public function create_server( $params ) {
		$zone = ! empty( $params['availabilityZone'] )
			? sanitize_text_field( $params['availabilityZone'] )
			: ( ! empty( $params['region'] ) ? sanitize_text_field( $params['region'] ) : $this->default_region );

		$flavor_id = ! empty( $params['flavorId'] )
			? sanitize_text_field( $params['flavorId'] )
			: ( ! empty( $params['size_id'] ) ? sanitize_text_field( $params['size_id'] ) : ( ! empty( $params['flavor_id'] ) ? sanitize_text_field( $params['flavor_id'] ) : 'g1-2-4' ) );

		$image_id = ! empty( $params['imageId'] )
			? sanitize_text_field( $params['imageId'] )
			: ( ! empty( $params['image_id'] ) ? sanitize_text_field( $params['image_id'] ) : 'ubuntu-22.04' );

		$disk_size = isset( $params['rootVolumeSizeGigaBytes'] )
			? absint( $params['rootVolumeSizeGigaBytes'] )
			: ( isset( $params['disk_size'] ) ? absint( $params['disk_size'] ) : 40 );

		$name = ! empty( $params['name'] ) ? sanitize_text_field( $params['name'] ) : 'srv-' . wp_rand( 1000, 9999 );

		// OpenAPI v3 CreateServer payload
		$payload = array(
			'availabilityZone'        => $zone,
			'flavorId'                => $flavor_id,
			'imageId'                 => $image_id,
			'name'                    => $name,
			'rootVolumeSizeGigaBytes' => $disk_size,
			'enableIpv4'              => isset( $params['enableIpv4'] ) ? (bool) $params['enableIpv4'] : true,
		);

		if ( isset( $params['enableIpv6'] ) ) {
			$payload['enableIpv6'] = (bool) $params['enableIpv6'];
		}

		if ( ! empty( $params['sshKeyName'] ) ) {
			$payload['sshKeyName'] = sanitize_text_field( $params['sshKeyName'] );
		} elseif ( ! empty( $params['ssh_key'] ) ) {
			$payload['sshKeyName'] = sanitize_text_field( $params['ssh_key'] );
		}

		if ( ! empty( $params['initScript'] ) ) {
			$payload['initScript'] = $params['initScript'];
		}

		if ( ! empty( $params['firewallNames'] ) && is_array( $params['firewallNames'] ) ) {
			$payload['firewallNames'] = array_map( 'sanitize_text_field', $params['firewallNames'] );
		}

		// Also pass legacy fields for backward compatibility with v1 endpoints
		$payload['size_id']   = $flavor_id;
		$payload['image_id']  = $image_id;
		$payload['disk_size'] = $disk_size;
		if ( ! empty( $params['password'] ) ) {
			$payload['password'] = $params['password'];
		}

		return $this->request( 'servers', 'POST', $payload, array(), 0, $zone );
	}

	/**
	 * Get details of a specific server (OpenAPI: GET /servers/{id}).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function get_server( $server_id, $region = 'ir-thr-ba1' ) {
		return $this->request( "servers/{$server_id}", 'GET', array(), array(), 0, $region );
	}

	/**
	 * List all servers in a region (OpenAPI: GET /servers).
	 *
	 * @param string $region Availability zone / Region.
	 * @param array  $query  Optional pagination & filtering query.
	 * @return array|WP_Error
	 */
	public function get_servers( $region = 'ir-thr-ba1', $query = array() ) {
		return $this->request( 'servers', 'GET', $query, array(), 0, $region );
	}

	/**
	 * Power on an instance (OpenAPI: POST /servers/{id}/power-on).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function power_on_server( $server_id, $region = 'ir-thr-ba1' ) {
		return $this->request( "servers/{$server_id}/power-on", 'POST', array(), array(), 0, $region );
	}

	/**
	 * Power off an instance (OpenAPI: POST /servers/{id}/power-off).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function power_off_server( $server_id, $region = 'ir-thr-ba1' ) {
		return $this->request( "servers/{$server_id}/power-off", 'POST', array(), array(), 0, $region );
	}

	/**
	 * Reboot an instance (OpenAPI: POST /servers/{id}/reboot).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function reboot_server( $server_id, $region = 'ir-thr-ba1' ) {
		return $this->request( "servers/{$server_id}/reboot", 'POST', array(), array(), 0, $region );
	}

	/**
	 * Rename a server (OpenAPI: POST /servers/{id}/rename).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $new_name  New server name.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function rename_server( $server_id, $new_name, $region = 'ir-thr-ba1' ) {
		return $this->request(
			"servers/{$server_id}/rename",
			'POST',
			array( 'name' => sanitize_text_field( $new_name ) ),
			array(),
			0,
			$region
		);
	}

	/**
	 * Reset root password for a server (OpenAPI: POST /servers/{id}/reset-root-password).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $password  New root password.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function reset_root_password( $server_id, $password, $region = 'ir-thr-ba1' ) {
		return $this->request(
			"servers/{$server_id}/reset-root-password",
			'POST',
			array( 'password' => $password ),
			array(),
			0,
			$region
		);
	}

	/**
	 * Resize server hardware flavor (OpenAPI: POST /servers/{id}/resize).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $flavor_id Target Flavor ID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function resize_server( $server_id, $flavor_id, $region = 'ir-thr-ba1' ) {
		return $this->request(
			"servers/{$server_id}/resize",
			'POST',
			array( 'flavorId' => sanitize_text_field( $flavor_id ) ),
			array(),
			0,
			$region
		);
	}

	/**
	 * Resize server root disk (OpenAPI: POST /servers/{id}/resize-root-disk).
	 *
	 * @param string $server_id Server UUID.
	 * @param int    $disk_size New root disk size in GB.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function resize_root_disk( $server_id, $disk_size, $region = 'ir-thr-ba1' ) {
		return $this->request(
			"servers/{$server_id}/resize-root-disk",
			'POST',
			array( 'diskSizeGigaBytes' => absint( $disk_size ) ),
			array(),
			0,
			$region
		);
	}

	/**
	 * Rescue a server (OpenAPI: POST /servers/{id}/rescue).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function rescue_server( $server_id, $region = 'ir-thr-ba1' ) {
		return $this->request( "servers/{$server_id}/rescue", 'POST', array(), array(), 0, $region );
	}

	/**
	 * Unrescue a server (OpenAPI: POST /servers/{id}/unrescue).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function unrescue_server( $server_id, $region = 'ir-thr-ba1' ) {
		return $this->request( "servers/{$server_id}/unrescue", 'POST', array(), array(), 0, $region );
	}

	/**
	 * Delete a server instance permanently (OpenAPI: DELETE /servers/{id} or POST /servers/{id}/terminate).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function delete_server( $server_id, $region = 'ir-thr-ba1' ) {
		return $this->request( "servers/{$server_id}", 'DELETE', array(), array(), 0, $region );
	}

	/* =========================================================================
	   Volumes, Firewalls, & Networks (IaaS Core Features)
	   ========================================================================= */

	/**
	 * List all block storage volumes (OpenAPI: GET /volumes).
	 *
	 * @param string $region Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function get_volumes( $region = 'ir-thr-ba1' ) {
		return $this->request( 'volumes', 'GET', array(), array(), 0, $region );
	}

	/**
	 * Create a new storage volume (OpenAPI: POST /volumes).
	 *
	 * @param array  $params Volume parameters (name, sizeGigaBytes, availabilityZone, description).
	 * @param string $region Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function create_volume( $params, $region = 'ir-thr-ba1' ) {
		$payload = array(
			'availabilityZone' => ! empty( $params['availabilityZone'] ) ? $params['availabilityZone'] : $region,
			'name'             => sanitize_text_field( $params['name'] ),
			'sizeGigaBytes'    => absint( $params['sizeGigaBytes'] ),
		);
		if ( ! empty( $params['description'] ) ) {
			$payload['description'] = sanitize_text_field( $params['description'] );
		}
		return $this->request( 'volumes', 'POST', $payload, array(), 0, $region );
	}

	/**
	 * Attach volume to server (OpenAPI: POST /volumes/{volumeId}/attach).
	 *
	 * @param string $volume_id Volume UUID.
	 * @param string $server_id Server UUID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function attach_volume( $volume_id, $server_id, $region = 'ir-thr-ba1' ) {
		return $this->request(
			"volumes/{$volume_id}/attach",
			'POST',
			array(
				'serverId'         => $server_id,
				'availabilityZone' => $region,
			),
			array(),
			0,
			$region
		);
	}

	/**
	 * Detach volume from server (OpenAPI: POST /volumes/{volumeId}/detach).
	 *
	 * @param string $volume_id Volume UUID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function detach_volume( $volume_id, $region = 'ir-thr-ba1' ) {
		return $this->request(
			"volumes/{$volume_id}/detach",
			'POST',
			array( 'availabilityZone' => $region ),
			array(),
			0,
			$region
		);
	}

	/**
	 * Delete a volume (OpenAPI: DELETE /volumes/{volumeId}).
	 *
	 * @param string $volume_id Volume UUID.
	 * @param string $region    Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function delete_volume( $volume_id, $region = 'ir-thr-ba1' ) {
		return $this->request( "volumes/{$volume_id}", 'DELETE', array(), array(), 0, $region );
	}

	/**
	 * List firewalls (OpenAPI: GET /firewalls).
	 *
	 * @param string $region Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function get_firewalls( $region = 'ir-thr-ba1' ) {
		return $this->request( 'firewalls', 'GET', array(), array(), 0, $region );
	}

	/**
	 * List private networks (OpenAPI: GET /networks).
	 *
	 * @param string $region Availability zone / Region.
	 * @return array|WP_Error
	 */
	public function get_networks( $region = 'ir-thr-ba1' ) {
		return $this->request( 'networks', 'GET', array(), array(), 0, $region );
	}

	/* =========================================================================
	   CDN & Edge DNS API Endpoints
	   ========================================================================= */

	/**
	 * Get list of CDN domains.
	 *
	 * @param int $cache_ttl Cache lifetime in seconds.
	 * @return array|WP_Error
	 */
	public function get_cdn_domains( $cache_ttl = 300 ) {
		return $this->request( 'cdn/4.0/domains', 'GET', array(), array(), $cache_ttl );
	}

	/**
	 * Register a new CDN domain.
	 *
	 * @param string $domain Domain name (e.g. 'example.com').
	 * @return array|WP_Error
	 */
	public function create_cdn_domain( $domain ) {
		return $this->request(
			'cdn/4.0/domains/dns-service',
			'POST',
			array(
				'domain' => sanitize_text_field( $domain ),
			)
		);
	}

	/**
	 * Get DNS records for a CDN domain.
	 *
	 * @param string $domain Domain name.
	 * @return array|WP_Error
	 */
	public function get_cdn_dns_records( $domain ) {
		return $this->request( "cdn/4.0/domains/{$domain}/dns-records", 'GET' );
	}

	/**
	 * Create a DNS record for a CDN domain.
	 *
	 * @param string $domain      Domain name.
	 * @param array  $record_data DNS record parameters (type, name, value, ttl, cloud).
	 * @return array|WP_Error
	 */
	public function create_cdn_dns_record( $domain, $record_data ) {
		return $this->request( "cdn/4.0/domains/{$domain}/dns-records", 'POST', $record_data );
	}

	/**
	 * Update an existing DNS record.
	 *
	 * @param string $domain      Domain name.
	 * @param string $record_id   Record identifier.
	 * @param array  $record_data Updated record parameters.
	 * @return array|WP_Error
	 */
	public function update_cdn_dns_record( $domain, $record_id, $record_data ) {
		return $this->request( "cdn/4.0/domains/{$domain}/dns-records/{$record_id}", 'PUT', $record_data );
	}

	/**
	 * Delete a DNS record.
	 *
	 * @param string $domain    Domain name.
	 * @param string $record_id Record identifier.
	 * @return array|WP_Error
	 */
	public function delete_cdn_dns_record( $domain, $record_id ) {
		return $this->request( "cdn/4.0/domains/{$domain}/dns-records/{$record_id}", 'DELETE' );
	}

	/**
	 * Purge edge cache for domain.
	 *
	 * @param string $domain Domain name.
	 * @param string $purge  'all' or specific paths.
	 * @return array|WP_Error
	 */
	public function purge_cdn_cache( $domain, $purge = 'all' ) {
		return $this->request(
			"cdn/4.0/domains/{$domain}/caching/purge",
			'POST',
			array( 'purge' => $purge )
		);
	}

	/**
	 * Configure SSL/TLS certificate for domain.
	 *
	 * @param string $domain  Domain name.
	 * @param bool   $status  True to enable SSL.
	 * @param string $mode    'managed' (Let's Encrypt) or 'custom'.
	 * @return array|WP_Error
	 */
	public function configure_cdn_ssl( $domain, $status = true, $mode = 'managed' ) {
		return $this->request(
			"cdn/4.0/domains/{$domain}/ssl",
			'PUT',
			array(
				'ssl_status'       => (bool) $status,
				'certificate_mode' => sanitize_text_field( $mode ),
			)
		);
	}

	/* =========================================================================
	   Object Storage (S3-Compatible) API Endpoints
	   ========================================================================= */

	/**
	 * Get list of Storage buckets.
	 *
	 * @return array|WP_Error
	 */
	public function get_storage_buckets() {
		return $this->request( 'storage/v1/buckets', 'GET' );
	}

	/**
	 * Create a new storage bucket.
	 *
	 * @param string $bucket_name Bucket name (unique alphanumeric).
	 * @param string $region      Datacenter region.
	 * @return array|WP_Error
	 */
	public function create_storage_bucket( $bucket_name, $region = 'ir-thr-at1' ) {
		return $this->request(
			'storage/v1/buckets',
			'POST',
			array(
				'name'   => sanitize_text_field( $bucket_name ),
				'region' => sanitize_text_field( $region ),
			)
		);
	}

	/**
	 * Generate S3 API Access Key & Secret.
	 *
	 * @param string $description User key description.
	 * @return array|WP_Error
	 */
	public function create_storage_user_keys( $description = 'Reseller S3 User Key' ) {
		return $this->request(
			'storage/v1/user/keys',
			'POST',
			array(
				'description' => sanitize_text_field( $description ),
			)
		);
	}

	/* =========================================================================
	   Reseller Utilities & Pricing Formulas
	   ========================================================================= */

	/**
	 * Calculate customer retail price including reseller markup percentage and fixed margin.
	 *
	 * Formula: Retail = Base * (1 + MarkupPct/100) + FixedMargin
	 *
	 * @param float      $cost_price   Base ArvanCloud wholesale cost.
	 * @param float|null $markup_pct   Optional custom markup percentage.
	 * @param float|null $fixed_margin Optional fixed addition.
	 * @return float Customer price rounded to 2 decimals.
	 */
	public static function calculate_price_with_markup( $cost_price, $markup_pct = null, $fixed_margin = null ) {
		if ( null === $markup_pct ) {
			$markup_pct = (float) get_option( 'arvan_markup_percentage', 20 );
		}
		if ( null === $fixed_margin ) {
			$fixed_margin = (float) get_option( 'arvan_fixed_margin', 0 );
		}

		$multiplier = 1 + ( (float) $markup_pct / 100 );
		$retail     = ( (float) $cost_price * $multiplier ) + (float) $fixed_margin;
		return round( $retail, 2 );
	}

	/**
	 * Test API credentials against live availability zones or regions endpoint.
	 *
	 * @return array Array with success bool, message, and diagnostic data.
	 */
	public function test_connection() {
		$result = $this->get_availability_zones( 0 ); // Bypass cache
		if ( is_wp_error( $result ) ) {
			return array(
				'success' => false,
				'message' => $result->get_error_message(),
			);
		}
		return array(
			'success' => true,
			'message' => __( 'Connected successfully to ArvanCloud infrastructure.', 'arv-seller' ),
			'data'    => $result,
		);
	}

	/* =========================================================================
	   Realistic Sandbox & Mock Engine (OpenAPI v3.0.1 Compliant)
	   ========================================================================= */

	/**
	 * Generate rich mock response matching official ArvanCloud IaaS v3 OpenAPI schema.
	 *
	 * @param string      $endpoint Relative endpoint.
	 * @param string      $method   HTTP verb.
	 * @param array       $body     Request payload.
	 * @param string|null $region   Target region.
	 * @return array Mock data array.
	 */
	protected function get_mock_response( $endpoint, $method, $body = array(), $region = null ) {
		// 1. Availability Zones (OpenAPI: response.KitResponse-array_response_StandardDataCenter)
		if ( false !== strpos( $endpoint, 'availability-zones' ) || ( false !== strpos( $endpoint, 'ecc/v1/regions' ) && false === strpos( $endpoint, 'sizes' ) && false === strpos( $endpoint, 'images' ) && false === strpos( $endpoint, 'servers' ) ) ) {
			return array(
				'message' => 'Availability zones retrieved successfully',
				'data'    => array(
					array(
						'code'           => 'ir-thr-ba1',
						'name'           => 'Bamdad (Tehran)',
						'city'           => 'Tehran',
						'country'        => 'Iran',
						'region'         => 'ir-central1',
						'zone'           => 'ir-thr-ba1',
						'state'          => 'UP',
						'isVolumeBacked' => true,
						// Legacy convenience aliases
						'id'             => 'ir-thr-ba1',
						'flag'           => '🇮🇷',
						'status'         => 'active',
						'latency'        => '12ms',
					),
					array(
						'code'           => 'ir-thr-sh1',
						'name'           => 'Shahryar (Tehran)',
						'city'           => 'Tehran',
						'country'        => 'Iran',
						'region'         => 'ir-central1',
						'zone'           => 'ir-thr-sh1',
						'state'          => 'UP',
						'isVolumeBacked' => true,
						// Legacy convenience aliases
						'id'             => 'ir-thr-sh1',
						'flag'           => '🇮🇷',
						'status'         => 'active',
						'latency'        => '15ms',
					),
					array(
						'code'           => 'ir-tbz-sh1',
						'name'           => 'Shahriar (Tabriz)',
						'city'           => 'Tabriz',
						'country'        => 'Iran',
						'region'         => 'ir-northwest1',
						'zone'           => 'ir-tbz-sh1',
						'state'          => 'UP',
						'isVolumeBacked' => true,
						// Legacy convenience aliases
						'id'             => 'ir-tbz-sh1',
						'flag'           => '🇮🇷',
						'status'         => 'active',
						'latency'        => '18ms',
					),
					array(
						'code'           => 'ir-central1-a',
						'name'           => 'Forough (Central)',
						'city'           => 'Tehran',
						'country'        => 'Iran',
						'region'         => 'ir-central1',
						'zone'           => 'ir-central1-a',
						'state'          => 'UP',
						'isVolumeBacked' => true,
						// Legacy convenience aliases
						'id'             => 'ir-thr-c2',
						'flag'           => '🇮🇷',
						'status'         => 'active',
						'latency'        => '14ms',
					),
				),
			);
		}

		// 2. Flavor Price Calculation (OpenAPI: POST /flavors/{id}/calculate)
		if ( 'POST' === $method && false !== strpos( $endpoint, 'calculate' ) ) {
			$vol_size = isset( $body['volumeSize'] ) ? absint( $body['volumeSize'] ) : 50;
			return array(
				'message' => 'Price calculated successfully',
				'data'    => array(
					'pricePerHour'  => 450 + ( $vol_size * 4 ),
					'pricePerMonth' => ( 450 + ( $vol_size * 4 ) ) * 720,
					'volumeSize'    => $vol_size,
				),
			);
		}

		// 3. Hardware Flavors / Sizes (OpenAPI: Response-array_standardflavor_Plan)
		if ( false !== strpos( $endpoint, 'flavors' ) || false !== strpos( $endpoint, '/sizes' ) ) {
			// Single flavor details
			if ( preg_match( '#flavors/([a-zA-Z0-9_\-]+)#', $endpoint, $m ) && false === strpos( $endpoint, 'calculate' ) ) {
				$fid = $m[1];
				return array(
					'message' => 'Flavor retrieved successfully',
					'data'    => array(
						'id'               => $fid,
						'name'             => 'General ' . $fid,
						'cpuCores'         => 2,
						'memoryMegaBytes'  => 4096,
						'diskGigaBytes'    => 40,
						'pricePerHour'     => 450,
						'pricePerMonth'    => 324000,
						'generation'       => 'G2',
						'type'             => 'STANDARD',
						'availabilityZone' => 'ir-thr-ba1',
						// Legacy aliases
						'vcpus'            => 2,
						'ram'              => 4096,
						'disk'             => 40,
						'hourly_price'     => 450,
						'monthly_price'    => 324000,
						'category'         => 'general',
					),
				);
			}

			return array(
				'message' => 'Flavors retrieved successfully',
				'data'    => array(
					array(
						'id'               => 'g2-1-2-0',
						'name'             => 'Starter Eco G2',
						'cpuCores'         => 1,
						'memoryMegaBytes'  => 2048,
						'diskGigaBytes'    => 25,
						'pricePerHour'     => 250,
						'pricePerMonth'    => 180000,
						'generation'       => 'G2',
						'type'             => 'STANDARD',
						'availabilityZone' => 'ir-thr-ba1',
						// Legacy convenience aliases
						'vcpus'            => 1,
						'ram'              => 2048,
						'disk'             => 25,
						'hourly_price'     => 250,
						'monthly_price'    => 180000,
						'category'         => 'general',
					),
					array(
						'id'               => 'g1-1-2',
						'name'             => 'General 1C-2G',
						'cpuCores'         => 1,
						'memoryMegaBytes'  => 2048,
						'diskGigaBytes'    => 25,
						'pricePerHour'     => 250,
						'pricePerMonth'    => 180000,
						'generation'       => 'G1',
						'type'             => 'STANDARD',
						'availabilityZone' => 'ir-thr-ba1',
						'vcpus'            => 1,
						'ram'              => 2048,
						'disk'             => 25,
						'hourly_price'     => 250,
						'monthly_price'    => 180000,
						'category'         => 'general',
					),
					array(
						'id'               => 'g1-2-4',
						'name'             => 'General 2C-4G',
						'cpuCores'         => 2,
						'memoryMegaBytes'  => 4096,
						'diskGigaBytes'    => 40,
						'pricePerHour'     => 450,
						'pricePerMonth'    => 324000,
						'generation'       => 'G2',
						'type'             => 'STANDARD',
						'availabilityZone' => 'ir-thr-ba1',
						'vcpus'            => 2,
						'ram'              => 4096,
						'disk'             => 40,
						'hourly_price'     => 450,
						'monthly_price'    => 324000,
						'category'         => 'general',
					),
					array(
						'id'               => 'g1-4-8',
						'name'             => 'General 4C-8G',
						'cpuCores'         => 4,
						'memoryMegaBytes'  => 8192,
						'diskGigaBytes'    => 60,
						'pricePerHour'     => 890,
						'pricePerMonth'    => 640800,
						'generation'       => 'G2',
						'type'             => 'STANDARD',
						'availabilityZone' => 'ir-thr-ba1',
						'vcpus'            => 4,
						'ram'              => 8192,
						'disk'             => 60,
						'hourly_price'     => 890,
						'monthly_price'    => 640800,
						'category'         => 'general',
					),
					array(
						'id'               => 'g1-8-16',
						'name'             => 'General 8C-16G',
						'cpuCores'         => 8,
						'memoryMegaBytes'  => 16384,
						'diskGigaBytes'    => 100,
						'pricePerHour'     => 1750,
						'pricePerMonth'    => 1260000,
						'generation'       => 'G2',
						'type'             => 'STANDARD',
						'availabilityZone' => 'ir-thr-ba1',
						'vcpus'            => 8,
						'ram'              => 16384,
						'disk'             => 100,
						'hourly_price'     => 1750,
						'monthly_price'    => 1260000,
						'category'         => 'general',
					),
					array(
						'id'               => 'c1-4-4',
						'name'             => 'Compute 4C-4G',
						'cpuCores'         => 4,
						'memoryMegaBytes'  => 4096,
						'diskGigaBytes'    => 40,
						'pricePerHour'     => 690,
						'pricePerMonth'    => 496800,
						'generation'       => 'C1',
						'type'             => 'COMPUTE',
						'availabilityZone' => 'ir-thr-ba1',
						'vcpus'            => 4,
						'ram'              => 4096,
						'disk'             => 40,
						'hourly_price'     => 690,
						'monthly_price'    => 496800,
						'category'         => 'compute',
					),
					array(
						'id'               => 'm1-2-8',
						'name'             => 'Memory 2C-8G',
						'cpuCores'         => 2,
						'memoryMegaBytes'  => 8192,
						'diskGigaBytes'    => 50,
						'pricePerHour'     => 650,
						'pricePerMonth'    => 468000,
						'generation'       => 'M1',
						'type'             => 'MEMORY',
						'availabilityZone' => 'ir-thr-ba1',
						'vcpus'            => 2,
						'ram'              => 8192,
						'disk'             => 50,
						'hourly_price'     => 650,
						'monthly_price'    => 468000,
						'category'         => 'memory',
					),
				),
				'meta'    => array(
					'pagination' => array(
						'current'    => 1,
						'perPage'    => 20,
						'totalItems' => 7,
					),
				),
			);
		}

		// 4. OS & Application Images (OpenAPI: Response-array_response_PublicAPIListImagesData)
		if ( false !== strpos( $endpoint, 'images' ) ) {
			return array(
				'message' => 'Images retrieved successfully',
				'data'    => array(
					array(
						'id'               => 'ubuntu-22.04',
						'name'             => 'Ubuntu 22.04 LTS (Jammy Jellyfish)',
						'osType'           => 'LINUX',
						'osVersion'        => '22.04',
						'minDiskGigaBytes' => 20,
						'minRamMegaBytes'  => 1024,
						'status'           => 'ACTIVE',
						'type'             => 'PUBLIC',
						'availabilityZone' => 'ir-thr-ba1',
						// Legacy convenience aliases
						'os_family'        => 'ubuntu',
						'version'          => '22.04',
						'min_disk'         => 20,
					),
					array(
						'id'               => 'ubuntu-24.04',
						'name'             => 'Ubuntu 24.04 LTS (Noble Numbat)',
						'osType'           => 'LINUX',
						'osVersion'        => '24.04',
						'minDiskGigaBytes' => 20,
						'minRamMegaBytes'  => 1024,
						'status'           => 'ACTIVE',
						'type'             => 'PUBLIC',
						'availabilityZone' => 'ir-thr-ba1',
						'os_family'        => 'ubuntu',
						'version'          => '24.04',
						'min_disk'         => 20,
					),
					array(
						'id'               => 'debian-12',
						'name'             => 'Debian 12 (Bookworm)',
						'osType'           => 'LINUX',
						'osVersion'        => '12',
						'minDiskGigaBytes' => 20,
						'minRamMegaBytes'  => 1024,
						'status'           => 'ACTIVE',
						'type'             => 'PUBLIC',
						'availabilityZone' => 'ir-thr-ba1',
						'os_family'        => 'debian',
						'version'          => '12',
						'min_disk'         => 20,
					),
					array(
						'id'               => 'almalinux-9',
						'name'             => 'AlmaLinux 9 Enterprise',
						'osType'           => 'LINUX',
						'osVersion'        => '9',
						'minDiskGigaBytes' => 20,
						'minRamMegaBytes'  => 1024,
						'status'           => 'ACTIVE',
						'type'             => 'PUBLIC',
						'availabilityZone' => 'ir-thr-ba1',
						'os_family'        => 'almalinux',
						'version'          => '9',
						'min_disk'         => 20,
					),
					array(
						'id'               => 'windows-server-2022',
						'name'             => 'Windows Server 2022 Standard',
						'osType'           => 'WINDOWS',
						'osVersion'        => '2022',
						'minDiskGigaBytes' => 40,
						'minRamMegaBytes'  => 2048,
						'status'           => 'ACTIVE',
						'type'             => 'PUBLIC',
						'availabilityZone' => 'ir-thr-ba1',
						'os_family'        => 'windows',
						'version'          => '2022',
						'min_disk'         => 40,
					),
				),
				'meta'    => array(
					'pagination' => array(
						'current'    => 1,
						'perPage'    => 20,
						'totalItems' => 5,
					),
				),
			);
		}

		// 5. Server Provisioning POST (OpenAPI: Response-Detail)
		if ( 'POST' === $method && false !== strpos( $endpoint, 'servers' ) && false === strpos( $endpoint, 'power' ) && false === strpos( $endpoint, 'reboot' ) && false === strpos( $endpoint, 'rename' ) && false === strpos( $endpoint, 'reset' ) && false === strpos( $endpoint, 'resize' ) && false === strpos( $endpoint, 'rescue' ) ) {
			$random_uuid = wp_generate_uuid4();
			$random_ip   = '185.143.' . wp_rand( 200, 240 ) . '.' . wp_rand( 10, 250 );
			$server_name = isset( $body['name'] ) ? $body['name'] : 'cloud-instance';
			$target_zone = isset( $body['availabilityZone'] ) ? $body['availabilityZone'] : ( isset( $body['region'] ) ? $body['region'] : 'ir-thr-ba1' );
			$flavor_id   = isset( $body['flavorId'] ) ? $body['flavorId'] : ( isset( $body['size_id'] ) ? $body['size_id'] : 'g1-2-4' );
			$disk_size   = isset( $body['rootVolumeSizeGigaBytes'] ) ? absint( $body['rootVolumeSizeGigaBytes'] ) : ( isset( $body['disk_size'] ) ? absint( $body['disk_size'] ) : 40 );

			return array(
				'message' => 'Server created successfully',
				'data'    => array(
					'id'               => 'srv-' . $random_uuid,
					'name'             => $server_name,
					'state'            => 'ACTIVE',
					'taskState'        => null,
					'availabilityZone' => $target_zone,
					'flavor'           => array(
						'id'                => $flavor_id,
						'name'              => 'General 2C-4G',
						'cpuCores'          => 2,
						'ramMegaBytes'      => 4096,
						'rootDiskGigaBytes' => $disk_size,
					),
					'image'            => array(
						'id'      => isset( $body['imageId'] ) ? $body['imageId'] : ( isset( $body['image_id'] ) ? $body['image_id'] : 'ubuntu-22.04' ),
						'name'    => 'Ubuntu 22.04 LTS',
						'os'      => 'Linux',
						'version' => '22.04',
					),
					'ipAddresses'      => array(
						array(
							'ipAddress'   => $random_ip,
							'isPublic'    => true,
							'version'     => '4',
							'networkName' => 'public',
							'macAddress'  => 'fa:16:3e:' . wp_rand( 10, 99 ) . ':' . wp_rand( 10, 99 ) . ':' . wp_rand( 10, 99 ),
						),
					),
					'createDate'       => current_time( 'c' ),
					'backupEnabled'    => false,
					// Legacy convenience aliases
					'status'           => 'active',
					'region'           => $target_zone,
					'ip_address'       => $random_ip,
					'size'             => array(
						'id'    => $flavor_id,
						'vcpus' => 2,
						'ram'   => 4096,
						'disk'  => $disk_size,
					),
					'created_at'       => current_time( 'c' ),
				),
			);
		}

		// 6. Server Detail GET (OpenAPI: Response-Detail)
		if ( 'GET' === $method && preg_match( '#servers/([a-zA-Z0-9_\-]+)#', $endpoint, $matches ) ) {
			$srv_id = $matches[1];
			return array(
				'message' => 'Server details retrieved',
				'data'    => array(
					'id'               => $srv_id,
					'name'             => 'instance-' . substr( $srv_id, 0, 8 ),
					'state'            => 'ACTIVE',
					'taskState'        => null,
					'availabilityZone' => 'ir-thr-ba1',
					'flavor'           => array(
						'id'                => 'g1-2-4',
						'name'              => 'General 2C-4G',
						'cpuCores'          => 2,
						'ramMegaBytes'      => 4096,
						'rootDiskGigaBytes' => 40,
					),
					'ipAddresses'      => array(
						array(
							'ipAddress' => '185.143.232.44',
							'isPublic'  => true,
							'version'   => '4',
						),
					),
					'status'           => 'active',
					'ip_address'       => '185.143.232.44',
				),
			);
		}

		// 7. Server Power & Lifecycle Actions
		if ( false !== strpos( $endpoint, 'power-on' ) ) {
			return array( 'success' => true, 'status' => 'active', 'state' => 'ACTIVE', 'message' => 'Instance powered on.' );
		}
		if ( false !== strpos( $endpoint, 'power-off' ) ) {
			return array( 'success' => true, 'status' => 'stopped', 'state' => 'SHUTOFF', 'message' => 'Instance powered off.' );
		}
		if ( false !== strpos( $endpoint, 'reboot' ) ) {
			return array( 'success' => true, 'status' => 'active', 'state' => 'ACTIVE', 'message' => 'Instance reboot command dispatched.' );
		}
		if ( false !== strpos( $endpoint, 'rename' ) ) {
			return array( 'success' => true, 'message' => 'Instance renamed successfully.' );
		}
		if ( false !== strpos( $endpoint, 'reset-root-password' ) ) {
			return array( 'success' => true, 'message' => 'Root password reset successfully.' );
		}
		if ( false !== strpos( $endpoint, 'resize' ) ) {
			return array( 'success' => true, 'message' => 'Instance resize request accepted.' );
		}
		if ( false !== strpos( $endpoint, 'rescue' ) ) {
			return array( 'success' => true, 'message' => 'Instance rescue mode operation completed.' );
		}
		if ( ( 'DELETE' === $method && false !== strpos( $endpoint, 'servers/' ) ) || false !== strpos( $endpoint, 'terminate' ) ) {
			return array( 'success' => true, 'message' => 'Instance permanently deleted.' );
		}

		// 8. Volumes (OpenAPI: Response-array_Volume)
		if ( false !== strpos( $endpoint, 'volumes' ) ) {
			if ( 'POST' === $method ) {
				return array(
					'message' => 'Volume created successfully',
					'data'    => array(
						'id'               => 'vol-' . wp_generate_uuid4(),
						'name'             => isset( $body['name'] ) ? $body['name'] : 'data-volume',
						'sizeGigaBytes'    => isset( $body['sizeGigaBytes'] ) ? absint( $body['sizeGigaBytes'] ) : 50,
						'status'           => 'available',
						'availabilityZone' => 'ir-thr-ba1',
					),
				);
			}
			return array(
				'message' => 'Volumes retrieved',
				'data'    => array(
					array(
						'id'               => 'vol-101',
						'name'             => 'attached-ssd',
						'sizeGigaBytes'    => 100,
						'status'           => 'in-use',
						'availabilityZone' => 'ir-thr-ba1',
					),
				),
			);
		}

		// 9. Firewalls (OpenAPI: Response-array_response_PublicAPIListData)
		if ( false !== strpos( $endpoint, 'firewalls' ) ) {
			return array(
				'message' => 'Firewalls retrieved',
				'data'    => array(
					array(
						'id'               => 'fw-101',
						'name'             => 'default-web-firewall',
						'availabilityZone' => 'ir-thr-ba1',
						'rulesCount'       => 3,
					),
				),
			);
		}

		// 10. Networks (OpenAPI: Response-array_standardnetwork_NetworkResponse)
		if ( false !== strpos( $endpoint, 'networks' ) ) {
			return array(
				'message' => 'Networks retrieved',
				'data'    => array(
					array(
						'id'               => 'net-101',
						'name'             => 'default-private-net',
						'cidr'             => '192.168.1.0/24',
						'availabilityZone' => 'ir-thr-ba1',
					),
				),
			);
		}

		// 11. CDN Domains
		if ( false !== strpos( $endpoint, 'cdn/4.0/domains' ) ) {
			if ( 'POST' === $method && false !== strpos( $endpoint, 'dns-service' ) ) {
				return array(
					'data' => array(
						'id'      => 'dom-' . wp_rand( 10000000, 99999999 ),
						'domain'  => isset( $body['domain'] ) ? $body['domain'] : 'example.ir',
						'status'  => 'active',
						'ns_keys' => array( 'd.ns.arvancdn.ir', 'e.ns.arvancdn.ir' ),
					),
				);
			}
			if ( false !== strpos( $endpoint, 'dns-records' ) ) {
				if ( 'POST' === $method ) {
					return array(
						'data' => array(
							'id'    => 'rec-' . wp_rand( 10000, 99999 ),
							'type'  => isset( $body['type'] ) ? $body['type'] : 'A',
							'name'  => isset( $body['name'] ) ? $body['name'] : '@',
							'value' => isset( $body['value'] ) ? $body['value'] : array( 'ip' => '185.143.232.45' ),
							'cloud' => isset( $body['cloud'] ) ? (bool) $body['cloud'] : true,
						),
					);
				}
				return array(
					'data' => array(
						array(
							'id'    => 'rec-101',
							'type'  => 'A',
							'name'  => '@',
							'value' => array( 'ip' => '185.143.232.45' ),
							'cloud' => true,
							'ttl'   => 120,
						),
						array(
							'id'    => 'rec-102',
							'type'  => 'CNAME',
							'name'  => 'www',
							'value' => array( 'host' => '@' ),
							'cloud' => true,
							'ttl'   => 120,
						),
					),
				);
			}
			return array(
				'data' => array(
					array(
						'id'         => 'dom-12345678',
						'domain'     => 'myshop.ir',
						'status'     => 'active',
						'plan_level' => 1,
						'ns_keys'    => array( 'ns1.arvancdn.ir', 'ns2.arvancdn.ir' ),
					),
				),
			);
		}

		// 12. Storage Buckets
		if ( false !== strpos( $endpoint, 'storage/v1' ) ) {
			if ( false !== strpos( $endpoint, 'user/keys' ) ) {
				return array(
					'data' => array(
						'access_key'  => 'ARVAN_AKIA_' . strtoupper( substr( md5( wp_rand() ), 0, 16 ) ),
						'secret_key'  => 'ARVAN_SEC_' . strtoupper( md5( wp_rand() . time() ) ),
						'description' => isset( $body['description'] ) ? $body['description'] : 'S3 Client Key',
						'created_at'  => current_time( 'c' ),
					),
				);
			}
			if ( 'POST' === $method && false !== strpos( $endpoint, 'buckets' ) ) {
				return array(
					'data' => array(
						'name'          => isset( $body['name'] ) ? $body['name'] : 'my-app-storage',
						'region'        => 'ir-thr-at1',
						'created_at'    => current_time( 'c' ),
						'objects_count' => 0,
						'size_bytes'    => 0,
					),
				);
			}
			return array(
				'data' => array(
					array(
						'name'          => 'media-assets',
						'region'        => 'ir-thr-at1',
						'created_at'    => current_time( 'c' ),
						'objects_count' => 125,
						'size_bytes'    => 536870912,
					),
				),
			);
		}

		return array( 'success' => true, 'data' => array() );
	}
}
