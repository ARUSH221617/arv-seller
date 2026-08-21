<?php
/**
 * WordPress Gutenberg Blocks & Shortcodes Controller.
 *
 * Registers native Gutenberg block editor widgets and universal shortcodes
 * allowing site administrators to embed the ArvanCloud Server Configurator
 * and Customer Dashboard on any page or post.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Arvan_Blocks
 */
class Arvan_Blocks {

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
	 * Constructor.
	 *
	 * @param string $plugin_name Plugin identifier.
	 * @param string $version     Plugin version.
	 */
	public function __construct( $plugin_name = 'arv-seller', $version = '1.0.0' ) {
		$this->plugin_name = $plugin_name;
		$this->version     = $version;
	}

	/**
	 * Initialize hooks for Gutenberg blocks and shortcodes.
	 */
	public function init() {
		// Register Gutenberg Block Category
		add_filter( 'block_categories_all', array( $this, 'register_block_category' ), 10, 2 );

		// Register Blocks
		add_action( 'init', array( $this, 'register_gutenberg_blocks' ) );

		// Register Universal Shortcodes
		add_shortcode( 'arvan_server_configurator', array( $this, 'render_server_configurator_shortcode' ) );
		add_shortcode( 'arvan_customer_dashboard', array( $this, 'render_customer_dashboard_shortcode' ) );
		add_shortcode( 'arvan_cloud_services', array( $this, 'render_server_configurator_shortcode' ) );
	}

	/**
	 * Register custom Gutenberg block category for ArvanCloud.
	 *
	 * @param array                   $categories Existing block categories.
	 * @param WP_Block_Editor_Context $context    Current block editor context.
	 * @return array
	 */
	public function register_block_category( $categories, $context ) {
		return array_merge(
			$categories,
			array(
				array(
					'slug'  => 'arvan-cloud',
					'title' => __( 'ArvanCloud Services', 'arv-seller' ),
					'icon'  => 'cloud',
				),
			)
		);
	}

	/**
	 * Register native Gutenberg block types.
	 */
	public function register_gutenberg_blocks() {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		// Register block editor script
		$block_js_path = plugin_dir_path( dirname( __FILE__ ) ) . 'public/js/arvan-gutenberg-block.js';
		$block_js_url  = plugin_dir_url( dirname( __FILE__ ) ) . 'public/js/arvan-gutenberg-block.js';

		if ( file_exists( $block_js_path ) ) {
			wp_register_script(
				'arvan-gutenberg-block-editor',
				wp_make_link_relative( $block_js_url ),
				array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n' ),
				$this->version,
				true
			);

			wp_localize_script(
				'arvan-gutenberg-block-editor',
				'arvanBlockData',
				array(
					'regions'              => array(
						array( 'label' => 'Tehran - Forough (ir-thr-c2)', 'value' => 'ir-thr-c2' ),
						array( 'label' => 'Tehran - Shahryar (ir-thr-sh1)', 'value' => 'ir-thr-sh1' ),
						array( 'label' => 'Tabriz - Northwest (ir-tbz-dc1)', 'value' => 'ir-tbz-dc1' ),
					),
					'defaultRegion'        => get_option( 'arvan_default_region', 'ir-thr-c2' ),
					'primaryColor'         => get_option( 'arvan_brand_primary_color', '#008b8b' ),
					'secondaryColor'       => get_option( 'arvan_brand_secondary_color', '#0b3a42' ),
					'colorSurface'         => get_option( 'arvan_color_surface', '#ffffff' ),
					'colorBackground'      => get_option( 'arvan_color_bg', '#f8fafc' ),
					'colorText'            => get_option( 'arvan_color_text', '#0f172a' ),
					'colorBorder'          => get_option( 'arvan_color_border', '#e2e8f0' ),
					'borderRadius'         => (int) get_option( 'arvan_border_radius', 16 ),
					'cardElevation'        => get_option( 'arvan_card_elevation', 'subtle' ),
					'spacingDensity'       => get_option( 'arvan_spacing_density', 'normal' ),
					'containerWidth'       => get_option( 'arvan_container_width', 'standard' ),
					'fontFamily'           => get_option( 'arvan_font_family', 'vazirmatn' ),
					'baseFontSize'         => (int) get_option( 'arvan_base_font_size', 14 ),
					'persianDigits'        => (bool) get_option( 'arvan_persian_digits', 1 ),
					'storeName'            => get_option( 'arvan_store_name', get_bloginfo( 'name' ) . ' Cloud' ),
					'heroTitle'            => get_option( 'arvan_hero_title', '' ),
					'heroDesc'             => get_option( 'arvan_hero_desc', '' ),
					'deployBtnText'        => get_option( 'arvan_deploy_btn_text', '' ),
					'dashboardTitle'       => get_option( 'arvan_dashboard_title', '' ),
					'dashboardDesc'        => get_option( 'arvan_dashboard_desc', '' ),
					'walletTitle'          => get_option( 'arvan_wallet_title', '' ),
					'i18n'                 => array(
						'title'             => __( 'ArvanCloud Server Configurator', 'arv-seller' ),
						'description'       => __( 'Interactive Cloud Server sizing, pricing calculator, and deployment widget.', 'arv-seller' ),
						'dashboardTitle'    => __( 'ArvanCloud Customer Dashboard', 'arv-seller' ),
						'dashboardDesc'     => __( 'Customer cloud server management and wallet billing dashboard.', 'arv-seller' ),
						'blockSettings'     => __( 'Server Configurator Settings', 'arv-seller' ),
						'selectRegion'      => __( 'Default Datacenter Region', 'arv-seller' ),
						'accentColor'       => __( 'Brand Accent Color', 'arv-seller' ),
						'secondaryColor'    => __( 'Secondary / Dark Accent', 'arv-seller' ),
						'colorSurface'      => __( 'Surface / Card Background', 'arv-seller' ),
						'colorBackground'   => __( 'App Canvas Background', 'arv-seller' ),
						'colorText'         => __( 'Primary Text Color', 'arv-seller' ),
						'colorBorder'       => __( 'Border Color', 'arv-seller' ),
						'borderRadius'      => __( 'Border Radius (px)', 'arv-seller' ),
						'cardElevation'     => __( 'Card Elevation & Shadows', 'arv-seller' ),
						'spacingDensity'    => __( 'Spacing Density', 'arv-seller' ),
						'containerWidth'    => __( 'Container Max Width', 'arv-seller' ),
						'fontFamily'        => __( 'Font Family Stack', 'arv-seller' ),
						'baseFontSize'      => __( 'Base Font Size (px)', 'arv-seller' ),
						'persianDigits'     => __( 'Convert Digits to Persian (۰-۹)', 'arv-seller' ),
						'showHourlyPrice'   => __( 'Show Hourly & Monthly Rates', 'arv-seller' ),
						'previewNotice'     => __( 'Live ArvanCloud Server Configurator will render here on the frontend.', 'arv-seller' ),
						'previewSubtitle'   => __( 'Instant VM Provisioning • NVMe Storage • Pay-As-You-Go', 'arv-seller' ),
					),
				)
			);
		}

		// Register Server Configurator Block
		register_block_type(
			'arvan/server-configurator',
			array(
				'editor_script'   => 'arvan-gutenberg-block-editor',
				'render_callback' => array( $this, 'render_server_configurator_block' ),
				'attributes'      => array(
					'defaultRegion'      => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_default_region', 'ir-thr-c2' ),
					),
					'defaultFlavor'      => array(
						'type'    => 'string',
						'default' => 'g1-2-4',
					),
					'defaultImage'       => array(
						'type'    => 'string',
						'default' => 'ubuntu-22.04',
					),
					'defaultDisk'        => array(
						'type'    => 'number',
						'default' => 40,
					),
					'accentColor'        => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_brand_primary_color', '#008b8b' ),
					),
					'secondaryColor'     => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_brand_secondary_color', '#0b3a42' ),
					),
					'colorSurface'       => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_color_surface', '#ffffff' ),
					),
					'colorBackground'    => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_color_bg', '#f8fafc' ),
					),
					'colorText'          => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_color_text', '#0f172a' ),
					),
					'colorBorder'        => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_color_border', '#e2e8f0' ),
					),
					'borderRadius'       => array(
						'type'    => 'number',
						'default' => (int) get_option( 'arvan_border_radius', 16 ),
					),
					'cardElevation'      => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_card_elevation', 'subtle' ),
					),
					'spacingDensity'     => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_spacing_density', 'normal' ),
					),
					'containerWidth'     => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_container_width', 'standard' ),
					),
					'fontFamily'         => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_font_family', 'vazirmatn' ),
					),
					'baseFontSize'       => array(
						'type'    => 'number',
						'default' => (int) get_option( 'arvan_base_font_size', 14 ),
					),
					'persianDigits'      => array(
						'type'    => 'boolean',
						'default' => (bool) get_option( 'arvan_persian_digits', 1 ),
					),
					'ctaText'            => array(
						'type'    => 'string',
						'default' => '',
					),
					'customTitle'        => array(
						'type'    => 'string',
						'default' => '',
					),
					'customTagline'      => array(
						'type'    => 'string',
						'default' => '',
					),
					'showHeader'         => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'showRegionSelector' => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'showStorageSlider'  => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'showOsSelector'     => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'showHourlyPrice'    => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'customCss'          => array(
						'type'    => 'string',
						'default' => '',
					),
				),
			)
		);

		// Register Customer Dashboard Block
		register_block_type(
			'arvan/customer-dashboard',
			array(
				'editor_script'   => 'arvan-gutenberg-block-editor',
				'render_callback' => array( $this, 'render_customer_dashboard_block' ),
				'attributes'      => array(
					'showBalanceCard'     => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'accentColor'         => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_brand_primary_color', '#008b8b' ),
					),
					'secondaryColor'      => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_brand_secondary_color', '#0b3a42' ),
					),
					'colorSurface'        => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_color_surface', '#ffffff' ),
					),
					'colorBackground'     => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_color_bg', '#f8fafc' ),
					),
					'colorText'           => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_color_text', '#0f172a' ),
					),
					'colorBorder'         => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_color_border', '#e2e8f0' ),
					),
					'borderRadius'        => array(
						'type'    => 'number',
						'default' => (int) get_option( 'arvan_border_radius', 16 ),
					),
					'cardElevation'       => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_card_elevation', 'subtle' ),
					),
					'spacingDensity'      => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_spacing_density', 'normal' ),
					),
					'containerWidth'      => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_container_width', 'standard' ),
					),
					'fontFamily'          => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_font_family', 'vazirmatn' ),
					),
					'baseFontSize'        => array(
						'type'    => 'number',
						'default' => (int) get_option( 'arvan_base_font_size', 14 ),
					),
					'persianDigits'       => array(
						'type'    => 'boolean',
						'default' => (bool) get_option( 'arvan_persian_digits', 1 ),
					),
					'dashboardTitle'      => array(
						'type'    => 'string',
						'default' => '',
					),
					'dashboardDescription'=> array(
						'type'    => 'string',
						'default' => '',
					),
					'walletTitle'         => array(
						'type'    => 'string',
						'default' => '',
					),
					'customCss'           => array(
						'type'    => 'string',
						'default' => '',
					),
				),
			)
		);
	}

	/**
	 * Render callback for Gutenberg Server Configurator block.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Block inner content.
	 * @return string HTML output.
	 */
	public function render_server_configurator_block( $attributes = array(), $content = '' ) {
		return $this->render_embed_container( 'server', $attributes );
	}

	/**
	 * Render callback for Gutenberg Customer Dashboard block.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Block inner content.
	 * @return string HTML output.
	 */
	public function render_customer_dashboard_block( $attributes = array(), $content = '' ) {
		return $this->render_embed_container( 'dashboard', $attributes );
	}

	/**
	 * Render shortcode: [arvan_server_configurator]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string HTML output.
	 */
	public function render_server_configurator_shortcode( $atts = array() ) {
		$attributes = shortcode_atts(
			array(
				'region'           => get_option( 'arvan_default_region', 'ir-thr-c2' ),
				'flavor'           => 'g1-2-4',
				'image'            => 'ubuntu-22.04',
				'disk'             => 40,
				'color'            => get_option( 'arvan_brand_primary_color', '#008b8b' ),
				'secondary_color'  => get_option( 'arvan_brand_secondary_color', '#0b3a42' ),
				'color_surface'    => get_option( 'arvan_color_surface', '#ffffff' ),
				'color_bg'         => get_option( 'arvan_color_bg', '#f8fafc' ),
				'color_text'       => get_option( 'arvan_color_text', '#0f172a' ),
				'color_border'     => get_option( 'arvan_color_border', '#e2e8f0' ),
				'border_radius'    => (int) get_option( 'arvan_border_radius', 16 ),
				'card_elevation'   => get_option( 'arvan_card_elevation', 'subtle' ),
				'spacing_density'  => get_option( 'arvan_spacing_density', 'normal' ),
				'container_width'  => get_option( 'arvan_container_width', 'standard' ),
				'font_family'      => get_option( 'arvan_font_family', 'vazirmatn' ),
				'base_font_size'   => (int) get_option( 'arvan_base_font_size', 14 ),
				'persian_digits'   => (bool) get_option( 'arvan_persian_digits', 1 ),
				'cta_text'         => '',
				'title'            => '',
				'tagline'          => '',
				'show_header'      => '1',
				'show_region'      => '1',
				'show_storage'     => '1',
				'show_os'          => '1',
				'show_hourly'      => '1',
				'custom_css'       => '',
			),
			$atts,
			'arvan_server_configurator'
		);

		return $this->render_embed_container( 'server', $attributes );
	}

	/**
	 * Render shortcode: [arvan_customer_dashboard]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string HTML output.
	 */
	public function render_customer_dashboard_shortcode( $atts = array() ) {
		$attributes = shortcode_atts(
			array(
				'color'            => get_option( 'arvan_brand_primary_color', '#008b8b' ),
				'secondary_color'  => get_option( 'arvan_brand_secondary_color', '#0b3a42' ),
				'color_surface'    => get_option( 'arvan_color_surface', '#ffffff' ),
				'color_bg'         => get_option( 'arvan_color_bg', '#f8fafc' ),
				'color_text'       => get_option( 'arvan_color_text', '#0f172a' ),
				'color_border'     => get_option( 'arvan_color_border', '#e2e8f0' ),
				'border_radius'    => (int) get_option( 'arvan_border_radius', 16 ),
				'card_elevation'   => get_option( 'arvan_card_elevation', 'subtle' ),
				'spacing_density'  => get_option( 'arvan_spacing_density', 'normal' ),
				'container_width'  => get_option( 'arvan_container_width', 'standard' ),
				'font_family'      => get_option( 'arvan_font_family', 'vazirmatn' ),
				'base_font_size'   => (int) get_option( 'arvan_base_font_size', 14 ),
				'persian_digits'   => (bool) get_option( 'arvan_persian_digits', 1 ),
				'dashboard_title'  => '',
				'dashboard_desc'   => '',
				'wallet_title'     => '',
				'custom_css'       => '',
			),
			$atts,
			'arvan_customer_dashboard'
		);

		return $this->render_embed_container( 'dashboard', $attributes );
	}

	/**
	 * Generate container and enqueue frontend React SPA assets for embedded widget.
	 *
	 * @param string $view       Target view ('server' | 'dashboard').
	 * @param array  $attributes Widget configuration attributes.
	 * @return string
	 */
	private function render_embed_container( $view = 'server', $attributes = array() ) {
		// Enqueue public assets if not already enqueued
		$public = new Arvan_Public( $this->plugin_name, $this->version );
		$public->enqueue_assets_for_embed();

		$direction     = Arv_Seller_i18n::get_active_direction();
		$active_lang   = Arv_Seller_i18n::get_active_language();
		
		// Colors
		$primary_color   = ! empty( $attributes['accentColor'] ) ? sanitize_hex_color( $attributes['accentColor'] ) : ( ! empty( $attributes['color'] ) ? sanitize_hex_color( $attributes['color'] ) : get_option( 'arvan_brand_primary_color', '#008b8b' ) );
		$secondary_color = ! empty( $attributes['secondaryColor'] ) ? sanitize_hex_color( $attributes['secondaryColor'] ) : ( ! empty( $attributes['secondary_color'] ) ? sanitize_hex_color( $attributes['secondary_color'] ) : get_option( 'arvan_brand_secondary_color', '#0b3a42' ) );
		$color_surface   = ! empty( $attributes['colorSurface'] ) ? sanitize_hex_color( $attributes['colorSurface'] ) : ( ! empty( $attributes['color_surface'] ) ? sanitize_hex_color( $attributes['color_surface'] ) : get_option( 'arvan_color_surface', '#ffffff' ) );
		$color_bg        = ! empty( $attributes['colorBackground'] ) ? sanitize_hex_color( $attributes['colorBackground'] ) : ( ! empty( $attributes['color_bg'] ) ? sanitize_hex_color( $attributes['color_bg'] ) : get_option( 'arvan_color_bg', '#f8fafc' ) );
		$color_text      = ! empty( $attributes['colorText'] ) ? sanitize_hex_color( $attributes['colorText'] ) : ( ! empty( $attributes['color_text'] ) ? sanitize_hex_color( $attributes['color_text'] ) : get_option( 'arvan_color_text', '#0f172a' ) );
		$color_border    = ! empty( $attributes['colorBorder'] ) ? sanitize_hex_color( $attributes['colorBorder'] ) : ( ! empty( $attributes['color_border'] ) ? sanitize_hex_color( $attributes['color_border'] ) : get_option( 'arvan_color_border', '#e2e8f0' ) );
		
		// Layout & Typography
		$border_radius   = isset( $attributes['borderRadius'] ) ? (int) $attributes['borderRadius'] : ( isset( $attributes['border_radius'] ) ? (int) $attributes['border_radius'] : (int) get_option( 'arvan_border_radius', 16 ) );
		$base_font_size  = isset( $attributes['baseFontSize'] ) ? (int) $attributes['baseFontSize'] : ( isset( $attributes['base_font_size'] ) ? (int) $attributes['base_font_size'] : (int) get_option( 'arvan_base_font_size', 14 ) );
		$font_family     = ! empty( $attributes['fontFamily'] ) ? sanitize_key( $attributes['fontFamily'] ) : ( ! empty( $attributes['font_family'] ) ? sanitize_key( $attributes['font_family'] ) : get_option( 'arvan_font_family', 'vazirmatn' ) );
		$persian_digits  = isset( $attributes['persianDigits'] ) ? ( $attributes['persianDigits'] ? '1' : '0' ) : ( isset( $attributes['persian_digits'] ) && ( '0' === $attributes['persian_digits'] || 'false' === $attributes['persian_digits'] ) ? '0' : '1' );
		$container_width = ! empty( $attributes['containerWidth'] ) ? sanitize_key( $attributes['containerWidth'] ) : ( ! empty( $attributes['container_width'] ) ? sanitize_key( $attributes['container_width'] ) : get_option( 'arvan_container_width', 'standard' ) );
		$spacing_density = ! empty( $attributes['spacingDensity'] ) ? sanitize_key( $attributes['spacingDensity'] ) : ( ! empty( $attributes['spacing_density'] ) ? sanitize_key( $attributes['spacing_density'] ) : get_option( 'arvan_spacing_density', 'normal' ) );
		$card_elevation  = ! empty( $attributes['cardElevation'] ) ? sanitize_key( $attributes['cardElevation'] ) : ( ! empty( $attributes['card_elevation'] ) ? sanitize_key( $attributes['card_elevation'] ) : get_option( 'arvan_card_elevation', 'subtle' ) );
		
		$custom_css      = ! empty( $attributes['customCss'] ) ? $attributes['customCss'] : ( ! empty( $attributes['custom_css'] ) ? $attributes['custom_css'] : get_option( 'arvan_custom_css', '' ) );

		// Extract configuration attributes with fallback support for both Gutenberg camelCase and Shortcode snake_case
		$region          = ! empty( $attributes['defaultRegion'] ) ? esc_attr( $attributes['defaultRegion'] ) : ( ! empty( $attributes['region'] ) ? esc_attr( $attributes['region'] ) : 'ir-thr-c2' );
		$flavor          = ! empty( $attributes['defaultFlavor'] ) ? esc_attr( $attributes['defaultFlavor'] ) : ( ! empty( $attributes['flavor'] ) ? esc_attr( $attributes['flavor'] ) : 'g1-2-4' );
		$image           = ! empty( $attributes['defaultImage'] ) ? esc_attr( $attributes['defaultImage'] ) : ( ! empty( $attributes['image'] ) ? esc_attr( $attributes['image'] ) : 'ubuntu-22.04' );
		$disk            = isset( $attributes['defaultDisk'] ) ? (int) $attributes['defaultDisk'] : ( isset( $attributes['disk'] ) ? (int) $attributes['disk'] : 40 );
		$cta_text        = ! empty( $attributes['ctaText'] ) ? esc_attr( $attributes['ctaText'] ) : ( ! empty( $attributes['cta_text'] ) ? esc_attr( $attributes['cta_text'] ) : '' );
		$custom_title    = ! empty( $attributes['customTitle'] ) ? esc_attr( $attributes['customTitle'] ) : ( ! empty( $attributes['title'] ) ? esc_attr( $attributes['title'] ) : '' );
		$custom_tag      = ! empty( $attributes['customTagline'] ) ? esc_attr( $attributes['customTagline'] ) : ( ! empty( $attributes['tagline'] ) ? esc_attr( $attributes['tagline'] ) : '' );
		$dashboard_title = ! empty( $attributes['dashboardTitle'] ) ? esc_attr( $attributes['dashboardTitle'] ) : ( ! empty( $attributes['dashboard_title'] ) ? esc_attr( $attributes['dashboard_title'] ) : '' );
		$dashboard_desc  = ! empty( $attributes['dashboardDescription'] ) ? esc_attr( $attributes['dashboardDescription'] ) : ( ! empty( $attributes['dashboard_desc'] ) ? esc_attr( $attributes['dashboard_desc'] ) : '' );
		$wallet_title    = ! empty( $attributes['walletTitle'] ) ? esc_attr( $attributes['walletTitle'] ) : ( ! empty( $attributes['wallet_title'] ) ? esc_attr( $attributes['wallet_title'] ) : '' );
		$show_header     = isset( $attributes['showHeader'] ) ? ( $attributes['showHeader'] ? '1' : '0' ) : ( isset( $attributes['show_header'] ) && ( '0' === $attributes['show_header'] || 'false' === $attributes['show_header'] ) ? '0' : '1' );
		$show_region     = isset( $attributes['showRegionSelector'] ) ? ( $attributes['showRegionSelector'] ? '1' : '0' ) : ( isset( $attributes['show_region'] ) && ( '0' === $attributes['show_region'] || 'false' === $attributes['show_region'] ) ? '0' : '1' );
		$show_storage    = isset( $attributes['showStorageSlider'] ) ? ( $attributes['showStorageSlider'] ? '1' : '0' ) : ( isset( $attributes['show_storage'] ) && ( '0' === $attributes['show_storage'] || 'false' === $attributes['show_storage'] ) ? '0' : '1' );
		$show_os         = isset( $attributes['showOsSelector'] ) ? ( $attributes['showOsSelector'] ? '1' : '0' ) : ( isset( $attributes['show_os'] ) && ( '0' === $attributes['show_os'] || 'false' === $attributes['show_os'] ) ? '0' : '1' );
		$show_hourly     = isset( $attributes['showHourlyPrice'] ) ? ( $attributes['showHourlyPrice'] ? '1' : '0' ) : ( isset( $attributes['show_hourly'] ) && ( '0' === $attributes['show_hourly'] || 'false' === $attributes['show_hourly'] ) ? '0' : '1' );

		// Dimension mapping
		$container_width_map = array(
			'boxed'    => '1024px',
			'standard' => '1200px',
			'wide'     => '1400px',
			'fluid'    => '100%',
		);
		$container_max = isset( $container_width_map[ $container_width ] ) ? $container_width_map[ $container_width ] : '1200px';

		$density_map = array(
			'compact'  => '0.85',
			'normal'   => '1',
			'spacious' => '1.2',
		);
		$spacing_scale = isset( $density_map[ $spacing_density ] ) ? $density_map[ $spacing_density ] : '1';

		$elevation_map = array(
			'none'     => array( 'none', 'none', 'none' ),
			'subtle'   => array( '0 1px 3px rgba(0,0,0,0.05)', '0 4px 6px -1px rgba(0,0,0,0.05)', '0 10px 15px -3px rgba(0,0,0,0.05)' ),
			'elevated' => array( '0 4px 12px rgba(0,0,0,0.08)', '0 12px 24px -4px rgba(0,0,0,0.1)', '0 20px 30px -6px rgba(0,0,0,0.12)' ),
			'glow'     => array( '0 4px 20px ' . $primary_color . '25', '0 8px 30px ' . $primary_color . '35', '0 16px 40px ' . $primary_color . '45' ),
		);
		$shadows = isset( $elevation_map[ $card_elevation ] ) ? $elevation_map[ $card_elevation ] : $elevation_map['subtle'];

		ob_start();
		?>
		<div class="arvan-embed-wrapper is-<?php echo esc_attr( $direction ); ?> lang-<?php echo esc_attr( $active_lang ); ?>" style="
			--arvan-primary: <?php echo esc_attr( $primary_color ); ?>;
			--arvan-brand-primary: <?php echo esc_attr( $primary_color ); ?>;
			--arvan-teal: <?php echo esc_attr( $primary_color ); ?>;
			--arvan-secondary: <?php echo esc_attr( $secondary_color ); ?>;
			--arvan-teal-dark: <?php echo esc_attr( $secondary_color ); ?>;
			--arvan-surface: <?php echo esc_attr( $color_surface ); ?>;
			--arvan-bg: <?php echo esc_attr( $color_bg ); ?>;
			--arvan-text: <?php echo esc_attr( $color_text ); ?>;
			--arvan-border: <?php echo esc_attr( $color_border ); ?>;
			--arvan-radius: <?php echo esc_attr( (string) $border_radius ); ?>px;
			--radius: <?php echo esc_attr( (string) $border_radius ); ?>px;
			--arvan-font-size-base: <?php echo esc_attr( (string) $base_font_size ); ?>px;
			--arvan-container-max: <?php echo esc_attr( $container_max ); ?>;
			--arvan-spacing-scale: <?php echo esc_attr( $spacing_scale ); ?>;
			--arvan-shadow-1: <?php echo esc_attr( $shadows[0] ); ?>;
			--arvan-shadow-2: <?php echo esc_attr( $shadows[1] ); ?>;
			--arvan-shadow-3: <?php echo esc_attr( $shadows[2] ); ?>;
			width: 100%;
			max-width: var(--arvan-container-max);
			margin: 0 auto;
		">
			<?php if ( ! empty( $custom_css ) ) : ?>
				<style><?php echo wp_strip_all_tags( $custom_css ); ?></style>
			<?php endif; ?>
			<div id="arvan-cloud-app"
				data-embedded="true"
				data-view="<?php echo esc_attr( $view ); ?>"
				data-region="<?php echo esc_attr( $region ); ?>"
				data-flavor="<?php echo esc_attr( $flavor ); ?>"
				data-image="<?php echo esc_attr( $image ); ?>"
				data-disk="<?php echo esc_attr( (string) $disk ); ?>"
				data-accent-color="<?php echo esc_attr( $primary_color ); ?>"
				data-secondary-color="<?php echo esc_attr( $secondary_color ); ?>"
				data-color-surface="<?php echo esc_attr( $color_surface ); ?>"
				data-color-bg="<?php echo esc_attr( $color_bg ); ?>"
				data-color-text="<?php echo esc_attr( $color_text ); ?>"
				data-color-border="<?php echo esc_attr( $color_border ); ?>"
				data-border-radius="<?php echo esc_attr( (string) $border_radius ); ?>"
				data-card-elevation="<?php echo esc_attr( $card_elevation ); ?>"
				data-spacing-density="<?php echo esc_attr( $spacing_density ); ?>"
				data-container-width="<?php echo esc_attr( $container_width ); ?>"
				data-font-family="<?php echo esc_attr( $font_family ); ?>"
				data-base-font-size="<?php echo esc_attr( (string) $base_font_size ); ?>"
				data-persian-digits="<?php echo esc_attr( $persian_digits ); ?>"
				data-cta-text="<?php echo esc_attr( $cta_text ); ?>"
				data-custom-title="<?php echo esc_attr( $custom_title ); ?>"
				data-custom-tagline="<?php echo esc_attr( $custom_tag ); ?>"
				data-dashboard-title="<?php echo esc_attr( $dashboard_title ); ?>"
				data-dashboard-desc="<?php echo esc_attr( $dashboard_desc ); ?>"
				data-wallet-title="<?php echo esc_attr( $wallet_title ); ?>"
				data-show-header="<?php echo esc_attr( $show_header ); ?>"
				data-show-region="<?php echo esc_attr( $show_region ); ?>"
				data-show-storage="<?php echo esc_attr( $show_storage ); ?>"
				data-show-os="<?php echo esc_attr( $show_os ); ?>"
				data-show-hourly="<?php echo esc_attr( $show_hourly ); ?>"
			>
				<div style="background: #ffffff; padding: 40px; border-radius: <?php echo esc_attr( (string) $border_radius ); ?>px; text-align: center; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
					<div style="display: inline-block; width: 32px; height: 32px; border-radius: 50%; border: 3px solid <?php echo esc_attr( $primary_color ); ?>; border-top-color: transparent; animation: arvanSpin 1s linear infinite;"></div>
					<p style="color: #475569; font-size: 13px; font-weight: 600; margin-top: 12px;"><?php esc_html_e( 'Loading Cloud Services...', 'arv-seller' ); ?></p>
				</div>
			</div>
		</div>
		<style>
			@keyframes arvanSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
		</style>
		<?php
		return ob_get_clean();
	}
}
