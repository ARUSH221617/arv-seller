<?php
/**
 * Native IPG Payment Gateway Engine.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Native IPG Payment Gateway Engine.
 *
 * Handles standalone payment requests and verification with payment service
 * providers (Zarinpal / IDPay / Shepa) without requiring WooCommerce or any third-party cart.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public
 */
class Arvan_Gateway {

	/**
	 * Merchant ID / Gateway Key.
	 *
	 * @var string
	 */
	protected $merchant_id;

	/**
	 * Gateway Driver (zarinpal, idpay, shepa).
	 *
	 * @var string
	 */
	protected $driver = 'zarinpal';

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->merchant_id = get_option( 'arvan_gateway_merchant_id', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' );
	}

	/**
	 * Initiate top-up payment request with gateway.
	 *
	 * @param int    $user_id      WordPress User ID.
	 * @param float  $amount       Amount in Toman.
	 * @param string $callback_url URL to return after payment.
	 * @param string $description  Order description.
	 * @return array|WP_Error Array with 'payment_url' and 'authority' or WP_Error.
	 */
	public function request_payment( $user_id, $amount, $callback_url, $description = 'Wallet Top-up' ) {
		$amount = round( (float) $amount, 2 );

		if ( $amount < 1000 ) {
			return new WP_Error( 'invalid_amount', __( 'Minimum deposit amount is 1,000 Tomans.', 'arv-seller' ) );
		}

		// Gateway request payload
		$payload = array(
			'merchant_id'  => $this->merchant_id,
			'amount'       => $amount,
			'callback_url' => $callback_url,
			'description'  => $description,
			'metadata'     => array(
				'user_id' => $user_id,
			),
		);

		// Zarinpal REST API v4
		$response = wp_remote_post(
			'https://api.zarinpal.com/pg/v4/payment/request.json',
			array(
				'body'    => wp_json_encode( $payload ),
				'headers' => array( 'Content-Type' => 'application/json' ),
				'timeout' => 15,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $body['data']['code'] ) && 100 === $body['data']['code'] ) {
			$authority   = sanitize_text_field( $body['data']['authority'] );
			$payment_url = "https://www.zarinpal.com/pg/StartPay/{$authority}";

			global $wpdb;
			$inserted = $wpdb->insert(
				$wpdb->prefix . 'arvan_payments',
				array(
					'user_id'   => absint( $user_id ),
					'gateway'   => $this->driver,
					'authority' => $authority,
					'amount'    => $amount,
					'status'    => 'pending',
					'created_at'=> current_time( 'mysql' ),
				),
				array( '%d', '%s', '%s', '%f', '%s', '%s' )
			);

			if ( false === $inserted ) {
				return new WP_Error( 'payment_persistence_failed', __( 'Payment request could not be recorded. No wallet credit was issued.', 'arv-seller' ) );
			}

			return array(
				'authority'   => $authority,
				'payment_url' => $payment_url,
			);
		}

		return new WP_Error( 'gateway_error', __( 'Failed to connect to payment gateway.', 'arv-seller' ), $body );
	}

	/**
	 * Verify payment callback from gateway.
	 *
	 * @param string $authority Authority / Token returned by gateway.
	 * @param float  $amount    Expected amount.
	 * @return array|WP_Error Array with 'ref_id' and 'card_pan' or WP_Error.
	 */
	public function verify_payment( $authority, $amount ) {
		$payload = array(
			'merchant_id' => $this->merchant_id,
			'amount'      => (float) $amount,
			'authority'   => sanitize_text_field( $authority ),
		);

		$response = wp_remote_post(
			'https://api.zarinpal.com/pg/v4/payment/verify.json',
			array(
				'body'    => wp_json_encode( $payload ),
				'headers' => array( 'Content-Type' => 'application/json' ),
				'timeout' => 15,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $body['data']['code'] ) && in_array( $body['data']['code'], array( 100, 101 ), true ) ) {
			return array(
				'success' => true,
				'ref_id'  => $body['data']['ref_id'],
				'code'    => $body['data']['code'],
			);
		}

		return new WP_Error( 'verification_failed', __( 'Payment verification failed or was cancelled.', 'arv-seller' ), $body );
	}

	/**
	 * Verify and credit one persisted payment exactly once.
	 *
	 * @param string $authority Gateway authority.
	 * @return array|WP_Error
	 */
	public function complete_payment( $authority ) {
		global $wpdb;
		$table = $wpdb->prefix . 'arvan_payments';
		$authority = sanitize_text_field( $authority );
		$payment = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$table} WHERE gateway = %s AND authority = %s LIMIT 1", $this->driver, $authority )
		);

		if ( ! $payment ) {
			return new WP_Error( 'payment_not_found', __( 'Payment request was not found.', 'arv-seller' ) );
		}
		if ( 'verified' === $payment->status ) {
			return array( 'success' => true, 'ref_id' => $payment->gateway_reference, 'already_verified' => true );
		}
		if ( 'pending' !== $payment->status ) {
			return new WP_Error( 'payment_not_pending', __( 'Payment is not pending verification.', 'arv-seller' ) );
		}

		$verification = $this->verify_payment( $authority, (float) $payment->amount );
		if ( is_wp_error( $verification ) ) {
			$wpdb->update( $table, array( 'status' => 'failed' ), array( 'id' => $payment->id, 'status' => 'pending' ), array( '%s' ), array( '%d', '%s' ) );
			return $verification;
		}

		$reference = (string) $verification['ref_id'];
		$credit = Arvan_Wallet::credit(
			(int) $payment->user_id,
			(float) $payment->amount,
			'topup',
			'ZARINPAL-' . $reference,
			sprintf( __( 'Verified Zarinpal wallet top-up (Ref: %s)', 'arv-seller' ), $reference )
		);
		if ( is_wp_error( $credit ) && 'duplicate_transaction' !== $credit->get_error_code() ) {
			return $credit;
		}

		$wpdb->update(
			$table,
			array( 'status' => 'verified', 'gateway_reference' => $reference, 'verified_at' => current_time( 'mysql' ) ),
			array( 'id' => $payment->id, 'status' => 'pending' ),
			array( '%s', '%s', '%s' ),
			array( '%d', '%s' )
		);

		return array( 'success' => true, 'ref_id' => $reference, 'credit' => $credit );
	}
}
