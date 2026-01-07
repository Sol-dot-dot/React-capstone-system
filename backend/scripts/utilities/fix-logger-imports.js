#!/usr/bin/env node
/**
 * Script to fix incorrect logger imports
 * Changes: const logger = require('../config/logger')
 * To: const { logger } = require('../config/logger')
 */

const fs = require('fs');
const path = require('path');

// Directories to process
const dirsToProcess = [
    path.join(__dirname, '../../routes'),
    path.join(__dirname, '../../services'),
    path.join(__dirname, '../../utils')
];

// Fix logger import
function fixLoggerImport(content) {
    // Replace incorrect import with correct destructured import
    return content.replace(
        /const logger = require\('\.\.\/config\/logger'\);?/g,
        "const { logger } = require('../config/logger');"
    );
}

// Process a single file
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check if file has incorrect logger import
        if (/const logger = require\('\.\.\/config\/logger'\);?/.test(content)) {
            const newContent = fixLoggerImport(content);

            if (newContent !== content) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
                return 1;
            }
        }

        return 0;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return 0;
    }
}

// Process all files in a directory
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
            count += processFile(fullPath);
        }
    }

    return count;
}

// Main execution
console.log('🔄 Fixing logger imports...\n');

let totalFiles = 0;
for (const dir of dirsToProcess) {
    console.log(`\n📁 Processing ${path.basename(dir)}/...`);
    const count = processDirectory(dir);
    totalFiles += count;
}

console.log(`\n✨ Done! Fixed ${totalFiles} file(s)\n`);
