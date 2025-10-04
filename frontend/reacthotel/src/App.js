import React, { useState } from "react";
import logo1 from './img/logo1.svg';
import Login from "./componentes/Login";
import Registro from "./componentes/Registro";
import InicioCliente from "./componentes/InicioCliente";
import ReservasCliente from "./componentes/reservasCliente";
import PanelDuena from "./componentes/PanelDuena";
import ReservasEmpleado from "./componentes/reservasEmpleado"; 
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState("login");

  const handleViewChange = (view) => setCurrentView(view);
  const handleLogout = () => setCurrentView("login");

  return (
    <div className="app-container">
      <header className="barra-superior">
        <div className="logo-container">
          <img src={logo1} alt="Hotel Pacific Reef" className="logo-img" />
        </div>

        {/* Menú solo visible para clientes */}
        <div className="nav-options" style={{ display: currentView === "inicioCliente" || currentView === "reservasCliente" ? "flex" : "none" }}>
          <div 
            className={`nav-option ${currentView === "inicioCliente" ? "active" : ""}`} 
            onClick={() => setCurrentView("inicioCliente")}
            title="Habitaciones"
          >
            <span>Habitaciones</span>
          </div>
          <div 
            className={`nav-option ${currentView === "reservasCliente" ? "active" : ""}`} 
            onClick={() => setCurrentView("reservasCliente")}
            title="Reservas"
          >
            <span>Reservas</span>
          </div>
          <div className="centro-nav">
            <input type="text" placeholder="Buscar" className="buscador" required/>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="view-container">
          {currentView === "login" && <Login onViewChange={handleViewChange} />}
          {currentView === "registro" && <Registro onViewChange={handleViewChange} />}
          {currentView === "inicioCliente" && <InicioCliente onViewChange={handleViewChange} />}
          {currentView === "reservasCliente" && <ReservasCliente onViewChange={handleViewChange} />}
          {currentView === "inicioDuena" && <PanelDuena onLogout={handleLogout} />}
          {currentView === "inicioEmpleado" && <ReservasEmpleado onLogout={handleLogout} />} {/* 👈 corregido */}
        </div>
      </main>
    </div>
  );
}

export default App;
