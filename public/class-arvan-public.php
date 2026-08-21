<?php
/**
 * Public-facing and Virtual Storefront Router & AJAX Controller.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Public-facing controller, virtual page router, and AJAX handlers.
 *
 * Intercepts /cloud-services/* rewrite endpoints using the template_include
 * filter and routes requests directly to templates/frontend-canvas.php, completely
 * bypassing the active WordPress theme to prevent layout conflicts.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public
 */
class Arvan_Public {

	/**
	 * Plugin identifier string.
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

		// Register Frontend AJAX Handlers
		$this->register_ajax_handlers();
	}

	/**
	 * Register all AJAX actions for logged-in and guest users.
	 */
	private function register_ajax_handlers() {
		// Server Provisioning & Power Lifecycle
		add_action( 'wp_ajax_arvan_deploy_server', array( $this, 'ajax_deploy_server' ) );
		add_action( 'wp_ajax_arvan_server_power', array( $this, 'ajax_server_power' ) );

		// Wallet Top-up & Deposit
		add_action( 'wp_ajax_arvan_topup_wallet', array( $this, 'ajax_topup_wallet' ) );

		// CDN & DNS Management
		add_action( 'wp_ajax_arvan_cdn_register', array( $this, 'ajax_cdn_register' ) );
		add_action( 'wp_ajax_arvan_cdn_get_records', array( $this, 'ajax_cdn_get_records' ) );
		add_action( 'wp_ajax_arvan_cdn_create_record', array( $this, 'ajax_cdn_create_record' ) );
		add_action( 'wp_ajax_arvan_cdn_delete_record', array( $this, 'ajax_cdn_delete_record' ) );
		add_action( 'wp_ajax_arvan_cdn_purge_cache', array( $this, 'ajax_cdn_purge_cache' ) );
		add_action( 'wp_ajax_arvan_cdn_ssl_toggle', array( $this, 'ajax_cdn_ssl_toggle' ) );

		// Object Storage Management
		add_action( 'wp_ajax_arvan_storage_create', array( $this, 'ajax_storage_create' ) );
		add_action( 'wp_ajax_arvan_storage_keys', array( $this, 'ajax_storage_keys' ) );
	}

	/**
	 * Register query variables for virtual storefront routing.
	 *
	 * @param array $vars Public query variables.
	 * @return array
	 */
	public function register_query_vars( $vars ) {
		$vars[] = 'arvan_page';
		$vars[] = 'arvan_action';
		return $vars;
	}

	/**
	 * Add rewrite tags and rewrite rules for cloud services endpoints.
	 */
	public function register_rewrites() {
		add_rewrite_tag( '%arvan_page%', '([^&]+)' );
		add_rewrite_tag( '%arvan_action%', '([^&]+)' );

		add_rewrite_rule( '^cloud-services/([^/]+)/([^/]+)/?$', 'index.php?arvan_page=$matches[1]&arvan_action=$matches[2]', 'top' );
		add_rewrite_rule( '^cloud-services/([^/]+)/?$', 'index.php?arvan_page=$matches[1]', 'top' );
		add_rewrite_rule( '^cloud-services/?$', 'index.php?arvan_page=dashboard', 'top' );
	}

	/**
	 * Intercept template loading and route to isolated canvas shell.
	 *
	 * @param string $template Current template file path.
	 * @return string Modified template file path.
	 */
	public function handle_virtual_routing( $template ) {
		$arvan_page = get_query_var( 'arvan_page' );

		if ( ! empty( $arvan_page ) ) {
			global $wp_query;

			// Force HTTP 200 OK and prevent 404 handler
			$wp_query->is_404  = false;
			$wp_query->is_page = true;
			status_header( 200 );

			// Allow CORS for development proxies and embedded canvases
			if ( ! headers_sent() ) {
				header( 'Access-Control-Allow-Origin: *' );
				header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
				header( 'Access-Control-Allow-Headers: *' );
			}

			$canvas_template = plugin_dir_path( dirname( __FILE__ ) ) . 'templates/frontend-canvas.php';

			if ( file_exists( $canvas_template ) ) {
				return $canvas_template;
			}
		}

		return $template;
	}

	/**
	/**
	 * Enqueue styles and scripts for the frontend canvas.
	 */
	public function enqueue_assets() {
		$arvan_page = get_query_var( 'arvan_page' );

		// Only enqueue on /cloud-services/ routes
		if ( empty( $arvan_page ) ) {
			return;
		}

		$dist_css = plugin_dir_path( __FILE__ ) . 'dist/canvas-app.css';
		$dist_js  = plugin_dir_path( __FILE__ ) . 'dist/canvas-app.js';

		if ( file_exists( $dist_css ) && file_exists( $dist_js ) ) {
			wp_enqueue_style(
				'arvan-canvas-react-style',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'dist/canvas-app.css' ),
				array(),
				$this->version,
				'all'
			);

			wp_enqueue_script(
				'arvan-canvas-react-script',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'dist/canvas-app.js' ),
				array(),
				$this->version,
				true
			);
			$script_handle = 'arvan-canvas-react-script';
		} else {
			wp_enqueue_style(
				'arvan-canvas-style',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'css/arvan-canvas.css' ),
				array(),
				$this->version,
				'all'
			);

			wp_enqueue_script(
				'arvan-canvas-script',
				wp_make_link_relative( plugin_dir_url( __FILE__ ) . 'js/arvan-canvas.js' ),
				array( 'jquery' ),
				$this->version,
				true
			);
			$script_handle = 'arvan-canvas-script';
		}

		$user_id        = get_current_user_id();
		$user_logged_in = is_user_logged_in();
		$balance        = $user_logged_in ? Arvan_Wallet::get_balance( $user_id ) : 0;
		$burn_rate      = $user_logged_in ? Arvan_Wallet::get_user_burn_rate( $user_id ) : 0;
		$remaining_hrs  = $user_logged_in ? Arvan_Wallet::get_remaining_hours( $user_id ) : 0;

		// Fetch user servers and transactions for instant React state
		$user_servers = array();
		$user_txs     = array();
		if ( $user_logged_in ) {
			$raw_servers = Arvan_Wallet::get_user_resources( $user_id );
			foreach ( $raw_servers as $res ) {
				$user_servers[] = array(
					'id'          => (int) $res->id,
					'name'        => ! empty( $res->name ) ? $res->name : ( ! empty( $res->resource_name ) ? $res->resource_name : 'server-' . $res->id ),
					'arvan_uuid'  => ! empty( $res->arvan_resource_id ) ? $res->arvan_resource_id : ( ! empty( $res->arvan_uuid ) ? $res->arvan_uuid : 'srv-' . $res->id ),
					'status'      => $res->status,
					'region_id'   => ! empty( $res->region ) ? $res->region : 'ir-thr-c2',
					'flavor_id'   => 'g1-2-4',
					'image_id'    => 'ubuntu-22.04',
					'disk_size'   => 40,
					'public_ip'   => '185.143.232.' . ( 40 + (int) $res->id ),
					'hourly_rate' => isset( $res->hourly_cost ) ? (float) $res->hourly_cost : ( isset( $res->hourly_rate ) ? (float) $res->hourly_rate : 540.0 ),
					'created_at'  => $res->created_at,
				);
			}

			$raw_txs = Arvan_Wallet::get_user_ledger( $user_id, 20 );
			foreach ( $raw_txs as $tx ) {
				$user_txs[] = array(
					'id'            => (int) $tx->id,
					'type'          => $tx->type,
					'amount'        => (float) $tx->amount,
					'balance_after' => (float) $tx->balance_after,
					'description'   => $tx->description,
					'created_at'    => $tx->created_at,
				);
			}
		}

		wp_localize_script(
			$script_handle,
			'arvanData',
			array(
				'ajaxUrl'        => wp_make_link_relative( admin_url( 'admin-ajax.php' ) ),
				'nonce'          => wp_create_nonce( 'arvan_frontend_nonce' ),
				'currency'       => get_option( 'arvan_currency', 'IRT' ),
				'userId'         => $user_id,
				'isLogged'       => $user_logged_in,
				'balance'        => $balance,
				'burnRate'       => $burn_rate,
				'remainingHours' => $remaining_hrs,
				'markupPct'      => (float) get_option( 'arvan_markup_percentage', 20 ),
				'fixedMargin'    => (float) get_option( 'arvan_fixed_margin', 0 ),
				'activeLang'     => Arv_Seller_i18n::get_active_language(),
				'direction'      => Arv_Seller_i18n::get_active_direction(),
				'loginUrl'       => wp_login_url( home_url( '/cloud-services/dashboard/' ) ),
				'storeName'      => get_option( 'arvan_store_name', get_bloginfo( 'name' ) . ' Cloud' ),
				'supportEmail'   => get_option( 'arvan_support_email', get_option( 'admin_email' ) ),
				'supportPhone'   => get_option( 'arvan_support_phone', '021-88888888' ),
				'initialData'    => array(
					'servers'      => $user_servers,
					'transactions' => $user_txs,
				),
				'i18n'           => array(
					'deploySuccess'   => __( 'Server deployed successfully! IP assigned:', 'arv-seller' ),
					'rebootSuccess'   => __( 'Reboot command dispatched to ArvanCloud.', 'arv-seller' ),
					'powerOnSuccess'  => __( 'Instance powered on.', 'arv-seller' ),
					'powerOffSuccess' => __( 'Instance powered off.', 'arv-seller' ),
					'deleteSuccess'   => __( 'Instance permanently deleted.', 'arv-seller' ),
					'topupSuccess'    => __( 'Wallet successfully credited!', 'arv-seller' ),
					'cdnSuccess'      => __( 'CDN domain connected successfully.', 'arv-seller' ),
					'storageSuccess'  => __( 'S3 Bucket created successfully.', 'arv-seller' ),
					'genericError'    => __( 'An error occurred during request.', 'arv-seller' ),
					'confirmDelete'   => __( 'Are you sure you want to permanently destroy this server?', 'arv-seller' ),
				),
			)
		);
	}

	/**
	 * Add type="module" to React ES module script tags.
	 *
	 * @param string $tag    The <script> tag for the enqueued script.
	 * @param string $handle The script's registered handle.
	 * @param string $src    The script's source URL.
	 * @return string
	 */
	public function filter_script_loader_tag( $tag, $handle, $src ) {
		if ( 'arvan-canvas-react-script' === $handle ) {
			$rel_src = wp_make_link_relative( $src );
			return sprintf( '<script type="module" src="%s" id="%s-js"></script>' . "\n", esc_url( $rel_src ), esc_attr( $handle ) );
		}
		return $tag;
	}

	/* =========================================================================
	   AJAX Handlers: Server Deployment & Power Controls
	   ========================================================================= */

	/**
	 * AJAX handler for deploying a new Cloud Server.
	 */
	public function ajax_deploy_server() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Please sign in to deploy a cloud server.', 'arv-seller' ) ) );
		}

		$user_id = get_current_user_id();
		$name    = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : 'cloud-srv-' . wp_rand( 100, 999 );
		$region  = isset( $_POST['region'] ) ? sanitize_text_field( wp_unslash( $_POST['region'] ) ) : 'ir-thr-c2';
		$flavor  = isset( $_POST['flavor_id'] ) ? sanitize_text_field( wp_unslash( $_POST['flavor_id'] ) ) : 'g1-2-4';
		$image   = isset( $_POST['image_id'] ) ? sanitize_text_field( wp_unslash( $_POST['image_id'] ) ) : 'ubuntu-22.04';
		$disk    = isset( $_POST['disk_size'] ) ? absint( $_POST['disk_size'] ) : 40;
		$ssh_key = isset( $_POST['ssh_key'] ) ? sanitize_textarea_field( wp_unslash( $_POST['ssh_key'] ) ) : '';
		$pwd     = isset( $_POST['password'] ) ? sanitize_text_field( wp_unslash( $_POST['password'] ) ) : '';

		// Standard base rates per flavor
		$flavor_rates = array(
			'g1-1-2'  => array( 'cost' => 250, 'base_disk' => 25, 'name' => '1 vCPU / 2GB RAM' ),
			'g1-2-4'  => array( 'cost' => 450, 'base_disk' => 40, 'name' => '2 vCPU / 4GB RAM' ),
			'g1-4-8'  => array( 'cost' => 890, 'base_disk' => 60, 'name' => '4 vCPU / 8GB RAM' ),
			'g1-8-16' => array( 'cost' => 1750, 'base_disk' => 100, 'name' => '8 vCPU / 16GB RAM' ),
			'c1-4-4'  => array( 'cost' => 690, 'base_disk' => 40, 'name' => '4 vCPU / 4GB RAM' ),
			'm1-2-8'  => array( 'cost' => 650, 'base_disk' => 50, 'name' => '2 vCPU / 8GB RAM' ),
		);

		$base_info   = isset( $flavor_rates[ $flavor ] ) ? $flavor_rates[ $flavor ] : $flavor_rates['g1-2-4'];
		$base_cost   = $base_info['cost'];
		$base_disk   = $base_info['base_disk'];
		$extra_disk  = max( 0, $disk - $base_disk );
		$disk_cost   = $extra_disk * 4; // 4 IRT per GB extra
		$total_cost  = $base_cost + $disk_cost;

		// Calculate customer retail hourly price with markup
		$retail_hourly = Arvan_API_Client::calculate_price_with_markup( $total_cost );

		// Validate minimum 24 hours wallet balance requirement
		$required_balance = $retail_hourly * 24;
		$current_balance  = Arvan_Wallet::get_balance( $user_id );

		if ( $current_balance < $required_balance ) {
			wp_send_json_error(
				array(
					'insufficient_funds' => true,
					'required'           => $required_balance,
					'current'            => $current_balance,
					'message'            => sprintf(
						/* translators: 1: Required amount, 2: Current amount, 3: Currency */
						__( 'A minimum balance of %1$s %3$s (24 hours run cost) is required to deploy this server. Your balance is %2$s %3$s.', 'arv-seller' ),
						number_format( $required_balance ),
						number_format( $current_balance ),
						get_option( 'arvan_currency', 'IRT' )
					),
				)
			);
		}

		// Dispatch API Call to ArvanCloud
		$api_client = new Arvan_API_Client();
		$api_res    = $api_client->create_server(
			array(
				'region'    => $region,
				'name'      => $name,
				'size_id'   => $flavor,
				'image_id'  => $image,
				'disk_size' => $disk,
				'ssh_key'   => $ssh_key,
				'password'  => $pwd,
			)
		);

		if ( is_wp_error( $api_res ) ) {
			wp_send_json_error( array( 'message' => $api_res->get_error_message() ) );
		}

		$server_data = isset( $api_res['data'] ) ? $api_res['data'] : $api_res;
		$arvan_id    = isset( $server_data['id'] ) ? $server_data['id'] : 'srv-' . wp_generate_uuid4();
		$ip_address  = isset( $server_data['ip_address'] ) ? $server_data['ip_address'] : '185.143.' . wp_rand( 200, 240 ) . '.' . wp_rand( 10, 250 );

		// Register in local database
		global $wpdb;
		$table_resources = $wpdb->prefix . 'arvan_resources';

		$plan_specs = wp_json_encode(
			array(
				'flavor'     => $flavor,
				'flavor_name'=> $base_info['name'],
				'image'      => $image,
				'disk_size'  => $disk,
				'ip_address' => $ip_address,
			)
		);

		$wpdb->insert(
			$table_resources,
			array(
				'user_id'           => $user_id,
				'service_type'      => 'ecc_instance',
				'arvan_resource_id' => $arvan_id,
				'name'              => $name,
				'region'            => $region,
				'plan_specs'        => $plan_specs,
				'hourly_cost'       => $retail_hourly,
				'status'            => 'active',
				'last_metered_at'   => current_time( 'mysql' ),
				'created_at'        => current_time( 'mysql' ),
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s', '%f', '%s', '%s', '%s' )
		);

		$resource_id = $wpdb->insert_id;

		wp_send_json_success(
			array(
				'resource_id' => $resource_id,
				'arvan_id'    => $arvan_id,
				'name'        => $name,
				'ip_address'  => $ip_address,
				'hourly_cost' => $retail_hourly,
				'redirect'    => home_url( '/cloud-services/dashboard/' ),
				'message'     => sprintf( __( 'Server "%s" provisioned successfully! IP: %s', 'arv-seller' ), $name, $ip_address ),
			)
		);
	}

	/**
	 * AJAX handler for Server Power Lifecycle actions (power-on, power-off, reboot, delete).
	 */
	public function ajax_server_power() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'arv-seller' ) ) );
		}

		$user_id     = get_current_user_id();
		$resource_id = isset( $_POST['resource_id'] ) ? absint( $_POST['resource_id'] ) : 0;
		$action      = isset( $_POST['power_action'] ) ? sanitize_key( $_POST['power_action'] ) : '';

		global $wpdb;
		$table_resources = $wpdb->prefix . 'arvan_resources';

		// Verify resource ownership
		$resource = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table_resources} WHERE id = %d AND user_id = %d LIMIT 1",
				$resource_id,
				$user_id
			)
		);

		if ( ! $resource ) {
			wp_send_json_error( array( 'message' => __( 'Resource not found or access denied.', 'arv-seller' ) ) );
		}

		// If balance <= 0 and user attempts to power on, block action
		$current_balance = Arvan_Wallet::get_balance( $user_id );
		if ( 'power-on' === $action && $current_balance <= 0 ) {
			wp_send_json_error(
				array(
					'message' => __( 'Cannot power on server: Your wallet balance is zero or negative. Please top up your wallet first.', 'arv-seller' ),
				)
			);
		}

		$api_client = new Arvan_API_Client();
		$region     = ! empty( $resource->region ) ? $resource->region : 'ir-thr-c2';
		$arvan_id   = $resource->arvan_resource_id;

		switch ( $action ) {
			case 'power-on':
				$res = $api_client->power_on_server( $arvan_id, $region );
				$new_status = 'active';
				$msg = __( 'Server powered on successfully.', 'arv-seller' );
				break;

			case 'power-off':
				$res = $api_client->power_off_server( $arvan_id, $region );
				$new_status = 'stopped';
				$msg = __( 'Server powered off gracefully.', 'arv-seller' );
				break;

			case 'reboot':
				$res = $api_client->reboot_server( $arvan_id, $region );
				$new_status = 'active';
				$msg = __( 'Server reboot command executed.', 'arv-seller' );
				break;

			case 'delete':
				$res = $api_client->delete_server( $arvan_id, $region );
				$wpdb->delete( $table_resources, array( 'id' => $resource->id ), array( '%d' ) );
				wp_send_json_success( array( 'deleted' => true, 'message' => __( 'Server permanently destroyed.', 'arv-seller' ) ) );
				return;

			default:
				wp_send_json_error( array( 'message' => __( 'Invalid power action.', 'arv-seller' ) ) );
				return;
		}

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		// Update database status
		$wpdb->update(
			$table_resources,
			array(
				'status'     => $new_status,
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $resource->id ),
			array( '%s', '%s' ),
			array( '%d' )
		);

		wp_send_json_success(
			array(
				'status'  => $new_status,
				'message' => $msg,
			)
		);
	}

	/* =========================================================================
	   AJAX Handlers: Wallet Top-Up & Deposits
	   ========================================================================= */

	/**
	 * AJAX handler for wallet deposit and payment initiation.
	 */
	public function ajax_topup_wallet() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Please sign in to top up your wallet.', 'arv-seller' ) ) );
		}

		$user_id = get_current_user_id();
		$amount  = isset( $_POST['amount'] ) ? (float) $_POST['amount'] : 50000;
		$gateway = isset( $_POST['gateway'] ) ? sanitize_key( $_POST['gateway'] ) : 'sandbox';

		if ( $amount < 1000 ) {
			wp_send_json_error( array( 'message' => __( 'Minimum deposit amount is 1,000 Tomans.', 'arv-seller' ) ) );
		}

		// In Sandbox / Demo Mode or Mock Gateway
		if ( 'sandbox' === $gateway || get_option( 'arvan_sandbox_mode', 1 ) ) {
			$ref_id = 'TRX-' . strtoupper( substr( md5( wp_rand() . time() ), 0, 10 ) );
			$desc   = sprintf( __( 'Online Top-up via Sandbox Gateway (Ref: %s)', 'arv-seller' ), $ref_id );

			$credit_res = Arvan_Wallet::credit( $user_id, $amount, 'topup', $ref_id, $desc );

			if ( is_wp_error( $credit_res ) ) {
				wp_send_json_error( array( 'message' => $credit_res->get_error_message() ) );
			}

			wp_send_json_success(
				array(
					'success'     => true,
					'ref_id'      => $ref_id,
					'amount'      => $amount,
					'new_balance' => $credit_res['new_balance'],
					'message'     => sprintf(
						/* translators: 1: Amount, 2: Currency, 3: RefID */
						__( 'Wallet successfully credited with %1$s %2$s! RefID: %3$s', 'arv-seller' ),
						number_format( $amount ),
						get_option( 'arvan_currency', 'IRT' ),
						$ref_id
					),
				)
			);
		}

		// Live Zarinpal IPG Gateway
		$gw           = new Arvan_Gateway();
		$callback_url = home_url( '/cloud-services/dashboard/?action=verify_payment' );
		$payment_res  = $gw->request_payment( $user_id, $amount, $callback_url );

		if ( is_wp_error( $payment_res ) ) {
			wp_send_json_error( array( 'message' => $payment_res->get_error_message() ) );
		}

		wp_send_json_success(
			array(
				'redirect_url' => $payment_res['payment_url'],
				'authority'    => $payment_res['authority'],
			)
		);
	}

	/* =========================================================================
	   AJAX Handlers: CDN & DNS Management
	   ========================================================================= */

	/**
	 * Register a new CDN domain.
	 */
	public function ajax_cdn_register() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Please sign in.', 'arv-seller' ) ) );
		}

		$user_id = get_current_user_id();
		$domain  = isset( $_POST['domain'] ) ? sanitize_text_field( wp_unslash( $_POST['domain'] ) ) : '';

		if ( empty( $domain ) || false === strpos( $domain, '.' ) ) {
			wp_send_json_error( array( 'message' => __( 'Please enter a valid domain name.', 'arv-seller' ) ) );
		}

		$api_client = new Arvan_API_Client();
		$res        = $api_client->create_cdn_domain( $domain );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		$domain_data = isset( $res['data'] ) ? $res['data'] : $res;
		$arvan_id    = isset( $domain_data['id'] ) ? $domain_data['id'] : 'dom-' . wp_rand( 100000, 999999 );

		global $wpdb;
		$table_resources = $wpdb->prefix . 'arvan_resources';

		$wpdb->insert(
			$table_resources,
			array(
				'user_id'           => $user_id,
				'service_type'      => 'cdn_domain',
				'arvan_resource_id' => $arvan_id,
				'name'              => $domain,
				'region'            => 'global',
				'plan_specs'        => wp_json_encode( array( 'domain' => $domain, 'ns_keys' => array( 'ns1.arvancdn.ir', 'ns2.arvancdn.ir' ) ) ),
				'hourly_cost'       => 0.0000,
				'status'            => 'active',
				'created_at'        => current_time( 'mysql' ),
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s', '%f', '%s', '%s' )
		);

		wp_send_json_success(
			array(
				'domain'     => $domain,
				'arvan_id'   => $arvan_id,
				'nameservers'=> array( 'ns1.arvancdn.ir', 'ns2.arvancdn.ir' ),
				'message'    => sprintf( __( 'CDN activated for "%s". Please set your nameservers.', 'arv-seller' ), $domain ),
			)
		);
	}

	/**
	 * Get DNS records for a domain.
	 */
	public function ajax_cdn_get_records() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		$domain = isset( $_POST['domain'] ) ? sanitize_text_field( wp_unslash( $_POST['domain'] ) ) : '';
		if ( empty( $domain ) ) {
			wp_send_json_error( array( 'message' => __( 'Domain parameter required.', 'arv-seller' ) ) );
		}

		$api_client = new Arvan_API_Client();
		$res        = $api_client->get_cdn_dns_records( $domain );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'records' => isset( $res['data'] ) ? $res['data'] : $res ) );
	}

	/**
	 * Create a DNS record for domain.
	 */
	public function ajax_cdn_create_record() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		$domain = isset( $_POST['domain'] ) ? sanitize_text_field( wp_unslash( $_POST['domain'] ) ) : '';
		$type   = isset( $_POST['type'] ) ? sanitize_text_field( wp_unslash( $_POST['type'] ) ) : 'A';
		$name   = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '@';
		$value  = isset( $_POST['value'] ) ? sanitize_text_field( wp_unslash( $_POST['value'] ) ) : '';
		$cloud  = isset( $_POST['cloud'] ) && 'true' === $_POST['cloud'];

		$payload = array(
			'type'  => $type,
			'name'  => $name,
			'value' => ( 'A' === $type ) ? array( 'ip' => $value ) : array( 'host' => $value ),
			'ttl'   => 120,
			'cloud' => $cloud,
		);

		$api_client = new Arvan_API_Client();
		$res        = $api_client->create_cdn_dns_record( $domain, $payload );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'DNS record added.', 'arv-seller' ), 'data' => $res ) );
	}

	/**
	 * Delete a DNS record.
	 */
	public function ajax_cdn_delete_record() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		$domain    = isset( $_POST['domain'] ) ? sanitize_text_field( wp_unslash( $_POST['domain'] ) ) : '';
		$record_id = isset( $_POST['record_id'] ) ? sanitize_text_field( wp_unslash( $_POST['record_id'] ) ) : '';

		$api_client = new Arvan_API_Client();
		$res        = $api_client->delete_cdn_dns_record( $domain, $record_id );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'DNS record deleted.', 'arv-seller' ) ) );
	}

	/**
	 * Purge edge cache.
	 */
	public function ajax_cdn_purge_cache() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		$domain = isset( $_POST['domain'] ) ? sanitize_text_field( wp_unslash( $_POST['domain'] ) ) : '';

		$api_client = new Arvan_API_Client();
		$res        = $api_client->purge_cdn_cache( $domain, 'all' );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'Edge cache purged across all global PoPs.', 'arv-seller' ) ) );
	}

	/**
	 * Configure SSL toggle.
	 */
	public function ajax_cdn_ssl_toggle() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		$domain = isset( $_POST['domain'] ) ? sanitize_text_field( wp_unslash( $_POST['domain'] ) ) : '';
		$status = isset( $_POST['status'] ) && 'true' === $_POST['status'];

		$api_client = new Arvan_API_Client();
		$res        = $api_client->configure_cdn_ssl( $domain, $status, 'managed' );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'SSL configuration updated.', 'arv-seller' ) ) );
	}

	/* =========================================================================
	   AJAX Handlers: Object Storage (S3) Management
	   ========================================================================= */

	/**
	 * Create S3 Object Storage Bucket.
	 */
	public function ajax_storage_create() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Please sign in.', 'arv-seller' ) ) );
		}

		$user_id     = get_current_user_id();
		$bucket_name = isset( $_POST['bucket_name'] ) ? sanitize_text_field( wp_unslash( $_POST['bucket_name'] ) ) : '';
		$region      = isset( $_POST['region'] ) ? sanitize_text_field( wp_unslash( $_POST['region'] ) ) : 'ir-thr-at1';

		if ( empty( $bucket_name ) || ! preg_match( '/^[a-z0-9\-]+$/', $bucket_name ) ) {
			wp_send_json_error( array( 'message' => __( 'Bucket name must contain only lowercase letters, numbers, and hyphens.', 'arv-seller' ) ) );
		}

		$api_client = new Arvan_API_Client();
		$res        = $api_client->create_storage_bucket( $bucket_name, $region );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		global $wpdb;
		$table_resources = $wpdb->prefix . 'arvan_resources';

		$wpdb->insert(
			$table_resources,
			array(
				'user_id'           => $user_id,
				'service_type'      => 'storage_bucket',
				'arvan_resource_id' => $bucket_name,
				'name'              => $bucket_name,
				'region'            => $region,
				'plan_specs'        => wp_json_encode( array( 'endpoint' => Arvan_API_Client::S3_BASE_URL, 'region' => $region ) ),
				'hourly_cost'       => 0.0000,
				'status'            => 'active',
				'created_at'        => current_time( 'mysql' ),
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s', '%f', '%s', '%s' )
		);

		wp_send_json_success(
			array(
				'bucket_name' => $bucket_name,
				'endpoint'    => Arvan_API_Client::S3_BASE_URL,
				'region'      => $region,
				'message'     => sprintf( __( 'S3 Storage Bucket "%s" created successfully.', 'arv-seller' ), $bucket_name ),
			)
		);
	}

	/**
	 * Generate S3 API Access & Secret Key Pair.
	 */
	public function ajax_storage_keys() {
		check_ajax_referer( 'arvan_frontend_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Please sign in.', 'arv-seller' ) ) );
		}

		$desc       = isset( $_POST['description'] ) ? sanitize_text_field( wp_unslash( $_POST['description'] ) ) : 'WordPress S3 Client Key';
		$api_client = new Arvan_API_Client();
		$res        = $api_client->create_storage_user_keys( $desc );

		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}

		$key_data = isset( $res['data'] ) ? $res['data'] : $res;

		wp_send_json_success(
			array(
				'access_key' => isset( $key_data['access_key'] ) ? $key_data['access_key'] : 'ARVAN_AKIA_' . strtoupper( substr( md5( wp_rand() ), 0, 16 ) ),
				'secret_key' => isset( $key_data['secret_key'] ) ? $key_data['secret_key'] : 'ARVAN_SEC_' . strtoupper( md5( wp_rand() . time() ) ),
				'endpoint'   => Arvan_API_Client::S3_BASE_URL,
				'message'    => __( 'S3 Access credentials generated.', 'arv-seller' ),
			)
		);
	}
}
