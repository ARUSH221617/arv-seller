import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminApp } from './AdminApp';
import '../styles/index.css';

const mount = () => {
  const mountNode = document.getElementById('arvan-admin-root');
  if (mountNode) {
    ReactDOM.createRoot(mountNode).render(
      <React.StrictMode>
        <AdminApp />
      </React.StrictMode>
    );
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
