<?php
/**
 * Fired during plugin deactivation.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation,
 * specifically unscheduling background metering cron events and flushing rewrite rules.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */
class Arvan_Deactivator {

	/**
	 * Run all deactivation routines.
	 *
	 * @since    1.0.0
	 */
	public static function deactivate() {
		// Clear the scheduled hourly metering cron event
		$timestamp = wp_next_scheduled( 'arvan_hourly_metering_cron' );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'arvan_hourly_metering_cron' );
		}

		// Also clear any recurring schedules
		wp_clear_scheduled_hook( 'arvan_hourly_metering_cron' );

		// Flush rewrites to remove virtual storefront endpoints
		flush_rewrite_rules();
	}
}
