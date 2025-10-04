import React, { useEffect, useState } from 'react';
import '../estilos/PanelDuena.css';

const PanelDuena = ({ onLogout }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [error, setError] = useState(null);
  const [showReservas, setShowReservas] = useState(false);
  const [showUsuarios, setShowUsuarios] = useState(false);
  const [habitaciones, setHabitaciones] = useState([]);
  // Nueva: para mostrar detalle de habitación
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);

  // Para la barra de disponibilidad
  const porcentajeDisponibles = () => {
    if (habitaciones.length === 0) return 0;
    const disponibles = habitaciones.filter((h) => h.disponible).length;
    return Math.round((disponibles / habitaciones.length) * 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUsuarios = await fetch('http://localhost:8000/usuarios/');
        const dataUsuarios = await resUsuarios.json();
        setUsuarios(dataUsuarios.usuarios || []);

        const resReservas = await fetch('http://localhost:8000/duena/reservas/');
        const dataReservas = await resReservas.json();
        setReservas(dataReservas.reservas || []);

        const resHabitaciones = await fetch('http://localhost:8000/hotel/habitaciones/');
        const dataHabitaciones = await resHabitaciones.json();
        setHabitaciones(dataHabitaciones.habitaciones || []);

        const resReportes = await fetch('http://localhost:8000/duena/reportes/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'ventas', inicio: '2025-01-01', fin: '2025-12-31' })
        });
        const dataReportes = await resReportes.json();
        if (dataReportes.success) setReportes([dataReportes.reporte]);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="panel-duena-container">
      <div className="duena-wrapper">
      <header className="panel-duena-header">
        <h1>Panel de Propietaria/o</h1>
        <p>Gestión global del sistema: usuarios, reservas y reportes</p>
        {/* {error && <p className="error">{error}</p>} */}
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
          </div>
        </div>
      )}

      {/* ================== VISTA PRINCIPAL ================== */}
      {!showReservas && !showUsuarios && !habitacionSeleccionada && (
        <div className="panel-duena-grid">
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
            <h3>Indicadores de gestión del mes</h3>
            <div className="chart-box">📈 Actividad de clientes</div>
            <div className="chart-box">📈 Actividad de empleados</div>
            <div className="chart-box">📈 Ingresos del mes</div>
          </div>
          {/* CENTRO */}
          <div style={{ background: "#fff", padding: "16px", borderRadius: "12px" }}>
            <h3>Calificación promedio del hotel ⭐⭐⭐⭐⭐</h3>
            <div className="comentarios">
              <h4>Comentarios recientes</h4>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="comentario-item">👤 Nombre - Comentario ejemplo</div>
              ))}
            </div>
            <h4>Estadísticas de Clientes</h4>
            <div className="estadisticas-clientes" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div><h5>Clientes con más reservas</h5> 👤 Nombre - correo</div>
              <div><h5>Clientes menos activos</h5> 👤 Nombre - correo</div>
              <div><h5>Empleados menos activos</h5> 👤 Nombre - correo</div>
            </div>
          </div>
          {/* DERECHA */}
          <div style={{ background: "#fff", padding: "16px", borderRadius: "12px" }}>
            <h4>Habitaciones más reservadas del mes</h4>
            {[1,2,3].map(i => (
              <div key={i}>🛏 Habitación {i} - {i*2} reservas</div>
            ))}
            <h4 style={{ marginTop: "20px" }}>Habitaciones menos reservadas del mes</h4>
            {[4,5,6].map(i => (
              <div key={i}>🛏 Habitación {i} - 0 reservas</div>
            ))}
          </div>
          <div style={{ gridColumn: "1 / span 3", marginTop: "20px" }}>
            <button onClick={() => setShowUsuarios(false)} style={{ background: "#732d91", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none" }}>Atrás</button>
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
                      src={`http://localhost:8000/media/habitaciones/${r.habitacion_id || r.id}.jpg`}
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
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PanelDuena;
