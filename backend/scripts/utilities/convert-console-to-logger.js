#!/usr/bin/env node
/**
 * Script to convert console.log statements to proper winston logger calls
 * Usage: node convert-console-to-logger.js
 */

const fs = require('fs');
const path = require('path');

// Directories to process
const dirsToProcess = [
    path.join(__dirname, '../../routes'),
    path.join(__dirname, '../../services'),
    path.join(__dirname, '../../utils'),
    path.join(__dirname, '../../middleware')
];

// Mapping of console methods to logger methods
const consoleToLoggerMap = {
    'console.log': 'logger.info',
    'console.info': 'logger.info',
    'console.warn': 'logger.warn',
    'console.error': 'logger.error',
    'console.debug': 'logger.debug'
};

// Check if logger is imported
function hasLoggerImport(content) {
    return /const\s+logger\s*=\s*require\(['"](\.\.\/)*config\/logger['"]\)/.test(content) ||
           /const\s+\{[^}]*logger[^}]*\}\s*=\s*require/.test(content);
}

// Add logger import at the top
function addLoggerImport(content) {
    // Find the last require statement
    const requireRegex = /^const\s+.*require\([^)]+\);?\s*$/gm;
    const matches = [...content.matchAll(requireRegex)];

    if (matches.length > 0) {
        const lastRequire = matches[matches.length - 1];
        const insertPosition = lastRequire.index + lastRequire[0].length;

        return content.slice(0, insertPosition) +
               "\nconst logger = require('../config/logger');" +
               content.slice(insertPosition);
    }

    // If no requires found, add at the top
    return "const logger = require('../config/logger');\n" + content;
}

// Replace console calls with logger calls
function replaceConsoleCalls(content) {
    let modified = content;

    for (const [consoleMethod, loggerMethod] of Object.entries(consoleToLoggerMap)) {
        // Replace console.log(...) with logger.info(...)
        const regex = new RegExp(consoleMethod.replace('.', '\\.'), 'g');
        modified = modified.replace(regex, loggerMethod);
    }

    return modified;
}

// Process a single file
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Check if file has console statements
        if (/console\.(log|info|warn|error|debug)/.test(content)) {
            // Add logger import if not present
            if (!hasLoggerImport(content)) {
                content = addLoggerImport(content);
                modified = true;
            }

            // Replace console calls
            const newContent = replaceConsoleCalls(content);
            if (newContent !== content) {
                modified = true;
                content = newContent;
            }

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
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
console.log('🔄 Converting console.log to logger calls...\n');

let totalFiles = 0;
for (const dir of dirsToProcess) {
    console.log(`\n📁 Processing ${path.basename(dir)}/...`);
    const count = processDirectory(dir);
    totalFiles += count;
}

console.log(`\n✨ Done! Updated ${totalFiles} file(s)\n`);
