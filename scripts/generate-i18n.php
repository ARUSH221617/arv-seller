<?php
/**
 * PO & POT Translation Catalog Generator for ArvanCloud Reseller Plugin.
 */

if ( ! defined( 'WPINC' ) ) {
	define( 'WPINC', true );
}

$root_dir = dirname( __DIR__ );
require_once $root_dir . '/includes/class-arv-seller-i18n.php';

$languages = Arv_Seller_i18n::get_supported_languages();
$lang_dir  = $root_dir . '/languages';

if ( ! is_dir( $lang_dir ) ) {
	mkdir( $lang_dir, 0755, true );
}

$header_pot = <<<POT
msgid ""
msgstr ""
"Project-Id-Version: ArvanCloud Reseller 1.0.0\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2026-08-20 22:45+0330\\n"
"PO-Revision-Date: 2026-08-20 22:45+0330\\n"
"Last-Translator: \\n"
"Language-Team: \\n"
"Language: en\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: Poedit 3.0\\n"
"X-Domain: arv-seller\\n"

POT;

// Get English base strings from Persian dictionary keys
$fa_dict = Arv_Seller_i18n::get_dictionary( 'fa' );
$keys    = array_keys( $fa_dict );

// Generate POT
$pot_content = $header_pot . "\n";
foreach ( $keys as $key ) {
	$pot_content .= "msgid \"" . addcslashes( $key, '"\\' ) . "\"\n";
	$pot_content .= "msgstr \"\"\n\n";
}
file_put_contents( "{$lang_dir}/arv-seller.pot", $pot_content );
echo "Generated arv-seller.pot with " . count( $keys ) . " strings\n";

// Generate each language PO
foreach ( $languages as $l_key => $l_meta ) {
	$code = $l_meta['code'];
	$dict = Arv_Seller_i18n::get_dictionary( $l_key );

	$po_content = <<<PO
msgid ""
msgstr ""
"Project-Id-Version: ArvanCloud Reseller 1.0.0\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2026-08-20 22:45+0330\\n"
"PO-Revision-Date: 2026-08-20 22:45+0330\\n"
"Last-Translator: \\n"
"Language-Team: \\n"
"Language: {$l_key}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: Poedit 3.0\\n"
"X-Domain: arv-seller\\n"

PO;
	$po_content .= "\n";

	foreach ( $keys as $key ) {
		$trans = isset( $dict[ $key ] ) ? $dict[ $key ] : ( 'en' === $l_key ? $key : '' );
		$po_content .= "msgid \"" . addcslashes( $key, '"\\' ) . "\"\n";
		$po_content .= "msgstr \"" . addcslashes( $trans, '"\\' ) . "\"\n\n";
	}

	file_put_contents( "{$lang_dir}/arv-seller-{$code}.po", $po_content );
	echo "Generated arv-seller-{$code}.po (" . count( $keys ) . " strings)\n";
}

echo "All catalog files generated successfully!\n";
