import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDirs = [
  path.resolve(__dirname, '../public/images/os'),
  path.resolve(__dirname, '../src/assets/os'),
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Clean up temp file
const tempFile = path.resolve(__dirname, '../windows.wikimedia.svg');
if (fs.existsSync(tempFile)) {
  fs.unlinkSync(tempFile);
}

const icons = [
  {
    name: 'ubuntu',
    color: '#E95420',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/ubuntu.svg',
  },
  {
    name: 'debian',
    color: '#D70A53',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/debian.svg',
  },
  {
    name: 'almalinux',
    color: '#0A2540',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/almalinux.svg',
  },
  {
    name: 'windows',
    color: '#0078D4',
    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Windows</title><path fill="#0078D4" d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.628h11.377V24H0zm12.623 0H24V24H12.623z"/></svg>',
  },
  {
    name: 'rockylinux',
    color: '#10B981',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/rockylinux.svg',
  },
  {
    name: 'centos',
    color: '#932178',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/centos.svg',
  },
  {
    name: 'fedora',
    color: '#51A2DA',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/fedora.svg',
  },
  {
    name: 'archlinux',
    color: '#1793D1',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/archlinux.svg',
  },
  {
    name: 'alpinelinux',
    color: '#0D597F',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/alpinelinux.svg',
  },
  {
    name: 'redhat',
    color: '#EE0000',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/redhat.svg',
  },
];

const download = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });

async function run() {
  console.log('Downloading real OS logos...');
  for (const item of icons) {
    let svgContent = item.svg;
    if (!svgContent && item.url) {
      const raw = await download(item.url);
      svgContent = raw.replace('<path ', `<path fill="${item.color}" `);
    }
    for (const dir of targetDirs) {
      const filePath = path.join(dir, `${item.name}.svg`);
      fs.writeFileSync(filePath, svgContent, 'utf8');
      console.log(`Saved: ${filePath}`);
    }
  }
  console.log('All OS logos downloaded successfully.');
}

run();
