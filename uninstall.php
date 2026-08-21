<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package    ArvanCloud_Reseller
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Clear unscheduled cron jobs
wp_clear_scheduled_hook( 'arvan_hourly_metering_cron' );

// Optionally clean plugin options
delete_option( 'arvan_api_key' );
delete_option( 'arvan_markup_percentage' );
delete_option( 'arvan_fixed_margin' );
delete_option( 'arvan_currency' );
delete_option( 'arvan_default_region' );
delete_option( 'arvan_store_name' );
delete_option( 'arvan_support_email' );
delete_option( 'arvan_support_phone' );
delete_option( 'arvan_sandbox_mode' );
