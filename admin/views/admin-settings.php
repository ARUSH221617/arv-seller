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
$markup        = get_option( 'arvan_markup_percentage', 15 );
$currency      = get_option( 'arvan_currency', 'IRT' );
$region        = get_option( 'arvan_default_region', 'ir-thr-c2' );
?>
<div class="wrap">
	<h1><?php esc_html_e( 'ArvanCloud Reseller Settings', 'arv-seller' ); ?></h1>
	<p><?php esc_html_e( 'Configure your ArvanCloud API credentials, pricing markup margin, and default provisioning regions.', 'arv-seller' ); ?></p>

	<form method="post" action="options.php">
		<?php
		settings_fields( 'arvan_settings_group' );
		do_settings_sections( 'arvan_settings_group' );
		?>

		<table class="form-table" role="presentation">
			<tbody>
				<tr>
					<th scope="row"><label for="arvan_api_key"><?php esc_html_e( 'ArvanCloud API Key (Bearer/Apikey)', 'arv-seller' ); ?></label></th>
					<td>
						<input name="arvan_api_key" type="password" id="arvan_api_key" value="<?php echo esc_attr( $api_key ); ?>" class="regular-text" placeholder="Apikey 12345678-abcd-..." autocomplete="off">
						<p class="description"><?php esc_html_e( 'Obtain your API Key from ArvanCloud User Panel &gt; API Management.', 'arv-seller' ); ?></p>
					</td>
				</tr>

				<tr>
					<th scope="row"><label for="arvan_markup_percentage"><?php esc_html_e( 'Reseller Markup Percentage (%)', 'arv-seller' ); ?></label></th>
					<td>
						<input name="arvan_markup_percentage" type="number" id="arvan_markup_percentage" value="<?php echo esc_attr( $markup ); ?>" min="0" max="500" step="0.5" class="small-text"> %
						<p class="description"><?php esc_html_e( 'Profit margin added on top of wholesale ArvanCloud hourly rates (e.g. 15% markup).', 'arv-seller' ); ?></p>
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

		<?php submit_button( __( 'Save Reseller Settings', 'arv-seller' ) ); ?>
	</form>

	<hr>

	<h2><?php esc_html_e( 'Virtual Storefront Quick Links', 'arv-seller' ); ?></h2>
	<p><?php esc_html_e( 'Direct standalone customer endpoints (isolated from theme layout):', 'arv-seller' ); ?></p>
	<ul>
		<li><strong>Dashboard / Customer Portal:</strong> <a href="<?php echo esc_url( home_url( '/cloud-services/' ) ); ?>" target="_blank"><?php echo esc_url( home_url( '/cloud-services/' ) ); ?></a></li>
		<li><strong>Cloud Server Configurator:</strong> <a href="<?php echo esc_url( home_url( '/cloud-services/server/' ) ); ?>" target="_blank"><?php echo esc_url( home_url( '/cloud-services/server/' ) ); ?></a></li>
		<li><strong>CDN & DNS Manager:</strong> <a href="<?php echo esc_url( home_url( '/cloud-services/cdn/' ) ); ?>" target="_blank"><?php echo esc_url( home_url( '/cloud-services/cdn/' ) ); ?></a></li>
		<li><strong>S3 Object Storage:</strong> <a href="<?php echo esc_url( home_url( '/cloud-services/storage/' ) ); ?>" target="_blank"><?php echo esc_url( home_url( '/cloud-services/storage/' ) ); ?></a></li>
	</ul>
</div>
