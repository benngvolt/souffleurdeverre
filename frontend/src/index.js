import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from './utils/Context';
import reportWebVitals from './reportWebVitals';

import HomeSpecial from './pages/HomeSpecial/HomeSpecial';
import Compagnie from './pages/Compagnie/Compagnie';
import ActuSeason from './pages/ActuSeason/ActuSeason';
import Spectacles from './pages/Spectacles/Spectacles';
import Mediations from './pages/Mediations/Mediations';
import OneSpectacle from './pages/OneSpectacle/OneSpectacle';
import Edit from './pages/Edit/Edit';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import { HelmetProvider } from 'react-helmet-async';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Redirection des anciennes URLs en /#/ vers des URLs propres
if (window.location.hash.startsWith('#/')) {
  const cleanPath = window.location.hash.replace('#', '');
  window.history.replaceState(null, '', cleanPath);
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<HomeSpecial />} />
            <Route path="/compagnie" element={<Compagnie />} />
            <Route path="/actualite" element={<ActuSeason />} />
            <Route path="/spectacles" element={<Spectacles />} />
            <Route path="/mediations" element={<Mediations />} />
            <Route path="/spectacles/:slug" element={<OneSpectacle />} />
            <Route path="/edit" element={<Edit />} />
          </Routes>
          <Footer />
        </Router>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();