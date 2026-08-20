/**
 * ArvanCloud Standalone Canvas Interactions.
 */
(function($) {
	'use strict';

	$(document).ready(function() {

		// 1. Preset button click for wallet top-up
		$('.arvan-preset-btn').on('click', function() {
			$('.arvan-preset-btn').removeClass('active');
			$(this).addClass('active');
			var amount = $(this).data('amount');
			$('#arvan_deposit_amount').val(amount);
		});

		// 2. Select box toggles (Region)
		$('.arvan-select-box').on('click', function() {
			$('.arvan-select-box').removeClass('active');
			$(this).addClass('active');
			$(this).find('input[type="radio"]').prop('checked', true);
			updateSummary();
		});

		// 3. Plan / Flavor card toggles
		$('.arvan-plan-card').on('click', function() {
			$('.arvan-plan-card').removeClass('active');
			$(this).addClass('active');
			$(this).find('input[type="radio"]').prop('checked', true);
			updateSummary();
		});

		// 4. OS selector toggles
		$('.arvan-os-item').on('click', function() {
			$('.arvan-os-item').removeClass('active');
			$(this).addClass('active');
			$(this).find('input[type="radio"]').prop('checked', true);
			updateSummary();
		});

		function updateSummary() {
			// Region
			var activeRegion = $('.arvan-select-box.active strong').text();
			if (activeRegion) {
				$('#summary-region').text(activeRegion);
			}

			// Plan
			var activePlan = $('.arvan-plan-card.active');
			if (activePlan.length) {
				var planName = activePlan.find('.arvan-plan-header strong').text();
				var specs = activePlan.find('.arvan-plan-specs div:first strong').text() + ' / ' + activePlan.find('.arvan-plan-specs div:nth-child(2) strong').text();
				var hourly = activePlan.data('hourly');
				var monthly = activePlan.data('monthly');

				$('#summary-plan').text(planName + ' (' + specs + ')');
				$('#summary-hourly').text(Number(hourly).toLocaleString());
				$('#summary-monthly').text(Number(monthly).toLocaleString());
			}

			// OS
			var activeOS = $('.arvan-os-item.active strong').text();
			if (activeOS) {
				$('#summary-os').text(activeOS);
			}
		}

		// Initial sync
		updateSummary();

	});

})(jQuery);
