<?php
/**
 * Standalone Test Suite for ArvanCloud Reseller Plugin (Pricing & API Mock).
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
	'arvan_default_region'    => 'ir-thr-c2',
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

// 2. Arvan_API_Client Sandbox Mock Tests
echo "\n--- 2. Arvan_API_Client Sandbox & REST Handlers ---\n";
$client = new Arvan_API_Client();

$conn = $client->test_connection();
assert_test( $conn['success'] === true, "test_connection() returns success in sandbox" );

$regions = $client->get_regions();
assert_test( is_array( $regions ) && ! empty( $regions['data'] ) && count( $regions['data'] ) >= 3, "get_regions() returns at least 3 datacenter regions" );

$flavors = $client->get_flavors( 'ir-thr-c2' );
assert_test( is_array( $flavors ) && ! empty( $flavors['data'] ) && count( $flavors['data'] ) >= 6, "get_flavors() returns standard flavors (g1-1-2, g1-2-4, etc.)" );

$images = $client->get_images( 'ir-thr-c2' );
assert_test( is_array( $images ) && ! empty( $images['data'] ) && count( $images['data'] ) >= 5, "get_images() returns standard OS templates (Ubuntu, Debian, Windows)" );

$srv = $client->create_server( array(
	'region'    => 'ir-thr-c2',
	'name'      => 'prod-web-01',
	'size_id'   => 'g1-2-4',
	'image_id'  => 'ubuntu-22.04',
	'disk_size' => 50,
) );
assert_test( is_array( $srv ) && ! empty( $srv['data']['id'] ) && ! empty( $srv['data']['ip_address'] ), "create_server() returns instance UUID and public IP address" );

$p_on = $client->power_on_server( 'srv-123' );
assert_test( isset( $p_on['success'] ) && $p_on['success'] === true, "power_on_server() succeeds" );
$p_off = $client->power_off_server( 'srv-123' );
assert_test( isset( $p_off['success'] ) && $p_off['success'] === true, "power_off_server() succeeds" );
$p_reb = $client->reboot_server( 'srv-123' );
assert_test( isset( $p_reb['success'] ) && $p_reb['success'] === true, "reboot_server() succeeds" );
$p_del = $client->delete_server( 'srv-123' );
assert_test( isset( $p_del['success'] ) && $p_del['success'] === true, "delete_server() succeeds" );

echo "\n=========================================================\n";
echo "SUMMARY: {$passed} Passed, {$failed} Failed\n";
echo "=========================================================\n";
if ( $failed > 0 ) {
	exit( 1 );
}
