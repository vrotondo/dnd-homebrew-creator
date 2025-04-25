// debug.js - Run this with Node to debug your project setup
const fs = require('fs');
const path = require('path');
const util = require('util');

// Make fs.readFile return a promise
const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);

async function debugProject() {
    console.log('D&D Homebrew Creator - Project Debugger');
    console.log('======================================');

    try {
        // Check critical files exist
        const criticalFiles = [
            'index.html',
            'src/main.jsx',
            'src/App.jsx',
            'src/index.css',
            'tailwind.config.js',
            'vite.config.js',
            'package.json'
        ];

        console.log('\nChecking critical files:');
        for (const file of criticalFiles) {
            try {
                await readFile(file, 'utf8');
                console.log(`✅ ${file} exists`);
            } catch (error) {
                console.log(`❌ ${file} is missing`);
            }
        }

        // Check Tailwind config
        console.log('\nChecking Tailwind configuration:');
        try {
            const tailwindConfig = await readFile('tailwind.config.js', 'utf8');

            // Check content paths
            if (tailwindConfig.includes('./index.html') &&
                tailwindConfig.includes('./src/**/*.{js,ts,jsx,tsx}')) {
                console.log('✅ Content paths look correct');
            } else {
                console.log('❌ Content paths may be incorrect in tailwind.config.js');
            }

            // Check for custom fonts
            const customFonts = ['MedievalSharp', 'Cinzel', 'Fondamento'];
            const missingFonts = customFonts.filter(font => !tailwindConfig.includes(font));

            if (missingFonts.length === 0) {
                console.log('✅ All custom fonts configured');
            } else {
                console.log(`❌ Missing font configurations: ${missingFonts.join(', ')}`);
            }

        } catch (error) {
            console.log('❌ Could not read tailwind.config.js');
        }

        // Check for index.css Tailwind directives
        try {
            const indexCss = await readFile('src/index.css', 'utf8');
            if (indexCss.includes('@tailwind base') &&
                indexCss.includes('@tailwind components') &&
                indexCss.includes('@tailwind utilities')) {
                console.log('✅ Tailwind directives present in CSS');
            } else {
                console.log('❌ Missing Tailwind directives in src/index.css');
            }

            // Check for font imports
            if (indexCss.includes('@import url') && indexCss.includes('fonts.googleapis.com')) {
                console.log('✅ Google Fonts imported');
            } else {
                console.log('❌ Google Fonts may not be properly imported');
            }
        } catch (error) {
            console.log('❌ Could not read src/index.css');
        }

        // Check dependencies
        try {
            const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

            const requiredDeps = [
                'react',
                'react-dom',
                'react-router-dom',
                'tailwindcss',
                '@tailwindcss/forms',
                '@tailwindcss/typography'
            ];

            const missingDeps = requiredDeps.filter(dep => !deps[dep]);

            if (missingDeps.length === 0) {
                console.log('✅ All required dependencies installed');
            } else {
                console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
            }
        } catch (error) {
            console.log('❌ Could not read package.json');
        }

        console.log('\nRecommended fixes:');
        console.log('1. Make sure all critical files are present');
        console.log('2. Check that your font imports are working properly');
        console.log('3. Verify paths to background images are correct');
        console.log('4. Make sure Tailwind is properly initialized in CSS');
        console.log('5. Check browser console for React or JavaScript errors');

    } catch (error) {
        console.error('Error running debugger:', error);
    }
}

debugProject();