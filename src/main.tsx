import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Web3Provider } from './providers/Web3Provider';
import { FirebaseProvider } from './providers/FirebaseProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3Provider>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </Web3Provider>
  </StrictMode>
);