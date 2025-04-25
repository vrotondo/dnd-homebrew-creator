// Add this file to your src directory and import it in your main.jsx
// This will print debugging information to help identify rendering issues

export function debugReactRendering() {
    // Check if React DOM is available
    if (typeof document === 'undefined') {
        console.error('DEBUG: document is not defined - Running in a non-browser environment?');
        return;
    }

    console.log('--------- REACT DEBUG TOOL ---------');

    // Check for root element
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        console.error('DEBUG ERROR: Root element #root not found in the document');
    } else {
        console.log('DEBUG: Root element #root found ✓');
        console.log('DEBUG: Root element contents:', rootElement.innerHTML);
    }

    // Check React and ReactDOM versions
    try {
        const reactVersion = require('react').version;
        const reactDomVersion = require('react-dom').version;
        console.log(`DEBUG: React version: ${reactVersion} ✓`);
        console.log(`DEBUG: ReactDOM version: ${reactDomVersion} ✓`);

        if (reactVersion.split('.')[0] !== reactDomVersion.split('.')[0]) {
            console.error('DEBUG ERROR: React and ReactDOM major versions don\'t match');
        }
    } catch (err) {
        console.error('DEBUG ERROR: Failed to detect React versions', err);
    }

    // Check if CSS is loading
    const allStyles = document.styleSheets;
    console.log(`DEBUG: Number of stylesheets loaded: ${allStyles.length}`);

    // Test if tailwind classes are available
    const testElement = document.createElement('div');
    testElement.className = 'bg-parchment text-ink'; // Using your custom Tailwind classes
    document.body.appendChild(testElement);

    setTimeout(() => {
        const computedStyle = window.getComputedStyle(testElement);
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;

        console.log('DEBUG: Testing Tailwind custom colors:');
        console.log(`  - bg-parchment computed to: ${bgColor}`);
        console.log(`  - text-ink computed to: ${textColor}`);

        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            console.error('DEBUG ERROR: Tailwind custom colors not working - bg-parchment not applied');
        } else {
            console.log('DEBUG: Tailwind custom colors working ✓');
        }

        document.body.removeChild(testElement);
    }, 100);

    // Log Redux store if it exists
    try {
        const store = require('./store').store;
        if (store && typeof store.getState === 'function') {
            console.log('DEBUG: Redux store found ✓');
            console.log('DEBUG: Initial state:', store.getState());
        } else {
            console.error('DEBUG ERROR: Redux store not properly configured');
        }
    } catch (err) {
        console.error('DEBUG ERROR: Failed to access Redux store', err);
    }

    console.log('--------- END DEBUG TOOL ---------');
}