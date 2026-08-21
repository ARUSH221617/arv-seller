<?php
/**
 * Admin Settings View Template.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/admin/views
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$api_key       = get_option( 'arvan_api_key', '' );
$markup        = get_option( 'arvan_markup_percentage', 20 );
$fixed_margin  = get_option( 'arvan_fixed_margin', 0 );
$currency      = get_option( 'arvan_currency', 'IRT' );
$region        = get_option( 'arvan_default_region', 'ir-thr-c2' );
$store_name    = get_option( 'arvan_store_name', get_bloginfo( 'name' ) . ' Cloud' );
$support_email = get_option( 'arvan_support_email', get_option( 'admin_email' ) );
$support_phone = get_option( 'arvan_support_phone', '021-88888888' );
$sandbox_mode  = get_option( 'arvan_sandbox_mode', 1 );
?>
<div class="wrap arvan-admin-wrap">
	<div class="arvan-admin-header">
		<div>
			<h1><?php esc_html_e( 'ArvanCloud Reseller Settings & Monetization', 'arv-seller' ); ?></h1>
			<p class="description"><?php esc_html_e( 'Configure your ArvanCloud master API credentials, pricing markup margins, white-label branding, and sandbox mode.', 'arv-seller' ); ?></p>
		</div>
	</div>

	<form method="post" action="options.php" class="arvan-settings-form">
		<?php
		settings_fields( 'arvan_settings_group' );
		do_settings_sections( 'arvan_settings_group' );
		?>

		<div class="arvan-settings-card">
			<h2><?php esc_html_e( '1. ArvanCloud API Authentication', 'arv-seller' ); ?></h2>
			<p class="description"><?php esc_html_e( 'Enter your master ArvanCloud Machine User API Key. All downstream customer resources will be provisioned under this account.', 'arv-seller' ); ?></p>
			
			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row"><label for="arvan_api_key"><?php esc_html_e( 'ArvanCloud API Key', 'arv-seller' ); ?></label></th>
						<td>
							<div style="display: flex; gap: 10px; align-items: center; max-width: 600px;">
								<input name="arvan_api_key" type="password" id="arvan_api_key" value="<?php echo esc_attr( $api_key ); ?>" class="regular-text" placeholder="Apikey 12345678-abcd-..." autocomplete="off" style="flex: 1;">
								<button type="button" class="button" id="arvan-test-api-btn">
									<span class="dashicons dashicons-admin-plugins" style="vertical-align: middle; margin-top: -2px;"></span>
									<?php esc_html_e( 'Test Connection', 'arv-seller' ); ?>
								</button>
							</div>
							<div id="arvan-api-test-result" style="margin-top: 8px;"></div>
							<p class="description"><?php esc_html_e( 'Obtain your API Key from ArvanCloud User Panel > User Profile > API Keys / Machine Users.', 'arv-seller' ); ?></p>
						</td>
					</tr>

					<tr>
						<th scope="row"><?php esc_html_e( 'Sandbox / Demo Mode', 'arv-seller' ); ?></th>
						<td>
							<label for="arvan_sandbox_mode">
								<input name="arvan_sandbox_mode" type="checkbox" id="arvan_sandbox_mode" value="1" <?php checked( $sandbox_mode, 1 ); ?>>
								<strong><?php esc_html_e( 'Enable Sandbox / Mock Fallback Mode', 'arv-seller' ); ?></strong>
							</label>
							<p class="description"><?php esc_html_e( 'When enabled, allows instantaneous testing, mock provisioning, and demo top-ups without connecting to live ArvanCloud infrastructure.', 'arv-seller' ); ?></p>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div class="arvan-settings-card" style="margin-top: 20px;">
			<h2><?php esc_html_e( '2. Dynamic Pricing & Reseller Markup Engine', 'arv-seller' ); ?></h2>
			<p class="description"><?php esc_html_e( 'Configure profit margins automatically calculated on top of wholesale ArvanCloud infrastructure rates.', 'arv-seller' ); ?></p>

			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row"><label for="arvan_markup_percentage"><?php esc_html_e( 'Markup Percentage (%)', 'arv-seller' ); ?></label></th>
						<td>
							<input name="arvan_markup_percentage" type="number" id="arvan_markup_percentage" value="<?php echo esc_attr( $markup ); ?>" min="0" max="500" step="0.5" class="small-text"> %
							<p class="description"><?php esc_html_e( 'e.g. 20% markup turns wholesale 450 IRT/hr into 540 IRT/hr customer retail price.', 'arv-seller' ); ?></p>
						</td>
					</tr>

					<tr>
						<th scope="row"><label for="arvan_fixed_margin"><?php esc_html_e( 'Fixed Margin Addition (Toman)', 'arv-seller' ); ?></label></th>
						<td>
							<input name="arvan_fixed_margin" type="number" id="arvan_fixed_margin" value="<?php echo esc_attr( $fixed_margin ); ?>" min="0" step="10" class="small-text"> Toman/hr
							<p class="description"><?php esc_html_e( 'Optional fixed addition added after percentage markup calculation.', 'arv-seller' ); ?></p>
						</td>
					</tr>

					<tr>
						<th scope="row"><label for="arvan_currency"><?php esc_html_e( 'Store Currency', 'arv-seller' ); ?></label></th>
						<td>
							<select name="arvan_currency" id="arvan_currency">
								<option value="IRT" <?php selected( $currency, 'IRT' ); ?>><?php esc_html_e( 'Toman (IRT)', 'arv-seller' ); ?></option>
								<option value="IRR" <?php selected( $currency, 'IRR' ); ?>><?php esc_html_e( 'Rial (IRR)', 'arv-seller' ); ?></option>
								<option value="USD" <?php selected( $currency, 'USD' ); ?>><?php esc_html_e( 'US Dollar (USD)', 'arv-seller' ); ?></option>
							</select>
						</td>
					</tr>

					<tr>
						<th scope="row"><label for="arvan_default_region"><?php esc_html_e( 'Default Datacenter Region', 'arv-seller' ); ?></label></th>
						<td>
							<select name="arvan_default_region" id="arvan_default_region">
								<option value="ir-thr-c2" <?php selected( $region, 'ir-thr-c2' ); ?>>Tehran &mdash; Forough (ir-thr-c2)</option>
								<option value="ir-thr-sh1" <?php selected( $region, 'ir-thr-sh1' ); ?>>Tehran &mdash; Shahryar (ir-thr-sh1)</option>
								<option value="ir-tbz-dc1" <?php selected( $region, 'ir-tbz-dc1' ); ?>>Tabriz &mdash; Northwest (ir-tbz-dc1)</option>
							</select>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div class="arvan-settings-card" style="margin-top: 20px;">
			<h2><?php esc_html_e( '3. Storefront White-Label Branding', 'arv-seller' ); ?></h2>
			<p class="description"><?php esc_html_e( 'Customization parameters injected into the standalone virtual canvas header and footer.', 'arv-seller' ); ?></p>

			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row"><label for="arvan_store_name"><?php esc_html_e( 'Reseller Brand / Store Name', 'arv-seller' ); ?></label></th>
						<td>
							<input name="arvan_store_name" type="text" id="arvan_store_name" value="<?php echo esc_attr( $store_name ); ?>" class="regular-text">
						</td>
					</tr>

					<tr>
						<th scope="row"><label for="arvan_support_email"><?php esc_html_e( 'Support Contact Email', 'arv-seller' ); ?></label></th>
						<td>
							<input name="arvan_support_email" type="email" id="arvan_support_email" value="<?php echo esc_attr( $support_email ); ?>" class="regular-text">
						</td>
					</tr>

					<tr>
						<th scope="row"><label for="arvan_support_phone"><?php esc_html_e( 'Support Phone Number', 'arv-seller' ); ?></label></th>
						<td>
							<input name="arvan_support_phone" type="text" id="arvan_support_phone" value="<?php echo esc_attr( $support_phone ); ?>" class="regular-text">
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div style="margin-top: 20px;">
			<?php submit_button( __( 'Save All Reseller Settings', 'arv-seller' ), 'primary', 'submit', false ); ?>
		</div>
	</form>

	<div class="arvan-settings-card" style="margin-top: 30px;">
		<h2><?php esc_html_e( 'Virtual Storefront Quick Links (Theme Isolated)', 'arv-seller' ); ?></h2>
		<p class="description"><?php esc_html_e( 'Access standalone storefront and customer portal pages:', 'arv-seller' ); ?></p>
		
		<div class="arvan-links-grid">
			<div class="arvan-link-box">
				<strong><span class="dashicons dashicons-cloud" style="color: #008b8b; vertical-align: text-bottom; margin-right: 6px;"></span><?php esc_html_e( 'Cloud Server Configurator', 'arv-seller' ); ?></strong>
				<code><a href="<?php echo esc_url( home_url( '/cloud-services/server/' ) ); ?>" target="_blank"><?php echo esc_url( home_url( '/cloud-services/server/' ) ); ?></a></code>
			</div>
			<div class="arvan-link-box">
				<strong><span class="dashicons dashicons-dashboard" style="color: #008b8b; vertical-align: text-bottom; margin-right: 6px;"></span><?php esc_html_e( 'Customer Portal & Dashboard', 'arv-seller' ); ?></strong>
				<code><a href="<?php echo esc_url( home_url( '/cloud-services/dashboard/' ) ); ?>" target="_blank"><?php echo esc_url( home_url( '/cloud-services/dashboard/' ) ); ?></a></code>
			</div>
			<div class="arvan-link-box">
				<strong><span class="dashicons dashicons-networking" style="color: #008b8b; vertical-align: text-bottom; margin-right: 6px;"></span><?php esc_html_e( 'CDN & Edge DNS Manager', 'arv-seller' ); ?></strong>
				<code><a href="<?php echo esc_url( home_url( '/cloud-services/cdn/' ) ); ?>" target="_blank"><?php echo esc_url( home_url( '/cloud-services/cdn/' ) ); ?></a></code>
			</div>
			<div class="arvan-link-box">
				<strong><span class="dashicons dashicons-database" style="color: #008b8b; vertical-align: text-bottom; margin-right: 6px;"></span><?php esc_html_e( 'S3 Object Storage', 'arv-seller' ); ?></strong>
				<code><a href="<?php echo esc_url( home_url( '/cloud-services/storage/' ) ); ?>" target="_blank"><?php echo esc_url( home_url( '/cloud-services/storage/' ) ); ?></a></code>
			</div>
		</div>
	</div>
</div>
