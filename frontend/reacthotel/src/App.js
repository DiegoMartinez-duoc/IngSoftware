import React, { useState } from "react";
import logo1 from './img/logo1.svg';


import Login from "./componentes/Login";
import Registro from "./componentes/Registro";

import InicioCliente from "./componentes/InicioCliente";
import ReservasCliente from "./componentes/reservasCliente";

import PanelDuena from "./componentes/PanelDuena";

import ReservasEmpleado from "./componentes/reservasEmpleado"; 
import CatalogoEmpleado from "./componentes/catalogoEmpleado";

import AdminPanel from "./componentes/AdminPanel";
import AdminReservas from "./componentes/Admin.Reservas";
import AdminUsuarios from "./componentes/AdminUsuarios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState("login");

  const handleViewChange = (view) => setCurrentView(view);
  const handleLogout = () => setCurrentView("login");

  return (
    <div className="app-container">
      <header className="barra-superior">
      <div
  className="nav-options"
  style={{ display: currentView === "inicioCliente" || currentView === "reservasCliente" ? "flex" : "none" }}
>
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

  

  {/* el margen auto empuja este botón al extremo derecho */}
  <button className="boton-logout" onClick={handleLogout}>
    Cerrar sesión
  </button>
</div>

        <div className="nav-options" style={{ display: currentView == "adminPanel" 
                                                       || currentView == "adminReservas" 
                                                       || currentView == "adminUsuarios" 
                                                       ? "flex" : "none" }}>
          <div 
            className={`nav-option ${currentView === "adminPanel" ? "active" : ""}`} 
            onClick={() => setCurrentView("adminPanel")}
            title="Reportes"
          >
            <span>Reportes</span>
          </div>

          <div 
            className={`nav-option ${currentView === "adminReservas" ? "active" : ""}`} 
            onClick={() => setCurrentView("adminReservas")}
            title="Reservas"
          >
            <span>Reservas</span>
          </div>

          <div 
            className={`nav-option ${currentView === "adminUsuarios" ? "active" : ""}`} 
            onClick={() => setCurrentView("adminUsuarios")}
            title="Usuarios"
          >
            <span>Usuarios</span>
          </div>

          <button className="boton-logout" onClick={() => {handleLogout()}}>
              Cerrar sesión
          </button>
        
        </div>

        <div className="nav-options" style={{ display: currentView == "inicioEmpleado" || currentView == "catalogoEmpleado" ? "flex" : "none" }}>
          <div 
            className={`nav-option ${currentView === "inicioEmpleado" ? "active" : ""}`} 
            onClick={() => setCurrentView("inicioEmpleado")}
            title="Reservas"
          >
            <span>Reservas</span>
          </div>
          <div 
            className={`nav-option ${currentView === "catalogoEmpleado" ? "active" : ""}`} 
            onClick={() => setCurrentView("catalogoEmpleado")}
            title="Reservar"
          >
            <span>Reservar</span>
          </div>
          <button className="boton-logout" onClick={() => {handleLogout()}}>
              Cerrar sesión
          </button>
        </div>

        {/* <div className="nav-options" style={{ display: currentView == "inicioDuena" 
                                        || currentView == "reservasDuena" || currentView == "reportesDuena" ? "flex" : "none" }}>
          <div 
            className={`nav-option ${currentView === "inicioDuena" ? "active" : ""}`} 
            onClick={() => setCurrentView("inicioDuena")}
            title="Usuarios"
          >
            <span>Usuarios</span>
          </div>
          <div 
            className={`nav-option ${currentView === "reservasDuena" ? "active" : ""}`} 
            onClick={() => setCurrentView("reservasDuena")}
            title="Reservas"
          >
            <span>Reservas</span>
          </div>
          <div 
            className={`nav-option ${currentView === "reportesDuena" ? "active" : ""}`} 
            onClick={() => setCurrentView("reportesDuena")}
            title="Reportes"
          >
            <span>Reportes</span>
          </div>
          <button className="boton-logout" onClick={() => {handleLogout()}}>
              Cerrar sesión
          </button>
        </div> */}
        
        <div className="logo-container">
          <h2 id="logo-central">
            <span className="logo">Hotel Pacific Reef</span>
          </h2>
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
            {currentView === "adminPanel" && <AdminPanel onViewChange={handleViewChange} />}
            {currentView === "adminReservas" && <AdminReservas onViewChange={handleViewChange} />}
            {currentView === "adminUsuarios" && <AdminUsuarios onViewChange={handleViewChange} onLogout={handleLogout} />}
            {currentView === "inicioDuena" && <PanelDuena onViewChange={handleViewChange} onLogout={handleLogout} />}
            {currentView === "inicioEmpleado" && <ReservasEmpleado onViewChange={handleViewChange} onLogout={handleLogout} />} 
            {currentView === "catalogoEmpleado" && <CatalogoEmpleado onViewChange={handleViewChange} onLogout={handleLogout} />} 
        
          </div>
        </main>
    </div>
  );
}

export default App;