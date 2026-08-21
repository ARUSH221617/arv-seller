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
	<div class="arvan-page-header-text">
		<h1 class="arvan-page-title"><?php esc_html_e( 'Global CDN & Anycast Edge DNS', 'arv-seller' ); ?></h1>
		<p class="arvan-page-description"><?php esc_html_e( 'Accelerate your websites globally with edge caching, SSL termination, and Layer 7 DDoS mitigation across 40+ PoPs.', 'arv-seller' ); ?></p>
	</div>
</div>

<div class="arvan-dashboard-grid">

	<!-- Register New Domain Card -->
	<div class="arvan-grid-col-12">
		<div class="arvan-card">
			<div class="arvan-card-header">
				<div>
					<h3 class="arvan-card-title"><?php esc_html_e( 'Connect New Domain to Edge CDN', 'arv-seller' ); ?></h3>
					<p class="arvan-text-muted"><?php esc_html_e( 'Enter your root domain or subdomain to automatically generate edge nameservers and security profiles.', 'arv-seller' ); ?></p>
				</div>
			</div>

			<form id="arvan-cdn-register-form" class="arvan-inline-form arvan-mt-2" method="post">
				<div class="arvan-form-group arvan-flex-grow">
					<input type="text" id="arvan_cdn_domain" name="domain" class="arvan-input" placeholder="mywebsite.ir" required>
				</div>
				<button type="submit" class="arvan-btn-primary" id="arvan-cdn-submit-btn">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
					<span><?php esc_html_e( 'Activate Edge CDN', 'arv-seller' ); ?></span>
				</button>
			</form>
		</div>
	</div>

	<!-- Registered Domains List -->
	<div class="arvan-grid-col-12 arvan-mt-4">
		<div class="arvan-card">
			<div class="arvan-card-header">
				<div>
					<h3 class="arvan-card-title"><?php esc_html_e( 'Connected CDN Domains', 'arv-seller' ); ?></h3>
					<p class="arvan-text-muted"><?php esc_html_e( 'Manage DNS zones, edge caching, and SSL certificates.', 'arv-seller' ); ?></p>
				</div>
				<span class="arvan-count-badge"><?php echo count( $cdn_resources ); ?> <?php esc_html_e( 'Domains', 'arv-seller' ); ?></span>
			</div>

			<?php if ( ! empty( $cdn_resources ) ) : ?>
				<div class="arvan-table-responsive">
					<table class="arvan-table">
						<thead>
							<tr>
								<th><?php esc_html_e( 'Domain Name', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Assigned Nameservers', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'SSL / TLS Mode', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Edge Caching', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Status', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'DNS Management', 'arv-seller' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $cdn_resources as $domain ) : 
								$specs = json_decode( $domain->plan_specs, true );
								?>
								<tr>
									<td>
										<strong><?php echo esc_html( $domain->name ); ?></strong>
										<small class="arvan-subtext"><?php echo esc_html( $domain->arvan_resource_id ); ?></small>
									</td>
									<td>
										<div class="arvan-ns-chips">
											<code>ns1.arvancdn.ir</code>
											<code>ns2.arvancdn.ir</code>
										</div>
									</td>
									<td>
										<button type="button" class="arvan-badge-ssl arvan-ssl-btn" data-domain="<?php echo esc_attr( $domain->name ); ?>" title="<?php esc_attr_e( 'Toggle Managed SSL', 'arv-seller' ); ?>">
											🔒 <?php esc_html_e( 'Managed Let\'s Encrypt (Active)', 'arv-seller' ); ?>
										</button>
									</td>
									<td>
										<button type="button" class="arvan-btn-sm arvan-btn-outline arvan-purge-cache-btn" data-domain="<?php echo esc_attr( $domain->name ); ?>">
											⚡ <?php esc_html_e( 'Purge Edge Cache', 'arv-seller' ); ?>
										</button>
									</td>
									<td>
										<span class="arvan-badge-status arvan-badge-active"><span class="arvan-dot arvan-dot-green"></span> <?php esc_html_e( 'Protected', 'arv-seller' ); ?></span>
									</td>
									<td>
										<button type="button" class="arvan-btn-sm arvan-btn-primary arvan-manage-dns-btn" data-domain="<?php echo esc_attr( $domain->name ); ?>">
											<?php esc_html_e( 'DNS Zone Editor', 'arv-seller' ); ?>
										</button>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				</div>
			<?php else : ?>
				<div class="arvan-empty-state">
					<div class="arvan-empty-icon">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/></svg>
					</div>
					<h4><?php esc_html_e( 'No CDN domains configured yet', 'arv-seller' ); ?></h4>
					<p class="arvan-text-muted"><?php esc_html_e( 'Enter a domain name above to accelerate your traffic and protect from DDoS attacks.', 'arv-seller' ); ?></p>
				</div>
			<?php endif; ?>
		</div>
	</div>

</div>

<!-- DNS Zone Editor Modal -->
<div id="arvan-modal-dns" class="arvan-modal-overlay" style="display: none;">
	<div class="arvan-modal-box arvan-modal-lg">
		<div class="arvan-modal-header">
			<h3><?php esc_html_e( 'DNS Zone Records:', 'arv-seller' ); ?> <span id="arvan-dns-modal-domain"></span></h3>
			<button type="button" class="arvan-modal-close-btn">&times;</button>
		</div>
		<div class="arvan-modal-body">
			
			<!-- Add DNS Record Form -->
			<form id="arvan-add-dns-form" class="arvan-dns-add-form arvan-mb-4">
				<input type="hidden" id="dns_record_domain" name="domain">
				<div class="arvan-form-grid-4">
					<div class="arvan-form-group">
						<label class="arvan-label"><?php esc_html_e( 'Record Type', 'arv-seller' ); ?></label>
						<select id="dns_record_type" name="type" class="arvan-input">
							<option value="A">A</option>
							<option value="AAAA">AAAA</option>
							<option value="CNAME">CNAME</option>
							<option value="MX">MX</option>
							<option value="TXT">TXT</option>
						</select>
					</div>
					<div class="arvan-form-group">
						<label class="arvan-label"><?php esc_html_e( 'Name / Host', 'arv-seller' ); ?></label>
						<input type="text" id="dns_record_name" name="name" class="arvan-input" placeholder="@ or www" required>
					</div>
					<div class="arvan-form-group">
						<label class="arvan-label"><?php esc_html_e( 'Target Value / IP', 'arv-seller' ); ?></label>
						<input type="text" id="dns_record_value" name="value" class="arvan-input" placeholder="185.143.232.45" required>
					</div>
					<div class="arvan-form-group" style="display: flex; align-items: flex-end; gap: 10px;">
						<label class="arvan-checkbox-label" title="<?php esc_attr_e( 'Enable ArvanCloud Cloud Proxy & DDoS Protection', 'arv-seller' ); ?>">
							<input type="checkbox" id="dns_record_cloud" name="cloud" value="true" checked>
							<span>☁️ <?php esc_html_e( 'Cloud Proxy', 'arv-seller' ); ?></span>
						</label>
						<button type="submit" class="arvan-btn-primary" style="height: 42px;"><?php esc_html_e( 'Add Record', 'arv-seller' ); ?></button>
					</div>
				</div>
			</form>

			<!-- Records Table -->
			<div class="arvan-table-responsive">
				<table class="arvan-table" id="arvan-dns-records-table">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Type', 'arv-seller' ); ?></th>
							<th><?php esc_html_e( 'Name', 'arv-seller' ); ?></th>
							<th><?php esc_html_e( 'Value', 'arv-seller' ); ?></th>
							<th><?php esc_html_e( 'Proxy', 'arv-seller' ); ?></th>
							<th><?php esc_html_e( 'TTL', 'arv-seller' ); ?></th>
							<th><?php esc_html_e( 'Action', 'arv-seller' ); ?></th>
						</tr>
					</thead>
					<tbody id="arvan-dns-records-body">
						<tr><td colspan="6"><?php esc_html_e( 'Loading records...', 'arv-seller' ); ?></td></tr>
					</tbody>
				</table>
			</div>

		</div>
	</div>
</div>
