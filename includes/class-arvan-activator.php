<?php
/**
 * Fired during plugin activation.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation,
 * specifically database tables creation via dbDelta(), default options,
 * cron scheduling, and rewrite rule flushing.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */
class Arvan_Activator {

	/**
	 * Run all activation routines.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {
		self::create_database_tables();
		self::set_default_options();
		self::schedule_metering_cron();
		self::register_rewrite_rules();
		flush_rewrite_rules();
	}

	/**
	 * Create custom MySQL tables using dbDelta().
	 *
	 * Creates wp_arvan_wallets, wp_arvan_transactions, and wp_arvan_resources.
	 *
	 * @since    1.0.0
	 */
	public static function create_database_tables() {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();

		// 1. Wallets table
		$table_wallets = $wpdb->prefix . 'arvan_wallets';
		$sql_wallets   = "CREATE TABLE $table_wallets (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			balance decimal(15,2) NOT NULL DEFAULT '0.00',
			currency varchar(10) NOT NULL DEFAULT 'IRT',
			status varchar(20) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY user_id (user_id)
		) $charset_collate;";

		dbDelta( $sql_wallets );

		// 2. Transactions table (atomic ledger)
		$table_transactions = $wpdb->prefix . 'arvan_transactions';
		$sql_transactions   = "CREATE TABLE $table_transactions (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			wallet_id bigint(20) unsigned NOT NULL,
			type varchar(30) NOT NULL,
			amount decimal(15,2) NOT NULL DEFAULT '0.00',
			balance_after decimal(15,2) NOT NULL DEFAULT '0.00',
			reference_id varchar(100) DEFAULT NULL,
			description text DEFAULT NULL,
			status varchar(20) NOT NULL DEFAULT 'completed',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY wallet_id (wallet_id),
			KEY reference_id (reference_id)
		) $charset_collate;";

		dbDelta( $sql_transactions );

		// 3. Resources table (ECC Instances, CDN Domains, Storage Buckets, VOD)
		$table_resources = $wpdb->prefix . 'arvan_resources';
		$sql_resources   = "CREATE TABLE $table_resources (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			service_type varchar(50) NOT NULL,
			arvan_resource_id varchar(100) NOT NULL,
			name varchar(255) NOT NULL,
			region varchar(50) DEFAULT NULL,
			plan_specs longtext DEFAULT NULL,
			hourly_cost decimal(15,4) NOT NULL DEFAULT '0.0000',
			status varchar(30) NOT NULL DEFAULT 'active',
			last_metered_at datetime DEFAULT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY service_type (service_type),
			KEY arvan_resource_id (arvan_resource_id),
			KEY status (status)
		) $charset_collate;";

		dbDelta( $sql_resources );
	}

	/**
	 * Initialize default plugin options if not already configured.
	 *
	 * @since    1.0.0
	 */
	private static function set_default_options() {
		if ( false === get_option( 'arvan_currency' ) ) {
			add_option( 'arvan_currency', 'IRT' ); // Tomans
		}

		if ( false === get_option( 'arvan_markup_percentage' ) ) {
			add_option( 'arvan_markup_percentage', 20 ); // 20% default reseller markup
		}

		if ( false === get_option( 'arvan_fixed_margin' ) ) {
			add_option( 'arvan_fixed_margin', 0 ); // Fixed margin addition (e.g. 0 IRT)
		}

		if ( false === get_option( 'arvan_api_key' ) ) {
			add_option( 'arvan_api_key', '' );
		}

		if ( false === get_option( 'arvan_default_region' ) ) {
			add_option( 'arvan_default_region', 'ir-thr-c2' );
		}

		if ( false === get_option( 'arvan_store_name' ) ) {
			add_option( 'arvan_store_name', get_bloginfo( 'name' ) . ' Cloud' );
		}

		if ( false === get_option( 'arvan_support_email' ) ) {
			add_option( 'arvan_support_email', get_option( 'admin_email' ) );
		}

		if ( false === get_option( 'arvan_support_phone' ) ) {
			add_option( 'arvan_support_phone', '021-88888888' );
		}

		if ( false === get_option( 'arvan_sandbox_mode' ) ) {
			add_option( 'arvan_sandbox_mode', 1 ); // Default sandbox demo mode enabled
		}
	}

	/**
	 * Schedule hourly metering cron job if not yet scheduled.
	 *
	 * @since    1.0.0
	 */
	private static function schedule_metering_cron() {
		if ( ! wp_next_scheduled( 'arvan_hourly_metering_cron' ) ) {
			wp_schedule_event( time(), 'hourly', 'arvan_hourly_metering_cron' );
		}
	}

	/**
	 * Register virtual storefront rewrite rules.
	 *
	 * @since    1.0.0
	 */
	private static function register_rewrite_rules() {
		add_rewrite_tag( '%arvan_page%', '([^&]+)' );
		add_rewrite_tag( '%arvan_action%', '([^&]+)' );

		add_rewrite_rule( '^cloud-services/([^/]+)/([^/]+)/?$', 'index.php?arvan_page=$matches[1]&arvan_action=$matches[2]', 'top' );
		add_rewrite_rule( '^cloud-services/([^/]+)/?$', 'index.php?arvan_page=$matches[1]', 'top' );
		add_rewrite_rule( '^cloud-services/?$', 'index.php?arvan_page=dashboard', 'top' );
	}
}
