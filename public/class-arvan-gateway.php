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
		$amount = (float) $amount;

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
			$authority   = $body['data']['authority'];
			$payment_url = "https://www.zarinpal.com/pg/StartPay/{$authority}";

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
}
