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
$markup_pct      = (float) get_option( 'arvan_markup_percentage', 20 );
$fixed_margin    = (float) get_option( 'arvan_fixed_margin', 0 );

// Flavor matrix definitions with base costs
$flavors = array(
	'g1-1-2'  => array( 'name' => 'Starter Eco', 'tier' => 'general', 'vcpu' => 1, 'ram' => 2, 'disk' => 25, 'base_cost' => 250, 'badge' => 'Eco' ),
	'g1-2-4'  => array( 'name' => 'Standard General', 'tier' => 'general', 'vcpu' => 2, 'ram' => 4, 'disk' => 40, 'base_cost' => 450, 'badge' => 'Most Popular', 'popular' => true ),
	'g1-4-8'  => array( 'name' => 'Performance Pro', 'tier' => 'general', 'vcpu' => 4, 'ram' => 8, 'disk' => 60, 'base_cost' => 890, 'badge' => 'High Load' ),
	'g1-8-16' => array( 'name' => 'Enterprise Ultra', 'tier' => 'general', 'vcpu' => 8, 'ram' => 16, 'disk' => 100, 'base_cost' => 1750, 'badge' => 'Max Power' ),
	'c1-4-4'  => array( 'name' => 'Compute Master', 'tier' => 'compute', 'vcpu' => 4, 'ram' => 4, 'disk' => 40, 'base_cost' => 690, 'badge' => 'Dedicated CPU' ),
	'm1-2-8'  => array( 'name' => 'Memory Master', 'tier' => 'memory', 'vcpu' => 2, 'ram' => 8, 'disk' => 50, 'base_cost' => 650, 'badge' => 'High Memory' ),
);
?>

<div class="arvan-page-header">
	<div class="arvan-page-header-text">
		<h1 class="arvan-page-title"><?php esc_html_e( 'Deploy Cloud Server (IaaS)', 'arv-seller' ); ?></h1>
		<p class="arvan-page-description"><?php esc_html_e( 'Instant provisioning on ArvanCloud infrastructure. High IOPS NVMe SSD, dedicated IPv4, sub-millisecond local network.', 'arv-seller' ); ?></p>
	</div>
</div>

<form id="arvan-server-configurator" class="arvan-configurator-form" method="post">

	<div class="arvan-config-layout">
		
		<!-- Left / Main: Options & Step Selectors -->
		<div class="arvan-config-main">

			<!-- Step 1: Datacenter Region -->
			<div class="arvan-card arvan-step-card">
				<div class="arvan-step-header">
					<span class="arvan-step-num">1</span>
					<div>
						<h3 class="arvan-step-title"><?php esc_html_e( 'Choose Datacenter Region', 'arv-seller' ); ?></h3>
						<p class="arvan-step-subtitle"><?php esc_html_e( 'Select the geographical location closest to your target audience.', 'arv-seller' ); ?></p>
					</div>
				</div>

				<div class="arvan-grid-cards">
					<label class="arvan-select-box active" data-region-title="Tehran (Forough)">
						<input type="radio" name="region" value="ir-thr-c2" checked>
						<div class="arvan-select-inner">
							<div class="arvan-box-header">
								<span class="arvan-flag">🇮🇷</span>
								<span class="arvan-dot arvan-dot-green"></span>
							</div>
							<strong>Tehran &mdash; Forough</strong>
							<span><?php esc_html_e( 'Low Latency / IXP Direct', 'arv-seller' ); ?></span>
						</div>
					</label>

					<label class="arvan-select-box" data-region-title="Tehran (Shahryar)">
						<input type="radio" name="region" value="ir-thr-sh1">
						<div class="arvan-select-inner">
							<div class="arvan-box-header">
								<span class="arvan-flag">🇮🇷</span>
								<span class="arvan-dot arvan-dot-green"></span>
							</div>
							<strong>Tehran &mdash; Shahryar</strong>
							<span><?php esc_html_e( 'Tier III Enterprise DC', 'arv-seller' ); ?></span>
						</div>
					</label>

					<label class="arvan-select-box" data-region-title="Tabriz (Northwest)">
						<input type="radio" name="region" value="ir-tbz-dc1">
						<div class="arvan-select-inner">
							<div class="arvan-box-header">
								<span class="arvan-flag">🇮🇷</span>
								<span class="arvan-dot arvan-dot-green"></span>
							</div>
							<strong>Tabriz &mdash; Northwest</strong>
							<span><?php esc_html_e( 'Geo-Redundant Disaster Recovery', 'arv-seller' ); ?></span>
						</div>
					</label>
				</div>
			</div>

			<!-- Step 2: Hardware Flavor / Compute Specs -->
			<div class="arvan-card arvan-step-card">
				<div class="arvan-step-header">
					<span class="arvan-step-num">2</span>
					<div>
						<h3 class="arvan-step-title"><?php esc_html_e( 'Hardware Plan & Specifications', 'arv-seller' ); ?></h3>
						<p class="arvan-step-subtitle"><?php esc_html_e( 'Compute resources can be dynamically scaled anytime.', 'arv-seller' ); ?></p>
					</div>
				</div>

				<!-- Category Tab Filters -->
				<div class="arvan-tier-tabs">
					<button type="button" class="arvan-tab-btn active" data-filter="all"><?php esc_html_e( 'All Plans', 'arv-seller' ); ?></button>
					<button type="button" class="arvan-tab-btn" data-filter="general"><?php esc_html_e( 'General Purpose', 'arv-seller' ); ?></button>
					<button type="button" class="arvan-tab-btn" data-filter="compute"><?php esc_html_e( 'Compute Optimized', 'arv-seller' ); ?></button>
					<button type="button" class="arvan-tab-btn" data-filter="memory"><?php esc_html_e( 'Memory Optimized', 'arv-seller' ); ?></button>
				</div>

				<div class="arvan-plans-grid">
					<?php foreach ( $flavors as $f_id => $f_info ) : 
						$retail_hourly  = Arvan_API_Client::calculate_price_with_markup( $f_info['base_cost'], $markup_pct, $fixed_margin );
						$retail_monthly = $retail_hourly * 720;
						$is_popular     = ! empty( $f_info['popular'] );
						?>
						<label class="arvan-plan-card <?php echo $is_popular ? 'active' : ''; ?>" 
							   data-flavor="<?php echo esc_attr( $f_id ); ?>" 
							   data-tier="<?php echo esc_attr( $f_info['tier'] ); ?>" 
							   data-base-cost="<?php echo esc_attr( $f_info['base_cost'] ); ?>" 
							   data-base-disk="<?php echo esc_attr( $f_info['disk'] ); ?>" 
							   data-hourly="<?php echo esc_attr( $retail_hourly ); ?>" 
							   data-monthly="<?php echo esc_attr( $retail_monthly ); ?>" 
							   data-specs="<?php echo esc_attr( "{$f_info['vcpu']} vCPU / {$f_info['ram']} GB RAM" ); ?>">
							<input type="radio" name="flavor_id" value="<?php echo esc_attr( $f_id ); ?>" <?php checked( $is_popular ); ?>>
							<div class="arvan-plan-content">
								<div class="arvan-plan-header">
									<strong><?php echo esc_html( $f_info['name'] ); ?></strong>
									<span class="arvan-plan-badge <?php echo $is_popular ? 'arvan-badge-popular' : ''; ?>">
										<?php echo esc_html( $f_info['badge'] ); ?>
									</span>
								</div>
								<div class="arvan-plan-specs">
									<div class="arvan-spec-item">
										<strong><?php echo esc_html( $f_info['vcpu'] ); ?> vCPU</strong>
										<span><?php esc_html_e( 'Processor', 'arv-seller' ); ?></span>
									</div>
									<div class="arvan-spec-item">
										<strong><?php echo esc_html( $f_info['ram'] ); ?> GB</strong>
										<span><?php esc_html_e( 'RAM Memory', 'arv-seller' ); ?></span>
									</div>
									<div class="arvan-spec-item">
										<strong><?php echo esc_html( $f_info['disk'] ); ?> GB</strong>
										<span><?php esc_html_e( 'NVMe Disk', 'arv-seller' ); ?></span>
									</div>
								</div>
								<div class="arvan-plan-price">
									<strong><?php echo esc_html( number_format( $retail_hourly ) ); ?></strong>
									<small><?php echo esc_html( $currency ); ?>/<?php esc_html_e( 'hr', 'arv-seller' ); ?></small>
								</div>
							</div>
						</label>
					<?php endforeach; ?>
				</div>
			</div>

			<!-- Step 3: Interactive NVMe Storage Volume Slider -->
			<div class="arvan-card arvan-step-card">
				<div class="arvan-step-header">
					<span class="arvan-step-num">3</span>
					<div>
						<h3 class="arvan-step-title"><?php esc_html_e( 'NVMe Fast Storage Volume', 'arv-seller' ); ?></h3>
						<p class="arvan-step-subtitle"><?php esc_html_e( 'High IOPS NVMe Enterprise SSD. Expandable on-demand (+4 Toman/GB/hr).', 'arv-seller' ); ?></p>
					</div>
				</div>

				<div class="arvan-slider-container">
					<div class="arvan-slider-readout">
						<span><?php esc_html_e( 'Allocated NVMe Storage:', 'arv-seller' ); ?></span>
						<h3 class="arvan-slider-val"><span id="arvan-disk-display">40</span> <small>GB</small></h3>
					</div>
					<input type="range" id="arvan_disk_slider" name="disk_size" min="25" max="500" step="5" value="40" class="arvan-range-slider">
					<div class="arvan-slider-ticks">
						<span>25 GB</span>
						<span>100 GB</span>
						<span>250 GB</span>
						<span>500 GB</span>
					</div>
				</div>
			</div>

			<!-- Step 4: Operating System Distribution -->
			<div class="arvan-card arvan-step-card">
				<div class="arvan-step-header">
					<span class="arvan-step-num">4</span>
					<div>
						<h3 class="arvan-step-title"><?php esc_html_e( 'Operating System Image', 'arv-seller' ); ?></h3>
						<p class="arvan-step-subtitle"><?php esc_html_e( 'Standard cloud images optimized for immediate SSH/RDP connection.', 'arv-seller' ); ?></p>
					</div>
				</div>

				<div class="arvan-os-grid">
					<label class="arvan-os-item active" data-os-name="Ubuntu 22.04 LTS">
						<input type="radio" name="image_id" value="ubuntu-22.04" checked>
						<div class="arvan-os-inner">
							<span class="arvan-os-logo">
								<img src="<?php echo esc_url( ARVAN_RESELLER_PLUGIN_URL . 'public/images/os/ubuntu.svg' ); ?>" alt="Ubuntu" class="arvan-os-img" />
							</span>
							<strong>Ubuntu 22.04 LTS</strong>
							<small>Jammy (Recommended)</small>
						</div>
					</label>

					<label class="arvan-os-item" data-os-name="Ubuntu 24.04 LTS">
						<input type="radio" name="image_id" value="ubuntu-24.04">
						<div class="arvan-os-inner">
							<span class="arvan-os-logo">
								<img src="<?php echo esc_url( ARVAN_RESELLER_PLUGIN_URL . 'public/images/os/ubuntu.svg' ); ?>" alt="Ubuntu" class="arvan-os-img" />
							</span>
							<strong>Ubuntu 24.04 LTS</strong>
							<small>Noble Numbat</small>
						</div>
					</label>

					<label class="arvan-os-item" data-os-name="Debian 12">
						<input type="radio" name="image_id" value="debian-12">
						<div class="arvan-os-inner">
							<span class="arvan-os-logo">
								<img src="<?php echo esc_url( ARVAN_RESELLER_PLUGIN_URL . 'public/images/os/debian.svg' ); ?>" alt="Debian" class="arvan-os-img" />
							</span>
							<strong>Debian 12</strong>
							<small>Bookworm Stable</small>
						</div>
					</label>

					<label class="arvan-os-item" data-os-name="AlmaLinux 9">
						<input type="radio" name="image_id" value="almalinux-9">
						<div class="arvan-os-inner">
							<span class="arvan-os-logo">
								<img src="<?php echo esc_url( ARVAN_RESELLER_PLUGIN_URL . 'public/images/os/almalinux.svg' ); ?>" alt="AlmaLinux" class="arvan-os-img" />
							</span>
							<strong>AlmaLinux 9</strong>
							<small>RHEL Compatible</small>
						</div>
					</label>

					<label class="arvan-os-item" data-os-name="Windows Server 2022">
						<input type="radio" name="image_id" value="windows-server-2022">
						<div class="arvan-os-inner">
							<span class="arvan-os-logo">
								<img src="<?php echo esc_url( ARVAN_RESELLER_PLUGIN_URL . 'public/images/os/windows.svg' ); ?>" alt="Windows Server" class="arvan-os-img" />
							</span>
							<strong>Windows Server 2022</strong>
							<small>Standard Edition</small>
						</div>
					</label>
				</div>
			</div>

			<!-- Step 5: Hostname & Authentication Credentials -->
			<div class="arvan-card arvan-step-card">
				<div class="arvan-step-header">
					<span class="arvan-step-num">5</span>
					<div>
						<h3 class="arvan-step-title"><?php esc_html_e( 'Instance Access & Naming', 'arv-seller' ); ?></h3>
						<p class="arvan-step-subtitle"><?php esc_html_e( 'Configure server hostname and authentication method.', 'arv-seller' ); ?></p>
					</div>
				</div>

				<div class="arvan-form-grid">
					<div class="arvan-form-group">
						<label for="arvan_server_name" class="arvan-label"><?php esc_html_e( 'Server Hostname', 'arv-seller' ); ?></label>
						<input type="text" id="arvan_server_name" name="name" class="arvan-input" value="srv-web-<?php echo esc_attr( wp_rand( 100, 999 ) ); ?>" required>
					</div>

					<div class="arvan-auth-toggle-group">
						<label class="arvan-label"><?php esc_html_e( 'Authentication Mode:', 'arv-seller' ); ?></label>
						<div class="arvan-radio-group">
							<label><input type="radio" name="auth_mode" value="ssh" checked> <?php esc_html_e( 'SSH Public Key (Recommended)', 'arv-seller' ); ?></label>
							<label><input type="radio" name="auth_mode" value="password"> <?php esc_html_e( 'Root Password', 'arv-seller' ); ?></label>
						</div>
					</div>

					<div class="arvan-form-group" id="arvan-ssh-field">
						<label for="arvan_ssh_key" class="arvan-label"><?php esc_html_e( 'SSH Public Key', 'arv-seller' ); ?></label>
						<textarea id="arvan_ssh_key" name="ssh_key" class="arvan-input arvan-textarea" rows="2" placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@example.com"></textarea>
					</div>

					<div class="arvan-form-group" id="arvan-pwd-field" style="display: none;">
						<label for="arvan_password" class="arvan-label"><?php esc_html_e( 'Root / Admin Password', 'arv-seller' ); ?></label>
						<div style="display: flex; gap: 8px;">
							<input type="text" id="arvan_password" name="password" class="arvan-input" placeholder="<?php esc_attr_e( 'Minimum 12 characters', 'arv-seller' ); ?>">
							<button type="button" class="arvan-btn-outline" id="arvan-gen-pwd-btn"><?php esc_html_e( 'Generate', 'arv-seller' ); ?></button>
						</div>
					</div>
				</div>
			</div>

		</div>

		<!-- Right: Sticky Live Summary & Pricing Panel -->
		<div class="arvan-config-sidebar">
			<div class="arvan-card arvan-summary-card">
				<h3 class="arvan-summary-title"><?php esc_html_e( 'Order Summary & Cost', 'arv-seller' ); ?></h3>
				
				<div class="arvan-summary-row">
					<span><?php esc_html_e( 'Datacenter:', 'arv-seller' ); ?></span>
					<strong id="summary-region">Tehran (Forough)</strong>
				</div>
				<div class="arvan-summary-row">
					<span><?php esc_html_e( 'Compute Specs:', 'arv-seller' ); ?></span>
					<strong id="summary-plan">2 vCPU / 4 GB RAM</strong>
				</div>
				<div class="arvan-summary-row">
					<span><?php esc_html_e( 'Storage Volume:', 'arv-seller' ); ?></span>
					<strong id="summary-disk">40 GB NVMe</strong>
				</div>
				<div class="arvan-summary-row">
					<span><?php esc_html_e( 'Operating System:', 'arv-seller' ); ?></span>
					<strong id="summary-os">Ubuntu 22.04 LTS</strong>
				</div>
				<div class="arvan-summary-row">
					<span><?php esc_html_e( 'Dedicated IPv4:', 'arv-seller' ); ?></span>
					<strong class="arvan-text-green"><?php esc_html_e( '1x Public IP (Included)', 'arv-seller' ); ?></strong>
				</div>

				<div class="arvan-summary-divider"></div>

				<div class="arvan-price-breakdown">
					<div class="arvan-price-row">
						<span><?php esc_html_e( 'Hourly Burn Rate:', 'arv-seller' ); ?></span>
						<h3 class="arvan-price-val"><span id="summary-hourly">540</span> <small><?php echo esc_html( $currency ); ?>/<?php esc_html_e( 'hr', 'arv-seller' ); ?></small></h3>
					</div>
					<div class="arvan-price-sub">
						<span><?php esc_html_e( 'Est. Monthly (720 hrs):', 'arv-seller' ); ?></span>
						<strong id="summary-monthly">388,800</strong> <?php echo esc_html( $currency ); ?>
					</div>
				</div>

				<div class="arvan-wallet-status-box">
					<div class="arvan-wallet-status-header">
						<span><?php esc_html_e( 'Your Available Balance:', 'arv-seller' ); ?></span>
						<strong id="summary-wallet-balance"><?php echo esc_html( number_format( $wallet_balance ) ); ?> <?php echo esc_html( $currency ); ?></strong>
					</div>
					<div id="arvan-balance-notice" style="<?php echo ( $wallet_balance > 0 ) ? 'display:none;' : ''; ?>">
						<p class="arvan-warning-text"><?php esc_html_e( 'Notice: Deploying requires a minimum 24-hour run balance.', 'arv-seller' ); ?></p>
					</div>
				</div>

				<button type="submit" class="arvan-btn-primary arvan-btn-block arvan-btn-deploy" id="arvan-deploy-btn">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
					<span><?php esc_html_e( 'Instant Provision Cloud Server', 'arv-seller' ); ?></span>
				</button>
			</div>
		</div>

	</div>

</form>
