import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'
import './index.css'
import { debugReactRendering } from './debug'

// Basic console logging to verify script execution
console.log('main.jsx is running...');

// Run debugging tool
debugReactRendering();

// Attempt to render with more error handling
try {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Fatal error: Root element #root not found in index.html');
    // Create a root element dynamically if missing
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    console.log('Created missing #root element dynamically');

    ReactDOM.createRoot(newRoot).render(
      <React.StrictMode>
        <div className="p-4 bg-white">
          <h1 className="text-2xl text-red-600">Emergency Rendering Mode</h1>
          <p>The app couldn't find the root element and created one dynamically.</p>
        </div>
      </React.StrictMode>
    );
  } else {
    console.log('Found #root element, attempting to render app');

    // Render test element first to verify React is working
    const testRoot = ReactDOM.createRoot(rootElement);
    testRoot.render(
      <React.StrictMode>
        <div className="p-4">
          <h1 className="text-xl text-dnd-red font-bold">D&D Homebrew Creator</h1>
          <p className="text-ink">Rendering test successful. Loading full app...</p>
        </div>
      </React.StrictMode>
    );

    // Wait a moment and then render the actual app
    setTimeout(() => {
      try {
        testRoot.render(
          <React.StrictMode>
            <Provider store={store}>
              <App />
            </Provider>
          </React.StrictMode>
        );
        console.log('Full app rendering attempted');
      } catch (appError) {
        console.error('Error rendering full app:', appError);
        testRoot.render(
          <React.StrictMode>
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h1 className="text-xl text-red-600 font-bold">Error Rendering App</h1>
              <p className="text-gray-800">{appError.message}</p>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                {appError.stack}
              </pre>
            </div>
          </React.StrictMode>
        );
      }
    }, 1000);
  }
} catch (error) {
  console.error('Critical rendering error:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: #e53e3e;">
      <h1 style="margin-bottom: 10px;">Critical React Rendering Error</h1>
      <p>${error.message}</p>
      <pre style="background: #f7fafc; padding: 10px; overflow: auto; margin-top: 10px;">${error.stack}</pre>
    </div>
  `;
}