<?php
/**
 * Atomic Wallet Ledger Engine.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Atomic Wallet Ledger Engine.
 *
 * Provides thread-safe, ACID-compliant balance credit and debit operations
 * utilizing database row locks (SELECT ... FOR UPDATE) and explicit transaction
 * management to prevent race conditions during concurrent requests or metering cycles.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */
class Arvan_Wallet {

	/**
	 * Retrieve or create a user's wallet.
	 *
	 * @param int $user_id WordPress user ID.
	 * @return object Database row object of the wallet.
	 */
	public static function get_or_create_wallet( $user_id ) {
		global $wpdb;
		$user_id       = absint( $user_id );
		$table_wallets = $wpdb->prefix . 'arvan_wallets';

		$wallet = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$table_wallets} WHERE user_id = %d LIMIT 1", $user_id )
		);

		if ( ! $wallet ) {
			$currency = get_option( 'arvan_currency', 'IRT' );
			$wpdb->insert(
				$table_wallets,
				array(
					'user_id'    => $user_id,
					'balance'    => 0.00,
					'currency'   => $currency,
					'status'     => 'active',
					'created_at' => current_time( 'mysql' ),
				),
				array( '%d', '%f', '%s', '%s', '%s' )
			);

			$wallet = $wpdb->get_row(
				$wpdb->prepare( "SELECT * FROM {$table_wallets} WHERE user_id = %d LIMIT 1", $user_id )
			);
		}

		return $wallet;
	}

	/**
	 * Get current wallet balance for a user.
	 *
	 * @param int $user_id WordPress user ID.
	 * @return float Current balance (e.g. Tomans).
	 */
	public static function get_balance( $user_id ) {
		$wallet = self::get_or_create_wallet( $user_id );
		return (float) ( $wallet ? $wallet->balance : 0.00 );
	}

	/**
	 * Check if a user has sufficient balance for an operation.
	 *
	 * @param int   $user_id WordPress user ID.
	 * @param float $amount  Required amount.
	 * @return bool True if balance >= amount.
	 */
	public static function has_sufficient_balance( $user_id, $amount ) {
		$balance = self::get_balance( $user_id );
		return ( $balance >= (float) $amount );
	}

	/**
	 * Atomically credit funds to a user's wallet.
	 *
	 * @param int         $user_id      WordPress user ID.
	 * @param float       $amount       Amount to credit (positive number).
	 * @param string      $type         Transaction type ('topup', 'credit', 'refund', 'bonus').
	 * @param string|null $reference_id Gateway authority, payment RefID, or order ID.
	 * @param string|null $description  Human-readable description.
	 * @return array|WP_Error Array with new_balance and transaction_id, or WP_Error.
	 */
	public static function credit( $user_id, $amount, $type = 'credit', $reference_id = null, $description = null ) {
		global $wpdb;

		$user_id = absint( $user_id );
		$amount  = (float) $amount;

		if ( $amount <= 0 ) {
			return new WP_Error( 'invalid_amount', __( 'Credit amount must be greater than zero.', 'arv-seller' ) );
		}

		$table_wallets      = $wpdb->prefix . 'arvan_wallets';
		$table_transactions = $wpdb->prefix . 'arvan_transactions';

		// Ensure wallet exists before locking
		self::get_or_create_wallet( $user_id );

		// Begin ACID transaction with row lock
		$wpdb->query( 'START TRANSACTION' );

		$wallet = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT id, balance, status FROM {$table_wallets} WHERE user_id = %d FOR UPDATE",
				$user_id
			)
		);

		if ( ! $wallet ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_Error( 'wallet_not_found', __( 'Wallet could not be found.', 'arv-seller' ) );
		}

		$new_balance = round( (float) $wallet->balance + $amount, 2 );

		// Update wallet
		$updated = $wpdb->update(
			$table_wallets,
			array(
				'balance'    => $new_balance,
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $wallet->id ),
			array( '%f', '%s' ),
			array( '%d' )
		);

		if ( false === $updated ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_Error( 'db_error', __( 'Failed to update wallet balance.', 'arv-seller' ) );
		}

		// Insert transaction record
		$inserted = $wpdb->insert(
			$table_transactions,
			array(
				'user_id'       => $user_id,
				'wallet_id'     => $wallet->id,
				'type'          => sanitize_text_field( $type ),
				'amount'        => $amount,
				'balance_after' => $new_balance,
				'reference_id'  => sanitize_text_field( $reference_id ),
				'description'   => sanitize_textarea_field( $description ),
				'status'        => 'completed',
				'created_at'    => current_time( 'mysql' ),
			),
			array( '%d', '%d', '%s', '%f', '%f', '%s', '%s', '%s', '%s' )
		);

		if ( false === $inserted ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_Error( 'db_error', __( 'Failed to log wallet transaction.', 'arv-seller' ) );
		}

		$transaction_id = $wpdb->insert_id;
		$wpdb->query( 'COMMIT' );

		do_action( 'arvan_wallet_credited', $user_id, $amount, $new_balance, $transaction_id );

		return array(
			'success'        => true,
			'new_balance'    => $new_balance,
			'transaction_id' => $transaction_id,
		);
	}

	/**
	 * Atomically debit funds from a user's wallet.
	 *
	 * @param int         $user_id        WordPress user ID.
	 * @param float       $amount         Amount to debit (positive number).
	 * @param string      $type           Transaction type ('hourly_metering', 'provision_fee', 'debit').
	 * @param string|null $reference_id   Resource UUID or ID.
	 * @param string|null $description    Human-readable description.
	 * @param bool        $allow_negative Whether balance is allowed to go negative before suspension.
	 * @return array|WP_Error Array with new_balance and transaction_id, or WP_Error.
	 */
	public static function debit( $user_id, $amount, $type = 'debit', $reference_id = null, $description = null, $allow_negative = false ) {
		global $wpdb;

		$user_id = absint( $user_id );
		$amount  = (float) $amount;

		if ( $amount <= 0 ) {
			return new WP_Error( 'invalid_amount', __( 'Debit amount must be greater than zero.', 'arv-seller' ) );
		}

		$table_wallets      = $wpdb->prefix . 'arvan_wallets';
		$table_transactions = $wpdb->prefix . 'arvan_transactions';

		// Ensure wallet exists before locking
		self::get_or_create_wallet( $user_id );

		// Begin ACID transaction with row lock
		$wpdb->query( 'START TRANSACTION' );

		$wallet = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT id, balance, status FROM {$table_wallets} WHERE user_id = %d FOR UPDATE",
				$user_id
			)
		);

		if ( ! $wallet ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_Error( 'wallet_not_found', __( 'Wallet could not be found.', 'arv-seller' ) );
		}

		if ( 'frozen' === $wallet->status ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_Error( 'wallet_frozen', __( 'Wallet is frozen. Cannot perform debit.', 'arv-seller' ) );
		}

		$current_balance = (float) $wallet->balance;

		if ( ! $allow_negative && ( $current_balance < $amount ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_Error(
				'insufficient_balance',
				__( 'Insufficient wallet balance.', 'arv-seller' ),
				array(
					'current_balance' => $current_balance,
					'required'        => $amount,
				)
			);
		}

		$new_balance = round( $current_balance - $amount, 2 );

		// Update wallet
		$updated = $wpdb->update(
			$table_wallets,
			array(
				'balance'    => $new_balance,
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $wallet->id ),
			array( '%f', '%s' ),
			array( '%d' )
		);

		if ( false === $updated ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_Error( 'db_error', __( 'Failed to update wallet balance.', 'arv-seller' ) );
		}

		// Insert transaction record
		$inserted = $wpdb->insert(
			$table_transactions,
			array(
				'user_id'       => $user_id,
				'wallet_id'     => $wallet->id,
				'type'          => sanitize_text_field( $type ),
				'amount'        => $amount,
				'balance_after' => $new_balance,
				'reference_id'  => sanitize_text_field( $reference_id ),
				'description'   => sanitize_textarea_field( $description ),
				'status'        => 'completed',
				'created_at'    => current_time( 'mysql' ),
			),
			array( '%d', '%d', '%s', '%f', '%f', '%s', '%s', '%s', '%s' )
		);

		if ( false === $inserted ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_Error( 'db_error', __( 'Failed to log wallet transaction.', 'arv-seller' ) );
		}

		$transaction_id = $wpdb->insert_id;
		$wpdb->query( 'COMMIT' );

		do_action( 'arvan_wallet_debited', $user_id, $amount, $new_balance, $transaction_id );

		return array(
			'success'        => true,
			'new_balance'    => $new_balance,
			'transaction_id' => $transaction_id,
		);
	}

	/**
	 * Retrieve paginated transaction ledger for a user.
	 *
	 * @param int $user_id WordPress user ID.
	 * @param int $limit   Items per page.
	 * @param int $offset  Query offset.
	 * @return array Array of transaction row objects.
	 */
	public static function get_user_transactions( $user_id, $limit = 20, $offset = 0 ) {
		global $wpdb;
		$table_transactions = $wpdb->prefix . 'arvan_transactions';

		return $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table_transactions} WHERE user_id = %d ORDER BY created_at DESC LIMIT %d OFFSET %d",
				absint( $user_id ),
				absint( $limit ),
				absint( $offset )
			)
		);
	}
}
