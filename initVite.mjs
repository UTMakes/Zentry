import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, 'temp-vite-app');

try {
  // Use npm init with yes flag and specify vite template non-interactively
  execSync('npm create vite@latest temp-vite-app -- --template react-swc --yes', { 
    stdio: 'inherit',
    env: { ...process.env, CI: 'true' } 
  });
  console.log('Vite scaffolded successfully.');
} catch (error) {
  console.error('Error scaffolding:', error.message);
}
