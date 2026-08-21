<?php
/**
 * Hourly Metering & Auto-Suspension Engine.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Hourly Metering and Legal Service Termination Engine.
 *
 * Executes on wp_cron (arvan_hourly_metering_cron) to iterate through active
 * customer cloud resources in wp_arvan_resources, debit hourly costs from
 * wp_arvan_wallets, and automatically dispatch power-off / suspension API calls
 * when customer wallet balances hit zero according to ArvanCloud legal terms.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */
class Arvan_Metering {

	/**
	 * Initialize metering hooks.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
		// Hook the scheduled cron action
		add_action( 'arvan_hourly_metering_cron', array( $this, 'process_hourly_metering' ) );
	}

	/**
	 * Main metering processing cycle.
	 *
	 * @since    1.0.0
	 * @return   array Summary of processed items, debited total, and suspended instances.
	 */
	public function process_hourly_metering() {
		global $wpdb;

		$table_resources = $wpdb->prefix . 'arvan_resources';
		$api_client      = new Arvan_API_Client();

		// Fetch all active or running resources that incur hourly cost
		$resources = $wpdb->get_results(
			"SELECT * FROM {$table_resources} WHERE status IN ('active', 'running') AND hourly_cost > 0"
		);

		$summary = array(
			'processed' => 0,
			'debited'   => 0,
			'suspended' => 0,
			'errors'    => array(),
		);

		if ( empty( $resources ) ) {
			return $summary;
		}

		foreach ( $resources as $resource ) {
			$summary['processed']++;
			$user_id     = absint( $resource->user_id );
			$hourly_cost = (float) $resource->hourly_cost;

			// 1. Attempt to debit the hourly rate from customer wallet
			$description = sprintf(
				/* translators: 1: Resource name, 2: Service type */
				__( 'Hourly metering for %1$s (%2$s)', 'arv-seller' ),
				$resource->name,
				$resource->service_type
			);

			$debit_result = Arvan_Wallet::debit(
				$user_id,
				$hourly_cost,
				'metering_charge',
				$resource->arvan_resource_id,
				$description,
				true // Allow temporary negative to catch exact debit before suspension
			);

			if ( is_wp_error( $debit_result ) ) {
				$summary['errors'][] = sprintf(
					'User #%d, Resource #%d debit error: %s',
					$user_id,
					$resource->id,
					$debit_result->get_error_message()
				);
				continue;
			}

			$summary['debited'] += $hourly_cost;
			$new_balance         = $debit_result['new_balance'];

			// 2. Update resource last_metered_at timestamp
			$wpdb->update(
				$table_resources,
				array( 'last_metered_at' => current_time( 'mysql' ) ),
				array( 'id' => $resource->id ),
				array( '%s' ),
				array( '%d' )
			);

			// 3. Auto-suspension check: If balance <= 0, power off / suspend resource immediately
			if ( $new_balance <= 0 ) {
				$this->suspend_resource( $resource, $api_client );
				$summary['suspended']++;
			}
		}

		do_action( 'arvan_metering_cycle_completed', $summary );

		return $summary;
	}

	/**
	 * Suspend a resource and dispatch API power-off command.
	 *
	 * @param object           $resource   Database resource row.
	 * @param Arvan_API_Client $api_client API client instance.
	 */
	protected function suspend_resource( $resource, $api_client ) {
		global $wpdb;
		$table_resources = $wpdb->prefix . 'arvan_resources';

		// Update status in local database
		$wpdb->update(
			$table_resources,
			array(
				'status'     => 'suspended',
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $resource->id ),
			array( '%s', '%s' ),
			array( '%d' )
		);

		// Execute cloud suspension based on service type
		if ( 'ecc_instance' === $resource->service_type ) {
			$region = ! empty( $resource->region ) ? $resource->region : get_option( 'arvan_default_region', 'ir-thr-c2' );
			$api_client->power_off_server( $resource->arvan_resource_id, $region );
		}

		// Log suspension event
		do_action( 'arvan_resource_auto_suspended', $resource );
	}

	/**
	 * Restore user's suspended resources to 'stopped' state upon positive wallet top-up,
	 * permitting single-click power-on from the customer dashboard.
	 *
	 * @param int $user_id Customer user ID.
	 */
	public static function restore_user_suspended_resources( $user_id ) {
		global $wpdb;
		$table_resources = $wpdb->prefix . 'arvan_resources';

		$wpdb->query(
			$wpdb->prepare(
				"UPDATE {$table_resources} SET status = 'stopped', updated_at = %s WHERE user_id = %d AND status = 'suspended'",
				current_time( 'mysql' ),
				absint( $user_id )
			)
		);
	}

	/**
	 * Manually run the metering cycle (e.g. for testing, WP-CLI, or Admin on-demand).
	 *
	 * @return array Summary of the run.
	 */
	public static function run_manual_cycle() {
		$instance = new self();
		return $instance->process_hourly_metering();
	}
}
