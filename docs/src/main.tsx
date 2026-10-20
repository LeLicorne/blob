import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@docs/app';
import '@docs/styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
