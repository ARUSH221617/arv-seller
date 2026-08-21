<?php
/**
 * S3 Object Storage Storefront View.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public/views
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$user_id = get_current_user_id();
global $wpdb;
$table_resources   = $wpdb->prefix . 'arvan_resources';
$storage_resources = $wpdb->get_results(
	$wpdb->prepare(
		"SELECT * FROM {$table_resources} WHERE user_id = %d AND service_type = 'storage_bucket' ORDER BY created_at DESC",
		$user_id
	)
);
$currency = get_option( 'arvan_currency', 'IRT' );
?>

<div class="arvan-page-header">
	<div class="arvan-page-header-text">
		<h1 class="arvan-page-title"><?php esc_html_e( 'S3-Compatible Object Storage', 'arv-seller' ); ?></h1>
		<p class="arvan-page-description"><?php esc_html_e( 'Scalable cloud object storage with standard AWS S3 API compatibility, high availability, multi-datacenter durability, and 0-cost inbound transfer.', 'arv-seller' ); ?></p>
	</div>
</div>

<div class="arvan-dashboard-grid">

	<!-- Create Bucket Card -->
	<div class="arvan-grid-col-8">
		<div class="arvan-card">
			<div class="arvan-card-header">
				<div>
					<h3 class="arvan-card-title"><?php esc_html_e( 'Create New S3 Storage Bucket', 'arv-seller' ); ?></h3>
					<p class="arvan-text-muted"><?php esc_html_e( 'Bucket names must be unique, lowercase alphanumeric characters with hyphens only.', 'arv-seller' ); ?></p>
				</div>
			</div>

			<form id="arvan-storage-create-form" class="arvan-inline-form arvan-mt-2" method="post">
				<div class="arvan-form-group arvan-flex-grow">
					<input type="text" id="arvan_bucket_name" name="bucket_name" class="arvan-input" placeholder="my-app-assets-prod" required pattern="[a-z0-9\-]+">
				</div>
				<button type="submit" class="arvan-btn-primary" id="arvan-bucket-submit-btn">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>
					<span><?php esc_html_e( 'Create S3 Bucket', 'arv-seller' ); ?></span>
				</button>
			</form>
		</div>
	</div>

	<!-- S3 Credentials Shortcut Card -->
	<div class="arvan-grid-col-4">
		<div class="arvan-card">
			<h3 class="arvan-card-title"><?php esc_html_e( 'S3 API Credentials', 'arv-seller' ); ?></h3>
			<p class="arvan-text-muted"><?php esc_html_e( 'Generate Access Key ID and Secret Access Key to connect via AWS SDK, Rclone, or backup plugins.', 'arv-seller' ); ?></p>
			
			<button type="button" class="arvan-btn-outline arvan-btn-block arvan-mt-2" id="arvan-generate-s3-keys-btn">
				🔑 <?php esc_html_e( 'Generate S3 Access Keys', 'arv-seller' ); ?>
			</button>
		</div>
	</div>

	<!-- Storage Buckets List -->
	<div class="arvan-grid-col-12 arvan-mt-4">
		<div class="arvan-card">
			<div class="arvan-card-header">
				<div>
					<h3 class="arvan-card-title"><?php esc_html_e( 'Your Storage Buckets', 'arv-seller' ); ?></h3>
					<p class="arvan-text-muted"><?php esc_html_e( 'Object storage buckets provisioned on ArvanCloud cluster.', 'arv-seller' ); ?></p>
				</div>
				<span class="arvan-count-badge"><?php echo count( $storage_resources ); ?> <?php esc_html_e( 'Buckets', 'arv-seller' ); ?></span>
			</div>

			<?php if ( ! empty( $storage_resources ) ) : ?>
				<div class="arvan-table-responsive">
					<table class="arvan-table">
						<thead>
							<tr>
								<th><?php esc_html_e( 'Bucket Name', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'S3 API Endpoint', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Cluster Region', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Rate (Monthly)', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Status', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Connection Info', 'arv-seller' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $storage_resources as $bucket ) : ?>
								<tr>
									<td>
										<strong><?php echo esc_html( $bucket->name ); ?></strong>
										<small class="arvan-subtext">s3://<?php echo esc_html( $bucket->name ); ?></small>
									</td>
									<td><code>https://s3.ir-thr-at1.arvanstorage.ir</code></td>
									<td><?php echo esc_html( $bucket->region ? $bucket->region : 'ir-thr-at1' ); ?></td>
									<td><strong>200</strong> <?php echo esc_html( $currency ); ?>/GB</td>
									<td><span class="arvan-badge-status arvan-badge-active"><span class="arvan-dot arvan-dot-green"></span> <?php esc_html_e( 'Active', 'arv-seller' ); ?></span></td>
									<td>
										<button type="button" class="arvan-btn-sm arvan-btn-outline arvan-bucket-info-btn" data-bucket="<?php echo esc_attr( $bucket->name ); ?>">
											<?php esc_html_e( 'View Setup Snippets', 'arv-seller' ); ?>
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
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/></svg>
					</div>
					<h4><?php esc_html_e( 'No storage buckets created yet', 'arv-seller' ); ?></h4>
					<p class="arvan-text-muted"><?php esc_html_e( 'Create your first bucket to store and offload media, database backups, and large files.', 'arv-seller' ); ?></p>
				</div>
			<?php endif; ?>
		</div>
	</div>

</div>

<!-- S3 Credentials & Code Snippets Modal -->
<div id="arvan-modal-s3-keys" class="arvan-modal-overlay" style="display: none;">
	<div class="arvan-modal-box arvan-modal-lg">
		<div class="arvan-modal-header">
			<h3><?php esc_html_e( 'S3 Storage API Credentials & Setup', 'arv-seller' ); ?></h3>
			<button type="button" class="arvan-modal-close-btn">&times;</button>
		</div>
		<div class="arvan-modal-body">
			
			<div class="arvan-credentials-box arvan-mb-4">
				<div class="arvan-cred-item">
					<label><?php esc_html_e( 'S3 Endpoint URL:', 'arv-seller' ); ?></label>
					<div class="arvan-copy-field">
						<input type="text" readonly value="https://s3.ir-thr-at1.arvanstorage.ir" class="arvan-input" id="s3_endpoint_val">
						<button type="button" class="arvan-btn-sm arvan-copy-btn" data-target="s3_endpoint_val"><?php esc_html_e( 'Copy', 'arv-seller' ); ?></button>
					</div>
				</div>

				<div class="arvan-cred-item arvan-mt-2">
					<label><?php esc_html_e( 'Access Key ID:', 'arv-seller' ); ?></label>
					<div class="arvan-copy-field">
						<input type="text" readonly value="ARVAN_AKIA_MOCK_DEMO_KEY" class="arvan-input" id="s3_access_key_val">
						<button type="button" class="arvan-btn-sm arvan-copy-btn" data-target="s3_access_key_val"><?php esc_html_e( 'Copy', 'arv-seller' ); ?></button>
					</div>
				</div>

				<div class="arvan-cred-item arvan-mt-2">
					<label><?php esc_html_e( 'Secret Access Key:', 'arv-seller' ); ?></label>
					<div class="arvan-copy-field">
						<input type="text" readonly value="ARVAN_SECRET_MOCK_DEMO_KEY_XYZ" class="arvan-input" id="s3_secret_key_val">
						<button type="button" class="arvan-btn-sm arvan-copy-btn" data-target="s3_secret_key_val"><?php esc_html_e( 'Copy', 'arv-seller' ); ?></button>
					</div>
				</div>
			</div>

			<h4 class="arvan-section-title"><?php esc_html_e( 'AWS CLI & Rclone Configuration Example', 'arv-seller' ); ?></h4>
			<pre class="arvan-code-block"><code># AWS CLI (~/.aws/credentials)
[default]
aws_access_key_id = <span class="s3-key-ph">ARVAN_ACCESS_KEY</span>
aws_secret_access_key = <span class="s3-sec-ph">ARVAN_SECRET_KEY</span>

# Upload Example:
aws --endpoint-url=https://s3.ir-thr-at1.arvanstorage.ir s3 cp backup.tar.gz s3://my-bucket/</code></pre>

		</div>
	</div>
</div>
