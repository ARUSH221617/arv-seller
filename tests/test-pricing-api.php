<?php
/**
 * Standalone Test Suite for ArvanCloud Reseller Plugin (Pricing & OpenAPI v3 IaaS Mock Engine).
 */

if ( ! defined( 'WPINC' ) ) {
	define( 'WPINC', true );
}
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __DIR__ ) . '/' );
}

$mock_options = array(
	'arvan_markup_percentage' => 20,
	'arvan_fixed_margin'      => 0,
	'arvan_currency'          => 'IRT',
	'arvan_default_region'    => 'ir-thr-ba1',
	'arvan_sandbox_mode'      => 1,
	'arvan_api_key'           => '',
);

function get_option( $name, $default = false ) {
	global $mock_options;
	return isset( $mock_options[ $name ] ) ? $mock_options[ $name ] : $default;
}

function update_option( $name, $val ) {
	global $mock_options;
	$mock_options[ $name ] = $val;
	return true;
}

function add_option( $name, $val ) {
	return update_option( $name, $val );
}

function sanitize_text_field( $str ) {
	return trim( strip_tags( $str ) );
}

function sanitize_textarea_field( $str ) {
	return trim( strip_tags( $str ) );
}

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/i', '', $key );
}

function absint( $num ) {
	return abs( intval( $num ) );
}

function current_time( $type ) {
	return date( 'Y-m-d H:i:s' );
}

function wp_generate_uuid4() {
	return sprintf(
		'%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
		mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
		mt_rand( 0, 0xffff ),
		mt_rand( 0, 0x0fff ) | 0x4000,
		mt_rand( 0, 0x3fff ) | 0x8000,
		mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
	);
}

function wp_json_encode( $data ) {
	return json_encode( $data );
}

function wp_rand( $min = 0, $max = 1000000 ) {
	return rand( $min, $max );
}

function apply_filters( $tag, $value ) {
	return $value;
}

function do_action( $tag, ...$args ) {}

function __( $text, $domain = 'default' ) {
	return $text;
}

function esc_html__( $text, $domain = 'default' ) {
	return $text;
}

class WP_Error {
	protected $code;
	protected $message;
	protected $data;
	public function __construct( $code, $message = '', $data = array() ) {
		$this->code = $code;
		$this->message = $message;
		$this->data = $data;
	}
	public function get_error_message() {
		return $this->message;
	}
	public function get_error_code() {
		return $this->code;
	}
}

function is_wp_error( $thing ) {
	return ( $thing instanceof WP_Error );
}

function get_transient( $key ) { return false; }
function set_transient( $key, $val, $ttl ) { return true; }

require_once dirname( __DIR__ ) . '/includes/class-arvan-api-client.php';

echo "=========================================================\n";
echo "ARVANCLOUD RESELLER PLUGIN — TEST SUITE EXECUTION\n";
echo "=========================================================\n\n";

$passed = 0;
$failed = 0;

function assert_test( $condition, $title ) {
	global $passed, $failed;
	if ( $condition ) {
		echo " [PASS] " . $title . "\n";
		$passed++;
	} else {
		echo " [FAIL] " . $title . "\n";
		$failed++;
	}
}

// 1. Dynamic Pricing Calculations
echo "--- 1. Pricing & Markup Engine ---\n";
$p1 = Arvan_API_Client::calculate_price_with_markup( 450, 20, 0 );
assert_test( 540.0 === $p1, "Base 450 IRT + 20% Markup = 540 IRT" );

$p2 = Arvan_API_Client::calculate_price_with_markup( 1000, 15, 50 );
assert_test( 1200.0 === $p2, "Base 1000 IRT + 15% Markup + 50 Fixed = 1200 IRT" );

// 2. Arvan_API_Client OpenAPI v3 IaaS Endpoints & Sandbox Mock Tests
echo "\n--- 2. Arvan_API_Client OpenAPI v3 IaaS & Mock Engine ---\n";
$client = new Arvan_API_Client();

$conn = $client->test_connection();
assert_test( $conn['success'] === true, "test_connection() returns success in sandbox" );

// Availability Zones (OpenAPI: GET /availability-zones)
$zones = $client->get_availability_zones();
assert_test( is_array( $zones ) && ! empty( $zones['data'] ) && count( $zones['data'] ) >= 3, "get_availability_zones() returns at least 3 availability zones" );
assert_test( isset( $zones['data'][0]['code'] ) && isset( $zones['data'][0]['isVolumeBacked'] ), "get_availability_zones() contains OpenAPI standard fields (code, isVolumeBacked)" );

// Backward-compatible get_regions()
$regions = $client->get_regions();
assert_test( is_array( $regions ) && ! empty( $regions['data'] ), "get_regions() backward compatibility alias works" );

// Flavors (OpenAPI: GET /flavors)
$flavors = $client->get_flavors( 'ir-thr-ba1' );
assert_test( is_array( $flavors ) && ! empty( $flavors['data'] ) && count( $flavors['data'] ) >= 6, "get_flavors() returns standard flavors" );
assert_test( isset( $flavors['data'][0]['cpuCores'] ) && isset( $flavors['data'][0]['memoryMegaBytes'] ) && isset( $flavors['data'][0]['pricePerHour'] ), "get_flavors() returns OpenAPI fields (cpuCores, memoryMegaBytes, pricePerHour)" );

// Single Flavor (OpenAPI: GET /flavors/{id})
$single_flavor = $client->get_flavor( 'g2-2-2-0', 'ir-thr-ba1' );
assert_test( is_array( $single_flavor ) && isset( $single_flavor['data']['id'] ), "get_flavor() returns single flavor details" );

// Calculate Flavor Price (OpenAPI: POST /flavors/{id}/calculate)
$calc_price = $client->calculate_flavor_price( 'g2-2-2-0', 100, 'ir-thr-ba1' );
assert_test( is_array( $calc_price ) && isset( $calc_price['data']['pricePerHour'] ), "calculate_flavor_price() calculates price with extra volume size" );

// OS Images (OpenAPI: GET /images)
$images = $client->get_images( 'ir-thr-ba1' );
assert_test( is_array( $images ) && ! empty( $images['data'] ) && count( $images['data'] ) >= 5, "get_images() returns standard OS templates" );
assert_test( isset( $images['data'][0]['osType'] ) && isset( $images['data'][0]['minDiskGigaBytes'] ), "get_images() contains OpenAPI fields (osType, minDiskGigaBytes)" );

// Create Server (OpenAPI: POST /servers)
$srv = $client->create_server( array(
	'availabilityZone'        => 'ir-thr-ba1',
	'name'                    => 'prod-web-01',
	'flavorId'                => 'g1-2-4',
	'imageId'                 => 'ubuntu-22.04',
	'rootVolumeSizeGigaBytes' => 50,
	'enableIpv4'              => true,
) );
assert_test( is_array( $srv ) && ! empty( $srv['data']['id'] ) && isset( $srv['data']['state'] ), "create_server() returns instance UUID and state: ACTIVE" );
assert_test( ! empty( $srv['data']['ipAddresses'][0]['ipAddress'] ) || ! empty( $srv['data']['ip_address'] ), "create_server() returns IP address in response" );

// Server Detail & List (OpenAPI: GET /servers/{id} and GET /servers)
$srv_detail = $client->get_server( 'srv-123', 'ir-thr-ba1' );
assert_test( is_array( $srv_detail ) && isset( $srv_detail['data']['id'] ), "get_server() returns server detail object" );

$srv_list = $client->get_servers( 'ir-thr-ba1' );
assert_test( is_array( $srv_list ), "get_servers() returns server list" );

// Server Power & Lifecycle Operations
$p_on = $client->power_on_server( 'srv-123', 'ir-thr-ba1' );
assert_test( isset( $p_on['success'] ) && $p_on['success'] === true, "power_on_server() succeeds" );

$p_off = $client->power_off_server( 'srv-123', 'ir-thr-ba1' );
assert_test( isset( $p_off['success'] ) && $p_off['success'] === true, "power_off_server() succeeds" );

$p_reb = $client->reboot_server( 'srv-123', 'ir-thr-ba1' );
assert_test( isset( $p_reb['success'] ) && $p_reb['success'] === true, "reboot_server() succeeds" );

$p_ren = $client->rename_server( 'srv-123', 'new-web-01', 'ir-thr-ba1' );
assert_test( isset( $p_ren['success'] ) && $p_ren['success'] === true, "rename_server() succeeds" );

$p_pwd = $client->reset_root_password( 'srv-123', 'SecretPass123!', 'ir-thr-ba1' );
assert_test( isset( $p_pwd['success'] ) && $p_pwd['success'] === true, "reset_root_password() succeeds" );

$p_res = $client->rescue_server( 'srv-123', 'ir-thr-ba1' );
assert_test( isset( $p_res['success'] ) && $p_res['success'] === true, "rescue_server() succeeds" );

$p_unres = $client->unrescue_server( 'srv-123', 'ir-thr-ba1' );
assert_test( isset( $p_unres['success'] ) && $p_unres['success'] === true, "unrescue_server() succeeds" );

$p_del = $client->delete_server( 'srv-123', 'ir-thr-ba1' );
assert_test( isset( $p_del['success'] ) && $p_del['success'] === true, "delete_server() succeeds" );

// Volumes, Firewalls, & Networks
$vols = $client->get_volumes( 'ir-thr-ba1' );
assert_test( is_array( $vols ) && isset( $vols['data'] ), "get_volumes() returns volume list" );

$fws = $client->get_firewalls( 'ir-thr-ba1' );
assert_test( is_array( $fws ) && isset( $fws['data'] ), "get_firewalls() returns firewalls list" );

$nets = $client->get_networks( 'ir-thr-ba1' );
assert_test( is_array( $nets ) && isset( $nets['data'] ), "get_networks() returns networks list" );

echo "\n=========================================================\n";
echo "SUMMARY: {$passed} Passed, {$failed} Failed\n";
echo "=========================================================\n";
if ( $failed > 0 ) {
	exit( 1 );
}
