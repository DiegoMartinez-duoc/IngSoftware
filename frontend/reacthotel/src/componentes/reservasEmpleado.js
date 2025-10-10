import React, { useState, useEffect } from "react";
import "../estilos/Empleado.css";

const API_BASE = "http://localhost:8000/hotel";
const MEDIA_BASE = "http://localhost:8000/media/";

const ReservasEmpleado = ({ onLogout }) => {
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [formData, setFormData] = useState({
    fechaInicio: "",
    fechaFin: "",
    habitacion: "",
    clienteNombre: "",
    clienteEmail: "",
    metodoPago: "tarjeta",
    clienteTelefono: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar habitaciones desde la API (como InicioCliente)
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
  }, []);

  // Consultar reservas (puedes adaptar esto a tu backend real)
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const res = await fetch(`${API_BASE}/reservas_empleado/`);
        if (!res.ok) throw new Error("No se pudieron cargar las reservas");
        const data = await res.json();
        setReservas(data.reservas || []);
      } catch {
        setReservas([]);
      }
    };
    fetchReservas();
  }, []);

  // Calcular porcentaje de habitaciones disponibles
  const porcentajeDisponibles = () => {
    if (habitaciones.length === 0) return 0;
    const disponibles = habitaciones.filter((h) => h.disponible).length;
    return Math.round((disponibles / habitaciones.length) * 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReservarCliente = async () => {
    if (!formData.clienteEmail || !formData.clienteNombre || !formData.habitacion) {
      setError("Complete todos los campos antes de reservar");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/reservar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.clienteEmail,
          nombre: formData.clienteNombre,
          telefono: formData.clienteTelefono,
          habitacion: formData.habitacion,
          metodoPago: formData.metodoPago,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Reserva creada con éxito. Código QR: ${data.codigoQR}`);
        setError("");
      } else {
        setError(data.error || "Error al crear reserva");
        setSuccessMessage("");
      }
    } catch (err) {
      setError("Error de conexión con backend");
      setSuccessMessage("");
    }
  };

  // Render
  return (
    <div className="empleado-container">
      <div className="reserva-wrapper">
        {/* IZQUIERDA */}
        <div className="ver-reservas-grid">
          <div className="ver-reservas-izquierda">
            <h3>Habitaciones reservadas este mes</h3>
            <ul className="historial-reservas">
              {loading ? (
                <li className="reserva-item">
                  <img
                    src="/img/habitacion-default.jpg"
                    alt="Habitación predeterminada"
                    className="miniatura-habitacion"
                    style={{ width: "64px", height: "48px", objectFit: "cover", marginRight: "10px" }}
                  />
                  <div>
                    <strong>Título de la habitación</strong> <br />
                    Cliente: Nombre del cliente <br />
                    Hab: Tipo de habitación - Estado: Estado
                  </div>
                </li>
              ) : reservas.length === 0 ? (
                <li className="reserva-item">
                  <img
                    src="/img/habitacion-default.jpg"
                    alt="Habitación predeterminada"
                    className="miniatura-habitacion"
                    style={{ width: "64px", height: "48px", objectFit: "cover", marginRight: "10px" }}
                  />
                  <div>
                    <strong>Título de la habitación</strong> <br />
                    Cliente: Nombre del cliente <br />
                    Hab: Tipo de habitación - Estado: Estado
                  </div>
                </li>
              ) : (
                reservas.map((r) => (
                  <li key={r.id} className="reserva-item">
                    <img
                      src={r.imagen ? `${MEDIA_BASE}${r.imagen}` : "/img/habitacion-default.jpg"}
                      alt={r.habitacion}
                      className="miniatura-habitacion"
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

            <h4>Catálogo de habitaciones</h4>
            <ul>
              {loading ? (
                <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src="/img/habitacion-icono.png"
                    alt="Icono de habitación"
                    style={{ width: "32px", height: "32px" }}
                  />
                  <span>
                    <strong>Precio</strong> - Título de la habitación
                  </span>
                  <button style={{ marginLeft: "8px" }} disabled>Ver</button>
                </li>
              ) : habitaciones.length === 0 ? (
                <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src="/img/habitacion-icono.png"
                    alt="Icono de habitación"
                    style={{ width: "32px", height: "32px" }}
                  />
                  <span>
                    <strong>Precio</strong> - Título de la habitación
                  </span>
                  <button style={{ marginLeft: "8px" }} disabled>Ver</button>
                </li>
              ) : (
                habitaciones.map((h) => (
                  <li key={h.id}>
                    <img
                      src={h.imagen ? `${MEDIA_BASE}${h.imagen}` : "/img/habitacion-default.jpg"}
                      alt={h.nombre}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginRight: "10px",
                      }}
                    />
                    {h.precio ? `$${h.precio}` : "Precio"} - {h.nombre || "Título de la habitación"}
                    <button style={{ marginLeft: "10px" }} onClick={() => setHabitacionSeleccionada(h)}>Ver</button>
                  </li>
                ))
              )}
            </ul>

            <h4>Disponibilidad de habitaciones</h4>
            <div className="barra-disponibilidad" style={{
              width: "100%",
              background: "#ddd",
              borderRadius: "10px",
              height: "20px",
              marginTop: "10px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${porcentajeDisponibles()}%`,
                height: "100%",
                background: "#4caf50",
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
          <div className="ver-reservas-derecha">
            <h3>Calendario de reservas</h3>
            <div className="calendario">
              <p>Calendario funcional pendiente de implementación</p>
            </div>

            <h4>Habitaciones más reservadas del mes</h4>
            <ul className="mas-reservadas">
              {loading ? (
                <li>
                  🛏 Título de la habitación - 0 reservas
                </li>
              ) : habitaciones.length === 0 ? (
                <li>
                  🛏 Título de la habitación - 0 reservas
                </li>
              ) : (
                habitaciones.map((h) => {
                  const total = reservas.filter(r => r.habitacion === h.nombre).length;
                  return (
                    <li key={h.id}>
                      🛏 {h.nombre || "Título de la habitación"} - {total} reservas
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        {/* ===== HABITACIONES RECOMENDADAS PARA CLIENTES ===== */}
        <div className="habitaciones-recomendadas" style={{ marginTop: "32px" }}>
          <h3>Habitaciones recomendadas para clientes</h3>
          <div className="habitaciones-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px"
          }}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="habitacion-card" style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "10px" }}>
                  <img
                    src="/img/habitacion-default.jpg"
                    alt="Habitación predeterminada"
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                  />
                  <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <p>🛏 Precio</p>
                    <small>Título de la habitación</small>
                    <br />
                    <button style={{ marginTop: "10px" }} disabled>Ver</button>
                  </div>
                </div>
              ))
            ) : habitaciones.length === 0 ? (
              <div className="habitacion-card" style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "10px" }}>
                <img
                  src="/img/habitacion-default.jpg"
                  alt="Habitación predeterminada"
                  style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                />
                <div style={{ marginTop: "10px", textAlign: "center" }}>
                  <p>🛏 Precio</p>
                  <small>Título de la habitación</small>
                  <br />
                  <button style={{ marginTop: "10px" }} disabled>Ver</button>
                </div>
              </div>
            ) : (
              habitaciones.slice(0, 3).map((h) => (
                <div key={h.id} className="habitacion-card" style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "10px" }}>
                  <img
                    src={h.imagen ? `${MEDIA_BASE}${h.imagen}` : "/img/habitacion-default.jpg"}
                    alt={h.nombre}
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                  />
                  <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <p>🛏 {h.precio ? `$${h.precio}` : "Precio"}</p>
                    <small>{h.nombre || "Título de la habitación"}</small>
                    <br />
                    <button
                      style={{ marginTop: "10px" }}
                      onClick={() => setHabitacionSeleccionada(h)}
                    >Ver</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ===== VISTA DETALLE HABITACIÓN ===== */}
        {habitacionSeleccionada && (
          <div className="detalle-habitacion">
            <button
              onClick={() => setHabitacionSeleccionada(null)}
              style={{ marginBottom: "15px" }}
            >
              ← Volver
            </button>
            <div className="detalle-grid">
              {/* IZQUIERDA */}
              <div className="detalle-izquierda">
                <h3>{habitacionSeleccionada.nombre || "Título de la habitación"}</h3>
                <img
                  src={
                    habitacionSeleccionada.imagen
                      ? `${MEDIA_BASE}${habitacionSeleccionada.imagen}`
                      : "/img/habitacion-default.jpg"
                  }
                  alt={habitacionSeleccionada.nombre || "Habitación predeterminada"}
                  style={{ width: "180px", borderRadius: "10px", marginBottom: "10px" }}
                />
                <p>
                  {habitacionSeleccionada.descripcion ||
                    "Descripción de la habitación. Aquí se mostrará información relevante sobre la habitación seleccionada, aunque no haya datos disponibles aún."}
                </p>
                {/* Mostrar datos de reserva si existen */}
                {(() => {
                  // Buscar la reserva asociada a la habitación seleccionada
                  const reserva = reservas.find(
                    (r) =>
                      r.habitacion === habitacionSeleccionada.nombre ||
                      r.habitacion_id === habitacionSeleccionada.id
                  );
                  if (!reserva) {
                    return (
                      <div style={{ marginTop: "10px", color: "#888" }}>
                        <div><strong>Cliente:</strong> Nombre del cliente</div>
                        <div><strong>Estado:</strong> Estado</div>
                        <div><strong>Tipo:</strong> Tipo de habitación</div>
                      </div>
                    );
                  }
                  return (
                    <div style={{ marginTop: "10px", color: "#444" }}>
                      <div><strong>Cliente:</strong> {reserva.cliente || "Nombre del cliente"}</div>
                      <div><strong>Estado:</strong> {reserva.estado || "Estado"}</div>
                      <div><strong>Tipo:</strong> {reserva.habitacion_tipo || "Tipo de habitación"}</div>
                      <div><strong>Fecha inicio:</strong> {reserva.fecha_inicio || "No especificado"}</div>
                      <div><strong>Fecha fin:</strong> {reserva.fecha_fin || "No especificado"}</div>
                    </div>
                  );
                })()}
              </div>

              {/* CENTRO */}
              <div className="reserva-formulario">
                <h3 style={{ color: "black" }}>Reservar para cliente</h3>
                <select
                  name="habitacion"
                  value={formData.habitacion}
                  onChange={handleChange}
                >
                  <option value="">--Seleccione--</option>
                  {habitaciones.map((h) => (
                    <option key={h.id} value={h.nombre}>
                      {h.nombre} (${h.precio})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="clienteNombre"
                  placeholder="Nombre cliente"
                  value={formData.clienteNombre}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="clienteEmail"
                  placeholder="Correo cliente"
                  value={formData.clienteEmail}
                  onChange={handleChange}
                />
                <input
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                />
                <input
                  type="date"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleChange}
                />
                <select
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleChange}
                >
                  <option value="tarjeta">Tarjeta</option>
                  <option value="paypal">PayPal</option>
                </select>
                <input
                  type="tel"
                  name="clienteTelefono"
                  placeholder="Teléfono cliente"
                  value={formData.clienteTelefono}
                  onChange={handleChange}
                />
                <button onClick={handleReservarCliente}>Reservar</button>

                {successMessage && <p className="success">{successMessage}</p>}
                {error && <p className="error">{error}</p>}
              </div>

              {/* DERECHA */}
              <div className="detalle-derecha">
                <h4>Habitaciones destacadas</h4>
                <div className="carrusel">
                  {loading ? (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src="/img/habitacion-default.jpg"
                        alt="Habitación predeterminada"
                        style={{ width: "80px", height: "80px", objectFit: "cover", display: "block", margin: "0 auto" }}
                      />
                      <div style={{ marginTop: "5px" }}>
                        <strong>Precio de la habitación</strong>
                        <br />
                        <span>Título de la habitación</span>
                      </div>
                    </div>
                  ) : habitaciones.length === 0 ? (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src="/img/habitacion-default.jpg"
                        alt="Habitación predeterminada"
                        style={{ width: "80px", height: "80px", objectFit: "cover", display: "block", margin: "0 auto" }}
                      />
                      <div style={{ marginTop: "5px" }}>
                        <strong>Precio de la habitación</strong>
                        <br />
                        <span>Título de la habitación</span>
                      </div>
                    </div>
                  ) : (
                    habitaciones.map((h) => (
                      <img
                        key={h.id}
                        src={h.imagen ? `${MEDIA_BASE}${h.imagen}` : "/img/habitacion-default.jpg"}
                        alt={h.nombre}
                        className="carrusel-img"
                        style={{ width: "80px", height: "80px", objectFit: "cover", display: "flex", margin: "0 auto" }}
                      />
                    ))
                  )}
                </div>
                <h4>Catálogo de habitaciones</h4>
                <ul>
                  {loading ? (
                    <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src="/img/habitacion-icono.png"
                        alt="Icono de habitación"
                        style={{ width: "32px", height: "32px" }}
                      />
                      <span>
                        <strong>Precio</strong> - Detalles de la habitación
                      </span>
                      <button onClick={() => setHabitacionSeleccionada({})}>Ver</button>
                    </li>
                  ) : habitaciones.length === 0 ? (
                    <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src="/img/habitacion-icono.png"
                        alt="Icono de habitación"
                        style={{ width: "32px", height: "32px" }}
                      />
                      <span>
                        <strong>Precio</strong> - Detalles de la habitación
                      </span>
                      <button onClick={() => setHabitacionSeleccionada({})}>Ver</button>
                    </li>
                  ) : (
                    habitaciones.map((h) => (
                      <li key={h.id}>
                        🛏 {h.precio ? `$${h.precio}` : "Precio"} - {h.nombre || "Título de la habitación"}
                        <button onClick={() => setHabitacionSeleccionada(h)}>Ver</button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservasEmpleado;
