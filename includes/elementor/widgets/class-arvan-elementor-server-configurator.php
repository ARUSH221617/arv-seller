<?php
/**
 * Elementor Widget: ArvanCloud Server Configurator
 *
 * Embeds the full React-powered cloud server configurator with complete
 * customization support: colors, typography, layout, radius, elevation,
 * section visibility, text overrides, and custom CSS.
 *
 * @package Arvan_Reseller
 * @since   1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( '\Elementor\Widget_Base' ) ) {
	return;
}

/**
 * Class Arvan_Elementor_Server_Configurator_Widget
 */
class Arvan_Elementor_Server_Configurator_Widget extends \Elementor\Widget_Base {

	// ── Identity ──────────────────────────────────────────────────────────

	public function get_name() {
		return 'arvan_elementor_server_configurator';
	}

	public function get_title() {
		return __( 'ArvanCloud Server Configurator', 'arv-seller' );
	}

	public function get_icon() {
		return 'eicon-server';
	}

	public function get_categories() {
		return array( 'arvan-cloud' );
	}

	public function get_keywords() {
		return array( 'arvan', 'cloud', 'server', 'vps', 'iaas', 'hosting', 'calculator', 'configurator' );
	}

	// ── Controls ──────────────────────────────────────────────────────────

	protected function register_controls() {

		// ══ TAB: CONTENT ══════════════════════════════════════════════════

		// ── Section 1: Pre-Selections ────────────────────────────────────
		$this->start_controls_section(
			'section_defaults',
			array(
				'label' => __( '⚙️ Default Pre-Selections', 'arv-seller' ),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'default_region',
			array(
				'label'   => __( 'Datacenter Region', 'arv-seller' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => get_option( 'arvan_default_region', 'ir-thr-c2' ),
				'options' => array(
					'ir-thr-c2'  => __( '🇮🇷 Tehran – Forough  (ir-thr-c2)', 'arv-seller' ),
					'ir-thr-sh1' => __( '🇮🇷 Tehran – Shahryar (ir-thr-sh1)', 'arv-seller' ),
					'ir-tbz-dc1' => __( '🇮🇷 Tabriz – Northwest (ir-tbz-dc1)', 'arv-seller' ),
				),
			)
		);

		$this->add_control(
			'default_flavor',
			array(
				'label'   => __( 'Hardware Flavor', 'arv-seller' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => 'g1-2-4',
				'options' => array(
					'g1-1-2'  => __( 'Starter Eco   (1 vCPU / 2 GB)', 'arv-seller' ),
					'g1-2-4'  => __( 'Standard ★    (2 vCPU / 4 GB)', 'arv-seller' ),
					'g1-4-8'  => __( 'Performance   (4 vCPU / 8 GB)', 'arv-seller' ),
					'g1-8-16' => __( 'Enterprise    (8 vCPU / 16 GB)', 'arv-seller' ),
					'c1-4-4'  => __( 'Compute       (4 vCPU / 4 GB)', 'arv-seller' ),
					'm1-2-8'  => __( 'Memory        (2 vCPU / 8 GB)', 'arv-seller' ),
				),
			)
		);

		$this->add_control(
			'default_image',
			array(
				'label'   => __( 'OS Distribution', 'arv-seller' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => 'ubuntu-22.04',
				'options' => array(
					'ubuntu-22.04' => 'Ubuntu 22.04 LTS ★',
					'ubuntu-24.04' => 'Ubuntu 24.04 LTS',
					'debian-12'    => 'Debian 12 Bookworm',
					'almalinux-9'  => 'AlmaLinux 9 Enterprise',
					'windows-2022' => 'Windows Server 2022',
				),
			)
		);

		$this->add_control(
			'default_disk',
			array(
				'label'   => __( 'Extra NVMe Disk (GB)', 'arv-seller' ),
				'type'    => \Elementor\Controls_Manager::NUMBER,
				'min'     => 25,
				'max'     => 500,
				'step'    => 5,
				'default' => 40,
			)
		);

		$this->end_controls_section();

		// ── Section 2: Layout & Visibility ──────────────────────────────
		$this->start_controls_section(
			'section_visibility',
			array(
				'label' => __( '📐 Layout & Visibility', 'arv-seller' ),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			)
		);

		foreach (
			array(
				'show_header'          => __( 'Show Header Banner', 'arv-seller' ),
				'show_region_selector' => __( 'Show Region Selector', 'arv-seller' ),
				'show_storage_slider'  => __( 'Show Storage Slider', 'arv-seller' ),
				'show_os_selector'     => __( 'Show OS Selector', 'arv-seller' ),
				'show_hourly_price'    => __( 'Show Hourly & Monthly Rates', 'arv-seller' ),
			) as $key => $label
		) {
			$this->add_control(
				$key,
				array(
					'label'        => $label,
					'type'         => \Elementor\Controls_Manager::SWITCHER,
					'label_on'     => __( 'Show', 'arv-seller' ),
					'label_off'    => __( 'Hide', 'arv-seller' ),
					'return_value' => 'yes',
					'default'      => 'yes',
				)
			);
		}

		$this->add_control( 'divider_layout', array( 'type' => \Elementor\Controls_Manager::DIVIDER ) );

		$this->add_control(
			'container_width',
			array(
				'label'   => __( 'Container Max Width', 'arv-seller' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => get_option( 'arvan_container_width', 'standard' ),
				'options' => array(
					'boxed'    => __( 'Boxed (1024px)', 'arv-seller' ),
					'standard' => __( 'Standard (1200px)', 'arv-seller' ),
					'wide'     => __( 'Wide (1400px)', 'arv-seller' ),
					'fluid'    => __( 'Full Width (100%)', 'arv-seller' ),
				),
			)
		);

		$this->add_control(
			'spacing_density',
			array(
				'label'   => __( 'Spacing Density', 'arv-seller' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => get_option( 'arvan_spacing_density', 'normal' ),
				'options' => array(
					'compact'  => __( 'Compact', 'arv-seller' ),
					'normal'   => __( 'Normal', 'arv-seller' ),
					'spacious' => __( 'Spacious', 'arv-seller' ),
				),
			)
		);

		$this->add_control(
			'border_radius',
			array(
				'label'      => __( 'Corner Radius (px)', 'arv-seller' ),
				'type'       => \Elementor\Controls_Manager::SLIDER,
				'size_units' => array( 'px' ),
				'range'      => array(
					'px' => array( 'min' => 0, 'max' => 32, 'step' => 2 ),
				),
				'default' => array(
					'unit' => 'px',
					'size' => (int) get_option( 'arvan_border_radius', 16 ),
				),
			)
		);

		$this->add_control(
			'card_elevation',
			array(
				'label'   => __( 'Card Shadow Style', 'arv-seller' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => get_option( 'arvan_card_elevation', 'subtle' ),
				'options' => array(
					'none'     => __( 'Flat (No Shadow)', 'arv-seller' ),
					'subtle'   => __( 'Subtle', 'arv-seller' ),
					'elevated' => __( 'Elevated', 'arv-seller' ),
					'glow'     => __( 'Brand Glow', 'arv-seller' ),
				),
			)
		);

		$this->end_controls_section();

		// ══ TAB: STYLE ════════════════════════════════════════════════════

		// ── Section 3: Brand Colors ──────────────────────────────────────
		$this->start_controls_section(
			'section_style_colors',
			array(
				'label' => __( '🎨 Brand Colors', 'arv-seller' ),
				'tab'   => \Elementor\Controls_Manager::TAB_STYLE,
			)
		);

		$color_controls = array(
			'accent_color'   => array( __( 'Primary Brand Color', 'arv-seller' ),    get_option( 'arvan_brand_primary_color', '#008b8b' ) ),
			'secondary_color'=> array( __( 'Secondary / Dark Accent', 'arv-seller' ), get_option( 'arvan_brand_secondary_color', '#0b3a42' ) ),
			'color_surface'  => array( __( 'Card Surface Background', 'arv-seller' ), get_option( 'arvan_color_surface', '#ffffff' ) ),
			'color_bg'       => array( __( 'App Canvas Background', 'arv-seller' ),   get_option( 'arvan_color_bg', '#f8fafc' ) ),
			'color_text'     => array( __( 'Primary Text', 'arv-seller' ),             get_option( 'arvan_color_text', '#0f172a' ) ),
			'color_border'   => array( __( 'Border / Divider', 'arv-seller' ),         get_option( 'arvan_color_border', '#e2e8f0' ) ),
		);

		foreach ( $color_controls as $key => list( $label, $default ) ) {
			$this->add_control(
				$key,
				array(
					'label'   => $label,
					'type'    => \Elementor\Controls_Manager::COLOR,
					'default' => $default,
				)
			);
		}

		$this->end_controls_section();

		// ── Section 4: Typography ────────────────────────────────────────
		$this->start_controls_section(
			'section_typography',
			array(
				'label' => __( '🔤 Typography & Digits', 'arv-seller' ),
				'tab'   => \Elementor\Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'font_family',
			array(
				'label'   => __( 'Font Family', 'arv-seller' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => get_option( 'arvan_font_family', 'vazirmatn' ),
				'options' => array(
					'vazirmatn' => 'وزیرمتن — Vazirmatn',
					'sahel'     => 'ساحل — Sahel',
					'samim'     => 'صمیم — Samim',
					'shabnam'   => 'شبنم — Shabnam',
					'jakarta'   => 'Plus Jakarta Sans',
					'inter'     => 'Inter',
					'system'    => __( 'System Default UI', 'arv-seller' ),
				),
			)
		);

		$this->add_control(
			'base_font_size',
			array(
				'label'   => __( 'Base Font Size (px)', 'arv-seller' ),
				'type'    => \Elementor\Controls_Manager::NUMBER,
				'min'     => 12,
				'max'     => 20,
				'step'    => 1,
				'default' => (int) get_option( 'arvan_base_font_size', 14 ),
			)
		);

		$this->add_control(
			'persian_digits',
			array(
				'label'        => __( 'Convert to Persian Digits (۰–۹)', 'arv-seller' ),
				'type'         => \Elementor\Controls_Manager::SWITCHER,
				'label_on'     => __( 'Yes', 'arv-seller' ),
				'label_off'    => __( 'No', 'arv-seller' ),
				'return_value' => 'yes',
				'default'      => (bool) get_option( 'arvan_persian_digits', 1 ) ? 'yes' : 'no',
			)
		);

		$this->end_controls_section();

		// ── Section 5: Text Overrides ────────────────────────────────────
		$this->start_controls_section(
			'section_branding',
			array(
				'label' => __( '✏️ Text & Copywriting', 'arv-seller' ),
				'tab'   => \Elementor\Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'custom_title',
			array(
				'label'       => __( 'Header Title', 'arv-seller' ),
				'type'        => \Elementor\Controls_Manager::TEXT,
				'placeholder' => get_option( 'arvan_hero_title', __( 'Deploy Cloud Server (IaaS)', 'arv-seller' ) ),
				'label_block' => true,
			)
		);

		$this->add_control(
			'custom_tagline',
			array(
				'label'       => __( 'Subtitle / Tagline', 'arv-seller' ),
				'type'        => \Elementor\Controls_Manager::TEXTAREA,
				'placeholder' => get_option( 'arvan_hero_desc', __( 'Instant provisioning on ArvanCloud infrastructure. High IOPS NVMe SSD.', 'arv-seller' ) ),
				'rows'        => 2,
			)
		);

		$this->add_control(
			'cta_button_text',
			array(
				'label'       => __( 'CTA Button Text', 'arv-seller' ),
				'type'        => \Elementor\Controls_Manager::TEXT,
				'placeholder' => get_option( 'arvan_deploy_btn_text', __( 'Deploy Server', 'arv-seller' ) ),
			)
		);

		$this->add_control( 'divider_css', array( 'type' => \Elementor\Controls_Manager::DIVIDER ) );

		$this->add_control(
			'custom_css',
			array(
				'label'       => __( 'Custom CSS', 'arv-seller' ),
				'type'        => \Elementor\Controls_Manager::CODE,
				'language'    => 'css',
				'placeholder' => '/* Scoped to this widget instance only */',
				'rows'        => 6,
			)
		);

		$this->end_controls_section();
	}

	// ── Helpers ───────────────────────────────────────────────────────────

	/**
	 * Build computed layout / elevation values shared by render() and
	 * used as data attributes & CSS vars.
	 */
	private function compute_layout( array $settings ): array {
		$accent_color    = ! empty( $settings['accent_color'] )    ? $settings['accent_color']    : get_option( 'arvan_brand_primary_color', '#008b8b' );
		$secondary_color = ! empty( $settings['secondary_color'] )  ? $settings['secondary_color']  : get_option( 'arvan_brand_secondary_color', '#0b3a42' );
		$color_surface   = ! empty( $settings['color_surface'] )   ? $settings['color_surface']   : get_option( 'arvan_color_surface', '#ffffff' );
		$color_bg        = ! empty( $settings['color_bg'] )        ? $settings['color_bg']        : get_option( 'arvan_color_bg', '#f8fafc' );
		$color_text      = ! empty( $settings['color_text'] )      ? $settings['color_text']      : get_option( 'arvan_color_text', '#0f172a' );
		$color_border    = ! empty( $settings['color_border'] )    ? $settings['color_border']    : get_option( 'arvan_color_border', '#e2e8f0' );
		$border_radius   = isset( $settings['border_radius']['size'] ) ? (int) $settings['border_radius']['size'] : (int) get_option( 'arvan_border_radius', 16 );
		$card_elevation  = ! empty( $settings['card_elevation'] )  ? $settings['card_elevation']  : get_option( 'arvan_card_elevation', 'subtle' );
		$container_width = ! empty( $settings['container_width'] ) ? $settings['container_width'] : get_option( 'arvan_container_width', 'standard' );
		$spacing_density = ! empty( $settings['spacing_density'] ) ? $settings['spacing_density'] : get_option( 'arvan_spacing_density', 'normal' );
		$font_family     = ! empty( $settings['font_family'] )     ? $settings['font_family']     : get_option( 'arvan_font_family', 'vazirmatn' );
		$base_font_size  = ! empty( $settings['base_font_size'] )  ? (int) $settings['base_font_size'] : (int) get_option( 'arvan_base_font_size', 14 );

		$container_max_map = array( 'boxed' => '1024px', 'standard' => '1200px', 'wide' => '1400px', 'fluid' => '100%' );
		$density_map       = array( 'compact' => '0.85', 'normal' => '1', 'spacious' => '1.2' );
		$elevation_map     = array(
			'none'     => array( 'none', 'none', 'none' ),
			'subtle'   => array( '0 1px 3px rgba(0,0,0,.05)', '0 4px 6px -1px rgba(0,0,0,.05)', '0 10px 15px -3px rgba(0,0,0,.05)' ),
			'elevated' => array( '0 4px 12px rgba(0,0,0,.08)', '0 12px 24px -4px rgba(0,0,0,.1)', '0 20px 30px -6px rgba(0,0,0,.12)' ),
			'glow'     => array( '0 4px 20px ' . $accent_color . '25', '0 8px 30px ' . $accent_color . '35', '0 16px 40px ' . $accent_color . '45' ),
		);

		$shadows = $elevation_map[ $card_elevation ] ?? $elevation_map['subtle'];

		return compact(
			'accent_color', 'secondary_color', 'color_surface', 'color_bg',
			'color_text', 'color_border', 'border_radius', 'card_elevation',
			'container_width', 'spacing_density', 'font_family', 'base_font_size'
		) + array(
			'container_max' => $container_max_map[ $container_width ] ?? '1200px',
			'spacing_scale' => $density_map[ $spacing_density ] ?? '1',
			'shadows'       => $shadows,
		);
	}

	// ── Frontend Render ───────────────────────────────────────────────────

	protected function render() {
		$settings = $this->get_settings_for_display();

		if ( class_exists( 'Arvan_Public' ) ) {
			( new Arvan_Public( 'arv-seller', defined( 'ARVAN_RESELLER_VERSION' ) ? ARVAN_RESELLER_VERSION : '1.0.0' ) )
				->enqueue_assets_for_embed();
		}

		$l = $this->compute_layout( $settings );

		$region       = esc_attr( $settings['default_region']     ?? 'ir-thr-c2' );
		$flavor       = esc_attr( $settings['default_flavor']     ?? 'g1-2-4' );
		$image        = esc_attr( $settings['default_image']      ?? 'ubuntu-22.04' );
		$disk         = (int) ( $settings['default_disk']         ?? 40 );
		$persian      = ( 'yes' === ( $settings['persian_digits'] ?? '' ) ) ? '1' : '0';
		$cta_text     = esc_attr( $settings['cta_button_text']    ?? '' );
		$custom_title = esc_attr( $settings['custom_title']       ?? '' );
		$custom_tag   = esc_attr( $settings['custom_tagline']     ?? '' );
		$show_header  = ( 'yes' === ( $settings['show_header']          ?? 'yes' ) ) ? '1' : '0';
		$show_region  = ( 'yes' === ( $settings['show_region_selector'] ?? 'yes' ) ) ? '1' : '0';
		$show_storage = ( 'yes' === ( $settings['show_storage_slider']  ?? 'yes' ) ) ? '1' : '0';
		$show_os      = ( 'yes' === ( $settings['show_os_selector']     ?? 'yes' ) ) ? '1' : '0';
		$show_hourly  = ( 'yes' === ( $settings['show_hourly_price']    ?? 'yes' ) ) ? '1' : '0';
		$custom_css   = $settings['custom_css'] ?? '';
		$direction    = class_exists( 'Arv_Seller_i18n' ) ? Arv_Seller_i18n::get_active_direction() : 'ltr';
		$lang         = class_exists( 'Arv_Seller_i18n' ) ? Arv_Seller_i18n::get_active_language()  : 'en';

		ob_start();
		?>
		<div class="arvan-embed-container arvan-elementor-embed is-<?php echo esc_attr( $direction ); ?> lang-<?php echo esc_attr( $lang ); ?>" style="
			--arvan-primary:<?php echo esc_attr( $l['accent_color'] ); ?>;
			--arvan-brand-primary:<?php echo esc_attr( $l['accent_color'] ); ?>;
			--arvan-teal:<?php echo esc_attr( $l['accent_color'] ); ?>;
			--arvan-secondary:<?php echo esc_attr( $l['secondary_color'] ); ?>;
			--arvan-teal-dark:<?php echo esc_attr( $l['secondary_color'] ); ?>;
			--arvan-surface:<?php echo esc_attr( $l['color_surface'] ); ?>;
			--arvan-bg:<?php echo esc_attr( $l['color_bg'] ); ?>;
			--arvan-text:<?php echo esc_attr( $l['color_text'] ); ?>;
			--arvan-border:<?php echo esc_attr( $l['color_border'] ); ?>;
			--arvan-radius:<?php echo $l['border_radius']; ?>px;
			--radius:<?php echo $l['border_radius']; ?>px;
			--arvan-font-size-base:<?php echo $l['base_font_size']; ?>px;
			--arvan-container-max:<?php echo esc_attr( $l['container_max'] ); ?>;
			--arvan-spacing-scale:<?php echo esc_attr( $l['spacing_scale'] ); ?>;
			--arvan-shadow-1:<?php echo esc_attr( $l['shadows'][0] ); ?>;
			--arvan-shadow-2:<?php echo esc_attr( $l['shadows'][1] ); ?>;
			--arvan-shadow-3:<?php echo esc_attr( $l['shadows'][2] ); ?>;
			width:100%;max-width:<?php echo esc_attr( $l['container_max'] ); ?>;margin:0 auto;">

			<?php if ( $custom_css ) : ?>
				<style><?php echo wp_strip_all_tags( $custom_css ); ?></style>
			<?php endif; ?>

			<div id="arvan-cloud-app"
				data-embedded="true"
				data-view="server"
				data-region="<?php echo $region; ?>"
				data-flavor="<?php echo $flavor; ?>"
				data-image="<?php echo $image; ?>"
				data-disk="<?php echo $disk; ?>"
				data-accent-color="<?php echo esc_attr( $l['accent_color'] ); ?>"
				data-secondary-color="<?php echo esc_attr( $l['secondary_color'] ); ?>"
				data-color-surface="<?php echo esc_attr( $l['color_surface'] ); ?>"
				data-color-bg="<?php echo esc_attr( $l['color_bg'] ); ?>"
				data-color-text="<?php echo esc_attr( $l['color_text'] ); ?>"
				data-color-border="<?php echo esc_attr( $l['color_border'] ); ?>"
				data-border-radius="<?php echo $l['border_radius']; ?>"
				data-card-elevation="<?php echo esc_attr( $l['card_elevation'] ); ?>"
				data-spacing-density="<?php echo esc_attr( $l['spacing_density'] ); ?>"
				data-container-width="<?php echo esc_attr( $l['container_width'] ); ?>"
				data-font-family="<?php echo esc_attr( $l['font_family'] ); ?>"
				data-base-font-size="<?php echo $l['base_font_size']; ?>"
				data-persian-digits="<?php echo $persian; ?>"
				data-cta-text="<?php echo $cta_text; ?>"
				data-custom-title="<?php echo $custom_title; ?>"
				data-custom-tagline="<?php echo $custom_tag; ?>"
				data-show-header="<?php echo $show_header; ?>"
				data-show-region="<?php echo $show_region; ?>"
				data-show-storage="<?php echo $show_storage; ?>"
				data-show-os="<?php echo $show_os; ?>"
				data-show-hourly="<?php echo $show_hourly; ?>"
			>
				<div style="padding:48px 24px;text-align:center;color:#64748b;font-size:14px;font-weight:600;font-family:inherit;">
					<?php echo esc_html__( 'Loading ArvanCloud Server Configurator…', 'arv-seller' ); ?>
				</div>
			</div>
		</div>
		<?php
		echo ob_get_clean();
	}

	// ── Editor Live Preview ───────────────────────────────────────────────

	protected function content_template() {
		?>
		<#
		const accent    = settings.accent_color    || '#008b8b';
		const secondary = settings.secondary_color || '#0b3a42';
		const bg        = settings.color_bg        || '#f8fafc';
		const surface   = settings.color_surface   || '#ffffff';
		const textCol   = settings.color_text      || '#0f172a';
		const border    = settings.color_border    || '#e2e8f0';
		const radius    = (settings.border_radius && settings.border_radius.size !== undefined) ? settings.border_radius.size : 16;
		const title     = settings.custom_title    || '<?php echo esc_js( __( 'ArvanCloud Server Configurator', 'arv-seller' ) ); ?>';
		const cta       = settings.cta_button_text || '<?php echo esc_js( __( 'Deploy Server Now', 'arv-seller' ) ); ?>';
		const region    = settings.default_region  || 'ir-thr-c2';
		const flavor    = settings.default_flavor  || 'g1-2-4';
		const shadow    = 'elevation' === settings.card_elevation
		                  ? '0 12px 24px rgba(0,0,0,.1)'
		                  : 'glow' === settings.card_elevation
		                  ? '0 8px 30px ' + accent + '40'
		                  : '0 2px 8px rgba(0,0,0,.06)';
		#>
		<div style="
			background:{{ bg }};
			border-radius:{{ radius }}px;
			overflow:hidden;
			box-shadow:{{ shadow }};
			font-family:system-ui,sans-serif;
			border:2px dashed {{ accent }}44;">

			{{-- Header band --}}
			<div style="
				background:linear-gradient(135deg, {{ accent }}, {{ secondary }});
				padding:20px 24px 18px;
				display:flex;align-items:center;gap:12px;">
				<div style="
					width:36px;height:36px;
					background:rgba(255,255,255,.18);
					border-radius:{{ Math.max(6, radius * 0.6) }}px;
					display:flex;align-items:center;justify-content:center;
					font-size:18px;">⚡</div>
				<div>
					<div style="color:#fff;font-size:15px;font-weight:800;line-height:1.2;">{{ title }}</div>
					<div style="color:rgba(255,255,255,.7);font-size:11px;font-weight:500;margin-top:2px;">
						<?php echo esc_html__( 'Region:', 'arv-seller' ); ?> {{ region }} &nbsp;·&nbsp; <?php echo esc_html__( 'Plan:', 'arv-seller' ); ?> {{ flavor }}
					</div>
				</div>
			</div>

			{{-- Selector row (mock) --}}
			<div style="
				background:{{ surface }};
				padding:16px 24px;
				border-bottom:1px solid {{ border }};
				display:flex;gap:8px;flex-wrap:wrap;">
				<# var chips = ['🇮🇷 Tehran', 'Ubuntu 22.04', '2 vCPU / 4 GB', '40 GB NVMe']; #>
				<# chips.forEach(function(c){ #>
				<span style="
					border:1px solid {{ border }};
					border-radius:{{ Math.max(4, radius * 0.5) }}px;
					padding:4px 12px;
					font-size:11px;font-weight:700;
					color:{{ accent }};
					background:{{ bg }};">{{ c }}</span>
				<# }); #>
			</div>

			{{-- Price row (mock) --}}
			<div style="
				background:{{ surface }};
				padding:20px 24px;
				display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
				<div>
					<div style="font-size:11px;color:#94a3b8;font-weight:600;margin-bottom:4px;">
						<?php echo esc_html__( 'Estimated Monthly Cost', 'arv-seller' ); ?>
					</div>
					<div style="font-size:22px;font-weight:900;color:{{ textCol }};">
						<span style="color:{{ accent }};">—</span>
						<span style="font-size:12px;font-weight:500;color:#64748b;margin-inline-start:6px;">
							<?php echo esc_html__( 'Live pricing loads on frontend', 'arv-seller' ); ?>
						</span>
					</div>
				</div>
				<button type="button" style="
					background:{{ accent }};
					color:#fff;border:none;
					border-radius:{{ Math.max(6, radius * 0.75) }}px;
					padding:11px 28px;
					font-size:13px;font-weight:800;cursor:pointer;
					box-shadow:0 3px 10px {{ accent }}50;">
					{{ cta }} →
				</button>
			</div>

			{{-- Footer notice --}}
			<div style="padding:10px 24px;background:{{ bg }};border-top:1px solid {{ border }};text-align:center;">
				<span style="font-size:11px;color:#94a3b8;font-weight:500;">
					<?php echo esc_html__( 'Live interactive configurator renders on the published page.', 'arv-seller' ); ?>
				</span>
			</div>
		</div>
		<?php
	}
}
