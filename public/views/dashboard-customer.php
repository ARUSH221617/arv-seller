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
			<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#00baba" stroke-width="1.8"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>
		</div>
		<h2><?php esc_html_e( 'Sign in to Access Your Cloud Portal', 'arv-seller' ); ?></h2>
		<p class="arvan-text-muted"><?php esc_html_e( 'Manage your virtual servers, CDN domains, S3 object storage buckets, and atomic wallet ledger in one place.', 'arv-seller' ); ?></p>
		<div style="margin-top: 20px;">
			<a href="<?php echo esc_url( wp_login_url( home_url( '/cloud-services/dashboard/' ) ) ); ?>" class="arvan-btn-primary arvan-btn-lg">
				<?php esc_html_e( 'Sign In to Your Account', 'arv-seller' ); ?>
			</a>
		</div>
	</div>
	<?php
	return;
endif;

global $wpdb;
$table_resources   = $wpdb->prefix . 'arvan_resources';
$user_resources    = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_resources} WHERE user_id = %d ORDER BY created_at DESC", $user_id ) );
$user_transactions = Arvan_Wallet::get_user_transactions( $user_id, 15 );
$wallet_balance    = Arvan_Wallet::get_balance( $user_id );
$burn_rate         = Arvan_Wallet::get_user_burn_rate( $user_id );
$remaining_hrs     = Arvan_Wallet::get_remaining_hours( $user_id );
$currency          = get_option( 'arvan_currency', 'IRT' );

// Check legal termination warning conditions
$is_negative   = ( $wallet_balance <= 0 );
$is_low_balance= ( ! $is_negative && $burn_rate > 0 && $remaining_hrs < 12 );
?>

<!-- Lifecycle Warning Banners -->
<?php if ( $is_negative && $burn_rate > 0 ) : ?>
	<div class="arvan-alert arvan-alert-danger arvan-mb-4">
		<div class="arvan-alert-icon">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
		</div>
		<div>
			<strong><?php esc_html_e( 'Services Suspended Due to Zero Wallet Balance', 'arv-seller' ); ?></strong>
			<p><?php esc_html_e( 'According to ArvanCloud legal termination terms, active virtual instances have been powered off and controls locked to Read-Only mode. Please top up your wallet to restore access immediately.', 'arv-seller' ); ?></p>
		</div>
	</div>
<?php elseif ( $is_low_balance ) : ?>
	<div class="arvan-alert arvan-alert-warning arvan-mb-4">
		<div class="arvan-alert-icon">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
		</div>
		<div>
			<strong><?php esc_html_e( 'Low Balance Warning', 'arv-seller' ); ?></strong>
			<p><?php printf( esc_html__( 'Your available wallet balance will only support active services for approximately %s hours. Please top up your wallet to prevent automated service interruption.', 'arv-seller' ), '<strong>' . esc_html( $remaining_hrs ) . '</strong>' ); ?></p>
		</div>
	</div>
<?php endif; ?>

<div class="arvan-dashboard-grid">

	<!-- Left: Wallet Overview & Quick Top-Up -->
	<div class="arvan-grid-col-8">
		<div class="arvan-card arvan-wallet-overview-card">
			<div class="arvan-card-header">
				<div>
					<span class="arvan-card-subtitle"><?php esc_html_e( 'Available Wallet Balance', 'arv-seller' ); ?></span>
					<h2 class="arvan-card-balance" id="arvan-main-balance">
						<?php echo esc_html( number_format( $wallet_balance ) ); ?> <span class="arvan-curr"><?php echo esc_html( $currency ); ?></span>
					</h2>
					<div class="arvan-burn-stats">
						<span><?php esc_html_e( 'Burn Rate:', 'arv-seller' ); ?> <strong><?php echo esc_html( number_format( $burn_rate ) ); ?> <?php echo esc_html( $currency ); ?>/<?php esc_html_e( 'hr', 'arv-seller' ); ?></strong></span>
						<?php if ( $burn_rate > 0 && ! $is_negative ) : ?>
							<span class="arvan-sep">&bull;</span>
							<span><?php esc_html_e( 'Est. Runtime:', 'arv-seller' ); ?> <strong>~<?php echo esc_html( $remaining_hrs ); ?> <?php esc_html_e( 'hours', 'arv-seller' ); ?></strong></span>
						<?php endif; ?>
					</div>
				</div>
				<div>
					<?php if ( $is_negative ) : ?>
						<span class="arvan-badge-status arvan-badge-suspended"><span class="arvan-dot arvan-dot-amber"></span> <?php esc_html_e( 'Suspended', 'arv-seller' ); ?></span>
					<?php else : ?>
						<span class="arvan-badge-status arvan-badge-active"><span class="arvan-dot arvan-dot-green"></span> <?php esc_html_e( 'Healthy', 'arv-seller' ); ?></span>
					<?php endif; ?>
				</div>
			</div>

			<div class="arvan-topup-section">
				<h4 class="arvan-section-title"><?php esc_html_e( 'Instant Online Wallet Top-Up', 'arv-seller' ); ?></h4>
				
				<div class="arvan-amount-presets">
					<button type="button" class="arvan-preset-btn active" data-amount="50000">50,000 <?php echo esc_html( $currency ); ?></button>
					<button type="button" class="arvan-preset-btn" data-amount="100000">100,000 <?php echo esc_html( $currency ); ?></button>
					<button type="button" class="arvan-preset-btn" data-amount="200000">200,000 <?php echo esc_html( $currency ); ?></button>
					<button type="button" class="arvan-preset-btn" data-amount="500000">500,000 <?php echo esc_html( $currency ); ?></button>
				</div>

				<form id="arvan-wallet-topup-form" class="arvan-topup-form" method="post">
					<div class="arvan-topup-inputs">
						<input type="number" id="arvan_deposit_amount" name="amount" value="50000" min="10000" step="5000" class="arvan-input" placeholder="<?php esc_attr_e( 'Custom Amount in Toman', 'arv-seller' ); ?>" required>
						<button type="submit" class="arvan-btn-primary" id="arvan-pay-btn">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
							<span><?php esc_html_e( 'Pay with Online Gateway', 'arv-seller' ); ?></span>
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<!-- Right: Quick Provisioning Shortcuts -->
	<div class="arvan-grid-col-4">
		<div class="arvan-card arvan-quick-actions-card">
			<h3 class="arvan-card-title"><?php esc_html_e( 'Deploy Cloud Resources', 'arv-seller' ); ?></h3>
			<p class="arvan-text-muted"><?php esc_html_e( 'Instantly provision virtual machines, CDN zones, and S3 buckets.', 'arv-seller' ); ?></p>
			
			<div class="arvan-action-list">
				<a href="<?php echo esc_url( home_url( '/cloud-services/server/' ) ); ?>" class="arvan-action-item">
					<div class="arvan-action-icon arvan-icon-server">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/></svg>
					</div>
					<div class="arvan-action-info">
						<strong><?php esc_html_e( 'New Cloud Server', 'arv-seller' ); ?></strong>
						<span><?php esc_html_e( 'Compute, NVMe & Dedicated IP', 'arv-seller' ); ?></span>
					</div>
					<span class="arvan-arrow">&larr;</span>
				</a>

				<a href="<?php echo esc_url( home_url( '/cloud-services/cdn/' ) ); ?>" class="arvan-action-item">
					<div class="arvan-action-icon arvan-icon-cdn">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/></svg>
					</div>
					<div class="arvan-action-info">
						<strong><?php esc_html_e( 'Connect CDN Domain', 'arv-seller' ); ?></strong>
						<span><?php esc_html_e( 'DDoS Protection & Anycast DNS', 'arv-seller' ); ?></span>
					</div>
					<span class="arvan-arrow">&larr;</span>
				</a>

				<a href="<?php echo esc_url( home_url( '/cloud-services/storage/' ) ); ?>" class="arvan-action-item">
					<div class="arvan-action-icon arvan-icon-storage">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/></svg>
					</div>
					<div class="arvan-action-info">
						<strong><?php esc_html_e( 'S3 Storage Bucket', 'arv-seller' ); ?></strong>
						<span><?php esc_html_e( 'Unlimited Object Storage', 'arv-seller' ); ?></span>
					</div>
					<span class="arvan-arrow">&larr;</span>
				</a>
			</div>
		</div>
	</div>

</div>

<!-- Active Cloud Resources Table -->
<div class="arvan-card arvan-instances-card arvan-mt-4">
	<div class="arvan-card-header">
		<div>
			<h3 class="arvan-card-title"><?php esc_html_e( 'Active Cloud Servers & Virtual Machines', 'arv-seller' ); ?></h3>
			<p class="arvan-text-muted"><?php esc_html_e( 'Live instance power states, IP addresses, and real-time lifecycle controls.', 'arv-seller' ); ?></p>
		</div>
		<span class="arvan-count-badge"><?php echo count( $user_resources ); ?> <?php esc_html_e( 'Instances', 'arv-seller' ); ?></span>
	</div>

	<?php if ( ! empty( $user_resources ) ) : ?>
		<div class="arvan-table-responsive">
			<table class="arvan-table">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Server Instance', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Assigned IP', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Datacenter', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Hourly Rate', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Runtime Status', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Power Lifecycle', 'arv-seller' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $user_resources as $res ) : 
						$specs = json_decode( $res->plan_specs, true );
						$ip    = isset( $specs['ip_address'] ) ? $specs['ip_address'] : '185.143.232.45';
						?>
						<tr id="resource-row-<?php echo esc_attr( $res->id ); ?>">
							<td>
								<strong><?php echo esc_html( $res->name ); ?></strong>
								<small class="arvan-subtext"><?php echo esc_html( $res->arvan_resource_id ); ?></small>
							</td>
							<td>
								<span class="arvan-ip-chip" title="<?php esc_attr_e( 'Click to copy IP', 'arv-seller' ); ?>">
									<code><?php echo esc_html( $ip ); ?></code>
								</span>
							</td>
							<td><?php echo esc_html( $res->region ? $res->region : 'ir-thr-c2' ); ?></td>
							<td><strong><?php echo esc_html( number_format( $res->hourly_cost ) ); ?></strong> <?php echo esc_html( $currency ); ?>/<?php esc_html_e( 'hr', 'arv-seller' ); ?></td>
							<td>
								<?php if ( 'active' === $res->status || 'running' === $res->status ) : ?>
									<span class="arvan-badge-status arvan-badge-active"><span class="arvan-dot arvan-dot-green"></span> <?php esc_html_e( 'Running', 'arv-seller' ); ?></span>
								<?php elseif ( 'suspended' === $res->status ) : ?>
									<span class="arvan-badge-status arvan-badge-suspended"><span class="arvan-dot arvan-dot-amber"></span> <?php esc_html_e( 'Suspended (0 Bal)', 'arv-seller' ); ?></span>
								<?php elseif ( 'stopped' === $res->status ) : ?>
									<span class="arvan-badge-status arvan-badge-stopped"><span class="arvan-dot arvan-dot-red"></span> <?php esc_html_e( 'Powered Off', 'arv-seller' ); ?></span>
								<?php else : ?>
									<span class="arvan-badge-status arvan-badge-pending"><?php echo esc_html( ucfirst( $res->status ) ); ?></span>
								<?php endif; ?>
							</td>
							<td>
								<div class="arvan-btn-group">
									<?php if ( 'active' === $res->status || 'running' === $res->status ) : ?>
										<button type="button" class="arvan-btn-sm arvan-btn-outline arvan-power-btn" data-id="<?php echo esc_attr( $res->id ); ?>" data-action="power-off" title="<?php esc_attr_e( 'Power Off Instance', 'arv-seller' ); ?>">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
											<?php esc_html_e( 'Stop', 'arv-seller' ); ?>
										</button>
										<button type="button" class="arvan-btn-sm arvan-btn-outline arvan-power-btn" data-id="<?php echo esc_attr( $res->id ); ?>" data-action="reboot" title="<?php esc_attr_e( 'Soft Reboot', 'arv-seller' ); ?>">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
											<?php esc_html_e( 'Reboot', 'arv-seller' ); ?>
										</button>
									<?php else : ?>
										<button type="button" class="arvan-btn-sm arvan-btn-primary arvan-power-btn" data-id="<?php echo esc_attr( $res->id ); ?>" data-action="power-on" title="<?php esc_attr_e( 'Power On Instance', 'arv-seller' ); ?>">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
											<?php esc_html_e( 'Power On', 'arv-seller' ); ?>
										</button>
									<?php endif; ?>
									<button type="button" class="arvan-btn-sm arvan-btn-danger arvan-delete-server-trigger" data-id="<?php echo esc_attr( $res->id ); ?>" data-name="<?php echo esc_attr( $res->name ); ?>" title="<?php esc_attr_e( 'Destroy Instance', 'arv-seller' ); ?>">
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
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/></svg>
			</div>
			<h4><?php esc_html_e( 'No active cloud servers deployed yet', 'arv-seller' ); ?></h4>
			<p class="arvan-text-muted"><?php esc_html_e( 'Configure high performance NVMe virtual servers ready in under 60 seconds.', 'arv-seller' ); ?></p>
			<a href="<?php echo esc_url( home_url( '/cloud-services/server/' ) ); ?>" class="arvan-btn-primary arvan-mt-2">
				<?php esc_html_e( 'Deploy First Server', 'arv-seller' ); ?>
			</a>
		</div>
	<?php endif; ?>
</div>

<!-- Atomic Ledger Transactions History -->
<div class="arvan-card arvan-transactions-card arvan-mt-4">
	<div class="arvan-card-header">
		<h3 class="arvan-card-title"><?php esc_html_e( 'Wallet Atomic Ledger Transactions', 'arv-seller' ); ?></h3>
	</div>

	<?php if ( ! empty( $user_transactions ) ) : ?>
		<div class="arvan-table-responsive">
			<table class="arvan-table">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Date & Time', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Transaction Type', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Description / Reference ID', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Amount', 'arv-seller' ); ?></th>
						<th><?php esc_html_e( 'Balance Snapshot', 'arv-seller' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $user_transactions as $tx ) : 
						$is_credit = in_array( $tx->type, array( 'credit', 'topup', 'bonus', 'refund' ), true );
						?>
						<tr>
							<td><?php echo esc_html( date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $tx->created_at ) ) ); ?></td>
							<td>
								<span class="arvan-tx-badge <?php echo $is_credit ? 'arvan-tx-credit' : 'arvan-tx-debit'; ?>">
									<?php echo esc_html( str_replace( '_', ' ', ucfirst( $tx->type ) ) ); ?>
								</span>
							</td>
							<td>
								<?php echo esc_html( $tx->description ? $tx->description : '&mdash;' ); ?>
								<?php if ( ! empty( $tx->reference_id ) ) : ?>
									<small class="arvan-subtext">Ref: <?php echo esc_html( $tx->reference_id ); ?></small>
								<?php endif; ?>
							</td>
							<td class="<?php echo $is_credit ? 'arvan-text-green' : 'arvan-text-red'; ?>">
								<strong>
									<?php echo $is_credit ? '+' : '-'; ?>
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
		<p class="arvan-text-muted arvan-p-4"><?php esc_html_e( 'No transactions recorded in wallet ledger yet.', 'arv-seller' ); ?></p>
	<?php endif; ?>
</div>
