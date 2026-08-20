<?php
/**
 * Admin Panel & Management Controller.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/admin
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Admin Panel & Management Controller.
 *
 * Handles admin menu registration, API key credentials, reseller markup settings,
 * resources oversight, and admin ledger adjustments.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/admin
 */
class Arvan_Admin {

	/**
	 * Plugin identifier.
	 *
	 * @var string
	 */
	private $plugin_name;

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	private $version;

	/**
	 * Initialize the class.
	 *
	 * @param string $plugin_name The ID of this plugin.
	 * @param string $version     The current version of this plugin.
	 */
	public function __construct( $plugin_name = 'arv-seller', $version = '1.0.0' ) {
		$this->plugin_name = $plugin_name;
		$this->version     = $version;
	}

	/**
	 * Register Admin Menus.
	 */
	public function add_admin_menu() {
		add_menu_page(
			__( 'ArvanCloud Reseller', 'arv-seller' ),
			__( 'Arvan Reseller', 'arv-seller' ),
			'manage_options',
			'arvan-reseller',
			array( $this, 'render_settings_page' ),
			'dashicons-cloud',
			56
		);

		add_submenu_page(
			'arvan-reseller',
			__( 'Settings & API', 'arv-seller' ),
			__( 'Settings', 'arv-seller' ),
			'manage_options',
			'arvan-reseller',
			array( $this, 'render_settings_page' )
		);

		add_submenu_page(
			'arvan-reseller',
			__( 'Cloud Resources', 'arv-seller' ),
			__( 'All Resources', 'arv-seller' ),
			'manage_options',
			'arvan-reseller-resources',
			array( $this, 'render_resources_page' )
		);

		add_submenu_page(
			'arvan-reseller',
			__( 'Wallets & Ledger', 'arv-seller' ),
			__( 'Wallets Ledger', 'arv-seller' ),
			'manage_options',
			'arvan-reseller-wallets',
			array( $this, 'render_wallets_page' )
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings() {
		register_setting( 'arvan_settings_group', 'arvan_api_key' );
		register_setting( 'arvan_settings_group', 'arvan_markup_percentage' );
		register_setting( 'arvan_settings_group', 'arvan_currency' );
		register_setting( 'arvan_settings_group', 'arvan_default_region' );
	}

	/**
	 * Render settings page.
	 */
	public function render_settings_page() {
		$settings_view = plugin_dir_path( __FILE__ ) . 'views/admin-settings.php';
		if ( file_exists( $settings_view ) ) {
			include $settings_view;
		}
	}

	/**
	 * Render resources oversight page.
	 */
	public function render_resources_page() {
		global $wpdb;
		$table_resources = $wpdb->prefix . 'arvan_resources';
		$resources       = $wpdb->get_results( "SELECT * FROM {$table_resources} ORDER BY created_at DESC" );
		$currency        = get_option( 'arvan_currency', 'IRT' );
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'All Provisioned Cloud Resources', 'arv-seller' ); ?></h1>
			<table class="wp-list-table widefat fixed striped" style="margin-top: 15px;">
				<thead>
					<tr>
						<th>ID</th>
						<th>User</th>
						<th>Name</th>
						<th>Service</th>
						<th>Arvan UUID</th>
						<th>Region</th>
						<th>Hourly Rate</th>
						<th>Status</th>
						<th>Last Metered</th>
					</tr>
				</thead>
				<tbody>
					<?php if ( ! empty( $resources ) ) : ?>
						<?php foreach ( $resources as $res ) : 
							$user = get_userdata( $res->user_id );
							?>
							<tr>
								<td><?php echo esc_html( $res->id ); ?></td>
								<td><?php echo esc_html( $user ? $user->user_login : "User #{$res->user_id}" ); ?></td>
								<td><strong><?php echo esc_html( $res->name ); ?></strong></td>
								<td><code><?php echo esc_html( $res->service_type ); ?></code></td>
								<td><code><?php echo esc_html( $res->arvan_resource_id ); ?></code></td>
								<td><?php echo esc_html( $res->region ? $res->region : 'N/A' ); ?></td>
								<td><?php echo esc_html( number_format( $res->hourly_cost ) ); ?> <?php echo esc_html( $currency ); ?></td>
								<td><span class="badge"><?php echo esc_html( $res->status ); ?></span></td>
								<td><?php echo esc_html( $res->last_metered_at ? $res->last_metered_at : 'Never' ); ?></td>
							</tr>
						<?php endforeach; ?>
					<?php else : ?>
						<tr><td colspan="9"><?php esc_html_e( 'No resources deployed yet.', 'arv-seller' ); ?></td></tr>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	/**
	 * Render wallets & ledger admin page.
	 */
	public function render_wallets_page() {
		global $wpdb;
		$table_wallets = $wpdb->prefix . 'arvan_wallets';
		$wallets       = $wpdb->get_results( "SELECT * FROM {$table_wallets} ORDER BY balance DESC" );
		$currency      = get_option( 'arvan_currency', 'IRT' );
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Customer Wallets & Balances', 'arv-seller' ); ?></h1>
			<table class="wp-list-table widefat fixed striped" style="margin-top: 15px;">
				<thead>
					<tr>
						<th>Wallet ID</th>
						<th>Customer</th>
						<th>Email</th>
						<th>Balance</th>
						<th>Status</th>
						<th>Created At</th>
					</tr>
				</thead>
				<tbody>
					<?php if ( ! empty( $wallets ) ) : ?>
						<?php foreach ( $wallets as $w ) : 
							$user = get_userdata( $w->user_id );
							?>
							<tr>
								<td>#<?php echo esc_html( $w->id ); ?></td>
								<td><strong><?php echo esc_html( $user ? $user->display_name : "User #{$w->user_id}" ); ?></strong></td>
								<td><?php echo esc_html( $user ? $user->user_email : '&mdash;' ); ?></td>
								<td><strong><?php echo esc_html( number_format( $w->balance ) ); ?> <?php echo esc_html( $currency ); ?></strong></td>
								<td><span class="badge"><?php echo esc_html( $w->status ); ?></span></td>
								<td><?php echo esc_html( $w->created_at ); ?></td>
							</tr>
						<?php endforeach; ?>
					<?php else : ?>
						<tr><td colspan="6"><?php esc_html_e( 'No customer wallets initialized yet.', 'arv-seller' ); ?></td></tr>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}
}
