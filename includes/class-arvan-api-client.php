<?php
/**
 * Core ArvanCloud REST API Client & Sandbox Mock Engine.
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
 * Wraps wp_remote_request() with API key authentication, transient caching,
 * centralized error handling, mock sandbox fallback, and dedicated service
 * methods for IaaS/ECC, CDN, and Object Storage.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */
class Arvan_API_Client {

	/**
	 * Default base URL for ArvanCloud REST APIs.
	 */
	const BASE_URL = 'https://napi.arvancloud.ir';

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
		$this->sandbox_mode = (bool) get_option( 'arvan_sandbox_mode', 1 );
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
	 * Central request dispatcher utilizing wp_remote_request().
	 *
	 * @param string $endpoint   Relative endpoint (e.g. '/ecc/v1/regions') or full URL.
	 * @param string $method     HTTP verb: GET, POST, PUT, PATCH, DELETE.
	 * @param array  $body       Optional request payload array.
	 * @param array  $headers    Optional additional headers.
	 * @param int    $cache_ttl  Cache TTL in seconds for GET requests. 0 to disable cache.
	 * @return array|WP_Error    Parsed JSON response data array or WP_Error on failure.
	 */
	public function request( $endpoint, $method = 'GET', $body = array(), $headers = array(), $cache_ttl = 0 ) {
		$method = strtoupper( $method );

		// If unconfigured and sandbox is enabled, generate realistic mock responses
		if ( ! $this->is_configured() ) {
			if ( $this->sandbox_mode ) {
				return $this->get_mock_response( $endpoint, $method, $body );
			}
			return new WP_Error(
				'arvan_api_unconfigured',
				__( 'ArvanCloud API key is not configured. Please configure your API key in WP Admin > Arvan Reseller > Settings.', 'arv-seller' )
			);
		}

		$url = ( 0 === strpos( $endpoint, 'http' ) ) ? $endpoint : self::BASE_URL . '/' . ltrim( $endpoint, '/' );

		// Check transient cache for GET requests
		$cache_key = '';
		if ( 'GET' === $method && $cache_ttl > 0 ) {
			$cache_key = 'arvan_api_' . md5( $url . serialize( $body ) );
			$cached    = get_transient( $cache_key );
			if ( false !== $cached ) {
				return $cached;
			}
		}

		$auth_header = ( 0 === strpos( $this->api_key, 'Apikey ' ) || 0 === strpos( $this->api_key, 'Bearer ' ) )
			? $this->api_key
			: 'Apikey ' . $this->api_key;

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
				return $this->get_mock_response( $endpoint, $method, $body );
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

		// Handle error status codes
		if ( $status_code < 200 || $status_code >= 300 ) {
			if ( $this->sandbox_mode ) {
				return $this->get_mock_response( $endpoint, $method, $body );
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
	   IaaS / ECC (Cloud Server) API Endpoints
	   ========================================================================= */

	/**
	 * Get list of available ECC regions.
	 *
	 * @param int $cache_ttl Cache lifetime (default 1 hour).
	 * @return array|WP_Error
	 */
	public function get_regions( $cache_ttl = 3600 ) {
		return $this->request( 'ecc/v1/regions', 'GET', array(), array(), $cache_ttl );
	}

	/**
	 * Get list of available server flavors/sizes for a region.
	 *
	 * @param string $region    Region identifier (e.g. 'ir-thr-c2').
	 * @param int    $cache_ttl Cache lifetime (default 1 hour).
	 * @return array|WP_Error
	 */
	public function get_flavors( $region = 'ir-thr-c2', $cache_ttl = 3600 ) {
		return $this->request( "ecc/v1/regions/{$region}/sizes", 'GET', array(), array(), $cache_ttl );
	}

	/**
	 * Get list of operating system images.
	 *
	 * @param string $region    Region identifier.
	 * @param int    $cache_ttl Cache lifetime (default 1 hour).
	 * @return array|WP_Error
	 */
	public function get_images( $region = 'ir-thr-c2', $cache_ttl = 3600 ) {
		return $this->request( "ecc/v1/regions/{$region}/images", 'GET', array(), array(), $cache_ttl );
	}

	/**
	 * Create a new Cloud Server instance.
	 *
	 * @param array $params {
	 *     @type string $region     Target region (e.g. 'ir-thr-c2').
	 *     @type string $name       Instance name/hostname.
	 *     @type string $size_id    Flavor / size UUID or ID.
	 *     @type string $image_id   OS Image UUID or ID.
	 *     @type int    $disk_size  Disk size in GB.
	 *     @type string $ssh_key    Optional SSH public key.
	 *     @type string $password   Optional root/admin password.
	 * }
	 * @return array|WP_Error
	 */
	public function create_server( $params ) {
		$region = isset( $params['region'] ) ? $params['region'] : get_option( 'arvan_default_region', 'ir-thr-c2' );

		$payload = array(
			'name'       => sanitize_text_field( $params['name'] ),
			'size_id'    => sanitize_text_field( $params['size_id'] ),
			'image_id'   => sanitize_text_field( $params['image_id'] ),
			'disk_size'  => isset( $params['disk_size'] ) ? absint( $params['disk_size'] ) : 25,
		);

		if ( ! empty( $params['ssh_key'] ) ) {
			$payload['ssh_key'] = sanitize_textarea_field( $params['ssh_key'] );
		}

		if ( ! empty( $params['password'] ) ) {
			$payload['password'] = $params['password'];
		}

		return $this->request( "ecc/v1/regions/{$region}/servers", 'POST', $payload );
	}

	/**
	 * Get server details.
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Region identifier.
	 * @return array|WP_Error
	 */
	public function get_server( $server_id, $region = 'ir-thr-c2' ) {
		return $this->request( "ecc/v1/regions/{$region}/servers/{$server_id}", 'GET' );
	}

	/**
	 * List servers in a region.
	 *
	 * @param string $region Region identifier.
	 * @return array|WP_Error
	 */
	public function get_servers( $region = 'ir-thr-c2' ) {
		return $this->request( "ecc/v1/regions/{$region}/servers", 'GET' );
	}

	/**
	 * Power on an instance.
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Region identifier.
	 * @return array|WP_Error
	 */
	public function power_on_server( $server_id, $region = 'ir-thr-c2' ) {
		return $this->request( "ecc/v1/regions/{$region}/servers/{$server_id}/power-on", 'POST' );
	}

	/**
	 * Power off an instance (used during automatic suspension on zero wallet balance).
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Region identifier.
	 * @return array|WP_Error
	 */
	public function power_off_server( $server_id, $region = 'ir-thr-c2' ) {
		return $this->request( "ecc/v1/regions/{$region}/servers/{$server_id}/power-off", 'POST' );
	}

	/**
	 * Reboot an instance.
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Region identifier.
	 * @return array|WP_Error
	 */
	public function reboot_server( $server_id, $region = 'ir-thr-c2' ) {
		return $this->request( "ecc/v1/regions/{$region}/servers/{$server_id}/reboot", 'POST' );
	}

	/**
	 * Delete a server instance permanently.
	 *
	 * @param string $server_id Server UUID.
	 * @param string $region    Region identifier.
	 * @return array|WP_Error
	 */
	public function delete_server( $server_id, $region = 'ir-thr-c2' ) {
		return $this->request( "ecc/v1/regions/{$region}/servers/{$server_id}", 'DELETE' );
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
	 * Test API credentials against /ecc/v1/regions.
	 *
	 * @return array Array with success bool and message.
	 */
	public function test_connection() {
		$result = $this->get_regions( 0 ); // Bypass cache
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
	   Realistic Sandbox & Mock Engine (For offline testing & zero-setup demos)
	   ========================================================================= */

	/**
	 * Generate rich mock response matching official ArvanCloud API responses.
	 *
	 * @param string $endpoint Relative endpoint.
	 * @param string $method   HTTP verb.
	 * @param array  $body     Request payload.
	 * @return array Mock data array.
	 */
	protected function get_mock_response( $endpoint, $method, $body = array() ) {
		// 1. Regions
		if ( false !== strpos( $endpoint, 'ecc/v1/regions' ) && false === strpos( $endpoint, 'sizes' ) && false === strpos( $endpoint, 'images' ) && false === strpos( $endpoint, 'servers' ) ) {
			return array(
				'data' => array(
					array(
						'id'      => 'ir-thr-c2',
						'name'    => 'Tehran - Forough',
						'city'    => 'Tehran',
						'country' => 'Iran',
						'flag'    => '🇮🇷',
						'status'  => 'active',
					),
					array(
						'id'      => 'ir-thr-sh1',
						'name'    => 'Tehran - Shahryar',
						'city'    => 'Tehran',
						'country' => 'Iran',
						'flag'    => '🇮🇷',
						'status'  => 'active',
					),
					array(
						'id'      => 'ir-tbz-dc1',
						'name'    => 'Tabriz - Northwest',
						'city'    => 'Tabriz',
						'country' => 'Iran',
						'flag'    => '🇮🇷',
						'status'  => 'active',
					),
				),
			);
		}

		// 2. Hardware Flavors / Sizes
		if ( false !== strpos( $endpoint, '/sizes' ) ) {
			return array(
				'data' => array(
					array(
						'id'            => 'g1-1-2',
						'name'          => 'General 1C-2G',
						'vcpus'         => 1,
						'ram'           => 2048,
						'disk'          => 25,
						'hourly_price'  => 250,
						'monthly_price' => 180000,
						'category'      => 'general',
					),
					array(
						'id'            => 'g1-2-4',
						'name'          => 'General 2C-4G',
						'vcpus'         => 2,
						'ram'           => 4096,
						'disk'          => 40,
						'hourly_price'  => 450,
						'monthly_price' => 324000,
						'category'      => 'general',
					),
					array(
						'id'            => 'g1-4-8',
						'name'          => 'General 4C-8G',
						'vcpus'         => 4,
						'ram'           => 8192,
						'disk'          => 60,
						'hourly_price'  => 890,
						'monthly_price' => 640800,
						'category'      => 'general',
					),
					array(
						'id'            => 'g1-8-16',
						'name'          => 'General 8C-16G',
						'vcpus'         => 8,
						'ram'           => 16384,
						'disk'          => 100,
						'hourly_price'  => 1750,
						'monthly_price' => 1260000,
						'category'      => 'general',
					),
					array(
						'id'            => 'c1-4-4',
						'name'          => 'Compute 4C-4G',
						'vcpus'         => 4,
						'ram'           => 4096,
						'disk'          => 40,
						'hourly_price'  => 690,
						'monthly_price' => 496800,
						'category'      => 'compute',
					),
					array(
						'id'            => 'm1-2-8',
						'name'          => 'Memory 2C-8G',
						'vcpus'         => 2,
						'ram'           => 8192,
						'disk'          => 50,
						'hourly_price'  => 650,
						'monthly_price' => 468000,
						'category'      => 'memory',
					),
				),
			);
		}

		// 3. OS Images
		if ( false !== strpos( $endpoint, '/images' ) ) {
			return array(
				'data' => array(
					array(
						'id'        => 'ubuntu-22.04',
						'name'      => 'Ubuntu 22.04 LTS (Jammy Jellyfish)',
						'os_family' => 'ubuntu',
						'version'   => '22.04',
						'min_disk'  => 20,
					),
					array(
						'id'        => 'ubuntu-24.04',
						'name'      => 'Ubuntu 24.04 LTS (Noble Numbat)',
						'os_family' => 'ubuntu',
						'version'   => '24.04',
						'min_disk'  => 20,
					),
					array(
						'id'        => 'debian-12',
						'name'      => 'Debian 12 (Bookworm)',
						'os_family' => 'debian',
						'version'   => '12',
						'min_disk'  => 20,
					),
					array(
						'id'        => 'almalinux-9',
						'name'      => 'AlmaLinux 9 Enterprise',
						'os_family' => 'almalinux',
						'version'   => '9',
						'min_disk'  => 20,
					),
					array(
						'id'        => 'windows-server-2022',
						'name'      => 'Windows Server 2022 Standard',
						'os_family' => 'windows',
						'version'   => '2022',
						'min_disk'  => 40,
					),
				),
			);
		}

		// 4. Server Provisioning POST
		if ( 'POST' === $method && false !== strpos( $endpoint, '/servers' ) && false === strpos( $endpoint, 'power' ) && false === strpos( $endpoint, 'reboot' ) ) {
			$random_uuid = wp_generate_uuid4();
			$random_ip   = '185.143.' . wp_rand( 200, 240 ) . '.' . wp_rand( 10, 250 );
			return array(
				'data' => array(
					'id'         => 'srv-' . $random_uuid,
					'name'       => isset( $body['name'] ) ? $body['name'] : 'cloud-instance',
					'status'     => 'active',
					'region'     => 'ir-thr-c2',
					'ip_address' => $random_ip,
					'size'       => array(
						'id'    => isset( $body['size_id'] ) ? $body['size_id'] : 'g1-2-4',
						'vcpus' => 2,
						'ram'   => 4096,
						'disk'  => isset( $body['disk_size'] ) ? $body['disk_size'] : 40,
					),
					'created_at' => current_time( 'c' ),
				),
			);
		}

		// 5. Server Power Actions
		if ( false !== strpos( $endpoint, 'power-on' ) ) {
			return array( 'success' => true, 'status' => 'active', 'message' => 'Instance powered on.' );
		}
		if ( false !== strpos( $endpoint, 'power-off' ) ) {
			return array( 'success' => true, 'status' => 'stopped', 'message' => 'Instance powered off.' );
		}
		if ( false !== strpos( $endpoint, 'reboot' ) ) {
			return array( 'success' => true, 'status' => 'active', 'message' => 'Instance reboot command dispatched.' );
		}
		if ( 'DELETE' === $method && false !== strpos( $endpoint, '/servers/' ) ) {
			return array( 'success' => true, 'message' => 'Instance permanently deleted.' );
		}

		// 6. CDN Domains
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
				// GET DNS records
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

		// 7. Storage Buckets
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
