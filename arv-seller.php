<?php
/**
 * ArvanCloud Reseller Platform
 *
 * @link              https://arvancloud.ir
 * @since             1.0.0
 * @package           ArvanCloud_Reseller
 *
 * @wordpress-plugin
 * Plugin Name:       ArvanCloud Reseller
 * Plugin URI:        https://arvancloud.ir
 * Description:       Standalone ArvanCloud reseller plugin providing automated cloud provisioning, native wallet ledger, hourly consumption metering, and theme-isolated customer storefronts.
 * Version:           1.0.0
 * Author:            Reseller Dev Team
 * Author URI:        https://arvancloud.ir
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       arv-seller
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 */
define( 'ARVAN_RESELLER_VERSION', '1.0.0' );
define( 'ARVAN_RESELLER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ARVAN_RESELLER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Activation routine: database tables creation, defaults, cron, and rewrites.
 */
function activate_arvan_reseller() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-arvan-activator.php';
	Arvan_Activator::activate();
}

/**
 * Deactivation routine: unschedules cron jobs and flushes rewrites.
 */
function deactivate_arvan_reseller() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-arvan-deactivator.php';
	Arvan_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_arvan_reseller' );
register_deactivation_hook( __FILE__, 'deactivate_arvan_reseller' );

/**
 * Load core orchestrator class.
 */
require_once plugin_dir_path( __FILE__ ) . 'includes/class-arvan-reseller.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/class-arvan-activator.php';
add_action( 'plugins_loaded', array( 'Arvan_Activator', 'maybe_upgrade' ) );

/**
 * Begins execution of the plugin.
 */
function run_arvan_reseller() {
	$plugin = new Arvan_Reseller();
	$plugin->run();
}
run_arvan_reseller();
