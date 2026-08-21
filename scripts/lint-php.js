/**
 * Automatic PHP Syntax Linter for all Plugin Files.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'vendor'];

function getAllPhpFiles(dir) {
	let results = [];
	const list = fs.readdirSync(dir);
	for (const file of list) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat && stat.isDirectory()) {
			if (!EXCLUDE_DIRS.includes(file)) {
				results = results.concat(getAllPhpFiles(filePath));
			}
		} else if (file.endsWith('.php')) {
			results.push(filePath);
		}
	}
	return results;
}

console.log('===============================================================');
console.log('  🔍 CHECKING PHP SYNTAX INTEGRITY ACROSS PLUGIN FILES');
console.log('===============================================================\n');

const phpFiles = getAllPhpFiles(ROOT_DIR);
let errors = 0;

for (const file of phpFiles) {
	const relPath = path.relative(ROOT_DIR, file);
	try {
		execSync(`php -l "${file}"`, { stdio: 'pipe' });
		console.log(`  [OK] ${relPath}`);
	} catch (err) {
		console.error(`  [FAIL] ${relPath}\n    ${err.stderr ? err.stderr.toString() : err.message}`);
		errors++;
	}
}

console.log('\n===============================================================');
if (errors === 0) {
	console.log(`  ✅ ALL ${phpFiles.length} PHP FILES PASSED SYNTAX VALIDATION!`);
	console.log('===============================================================\n');
	process.exit(0);
} else {
	console.error(`  ❌ ${errors} FILE(S) FAILED SYNTAX VALIDATION.`);
	console.log('===============================================================\n');
	process.exit(1);
}
