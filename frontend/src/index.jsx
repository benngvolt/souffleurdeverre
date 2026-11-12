import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from './utils/Context';
import { USE_HOME_SPECIAL } from './utils/constants';
import Home from './pages/Home/Home';
import HomeSpecial from './pages/HomeSpecial/HomeSpecial';
import Compagnie from './pages/Compagnie/Compagnie';
import ActuSeason from './pages/ActuSeason/ActuSeason';
import Spectacles from './pages/Spectacles/Spectacles';
import Mediations from './pages/Mediations/Mediations';
import OneSpectacle from './pages/OneSpectacle/OneSpectacle';
import Login from './pages/Login/Login';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Loader from './components/Loader/Loader';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Backoffice admin uniquement : chargé à la demande pour alléger le bundle public.
const Edit = lazy(() => import('./pages/Edit/Edit'));

// Redirection des anciennes URLs en /#/ vers des URLs propres
if (window.location.hash.startsWith('#/')) {
  const cleanPath = window.location.hash.replace('#', '');
  window.history.replaceState(null, '', cleanPath);
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={USE_HOME_SPECIAL ? <HomeSpecial /> : <Home />} />
          <Route path="/compagnie" element={<Compagnie />} />
          <Route path="/actualite" element={<ActuSeason />} />
          <Route path="/spectacles" element={<Spectacles />} />
          <Route path="/mediations" element={<Mediations />} />
          <Route path="/spectacles/:slug" element={<OneSpectacle />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/edit"
            element={
              <Suspense fallback={<Loader loaderDisplay className="loader--opaque" />}>
                <Edit />
              </Suspense>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </Provider>
  </React.StrictMode>
);
