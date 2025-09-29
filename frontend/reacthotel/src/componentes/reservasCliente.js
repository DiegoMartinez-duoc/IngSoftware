// src/componentes/reservasCliente.js
import React, { useState } from "react";
import "../estilos/Cliente.css";

const ReservasCliente = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fecha: "",
    habitacion: "",
    nombre: "",
    email: "",
    metodoPago: "",
  });
  const [error, setError] = useState("");
  const [reservaConfirmada, setReservaConfirmada] = useState(null);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidar = () => {
    if (!formData.nombre || !formData.email) {
      setError("Datos inválidos, por favor complete los campos.");
    } else {
      setError("");
      nextStep();
    }
  };

  const handleReservar = async () => {
    try {
      const response = await fetch("http://localhost:8000/hotel/reservar/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        setReservaConfirmada(data);
        nextStep();
      } else {
        setError("Error al procesar la reserva: " + (data.error || ""));
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="cliente-container">
      <div className="gran-wrapper">
        <h2 className="texto">Reservas - Paso {step}</h2>

        {step === 1 && (
          <>
            <p>Redirigir a habitaciones → Consultar disponibilidad</p>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
            />
            <button onClick={nextStep}>Siguiente</button>
          </>
        )}

        {step === 2 && (
          <>
            <p>Seleccionar habitación</p>
            <select
              name="habitacion"
              value={formData.habitacion}
              onChange={handleChange}
            >
              <option value="">--Seleccione--</option>
              <option value="suite">Suite</option>
              <option value="doble">Doble</option>
              <option value="simple">Simple</option>
            </select>
            <button onClick={prevStep}>Atrás</button>
            <button onClick={nextStep}>Siguiente</button>
          </>
        )}

        {step === 3 && (
          <>
            <p>Ver detalles, precios y calcular total</p>
            <p>
              Habitación: {formData.habitacion || "No seleccionada"} <br />
              Fecha: {formData.fecha || "No seleccionada"} <br />
              Total: ${formData.habitacion === "suite" ? 100 : 50}
            </p>
            <button onClick={prevStep}>Atrás</button>
            <button onClick={nextStep}>Siguiente</button>
          </>
        )}

        {step === 4 && (
          <>
            <p>Completar información personal</p>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Correo"
              value={formData.email}
              onChange={handleChange}
            />
            {error && <p className="error">{error}</p>}
            <button onClick={prevStep}>Atrás</button>
            <button onClick={handleValidar}>Validar datos</button>
          </>
        )}

        {step === 5 && (
          <>
            <p>Seleccionar método de pago</p>
            <select
              name="metodoPago"
              value={formData.metodoPago}
              onChange={handleChange}
            >
              <option value="">--Seleccione--</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="paypal">PayPal</option>
            </select>
            <button onClick={prevStep}>Atrás</button>
            <button onClick={handleReservar}>Proceder al pago</button>
          </>
        )}

        {step === 6 && reservaConfirmada && (
          <>
            <p>
              ✅ {reservaConfirmada.mensaje} <br />
              Total: ${reservaConfirmada.total} <br />
              Código QR: {reservaConfirmada.codigoQR}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ReservasCliente;
