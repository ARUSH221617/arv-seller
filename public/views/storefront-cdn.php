<?php
/**
 * CDN & DNS Management Storefront View.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public/views
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$user_id = get_current_user_id();
global $wpdb;
$table_resources = $wpdb->prefix . 'arvan_resources';
$cdn_resources   = $wpdb->get_results(
	$wpdb->prepare(
		"SELECT * FROM {$table_resources} WHERE user_id = %d AND service_type = 'cdn_domain' ORDER BY created_at DESC",
		$user_id
	)
);
?>

<div class="arvan-page-header">
	<h1 class="arvan-page-title"><?php esc_html_e( 'CDN & Anycast DNS Management', 'arv-seller' ); ?></h1>
	<p class="arvan-page-description"><?php esc_html_e( 'Accelerate your websites globally with edge caching, SSL termination, and Layer 7 DDoS mitigation.', 'arv-seller' ); ?></p>
</div>

<div class="arvan-dashboard-grid">

	<!-- Register New Domain Card -->
	<div class="arvan-grid-col-12">
		<div class="arvan-card">
			<h3 class="arvan-card-title"><?php esc_html_e( 'Connect New Domain to Global CDN', 'arv-seller' ); ?></h3>
			<p class="arvan-text-muted"><?php esc_html_e( 'Enter your root domain or subdomain to automatically generate edge nameservers and security profiles.', 'arv-seller' ); ?></p>

			<form id="arvan-cdn-form" class="arvan-inline-form" method="post">
				<div class="arvan-form-group arvan-flex-grow">
					<input type="text" id="arvan_cdn_domain" name="domain" class="arvan-input" placeholder="example.com" required>
				</div>
				<button type="submit" class="arvan-btn-primary">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
					<?php esc_html_e( 'Activate CDN', 'arv-seller' ); ?>
				</button>
			</form>
		</div>
	</div>

	<!-- Registered Domains List -->
	<div class="arvan-grid-col-12">
		<div class="arvan-card">
			<div class="arvan-card-header">
				<h3 class="arvan-card-title"><?php esc_html_e( 'Active CDN Domains', 'arv-seller' ); ?></h3>
			</div>

			<?php if ( ! empty( $cdn_resources ) ) : ?>
				<div class="arvan-table-responsive">
					<table class="arvan-table">
						<thead>
							<tr>
								<th><?php esc_html_e( 'Domain Name', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Arvan ID', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'SSL Status', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Status', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Actions', 'arv-seller' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $cdn_resources as $domain ) : ?>
								<tr>
									<td><strong><?php echo esc_html( $domain->name ); ?></strong></td>
									<td><code><?php echo esc_html( $domain->arvan_resource_id ); ?></code></td>
									<td><span class="arvan-badge-ssl">Auto SSL</span></td>
									<td><span class="arvan-badge-status arvan-badge-active"><span class="arvan-dot"></span> Active</span></td>
									<td>
										<button class="arvan-btn-sm arvan-btn-outline"><?php esc_html_e( 'DNS Records', 'arv-seller' ); ?></button>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				</div>
			<?php else : ?>
				<div class="arvan-empty-state">
					<p><?php esc_html_e( 'No CDN domains added yet. Enter a domain name above to get started.', 'arv-seller' ); ?></p>
				</div>
			<?php endif; ?>
		</div>
	</div>

</div>
