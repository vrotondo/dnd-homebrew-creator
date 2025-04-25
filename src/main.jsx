import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import App from './App';
import './index.css';
// Remove this problematic import
// import { debugReactRendering } from './debug';

// Basic console logging to verify script execution
console.log('main.jsx is running...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename="/dnd-homebrew-creator">
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);