<?php
/**
 * Public-facing and Virtual Storefront Router.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Public-facing controller and virtual page router.
 *
 * Intercepts /cloud-services/* rewrite endpoints using the template_include
 * filter and routes requests directly to templates/frontend-canvas.php, completely
 * bypassing the active WordPress theme to prevent layout conflicts.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public
 */
class Arvan_Public {

	/**
	 * Plugin identifier string.
	 *
	 * @var string
	 */
	private $plugin_name;

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	private $version;

	/**
	 * Initialize the class.
	 *
	 * @param string $plugin_name The ID of this plugin.
	 * @param string $version     The current version of this plugin.
	 */
	public function __construct( $plugin_name = 'arv-seller', $version = '1.0.0' ) {
		$this->plugin_name = $plugin_name;
		$this->version     = $version;
	}

	/**
	 * Register query variables for virtual storefront routing.
	 *
	 * @param array $vars Public query variables.
	 * @return array
	 */
	public function register_query_vars( $vars ) {
		$vars[] = 'arvan_page';
		$vars[] = 'arvan_action';
		return $vars;
	}

	/**
	 * Add rewrite tags and rewrite rules for cloud services endpoints.
	 */
	public function register_rewrites() {
		add_rewrite_tag( '%arvan_page%', '([^&]+)' );
		add_rewrite_tag( '%arvan_action%', '([^&]+)' );

		add_rewrite_rule( '^cloud-services/([^/]+)/([^/]+)/?$', 'index.php?arvan_page=$matches[1]&arvan_action=$matches[2]', 'top' );
		add_rewrite_rule( '^cloud-services/([^/]+)/?$', 'index.php?arvan_page=$matches[1]', 'top' );
		add_rewrite_rule( '^cloud-services/?$', 'index.php?arvan_page=dashboard', 'top' );
	}

	/**
	 * Intercept template loading and route to isolated canvas shell.
	 *
	 * @param string $template Current template file path.
	 * @return string Modified template file path.
	 */
	public function handle_virtual_routing( $template ) {
		$arvan_page = get_query_var( 'arvan_page' );

		if ( ! empty( $arvan_page ) ) {
			global $wp_query;

			// Force HTTP 200 OK and prevent 404 handler
			$wp_query->is_404  = false;
			$wp_query->is_page = true;
			status_header( 200 );

			$canvas_template = plugin_dir_path( dirname( __FILE__ ) ) . 'templates/frontend-canvas.php';

			if ( file_exists( $canvas_template ) ) {
				return $canvas_template;
			}
		}

		return $template;
	}

	/**
	 * Enqueue styles and scripts for the frontend canvas.
	 */
	public function enqueue_assets() {
		$arvan_page = get_query_var( 'arvan_page' );

		// Only enqueue on /cloud-services/ routes
		if ( empty( $arvan_page ) ) {
			return;
		}

		wp_enqueue_style(
			'arvan-canvas-style',
			plugin_dir_url( __FILE__ ) . 'css/arvan-canvas.css',
			array(),
			$this->version,
			'all'
		);

		wp_enqueue_script(
			'arvan-canvas-script',
			plugin_dir_url( __FILE__ ) . 'js/arvan-canvas.js',
			array( 'jquery' ),
			$this->version,
			true
		);

		wp_localize_script(
			'arvan-canvas-script',
			'arvanData',
			array(
				'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
				'nonce'    => wp_create_nonce( 'arvan_frontend_nonce' ),
				'currency' => get_option( 'arvan_currency', 'IRT' ),
				'userId'   => get_current_user_id(),
				'isLogged' => is_user_logged_in(),
			)
		);
	}
}
