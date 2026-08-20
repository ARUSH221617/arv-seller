<?php
/**
 * Cloud Server Storefront & Configurator View.
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/public/views
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$user_id         = get_current_user_id();
$user_logged_in  = is_user_logged_in();
$wallet_balance  = $user_logged_in ? Arvan_Wallet::get_balance( $user_id ) : 0;
$currency        = get_option( 'arvan_currency', 'IRT' );
$markup          = (float) get_option( 'arvan_markup_percentage', 15 );
?>

<div class="arvan-page-header">
	<h1 class="arvan-page-title"><?php esc_html_e( 'Deploy Cloud Server', 'arv-seller' ); ?></h1>
	<p class="arvan-page-description"><?php esc_html_e( 'High performance enterprise cloud virtual machines with NVMe storage, dedicated IPv4, and 10Gbps uplinks.', 'arv-seller' ); ?></p>
</div>

<form id="arvan-server-configurator" class="arvan-configurator-form" method="post">

	<div class="arvan-config-layout">
		
		<!-- Left: Options & Selectors -->
		<div class="arvan-config-main">

			<!-- 1. Datacenter Region -->
			<div class="arvan-card arvan-step-card">
				<div class="arvan-step-header">
					<span class="arvan-step-num">1</span>
					<div>
						<h3 class="arvan-step-title"><?php esc_html_e( 'Choose Datacenter Region', 'arv-seller' ); ?></h3>
						<p class="arvan-step-subtitle"><?php esc_html_e( 'Select the geographical location closest to your target audience.', 'arv-seller' ); ?></p>
					</div>
				</div>

				<div class="arvan-grid-cards">
					<label class="arvan-select-box active">
						<input type="radio" name="region" value="ir-thr-c2" checked>
						<div class="arvan-select-inner">
							<div class="arvan-flag">🇮🇷</div>
							<strong>Tehran &mdash; Forough</strong>
							<span>Low Latency / IXP Direct</span>
						</div>
					</label>

					<label class="arvan-select-box">
						<input type="radio" name="region" value="ir-thr-sh1">
						<div class="arvan-select-inner">
							<div class="arvan-flag">🇮🇷</div>
							<strong>Tehran &mdash; Shahryar</strong>
							<span>Tier III Datacenter</span>
						</div>
					</label>

					<label class="arvan-select-box">
						<input type="radio" name="region" value="ir-tbz-dc1">
						<div class="arvan-select-inner">
							<div class="arvan-flag">🇮🇷</div>
							<strong>Tabriz &mdash; Northwest</strong>
							<span>Geo-Redundant</span>
						</div>
					</label>
				</div>
			</div>

			<!-- 2. Server Flavor / Hardware Specs -->
			<div class="arvan-card arvan-step-card">
				<div class="arvan-step-header">
					<span class="arvan-step-num">2</span>
					<div>
						<h3 class="arvan-step-title"><?php esc_html_e( 'Hardware Plan & Specifications', 'arv-seller' ); ?></h3>
						<p class="arvan-step-subtitle"><?php esc_html_e( 'Compute resources can be dynamically scaled anytime.', 'arv-seller' ); ?></p>
					</div>
				</div>

				<div class="arvan-plans-grid">
					
					<label class="arvan-plan-card" data-hourly="350" data-monthly="252000" data-flavor="g1-1-2">
						<input type="radio" name="flavor_id" value="g1-1-2">
						<div class="arvan-plan-content">
							<div class="arvan-plan-header">
								<strong>Starter Eco</strong>
								<span class="arvan-plan-badge">Entry</span>
							</div>
							<div class="arvan-plan-specs">
								<div><strong>1 vCPU</strong> <span>Core</span></div>
								<div><strong>2 GB</strong> <span>RAM</span></div>
								<div><strong>25 GB</strong> <span>NVMe</span></div>
							</div>
							<div class="arvan-plan-price">
								<strong>350</strong> <small><?php echo esc_html( $currency ); ?>/hr</small>
							</div>
						</div>
					</label>

					<label class="arvan-plan-card active" data-hourly="680" data-monthly="489600" data-flavor="g1-2-4">
						<input type="radio" name="flavor_id" value="g1-2-4" checked>
						<div class="arvan-plan-content">
							<div class="arvan-plan-header">
								<strong>Standard General</strong>
								<span class="arvan-plan-badge arvan-badge-popular"><?php esc_html_e( 'Popular', 'arv-seller' ); ?></span>
							</div>
							<div class="arvan-plan-specs">
								<div><strong>2 vCPU</strong> <span>Cores</span></div>
								<div><strong>4 GB</strong> <span>RAM</span></div>
								<div><strong>50 GB</strong> <span>NVMe</span></div>
							</div>
							<div class="arvan-plan-price">
								<strong>680</strong> <small><?php echo esc_html( $currency ); ?>/hr</small>
							</div>
						</div>
					</label>

					<label class="arvan-plan-card" data-hourly="1320" data-monthly="950400" data-flavor="g1-4-8">
						<input type="radio" name="flavor_id" value="g1-4-8">
						<div class="arvan-plan-content">
							<div class="arvan-plan-header">
								<strong>Performance Pro</strong>
								<span class="arvan-plan-badge">Fast</span>
							</div>
							<div class="arvan-plan-specs">
								<div><strong>4 vCPU</strong> <span>Cores</span></div>
								<div><strong>8 GB</strong> <span>RAM</span></div>
								<div><strong>100 GB</strong> <span>NVMe</span></div>
							</div>
							<div class="arvan-plan-price">
								<strong>1,320</strong> <small><?php echo esc_html( $currency ); ?>/hr</small>
							</div>
						</div>
					</label>

					<label class="arvan-plan-card" data-hourly="2590" data-monthly="1864800" data-flavor="g1-8-16">
						<input type="radio" name="flavor_id" value="g1-8-16">
						<div class="arvan-plan-content">
							<div class="arvan-plan-header">
								<strong>Enterprise Ultra</strong>
								<span class="arvan-plan-badge">Max</span>
							</div>
							<div class="arvan-plan-specs">
								<div><strong>8 vCPU</strong> <span>Cores</span></div>
								<div><strong>16 GB</strong> <span>RAM</span></div>
								<div><strong>200 GB</strong> <span>NVMe</span></div>
							</div>
							<div class="arvan-plan-price">
								<strong>2,590</strong> <small><?php echo esc_html( $currency ); ?>/hr</small>
							</div>
						</div>
					</label>

				</div>
			</div>

			<!-- 3. Operating System Distribution -->
			<div class="arvan-card arvan-step-card">
				<div class="arvan-step-header">
					<span class="arvan-step-num">3</span>
					<div>
						<h3 class="arvan-step-title"><?php esc_html_e( 'Select Operating System', 'arv-seller' ); ?></h3>
						<p class="arvan-step-subtitle"><?php esc_html_e( 'Pre-configured cloud distributions ready in under 60 seconds.', 'arv-seller' ); ?></p>
					</div>
				</div>

				<div class="arvan-os-grid">
					<label class="arvan-os-item active">
						<input type="radio" name="image_id" value="ubuntu-22.04" checked>
						<div class="arvan-os-inner">
							<span class="arvan-os-logo">🐧</span>
							<strong>Ubuntu 22.04 LTS</strong>
							<small>64-bit Server</small>
						</div>
					</label>

					<label class="arvan-os-item">
						<input type="radio" name="image_id" value="ubuntu-24.04">
						<div class="arvan-os-inner">
							<span class="arvan-os-logo">🐧</span>
							<strong>Ubuntu 24.04 LTS</strong>
							<small>Noble Numbat</small>
						</div>
					</label>

					<label class="arvan-os-item">
						<input type="radio" name="image_id" value="debian-12">
						<div class="arvan-os-inner">
							<span class="arvan-os-logo">🌀</span>
							<strong>Debian 12</strong>
							<small>Bookworm</small>
						</div>
					</label>

					<label class="arvan-os-item">
						<input type="radio" name="image_id" value="centos-stream-9">
						<div class="arvan-os-inner">
							<span class="arvan-os-logo">📦</span>
							<strong>Alma / CentOS 9</strong>
							<small>Enterprise Linux</small>
						</div>
					</label>

					<label class="arvan-os-item">
						<input type="radio" name="image_id" value="win-server-2022">
						<div class="arvan-os-inner">
							<span class="arvan-os-logo">🪟</span>
							<strong>Windows Server 2022</strong>
							<small>Standard Edition</small>
						</div>
					</label>
				</div>
			</div>

			<!-- 4. Hostname & Authentication -->
			<div class="arvan-card arvan-step-card">
				<div class="arvan-step-header">
					<span class="arvan-step-num">4</span>
					<div>
						<h3 class="arvan-step-title"><?php esc_html_e( 'Instance Configuration', 'arv-seller' ); ?></h3>
						<p class="arvan-step-subtitle"><?php esc_html_e( 'Set your server hostname and SSH access credentials.', 'arv-seller' ); ?></p>
					</div>
				</div>

				<div class="arvan-form-grid">
					<div class="arvan-form-group">
						<label for="arvan_server_name" class="arvan-label"><?php esc_html_e( 'Server Hostname / Name', 'arv-seller' ); ?></label>
						<input type="text" id="arvan_server_name" name="name" class="arvan-input" value="cloud-srv-<?php echo esc_attr( wp_rand( 100, 999 ) ); ?>" required>
					</div>
					<div class="arvan-form-group">
						<label for="arvan_ssh_key" class="arvan-label"><?php esc_html_e( 'SSH Public Key (Recommended)', 'arv-seller' ); ?></label>
						<textarea id="arvan_ssh_key" name="ssh_key" class="arvan-input arvan-textarea" rows="2" placeholder="ssh-rsa AAAAB3NzaC1yc2E..."></textarea>
					</div>
				</div>
			</div>

		</div>

		<!-- Right: Sticky Order Summary Box -->
		<div class="arvan-config-sidebar">
			<div class="arvan-card arvan-summary-card">
				<h3 class="arvan-summary-title"><?php esc_html_e( 'Summary & Cost', 'arv-seller' ); ?></h3>
				
				<div class="arvan-summary-row">
					<span><?php esc_html_e( 'Location', 'arv-seller' ); ?></span>
					<strong id="summary-region">Tehran (Forough)</strong>
				</div>
				<div class="arvan-summary-row">
					<span><?php esc_html_e( 'Plan', 'arv-seller' ); ?></span>
					<strong id="summary-plan">2 vCPU / 4GB RAM</strong>
				</div>
				<div class="arvan-summary-row">
					<span><?php esc_html_e( 'Operating System', 'arv-seller' ); ?></span>
					<strong id="summary-os">Ubuntu 22.04 LTS</strong>
				</div>
				<div class="arvan-summary-row">
					<span><?php esc_html_e( 'Public IPv4', 'arv-seller' ); ?></span>
					<strong>1x Dedicated (Included)</strong>
				</div>

				<div class="arvan-summary-divider"></div>

				<div class="arvan-price-breakdown">
					<div class="arvan-price-row">
						<span><?php esc_html_e( 'Hourly Rate:', 'arv-seller' ); ?></span>
						<h3 class="arvan-price-val"><span id="summary-hourly">680</span> <small><?php echo esc_html( $currency ); ?>/hr</small></h3>
					</div>
					<div class="arvan-price-sub">
						<span><?php esc_html_e( 'Est. Monthly:', 'arv-seller' ); ?></span>
						<strong id="summary-monthly">489,600</strong> <?php echo esc_html( $currency ); ?>
					</div>
				</div>

				<div class="arvan-wallet-status-box">
					<div class="arvan-wallet-status-header">
						<span><?php esc_html_e( 'Your Balance:', 'arv-seller' ); ?></span>
						<strong><?php echo esc_html( number_format( $wallet_balance ) ); ?> <?php echo esc_html( $currency ); ?></strong>
					</div>
					<?php if ( $wallet_balance <= 0 ) : ?>
						<p class="arvan-warning-text"><?php esc_html_e( 'Your wallet has 0 balance. Hourly billing requires at least a small deposit.', 'arv-seller' ); ?></p>
					<?php endif; ?>
				</div>

				<button type="submit" class="arvan-btn-primary arvan-btn-block arvan-btn-deploy" id="arvan-deploy-btn">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
					<?php esc_html_e( 'Deploy Cloud Server', 'arv-seller' ); ?>
				</button>
			</div>
		</div>

	</div>

</form>
