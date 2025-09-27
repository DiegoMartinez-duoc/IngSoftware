import React, { useState, useEffect } from "react";
import "../estilos/Empleado.css";

const ReservasEmpleado = () => {
  const [step, setStep] = useState(1);
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [formData, setFormData] = useState({
    fechaInicio: "",
    fechaFin: "",
    habitacion: "",
    clienteNombre: "",
    clienteEmail: "",
    metodoPago: "tarjeta",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

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
  // Consultar reservas
  // --------------------------
  const fetchReservas = async () => {
    if (!formData.fechaInicio || !formData.fechaFin) {
      setError("Debe seleccionar ambas fechas");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:8000/hotel/reservas/?inicio=${formData.fechaInicio}&fin=${formData.fechaFin}`
      );
      const data = await res.json();
      if (data.success) {
        setReservas(data.reservas);
        setError("");
      } else {
        setError(data.error || "Error al cargar reservas");
      }
    } catch (err) {
      setError("Error de conexión con backend");
    }
  };

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

  return (
    <div className="empleado-container">
      <div className="gran-wrapper">
        <h2 className="texto">Panel de Reservas (Empleado) - Paso {step}</h2>

        {step === 1 && (
          <>
            <button onClick={() => setStep(2)}>Ver reservas</button>
            <button onClick={() => setStep(3)}>Ver habitaciones / Reservar cliente</button>
          </>
        )}

        {step === 2 && (
          <>
            <p>Consultar reservas por rango de fechas</p>
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
            <button onClick={fetchReservas}>Buscar</button>
            <button onClick={prevStep}>Atrás</button>

            <ul>
              {reservas.length === 0 && <li>No hay reservas en este rango</li>}
              {reservas.map((r) => (
                <li key={r.id}>
                  {r.cliente} - {r.habitacion} - {r.entrada} → {r.salida} - $
                  {r.monto_total} [{r.estado}]
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 3 && (
          <>
            <p>Seleccionar habitación y reservar para cliente</p>
            <select
              name="habitacion"
              value={formData.habitacion}
              onChange={handleChange}
            >
              <option value="">--Seleccione--</option>
              {habitaciones.map((h) => (
                <option key={h.id} value={h.nombre}>
                  {h.nombre} (${h.precio_por_noche})
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
              placeholder="Fecha inicio"
              value={formData.fechaInicio}
              onChange={handleChange}
            />
            <input
              type="date"
              name="fechaFin"
              placeholder="Fecha fin"
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

            <button onClick={handleReservarCliente}>Reservar</button>
            <button onClick={prevStep}>Atrás</button>

            {successMessage && <p className="success">{successMessage}</p>}
            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default ReservasEmpleado;
