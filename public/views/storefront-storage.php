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
	<h1 class="arvan-page-title"><?php esc_html_e( 'S3-Compatible Object Storage', 'arv-seller' ); ?></h1>
	<p class="arvan-page-description"><?php esc_html_e( 'Scalable cloud object storage with standard AWS S3 API compatibility, high availability, and multi-region replication.', 'arv-seller' ); ?></p>
</div>

<div class="arvan-dashboard-grid">

	<!-- Create Bucket Card -->
	<div class="arvan-grid-col-12">
		<div class="arvan-card">
			<h3 class="arvan-card-title"><?php esc_html_e( 'Create New Storage Bucket', 'arv-seller' ); ?></h3>
			<p class="arvan-text-muted"><?php esc_html_e( 'Bucket names must be unique, lowercase alphanumeric characters with hyphens only.', 'arv-seller' ); ?></p>

			<form id="arvan-storage-form" class="arvan-inline-form" method="post">
				<div class="arvan-form-group arvan-flex-grow">
					<input type="text" id="arvan_bucket_name" name="bucket_name" class="arvan-input" placeholder="my-app-backup-bucket" required pattern="[a-z0-9\-]+">
				</div>
				<button type="submit" class="arvan-btn-primary">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>
					<?php esc_html_e( 'Create Bucket', 'arv-seller' ); ?>
				</button>
			</form>
		</div>
	</div>

	<!-- Storage Buckets List -->
	<div class="arvan-grid-col-12">
		<div class="arvan-card">
			<div class="arvan-card-header">
				<h3 class="arvan-card-title"><?php esc_html_e( 'Your Storage Buckets', 'arv-seller' ); ?></h3>
			</div>

			<?php if ( ! empty( $storage_resources ) ) : ?>
				<div class="arvan-table-responsive">
					<table class="arvan-table">
						<thead>
							<tr>
								<th><?php esc_html_e( 'Bucket Name', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Endpoint (S3 API)', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Region', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Status', 'arv-seller' ); ?></th>
								<th><?php esc_html_e( 'Actions', 'arv-seller' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $storage_resources as $bucket ) : ?>
								<tr>
									<td><strong><?php echo esc_html( $bucket->name ); ?></strong></td>
									<td><code>https://s3.ir-thr-at1.arvanstorage.ir</code></td>
									<td><?php echo esc_html( $bucket->region ? $bucket->region : 'ir-thr-at1' ); ?></td>
									<td><span class="arvan-badge-status arvan-badge-active"><span class="arvan-dot"></span> Ready</span></td>
									<td>
										<button class="arvan-btn-sm arvan-btn-outline"><?php esc_html_e( 'Access Keys', 'arv-seller' ); ?></button>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				</div>
			<?php else : ?>
				<div class="arvan-empty-state">
					<p><?php esc_html_e( 'No storage buckets created yet. Create your first bucket above.', 'arv-seller' ); ?></p>
				</div>
			<?php endif; ?>
		</div>
	</div>

</div>
