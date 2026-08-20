<?php
/**
 * Master Plugin Orchestrator Class.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks,
 * public-facing virtual routing, and hourly metering cron hooks.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */
class Arvan_Reseller {

	/**
	 * The loader that's responsible for maintaining and registering all hooks.
	 *
	 * @var Arvan_Loader
	 */
	protected $loader;

	/**
	 * Unique identifier of this plugin.
	 *
	 * @var string
	 */
	protected $plugin_name;

	/**
	 * Current version of the plugin.
	 *
	 * @var string
	 */
	protected $version;

	/**
	 * Admin controller instance.
	 *
	 * @var Arvan_Admin
	 */
	protected $admin;

	/**
	 * Public controller instance.
	 *
	 * @var Arvan_Public
	 */
	protected $public;

	/**
	 * Metering engine instance.
	 *
	 * @var Arvan_Metering
	 */
	protected $metering;

	/**
	 * Constructor.
	 */
	public function __construct() {
		if ( defined( 'ARVAN_RESELLER_VERSION' ) ) {
			$this->version = ARVAN_RESELLER_VERSION;
		} else {
			$this->version = '1.0.0';
		}
		$this->plugin_name = 'arv-seller';

		$this->load_dependencies();
		$this->define_admin_hooks();
		$this->define_public_hooks();
		$this->define_metering_hooks();
	}

	/**
	 * Load all core dependencies and instances.
	 */
	private function load_dependencies() {
		require_once plugin_dir_path( __FILE__ ) . 'class-arvan-loader.php';
		require_once plugin_dir_path( __FILE__ ) . 'class-arvan-api-client.php';
		require_once plugin_dir_path( __FILE__ ) . 'class-arvan-wallet.php';
		require_once plugin_dir_path( __FILE__ ) . 'class-arvan-metering.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-arvan-admin.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-arvan-public.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-arvan-gateway.php';

		$this->loader   = new Arvan_Loader();
		$this->admin    = new Arvan_Admin( $this->get_plugin_name(), $this->get_version() );
		$this->public   = new Arvan_Public( $this->get_plugin_name(), $this->get_version() );
		$this->metering = new Arvan_Metering();
	}

	/**
	 * Register all admin hooks.
	 */
	private function define_admin_hooks() {
		$this->loader->add_action( 'admin_menu', $this->admin, 'add_admin_menu' );
		$this->loader->add_action( 'admin_init', $this->admin, 'register_settings' );
	}

	/**
	 * Register all public storefront, routing, and asset hooks.
	 */
	private function define_public_hooks() {
		$this->loader->add_action( 'init', $this->public, 'register_rewrites' );
		$this->loader->add_filter( 'query_vars', $this->public, 'register_query_vars' );
		$this->loader->add_filter( 'template_include', $this->public, 'handle_virtual_routing', 99 );
		$this->loader->add_action( 'wp_enqueue_scripts', $this->public, 'enqueue_assets' );
	}

	/**
	 * Register hourly metering background cron hooks.
	 */
	private function define_metering_hooks() {
		$this->loader->add_action( 'arvan_hourly_metering_cron', $this->metering, 'process_hourly_metering' );
	}

	/**
	 * Run the loader to execute all hooks.
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * Get plugin identifier.
	 *
	 * @return string
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * Get plugin loader.
	 *
	 * @return Arvan_Loader
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Get plugin version.
	 *
	 * @return string
	 */
	public function get_version() {
		return $this->version;
	}
}
