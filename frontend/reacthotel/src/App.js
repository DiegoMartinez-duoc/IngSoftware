import React, { useState } from "react";
import logo1 from './img/logo1.svg';
import Login from "./componentes/Login";
import InicioCliente from "./componentes/InicioCliente";
import ReservasCliente from "./componentes/reservasCliente";
import Registro from "./componentes/Registro";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState("login");

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="app-container">
      <header className="barra-superior">
        <div className="nav-options" style={{ display: currentView == "inicioCliente" || currentView == "reservasCliente" ? "flex" : "none" }}>
          <div 
            className={`nav-option ${currentView === "inicioCliente" ? "active" : ""}`} 
            onClick={() => setCurrentView("inicioCliente")}
            title="Indices en el tiempo"
          >
            <span>Habitaciones</span>
          </div>
          <div 
            className={`nav-option ${currentView === "reservasCliente" ? "active" : ""}`} 
            onClick={() => setCurrentView("reservasCliente")}
            title="Topografía y riesgo"
          >
            <span>Reservas</span>
          </div>
          <div class="centro-nav">
                <input type="text" placeholder="Buscar" class="buscador" required/>
            </div>
        </div>
        
       <div className="logo-container">
        <img src={logo1} alt="Hotel Pacific Reef" className="logo-img" />
      </div>
              
        <div className="right-nav">
        </div>
      </header>
      
       <main className="main-content">
          <div className="view-container">
            {currentView === "login" && <Login onViewChange={handleViewChange} />}
            {currentView === "registro" && <Registro onViewChange={handleViewChange} />}
            {currentView === "inicioCliente" && <InicioCliente onViewChange={handleViewChange} />}
            {currentView === "reservasCliente" && <ReservasCliente onViewChange={handleViewChange} />}
          </div>
        </main>
    </div>
  );
}

export default App;