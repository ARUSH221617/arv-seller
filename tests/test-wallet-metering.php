<?php
/**
 * Standalone Test for Wallet Ledger & Metering Suspension Cycle.
 */

if ( ! defined( 'WPINC' ) ) define( 'WPINC', true );
if ( ! defined( 'ABSPATH' ) ) define( 'ABSPATH', dirname( __DIR__ ) . '/' );

class Mock_WPDB {
	public $prefix = 'wp_';
	public $wallets = array();
	public $transactions = array();
	public $resources = array();
	public $insert_id = 0;
	private $in_transaction = false;

	public function query( $sql ) {
		if ( strpos( $sql, 'START TRANSACTION' ) !== false ) {
			$this->in_transaction = true;
		}
		if ( strpos( $sql, 'COMMIT' ) !== false || strpos( $sql, 'ROLLBACK' ) !== false ) {
			$this->in_transaction = false;
		}
		if ( strpos( $sql, 'UPDATE wp_arvan_resources SET status = \'stopped\'' ) !== false ) {
			foreach ( $this->resources as &$res ) {
				if ( $res->status === 'suspended' ) {
					$res->status = 'stopped';
				}
			}
		}
		return true;
	}

	public function prepare( $query, ...$args ) {
		foreach ( $args as $arg ) {
			$query = preg_replace( '/%[dsf]/', ( is_numeric( $arg ) ? $arg : "'" . addslashes( $arg ) . "'" ), $query, 1 );
		}
		return $query;
	}

	public function get_row( $sql ) {
		if ( preg_match( '/FROM wp_arvan_wallets WHERE user_id = (\d+)/', $sql, $m ) ) {
			$uid = (int) $m[1];
			return isset( $this->wallets[ $uid ] ) ? (object) $this->wallets[ $uid ] : null;
		}
		if ( preg_match( '/FROM wp_arvan_resources WHERE id = (\d+)/', $sql, $m ) ) {
			$rid = (int) $m[1];
			return isset( $this->resources[ $rid ] ) ? (object) $this->resources[ $rid ] : null;
		}
		return null;
	}

	public function get_var( $sql ) {
		if ( preg_match( '/SUM\(hourly_cost\) FROM wp_arvan_resources WHERE user_id = (\d+)/', $sql, $m ) ) {
			$uid = (int) $m[1];
			$sum = 0;
			foreach ( $this->resources as $res ) {
				if ( $res->user_id == $uid && in_array( $res->status, array( 'active', 'running' ) ) ) {
					$sum += $res->hourly_cost;
				}
			}
			return $sum;
		}
		return 0;
	}

	public function get_results( $sql ) {
		if ( strpos( $sql, 'FROM wp_arvan_resources WHERE status IN' ) !== false ) {
			$out = array();
			foreach ( $this->resources as $res ) {
				if ( in_array( $res->status, array( 'active', 'running' ) ) && $res->hourly_cost > 0 ) {
					$out[] = $res;
				}
			}
			return $out;
		}
		if ( strpos( $sql, 'FROM wp_arvan_transactions' ) !== false ) {
			return array_map( function( $t ) { return (object) $t; }, array_reverse( $this->transactions ) );
		}
		return array();
	}

	public function insert( $table, $data, $format = null ) {
		$this->insert_id++;
		$data['id'] = $this->insert_id;
		if ( strpos( $table, 'arvan_wallets' ) !== false ) {
			$this->wallets[ $data['user_id'] ] = $data;
		} elseif ( strpos( $table, 'arvan_transactions' ) !== false ) {
			$this->transactions[ $this->insert_id ] = $data;
		} elseif ( strpos( $table, 'arvan_resources' ) !== false ) {
			$this->resources[ $this->insert_id ] = (object) $data;
		}
		return true;
	}

	public function update( $table, $data, $where, $format = null, $where_format = null ) {
		if ( strpos( $table, 'arvan_wallets' ) !== false ) {
			$id = isset( $where['id'] ) ? $where['id'] : ( isset( $where['user_id'] ) ? $where['user_id'] : 1 );
			foreach ( $this->wallets as &$w ) {
				if ( $w['id'] == $id ) {
					$w = array_merge( $w, $data );
				}
			}
		} elseif ( strpos( $table, 'arvan_resources' ) !== false ) {
			$id = $where['id'];
			if ( isset( $this->resources[ $id ] ) ) {
				foreach ( $data as $k => $v ) {
					$this->resources[ $id ]->$k = $v;
				}
			}
		}
		return true;
	}

	public function delete( $table, $where, $where_format = null ) {
		if ( strpos( $table, 'arvan_resources' ) !== false ) {
			$id = $where['id'];
			unset( $this->resources[ $id ] );
		}
		return true;
	}
}

global $wpdb;
$wpdb = new Mock_WPDB();

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
function sanitize_text_field( $str ) { return trim( strip_tags( $str ) ); }
function sanitize_textarea_field( $str ) { return trim( strip_tags( $str ) ); }
function sanitize_key( $key ) { return preg_replace( '/[^a-z0-9_\-]/i', '', $key ); }
function absint( $num ) { return abs( intval( $num ) ); }
function current_time( $type ) { return date( 'Y-m-d H:i:s' ); }
function wp_json_encode( $data ) { return json_encode( $data ); }
function wp_rand( $min = 0, $max = 1000000 ) { return rand( $min, $max ); }
function apply_filters( $tag, $value ) { return $value; }
function do_action( $tag, ...$args ) {}
function add_action( $tag, $callback, $priority = 10, $accepted_args = 1 ) {}
function __( $text, $domain = 'default' ) { return $text; }
function esc_html__( $text, $domain = 'default' ) { return $text; }
function get_userdata( $id ) { return (object) array( 'user_login' => "user_{$id}", 'display_name' => "User {$id}", 'user_email' => "user{$id}@example.com" ); }

class WP_Error {
	protected $code;
	protected $message;
	protected $data;
	public function __construct( $code, $message = '', $data = array() ) {
		$this->code = $code; $this->message = $message; $this->data = $data;
	}
	public function get_error_message() { return $this->message; }
	public function get_error_code() { return $this->code; }
}
function is_wp_error( $thing ) { return ( $thing instanceof WP_Error ); }
function get_transient( $key ) { return false; }
function set_transient( $key, $val, $ttl ) { return true; }

require_once dirname( __DIR__ ) . '/includes/class-arvan-api-client.php';
require_once dirname( __DIR__ ) . '/includes/class-arvan-wallet.php';
require_once dirname( __DIR__ ) . '/includes/class-arvan-metering.php';

echo "=========================================================\n";
echo "WALLET ATOMIC LEDGER & METERING CYCLE TEST SUITE\n";
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

// 1. Initial Wallet State
$u1 = 101;
$b0 = Arvan_Wallet::get_balance( $u1 );
assert_test( 0.0 === $b0, "New user starts with 0.00 IRT balance" );

// 2. Deposit Funds
$c1 = Arvan_Wallet::credit( $u1, 100000, 'topup', 'TRX-1001', 'Deposit 100k' );
assert_test( isset( $c1['success'] ) && 100000.0 === $c1['new_balance'], "Deposit 100,000 IRT sets balance to 100,000 IRT" );

$b1 = Arvan_Wallet::get_balance( $u1 );
assert_test( 100000.0 === $b1, "get_balance() confirms 100,000 IRT" );

// 3. Sufficient Balance Check
assert_test( Arvan_Wallet::has_sufficient_balance( $u1, 50000 ), "has_sufficient_balance(50k) returns true" );
assert_test( ! Arvan_Wallet::has_sufficient_balance( $u1, 150000 ), "has_sufficient_balance(150k) returns false" );

// 4. Deploy 2 Cloud Servers
$wpdb->insert( 'wp_arvan_resources', array(
	'user_id' => $u1,
	'service_type' => 'ecc_instance',
	'arvan_resource_id' => 'srv-001',
	'name' => 'web-srv-01',
	'region' => 'ir-thr-c2',
	'hourly_cost' => 540.0,
	'status' => 'active',
) );
$res1_id = $wpdb->insert_id;

$wpdb->insert( 'wp_arvan_resources', array(
	'user_id' => $u1,
	'service_type' => 'ecc_instance',
	'arvan_resource_id' => 'srv-002',
	'name' => 'db-srv-01',
	'region' => 'ir-thr-c2',
	'hourly_cost' => 1068.0,
	'status' => 'active',
) );
$res2_id = $wpdb->insert_id;

// Burn Rate & Remaining Hours
$burn = Arvan_Wallet::get_user_burn_rate( $u1 );
assert_test( 1608.0 === $burn, "User total burn rate is 540 + 1068 = 1608 IRT/hr" );

$rem_hrs = Arvan_Wallet::get_remaining_hours( $u1 );
assert_test( $rem_hrs > 60 && $rem_hrs < 63, "Remaining hours ~62.2 hrs" );

// 5. Hourly Metering Cycle
$summary = Arvan_Metering::run_manual_cycle();
assert_test( 2 === $summary['processed'], "Metering cycle processed 2 active resources" );
assert_test( 1608.0 === $summary['debited'], "Total debited is 1608 IRT" );
assert_test( 0 === $summary['suspended'], "0 instances suspended (balance remains positive)" );

$b2 = Arvan_Wallet::get_balance( $u1 );
assert_test( 98392.0 === $b2, "Balance after 1 hour is 98,392 IRT" );

// 6. Suspension on Zero Balance Test
Arvan_Wallet::debit( $u1, 98000, 'debit', 'TEST', 'Drain balance' );
$b3 = Arvan_Wallet::get_balance( $u1 );
assert_test( 392.0 === $b3, "Wallet drained to 392 IRT" );

$summary2 = Arvan_Metering::run_manual_cycle();
assert_test( $summary2['suspended'] >= 1, "Metering cycle detected balance <= 0 and suspended instances" );

$res1 = $wpdb->get_row( "SELECT * FROM wp_arvan_resources WHERE id = {$res1_id}" );
assert_test( 'suspended' === $res1->status, "Resource 1 status changed to 'suspended'" );

// 7. Auto-Recovery Test on Top-up
Arvan_Wallet::credit( $u1, 200000, 'topup', 'TRX-RECOVER', 'Recovery Deposit' );
$res1_after = $wpdb->get_row( "SELECT * FROM wp_arvan_resources WHERE id = {$res1_id}" );
assert_test( 'stopped' === $res1_after->status, "Resource 1 recovered from 'suspended' to 'stopped' (ready to power on)" );

echo "\n=========================================================\n";
echo "SUMMARY: {$passed} Passed, {$failed} Failed\n";
echo "=========================================================\n";
if ( $failed > 0 ) {
	exit( 1 );
}
