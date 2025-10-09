import React, { useState, useEffect } from "react";
import "../estilos/Empleado.css";

const CatalogoEmpleado = ({ onLogout }) => {
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

 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --------------------------
  // Consultar habitaciones
  // --------------------------
  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        const res = await fetch("http://localhost:8000/hotel/habitaciones/");
        const data = await res.json();
        if (data.success) {
          setHabitaciones(data.habitaciones);
        } else {
          setError(data.error || "Error al cargar habitaciones");
        }
      } catch (err) {
        setError("Error de conexión con backend");
      }
    };
    fetchHabitaciones();
  }, []);


  // --------------------------
  // Reservar para un cliente
  // --------------------------
  const handleReservarCliente = async () => {
    if (!formData.clienteEmail || !formData.clienteNombre || !formData.habitacion) {
      setError("Complete todos los campos antes de reservar");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/hotel/reservar/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.clienteEmail,
          nombre: formData.clienteNombre,
          telefono: formData.clienteTelefono,
          habitacion: formData.habitacion,
          metodoPago: formData.pagarAhora ? formData.metodoPago : undefined, // ⬅️

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

  // --------------------------
  // Calcular porcentaje de habitaciones disponibles
  // --------------------------
  const porcentajeDisponibles = () => {
    if (habitaciones.length === 0) return 0;
    const disponibles = habitaciones.filter((h) => h.disponible).length;
    return Math.round((disponibles / habitaciones.length) * 100);
  };

  return (
    <div className="empleado-container">
      <div className="reserva-wrapper">
        {/* <h2 className="texto">Panel de Reservas (Empleado) - Paso {step}</h2> */}

        {!habitacionSeleccionada && (
          <div className="habitaciones-layout">
            {/* BLOQUE: Habitaciones recomendadas */}
            <div className="habitaciones-recomendadas">
              <h3>Habitaciones recomendadas para clientes</h3>
              <div className="habitaciones-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px"
              }}>
                {habitaciones.length === 0 ? (
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
                      <button
                        style={{ marginTop: "10px" }}
                        onClick={() => setHabitacionSeleccionada({})}
                      >Ver</button>
                    </div>
                  </div>
                ) : (
                  habitaciones.slice(0, 3).map((h) => (
                    <div key={h.id} className="habitacion-card" style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "10px" }}>
                      <img
                        src={`http://localhost:8000/media/${h.imagen}`}
                        alt={h.nombre}
                        style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                      />
                      <div style={{ marginTop: "10px", textAlign: "center" }}>
                        <p>🛏 {h.precio ? `$${h.precio}` : "Precio"}</p>
                        <small>{h.nombre || "Título de la habitación"}</small>
                        <br />
                        <button onClick={() => setHabitacionSeleccionada(h)} style={{ marginTop: "10px" }}>Ver</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* BLOQUE: Formulario de reserva y catálogo */}
            <div className="habitaciones-seccion">
              {/* Lista rápida */}
              <div className="habitaciones-lista">
                <h3>Para reservar por una noche</h3>
                <ul>
                  {habitaciones.length === 0 ? (
                    <li>
                      <img
                        src="/img/habitacion-default.jpg"
                        alt="Habitación predeterminada"
                        style={{ width: "120px", height: "80px", objectFit: "cover", marginRight: "10px", borderRadius: "8px" }}
                      />
                      <span style={{ marginLeft: "10px" }}>
                        <strong>Precio</strong> - Título de la habitación
                      </span>
                      <button
                        style={{ marginLeft: "10px" }}
                        onClick={() => setHabitacionSeleccionada({})}
                      >Ver</button>
                    </li>
                  ) : (
                    habitaciones.slice(0, 4).map((h) => (
                      <li key={h.id}>
                        <img
                            src={`http://localhost:8000/media/${h.imagen}`}
                            alt={h.nombre}
                            style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                        />
                        <span>{h.precio ? `$${h.precio}` : "Precio"} - {h.nombre || "Título de la habitación"}</span>
                        <button onClick={() => setHabitacionSeleccionada(h)}>Ver</button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Carrusel */}
              <div className="habitaciones-carrusel">
                <h3>Habitaciones destacadas</h3>
                <div className="carrusel">
                  {habitaciones.length === 0 ? (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src="/img/habitacion-default.jpg"
                        alt="Habitación predeterminada"
                        style={{ width: "200px", height: "120px", objectFit: "cover", display: "block", margin: "0 auto", borderRadius: "8px" }}
                      />
                      <div style={{ marginTop: "5px" }}>
                        <strong>Precio</strong>
                        <br />
                        <span>Título de la habitación</span>
                      </div>
                    </div>
                  ) : (
                    habitaciones.map((h) => (
                      <img
                        key={h.id}
                        src={`http://localhost:8000/media/${h.imagen}`}
                        alt={h.nombre}
                        className="carrusel-img"
                        style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Catálogo */}
              <div className="habitaciones-catalogo">
                <h3>Catálogo de habitaciones</h3>
                <ul>
                  {habitaciones.length === 0 ? (
                    <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src="/img/habitacion-icono.png"
                        alt="Icono de habitación"
                        style={{ width: "32px", height: "32px" }}
                      />
                      <span>
                        <strong>Precio</strong> - Título de la habitación
                      </span>
                      <button
                        style={{ marginLeft: "8px" }}
                        onClick={() => setHabitacionSeleccionada({})}
                      >Ver</button>
                    </li>
                  ) : (
                    habitaciones.slice(0, 6).map((h) => (
                      <li key={h.id}>
                        🛏 {h.precio ? `$${h.precio}` : "Precio"} - {h.nombre || "Título de la habitación"}
                        <button onClick={() => setHabitacionSeleccionada(h)}>Ver</button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Formulario */}
              <div className="reserva-formulario">
                <h3>Reservar para cliente</h3>
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
               
                <button onClick={onLogout}>Cerrar sesión</button>

                {successMessage && <p className="success">{successMessage}</p>}
                {error && <p className="error">{error}</p>}
              </div>
            </div>
          </div>
        )}

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
                    habitacionSeleccionada.id
                      ? `http://localhost:8000/media/${habitacionSeleccionada.imagen}`
                      : "/img/habitacion-default.jpg"
                  }
                  alt={habitacionSeleccionada.nombre || "Habitación predeterminada"}
                  style={{ width: "180px", borderRadius: "10px", marginBottom: "10px" }}
                />
                <p>
                  {habitacionSeleccionada.descripcion ||
                    "Descripción de la habitación. Aquí se mostrará información relevante sobre la habitación seleccionada, aunque no haya datos disponibles aún."}
                </p>
              </div>

              {/* CENTRO */}
              <div className="reserva-formulario">
                <h3 style={{color:"black"}} >Reservar para cliente</h3>
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
                  {habitaciones.length === 0 ? (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src="/img/habitacion-default.jpg"
                        alt="Habitación predeterminada"
                        style={{ width: "200px", height: "120px", objectFit: "cover", display: "block", margin: "0 auto" }}
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
                        src={`http://localhost:8000/media/${h.imagen}`}
                        alt={h.nombre}
                        className="carrusel-img"
                        style={{ width: "80px", height: "80px", objectFit: "cover", display: "flex", margin: "0 auto" }}
                      />
                    ))
                  )}
                </div>
                <h4>Catálogo de habitaciones</h4>
                <ul>
                  {habitaciones.length === 0 ? (
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

export default CatalogoEmpleado;
