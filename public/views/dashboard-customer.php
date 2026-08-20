<?php
/**
 * Customer Portal & Wallet Dashboard View.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public/views
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$user_id = get_current_user_id();

if ( ! is_user_logged_in() ) :
	?>
	<div class="arvan-auth-card">
		<div class="arvan-auth-icon">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>
		</div>
		<h2><?php esc_html_e( 'Please sign in to access your cloud portal', 'arv-seller' ); ?></h2>
		<p><?php esc_html_e( 'Manage your servers, CDN domains, object storage buckets, and account balance in one place.', 'arv-seller' ); ?></p>
		<a href="<?php echo esc_url( wp_login_url( home_url( '/cloud-services/dashboard/' ) ) ); ?>" class="arvan-btn-primary arvan-btn-lg">
			<?php esc_html_e( 'Sign In to Your Account', 'arv-seller' ); ?>
		</a>
	</div>
	<?php
	return;
endif;

global $wpdb;
$table_resources    = $wpdb->prefix . 'arvan_resources';
$user_resources     = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_resources} WHERE user_id = %d ORDER BY created_at DESC", $user_id ) );
$user_transactions  = Arvan_Wallet::get_user_transactions( $user_id, 10 );
$wallet_balance     = Arvan_Wallet::get_balance( $user_id );
$currency           = get_option( 'arvan_currency', 'IRT' );
?>

<div class="arvan-dashboard-grid">

	<!-- Stats & Wallet Top-up Row -->
	<div class="arvan-grid-col-8">
		<div class="arvan-card arvan-wallet-overview-card">
			<div class="arvan-card-header">
				<div>
					<span class="arvan-card-subtitle"><?php esc_html_e( 'Account Balance', 'arv-seller' ); ?></span>
					<h2 class="arvan-card-balance"><?php echo esc_html( number_format( $wallet_balance ) ); ?> <span class="arvan-curr"><?php echo esc_html( $currency ); ?></span></h2>
				</div>
				<div class="arvan-badge-status arvan-badge-active">
					<span class="arvan-dot"></span> <?php esc_html_e( 'Active Account', 'arv-seller' ); ?>
				</div>
			</div>

			<div class="arvan-topup-section">
				<h4 class="arvan-section-title"><?php esc_html_e( 'Top Up Wallet Balance', 'arv-seller' ); ?></h4>
				<form id="arvan-wallet-topup-form" class="arvan-topup-form" method="post">
					<div class="arvan-amount-presets">
						<button type="button" class="arvan-preset-btn active" data-amount="50000">50,000 <?php echo esc_html( $currency ); ?></button>
						<button type="button" class="arvan-preset-btn" data-amount="100000">100,000 <?php echo esc_html( $currency ); ?></button>
						<button type="button" class="arvan-preset-btn" data-amount="200000">200,000 <?php echo esc_html( $currency ); ?></button>
						<button type="button" class="arvan-preset-btn" data-amount="500000">500,000 <?php echo esc_html( $currency ); ?></button>
					</div>
					<div class="arvan-topup-inputs">
						<input type="number" id="arvan_deposit_amount" name="amount" value="50000" min="10000" step="1000" class="arvan-input" placeholder="<?php esc_attr_e( 'Custom Amount', 'arv-seller' ); ?>">
						<button type="submit" class="arvan-btn-primary" id="arvan-pay-btn">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
							<?php esc_html_e( 'Pay with Online Gateway', 'arv-seller' ); ?>
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<!-- Quick Launch Sidebar -->
	<div class="arvan-grid-col-4">
		<div class="arvan-card arvan-quick-actions-card">
			<h3 class="arvan-card-title"><?php esc_html_e( 'Deploy New Service', 'arv-seller' ); ?></h3>
			<p class="arvan-text-muted"><?php esc_html_e( 'Provision high performance cloud resources in seconds.', 'arv-seller' ); ?></p>
			
			<div class="arvan-action-list">
				<a href="<?php echo esc_url( home_url( '/cloud-services/server/' ) ); ?>" class="arvan-action-item">
					<div class="arvan-action-icon arvan-icon-server">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/></svg>
					</div>
					<div class="arvan-action-info">
						<strong><?php esc_html_e( 'New Cloud Server', 'arv-seller' ); ?></strong>
						<span><?php esc_html_e( 'High IOPS NVMe with Dedicated IP', 'arv-seller' ); ?></span>
					</div>
					<span class="arvan-arrow">&rarr;</span>
				</a>

				<a href="<?php echo esc_url( home_url( '/cloud-services/cdn/' ) ); ?>" class="arvan-action-item">
					<div class="arvan-action-icon arvan-icon-cdn">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/></svg>
					</div>
					<div class="arvan-action-info">
						<strong><?php esc_html_e( 'Add CDN Domain', 'arv-seller' ); ?></strong>
						<span><?php esc_html_e( 'DDoS Protection & Anycast DNS', 'arv-seller' ); ?></span>
					</div>
					<span class="arvan-arrow">&rarr;</span>
				</a>

				<a href="<?php echo esc_url( home_url( '/cloud-services/storage/' ) ); ?>" class="arvan-action-item">
					<div class="arvan-action-icon arvan-icon-storage">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/></svg>
					</div>
					<div class="arvan-action-info">
						<strong><?php esc_html_e( 'S3 Object Storage', 'arv-seller' ); ?></strong>
						<span><?php esc_html_e( 'Unlimited S3 API Compatible Bucket', 'arv-seller' ); ?></span>
					</div>
					<span class="arvan-arrow">&rarr;</span>
				</a>
			</div>
		</div>
	</div>

</div>

<!-- Active Instances Table -->
<div class="arvan-card arvan-instances-card">
	<div class="arvan-card-header">
		<h3 class="arvan-card-title"><?php esc_html_e( 'Active Cloud Resources', 'arv-seller' ); ?></h3>
		<span class="arvan-count-badge"><?php echo count( $user_resources ); ?> <?php esc_html_e( 'Resources', 'arv-seller' ); ?></span>
	</div>

	<?php if ( ! empty( $user_resources ) ) : ?>
		<div class="arvan-table-responsive">
			<table class="arvan-table">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Name / ID', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Type', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Region', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Rate (Hourly)', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Status', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Actions', 'arv-seller' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $user_resources as $res ) : ?>
						<tr>
							<td>
								<strong><?php echo esc_html( $res->name ); ?></strong>
								<small class="arvan-subtext"><?php echo esc_html( $res->arvan_resource_id ); ?></small>
							</td>
							<td><span class="arvan-tag"><?php echo esc_html( $res->service_type ); ?></span></td>
							<td><?php echo esc_html( $res->region ? $res->region : '&mdash;' ); ?></td>
							<td><?php echo esc_html( number_format( $res->hourly_cost ) ); ?> <?php echo esc_html( $currency ); ?>/hr</td>
							<td>
								<?php if ( 'active' === $res->status || 'running' === $res->status ) : ?>
									<span class="arvan-badge-status arvan-badge-active"><span class="arvan-dot"></span> <?php esc_html_e( 'Running', 'arv-seller' ); ?></span>
								<?php elseif ( 'suspended' === $res->status || 'poweroff' === $res->status ) : ?>
									<span class="arvan-badge-status arvan-badge-suspended"><span class="arvan-dot"></span> <?php esc_html_e( 'Suspended / Off', 'arv-seller' ); ?></span>
								<?php else : ?>
									<span class="arvan-badge-status arvan-badge-pending"><?php echo esc_html( ucfirst( $res->status ) ); ?></span>
								<?php endif; ?>
							</td>
							<td>
								<div class="arvan-btn-group">
									<button class="arvan-btn-sm arvan-btn-outline" title="<?php esc_attr_e( 'Reboot Instance', 'arv-seller' ); ?>">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
									</button>
									<button class="arvan-btn-sm arvan-btn-danger" title="<?php esc_attr_e( 'Delete Instance', 'arv-seller' ); ?>">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
									</button>
								</div>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>
	<?php else : ?>
		<div class="arvan-empty-state">
			<div class="arvan-empty-icon">
				<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/></svg>
			</div>
			<h4><?php esc_html_e( 'No active cloud resources found', 'arv-seller' ); ?></h4>
			<p><?php esc_html_e( 'You have not deployed any cloud servers, CDN domains, or storage buckets yet.', 'arv-seller' ); ?></p>
			<a href="<?php echo esc_url( home_url( '/cloud-services/server/' ) ); ?>" class="arvan-btn-primary">
				<?php esc_html_e( 'Deploy First Cloud Server', 'arv-seller' ); ?>
			</a>
		</div>
	<?php endif; ?>
</div>

<!-- Ledger Transactions History -->
<div class="arvan-card arvan-transactions-card">
	<div class="arvan-card-header">
		<h3 class="arvan-card-title"><?php esc_html_e( 'Recent Ledger Transactions', 'arv-seller' ); ?></h3>
	</div>

	<?php if ( ! empty( $user_transactions ) ) : ?>
		<div class="arvan-table-responsive">
			<table class="arvan-table">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Date', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Type', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Description / Reference', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Amount', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Balance After', 'arv-seller' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $user_transactions as $tx ) : ?>
						<tr>
							<td><?php echo esc_html( date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $tx->created_at ) ) ); ?></td>
							<td>
								<span class="arvan-tx-badge arvan-tx-<?php echo esc_attr( $tx->type ); ?>">
									<?php echo esc_html( str_replace( '_', ' ', ucfirst( $tx->type ) ) ); ?>
								</span>
							</td>
							<td>
								<?php echo esc_html( $tx->description ? $tx->description : '&mdash;' ); ?>
								<?php if ( ! empty( $tx->reference_id ) ) : ?>
									<small class="arvan-subtext">Ref: <?php echo esc_html( $tx->reference_id ); ?></small>
								<?php endif; ?>
							</td>
							<td class="<?php echo ( 'credit' === $tx->type || 'topup' === $tx->type ) ? 'arvan-text-green' : 'arvan-text-red'; ?>">
								<strong>
									<?php echo ( 'credit' === $tx->type || 'topup' === $tx->type ) ? '+' : '-'; ?>
									<?php echo esc_html( number_format( $tx->amount ) ); ?> <?php echo esc_html( $currency ); ?>
								</strong>
							</td>
							<td><strong><?php echo esc_html( number_format( $tx->balance_after ) ); ?> <?php echo esc_html( $currency ); ?></strong></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>
	<?php else : ?>
		<p class="arvan-text-muted arvan-p-4"><?php esc_html_e( 'No transactions recorded yet.', 'arv-seller' ); ?></p>
	<?php endif; ?>
</div>
