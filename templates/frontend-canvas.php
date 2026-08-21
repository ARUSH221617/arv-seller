<?php
/**
 * Standalone Isolated Frontend Canvas Template.
 *
 * This template bypasses the active theme completely (no get_header/get_footer)
 * to deliver a React TypeScript + TailwindCSS + Material Design 3 (Light Mode) Cloud Portal.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/templates
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$active_lang     = Arv_Seller_i18n::get_active_language();
$direction       = Arv_Seller_i18n::get_active_direction();
$supported_langs = Arv_Seller_i18n::get_supported_languages();
$store_name      = get_option( 'arvan_store_name', get_bloginfo( 'name' ) . ' Cloud' );
?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( $supported_langs[ $active_lang ]['code'] ); ?>" dir="<?php echo esc_attr( $direction ); ?>" class="is-<?php echo esc_attr( $direction ); ?> lang-<?php echo esc_attr( $active_lang ); ?>">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title><?php echo esc_html( $store_name ); ?> &mdash; <?php esc_html_e( 'Cloud Services Platform', 'arv-seller' ); ?></title>
	<link rel="stylesheet" href="<?php echo esc_url( plugin_dir_url( dirname( __FILE__ ) ) . 'public/fonts/fonts.css' ); ?>">
	<?php
	$custom_font_url = get_option( 'arvan_custom_font_url', '' );
	if ( ! empty( $custom_font_url ) ) {
		echo '<link rel="stylesheet" href="' . esc_url( $custom_font_url ) . '">';
	}
	$favicon_url = get_option( 'arvan_store_favicon_url', '' );
	if ( ! empty( $favicon_url ) ) {
		echo '<link rel="icon" href="' . esc_url( $favicon_url ) . '">';
	}
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
		:root, #arvan-cloud-app {
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
		#arvan-cloud-app .container, .arvan-container {
			max-width: var(--arvan-container-max) !important;
		}
	</style>
	<?php wp_head(); ?>
</head>
<body class="bg-slate-50 text-slate-900 antialiased selection:bg-[var(--arvan-primary)]/20 selection:text-[var(--arvan-primary)]">

	<!-- React Single Page Application Mount Point -->
	<div id="arvan-cloud-app">
		<div class="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
			<div class="h-12 w-12 rounded-2xl bg-[#008b8b]/10 border border-[#008b8b]/30 animate-pulse flex items-center justify-center text-[#008b8b]">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
			</div>
			<div class="text-sm font-bold text-slate-700">
				<?php esc_html_e( 'Loading ArvanCloud Services Canvas...', 'arv-seller' ); ?>
			</div>
		</div>
	</div>

	<?php wp_footer(); ?>
</body>
</html>
