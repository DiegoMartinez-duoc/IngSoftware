import React, { useEffect, useState } from 'react';
import '../estilos/PanelDuena.css';

const API_BASE = "http://localhost:8000/hotel";
const MEDIA_BASE = "http://localhost:8000/media/";

const PanelDuena = ({ onLogout }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [clientesReserva, setClientesReserva] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [error, setError] = useState(null);
  const [showReservas, setShowReservas] = useState(false);
  const [showUsuarios, setShowUsuarios] = useState(false);
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios y empleados
  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_BASE}/usuarios/`);
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.clientes || []);
        setEmpleados(data.empleados || []);
        setClientesReserva(data.clientes || []);
      }
    } catch (err) {
      setError("Error de conexión con backend");
    }
  };

  // Cargar reservas confirmadas
  const fetchReservas = async () => {
    try {
      const res = await fetch(`${API_BASE}/reservas/confirmadas/`);
      const data = await res.json();
      if (data.success) {
        setReservas(data.reservas || []);
      }
    } catch (err) {
      setReservas([]);
    }
  };

  // Cargar habitaciones
  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        const res = await fetch(`${API_BASE}/listar_habitaciones/`);
        if (!res.ok) throw new Error("No se pudieron cargar las habitaciones");
        const data = await res.json();
        if (data.success) {
          setHabitaciones(data.habitaciones || []);
        } else {
          setHabitaciones([]);
        }
      } catch (err) {
        setHabitaciones([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHabitaciones();
    fetchUsuarios();
    fetchReservas();
  }, []);

  // Para la barra de disponibilidad
  const porcentajeDisponibles = () => {
    if (habitaciones.length === 0) return 0;
    const disponibles = habitaciones.filter((h) => h.disponible).length;
    return Math.round((disponibles / habitaciones.length) * 100);
  };

  return (
    <div className="panel-duena-container">
      <header className="panel-duena-header">
        <h1>Panel de Propietaria/o</h1>
        <p>Gestión global del sistema: usuarios, reservas y reportes</p>
        {error && <p className="error">{error}</p>}
      </header>

      {/* ================== VISTA DETALLE HABITACIÓN ================== */}
      {habitacionSeleccionada && (
        <div className="detalle-habitacion" style={{ marginTop: "20px" }}>
          <button
            onClick={() => setHabitacionSeleccionada(null)}
            style={{ marginBottom: "15px", background: "#732d91", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px" }}
          >
            ← Volver
          </button>
          <div className="detalle-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
            {/* IZQUIERDA */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "16px" }}>
              <h3 style={{ color: "#732d91" }}>{habitacionSeleccionada.nombre || "Título de la habitación"}</h3>
              <img
                src={
                  habitacionSeleccionada.id
                    ? `http://localhost:8000/media/habitaciones/${habitacionSeleccionada.id}.jpg`
                    : "/img/habitacion-default.jpg"
                }
                alt={habitacionSeleccionada.nombre || "Habitación predeterminada"}
                style={{ width: "100%", borderRadius: "10px", marginBottom: "10px" }}
              />
              <ul style={{ color: "#732d91", lineHeight: "1.6" }}>
                <li><strong>Tipo:</strong> {habitacionSeleccionada.tipo || "Tipo no definido"}</li>
                <li><strong>Camas:</strong> {habitacionSeleccionada.camas || "No especificado"}</li>
                <li><strong>TV:</strong> {habitacionSeleccionada.tv || "No especificado"}</li>
                <li><strong>Baño:</strong> {habitacionSeleccionada.bano || "No especificado"}</li>
                <li><strong>Superficie:</strong> {habitacionSeleccionada.superficie || "No especificado"}</li>
                <li><strong>Vista:</strong> {habitacionSeleccionada.vista || "No especificado"}</li>
                <li><strong>Capacidad:</strong> {habitacionSeleccionada.capacidad || "No especificado"}</li>
                <li><strong>Precio:</strong> {habitacionSeleccionada.precio ? `$${habitacionSeleccionada.precio}` : "No especificado"}</li>
              </ul>
            </div>
            {/* DERECHA: Formulario modificar */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "16px" }}>
              <h3 style={{ color: "#732d91" }}>Modificar datos</h3>
              <form>
                <textarea placeholder="Descripción" defaultValue={habitacionSeleccionada.descripcion || ""} style={{ width: "100%", minHeight: "120px", marginBottom: "10px" }} />
                <input type="number" placeholder="Precio" defaultValue={habitacionSeleccionada.precio || ""} style={{ width: "100%", marginBottom: "10px" }} />
                <input type="number" placeholder="Capacidad" defaultValue={habitacionSeleccionada.capacidad || ""} style={{ width: "100%", marginBottom: "10px" }} />
                <input type="file" style={{ marginBottom: "10px" }} />
                <button type="submit" style={{ background: "#4CAF50", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  Modificar
                </button>
              </form>
            </div>
          </div>
          {/* MITAD INFERIOR */}
          <div className="detalle-inferior" style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr", gap: "20px" }}>
            {/* IZQUIERDA: Calificación + comentarios */}
            <div style={{ background: "#fff", padding: "16px", borderRadius: "12px" }}>
              <h4 style={{ color: "#732d91" }}>Calificación ⭐⭐⭐⭐☆</h4>
              <h4 style={{ marginTop: "15px", color: "#732d91" }}>Comentarios</h4>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ marginBottom: "10px", color: "#732d91" }}>
                  👤 Usuario {i} - Comentario de ejemplo sobre la habitación.
                </div>
              ))}
            </div>
            {/* CENTRO: Calendario */}
            <div style={{ background: "#fff", padding: "16px", borderRadius: "12px" }}>
              <h4 style={{ color: "#732d91" }}>Fechas de reservas</h4>
              <div className="calendario" style={{ background: "#f3e5f5", borderRadius: "8px", padding: "12px", marginTop: "10px" }}>
                <p style={{ color: "#732d91" }}>Calendario funcional pendiente de implementación</p>
              </div>
            </div>
            {/* DERECHA: Datos estadísticos */}
            <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", color: "#732d91" }}>
              <h4 style={{ color: "#732d91" }}>Datos</h4>
              <p>Reservas totales: <strong>0</strong></p>
              <p>Reservas en el mes: <strong>0</strong></p>
              <p>Reservas en el año: <strong>0</strong></p>
              <p>Reservas actuales: <strong>0</strong></p>
            </div>
          <button onClick={() => setHabitacionSeleccionada(false)} style={{ background: "#732d91", color: "#fff", borderRadius: "6px", border: "none", padding: "8px 18px", marginRight: "10px" }}>Atrás</button>
            <button onClick={onLogout} style={{ background: "#fff", color: "#732d91", border: "2px solid #732d91", borderRadius: "6px", padding: "8px 18px" }}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* ================== VISTA PRINCIPAL ================== */}
      {!showReservas && !showUsuarios && !habitacionSeleccionada && (
        <div className="panel-duena-grid" style={{
          display: "flex",
          flexDirection: "row",
          gap: "24px",
          justifyContent: "center",
          alignItems: "stretch",
          marginTop: "32px"
        }}>
          <div className="panel-duena-card">
            <h2>Gestión de Usuarios</h2>
            <p>Total usuarios: {usuarios.length}</p>
            <button
              className="panel-duena-button primary"
              onClick={() => setShowUsuarios(true)}
            >
              Ver Usuarios
            </button>
          </div>

          <div className="panel-duena-card">
            <h2>Reservas Confirmadas</h2>
            <p>Total reservas: {reservas.length}</p>
            <button
              className="panel-duena-button primary"
              onClick={() => setShowReservas(true)}
            >
              Ver Reservas
            </button>
          </div>

          <div className="panel-duena-card">
            <h2>Reportes</h2>
            <p>Último reporte: {reportes.length > 0 ? JSON.stringify(reportes[0]) : 'No disponible'}</p>
            <button
              className="panel-duena-button primary"
              onClick={() => alert('Ir a reportes')}
            >
              Generar Reporte
            </button>
          </div>

          <div className="panel-duena-card">
            <h2>Sesión</h2>
            <p>Finaliza tu sesión de administración.</p>
            <button
              className="panel-duena-button secondary"
              onClick={onLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* ================== VISTA USUARIOS ================== */}
      {showUsuarios && !habitacionSeleccionada && (
        <div className="usuarios-dashboard" style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr", gap: "20px", marginTop: "20px", color: "#732d91"  }}>
          {/* IZQUIERDA */}
          <div style={{ background: "#fff", padding: "16px", borderRadius: "12px" }}>
            <h3>Clientes</h3>
            <div className="usuarios-grid">
              {usuarios.length === 0 ? (
                <div className="usuario-card">
                  <div className="usuario-info">
                    <strong>Nombre</strong>
                    <br />correo@correo.com<br />000000000<br />Rol: cliente
                  </div>
                </div>
              ) : (
                usuarios.map((u) => (
                  <div className="usuario-card" key={u.id}>
                    <div className="usuario-info">
                      <strong>{u.nombre}</strong>
                      <br />{u.email}<br />{u.telefono}<br />Rol: {u.rol}
                    </div>
                  </div>
                ))
              )}
            </div>
            <h3>Empleados</h3>
            <div className="usuarios-grid">
              {empleados.length === 0 ? (
                <div className="usuario-card">
                  <div className="usuario-info">
                    <strong>Nombre</strong>
                    <br />correo@correo.com<br />000000000<br />Rol: empleado
                  </div>
                </div>
              ) : (
                empleados.map((u) => (
                  <div className="usuario-card" key={u.id}>
                    <div className="usuario-info">
                      <strong>{u.nombre}</strong>
                      <br />{u.email}<br />{u.telefono}<br />Rol: {u.rol}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* CENTRO */}
          <div style={{ background: "#fff", padding: "16px", borderRadius: "12px" }}>
            <h3>Clientes con reserva</h3>
            <div className="usuarios-grid">
              {clientesReserva.length === 0 ? (
                <div className="usuario-card">
                  <div className="usuario-info">
                    <strong>Nombre</strong>
                    <br />correo@correo.com<br />000000000<br />Rol: cliente
                  </div>
                </div>
              ) : (
                clientesReserva.map((u) => (
                  <div className="usuario-card" key={u.id}>
                    <div className="usuario-info">
                      <strong>{u.nombre}</strong>
                      <br />{u.email}<br />{u.telefono}<br />Rol: {u.rol}
                    </div>
                  </div>
                ))
              )}
            </div>
            <h3>Clientes más inactivos</h3>
            <div className="usuarios-grid">
              {clientesReserva.length === 0 ? (
                <div className="usuario-card">
                  <div className="usuario-info">
                    <strong>Nombre</strong>
                    <br />correo@correo.com<br />000000000<br />Rol: cliente
                  </div>
                </div>
              ) : (
                clientesReserva.map((u) => (
                  <div className="usuario-card" key={u.id}>
                    <div className="usuario-info">
                      <strong>{u.nombre}</strong>
                      <br />{u.email}<br />{u.telefono}<br />Rol: {u.rol}
                    </div>
                  </div>
                ))
              )}
            </div>
            <h3>Empleados más inactivos</h3>
            <div className="usuarios-grid">
              {empleados.length === 0 ? (
                <div className="usuario-card">
                  <div className="usuario-info">
                    <strong>Nombre</strong>
                    <br />correo@correo.com<br />000000000<br />Rol: empleado
                  </div>
                </div>
              ) : (
                empleados.slice(0, 1).map((u) => (
                  <div className="usuario-card" key={u.id}>
                    <div className="usuario-info">
                      <strong>{u.nombre}</strong>
                      <br />{u.email}<br />{u.telefono}<br />Rol: {u.rol}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* DERECHA */}
          <div style={{ background: "#fff", padding: "16px", borderRadius: "12px" }}>
            <h4>Habitaciones más reservadas del mes</h4>
            {habitaciones.length === 0 ? (
              <div>🛏 Título de la habitación - 0 reservas</div>
            ) : (
              habitaciones.map((h) => {
                const total = reservas.filter(r => r.habitacion === h.nombre).length;
                return (
                  <div key={h.id}>🛏 {h.nombre || "Título de la habitación"} - {total} reservas</div>
                );
              })
            )}
            <h4 style={{ marginTop: "20px" }}>Habitaciones menos reservadas del mes</h4>
            {habitaciones.length === 0 ? (
              <div>🛏 Título de la habitación - 0 reservas</div>
            ) : (
              habitaciones
                .map((h) => {
                  const total = reservas.filter(r => r.habitacion === h.nombre).length;
                  return { ...h, total };
                })
                .filter(h => h.total === 0)
                .map((h) => (
                  <div key={h.id}>🛏 {h.nombre || "Título de la habitación"} - 0 reservas</div>
                ))
            )}
          <button onClick={() => setShowUsuarios(false)} style={{ background: "#732d91", color: "#fff", borderRadius: "6px", border: "none", padding: "8px 18px", marginRight: "10px" }}>Atrás</button>
            <button onClick={onLogout} style={{ background: "#fff", color: "#732d91", border: "2px solid #732d91", borderRadius: "6px", padding: "8px 18px" }}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* ================== VISTA RESERVAS ================== */}
      {showReservas && !habitacionSeleccionada && (
        <div className="ver-reservas-grid">
          {/* IZQUIERDA */}
          <div className="ver-reservas-izquierda" style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 6px #e1bee7", padding: "24px", marginRight: "18px" }}>
            <h3 style={{ color: "#732d91" }}>Habitaciones reservadas este mes</h3>
            <ul className="historial-reservas">
              {reservas.length === 0 ? (
                <li className="reserva-item" style={{ color: "#732d91" }}>
                  <img
                    src="/img/habitacion-default.jpg"
                    alt="Habitación predeterminada"
                    className="miniatura-habitacion"
                    style={{ width: "64px", height: "48px", objectFit: "cover", marginRight: "10px", borderRadius: "8px", border: "2px solid #732d91" }}
                  />
                  <div>
                    <strong>$ Pago de reserva</strong> <br />
                    Fecha de reserva <br />
                    Persona que reservó - Servicios pagados
                  </div>
                </li>
              ) : (
                reservas.map((r) => (
                  <li key={r.id} className="reserva-item" style={{ color: "#732d91" }}>
                    <img
                      src={r.imagen ? `${MEDIA_BASE}${r.imagen}` : "/img/habitacion-default.jpg"}
                      alt={r.habitacion}
                      className="miniatura-habitacion"
                      style={{ width: "64px", height: "48px", objectFit: "cover", marginRight: "10px", borderRadius: "8px", border: "2px solid #732d91" }}
                    />
                    <div>
                      <strong>{r.habitacion || "Título de la habitación"}</strong> <br />
                      Cliente: {r.cliente || "Nombre del cliente"} <br />
                      Hab: {r.habitacion_tipo || "Tipo de habitación"} - Estado: {r.estado || "Estado"}
                    </div>
                  </li>
                ))
              )}
            </ul>

            <h4 style={{ color: "#732d91" }}>Catálogo de habitaciones</h4>
            <ul>
              {habitaciones.length === 0 ? (
                <li style={{ display: "flex", alignItems: "center", gap: "12px", color: "#732d91" }}>
                  <img
                    src="/img/habitacion-icono.png"
                    alt="Icono de habitación"
                    style={{ width: "32px", height: "32px", border: "2px solid #732d91", borderRadius: "8px" }}
                  />
                  <span>
                    <strong>Precio</strong> - Título de la habitación
                  </span>
                  <button
                    style={{ marginLeft: "8px", background: "#732d91", color: "#fff", borderRadius: "6px", border: "none", padding: "4px 12px" }}
                    onClick={() => setHabitacionSeleccionada({})}
                  >
                    Ver
                  </button>
                </li>
              ) : (
                habitaciones.map((h) => (
                  <li key={h.id} style={{ color: "#732d91" }}>
                    🛏 {h.precio ? `$${h.precio}` : "Precio"} - {h.nombre || "Título de la habitación"}
                    <button 
                      style={{ marginLeft: "8px", background: "#732d91", color: "#fff", borderRadius: "6px", border: "none", padding: "4px 12px" }}
                      onClick={() => setHabitacionSeleccionada(h)}
                    >
                      Ver
                    </button>
                  </li>
                ))
              )}
            </ul>

            <h4 style={{ color: "#732d91" }}>Disponibilidad de habitaciones</h4>
            <div className="barra-disponibilidad" style={{
              width: "100%",
              background: "#e1bee7",
              borderRadius: "10px",
              height: "20px",
              marginTop: "10px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${porcentajeDisponibles()}%`,
                height: "100%",
                background: "#732d91",
                textAlign: "center",
                color: "#fff",
                fontWeight: "bold",
                lineHeight: "20px"
              }}>
                {porcentajeDisponibles()}%
              </div>
            </div>
            
          </div>

          {/* DERECHA */}
          <div className="ver-reservas-derecha" style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 6px #e1bee7", padding: "24px" }}>
            <h3 style={{ color: "#732d91" }}>Calendario de reservas</h3>
            <div className="calendario" style={{ background: "#f3e5f5", borderRadius: "8px", padding: "12px", marginBottom: "18px" }}>
              <p style={{ color: "#732d91" }}>Calendario funcional pendiente de implementación</p>
            </div>

            <h4 style={{ color: "#732d91" }}>Habitaciones más reservadas del mes</h4>
            <ul className="mas-reservadas">
              {habitaciones.length === 0 ? (
                <li style={{ color: "#732d91" }}>
                  🛏 Título de la habitación - 0 reservas
                </li>
              ) : (
                habitaciones.map((h) => {
                  const total = reservas.filter(r => r.habitacion === h.nombre).length;
                  return (
                    <li key={h.id} style={{ color: "#732d91" }}>
                      🛏 {h.nombre || "Título de la habitación"} - {total} reservas
                    </li>
                  );
                })
              )}
            </ul>
            {/* Panel: Habitaciones menos reservadas del mes */}
            <h4 style={{ color: "#732d91" }}>Habitaciones menos reservadas del mes</h4>
            <ul className="menos-reservadas">
              {habitaciones.length === 0 ? (
                <li style={{ color: "#732d91" }}>
                  🛏 Título de la habitación - 0 reservas
                </li>
              ) : (
                habitaciones
                  .map((h) => {
                    const total = reservas.filter(r => r.habitacion === h.nombre).length;
                    return { ...h, total };
                  })
                  .filter(h => h.total === 0)
                  .map((h) => (
                    <li key={h.id} style={{ color: "#732d91" }}>
                      🛏 {h.nombre || "Título de la habitación"} - 0 reservas
                    </li>
                  ))
              )}
            </ul>

            <button onClick={() => setShowReservas(false)} style={{ background: "#732d91", color: "#fff", borderRadius: "6px", border: "none", padding: "8px 18px", marginRight: "10px" }}>Atrás</button>
            <button onClick={onLogout} style={{ background: "#fff", color: "#732d91", border: "2px solid #732d91", borderRadius: "6px", padding: "8px 18px" }}>Cerrar sesión</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelDuena;
