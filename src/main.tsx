import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('New content available, reloading...');
      window.location.reload();
    },
    onRegistered(r) {
      // Check for updates every 10 minutes
      r && setInterval(() => {
        r.update();
      }, 10 * 60 * 1000);
      
      // Check for updates when the app comes back to the foreground
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && r) {
          r.update();
        }
      });
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
