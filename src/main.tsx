import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import { LegalPage } from './components/LegalPage.tsx';
import { InfoPage } from './components/InfoPage.tsx';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/about" element={<InfoPage type="about" />} />
        <Route path="/blog" element={<InfoPage type="blog" />} />
        <Route path="/contact" element={<InfoPage type="contact" />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/disclaimer" element={<LegalPage type="disclaimer" />} />
      </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);

