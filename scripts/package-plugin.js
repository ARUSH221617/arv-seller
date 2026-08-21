/**
 * Production Plugin Packaging Script for ArvanCloud Reseller WordPress Plugin.
 *
 * Creates a clean, zero-dependency, production-ready release ZIP in dist/
 * excluding all dev tooling, node_modules, and git files.
 */

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const MAIN_FILE = path.resolve(ROOT_DIR, 'arv-seller.php');

// Extract Version from arv-seller.php
let version = '1.0.0';
if (fs.existsSync(MAIN_FILE)) {
	const content = fs.readFileSync(MAIN_FILE, 'utf8');
	const match = content.match(/Version:\s*([0-9\.]+)/i);
	if (match && match[1]) {
		version = match[1].trim();
	}
}

if (!fs.existsSync(DIST_DIR)) {
	fs.mkdirSync(DIST_DIR, { recursive: true });
}

const zipFileName = `arv-seller-v${version}.zip`;
const zipFilePath = path.join(DIST_DIR, zipFileName);
const output = fs.createWriteStream(zipFilePath);
const archive = archiver('zip', { zlib: { level: 9 } });

console.log('===============================================================');
console.log(`  📦 PACKAGING ARVANCLOUD RESELLER PLUGIN v${version}`);
console.log('===============================================================\n');

output.on('close', function() {
	const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
	const sizeInKB = (archive.pointer() / 1024).toFixed(1);

	// Generate SHA256
	const fileBuffer = fs.readFileSync(zipFilePath);
	const hashSum = crypto.createHash('sha256');
	hashSum.update(fileBuffer);
	const hexDigest = hashSum.digest('hex');

	console.log(`  ✅ Package Created: dist/${zipFileName}`);
	console.log(`  📏 Archive Size:   ${sizeInMB > 1 ? sizeInMB + ' MB' : sizeInKB + ' KB'} (${archive.pointer()} bytes)`);
	console.log(`  🔒 SHA256:         ${hexDigest}`);
	console.log('\n===============================================================');
	console.log('  🚀 Ready for production deployment & WordPress installation!');
	console.log('===============================================================\n');
});

archive.on('warning', function(err) {
	if (err.code === 'ENOENT') {
		console.warn('Archive warning:', err);
	} else {
		throw err;
	}
});

archive.on('error', function(err) {
	throw err;
});

archive.pipe(output);

// Files and Directories to include in production bundle
const INCLUDE_PATHS = [
	'admin',
	'includes',
	'languages',
	'public',
	'templates',
	'arv-seller.php',
	'index.php',
	'uninstall.php',
	'README.txt',
	'LICENSE.txt'
];

for (const item of INCLUDE_PATHS) {
	const itemPath = path.join(ROOT_DIR, item);
	if (!fs.existsSync(itemPath)) continue;

	const stat = fs.statSync(itemPath);
	if (stat.isDirectory()) {
		archive.directory(itemPath, `arv-seller/${item}`);
	} else {
		archive.file(itemPath, { name: `arv-seller/${item}` });
	}
}

archive.finalize();
