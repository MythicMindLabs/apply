import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiProvider } from './contexts/ApiContext';
import { WalletProvider } from './contexts/WalletContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import VoiceInterface from './components/VoiceInterface';
import TransactionHistory from './components/TransactionHistory';
import Settings from './pages/Settings';
import About from './pages/About';
import './App.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ApiProvider>
        <WalletProvider>
          <VoiceProvider>
            <Router>
              <div className="app">
                <Header />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<VoiceInterface />} />
                    <Route path="/history" element={<TransactionHistory />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/about" element={<About />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </VoiceProvider>
        </WalletProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
};

export default App;