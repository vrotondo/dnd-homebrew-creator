// Save this file in your project root directory
// Run with: node diagnostic.js

const fs = require('fs');
const path = require('path');

// ANSI color codes for better output formatting
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

// Print header
console.log(`${colors.magenta}${colors.bold}========================================${colors.reset}`);
console.log(`${colors.magenta}${colors.bold}  D&D HOMEBREW CREATOR - DIAGNOSTICS${colors.reset}`);
console.log(`${colors.magenta}${colors.bold}========================================${colors.reset}`);
console.log();

// Check critical files
const criticalFiles = [
    { path: 'index.html', description: 'Main HTML file' },
    { path: 'src/main.jsx', description: 'React entry point' },
    { path: 'src/App.jsx', description: 'Main App component' },
    { path: 'src/index.css', description: 'Main stylesheet' },
    { path: 'tailwind.config.js', description: 'Tailwind configuration' },
    { path: 'vite.config.js', description: 'Vite configuration' },
];

console.log(`${colors.cyan}${colors.bold}Checking critical files:${colors.reset}`);
let missingFiles = 0;
criticalFiles.forEach(file => {
    const exists = fs.existsSync(file.path);
    if (exists) {
        console.log(`${colors.green}✓${colors.reset} ${file.path} - ${file.description}`);
    } else {
        console.log(`${colors.red}✗${colors.reset} ${file.path} - ${file.description} ${colors.red}(MISSING)${colors.reset}`);
        missingFiles++;
    }
});

if (missingFiles === 0) {
    console.log(`${colors.green}All critical files present.${colors.reset}`);
} else {
    console.log(`${colors.red}${missingFiles} critical files missing!${colors.reset}`);
}
console.log();

// Check index.html content
console.log(`${colors.cyan}${colors.bold}Analyzing index.html:${colors.reset}`);
try {
    const indexHtml = fs.readFileSync('index.html', 'utf8');

    // Check for root element
    if (indexHtml.includes('<div id="root"></div>')) {
        console.log(`${colors.green}✓${colors.reset} Root element found`);
    } else {
        console.log(`${colors.red}✗${colors.reset} Root element not found or malformed!`);
        console.log(`${colors.yellow}  Make sure your index.html contains: <div id="root"></div>${colors.reset}`);
    }

    // Check for main.jsx script
    if (indexHtml.includes('src="/src/main.jsx"') || indexHtml.includes('src="./src/main.jsx"')) {
        console.log(`${colors.green}✓${colors.reset} main.jsx script reference found`);
    } else {
        console.log(`${colors.red}✗${colors.reset} main.jsx script reference not found or malformed!`);
        console.log(`${colors.yellow}  Make sure your index.html contains: <script type="module" src="/src/main.jsx"></script>${colors.reset}`);
    }
} catch (error) {
    console.log(`${colors.red}✗${colors.reset} Could not read index.html: ${error.message}`);
}
console.log();

// Check Tailwind config
console.log(`${colors.cyan}${colors.bold}Analyzing Tailwind configuration:${colors.reset}`);
try {
    const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');

    // Check content paths
    if (tailwindConfig.includes('./index.html') && tailwindConfig.includes('./src/**/*.{js')) {
        console.log(`${colors.green}✓${colors.reset} Content paths correctly configured`);
    } else {
        console.log(`${colors.red}✗${colors.reset} Content paths may be incorrect`);
        console.log(`${colors.yellow}  Make sure your content array includes: "./index.html" and "./src/**/*.{js,jsx,ts,tsx}"${colors.reset}`);
    }

    // Check custom colors
    if (tailwindConfig.includes("'dnd-red'") && tailwindConfig.includes("'parchment'") && tailwindConfig.includes("'ink'")) {
        console.log(`${colors.green}✓${colors.reset} Custom colors configured correctly`);
    } else {
        console.log(`${colors.red}✗${colors.reset} Custom colors may be missing or incorrectly configured`);
    }

    // Check font families
    const customFonts = ['medieval', 'fantasy', 'manuscript'];
    const missingFonts = customFonts.filter(font => !tailwindConfig.includes(`'${font}'`));

    if (missingFonts.length === 0) {
        console.log(`${colors.green}✓${colors.reset} Custom font families configured correctly`);
    } else {
        console.log(`${colors.red}✗${colors.reset} Some custom font families may be missing: ${missingFonts.join(', ')}`);
    }
} catch (error) {
    console.log(`${colors.red}✗${colors.reset} Could not read tailwind.config.js: ${error.message}`);
}
console.log();

// Check index.css
console.log(`${colors.cyan}${colors.bold}Analyzing CSS setup:${colors.reset}`);
try {
    const indexCss = fs.readFileSync('src/index.css', 'utf8');

    // Check Tailwind directives
    if (indexCss.includes('@tailwind base') &&
        indexCss.includes('@tailwind components') &&
        indexCss.includes('@tailwind utilities')) {
        console.log(`${colors.green}✓${colors.reset} Tailwind directives found`);
    } else {
        console.log(`${colors.red}✗${colors.reset} Tailwind directives missing or incomplete!`);
        console.log(`${colors.yellow}  Make sure your index.css includes all three directives:${colors.reset}`);
        console.log(`${colors.yellow}  @tailwind base;${colors.reset}`);
        console.log(`${colors.yellow}  @tailwind components;${colors.reset}`);
        console.log(`${colors.yellow}  @tailwind utilities;${colors.reset}`);
    }

    // Check for Google Fonts import
    if (indexCss.includes('@import url(') && indexCss.includes('fonts.googleapis.com')) {
        console.log(`${colors.green}✓${colors.reset} Google Fonts import found`);
    } else {
        console.log(`${colors.yellow}⚠${colors.reset} Google Fonts import may be missing`);
        console.log(`${colors.yellow}  Consider adding: @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&family=Cinzel...${colors.reset}`);
    }
} catch (error) {
    console.log(`${colors.red}✗${colors.reset} Could not read src/index.css: ${error.message}`);
}
console.log();

// Check package.json dependencies
console.log(`${colors.cyan}${colors.bold}Analyzing dependencies:${colors.reset}`);
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Critical dependencies to check
    const criticalDeps = {
        react: 'React library',
        'react-dom': 'React DOM',
        'react-router-dom': 'React Router',
        tailwindcss: 'Tailwind CSS',
        '@tailwindcss/forms': 'Tailwind Forms plugin',
        '@tailwindcss/typography': 'Tailwind Typography plugin',
    };

    let missingDeps = 0;
    Object.entries(criticalDeps).forEach(([dep, desc]) => {
        if (dependencies[dep]) {
            console.log(`${colors.green}✓${colors.reset} ${dep} (${dependencies[dep]}) - ${desc}`);
        } else {
            console.log(`${colors.red}✗${colors.reset} ${dep} - ${desc} ${colors.red}(MISSING)${colors.reset}`);
            missingDeps++;
        }
    });

    if (missingDeps === 0) {
        console.log(`${colors.green}All critical dependencies present.${colors.reset}`);
    } else {
        console.log(`${colors.red}${missingDeps} critical dependencies missing!${colors.reset}`);
        console.log(`${colors.yellow}Run: npm install --save [package-name] to install missing packages${colors.reset}`);
    }
} catch (error) {
    console.log(`${colors.red}✗${colors.reset} Could not read package.json: ${error.message}`);
}

// Final recommendations
console.log();
console.log(`${colors.cyan}${colors.bold}Recommendations:${colors.reset}`);
console.log(`1. Try running the test-main.jsx file: ${colors.yellow}npm run dev -- --open src/test-main.jsx${colors.reset}`);
console.log(`2. Check browser console for JavaScript errors`);
console.log(`3. Verify Tailwind is being processed correctly in your Vite config`);
console.log(`4. Make sure your index.html has the correct root element`);
console.log(`5. Try the minimal app (MinimalApp.jsx) to isolate React rendering issues`);
console.log();
console.log(`${colors.magenta}${colors.bold}========================================${colors.reset}`);