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
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Vazirmatn:wght@300;400;500;600;700;800;900&family=Noto+Sans+SC:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
	<?php wp_head(); ?>
</head>
<body class="bg-slate-50 text-slate-900 antialiased selection:bg-[#008b8b]/20 selection:text-[#006d6d]">

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
