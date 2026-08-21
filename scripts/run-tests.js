/**
 * Automated Test Runner for ArvanCloud Reseller Plugin.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const TESTS_DIR = path.join(ROOT_DIR, 'tests');

const TEST_FILES = [
	path.join(TESTS_DIR, 'test-pricing-api.php'),
	path.join(TESTS_DIR, 'test-wallet-metering.php'),
	path.join(TESTS_DIR, 'test-i18n.php')
];

console.log('===============================================================');
console.log('  🧪 RUNNING AUTOMATED UNIT & INTEGRATION TEST SUITES');
console.log('===============================================================\n');

let allPassed = true;

for (const testFile of TEST_FILES) {
	if (!fs.existsSync(testFile)) {
		console.warn(`  ⚠️ Skipping missing test file: ${testFile}`);
		continue;
	}

	const testName = path.basename(testFile);
	console.log(`\n▶️  Executing: ${testName}...`);
	try {
		const output = execSync(`php "${testFile}"`, { cwd: ROOT_DIR });
		console.log(output.toString());
	} catch (err) {
		console.error(`❌ Test Suite ${testName} Failed:\n`, err.stdout ? err.stdout.toString() : err.message);
		allPassed = false;
	}
}

console.log('\n===============================================================');
if (allPassed) {
	console.log('  🎉 ALL AUTOMATED TEST SUITES PASSED SUCCESSFULLY!');
	console.log('===============================================================\n');
	process.exit(0);
} else {
	console.error('  ❌ ONE OR MORE TEST SUITES FAILED.');
	console.log('===============================================================\n');
	process.exit(1);
}
