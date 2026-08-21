/**
 * Modern, Ultra-Fast Development Server & Automatic Live-Reload Engine.
 *
 * Uses native Node HTTP Proxy, WebSocket (ws), Chokidar, and instant Vite rebuilds.
 * - Injects CSS live into the browser without full reload.
 * - Automatically runs Vite build on TS/TSX edits and reloads the browser.
 * - Automatically rewrites backend origins to localhost proxy to eliminate all CORS issues.
 * - Adds Access-Control-Allow-Origin: * to all proxied assets.
 */

import http from 'http';
import https from 'https';
import path from 'path';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WP_PROXY_TARGET = process.env.WP_URL || process.env.WORDPRESS_URL || 'http://seller.local';
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3050;
const ROOT_DIR = path.resolve(__dirname, '..');

const parsedTarget = new URL(WP_PROXY_TARGET);
const isTargetHttps = parsedTarget.protocol === 'https:';
const transport = isTargetHttps ? https : http;

// Client-side script injected into HTML for instant live-reload
const INJECTED_RELOAD_SCRIPT = `
<!-- ARVANCLOUD LIVE RELOAD CLIENT -->
<script>
(function() {
	function connect() {
		var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		var socket = new WebSocket(protocol + '//' + window.location.host + '/__arvan_reload_ws');

		socket.onmessage = function(msg) {
			if (msg.data === 'reload-css') {
				var links = document.querySelectorAll('link[rel="stylesheet"]');
				links.forEach(function(link) {
					var href = link.getAttribute('href');
					if (href && (href.indexOf('arv-seller') !== -1 || href.indexOf('arvan') !== -1 || href.indexOf('canvas') !== -1)) {
						var cleanHref = href.split('?')[0];
						link.setAttribute('href', cleanHref + '?_r=' + Date.now());
					}
				});
			} else if (msg.data === 'reload-page') {
				window.location.reload();
			}
		};

		socket.onclose = function() {
			setTimeout(connect, 2000);
		};
	}
	connect();
})();
</script>
<!-- /ARVANCLOUD LIVE RELOAD CLIENT -->
`;

function createDevProxy(port, onSuccess, onError) {
	const server = http.createServer((req, res) => {
		// Handle CORS Preflight immediately
		if (req.method === 'OPTIONS') {
			res.writeHead(204, {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': '*',
			});
			res.end();
			return;
		}

		const targetUrl = new URL(req.url, WP_PROXY_TARGET);

		const headers = { ...req.headers };
		headers.host = parsedTarget.host;
		headers['x-forwarded-host'] = req.headers.host || `localhost:${port}`;
		headers['x-forwarded-proto'] = 'http';
		headers['accept-encoding'] = 'identity'; // Disable compression so we can rewrite URLs and inject script

		const proxyReq = transport.request(
			targetUrl,
			{
				method: req.method,
				headers: headers,
				rejectUnauthorized: false,
			},
			(proxyRes) => {
				const contentType = proxyRes.headers['content-type'] || '';
				const isHtml = contentType.includes('text/html');

				const resHeaders = { ...proxyRes.headers };
				delete resHeaders['content-length']; // Length will change after injection & URL rewrite

				// Add universal CORS headers to prevent browser blocks
				resHeaders['access-control-allow-origin'] = '*';
				resHeaders['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
				resHeaders['access-control-allow-headers'] = '*';

				if (isHtml) {
					let body = '';
					proxyRes.setEncoding('utf8');
					proxyRes.on('data', (chunk) => {
						body += chunk;
					});
					proxyRes.on('end', () => {
						const targetOrigin = parsedTarget.origin;
						const localOrigin = `http://localhost:${port}`;

						// Rewrite all absolute links matching the target WP origin so everything stays on localhost
						body = body.replaceAll(targetOrigin, localOrigin);

						if (body.includes('</body>')) {
							body = body.replace('</body>', `${INJECTED_RELOAD_SCRIPT}</body>`);
						} else {
							body += INJECTED_RELOAD_SCRIPT;
						}
						res.writeHead(proxyRes.statusCode, resHeaders);
						res.end(body);
					});
				} else {
					res.writeHead(proxyRes.statusCode, resHeaders);
					proxyRes.pipe(res);
				}
			}
		);

		proxyReq.on('error', (err) => {
			res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
			res.end(`
				<div style="font-family:system-ui,sans-serif;padding:40px;max-width:600px;margin:50px auto;background:#1e293b;color:#f8fafc;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.3);">
					<h2 style="color:#00baba;margin-top:0;">⚡ ArvanCloud Dev Server Proxy Error</h2>
					<p>Could not connect to WordPress target: <code>${WP_PROXY_TARGET}</code></p>
					<p style="color:#94a3b8;font-size:14px;">Error: ${err.message}</p>
					<hr style="border:0;border-top:1px solid #334155;margin:20px 0;" />
					<p style="font-size:13px;color:#cbd5e1;">Make sure LocalWP / your local WordPress environment is running at <strong>${WP_PROXY_TARGET}</strong>.</p>
				</div>
			`);
		});

		req.pipe(proxyReq);
	});

	// Attach WebSocket Server
	const wss = new WebSocketServer({ server, path: '/__arvan_reload_ws' });
	const clients = new Set();

	wss.on('connection', (ws) => {
		clients.add(ws);
		ws.on('close', () => clients.delete(ws));
	});

	function broadcast(msg) {
		for (const client of clients) {
			if (client.readyState === 1) {
				client.send(msg);
			}
		}
	}

	server.on('error', (err) => {
		if (err.code === 'EADDRINUSE') {
			onError(err);
		} else {
			console.error('Dev server error:', err);
		}
	});

	server.listen(port, () => {
		onSuccess(server, broadcast);
	});
}

function startServer(port = DEFAULT_PORT) {
	createDevProxy(
		port,
		(server, broadcast) => {
			console.log('===============================================================');
			console.log('  ⚡ ARVANCLOUD RESELLER — AUTOMATIC DEV SERVER (PNPM) ⚡');
			console.log('===============================================================');
			console.log(`  Proxy Target:  ${WP_PROXY_TARGET}`);
			console.log(`  Live Server:   http://localhost:${port}`);
			console.log(`  Cloud Canvas:  http://localhost:${port}/cloud-services/`);
			console.log('===============================================================\n');

			// Initial build check
			try {
				console.log('📦 Ensuring latest frontend bundles are built...');
				execSync('npx vite build', { stdio: 'ignore', cwd: ROOT_DIR });
				console.log('✅ Bundles ready!\n');
			} catch (e) {
				console.warn('Initial build warning:', e.message);
			}

			// File Watcher
			let isBuilding = false;
			const watcher = chokidar.watch(
				[
					path.join(ROOT_DIR, '**/*.php'),
					path.join(ROOT_DIR, '**/*.css'),
					path.join(ROOT_DIR, '**/*.js'),
					path.join(ROOT_DIR, '**/*.ts'),
					path.join(ROOT_DIR, '**/*.tsx'),
					path.join(ROOT_DIR, 'languages/**/*.po'),
				],
				{
					ignored: [
						'**/node_modules/**',
						'**/dist/**',
						'**/public/dist/**',
						'**/scripts/**',
						'**/tests/**',
						'**/.git/**',
					],
					ignoreInitial: true,
				}
			);

			watcher.on('all', (event, filePath) => {
				const ext = path.extname(filePath);
				const rel = path.relative(ROOT_DIR, filePath);

				if (ext === '.ts' || ext === '.tsx' || (ext === '.css' && rel.startsWith('src'))) {
					if (isBuilding) return;
					isBuilding = true;
					console.log(`[${new Date().toLocaleTimeString()}] ⚡ Rebuilding React TS bundle: ${rel}...`);
					try {
						execSync('npx vite build', { stdio: 'ignore', cwd: ROOT_DIR });
						console.log(`[${new Date().toLocaleTimeString()}] ✅ Rebuild complete.`);
						broadcast('reload-page');
					} catch (e) {
						console.error('Build error:', e.message);
					} finally {
						isBuilding = false;
					}
				} else if (ext === '.css') {
					console.log(`[${new Date().toLocaleTimeString()}] 🎨 CSS Changed: ${rel} (Hot Injected)`);
					broadcast('reload-css');
				} else {
					console.log(`[${new Date().toLocaleTimeString()}] 🔄 Code Changed: ${rel} (Auto Reloading)`);
					broadcast('reload-page');
				}
			});

			console.log(`✨ File watcher active with instant live-reload!`);
			console.log(`💡 Open http://localhost:${port}/cloud-services/ in your browser.\n`);
		},
		() => {
			console.log(`⚠️ Port ${port} is in use, trying port ${port + 1}...`);
			startServer(port + 1);
		}
	);
}

startServer();
