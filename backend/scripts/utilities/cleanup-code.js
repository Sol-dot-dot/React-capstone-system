#!/usr/bin/env node
/**
 * Basic code cleanup script
 * - Removes trailing whitespace
 * - Removes multiple consecutive blank lines
 * - Ensures files end with single newline
 */

const fs = require('fs');
const path = require('path');

const dirsToProcess = [
    path.join(__dirname, '../../routes'),
    path.join(__dirname, '../../services'),
    path.join(__dirname, '../../utils'),
    path.join(__dirname, '../../middleware'),
    path.join(__dirname, '../../config')
];

function cleanupFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        const original = content;

        // Remove trailing whitespace from each line
        content = content.split('\n').map(line => line.trimEnd()).join('\n');

        // Replace multiple consecutive blank lines with max 2
        content = content.replace(/\n{4,}/g, '\n\n\n');

        // Ensure file ends with single newline
        content = content.trimEnd() + '\n';

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Cleaned: ${path.relative(process.cwd(), filePath)}`);
            return 1;
        }

        return 0;
    } catch (error) {
        console.error(`❌ Error cleaning ${filePath}:`, error.message);
        return 0;
    }
}

function processDirectory(dirPath) {
    let count = 0;

    if (!fs.existsSync(dirPath)) {
        console.warn(`⚠️  Directory not found: ${dirPath}`);
        return count;
    }

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            count += processDirectory(fullPath);
        } else if (file.endsWith('.js')) {
            count += cleanupFile(fullPath);
        }
    }

    return count;
}

console.log('🔄 Cleaning up code formatting...\n');

let totalFiles = 0;
for (const dir of dirsToProcess) {
    console.log(`\n📁 Processing ${path.basename(dir)}/...`);
    const count = processDirectory(dir);
    totalFiles += count;
}

console.log(`\n✨ Done! Cleaned ${totalFiles} file(s)\n`);
