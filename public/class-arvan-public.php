<?php
/**
 * Public-facing and Virtual Storefront Router & AJAX Controller.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Public-facing controller, virtual page router, and AJAX handlers.
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

		// Register Frontend AJAX Handlers
		$this->register_ajax_handlers();
	}

	/**
	 * Register all AJAX actions for logged-in and guest users.
	 */
	private function register_ajax_handlers() {
		// Server Provisioning & Power Lifecycle
		add_action( 'wp_ajax_arvan_deploy_server', array( $this, 'ajax_deploy_server' ) );
		add_action( 'wp_ajax_arvan_server_power', array( $this, 'ajax_server_power' ) );
		add_action( 'wp_ajax_arvan_get_dashboard_data', array( $this, 'ajax_get_dashboard_data' ) );

		// IaaS Infrastructure AJAX Endpoints (Volumes, Networks, Firewalls, Images)
		add_action( 'wp_ajax_arvan_get_iaas_resources', array( $this, 'ajax_get_iaas_resources' ) );
		add_action( 'wp_ajax_arvan_create_volume', array( $this, 'ajax_create_volume' ) );
		add_action( 'wp_ajax_arvan_attach_volume', array( $this, 'ajax_attach_volume' ) );
		add_action( 'wp_ajax_arvan_detach_volume', array( $this, 'ajax_detach_volume' ) );
		add_action( 'wp_ajax_arvan_delete_volume', array( $this, 'ajax_delete_volume' ) );
		add_action( 'wp_ajax_arvan_create_network', array( $this, 'ajax_create_network' ) );
		add_action( 'wp_ajax_arvan_delete_network', array( $this, 'ajax_delete_network' ) );
		add_action( 'wp_ajax_arvan_create_firewall', array( $this, 'ajax_create_firewall' ) );
		add_action( 'wp_ajax_arvan_delete_firewall', array( $this, 'ajax_delete_firewall' ) );
		add_action( 'wp_ajax_arvan_add_firewall_rule', array( $this, 'ajax_add_firewall_rule' ) );
		add_action( 'wp_ajax_arvan_create_custom_image', array( $this, 'ajax_create_custom_image' ) );
		add_action( 'wp_ajax_arvan_delete_custom_image', array( $this, 'ajax_delete_custom_image' ) );

		// Wallet Top-up & Deposit
		add_action( 'wp_ajax_arvan_topup_wallet', array( $this, 'ajax_topup_wallet' ) );
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
			$this->maybe_handle_payment_callback();
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
	 * Process gateway return using persisted authority and amount.
	 */
	private function maybe_handle_payment_callback() {
		if ( ! isset( $_GET['arvan_payment'] ) || 'verify' !== sanitize_key( wp_unslash( $_GET['arvan_payment'] ) ) ) {
			return;
		}

		$status = isset( $_GET['Status'] ) ? sanitize_key( wp_unslash( $_GET['Status'] ) ) : '';
		$authority = isset( $_GET['Authority'] ) ? sanitize_text_field( wp_unslash( $_GET['Authority'] ) ) : '';
		if ( 'ok' !== strtolower( $status ) || '' === $authority ) {
			wp_safe_redirect( add_query_arg( 'payment', 'cancelled', home_url( '/cloud-services/dashboard/' ) ) );
			exit;
		}

		$result = ( new Arvan_Gateway() )->complete_payment( $authority );
		$state = is_wp_error( $result ) ? 'failed' : 'success';
		wp_safe_redirect( add_query_arg( 'payment', $state, home_url( '/cloud-services/dashboard/' ) ) );
		exit;
	}

	/**
	 * Convert a resource row to the public dashboard contract.
	 *
	 * @param object $resource Resource database row.
	 * @return array
	 */
	private function format_resource( $resource ) {
		$specs = json_decode( (string) $resource->plan_specs, true );
		$specs = is_array( $specs ) ? $specs : array();
		return array(
			'id'          => (int) $resource->id,
			'name'        => (string) $resource->name,
			'arvan_uuid'  => (string) $resource->arvan_resource_id,
			'status'      => (string) $resource->status,
			'region_id'   => (string) $resource->region,
			'flavor_id'   => isset( $specs['flavor_id'] ) ? (string) $specs['flavor_id'] : '',
			'image_id'    => isset( $specs['image_id'] ) ? (string) $specs['image_id'] : '',
			'disk_size'   => isset( $specs['disk_size'] ) ? (int) $specs['disk_size'] : 0,
			'public_ip'   => isset( $specs['ip_address'] ) ? (string) $specs['ip_address'] : '',
			'hourly_rate' => (float) $resource->hourly_cost,
			'created_at'  => (string) $resource->created_at,
		);
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

		$fonts_css = plugin_dir_path( __FILE__ ) . 'fonts/fonts.css';
		if ( file_exists( $fonts_css ) ) {
			wp_enqueue_style(
				'arvan-local-fonts',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'fonts/fonts.css' ),
				array(),
				$this->version,
				'all'
			);
		}

		$dist_css = plugin_dir_path( __FILE__ ) . 'dist/canvas-app.css';
		$dist_js  = plugin_dir_path( __FILE__ ) . 'dist/canvas-app.js';

		if ( file_exists( $dist_css ) && file_exists( $dist_js ) ) {
			wp_enqueue_style(
				'arvan-canvas-react-style',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'dist/canvas-app.css' ),
				array(),
				$this->version,
				'all'
			);

			wp_enqueue_script(
				'arvan-canvas-react-script',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'dist/canvas-app.js' ),
				array(),
				$this->version,
				true
			);
			$script_handle = 'arvan-canvas-react-script';
		} else {
			wp_enqueue_style(
				'arvan-canvas-style',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'css/arvan-canvas.css' ),
				array(),
				$this->version,
				'all'
			);

			wp_enqueue_script(
				'arvan-canvas-script',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'js/arvan-canvas.js' ),
				array( 'jquery' ),
				$this->version,
				true
			);
			$script_handle = 'arvan-canvas-script';
		}

		$user_id        = get_current_user_id();
		$user_logged_in = is_user_logged_in();
		$balance        = $user_logged_in ? Arvan_Wallet::get_balance( $user_id ) : 0;
		$burn_rate      = $user_logged_in ? Arvan_Wallet::get_user_burn_rate( $user_id ) : 0;
		$remaining_hrs  = $user_logged_in ? Arvan_Wallet::get_remaining_hours( $user_id ) : 0;

		// Fetch user servers and transactions for instant React state
		$user_servers = array();
		$user_txs     = array();
		if ( $user_logged_in ) {
			$raw_servers = Arvan_Wallet::get_user_resources( $user_id );
			foreach ( $raw_servers as $res ) {
				$user_servers[] = $this->format_resource( $res );
			}

			$raw_txs = Arvan_Wallet::get_user_ledger( $user_id, 20 );
			foreach ( $raw_txs as $tx ) {
				$user_txs[] = array(
					'id'            => (int) $tx->id,
					'type'          => $tx->type,
					'amount'        => (float) $tx->amount,
					'balance_after' => (float) $tx->balance_after,
					'description'   => $tx->description,
					'created_at'    => $tx->created_at,
				);
			}
		}

		wp_localize_script(
			$script_handle,
			'arvanData',
			array(
				'ajaxUrl'        => wp_make_link_relative( admin_url( 'admin-ajax.php' ) ),
				'nonce'          => wp_create_nonce( 'arvan_frontend_nonce' ),
				'currency'       => get_option( 'arvan_currency', 'IRT' ),
				'userId'         => $user_id,
				'isLogged'       => $user_logged_in,
				'balance'        => $balance,
				'burnRate'       => $burn_rate,
				'remainingHours' => $remaining_hrs,
				'markupPct'      => (float) get_option( 'arvan_markup_percentage', 20 ),
				'fixedMargin'    => (float) get_option( 'arvan_fixed_margin', 0 ),
				'activeLang'     => Arv_Seller_i18n::get_active_language(),
				'direction'      => Arv_Seller_i18n::get_active_direction(),
				'loginUrl'       => wp_login_url( home_url( '/cloud-services/dashboard/' ) ),
				'storeName'        => get_option( 'arvan_store_name', get_bloginfo( 'name' ) . ' Cloud' ),
				'storeTagline'     => get_option( 'arvan_store_tagline', 'High Performance Cloud Computing & NVMe Storage' ),
				'logoUrl'          => get_option( 'arvan_store_logo_url', '' ),
				'faviconUrl'       => get_option( 'arvan_store_favicon_url', '' ),
				'masterTheme'      => get_option( 'arvan_master_theme', 'arvan-sorkhab' ),
				'primaryColor'     => get_option( 'arvan_brand_primary_color', '#008b8b' ),
				'brandPrimaryColor'=> get_option( 'arvan_brand_primary_color', '#008b8b' ),
				'secondaryColor'   => get_option( 'arvan_brand_secondary_color', '#0b3a42' ),
				'brandSecondaryColor'=> get_option( 'arvan_brand_secondary_color', '#0b3a42' ),
				'colorSurface'     => get_option( 'arvan_color_surface', '#ffffff' ),
				'colorBackground'  => get_option( 'arvan_color_bg', '#f8fafc' ),
				'colorText'        => get_option( 'arvan_color_text', '#0f172a' ),
				'colorTextMuted'   => get_option( 'arvan_color_text_muted', '#64748b' ),
				'colorBorder'      => get_option( 'arvan_color_border', '#e2e8f0' ),
				'colorSuccess'     => get_option( 'arvan_color_success', '#10b981' ),
				'colorWarning'     => get_option( 'arvan_color_warning', '#f59e0b' ),
				'colorError'       => get_option( 'arvan_color_error', '#ef4444' ),
				'fontFamily'       => get_option( 'arvan_font_family', 'vazirmatn' ),
				'customFontName'   => get_option( 'arvan_custom_font_name', '' ),
				'customFontUrl'    => get_option( 'arvan_custom_font_url', '' ),
				'persianDigits'    => (bool) get_option( 'arvan_persian_digits', 1 ),
				'fontSizeScale'    => get_option( 'arvan_font_size_scale', 'normal' ),
				'baseFontSize'     => (int) get_option( 'arvan_base_font_size', 14 ),
				'headingScale'     => (float) get_option( 'arvan_heading_scale', 1.25 ),
				'layoutPreset'     => get_option( 'arvan_layout_preset', 'rounded' ),
				'borderRadius'     => (int) get_option( 'arvan_border_radius', 16 ),
				'cardElevation'    => get_option( 'arvan_card_elevation', 'subtle' ),
				'spacingDensity'   => get_option( 'arvan_spacing_density', 'normal' ),
				'containerWidth'   => get_option( 'arvan_container_width', 'standard' ),
				'headerStyle'      => get_option( 'arvan_header_style', 'glassmorphic' ),
				'textPreset'       => get_option( 'arvan_text_preset', 'standard' ),
				'heroTitle'        => get_option( 'arvan_hero_title', '' ),
				'heroDescription'  => get_option( 'arvan_hero_desc', '' ),
				'deployButtonText' => get_option( 'arvan_deploy_btn_text', '' ),
				'dashboardTitle'   => get_option( 'arvan_dashboard_title', '' ),
				'dashboardDescription' => get_option( 'arvan_dashboard_desc', '' ),
				'walletTitle'      => get_option( 'arvan_wallet_title', '' ),
				'customCss'        => get_option( 'arvan_custom_css', '' ),
				'showHourlyToggle' => (bool) get_option( 'arvan_show_hourly_toggle', 1 ),
				'customFooterText' => get_option( 'arvan_custom_footer_text', '' ),
				'supportEmail'     => get_option( 'arvan_support_email', get_option( 'admin_email' ) ),
				'supportPhone'     => get_option( 'arvan_support_phone', '021-88888888' ),
				'customTextOverrides' => json_decode( get_option( 'arvan_custom_text_overrides', '{}' ), true ),
				'initialData'    => array(
					'servers'      => $user_servers,
					'transactions' => $user_txs,
				),
				'i18n'           => array(
					'deploySuccess'   => __( 'Server deployed successfully! IP assigned:', 'arv-seller' ),
					'rebootSuccess'   => __( 'Reboot command dispatched to ArvanCloud.', 'arv-seller' ),
					'powerOnSuccess'  => __( 'Instance powered on.', 'arv-seller' ),
					'powerOffSuccess' => __( 'Instance powered off.', 'arv-seller' ),
					'deleteSuccess'   => __( 'Instance permanently deleted.', 'arv-seller' ),
					'topupSuccess'    => __( 'Wallet successfully credited!', 'arv-seller' ),
					'genericError'    => __( 'An error occurred during request.', 'arv-seller' ),
					'confirmDelete'   => __( 'Are you sure you want to permanently destroy this server?', 'arv-seller' ),
				),
			)
		);
	}

	/**
	 * Enqueue assets when widget is embedded via Gutenberg block or shortcode.
	 */
	public function enqueue_assets_for_embed() {
		$fonts_css = plugin_dir_path( __FILE__ ) . 'fonts/fonts.css';
		if ( file_exists( $fonts_css ) ) {
			wp_enqueue_style(
				'arvan-local-fonts',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'fonts/fonts.css' ),
				array(),
				$this->version,
				'all'
			);
		}

		$dist_css = plugin_dir_path( __FILE__ ) . 'dist/canvas-app.css';
		$dist_js  = plugin_dir_path( __FILE__ ) . 'dist/canvas-app.js';

		if ( file_exists( $dist_css ) && file_exists( $dist_js ) ) {
			wp_enqueue_style(
				'arvan-canvas-react-style',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'dist/canvas-app.css' ),
				array(),
				$this->version,
				'all'
			);

			wp_enqueue_script(
				'arvan-canvas-react-script',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'dist/canvas-app.js' ),
				array(),
				$this->version,
				true
			);
			$script_handle = 'arvan-canvas-react-script';
		} else {
			wp_enqueue_style(
				'arvan-canvas-style',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'css/arvan-canvas.css' ),
				array(),
				$this->version,
				'all'
			);

			wp_enqueue_script(
				'arvan-canvas-script',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'js/arvan-canvas.js' ),
				array( 'jquery' ),
				$this->version,
				true
			);
			$script_handle = 'arvan-canvas-script';
		}

		$user_id        = get_current_user_id();
		$user_logged_in = is_user_logged_in();
		$balance        = $user_logged_in ? Arvan_Wallet::get_balance( $user_id ) : 0;
		$burn_rate      = $user_logged_in ? Arvan_Wallet::get_user_burn_rate( $user_id ) : 0;
		$remaining_hrs  = $user_logged_in ? Arvan_Wallet::get_remaining_hours( $user_id ) : 0;

		$user_servers = array();
		$user_txs     = array();
		if ( $user_logged_in ) {
			$raw_servers = Arvan_Wallet::get_user_resources( $user_id );
			foreach ( $raw_servers as $res ) {
				$user_servers[] = $this->format_resource( $res );
			}

			$raw_txs = Arvan_Wallet::get_user_ledger( $user_id, 20 );
			foreach ( $raw_txs as $tx ) {
				$user_txs[] = array(
					'id'            => (int) $tx->id,
					'type'          => $tx->type,
					'amount'        => (float) $tx->amount,
					'balance_after' => (float) $tx->balance_after,
					'description'   => $tx->description,
					'created_at'    => $tx->created_at,
				);
			}
		}

		wp_localize_script(
			$script_handle,
			'arvanData',
			array(
				'ajaxUrl'        => wp_make_link_relative( admin_url( 'admin-ajax.php' ) ),
				'nonce'          => wp_create_nonce( 'arvan_frontend_nonce' ),
				'currency'       => get_option( 'arvan_currency', 'IRT' ),
				'userId'         => $user_id,
				'isLogged'       => $user_logged_in,
				'balance'        => $balance,
				'burnRate'       => $burn_rate,
				'remainingHours' => $remaining_hrs,
				'markupPct'      => (float) get_option( 'arvan_markup_percentage', 20 ),
				'fixedMargin'    => (float) get_option( 'arvan_fixed_margin', 0 ),
				'activeLang'     => Arv_Seller_i18n::get_active_language(),
				'direction'      => Arv_Seller_i18n::get_active_direction(),
				'loginUrl'       => wp_login_url( home_url( '/cloud-services/dashboard/' ) ),
				'storeName'      => get_option( 'arvan_store_name', get_bloginfo( 'name' ) . ' Cloud' ),
				'storeTagline'    => get_option( 'arvan_store_tagline', 'High Performance Cloud Computing & NVMe Storage' ),
				'logoUrl'        => get_option( 'arvan_store_logo_url', '' ),
				'faviconUrl'     => get_option( 'arvan_store_favicon_url', '' ),
				'primaryColor'   => get_option( 'arvan_brand_primary_color', '#008b8b' ),
				'secondaryColor' => get_option( 'arvan_brand_secondary_color', '#0b3a42' ),
				'fontFamily'     => get_option( 'arvan_font_family', 'vazirmatn' ),
				'customCss'      => get_option( 'arvan_custom_css', '' ),
				'showHourlyToggle' => (bool) get_option( 'arvan_show_hourly_toggle', 1 ),
				'customFooterText' => get_option( 'arvan_custom_footer_text', '' ),
				'supportEmail'   => get_option( 'arvan_support_email', get_option( 'admin_email' ) ),
				'supportPhone'   => get_option( 'arvan_support_phone', '021-88888888' ),
				'initialData'    => array(
					'servers'      => $user_servers,
					'transactions' => $user_txs,
				),
				'i18n'           => array(
					'deploySuccess'   => __( 'Server deployed successfully! IP assigned:', 'arv-seller' ),
					'rebootSuccess'   => __( 'Reboot command dispatched to ArvanCloud.', 'arv-seller' ),
					'powerOnSuccess'  => __( 'Instance powered on.', 'arv-seller' ),
					'powerOffSuccess' => __( 'Instance powered off.', 'arv-seller' ),
					'deleteSuccess'   => __( 'Instance permanently deleted.', 'arv-seller' ),
					'topupSuccess'    => __( 'Wallet successfully credited!', 'arv-seller' ),
					'genericError'    => __( 'An error occurred during request.', 'arv-seller' ),
					'confirmDelete'   => __( 'Are you sure you want to permanently destroy this server?', 'arv-seller' ),
				),
			)
		);
	}

	/**
	 * Add type="module" to React ES module script tags.
	 *
	 * @param string $tag    The <script> tag for the enqueued script.
	 * @param string $handle The script's registered handle.
	 * @param string $src    The script's source URL.
	 * @return string
	 */
	public function filter_script_loader_tag( $tag, $handle, $src ) {
		if ( 'arvan-canvas-react-script' === $handle ) {
			$rel_src = wp_make_link_relative( $src );
			return sprintf( '<script type="module" src="%s" id="%s-js"></script>' . "\n", esc_url( $rel_src ), esc_attr( $handle ) );
		}
		return $tag;
	}

	/* =========================================================================
	   AJAX Handlers: Server Deployment & Power Controls
	   ========================================================================= */

	/**
	 * AJAX handler for deploying a new Cloud Server.
	 */
	public function ajax_deploy_server() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Please sign in to deploy a cloud server.', 'arv-seller' ) ) );
		}

		$user_id = get_current_user_id();
		$name    = ! empty( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : 'cloud-srv-' . wp_rand( 100, 999 );
		$region  = ! empty( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : ( ! empty( $_POST['region'] ) ? sanitize_text_field( wp_unslash( $_POST['region'] ) ) : ( ! empty( $_POST['region_id'] ) ? sanitize_text_field( wp_unslash( $_POST['region_id'] ) ) : 'ir-thr-ba1' ) );
		$flavor  = ! empty( $_POST['flavorId'] ) ? sanitize_text_field( wp_unslash( $_POST['flavorId'] ) ) : ( ! empty( $_POST['flavor_id'] ) ? sanitize_text_field( wp_unslash( $_POST['flavor_id'] ) ) : ( ! empty( $_POST['size_id'] ) ? sanitize_text_field( wp_unslash( $_POST['size_id'] ) ) : 'g1-2-4' ) );
		$image   = ! empty( $_POST['imageId'] ) ? sanitize_text_field( wp_unslash( $_POST['imageId'] ) ) : ( ! empty( $_POST['image_id'] ) ? sanitize_text_field( wp_unslash( $_POST['image_id'] ) ) : 'ubuntu-22.04' );
		$disk    = isset( $_POST['rootVolumeSizeGigaBytes'] ) ? absint( $_POST['rootVolumeSizeGigaBytes'] ) : ( isset( $_POST['disk_size'] ) ? absint( $_POST['disk_size'] ) : 40 );
		$ssh_key = ! empty( $_POST['sshKeyName'] ) ? sanitize_text_field( wp_unslash( $_POST['sshKeyName'] ) ) : ( ! empty( $_POST['ssh_key'] ) ? sanitize_textarea_field( wp_unslash( $_POST['ssh_key'] ) ) : '' );

		// Standard base rates per flavor
		$flavor_rates = array(
			'g2-1-2-0' => array( 'cost' => 250, 'base_disk' => 25, 'name' => '1 vCPU / 2GB RAM' ),
			'g1-1-2'   => array( 'cost' => 250, 'base_disk' => 25, 'name' => '1 vCPU / 2GB RAM' ),
			'g1-2-4'   => array( 'cost' => 450, 'base_disk' => 40, 'name' => '2 vCPU / 4GB RAM' ),
			'g1-4-8'   => array( 'cost' => 890, 'base_disk' => 60, 'name' => '4 vCPU / 8GB RAM' ),
			'g1-8-16'  => array( 'cost' => 1750, 'base_disk' => 100, 'name' => '8 vCPU / 16GB RAM' ),
			'c1-4-4'   => array( 'cost' => 690, 'base_disk' => 40, 'name' => '4 vCPU / 4GB RAM' ),
			'm1-2-8'   => array( 'cost' => 650, 'base_disk' => 50, 'name' => '2 vCPU / 8GB RAM' ),
		);
		if ( ! isset( $flavor_rates[ $flavor ] ) ) {
			wp_send_json_error( array( 'message' => __( 'Selected server flavor is not available.', 'arv-seller' ) ) );
		}
		if ( ! preg_match( '/^[a-z0-9][a-z0-9-]{1,62}$/', $name ) || ! preg_match( '/^[a-z0-9-]+$/', $region ) || ! preg_match( '/^[a-zA-Z0-9._-]+$/', $image ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid server configuration.', 'arv-seller' ) ) );
		}

		$base_info   = $flavor_rates[ $flavor ];
		$base_cost   = $base_info['cost'];
		$base_disk   = $base_info['base_disk'];
		$extra_disk  = max( 0, $disk - $base_disk );
		$disk_cost   = $extra_disk * 4; // 4 IRT per GB extra
		$total_cost  = $base_cost + $disk_cost;

		// Calculate customer retail hourly price with markup
		$retail_hourly = Arvan_API_Client::calculate_price_with_markup( $total_cost );

		// Validate minimum 24 hours wallet balance requirement
		$required_balance = $retail_hourly * 24;
		$current_balance  = Arvan_Wallet::get_balance( $user_id );

		if ( $current_balance < $required_balance ) {
			wp_send_json_error(
				array(
					'insufficient_funds' => true,
					'required'           => $required_balance,
					'current'            => $current_balance,
					'message'            => sprintf(
						/* translators: 1: Required amount, 2: Current amount, 3: Currency */
						__( 'A minimum balance of %1$s %3$s (24 hours run cost) is required to deploy this server. Your balance is %2$s %3$s.', 'arv-seller' ),
						number_format( $required_balance ),
						number_format( $current_balance ),
						get_option( 'arvan_currency', 'IRT' )
					),
				)
			);
		}

		// Dispatch API Call to ArvanCloud
		$api_client = new Arvan_API_Client();
		$api_res    = $api_client->create_server(
			array(
				'availabilityZone'        => $region,
				'region'                  => $region,
				'name'                    => $name,
				'flavorId'                => $flavor,
				'size_id'                 => $flavor,
				'imageId'                 => $image,
				'image_id'                => $image,
				'rootVolumeSizeGigaBytes' => $disk,
				'disk_size'               => $disk,
				'sshKeyName'              => $ssh_key,
				'ssh_key'                 => $ssh_key,
			)
		);

		if ( is_wp_error( $api_res ) ) {
			wp_send_json_error( array( 'message' => $api_res->get_error_message() ) );
		}

		$server_data = isset( $api_res['data'] ) ? $api_res['data'] : $api_res;
		$arvan_id    = isset( $server_data['id'] ) ? sanitize_text_field( $server_data['id'] ) : '';
		if ( '' === $arvan_id ) {
			wp_send_json_error( array( 'message' => __( 'ArvanCloud did not return a server identifier. Provisioning state is unknown; contact support before retrying.', 'arv-seller' ) ) );
		}

		// Extract public IP address from v3 ipAddresses array or legacy fields
		$ip_address = '';
		if ( ! empty( $server_data['ipAddresses'] ) && is_array( $server_data['ipAddresses'] ) ) {
			foreach ( $server_data['ipAddresses'] as $ip_item ) {
				if ( ! empty( $ip_item['ipAddress'] ) ) {
					$ip_address = $ip_item['ipAddress'];
					if ( ! empty( $ip_item['isPublic'] ) ) {
						break;
					}
				}
			}
		} elseif ( ! empty( $server_data['ip_address'] ) ) {
			$ip_address = $server_data['ip_address'];
		} elseif ( ! empty( $server_data['public_ip'] ) ) {
			$ip_address = $server_data['public_ip'];
		}

		// Register in local database
		global $wpdb;
		$table_resources = $wpdb->prefix . 'arvan_resources';

		$plan_specs = wp_json_encode(
			array(
				'flavor'           => $flavor,
				'flavor_id'        => $flavor,
				'flavor_name'      => $base_info['name'],
				'image'            => $image,
				'image_id'         => $image,
				'disk_size'        => $disk,
				'availabilityZone' => $region,
				'ip_address'       => $ip_address,
			)
		);

		$resource_status = ! empty( $server_data['taskState'] ) ? 'building' : strtolower( isset( $server_data['state'] ) ? $server_data['state'] : 'building' );
		$inserted = $wpdb->insert(
			$table_resources,
			array(
				'user_id'           => $user_id,
				'service_type'      => 'ecc_instance',
				'arvan_resource_id' => $arvan_id,
				'name'              => $name,
				'region'            => $region,
				'plan_specs'        => $plan_specs,
				'hourly_cost'       => $retail_hourly,
				'status'            => $resource_status,
				'last_metered_at'   => current_time( 'mysql' ),
				'created_at'        => current_time( 'mysql' ),
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s', '%f', '%s', '%s', '%s' )
		);
		if ( false === $inserted ) {
			$api_client->delete_server( $arvan_id, $region );
			wp_send_json_error( array( 'message' => __( 'Server was created but could not be recorded locally. Cleanup was requested; contact support.', 'arv-seller' ) ) );
		}

		$resource_id = $wpdb->insert_id;

		wp_send_json_success(
			array(
				'resource_id' => $resource_id,
				'arvan_id'    => $arvan_id,
				'name'        => $name,
				'ip_address'  => $ip_address,
				'hourly_cost' => $retail_hourly,
				'status'      => $resource_status,
				'redirect'    => home_url( '/cloud-services/dashboard/' ),
				'message'     => __( 'Server provisioning accepted. Network details will appear when ready.', 'arv-seller' ),
			)
		);
	}

	/**
	 * AJAX handler for Server Power Lifecycle actions (power-on, power-off, reboot, delete).
	 */
	public function ajax_server_power() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$user_id     = get_current_user_id();
		$resource_id = isset( $_POST['resource_id'] ) ? absint( $_POST['resource_id'] ) : 0;
		$action      = isset( $_POST['power_action'] ) ? sanitize_key( $_POST['power_action'] ) : '';

		global $wpdb;
		$table_resources = $wpdb->prefix . 'arvan_resources';

		// Verify resource ownership
		$resource = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table_resources} WHERE id = %d AND user_id = %d LIMIT 1",
				$resource_id,
				$user_id
			)
		);

		if ( ! $resource ) {
			wp_send_json_error( array( 'message' => __( 'Resource not found or access denied.', 'arv-seller' ) ) );
		}

		// If balance <= 0 and user attempts to power on, block action
		$current_balance = Arvan_Wallet::get_balance( $user_id );
		if ( ( 'power-on' === $action || 'power_on' === $action ) && $current_balance <= 0 ) {
			wp_send_json_error(
				array(
					'message' => __( 'Cannot power on server: Your wallet balance is zero or negative. Please top up your wallet first.', 'arv-seller' ),
				)
			);
		}

		$api_client = new Arvan_API_Client();
		$region     = ! empty( $resource->region ) ? $resource->region : 'ir-thr-c2';
		$arvan_id   = $resource->arvan_resource_id;

		switch ( $action ) {
			case 'power-on':
			case 'power_on':
				$res = $api_client->power_on_server( $arvan_id, $region );
				$new_status = 'powering_on';
				$msg = __( 'Server power-on request accepted.', 'arv-seller' );
				break;

			case 'power-off':
			case 'power_off':
				$res = $api_client->power_off_server( $arvan_id, $region );
				$new_status = 'powering_off';
				$msg = __( 'Server power-off request accepted.', 'arv-seller' );
				break;

			case 'reboot':
				$res = $api_client->reboot_server( $arvan_id, $region );
				$new_status = 'rebooting';
				$msg = __( 'Server reboot request accepted.', 'arv-seller' );
				break;

			case 'delete':
				$res = $api_client->delete_server( $arvan_id, $region );
				if ( is_wp_error( $res ) ) {
					wp_send_json_error( array( 'message' => $res->get_error_message() ) );
				}
				$wpdb->update( $table_resources, array( 'status' => 'deleting', 'updated_at' => current_time( 'mysql' ) ), array( 'id' => $resource->id ), array( '%s', '%s' ), array( '%d' ) );
				wp_send_json_success( array( 'deleted' => false, 'status' => 'deleting', 'message' => __( 'Server termination request accepted.', 'arv-seller' ) ) );
				return;

			default:
				wp_send_json_error( array( 'message' => __( 'Invalid power action.', 'arv-seller' ) ) );
				return;
		}

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		// Update database status
		$wpdb->update(
			$table_resources,
			array(
				'status'     => $new_status,
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $resource->id ),
			array( '%s', '%s' ),
			array( '%d' )
		);

		wp_send_json_success(
			array(
				'status'  => $new_status,
				'message' => $msg,
			)
		);
	}

	/**
	 * AJAX endpoint to fetch real-time dashboard data for client synchronization.
	 */
	public function ajax_get_dashboard_data() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$user_id       = get_current_user_id();
		$balance       = Arvan_Wallet::get_balance( $user_id );
		$burn_rate     = Arvan_Wallet::get_user_burn_rate( $user_id );
		$remaining_hrs = Arvan_Wallet::get_remaining_hours( $user_id );

		$raw_servers = Arvan_Wallet::get_user_resources( $user_id );
		$user_servers = array();
		if ( ! empty( $raw_servers ) ) {
			foreach ( $raw_servers as $res ) {
				$user_servers[] = $this->format_resource( $res );
			}
		}

		wp_send_json_success(
			array(
				'balance'        => (float) $balance,
				'burnRate'       => (float) $burn_rate,
				'remainingHours' => (float) $remaining_hrs,
				'servers'        => $user_servers,
			)
		);
	}

	/* =========================================================================
	   IaaS Resource Management AJAX Handlers (Volumes, Networks, Firewalls)
	   ========================================================================= */

	/**
	 * AJAX fetch full IaaS inventory (Volumes, Networks, Firewalls).
	 */
	public function ajax_get_iaas_resources() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$region = isset( $_POST['region'] ) ? sanitize_text_field( wp_unslash( $_POST['region'] ) ) : 'ir-thr-ba1';
		$client = new Arvan_API_Client();

		$volumes   = $client->get_volumes( $region );
		$networks  = $client->get_networks( $region );
		$firewalls = $client->get_firewalls( $region );

		wp_send_json_success(
			array(
				'volumes'   => is_wp_error( $volumes ) ? array() : ( isset( $volumes['data'] ) ? $volumes['data'] : array() ),
				'networks'  => is_wp_error( $networks ) ? array() : ( isset( $networks['data'] ) ? $networks['data'] : array() ),
				'firewalls' => is_wp_error( $firewalls ) ? array() : ( isset( $firewalls['data'] ) ? $firewalls['data'] : array() ),
			)
		);
	}

	/**
	 * AJAX create volume.
	 */
	public function ajax_create_volume() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$name   = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : 'vol-' . wp_rand( 100, 999 );
		$size   = isset( $_POST['sizeGigaBytes'] ) ? absint( $_POST['sizeGigaBytes'] ) : 50;
		$region = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->create_volume(
			array(
				'name'             => $name,
				'sizeGigaBytes'    => $size,
				'availabilityZone' => $region,
			),
			$region
		);

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'volume' => $res['data'], 'message' => __( 'Storage volume created successfully.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX attach volume to server.
	 */
	public function ajax_attach_volume() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$vol_id = isset( $_POST['volumeId'] ) ? sanitize_text_field( wp_unslash( $_POST['volumeId'] ) ) : '';
		$srv_id = isset( $_POST['serverId'] ) ? sanitize_text_field( wp_unslash( $_POST['serverId'] ) ) : '';
		$region = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->attach_volume( $vol_id, $srv_id, $region );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'Volume attached to server.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX detach volume from server.
	 */
	public function ajax_detach_volume() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$vol_id = isset( $_POST['volumeId'] ) ? sanitize_text_field( wp_unslash( $_POST['volumeId'] ) ) : '';
		$region = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->detach_volume( $vol_id, $region );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'Volume detached from server.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX delete volume.
	 */
	public function ajax_delete_volume() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$vol_id = isset( $_POST['volumeId'] ) ? sanitize_text_field( wp_unslash( $_POST['volumeId'] ) ) : '';
		$region = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->delete_volume( $vol_id, $region );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'Volume deleted successfully.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX create private network.
	 */
	public function ajax_create_network() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$name   = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : 'vpc-' . wp_rand( 100, 999 );
		$cidr   = isset( $_POST['cidr'] ) ? sanitize_text_field( wp_unslash( $_POST['cidr'] ) ) : '192.168.1.0/24';
		$region = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->create_network(
			array(
				'name'             => $name,
				'cidr'             => $cidr,
				'availabilityZone' => $region,
			),
			$region
		);

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'network' => $res['data'], 'message' => __( 'Private network created.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX delete private network.
	 */
	public function ajax_delete_network() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$net_id = isset( $_POST['networkId'] ) ? sanitize_text_field( wp_unslash( $_POST['networkId'] ) ) : '';
		$region = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->delete_network( $net_id, $region );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'Private network deleted.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX create firewall.
	 */
	public function ajax_create_firewall() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$name   = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : 'fw-' . wp_rand( 100, 999 );
		$region = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->create_firewall(
			array(
				'name'             => $name,
				'availabilityZone' => $region,
			),
			$region
		);

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'firewall' => $res['data'], 'message' => __( 'Firewall created.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX add firewall rule.
	 */
	public function ajax_add_firewall_rule() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$fw_id    = isset( $_POST['firewallId'] ) ? sanitize_text_field( wp_unslash( $_POST['firewallId'] ) ) : '';
		$protocol = isset( $_POST['protocol'] ) ? sanitize_text_field( wp_unslash( $_POST['protocol'] ) ) : 'TCP';
		$port_min = isset( $_POST['portMin'] ) ? absint( $_POST['portMin'] ) : 80;
		$port_max = isset( $_POST['portMax'] ) ? absint( $_POST['portMax'] ) : 80;
		$region   = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->add_firewall_rule(
			$fw_id,
			array(
				'direction'        => 'INGRESS',
				'etherType'        => 'IPV4',
				'protocol'         => $protocol,
				'remoteIp'         => '0.0.0.0/0',
				'portMin'          => $port_min,
				'portMax'          => $port_max,
				'availabilityZone' => $region,
			),
			$region
		);

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'Firewall rule added.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX delete firewall.
	 */
	public function ajax_delete_firewall() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$fw_id  = isset( $_POST['firewallId'] ) ? sanitize_text_field( wp_unslash( $_POST['firewallId'] ) ) : '';
		$region = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->delete_firewalls( array( $fw_id ), $region );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'Firewall deleted successfully.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX create custom image from URL.
	 */
	public function ajax_create_custom_image() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$name   = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : 'image-' . wp_rand( 100, 999 );
		$url    = isset( $_POST['url'] ) ? esc_url_raw( wp_unslash( $_POST['url'] ) ) : '';
		$region = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->create_image(
			array(
				'name'             => $name,
				'url'              => $url,
				'availabilityZone' => $region,
			),
			$region
		);

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'image' => $res['data'], 'message' => __( 'Custom image creation requested.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX delete custom image.
	 */
	public function ajax_delete_custom_image() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$img_id = isset( $_POST['imageId'] ) ? sanitize_text_field( wp_unslash( $_POST['imageId'] ) ) : '';
		$region = isset( $_POST['availabilityZone'] ) ? sanitize_text_field( wp_unslash( $_POST['availabilityZone'] ) ) : 'ir-thr-ba1';

		$client = new Arvan_API_Client();
		$res    = $client->delete_images( array( $img_id ), $region );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'Custom image deleted.', 'arv-seller' ) ) );
	}

	/* =========================================================================
	   AJAX Handlers: Wallet Top-Up & Deposits
	   ========================================================================= */

	/**
	 * AJAX handler for wallet deposit and payment initiation.
	 */
	public function ajax_topup_wallet() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Please sign in to top up your wallet.', 'arv-seller' ) ) );
		}

		$user_id = get_current_user_id();
		$amount  = isset( $_POST['amount'] ) ? (float) $_POST['amount'] : 50000;

		if ( $amount < 1000 ) {
			wp_send_json_error( array( 'message' => __( 'Minimum deposit amount is 1,000 Tomans.', 'arv-seller' ) ) );
		}

		// In Sandbox / Demo Mode or Mock Gateway
		if ( (bool) get_option( 'arvan_sandbox_mode', 1 ) ) {
			$ref_id = 'TRX-' . strtoupper( substr( md5( wp_rand() . time() ), 0, 10 ) );
			$desc   = sprintf( __( 'Online Top-up via Sandbox Gateway (Ref: %s)', 'arv-seller' ), $ref_id );

			$credit_res = Arvan_Wallet::credit( $user_id, $amount, 'topup', $ref_id, $desc );

			if ( is_wp_error( $credit_res ) ) {
				wp_send_json_error( array( 'message' => $credit_res->get_error_message() ) );
			}

			wp_send_json_success(
				array(
					'success'     => true,
					'ref_id'      => $ref_id,
					'amount'      => $amount,
					'new_balance' => $credit_res['new_balance'],
					'message'     => sprintf(
						/* translators: 1: Amount, 2: Currency, 3: RefID */
						__( 'Wallet successfully credited with %1$s %2$s! RefID: %3$s', 'arv-seller' ),
						number_format( $amount ),
						get_option( 'arvan_currency', 'IRT' ),
						$ref_id
					),
				)
			);
		}

		// Live Zarinpal IPG Gateway
		$gw           = new Arvan_Gateway();
		$callback_url = add_query_arg( 'arvan_payment', 'verify', home_url( '/cloud-services/dashboard/' ) );
		$payment_res  = $gw->request_payment( $user_id, $amount, $callback_url );

		if ( is_wp_error( $payment_res ) ) {
			wp_send_json_error( array( 'message' => $payment_res->get_error_message() ) );
		}

		wp_send_json_success(
			array(
				'redirect_url' => $payment_res['payment_url'],
				'authority'    => $payment_res['authority'],
			)
		);
	}
}
