import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

const mount = () => {
  const mountNode = document.getElementById('arvan-cloud-app');
  if (mountNode) {
    ReactDOM.createRoot(mountNode).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
