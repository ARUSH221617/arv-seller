<?php
/**
 * Test Suite for ArvanCloud Multi-Language (i18n) Engine.
 */

if ( ! defined( 'WPINC' ) ) {
	define( 'WPINC', true );
}

function add_action( $tag, $callback, $priority = 10, $accepted_args = 1 ) {}
function add_filter( $tag, $callback, $priority = 10, $accepted_args = 1 ) {}
function load_plugin_textdomain( $domain, $deprecated, $plugin_rel_path ) {}
function plugin_basename( $file ) { return basename( $file ); }
function sanitize_key( $key ) { return preg_replace( '/[^a-z0-9_\-]/i', '', $key ); }

global $custom_mock_locale;
$custom_mock_locale = 'fa_IR';

function determine_locale() {
	global $custom_mock_locale;
	return $custom_mock_locale;
}

function get_locale() {
	global $custom_mock_locale;
	return $custom_mock_locale;
}

function set_test_wp_locale( $locale ) {
	global $custom_mock_locale;
	$custom_mock_locale = $locale;
	return Arv_Seller_i18n::resolve_active_language();
}

require_once dirname( __DIR__ ) . '/includes/class-arv-seller-i18n.php';

echo "=========================================================\n";
echo "ARVANCLOUD MULTI-LANGUAGE TEST SUITE\n";
echo "=========================================================\n\n";

$passed = 0;
$failed = 0;

function assert_test( $condition, $title ) {
	global $passed, $failed;
	if ( $condition ) {
		echo " [PASS] " . $title . "\n";
		$passed++;
	} else {
		echo " [FAIL] " . $title . "\n";
		$failed++;
	}
}

// 1. Supported Languages
$langs = Arv_Seller_i18n::get_supported_languages();
assert_test( count( $langs ) === 6, "Supported languages count is 6 (fa, en, ar, tr, zh, ru)" );
assert_test( isset( $langs['fa'], $langs['en'], $langs['ar'], $langs['tr'], $langs['zh'], $langs['ru'] ), "All 6 required languages exist" );

// 2. Directionality
assert_test( 'rtl' === $langs['fa']['direction'], "Persian (fa) direction is RTL" );
assert_test( 'rtl' === $langs['ar']['direction'], "Arabic (ar) direction is RTL" );
assert_test( 'ltr' === $langs['en']['direction'], "English (en) direction is LTR" );
assert_test( 'ltr' === $langs['tr']['direction'], "Turkish (tr) direction is LTR" );
assert_test( 'ltr' === $langs['zh']['direction'], "Chinese (zh) direction is LTR" );
assert_test( 'ltr' === $langs['ru']['direction'], "Russian (ru) direction is LTR" );

// 3. Translation Dictionaries Coverage via WordPress Site Locale
$i18n = new Arv_Seller_i18n();
$sample_text = 'Deploy Cloud Server';

// Persian
set_test_wp_locale( 'fa_IR' );
$fa_trans = $i18n->filter_translations( $sample_text, $sample_text, 'arv-seller' );
assert_test( $fa_trans === 'سفارش سرور ابری', "Persian translation: '{$sample_text}' -> '{$fa_trans}'" );

// English
set_test_wp_locale( 'en_US' );
$en_trans = $i18n->filter_translations( $sample_text, $sample_text, 'arv-seller' );
assert_test( $en_trans === 'Deploy Cloud Server', "English translation: '{$sample_text}' -> '{$en_trans}'" );

// Arabic
set_test_wp_locale( 'ar_SA' );
$ar_trans = $i18n->filter_translations( $sample_text, $sample_text, 'arv-seller' );
assert_test( $ar_trans === 'إنشاء خادم سحابي', "Arabic translation: '{$sample_text}' -> '{$ar_trans}'" );

// Turkish
set_test_wp_locale( 'tr_TR' );
$tr_trans = $i18n->filter_translations( $sample_text, $sample_text, 'arv-seller' );
assert_test( $tr_trans === 'Bulut Sunucu Başlat', "Turkish translation: '{$sample_text}' -> '{$tr_trans}'" );

// Chinese
set_test_wp_locale( 'zh_CN' );
$zh_trans = $i18n->filter_translations( $sample_text, $sample_text, 'arv-seller' );
assert_test( $zh_trans === '部署云服务器', "Chinese translation: '{$sample_text}' -> '{$zh_trans}'" );

// Russian
set_test_wp_locale( 'ru_RU' );
$ru_trans = $i18n->filter_translations( $sample_text, $sample_text, 'arv-seller' );
assert_test( $ru_trans === 'Создать облачный сервер', "Russian translation: '{$sample_text}' -> '{$ru_trans}'" );

// 4. Test Key Storage & Dashboard Strings
$dashboard_str = 'Available Wallet Balance';
set_test_wp_locale( 'fa_IR' );
assert_test( $i18n->filter_translations( $dashboard_str, $dashboard_str, 'arv-seller' ) === 'موجودی قابل استفاده کیف پول', "Persian: 'Available Wallet Balance'" );

set_test_wp_locale( 'zh_CN' );
assert_test( $i18n->filter_translations( $dashboard_str, $dashboard_str, 'arv-seller' ) === '当前可用钱包余额', "Chinese: 'Available Wallet Balance'" );

set_test_wp_locale( 'ru_RU' );
assert_test( $i18n->filter_translations( $dashboard_str, $dashboard_str, 'arv-seller' ) === 'Доступный баланс кошелька', "Russian: 'Available Wallet Balance'" );

set_test_wp_locale( 'tr_TR' );
assert_test( $i18n->filter_translations( $dashboard_str, $dashboard_str, 'arv-seller' ) === 'Kullanılabilir Cüzdan Bakiyesi', "Turkish: 'Available Wallet Balance'" );

set_test_wp_locale( 'ar_SA' );
assert_test( $i18n->filter_translations( $dashboard_str, $dashboard_str, 'arv-seller' ) === 'رصيد المحفظة المتاح', "Arabic: 'Available Wallet Balance'" );

// 5. Automatic Synchronization with WordPress Site Locale
assert_test( 'fa' === set_test_wp_locale( 'fa_IR' ), "Auto-sync with WP locale 'fa_IR' -> 'fa'" );
assert_test( 'en' === set_test_wp_locale( 'en_US' ), "Auto-sync with WP locale 'en_US' -> 'en'" );
assert_test( 'ar' === set_test_wp_locale( 'ar_SA' ), "Auto-sync with WP locale 'ar_SA' -> 'ar'" );
assert_test( 'tr' === set_test_wp_locale( 'tr_TR' ), "Auto-sync with WP locale 'tr_TR' -> 'tr'" );
assert_test( 'zh' === set_test_wp_locale( 'zh_CN' ), "Auto-sync with WP locale 'zh_CN' -> 'zh'" );
assert_test( 'ru' === set_test_wp_locale( 'ru_RU' ), "Auto-sync with WP locale 'ru_RU' -> 'ru'" );

// 6. Admin Panel Translations Coverage
$admin_str = 'ArvanCloud Reseller Settings & Monetization';

set_test_wp_locale( 'fa_IR' );
assert_test( $i18n->filter_translations( $admin_str, $admin_str, 'arv-seller' ) === 'تنظیمات نمایندگی و درآمدزایی ابر آروان', "Persian Admin: '{$admin_str}'" );

set_test_wp_locale( 'ar_SA' );
assert_test( $i18n->filter_translations( $admin_str, $admin_str, 'arv-seller' ) === 'إعدادات وكالة وأرباح آروان كلاود', "Arabic Admin: '{$admin_str}'" );

set_test_wp_locale( 'tr_TR' );
assert_test( $i18n->filter_translations( $admin_str, $admin_str, 'arv-seller' ) === 'ArvanCloud Bayi Ayarları ve Fiyatlandırma', "Turkish Admin: '{$admin_str}'" );

set_test_wp_locale( 'zh_CN' );
assert_test( $i18n->filter_translations( $admin_str, $admin_str, 'arv-seller' ) === 'ArvanCloud 云分销商系统设置与加价引擎', "Chinese Admin: '{$admin_str}'" );

set_test_wp_locale( 'ru_RU' );
assert_test( $i18n->filter_translations( $admin_str, $admin_str, 'arv-seller' ) === 'Настройки реселлинга ArvanCloud и наценки', "Russian Admin: '{$admin_str}'" );

// 7. API Connection Notification Translations
$conn_str = 'Connected successfully to ArvanCloud infrastructure.';

set_test_wp_locale( 'fa_IR' );
assert_test( $i18n->filter_translations( $conn_str, $conn_str, 'arv-seller' ) === 'اتصال به زیرساخت ابر آروان با موفقیت برقرار شد.', "Persian: '{$conn_str}'" );

set_test_wp_locale( 'ar_SA' );
assert_test( $i18n->filter_translations( $conn_str, $conn_str, 'arv-seller' ) === 'تم الاتصال بالبنية التحتية لـ آروان كلاود بنجاح.', "Arabic: '{$conn_str}'" );

set_test_wp_locale( 'tr_TR' );
assert_test( $i18n->filter_translations( $conn_str, $conn_str, 'arv-seller' ) === 'ArvanCloud altyapısına başarıyla bağlanıldı.', "Turkish: '{$conn_str}'" );

set_test_wp_locale( 'zh_CN' );
assert_test( $i18n->filter_translations( $conn_str, $conn_str, 'arv-seller' ) === '已成功连接至 ArvanCloud 云基础设施。', "Chinese: '{$conn_str}'" );

set_test_wp_locale( 'ru_RU' );
assert_test( $i18n->filter_translations( $conn_str, $conn_str, 'arv-seller' ) === 'Успешное подключение к инфраструктуре ArvanCloud.', "Russian: '{$conn_str}'" );

// 8. Loading State Translations
$load_str = 'Loading ArvanCloud Services Canvas...';
set_test_wp_locale( 'fa_IR' );
assert_test( $i18n->filter_translations( $load_str, $load_str, 'arv-seller' ) === 'در حال بارگذاری سامانه خدمات ابری آروان...', "Persian: '{$load_str}'" );

set_test_wp_locale( 'ar_SA' );
assert_test( $i18n->filter_translations( $load_str, $load_str, 'arv-seller' ) === 'جارٍ تحميل منصة الخدمات السحابية لأروان...', "Arabic: '{$load_str}'" );

set_test_wp_locale( 'tr_TR' );
assert_test( $i18n->filter_translations( $load_str, $load_str, 'arv-seller' ) === 'ArvanCloud Hizmetleri Paneli Yükleniyor...', "Turkish: '{$load_str}'" );

set_test_wp_locale( 'zh_CN' );
assert_test( $i18n->filter_translations( $load_str, $load_str, 'arv-seller' ) === '正在载入 ArvanCloud 云服务平台...', "Chinese: '{$load_str}'" );

set_test_wp_locale( 'ru_RU' );
assert_test( $i18n->filter_translations( $load_str, $load_str, 'arv-seller' ) === 'Загрузка панели облачных сервисов ArvanCloud...', "Russian: '{$load_str}'" );

echo "\n=========================================================\n";
echo "SUMMARY: {$passed} Passed, {$failed} Failed\n";
echo "=========================================================\n";
if ( $failed > 0 ) {
	exit( 1 );
}
