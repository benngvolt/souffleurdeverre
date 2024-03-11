import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from './utils/Context';
import reportWebVitals from './reportWebVitals';
import Home from './pages/Home/Home';
import Compagnie from './pages/Compagnie/Compagnie';
import Actualite from './pages/Actualite/Actualite';
import Spectacles from './pages/Spectacles/Spectacles';
import OneSpectacle from './pages/OneSpectacle/OneSpectacle';
import Edit from './pages/Edit/Edit';
import Header from './components/Header/Header';
import { HashRouter as Router, Route, Routes } from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider>
      <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/compagnie" element={<Compagnie/>} />
          <Route path="/actualite" element={<Actualite/>} />
          <Route path="/spectacles" element={<Spectacles/>} />
          <Route path="/spectacles/:id" element={<OneSpectacle/>} />
          <Route path="/edit" element={<Edit/>} />
        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
