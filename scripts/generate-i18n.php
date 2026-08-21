<?php
/**
 * Standard WordPress PO, POT & MO Translation Catalog Generator
 * ArvanCloud Reseller Plugin
 *
 * @package ArvanCloud_Reseller
 */

$root_dir = dirname( __DIR__ );
$tools_js = $root_dir . '/scripts/i18n-tools.js';

if ( file_exists( $tools_js ) ) {
	passthru( 'node "' . $tools_js . '"', $return_var );
	if ( 0 === $return_var ) {
		exit( 0 );
	}
}

// Fallback in case Node.js is not present in the PHP environment:
if ( ! defined( 'WPINC' ) ) {
	define( 'WPINC', true );
}

require_once $root_dir . '/includes/class-arv-seller-i18n.php';

$languages = Arv_Seller_i18n::get_supported_languages();
$lang_dir  = $root_dir . '/languages';

if ( ! is_dir( $lang_dir ) ) {
	mkdir( $lang_dir, 0755, true );
}

$now = gmdate( 'Y-m-d H:i:s+0000' );

// Plural forms definition per locale
$plural_forms = array(
	'fa_IR' => 'nplurals=2; plural=(n > 1);',
	'en_US' => 'nplurals=2; plural=(n != 1);',
	'ar'    => 'nplurals=6; plural=(n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5);',
	'tr_TR' => 'nplurals=2; plural=(n > 1);',
	'zh_CN' => 'nplurals=1; plural=0;',
	'ru_RU' => 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
);

$fa_dict = Arv_Seller_i18n::get_dictionary( 'fa' );
$keys    = array_keys( $fa_dict );
sort( $keys );

// 1. Generate POT Template
$pot_header = <<<POT
msgid ""
msgstr ""
"Project-Id-Version: ArvanCloud Reseller 1.0.0\\n"
"Report-Msgid-Bugs-To: https://arvancloud.ir\\n"
"POT-Creation-Date: {$now}\\n"
"PO-Revision-Date: {$now}\\n"
"Last-Translator: ArvanCloud Dev Team <support@arvancloud.ir>\\n"
"Language-Team: ArvanCloud Internationalization Team\\n"
"Language: en\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\\n"
"X-Generator: ArvanCloud i18n Toolchain\\n"
"X-Domain: arv-seller\\n"

POT;

$pot_content = $pot_header . "\n";
foreach ( $keys as $key ) {
	$pot_content .= 'msgid "' . addcslashes( $key, "\"\\\n\r\t" ) . "\"\n";
	$pot_content .= "msgstr \"\"\n\n";
}
file_put_contents( "{$lang_dir}/arv-seller.pot", $pot_content );
echo "Generated arv-seller.pot with " . count( $keys ) . " strings\n";

// 2. Generate PO and MO for each language
foreach ( $languages as $l_key => $l_meta ) {
	$code   = $l_meta['code'];
	$dict   = Arv_Seller_i18n::get_dictionary( $l_key );
	$plural = isset( $plural_forms[ $code ] ) ? $plural_forms[ $code ] : 'nplurals=2; plural=(n != 1);';

	$po_header = <<<PO
msgid ""
msgstr ""
"Project-Id-Version: ArvanCloud Reseller 1.0.0\\n"
"Report-Msgid-Bugs-To: https://arvancloud.ir\\n"
"POT-Creation-Date: {$now}\\n"
"PO-Revision-Date: {$now}\\n"
"Last-Translator: ArvanCloud Dev Team <support@arvancloud.ir>\\n"
"Language-Team: ArvanCloud {$l_meta['name']} Team\\n"
"Language: {$code}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Plural-Forms: {$plural}\\n"
"X-Generator: ArvanCloud i18n Toolchain\\n"
"X-Domain: arv-seller\\n"

PO;

	$po_content = $po_header . "\n";
	$mo_entries = array( array( 'msgid' => '', 'msgstr' => $po_header ) );

	foreach ( $keys as $key ) {
		$trans = isset( $dict[ $key ] ) ? $dict[ $key ] : ( 'en' === $l_key ? $key : '' );
		$po_content .= 'msgid "' . addcslashes( $key, "\"\\\n\r\t" ) . "\"\n";
		$po_content .= 'msgstr "' . addcslashes( $trans, "\"\\\n\r\t" ) . "\"\n\n";
		$mo_entries[] = array( 'msgid' => $key, 'msgstr' => $trans );
	}

	file_put_contents( "{$lang_dir}/arv-seller-{$code}.po", $po_content );
	echo "Generated arv-seller-{$code}.po (" . count( $keys ) . " strings)\n";

	// Compile binary MO
	$mo_data = compile_po_to_mo( $mo_entries );
	file_put_contents( "{$lang_dir}/arv-seller-{$code}.mo", $mo_data );
	echo "Compiled arv-seller-{$code}.mo (" . strlen( $mo_data ) . " bytes)\n";
}

echo "All catalog and binary MO files generated successfully!\n";

/**
 * Compile array of translations into standard GNU gettext binary .mo string
 */
function compile_po_to_mo( $entries ) {
	// Sort by msgid in byte order
	usort( $entries, function( $a, $b ) {
		return strcmp( $a['msgid'], $b['msgid'] );
	} );

	$count = count( $entries );
	$header_size = 28;
	$orig_table_offset = $header_size;
	$trans_table_offset = $orig_table_offset + ( $count * 8 );
	$strings_offset = $trans_table_offset + ( $count * 8 );

	$orig_table = '';
	$trans_table = '';
	$strings_data = '';
	$current_offset = $strings_offset;

	$orig_offsets = array();
	$trans_offsets = array();

	// Original strings
	foreach ( $entries as $entry ) {
		$str = $entry['msgid'] . "\0";
		$len = strlen( $entry['msgid'] );
		$orig_table .= pack( 'VV', $len, $current_offset );
		$strings_data .= $str;
		$current_offset += strlen( $str );
	}

	// Translation strings
	foreach ( $entries as $entry ) {
		$str = $entry['msgstr'] . "\0";
		$len = strlen( $entry['msgstr'] );
		$trans_table .= pack( 'VV', $len, $current_offset );
		$strings_data .= $str;
		$current_offset += strlen( $str );
	}

	// MO Header
	$mo_header = pack(
		'V7',
		0x950412de, // magic number
		0,          // format revision
		$count,     // number of strings
		$orig_table_offset,
		$trans_table_offset,
		0,          // hash table size
		0           // hash table offset
	);

	return $mo_header . $orig_table . $trans_table . $strings_data;
}
