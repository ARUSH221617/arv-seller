<?php
/**
 * Core ArvanCloud REST API Client.
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
 * centralized error handling, and dedicated service methods for IaaS/ECC,
 * CDN, and Object Storage.
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

		if ( ! $this->is_configured() ) {
			return new WP_Error(
				'arvan_api_unconfigured',
				__( 'ArvanCloud API key is not configured. Please set your API key in admin settings.', 'arv-seller' )
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

		$default_headers = array(
			'Authorization' => ( 0 === strpos( $this->api_key, 'Apikey ' ) || 0 === strpos( $this->api_key, 'Bearer ' ) )
				? $this->api_key
				: 'Apikey ' . $this->api_key,
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
	   CDN API Endpoints
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

	/* =========================================================================
	   Object Storage API Endpoints
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
	 * @return array|WP_Error
	 */
	public function create_storage_bucket( $bucket_name ) {
		return $this->request(
			'storage/v1/buckets',
			'POST',
			array(
				'name' => sanitize_text_field( $bucket_name ),
			)
		);
	}

	/* =========================================================================
	   Reseller Utilities
	   ========================================================================= */

	/**
	 * Calculate customer retail price including reseller markup percentage.
	 *
	 * @param float      $cost_price Base ArvanCloud wholesale cost.
	 * @param float|null $markup_pct Optional custom markup percentage. Default from settings.
	 * @return float Customer price rounded to 2 decimals.
	 */
	public static function calculate_price_with_markup( $cost_price, $markup_pct = null ) {
		if ( null === $markup_pct ) {
			$markup_pct = (float) get_option( 'arvan_markup_percentage', 15 );
		}
		$multiplier = 1 + ( $markup_pct / 100 );
		return round( (float) $cost_price * $multiplier, 2 );
	}
}
