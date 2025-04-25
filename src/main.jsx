import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'
import './index.css'

// Debug to verify rendering
console.log('Main.jsx is executing...')

// Check if root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found! Check your index.html file')
} else {
  console.log('Root element found, rendering React app...')

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}