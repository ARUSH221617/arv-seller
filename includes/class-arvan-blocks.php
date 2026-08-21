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
					'regions'       => array(
						array( 'label' => 'Tehran - Forough (ir-thr-c2)', 'value' => 'ir-thr-c2' ),
						array( 'label' => 'Tehran - Shahryar (ir-thr-sh1)', 'value' => 'ir-thr-sh1' ),
						array( 'label' => 'Tabriz - Northwest (ir-tbz-dc1)', 'value' => 'ir-tbz-dc1' ),
					),
					'defaultRegion' => get_option( 'arvan_default_region', 'ir-thr-c2' ),
					'primaryColor'  => get_option( 'arvan_brand_primary_color', '#008b8b' ),
					'storeName'     => get_option( 'arvan_store_name', get_bloginfo( 'name' ) . ' Cloud' ),
					'i18n'          => array(
						'title'             => __( 'ArvanCloud Server Configurator', 'arv-seller' ),
						'description'       => __( 'Interactive Cloud Server sizing, pricing calculator, and deployment widget.', 'arv-seller' ),
						'dashboardTitle'    => __( 'ArvanCloud Customer Dashboard', 'arv-seller' ),
						'dashboardDesc'     => __( 'Customer cloud server management and wallet billing dashboard.', 'arv-seller' ),
						'blockSettings'     => __( 'Server Configurator Settings', 'arv-seller' ),
						'selectRegion'      => __( 'Default Datacenter Region', 'arv-seller' ),
						'accentColor'       => __( 'Brand Accent Color', 'arv-seller' ),
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
					'defaultRegion'   => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_default_region', 'ir-thr-c2' ),
					),
					'accentColor'     => array(
						'type'    => 'string',
						'default' => get_option( 'arvan_brand_primary_color', '#008b8b' ),
					),
					'showHourlyPrice' => array(
						'type'    => 'boolean',
						'default' => true,
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
					'showBalanceCard' => array(
						'type'    => 'boolean',
						'default' => true,
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
				'region' => get_option( 'arvan_default_region', 'ir-thr-c2' ),
				'color'  => get_option( 'arvan_brand_primary_color', '#008b8b' ),
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
			array(),
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

		$direction       = Arv_Seller_i18n::get_active_direction();
		$active_lang     = Arv_Seller_i18n::get_active_language();
		$primary_color   = ! empty( $attributes['color'] ) ? sanitize_hex_color( $attributes['color'] ) : get_option( 'arvan_brand_primary_color', '#008b8b' );
		$custom_css      = get_option( 'arvan_custom_css', '' );

		ob_start();
		?>
		<div class="arvan-embed-wrapper is-<?php echo esc_attr( $direction ); ?> lang-<?php echo esc_attr( $active_lang ); ?>" style="--arvan-brand-primary: <?php echo esc_attr( $primary_color ); ?>; width: 100%; max-width: 1200px; margin: 0 auto;">
			<?php if ( ! empty( $custom_css ) ) : ?>
				<style><?php echo wp_strip_all_tags( $custom_css ); ?></style>
			<?php endif; ?>
			<div id="arvan-cloud-app" data-initial-tab="<?php echo esc_attr( $view ); ?>">
				<div style="background: #ffffff; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
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
