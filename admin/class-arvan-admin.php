<?php
/**
 * Admin Panel & Management Controller.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/admin
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Admin Panel & Management Controller.
 *
 * Handles admin menu registration, React TS + Tailwind + M3 Admin App,
 * API key credentials, reseller markup settings, resources oversight,
 * admin ledger adjustments, and emergency cloud actions.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/admin
 */
class Arvan_Admin {

	/**
	 * Plugin identifier.
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

		// Register Admin AJAX Handlers
		add_action( 'wp_ajax_arvan_test_api_connection', array( $this, 'ajax_test_api_connection' ) );
		add_action( 'wp_ajax_arvan_admin_save_settings', array( $this, 'ajax_admin_save_settings' ) );
		add_action( 'wp_ajax_arvan_admin_adjust_balance', array( $this, 'ajax_admin_adjust_balance' ) );
		add_action( 'wp_ajax_arvan_admin_resource_action', array( $this, 'ajax_admin_resource_action' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
	 * Enqueue admin CSS and JS.
	 *
	 * @param string $hook_suffix Current admin screen.
	 */
	public function enqueue_admin_assets( $hook_suffix ) {
		if ( false === strpos( $hook_suffix, 'arvan' ) ) {
			return;
		}

		$fonts_css = plugin_dir_path( dirname( __FILE__ ) ) . 'public/fonts/fonts.css';
		if ( file_exists( $fonts_css ) ) {
			wp_enqueue_style(
				'arvan-local-fonts',
				wp_make_link_relative( plugin_dir_url( dirname( __FILE__ ) ) . 'public/fonts/fonts.css' ),
				array(),
				$this->version,
				'all'
			);
		}

		$dist_css = plugin_dir_path( dirname( __FILE__ ) ) . 'public/dist/canvas-app.css';
		$dist_js  = plugin_dir_path( dirname( __FILE__ ) ) . 'public/dist/admin-app.js';

		if ( file_exists( $dist_css ) && file_exists( $dist_js ) ) {
			wp_enqueue_style(
				'arvan-admin-react-style',
				wp_make_link_relative( plugin_dir_url( dirname( __FILE__ ) ) . 'public/dist/canvas-app.css' ),
				array(),
				$this->version,
				'all'
			);

			wp_enqueue_script(
				'arvan-admin-react-script',
				wp_make_link_relative( plugin_dir_url( dirname( __FILE__ ) ) . 'public/dist/admin-app.js' ),
				array(),
				$this->version,
				true
			);
			$script_handle = 'arvan-admin-react-script';
		} else {
			wp_enqueue_style(
				'arvan-admin-style',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'css/arv-seller-admin.css' ),
				array(),
				$this->version,
				'all'
			);

			wp_enqueue_script(
				'arvan-admin-script',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'js/arv-seller-admin.js' ),
				array( 'jquery' ),
				$this->version,
				true
			);
			$script_handle = 'arvan-admin-script';
		}

		// Prepare Admin Data Payload
		global $wpdb;
		$stats = Arvan_Wallet::get_total_stats();

		// Fetch all customer resources
		$table_resources = $wpdb->prefix . 'arvan_resources';
		$raw_resources   = $wpdb->get_results( "SELECT r.*, u.display_name, u.user_email FROM {$table_resources} r LEFT JOIN {$wpdb->users} u ON r.user_id = u.ID ORDER BY r.id DESC" );
		$resources_list  = array();
		if ( ! empty( $raw_resources ) ) {
			foreach ( $raw_resources as $res ) {
				$resources_list[] = array(
					'id'                => (int) $res->id,
					'user_id'           => (int) $res->user_id,
					'userName'          => ! empty( $res->display_name ) ? $res->display_name : 'Customer #' . $res->user_id,
					'userEmail'         => ! empty( $res->user_email ) ? $res->user_email : '-',
					'service_type'      => ! empty( $res->service_type ) ? $res->service_type : 'ecc',
					'name'              => ! empty( $res->name ) ? $res->name : ( ! empty( $res->resource_name ) ? $res->resource_name : 'Resource #' . $res->id ),
					'arvan_resource_id' => ! empty( $res->arvan_resource_id ) ? $res->arvan_resource_id : ( ! empty( $res->arvan_uuid ) ? $res->arvan_uuid : '-' ),
					'region'            => ! empty( $res->region ) ? $res->region : 'ir-thr-ba1',
					'status'            => ! empty( $res->status ) ? $res->status : 'active',
					'hourly_rate'       => isset( $res->hourly_cost ) ? (float) $res->hourly_cost : ( isset( $res->hourly_rate ) ? (float) $res->hourly_rate : 0.0 ),
					'last_metered'      => ! empty( $res->last_metered_at ) ? $res->last_metered_at : '-',
					'created_at'        => ! empty( $res->created_at ) ? $res->created_at : '',
				);
			}
		}

		// Fetch all customer wallets
		$table_wallets = $wpdb->prefix . 'arvan_wallets';
		$raw_wallets   = $wpdb->get_results( "SELECT w.*, u.display_name, u.user_email FROM {$table_wallets} w LEFT JOIN {$wpdb->users} u ON w.user_id = u.ID ORDER BY w.balance DESC" );
		$wallets_list  = array();
		if ( ! empty( $raw_wallets ) ) {
			foreach ( $raw_wallets as $w ) {
				$wallets_list[] = array(
					'user_id'    => (int) $w->user_id,
					'userName'   => ! empty( $w->display_name ) ? $w->display_name : 'Customer #' . $w->user_id,
					'userEmail'  => ! empty( $w->user_email ) ? $w->user_email : '-',
					'balance'    => (float) $w->balance,
					'burn_rate'  => (float) Arvan_Wallet::get_user_burn_rate( (int) $w->user_id ),
					'created_at' => $w->created_at,
				);
			}
		}

		$current_page_tab = 'settings';
		if ( isset( $_GET['page'] ) ) {
			if ( 'arvan-reseller-resources' === $_GET['page'] ) {
				$current_page_tab = 'resources';
			} elseif ( 'arvan-reseller-wallets' === $_GET['page'] ) {
				$current_page_tab = 'wallets';
			} elseif ( 'arvan-reseller-customization' === $_GET['page'] ) {
				$current_page_tab = 'customization';
			}
		}

		wp_localize_script(
			$script_handle,
			'arvanAdminData',
			array(
				'ajaxUrl'    => wp_make_link_relative( admin_url( 'admin-ajax.php' ) ),
				'nonce'      => wp_create_nonce( 'arvan_admin_nonce' ),
				'activeTab'  => $current_page_tab,
				'settings'   => array(
					'apiKey'             => get_option( 'arvan_api_key', '' ),
					'sandboxMode'        => (bool) get_option( 'arvan_sandbox_mode', 1 ),
					'markupPct'          => (float) get_option( 'arvan_markup_percentage', 20 ),
					'fixedMargin'        => (float) get_option( 'arvan_fixed_margin', 0 ),
					'currency'           => get_option( 'arvan_currency', 'IRT' ),
					'defaultRegion'      => get_option( 'arvan_default_region', 'ir-thr-ba1' ),
					'storeName'          => get_option( 'arvan_store_name', get_bloginfo( 'name' ) . ' Cloud' ),
					'storeTagline'       => get_option( 'arvan_store_tagline', 'High Performance Cloud Computing & NVMe Storage' ),
					'logoUrl'            => get_option( 'arvan_store_logo_url', '' ),
					'faviconUrl'         => get_option( 'arvan_store_favicon_url', '' ),
					'masterTheme'        => get_option( 'arvan_master_theme', 'arvan-sorkhab' ),
					'brandPrimaryColor'  => get_option( 'arvan_brand_primary_color', '#008b8b' ),
					'brandSecondaryColor'=> get_option( 'arvan_brand_secondary_color', '#0b3a42' ),
					'colorSurface'       => get_option( 'arvan_color_surface', '#ffffff' ),
					'colorBackground'    => get_option( 'arvan_color_bg', '#f8fafc' ),
					'colorText'          => get_option( 'arvan_color_text', '#0f172a' ),
					'colorTextMuted'     => get_option( 'arvan_color_text_muted', '#64748b' ),
					'colorBorder'        => get_option( 'arvan_color_border', '#e2e8f0' ),
					'colorSuccess'       => get_option( 'arvan_color_success', '#10b981' ),
					'colorWarning'       => get_option( 'arvan_color_warning', '#f59e0b' ),
					'colorError'         => get_option( 'arvan_color_error', '#ef4444' ),
					'fontFamily'         => get_option( 'arvan_font_family', 'vazirmatn' ),
					'customFontName'     => get_option( 'arvan_custom_font_name', '' ),
					'customFontUrl'      => get_option( 'arvan_custom_font_url', '' ),
					'persianDigits'      => (bool) get_option( 'arvan_persian_digits', 1 ),
					'fontSizeScale'      => get_option( 'arvan_font_size_scale', 'normal' ),
					'baseFontSize'       => (int) get_option( 'arvan_base_font_size', 14 ),
					'headingScale'       => (float) get_option( 'arvan_heading_scale', 1.25 ),
					'layoutPreset'       => get_option( 'arvan_layout_preset', 'rounded' ),
					'borderRadius'       => (int) get_option( 'arvan_border_radius', 16 ),
					'cardElevation'      => get_option( 'arvan_card_elevation', 'subtle' ),
					'spacingDensity'     => get_option( 'arvan_spacing_density', 'normal' ),
					'containerWidth'     => get_option( 'arvan_container_width', 'standard' ),
					'headerStyle'        => get_option( 'arvan_header_style', 'glassmorphic' ),
					'textPreset'         => get_option( 'arvan_text_preset', 'standard' ),
					'heroTitle'          => get_option( 'arvan_hero_title', '' ),
					'heroDescription'    => get_option( 'arvan_hero_desc', '' ),
					'deployButtonText'   => get_option( 'arvan_deploy_btn_text', '' ),
					'dashboardTitle'     => get_option( 'arvan_dashboard_title', '' ),
					'dashboardDescription' => get_option( 'arvan_dashboard_desc', '' ),
					'walletTitle'        => get_option( 'arvan_wallet_title', '' ),
					'customCss'          => get_option( 'arvan_custom_css', '' ),
					'showHourlyToggle'   => (bool) get_option( 'arvan_show_hourly_toggle', 1 ),
					'customFooterText'   => get_option( 'arvan_custom_footer_text', '' ),
					'supportEmail'       => get_option( 'arvan_support_email', get_option( 'admin_email' ) ),
					'supportPhone'       => get_option( 'arvan_support_phone', '021-88888888' ),
					'customTextOverrides'=> json_decode( get_option( 'arvan_custom_text_overrides', '{}' ), true ),
				),
				'stats'      => array(
					'total_vms'           => isset( $stats['total_vms'] ) ? (int) $stats['total_vms'] : 0,
					'total_active'        => isset( $stats['total_active'] ) ? (int) $stats['total_active'] : 0,
					'total_suspended'     => isset( $stats['total_suspended'] ) ? (int) $stats['total_suspended'] : 0,
					'total_mrr'           => isset( $stats['total_mrr'] ) ? (float) $stats['total_mrr'] : 0.0,
					'total_wallets'       => isset( $stats['total_wallets'] ) ? (int) $stats['total_wallets'] : 0,
					'total_credit'        => isset( $stats['total_balance'] ) ? (float) $stats['total_balance'] : 0.0,
					'cumulative_deposits' => isset( $stats['total_deposited'] ) ? (float) $stats['total_deposited'] : ( isset( $stats['total_deposits'] ) ? (float) $stats['total_deposits'] : 0.0 ),
					'total_burn'          => isset( $stats['total_metered'] ) ? (float) $stats['total_metered'] : ( isset( $stats['total_burn'] ) ? (float) $stats['total_burn'] : 0.0 ),
				),
				'resources'  => $resources_list,
				'wallets'    => $wallets_list,
				'activeLang' => Arv_Seller_i18n::get_active_language(),
				'direction'  => Arv_Seller_i18n::get_active_direction(),
				'i18n'       => array(
					'testingApi'        => __( 'Testing connection to ArvanCloud API...', 'arv-seller' ),
					'adjustSuccess'     => __( 'Customer wallet balance updated successfully.', 'arv-seller' ),
					'actionSuccess'     => __( 'Action completed successfully.', 'arv-seller' ),
					'meteringSuccess'   => __( 'Manual metering cycle completed.', 'arv-seller' ),
					'confirmPurge'      => __( 'Are you sure you want to permanently delete this resource from ArvanCloud?', 'arv-seller' ),
					'networkError'      => __( 'Network error.', 'arv-seller' ),
					'networkTestError'  => __( 'Network error while testing connection.', 'arv-seller' ),
					'applying'          => __( 'Applying...', 'arv-seller' ),
					'applyAdjustment'   => __( 'Apply Adjustment', 'arv-seller' ),
					'runningMetering'   => __( 'Running Metering...', 'arv-seller' ),
					'runMeteringNow'    => __( 'Run Metering Cycle Now', 'arv-seller' ),
					'adjustWalletTitle' => __( 'Adjust Wallet Balance: ', 'arv-seller' ),
				),
			)
		);
	}

	/**
	 * Add type="module" to React ES module script tags in WP Admin.
	 *
	 * @param string $tag    The <script> tag for the enqueued script.
	 * @param string $handle The script's registered handle.
	 * @param string $src    The script's source URL.
	 * @return string
	 */
	public function filter_script_loader_tag( $tag, $handle, $src ) {
		if ( 'arvan-admin-react-script' === $handle ) {
			$rel_src = wp_make_link_relative( $src );
			return sprintf( '<script type="module" src="%s" id="%s-js"></script>' . "\n", esc_url( $rel_src ), esc_attr( $handle ) );
		}
		return $tag;
	}

	/**
	 * Register Admin Menus.
	 */
	public function add_admin_menu() {
		add_menu_page(
			__( 'ArvanCloud Reseller', 'arv-seller' ),
			__( 'Arvan Reseller', 'arv-seller' ),
			'manage_options',
			'arvan-reseller',
			array( $this, 'render_admin_app' ),
			'dashicons-cloud',
			56
		);

		add_submenu_page(
			'arvan-reseller',
			__( 'Settings & API', 'arv-seller' ),
			__( 'Settings', 'arv-seller' ),
			'manage_options',
			'arvan-reseller',
			array( $this, 'render_admin_app' )
		);

		add_submenu_page(
			'arvan-reseller',
			__( 'Customization & Branding', 'arv-seller' ),
			__( 'Customization', 'arv-seller' ),
			'manage_options',
			'arvan-reseller-customization',
			array( $this, 'render_admin_app' )
		);

		add_submenu_page(
			'arvan-reseller',
			__( 'Cloud Resources', 'arv-seller' ),
			__( 'All Resources', 'arv-seller' ),
			'manage_options',
			'arvan-reseller-resources',
			array( $this, 'render_admin_app' )
		);

		add_submenu_page(
			'arvan-reseller',
			__( 'Wallets & Ledger', 'arv-seller' ),
			__( 'Wallets Ledger', 'arv-seller' ),
			'manage_options',
			'arvan-reseller-wallets',
			array( $this, 'render_admin_app' )
		);
	}

	/**
	 * Register plugin settings.
	 */
	public function register_settings() {
		register_setting( 'arvan_settings_group', 'arvan_api_key' );
		register_setting( 'arvan_settings_group', 'arvan_markup_percentage' );
		register_setting( 'arvan_settings_group', 'arvan_fixed_margin' );
		register_setting( 'arvan_settings_group', 'arvan_currency' );
		register_setting( 'arvan_settings_group', 'arvan_default_region' );
		register_setting( 'arvan_settings_group', 'arvan_store_name' );
		register_setting( 'arvan_settings_group', 'arvan_store_tagline' );
		register_setting( 'arvan_settings_group', 'arvan_store_logo_url' );
		register_setting( 'arvan_settings_group', 'arvan_store_favicon_url' );
		register_setting( 'arvan_settings_group', 'arvan_master_theme' );
		register_setting( 'arvan_settings_group', 'arvan_brand_primary_color' );
		register_setting( 'arvan_settings_group', 'arvan_brand_secondary_color' );
		register_setting( 'arvan_settings_group', 'arvan_color_surface' );
		register_setting( 'arvan_settings_group', 'arvan_color_bg' );
		register_setting( 'arvan_settings_group', 'arvan_color_text' );
		register_setting( 'arvan_settings_group', 'arvan_color_text_muted' );
		register_setting( 'arvan_settings_group', 'arvan_color_border' );
		register_setting( 'arvan_settings_group', 'arvan_color_success' );
		register_setting( 'arvan_settings_group', 'arvan_color_warning' );
		register_setting( 'arvan_settings_group', 'arvan_color_error' );
		register_setting( 'arvan_settings_group', 'arvan_font_family' );
		register_setting( 'arvan_settings_group', 'arvan_custom_font_name' );
		register_setting( 'arvan_settings_group', 'arvan_custom_font_url' );
		register_setting( 'arvan_settings_group', 'arvan_persian_digits' );
		register_setting( 'arvan_settings_group', 'arvan_font_size_scale' );
		register_setting( 'arvan_settings_group', 'arvan_base_font_size' );
		register_setting( 'arvan_settings_group', 'arvan_heading_scale' );
		register_setting( 'arvan_settings_group', 'arvan_layout_preset' );
		register_setting( 'arvan_settings_group', 'arvan_border_radius' );
		register_setting( 'arvan_settings_group', 'arvan_card_elevation' );
		register_setting( 'arvan_settings_group', 'arvan_spacing_density' );
		register_setting( 'arvan_settings_group', 'arvan_container_width' );
		register_setting( 'arvan_settings_group', 'arvan_header_style' );
		register_setting( 'arvan_settings_group', 'arvan_text_preset' );
		register_setting( 'arvan_settings_group', 'arvan_hero_title' );
		register_setting( 'arvan_settings_group', 'arvan_hero_desc' );
		register_setting( 'arvan_settings_group', 'arvan_deploy_btn_text' );
		register_setting( 'arvan_settings_group', 'arvan_dashboard_title' );
		register_setting( 'arvan_settings_group', 'arvan_dashboard_desc' );
		register_setting( 'arvan_settings_group', 'arvan_wallet_title' );
		register_setting( 'arvan_settings_group', 'arvan_custom_css' );
		register_setting( 'arvan_settings_group', 'arvan_show_hourly_toggle' );
		register_setting( 'arvan_settings_group', 'arvan_custom_footer_text' );
		register_setting( 'arvan_settings_group', 'arvan_support_email' );
		register_setting( 'arvan_settings_group', 'arvan_support_phone' );
		register_setting( 'arvan_settings_group', 'arvan_sandbox_mode' );
		register_setting( 'arvan_settings_group', 'arvan_custom_text_overrides' );
		register_setting( 'arvan_settings_group', 'arvan_customization_config' );
	}

	/**
	 * Render React SPA Admin Hub.
	 */
	public function render_admin_app() {
		$primary_color   = get_option( 'arvan_brand_primary_color', '#008b8b' );
		$secondary_color = get_option( 'arvan_brand_secondary_color', '#0b3a42' );
		$color_surface   = get_option( 'arvan_color_surface', '#ffffff' );
		$color_bg        = get_option( 'arvan_color_bg', '#f8fafc' );
		$color_text      = get_option( 'arvan_color_text', '#0f172a' );
		$color_muted     = get_option( 'arvan_color_text_muted', '#64748b' );
		$color_border    = get_option( 'arvan_color_border', '#e2e8f0' );
		$border_radius   = (int) get_option( 'arvan_border_radius', 16 );
		$base_font_size  = (int) get_option( 'arvan_base_font_size', 14 );
		$container_width = get_option( 'arvan_container_width', 'standard' );
		$spacing_density = get_option( 'arvan_spacing_density', 'normal' );
		$card_elevation  = get_option( 'arvan_card_elevation', 'subtle' );

		$container_max = '1280px';
		if ( 'boxed' === $container_width ) {
			$container_max = '1120px';
		} elseif ( 'wide' === $container_width ) {
			$container_max = '1480px';
		} elseif ( 'fluid' === $container_width ) {
			$container_max = '100%';
		}

		$spacing_scale = '1';
		if ( 'compact' === $spacing_density ) {
			$spacing_scale = '0.85';
		} elseif ( 'spacious' === $spacing_density ) {
			$spacing_scale = '1.18';
		}

		$shadow1 = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
		$shadow2 = '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)';
		$shadow3 = '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.08)';
		if ( 'none' === $card_elevation ) {
			$shadow1 = 'none';
			$shadow2 = 'none';
			$shadow3 = 'none';
		} elseif ( 'elevated' === $card_elevation ) {
			$shadow1 = '0 2px 5px rgba(0,0,0,0.08)';
			$shadow2 = '0 8px 16px rgba(0,0,0,0.1)';
			$shadow3 = '0 20px 25px -5px rgba(0,0,0,0.12)';
		}
		?>
		<style id="arvan-theme-vars">
			:root, #arvan-admin-root {
				--arvan-primary: <?php echo esc_attr( $primary_color ); ?>;
				--arvan-teal: <?php echo esc_attr( $primary_color ); ?>;
				--arvan-secondary: <?php echo esc_attr( $secondary_color ); ?>;
				--arvan-teal-dark: <?php echo esc_attr( $secondary_color ); ?>;
				--arvan-surface: <?php echo esc_attr( $color_surface ); ?>;
				--arvan-bg: <?php echo esc_attr( $color_bg ); ?>;
				--arvan-text: <?php echo esc_attr( $color_text ); ?>;
				--arvan-text-muted: <?php echo esc_attr( $color_muted ); ?>;
				--arvan-border: <?php echo esc_attr( $color_border ); ?>;
				--arvan-radius: <?php echo esc_attr( $border_radius ); ?>px;
				--radius: <?php echo esc_attr( $border_radius ); ?>px;
				--arvan-font-size-base: <?php echo esc_attr( $base_font_size ); ?>px;
				--arvan-container-max: <?php echo esc_attr( $container_max ); ?>;
				--arvan-spacing-scale: <?php echo esc_attr( $spacing_scale ); ?>;
				--arvan-shadow-1: <?php echo esc_attr( $shadow1 ); ?>;
				--arvan-shadow-2: <?php echo esc_attr( $shadow2 ); ?>;
				--arvan-shadow-3: <?php echo esc_attr( $shadow3 ); ?>;
			}
			#arvan-admin-root .container, .arvan-container {
				max-width: var(--arvan-container-max) !important;
			}
		</style>
		<div class="wrap arvan-admin-react-wrap" style="margin: 20px 20px 0 0;">
			<div id="arvan-admin-root">
				<div style="background: #ffffff; color: #0f172a; padding: 40px; border-radius: 24px; text-align: center; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
					<div style="display: inline-block; width: 36px; height: 36px; border-radius: 50%; border: 3px solid var(--arvan-primary); border-top-color: transparent; animation: spin 1s linear infinite;"></div>
					<h3 style="color: var(--arvan-primary); margin-top: 16px; font-weight: 700;"><?php esc_html_e( 'Loading ArvanCloud Management Portal...', 'arv-seller' ); ?></h3>
				</div>
			</div>
		</div>
		<style>
			@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
			#wpcontent { background: #f8fafc !important; }
		</style>
		<?php
	}

	/**
	 * Render legacy settings page (fallback).
	 */
	public function render_settings_page() {
		$this->render_admin_app();
	}

	/**
	 * Render legacy resources oversight page (fallback).
	 */
	public function render_resources_page() {
		$this->render_admin_app();
	}

	/**
	 * Render legacy wallets & ledger admin page (fallback).
	 */
	public function render_wallets_page() {
		$this->render_admin_app();
	}

	/* =========================================================================
	   Admin AJAX Handlers
	   ========================================================================= */

	/**
	 * AJAX test connection to ArvanCloud API.
	 */
	public function ajax_test_api_connection() {
		check_ajax_referer( 'arvan_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'arv-seller' ) ) );
		}

		$api_key = isset( $_POST['api_key'] ) ? sanitize_text_field( wp_unslash( $_POST['api_key'] ) ) : null;
		$client  = new Arvan_API_Client( $api_key );
		$res     = $client->test_connection();

		if ( $res['success'] ) {
			wp_send_json_success( array( 'message' => $res['message'] ) );
		} else {
			wp_send_json_error( array( 'message' => $res['message'] ) );
		}
	}

	/**
	 * AJAX save reseller settings.
	 */
	public function ajax_admin_save_settings() {
		check_ajax_referer( 'arvan_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'arv-seller' ) ) );
		}

		if ( isset( $_POST['arvan_api_key'] ) ) {
			update_option( 'arvan_api_key', sanitize_text_field( wp_unslash( $_POST['arvan_api_key'] ) ) );
		}
		if ( isset( $_POST['arvan_sandbox_mode'] ) ) {
			update_option( 'arvan_sandbox_mode', '1' === $_POST['arvan_sandbox_mode'] ? 1 : 0 );
		}
		if ( isset( $_POST['arvan_markup_percentage'] ) ) {
			update_option( 'arvan_markup_percentage', (float) $_POST['arvan_markup_percentage'] );
		}
		if ( isset( $_POST['arvan_fixed_margin'] ) ) {
			update_option( 'arvan_fixed_margin', (float) $_POST['arvan_fixed_margin'] );
		}
		if ( isset( $_POST['arvan_currency'] ) ) {
			update_option( 'arvan_currency', sanitize_text_field( wp_unslash( $_POST['arvan_currency'] ) ) );
		}
		if ( isset( $_POST['arvan_default_region'] ) ) {
			update_option( 'arvan_default_region', sanitize_text_field( wp_unslash( $_POST['arvan_default_region'] ) ) );
		}
		if ( isset( $_POST['arvan_store_name'] ) ) {
			update_option( 'arvan_store_name', sanitize_text_field( wp_unslash( $_POST['arvan_store_name'] ) ) );
		}
		if ( isset( $_POST['arvan_store_tagline'] ) ) {
			update_option( 'arvan_store_tagline', sanitize_text_field( wp_unslash( $_POST['arvan_store_tagline'] ) ) );
		}
		if ( isset( $_POST['arvan_store_logo_url'] ) ) {
			update_option( 'arvan_store_logo_url', esc_url_raw( wp_unslash( $_POST['arvan_store_logo_url'] ) ) );
		}
		if ( isset( $_POST['arvan_store_favicon_url'] ) ) {
			update_option( 'arvan_store_favicon_url', esc_url_raw( wp_unslash( $_POST['arvan_store_favicon_url'] ) ) );
		}
		if ( isset( $_POST['arvan_master_theme'] ) ) {
			update_option( 'arvan_master_theme', sanitize_key( wp_unslash( $_POST['arvan_master_theme'] ) ) );
		}
		if ( isset( $_POST['arvan_brand_primary_color'] ) ) {
			$col = sanitize_hex_color( wp_unslash( $_POST['arvan_brand_primary_color'] ) );
			if ( $col ) {
				update_option( 'arvan_brand_primary_color', $col );
			}
		}
		if ( isset( $_POST['arvan_brand_secondary_color'] ) ) {
			$col2 = sanitize_hex_color( wp_unslash( $_POST['arvan_brand_secondary_color'] ) );
			if ( $col2 ) {
				update_option( 'arvan_brand_secondary_color', $col2 );
			}
		}
		if ( isset( $_POST['arvan_color_surface'] ) ) {
			$cs = sanitize_hex_color( wp_unslash( $_POST['arvan_color_surface'] ) );
			if ( $cs ) {
				update_option( 'arvan_color_surface', $cs );
			}
		}
		if ( isset( $_POST['arvan_color_bg'] ) ) {
			$cbg = sanitize_hex_color( wp_unslash( $_POST['arvan_color_bg'] ) );
			if ( $cbg ) {
				update_option( 'arvan_color_bg', $cbg );
			}
		}
		if ( isset( $_POST['arvan_color_text'] ) ) {
			$ct = sanitize_hex_color( wp_unslash( $_POST['arvan_color_text'] ) );
			if ( $ct ) {
				update_option( 'arvan_color_text', $ct );
			}
		}
		if ( isset( $_POST['arvan_color_text_muted'] ) ) {
			$ctm = sanitize_hex_color( wp_unslash( $_POST['arvan_color_text_muted'] ) );
			if ( $ctm ) {
				update_option( 'arvan_color_text_muted', $ctm );
			}
		}
		if ( isset( $_POST['arvan_color_border'] ) ) {
			$cb = sanitize_hex_color( wp_unslash( $_POST['arvan_color_border'] ) );
			if ( $cb ) {
				update_option( 'arvan_color_border', $cb );
			}
		}
		if ( isset( $_POST['arvan_color_success'] ) ) {
			$csuc = sanitize_hex_color( wp_unslash( $_POST['arvan_color_success'] ) );
			if ( $csuc ) {
				update_option( 'arvan_color_success', $csuc );
			}
		}
		if ( isset( $_POST['arvan_color_warning'] ) ) {
			$cwarn = sanitize_hex_color( wp_unslash( $_POST['arvan_color_warning'] ) );
			if ( $cwarn ) {
				update_option( 'arvan_color_warning', $cwarn );
			}
		}
		if ( isset( $_POST['arvan_color_error'] ) ) {
			$cerr = sanitize_hex_color( wp_unslash( $_POST['arvan_color_error'] ) );
			if ( $cerr ) {
				update_option( 'arvan_color_error', $cerr );
			}
		}
		if ( isset( $_POST['arvan_font_family'] ) ) {
			update_option( 'arvan_font_family', sanitize_key( wp_unslash( $_POST['arvan_font_family'] ) ) );
		}
		if ( isset( $_POST['arvan_custom_font_name'] ) ) {
			update_option( 'arvan_custom_font_name', sanitize_text_field( wp_unslash( $_POST['arvan_custom_font_name'] ) ) );
		}
		if ( isset( $_POST['arvan_custom_font_url'] ) ) {
			update_option( 'arvan_custom_font_url', esc_url_raw( wp_unslash( $_POST['arvan_custom_font_url'] ) ) );
		}
		if ( isset( $_POST['arvan_persian_digits'] ) ) {
			update_option( 'arvan_persian_digits', '1' === $_POST['arvan_persian_digits'] ? 1 : 0 );
		}
		if ( isset( $_POST['arvan_font_size_scale'] ) ) {
			update_option( 'arvan_font_size_scale', sanitize_key( wp_unslash( $_POST['arvan_font_size_scale'] ) ) );
		}
		if ( isset( $_POST['arvan_base_font_size'] ) ) {
			update_option( 'arvan_base_font_size', absint( $_POST['arvan_base_font_size'] ) );
		}
		if ( isset( $_POST['arvan_heading_scale'] ) ) {
			update_option( 'arvan_heading_scale', (float) $_POST['arvan_heading_scale'] );
		}
		if ( isset( $_POST['arvan_layout_preset'] ) ) {
			update_option( 'arvan_layout_preset', sanitize_key( wp_unslash( $_POST['arvan_layout_preset'] ) ) );
		}
		if ( isset( $_POST['arvan_border_radius'] ) ) {
			update_option( 'arvan_border_radius', absint( $_POST['arvan_border_radius'] ) );
		}
		if ( isset( $_POST['arvan_card_elevation'] ) ) {
			update_option( 'arvan_card_elevation', sanitize_key( wp_unslash( $_POST['arvan_card_elevation'] ) ) );
		}
		if ( isset( $_POST['arvan_spacing_density'] ) ) {
			update_option( 'arvan_spacing_density', sanitize_key( wp_unslash( $_POST['arvan_spacing_density'] ) ) );
		}
		if ( isset( $_POST['arvan_container_width'] ) ) {
			update_option( 'arvan_container_width', sanitize_key( wp_unslash( $_POST['arvan_container_width'] ) ) );
		}
		if ( isset( $_POST['arvan_header_style'] ) ) {
			update_option( 'arvan_header_style', sanitize_key( wp_unslash( $_POST['arvan_header_style'] ) ) );
		}
		if ( isset( $_POST['arvan_text_preset'] ) ) {
			update_option( 'arvan_text_preset', sanitize_key( wp_unslash( $_POST['arvan_text_preset'] ) ) );
		}
		if ( isset( $_POST['arvan_hero_title'] ) ) {
			update_option( 'arvan_hero_title', sanitize_text_field( wp_unslash( $_POST['arvan_hero_title'] ) ) );
		}
		if ( isset( $_POST['arvan_hero_desc'] ) ) {
			update_option( 'arvan_hero_desc', sanitize_text_field( wp_unslash( $_POST['arvan_hero_desc'] ) ) );
		}
		if ( isset( $_POST['arvan_deploy_btn_text'] ) ) {
			update_option( 'arvan_deploy_btn_text', sanitize_text_field( wp_unslash( $_POST['arvan_deploy_btn_text'] ) ) );
		}
		if ( isset( $_POST['arvan_dashboard_title'] ) ) {
			update_option( 'arvan_dashboard_title', sanitize_text_field( wp_unslash( $_POST['arvan_dashboard_title'] ) ) );
		}
		if ( isset( $_POST['arvan_dashboard_desc'] ) ) {
			update_option( 'arvan_dashboard_desc', sanitize_text_field( wp_unslash( $_POST['arvan_dashboard_desc'] ) ) );
		}
		if ( isset( $_POST['arvan_wallet_title'] ) ) {
			update_option( 'arvan_wallet_title', sanitize_text_field( wp_unslash( $_POST['arvan_wallet_title'] ) ) );
		}
		if ( isset( $_POST['arvan_custom_css'] ) ) {
			update_option( 'arvan_custom_css', wp_strip_all_tags( wp_unslash( $_POST['arvan_custom_css'] ) ) );
		}
		if ( isset( $_POST['arvan_show_hourly_toggle'] ) ) {
			update_option( 'arvan_show_hourly_toggle', '1' === $_POST['arvan_show_hourly_toggle'] || 'true' === $_POST['arvan_show_hourly_toggle'] ? 1 : 0 );
		}
		if ( isset( $_POST['arvan_custom_footer_text'] ) ) {
			update_option( 'arvan_custom_footer_text', sanitize_text_field( wp_unslash( $_POST['arvan_custom_footer_text'] ) ) );
		}
		if ( isset( $_POST['arvan_support_email'] ) ) {
			update_option( 'arvan_support_email', sanitize_email( wp_unslash( $_POST['arvan_support_email'] ) ) );
		}
		if ( isset( $_POST['arvan_support_phone'] ) ) {
			update_option( 'arvan_support_phone', sanitize_text_field( wp_unslash( $_POST['arvan_support_phone'] ) ) );
		}
		if ( isset( $_POST['arvan_custom_text_overrides'] ) ) {
			$raw_overrides = wp_unslash( $_POST['arvan_custom_text_overrides'] );
			$decoded = json_decode( $raw_overrides, true );
			if ( is_array( $decoded ) ) {
				$sanitized = array();
				foreach ( $decoded as $k => $v ) {
					$sanitized[ sanitize_text_field( $k ) ] = sanitize_text_field( $v );
				}
				update_option( 'arvan_custom_text_overrides', wp_json_encode( $sanitized ) );
			}
		}
		if ( isset( $_POST['arvan_customization_config'] ) ) {
			update_option( 'arvan_customization_config', wp_unslash( $_POST['arvan_customization_config'] ) );
		}

		wp_send_json_success( array( 'message' => __( 'Settings saved successfully.', 'arv-seller' ) ) );
	}

	/**
	 * AJAX manual balance adjustment handler.
	 */
	public function ajax_admin_adjust_balance() {
		check_ajax_referer( 'arvan_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'arv-seller' ) ) );
		}

		$user_id   = isset( $_POST['user_id'] ) ? absint( $_POST['user_id'] ) : 0;
		$type      = isset( $_POST['type'] ) ? sanitize_key( $_POST['type'] ) : 'credit';
		$amount    = isset( $_POST['amount'] ) ? (float) $_POST['amount'] : 0;
		$reason    = isset( $_POST['reason'] ) ? sanitize_textarea_field( wp_unslash( $_POST['reason'] ) ) : 'Admin adjustment';
		$admin_id  = get_current_user_id();

		if ( ! $user_id || $amount <= 0 ) {
			wp_send_json_error( array( 'message' => __( 'Invalid user ID or amount.', 'arv-seller' ) ) );
		}

		$res = Arvan_Wallet::admin_adjust_balance( $user_id, $type, $amount, $reason, $admin_id );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success(
			array(
				'user_id'     => $user_id,
				'new_balance' => $res['new_balance'],
				'message'     => __( 'Balance adjusted successfully.', 'arv-seller' ),
			)
		);
	}

	/**
	 * AJAX admin emergency action (Force Power Off, Force Delete, Trigger Metering).
	 */
	public function ajax_admin_resource_action() {
		check_ajax_referer( 'arvan_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'arv-seller' ) ) );
		}

		$action = isset( $_POST['resource_action'] ) ? sanitize_key( $_POST['resource_action'] ) : '';

		if ( 'trigger_metering' === $action ) {
			$summary = Arvan_Metering::run_manual_cycle();
			wp_send_json_success(
				array(
					'message' => sprintf(
						/* translators: 1: Processed count, 2: Debited amount, 3: Suspended count */
						__( 'Metering cycle finished: Processed %1$d resources, debited %2$s Tomans, suspended %3$d accounts.', 'arv-seller' ),
						$summary['processed'],
						number_format( $summary['debited'] ),
						$summary['suspended']
					),
				)
			);
		}

		$res_id = isset( $_POST['resource_id'] ) ? absint( $_POST['resource_id'] ) : 0;
		global $wpdb;
		$table_resources = $wpdb->prefix . 'arvan_resources';
		$res = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_resources} WHERE id = %d LIMIT 1", $res_id ) );

		if ( ! $res ) {
			wp_send_json_error( array( 'message' => __( 'Resource not found.', 'arv-seller' ) ) );
		}

		$api_client = new Arvan_API_Client();
		$region     = ! empty( $res->region ) ? $res->region : 'ir-thr-c2';

		if ( 'force_power_off' === $action || 'power_off' === $action ) {
			$api_client->power_off_server( $res->arvan_resource_id, $region );
			$wpdb->update( $table_resources, array( 'status' => 'stopped' ), array( 'id' => $res->id ), array( '%s' ), array( '%d' ) );
			wp_send_json_success( array( 'status' => 'stopped', 'message' => __( 'Instance powered off by administrator.', 'arv-seller' ) ) );
		} elseif ( 'power_on' === $action ) {
			$api_client->power_on_server( $res->arvan_resource_id, $region );
			$wpdb->update( $table_resources, array( 'status' => 'active' ), array( 'id' => $res->id ), array( '%s' ), array( '%d' ) );
			wp_send_json_success( array( 'status' => 'active', 'message' => __( 'Instance powered on by administrator.', 'arv-seller' ) ) );
		} elseif ( 'force_delete' === $action ) {
			$api_client->delete_server( $res->arvan_resource_id, $region );
			$wpdb->delete( $table_resources, array( 'id' => $res->id ), array( '%d' ) );
			wp_send_json_success( array( 'deleted' => true, 'message' => __( 'Instance purged by administrator.', 'arv-seller' ) ) );
		} else {
			wp_send_json_error( array( 'message' => __( 'Unknown admin action.', 'arv-seller' ) ) );
		}
	}
}
