/**
 * ArvanCloud Standalone Canvas Interactive Engine.
 * 
 * Handles real-time dynamic pricing, server deployment AJAX, power controls,
 * atomic wallet top-up, CDN DNS zone editor, S3 bucket/key modals, and toast notifications.
 */
(function($) {
	'use strict';

	$(document).ready(function() {

		// =========================================================================
		// Toast Notification System
		// =========================================================================
		function showToast(message, type) {
			type = type || 'success';
			var $toast = $('<div class="arvan-toast arvan-toast-' + type + '">' + message + '</div>');
			$('#arvan-toast-container').append($toast);
			setTimeout(function() {
				$toast.fadeOut(300, function() { $(this).remove(); });
			}, 4000);
		}

		// Copy to Clipboard Helper
		$('.arvan-copy-btn').on('click', function() {
			var targetId = $(this).data('target');
			var copyText = document.getElementById(targetId);
			if (copyText) {
				copyText.select();
				copyText.setSelectionRange(0, 99999);
				navigator.clipboard.writeText(copyText.value);
				showToast('Copied to clipboard!', 'info');
			}
		});

		// =========================================================================
		// Multi-Language Switcher Dropdown
		// =========================================================================
		$('#arvan-lang-trigger-btn').on('click', function(e) {
			e.stopPropagation();
			$(this).closest('.arvan-lang-dropdown').toggleClass('open');
		});

		$(document).on('click', function(e) {
			if (!$(e.target).closest('.arvan-lang-dropdown').length) {
				$('.arvan-lang-dropdown').removeClass('open');
			}
		});

		$('.arvan-lang-item').on('click', function(e) {
			var lang = $(this).data('lang');
			document.cookie = "arvan_lang=" + lang + ";path=/;max-age=" + (86400 * 30);
		});

		// =========================================================================
		// Configurator: Dynamic Spec & Pricing Engine
		// =========================================================================

		// 1. Tier Tab Filters
		$('.arvan-tab-btn').on('click', function() {
			$('.arvan-tab-btn').removeClass('active');
			$(this).addClass('active');
			var filter = $(this).data('filter');

			if (filter === 'all') {
				$('.arvan-plan-card').show();
			} else {
				$('.arvan-plan-card').each(function() {
					if ($(this).data('tier') === filter) {
						$(this).show();
					} else {
						$(this).hide();
					}
				});
			}
		});

		// 2. Select Box (Region)
		$('.arvan-select-box').on('click', function() {
			$('.arvan-select-box').removeClass('active');
			$(this).addClass('active');
			$(this).find('input[type="radio"]').prop('checked', true);
			recalculatePricing();
		});

		// 3. Plan / Flavor Selection
		$('.arvan-plan-card').on('click', function() {
			$('.arvan-plan-card').removeClass('active');
			$(this).addClass('active');
			$(this).find('input[type="radio"]').prop('checked', true);

			// Adjust slider minimum to flavor's base disk
			var baseDisk = $(this).data('base-disk') || 25;
			var currentSliderVal = parseInt($('#arvan_disk_slider').val(), 10) || 40;
			if (currentSliderVal < baseDisk) {
				$('#arvan_disk_slider').val(baseDisk);
				$('#arvan-disk-display').text(baseDisk);
			}

			recalculatePricing();
		});

		// 4. NVMe Storage Slider Input
		$('#arvan_disk_slider').on('input change', function() {
			var diskVal = $(this).val();
			$('#arvan-disk-display').text(diskVal);
			recalculatePricing();
		});

		// 5. OS Selection
		$('.arvan-os-item').on('click', function() {
			$('.arvan-os-item').removeClass('active');
			$(this).addClass('active');
			$(this).find('input[type="radio"]').prop('checked', true);
			recalculatePricing();
		});

		// 6. Auth Mode Toggle (SSH vs Password)
		$('input[name="auth_mode"]').on('change', function() {
			if ($(this).val() === 'password') {
				$('#arvan-ssh-field').hide();
				$('#arvan-pwd-field').show();
			} else {
				$('#arvan-ssh-field').show();
				$('#arvan-pwd-field').hide();
			}
		});

		// 7. Password Generator Tool
		$('#arvan-gen-pwd-btn').on('click', function(e) {
			e.preventDefault();
			var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
			var pass = '';
			for (var i = 0; i < 16; i++) {
				pass += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			$('#arvan_password').val(pass);
			showToast('Strong password generated!', 'info');
		});

		// Recalculate Dynamic Pricing & Summary Sidebar
		function recalculatePricing() {
			// Region Summary
			var activeRegionTitle = $('.arvan-select-box.active').data('region-title') || 'Tehran (Forough)';
			$('#summary-region').text(activeRegionTitle);

			// Flavor Specs & Calculation
			var $activePlan = $('.arvan-plan-card.active');
			if ($activePlan.length) {
				var baseCost = parseFloat($activePlan.data('base-cost')) || 450;
				var baseDisk = parseInt($activePlan.data('base-disk'), 10) || 40;
				var planName = $activePlan.find('.arvan-plan-header strong').text();
				var specs = $activePlan.data('specs') || '2 vCPU / 4 GB RAM';

				var currentDisk = parseInt($('#arvan_disk_slider').val(), 10) || baseDisk;
				var extraDisk = Math.max(0, currentDisk - baseDisk);
				var extraDiskCost = extraDisk * 4; // 4 IRT per GB per hour

				var wholesaleHourly = baseCost + extraDiskCost;
				var markupPct = (window.arvanData && window.arvanData.markupPct) ? window.arvanData.markupPct : 20;
				var fixedMargin = (window.arvanData && window.arvanData.fixedMargin) ? window.arvanData.fixedMargin : 0;

				var customerHourly = Math.round((wholesaleHourly * (1 + (markupPct / 100))) + fixedMargin);
				var customerMonthly = customerHourly * 720; // 720 hours in 30 days

				$('#summary-plan').text(planName + ' (' + specs + ')');
				$('#summary-disk').text(currentDisk + ' GB NVMe');
				$('#summary-hourly').text(customerHourly.toLocaleString());
				$('#summary-monthly').text(customerMonthly.toLocaleString());

				// Minimum balance check (24 hours)
				var reqBalance = customerHourly * 24;
				var userBal = (window.arvanData && window.arvanData.balance) ? window.arvanData.balance : 0;
				if (userBal < reqBalance) {
					$('#arvan-balance-notice').show();
				} else {
					$('#arvan-balance-notice').hide();
				}
			}

			// OS Summary
			var activeOSName = $('.arvan-os-item.active').data('os-name') || 'Ubuntu 22.04 LTS';
			$('#summary-os').text(activeOSName);
		}

		// Initial calculation run
		recalculatePricing();

		// =========================================================================
		// Server Provisioning Form Submission
		// =========================================================================
		$('#arvan-server-configurator').on('submit', function(e) {
			e.preventDefault();

			if (!window.arvanData.isLogged) {
				window.location.href = window.arvanData.loginUrl;
				return;
			}

			var $btn = $('#arvan-deploy-btn');
			$btn.prop('disabled', true).find('span').text('Provisioning on ArvanCloud...');

			var formData = {
				action: 'arvan_deploy_server',
				nonce: window.arvanData.nonce,
				region: $('input[name="region"]:checked').val(),
				flavor_id: $('input[name="flavor_id"]:checked').val(),
				image_id: $('input[name="image_id"]:checked').val(),
				disk_size: $('#arvan_disk_slider').val(),
				name: $('#arvan_server_name').val(),
				ssh_key: $('#arvan_ssh_key').val(),
				password: $('#arvan_password').val()
			};

			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: formData,
				success: function(response) {
					$btn.prop('disabled', false).find('span').text('Instant Provision Cloud Server');
					if (response.success) {
						showToast(response.data.message, 'success');
						setTimeout(function() {
							window.location.href = response.data.redirect;
						}, 1200);
					} else {
						if (response.data && response.data.insufficient_funds) {
							// Open Quick Top-Up Modal
							$('#arvan-modal-topup').fadeIn(150);
							showToast(response.data.message, 'error');
						} else {
							showToast(response.data ? response.data.message : 'Provisioning failed.', 'error');
						}
					}
				},
				error: function() {
					$btn.prop('disabled', false).find('span').text('Instant Provision Cloud Server');
					showToast('Network error while creating server.', 'error');
				}
			});
		});

		// =========================================================================
		// Power Lifecycle Controls (Power On, Power Off, Reboot, Delete)
		// =========================================================================
		$(document).on('click', '.arvan-power-btn', function(e) {
			e.preventDefault();
			var $btn = $(this);
			var resId = $btn.data('id');
			var act = $btn.data('action');

			$btn.prop('disabled', true);

			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_server_power',
					nonce: window.arvanData.nonce,
					resource_id: resId,
					power_action: act
				},
				success: function(response) {
					$btn.prop('disabled', false);
					if (response.success) {
						showToast(response.data.message, 'success');
						setTimeout(function() { location.reload(); }, 1000);
					} else {
						showToast(response.data.message, 'error');
					}
				},
				error: function() {
					$btn.prop('disabled', false);
					showToast('Error dispatching power action.', 'error');
				}
			});
		});

		// Two-Step Deletion Modal
		var deleteTargetId = null;
		$(document).on('click', '.arvan-delete-server-trigger', function() {
			deleteTargetId = $(this).data('id');
			$('#arvan-modal-delete').fadeIn(150);
		});

		$('#arvan-confirm-delete-btn').on('click', function() {
			if (!deleteTargetId) return;
			var $btn = $(this);
			$btn.prop('disabled', true).text('Destroying...');

			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_server_power',
					nonce: window.arvanData.nonce,
					resource_id: deleteTargetId,
					power_action: 'delete'
				},
				success: function(response) {
					$btn.prop('disabled', false).text('Confirm Permanent Deletion');
					$('#arvan-modal-delete').fadeOut(150);
					if (response.success) {
						showToast(response.data.message, 'success');
						$('#resource-row-' + deleteTargetId).fadeOut(300, function() { $(this).remove(); });
						deleteTargetId = null;
					} else {
						showToast(response.data.message, 'error');
					}
				},
				error: function() {
					$btn.prop('disabled', false).text('Confirm Permanent Deletion');
					showToast('Error deleting instance.', 'error');
				}
			});
		});

		// Modal Close Buttons
		$('.arvan-modal-close-btn').on('click', function() {
			$('.arvan-modal-overlay').fadeOut(150);
		});

		// Quick Top-up Modal Open
		$('.arvan-open-topup-modal').on('click', function() {
			$('#arvan-modal-topup').fadeIn(150);
		});

		// Preset Amount Selectors
		$('.arvan-preset-btn').on('click', function() {
			$('.arvan-preset-btn').removeClass('active');
			$(this).addClass('active');
			var amount = $(this).data('amount');
			$('#arvan_deposit_amount, #arvan_modal_deposit_amount').val(amount);
		});

		// =========================================================================
		// Wallet Top-Up Forms (Main & Modal)
		// =========================================================================
		$('#arvan-wallet-topup-form, #arvan-quick-topup-form').on('submit', function(e) {
			e.preventDefault();
			var $form = $(this);
			var amount = $form.find('input[name="amount"]').val();
			var $submitBtn = $form.find('button[type="submit"]');

			$submitBtn.prop('disabled', true);

			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_topup_wallet',
					nonce: window.arvanData.nonce,
					amount: amount,
					gateway: 'sandbox'
				},
				success: function(response) {
					$submitBtn.prop('disabled', false);
					$('#arvan-modal-topup').fadeOut(150);

					if (response.success) {
						showToast(response.data.message, 'success');
						if (response.data.new_balance !== undefined) {
							var formatted = Number(response.data.new_balance).toLocaleString();
							$('#arvan-header-balance, #arvan-main-balance, #summary-wallet-balance').text(formatted + ' ' + window.arvanData.currency);
							window.arvanData.balance = response.data.new_balance;
							recalculatePricing();
						}
					} else {
						showToast(response.data.message, 'error');
					}
				},
				error: function() {
					$submitBtn.prop('disabled', false);
					showToast('Payment request failed.', 'error');
				}
			});
		});

		// =========================================================================
		// CDN & DNS Management Actions
		// =========================================================================
		$('#arvan-cdn-register-form').on('submit', function(e) {
			e.preventDefault();
			var domain = $('#arvan_cdn_domain').val();
			var $btn = $('#arvan-cdn-submit-btn');

			$btn.prop('disabled', true);

			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_cdn_register',
					nonce: window.arvanData.nonce,
					domain: domain
				},
				success: function(response) {
					$btn.prop('disabled', false);
					if (response.success) {
						showToast(response.data.message, 'success');
						setTimeout(function() { location.reload(); }, 1200);
					} else {
						showToast(response.data.message, 'error');
					}
				},
				error: function() {
					$btn.prop('disabled', false);
					showToast('Error registering CDN domain.', 'error');
				}
			});
		});

		// Open DNS Zone Editor Modal
		$(document).on('click', '.arvan-manage-dns-btn', function() {
			var domain = $(this).data('domain');
			$('#arvan-dns-modal-domain').text(domain);
			$('#dns_record_domain').val(domain);
			$('#arvan-modal-dns').fadeIn(150);

			// Load Records via AJAX
			loadDnsRecords(domain);
		});

		function loadDnsRecords(domain) {
			$('#arvan-dns-records-body').html('<tr><td colspan="6">Loading DNS records...</td></tr>');
			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_cdn_get_records',
					nonce: window.arvanData.nonce,
					domain: domain
				},
				success: function(response) {
					if (response.success && response.data.records) {
						var rows = '';
						$.each(response.data.records, function(i, rec) {
							var valStr = (typeof rec.value === 'object') ? (rec.value.ip || rec.value.host || JSON.stringify(rec.value)) : rec.value;
							rows += '<tr>';
							rows += '<td><span class="arvan-tag">' + rec.type + '</span></td>';
							rows += '<td><strong>' + rec.name + '</strong></td>';
							rows += '<td><code>' + valStr + '</code></td>';
							rows += '<td>' + (rec.cloud ? '☁️ <span class="arvan-text-green">Proxy On</span>' : 'Direct') + '</td>';
							rows += '<td>' + (rec.ttl || 120) + 's</td>';
							rows += '<td><button class="arvan-btn-sm arvan-btn-danger arvan-del-dns-btn" data-domain="' + domain + '" data-id="' + rec.id + '">Delete</button></td>';
							rows += '</tr>';
						});
						$('#arvan-dns-records-body').html(rows || '<tr><td colspan="6">No records found.</td></tr>');
					}
				}
			});
		}

		// Add DNS Record Form
		$('#arvan-add-dns-form').on('submit', function(e) {
			e.preventDefault();
			var domain = $('#dns_record_domain').val();

			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_cdn_create_record',
					nonce: window.arvanData.nonce,
					domain: domain,
					type: $('#dns_record_type').val(),
					name: $('#dns_record_name').val(),
					value: $('#dns_record_value').val(),
					cloud: $('#dns_record_cloud').is(':checked')
				},
				success: function(response) {
					if (response.success) {
						showToast(response.data.message, 'success');
						$('#dns_record_name, #dns_record_value').val('');
						loadDnsRecords(domain);
					} else {
						showToast(response.data.message, 'error');
					}
				}
			});
		});

		// Delete DNS Record
		$(document).on('click', '.arvan-del-dns-btn', function() {
			var domain = $(this).data('domain');
			var recId = $(this).data('id');

			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_cdn_delete_record',
					nonce: window.arvanData.nonce,
					domain: domain,
					record_id: recId
				},
				success: function(response) {
					if (response.success) {
						showToast(response.data.message, 'success');
						loadDnsRecords(domain);
					}
				}
			});
		});

		// Purge Edge Cache
		$(document).on('click', '.arvan-purge-cache-btn', function() {
			var domain = $(this).data('domain');
			var $btn = $(this);
			$btn.prop('disabled', true).text('Purging...');

			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_cdn_purge_cache',
					nonce: window.arvanData.nonce,
					domain: domain
				},
				success: function(response) {
					$btn.prop('disabled', false).html('⚡ Purge Edge Cache');
					if (response.success) {
						showToast(response.data.message, 'success');
					}
				}
			});
		});

		// =========================================================================
		// Object Storage (S3) Actions
		// =========================================================================
		$('#arvan-storage-create-form').on('submit', function(e) {
			e.preventDefault();
			var bucketName = $('#arvan_bucket_name').val();
			var $btn = $('#arvan-bucket-submit-btn');

			$btn.prop('disabled', true);

			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_storage_create',
					nonce: window.arvanData.nonce,
					bucket_name: bucketName
				},
				success: function(response) {
					$btn.prop('disabled', false);
					if (response.success) {
						showToast(response.data.message, 'success');
						setTimeout(function() { location.reload(); }, 1200);
					} else {
						showToast(response.data.message, 'error');
					}
				},
				error: function() {
					$btn.prop('disabled', false);
					showToast('Error creating storage bucket.', 'error');
				}
			});
		});

		// Generate S3 Access Keys Modal
		$('#arvan-generate-s3-keys-btn, .arvan-bucket-info-btn').on('click', function() {
			$.ajax({
				url: window.arvanData.ajaxUrl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'arvan_storage_keys',
					nonce: window.arvanData.nonce
				},
				success: function(response) {
					if (response.success) {
						$('#s3_access_key_val').val(response.data.access_key);
						$('#s3_secret_key_val').val(response.data.secret_key);
						$('.s3-key-ph').text(response.data.access_key);
						$('.s3-sec-ph').text(response.data.secret_key);
						$('#arvan-modal-s3-keys').fadeIn(150);
					}
				}
			});
		});

	});

})(jQuery);
