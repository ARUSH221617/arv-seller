<?php
/**
 * Standalone Isolated Frontend Canvas Template.
 *
 * This template bypasses the active theme completely (no get_header/get_footer)
 * to deliver an isolated, pixel-perfect Cloud Portal & Storefront application shell.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/templates
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$current_page = get_query_var( 'arvan_page', 'dashboard' );
if ( empty( $current_page ) ) {
	$current_page = 'dashboard';
}

$current_user_id = get_current_user_id();
$user_logged_in  = is_user_logged_in();
$wallet_balance  = $user_logged_in ? Arvan_Wallet::get_balance( $current_user_id ) : 0;
$currency        = get_option( 'arvan_currency', 'IRT' );
$plugin_root_url = plugin_dir_url( dirname( __FILE__ ) );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> dir="<?php echo is_rtl() ? 'rtl' : 'ltr'; ?>">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title><?php echo esc_html( get_bloginfo( 'name' ) ); ?> &mdash; <?php esc_html_e( 'Cloud Services Portal', 'arv-seller' ); ?></title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Vazirmatn:wght@400;500;600;700;800&display=swap" rel="stylesheet">
	<?php wp_head(); ?>
</head>
<body class="arvan-canvas-app <?php echo is_rtl() ? 'is-rtl' : 'is-ltr'; ?>">

<div class="arvan-app-wrapper">

	<!-- Top Navigation Bar -->
	<header class="arvan-header">
		<div class="arvan-container arvan-header-inner">
			
			<div class="arvan-brand">
				<a href="<?php echo esc_url( home_url( '/cloud-services/' ) ); ?>" class="arvan-logo-link">
					<div class="arvan-logo-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
						</svg>
					</div>
					<span class="arvan-logo-text"><?php esc_html_e( 'Arvan Reseller Cloud', 'arv-seller' ); ?></span>
				</a>
			</div>

			<nav class="arvan-nav">
				<a href="<?php echo esc_url( home_url( '/cloud-services/dashboard/' ) ); ?>" class="arvan-nav-link <?php echo ( 'dashboard' === $current_page || 'wallet' === $current_page ) ? 'active' : ''; ?>">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
					<span><?php esc_html_e( 'Dashboard', 'arv-seller' ); ?></span>
				</a>
				<a href="<?php echo esc_url( home_url( '/cloud-services/server/' ) ); ?>" class="arvan-nav-link <?php echo ( 'server' === $current_page ) ? 'active' : ''; ?>">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
					<span><?php esc_html_e( 'Cloud Servers', 'arv-seller' ); ?></span>
				</a>
				<a href="<?php echo esc_url( home_url( '/cloud-services/cdn/' ) ); ?>" class="arvan-nav-link <?php echo ( 'cdn' === $current_page ) ? 'active' : ''; ?>">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
					<span><?php esc_html_e( 'CDN & DNS', 'arv-seller' ); ?></span>
				</a>
				<a href="<?php echo esc_url( home_url( '/cloud-services/storage/' ) ); ?>" class="arvan-nav-link <?php echo ( 'storage' === $current_page ) ? 'active' : ''; ?>">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
					<span><?php esc_html_e( 'Object Storage', 'arv-seller' ); ?></span>
				</a>
			</nav>

			<div class="arvan-user-actions">
				<?php if ( $user_logged_in ) : ?>
					<div class="arvan-wallet-pill">
						<span class="arvan-wallet-label"><?php esc_html_e( 'Wallet:', 'arv-seller' ); ?></span>
						<span class="arvan-wallet-amount"><?php echo esc_html( number_format( $wallet_balance ) ); ?></span>
						<span class="arvan-wallet-currency"><?php echo esc_html( $currency ); ?></span>
						<a href="<?php echo esc_url( home_url( '/cloud-services/dashboard/?tab=topup' ) ); ?>" class="arvan-wallet-topup-btn" title="<?php esc_attr_e( 'Top up balance', 'arv-seller' ); ?>">+</a>
					</div>
					<div class="arvan-user-menu">
						<span class="arvan-user-name"><?php echo esc_html( wp_get_current_user()->display_name ); ?></span>
						<a href="<?php echo esc_url( wp_logout_url( home_url( '/cloud-services/' ) ) ); ?>" class="arvan-btn-logout" title="<?php esc_attr_e( 'Logout', 'arv-seller' ); ?>">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
						</a>
					</div>
				<?php else : ?>
					<a href="<?php echo esc_url( wp_login_url( home_url( '/cloud-services/' . $current_page . '/' ) ) ); ?>" class="arvan-btn-primary">
						<?php esc_html_e( 'Sign In / Register', 'arv-seller' ); ?>
					</a>
				<?php endif; ?>
			</div>

		</div>
	</header>

	<!-- Main Canvas Body -->
	<main class="arvan-main-content">
		<div class="arvan-container">
			<?php
			$view_file = '';
			switch ( $current_page ) {
				case 'server':
					$view_file = plugin_dir_path( dirname( __FILE__ ) ) . 'public/views/storefront-server.php';
					break;
				case 'cdn':
					$view_file = plugin_dir_path( dirname( __FILE__ ) ) . 'public/views/storefront-cdn.php';
					break;
				case 'storage':
					$view_file = plugin_dir_path( dirname( __FILE__ ) ) . 'public/views/storefront-storage.php';
					break;
				case 'dashboard':
				case 'wallet':
				default:
					$view_file = plugin_dir_path( dirname( __FILE__ ) ) . 'public/views/dashboard-customer.php';
					break;
			}

			if ( file_exists( $view_file ) ) {
				include $view_file;
			} else {
				echo '<div class="arvan-alert arvan-alert-error">' . esc_html__( 'Requested cloud view template not found.', 'arv-seller' ) . '</div>';
			}
			?>
		</div>
	</main>

	<!-- Minimal Footer -->
	<footer class="arvan-footer">
		<div class="arvan-container arvan-footer-inner">
			<p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( get_bloginfo( 'name' ) ); ?>. <?php esc_html_e( 'Powered by ArvanCloud Reseller Platform.', 'arv-seller' ); ?></p>
			<div class="arvan-footer-links">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Main Website', 'arv-seller' ); ?></a>
			</div>
		</div>
	</footer>

</div>

<?php wp_footer(); ?>
</body>
</html>
