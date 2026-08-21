(function( $ ) {
	'use strict';

	$(document).ready(function() {

		// 1. Test API Connection Button
		$('#arvan-test-api-btn').on('click', function(e) {
			e.preventDefault();
			var $btn = $(this);
			var apiKey = $('#arvan_api_key').val();
			var $result = $('#arvan-api-test-result');

			$btn.prop('disabled', true);
			$result.html('<span class="spinner is-active" style="float:none; margin:0 5px 0 0;"></span> ' + arvanAdminData.i18n.testingApi);

			$.ajax({
				url: arvanAdminData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_test_api_connection',
					nonce: arvanAdminData.nonce,
					api_key: apiKey
				},
				success: function(response) {
					$btn.prop('disabled', false);
					if (response.success) {
						$result.html('<span style="color:#008a00; font-weight:600;"><span class="dashicons dashicons-yes-alt" style="vertical-align:middle;"></span> ' + response.data.message + '</span>');
					} else {
						$result.html('<span style="color:#dc2626; font-weight:600;"><span class="dashicons dashicons-dismiss" style="vertical-align:middle;"></span> ' + response.data.message + '</span>');
					}
				},
				error: function() {
					$btn.prop('disabled', false);
					$result.html('<span style="color:#dc2626;">' + (arvanAdminData.i18n.networkTestError || 'Network error while testing connection.') + '</span>');
				}
			});
		});

		// 2. Open Balance Adjustment Modal
		$('.arvan-adjust-balance-btn').on('click', function() {
			var userId = $(this).data('user-id');
			var name = $(this).data('name');
			$('#adjust_user_id').val(userId);
			$('#adjust-modal-title').text((arvanAdminData.i18n.adjustWalletTitle || 'Adjust Wallet Balance: ') + name);
			$('#arvan-adjust-modal').fadeIn(150);
		});

		$('.arvan-modal-close, .arvan-modal-cancel').on('click', function() {
			$('#arvan-adjust-modal').fadeOut(150);
		});

		// 3. Submit Balance Adjustment Form
		$('#arvan-admin-adjust-form').on('submit', function(e) {
			e.preventDefault();
			var $form = $(this);
			var $submitBtn = $form.find('button[type="submit"]');

			$submitBtn.prop('disabled', true).text(arvanAdminData.i18n.applying || 'Applying...');

			$.ajax({
				url: arvanAdminData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_admin_adjust_balance',
					nonce: arvanAdminData.nonce,
					user_id: $('#adjust_user_id').val(),
					type: $('#adjust_type').val(),
					amount: $('#adjust_amount').val(),
					reason: $('#adjust_reason').val()
				},
				success: function(response) {
					$submitBtn.prop('disabled', false).text(arvanAdminData.i18n.applyAdjustment || 'Apply Adjustment');
					if (response.success) {
						alert(arvanAdminData.i18n.adjustSuccess);
						location.reload();
					} else {
						alert(response.data.message);
					}
				},
				error: function() {
					$submitBtn.prop('disabled', false).text(arvanAdminData.i18n.applyAdjustment || 'Apply Adjustment');
					alert(arvanAdminData.i18n.networkError || 'Network error.');
				}
			});
		});

		// 4. Emergency Resource Actions (Power Off / Purge)
		$('.arvan-res-action-btn').on('click', function() {
			var $btn = $(this);
			var resId = $btn.data('id');
			var act = $btn.data('action');

			if (act === 'force_delete' && !confirm(arvanAdminData.i18n.confirmPurge)) {
				return;
			}

			$btn.prop('disabled', true);

			$.ajax({
				url: arvanAdminData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_admin_resource_action',
					nonce: arvanAdminData.nonce,
					resource_id: resId,
					resource_action: act
				},
				success: function(response) {
					if (response.success) {
						if (act === 'force_delete') {
							$('#res-row-' + resId).fadeOut(300, function() { $(this).remove(); });
						} else {
							location.reload();
						}
					} else {
						alert(response.data.message);
						$btn.prop('disabled', false);
					}
				},
				error: function() {
					alert(arvanAdminData.i18n.networkError || 'Network error.');
					$btn.prop('disabled', false);
				}
			});
		});

		// 5. Trigger Manual Metering Cycle
		$('#arvan-trigger-metering-btn').on('click', function() {
			var $btn = $(this);
			$btn.prop('disabled', true).text(arvanAdminData.i18n.runningMetering || 'Running Metering...');

			$.ajax({
				url: arvanAdminData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_admin_resource_action',
					nonce: arvanAdminData.nonce,
					resource_action: 'trigger_metering'
				},
				success: function(response) {
					$btn.prop('disabled', false).html('<span class="dashicons dashicons-update" style="vertical-align:middle;margin-top:-2px;"></span> ' + (arvanAdminData.i18n.runMeteringNow || 'Run Metering Cycle Now'));
					if (response.success) {
						alert(response.data.message);
						location.reload();
					} else {
						alert(response.data.message);
					}
				},
				error: function() {
					$btn.prop('disabled', false).html('<span class="dashicons dashicons-update" style="vertical-align:middle;margin-top:-2px;"></span> ' + (arvanAdminData.i18n.runMeteringNow || 'Run Metering Cycle Now'));
					alert(arvanAdminData.i18n.networkError || 'Network error.');
				}
			});
		});

	});

})( jQuery );
