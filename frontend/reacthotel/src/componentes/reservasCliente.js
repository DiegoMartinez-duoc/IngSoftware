import React, { useEffect, useState } from "react";
import "../estilos/Cliente.css";

const getUsuarioActual = () => {
  try {
    const raw = localStorage.getItem("usuarioActual");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const ReservasCliente = () => {
  const [step, setStep] = useState(1);
  const [habitaciones, setHabitaciones] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [error, setError] = useState("");
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // para refrescar "Mis reservas" tras reservar

  const [formData, setFormData] = useState({
    fecha: "",
    habitacion_id: "",
    nombre: "",
    email: "",
    metodoPago: "",
    pagarAhora: true,
  });

  // === 1) Al montar: auto-cargar email y nombre desde login ===
  useEffect(() => {
    const u = getUsuarioActual();
    if (u?.email) {
      setFormData((prev) => ({ ...prev, email: u.email, nombre: u.nombre || prev.nombre }));
    }
  }, []);

  // === 2) Cargar habitaciones ===
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("http://localhost:8000/hotel/listar_habitaciones/");
        const data = await r.json();
        if (data.success) setHabitaciones(data.habitaciones);
        else setError("No se pudieron cargar las habitaciones.");
      } catch (e) {
        setError("Error al cargar habitaciones.");
      }
    })();
  }, []);

  // === 3) Mantener selección para mostrar precio ===
  useEffect(() => {
    const found = habitaciones.find(h => String(h.id) === String(formData.habitacion_id));
    setSeleccion(found || null);
  }, [formData.habitacion_id, habitaciones]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleValidar = () => {
    if (!formData.nombre || !formData.email) {
      setError("Completa nombre y correo.");
      return;
    }
    setError("");
    nextStep();
  };

  const handleReservar = async () => {
    if (formData.pagarAhora && !formData.metodoPago) {
      setError("Selecciona un método de pago.");
      return;
    }
    setError("");

    try {
      const r = await fetch("http://localhost:8000/hotel/reservar/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: formData.fecha,
          habitacion_id: formData.habitacion_id,
          nombre: formData.nombre,
          email: formData.email,
          metodoPago: formData.pagarAhora ? formData.metodoPago : undefined,
          pagarAhora: formData.pagarAhora,
        }),
      });

      const data = await r.json();
      if (data.success) {
        setReservaConfirmada(data);
        setRefreshKey((k) => k + 1); // <<< refresca "Mis reservas"
        nextStep();
      } else {
        setError("No se pudo completar la reserva: " + (data.error || "Error desconocido"));
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="cliente-container">
      {/* Tarjeta principal */}
      <div className="gran-wrapper">
        <h2 className="texto">Reservas - Paso {step}</h2>

        {step === 1 && (
          <>
            <p className="subtexto">
              {formData.pagarAhora
                ? "Paga ahora para confirmar al instante."
                : <>Se registrará tu reserva como <b>pendiente</b>. Podrás pagar más tarde desde tu historial o en recepción.</>}
            </p>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
            />
            <button
              className="btn-primario"
              disabled={!formData.fecha}
              onClick={nextStep}
            >
              Siguiente
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="subtexto">Seleccionar habitación disponible</p>
            <select
              name="habitacion_id"
              value={formData.habitacion_id}
              onChange={handleChange}
            >
              <option value="">--Seleccione--</option>
              {habitaciones.map(h => (
                <option key={h.id} value={h.id}>
                  {h.nombre} · Cap: {h.capacidad} · ${h.precio}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 8 }}>
              <button className="btn-secundario" onClick={prevStep}>Atrás</button>
              <button
                className="btn-primario"
                disabled={!formData.habitacion_id}
                onClick={nextStep}
              >
                Siguiente
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="subtexto">Revisa los detalles</p>
            <p style={{ color: "#0f172a" }}>
              Habitación: <b>{seleccion?.nombre || "No seleccionada"}</b><br />
              Fecha entrada: <b>{formData.fecha || "No seleccionada"}</b><br />
              Noches: <b>1</b><br />
              Total: <b>${seleccion?.precio ?? 0}</b>
            </p>

            {/* pagar ahora / después */}
            <label style={{ display:"flex", alignItems:"center", gap:8, margin:"8px 0" }}>
              <input
                type="checkbox"
                name="pagarAhora"
                checked={formData.pagarAhora}
                onChange={handleChange}
              />
              Pagar ahora
            </label>

            <button className="btn-secundario" onClick={prevStep}>Atrás</button>
            <button className="btn-primario" onClick={nextStep}>Siguiente</button>
          </>
        )}

        {step === 4 && (
          <>
            <p className="subtexto">Tus datos</p>
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
            <button className="btn-secundario" onClick={prevStep}>Atrás</button>
            <button className="btn-primario" onClick={handleValidar}>Validar datos</button>
          </>
        )}

        {step === 5 && (
          <>
            {formData.pagarAhora ? (
              <>
                <p className="subtexto">Selecciona método de pago</p>
                <select
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleChange}
                >
                  <option value="">--Seleccione--</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="paypal">PayPal</option>
                </select>
              </>
            ) : (
              <p className="subtexto" style={{ color:"#0f172a" }}>
                Se registrará tu reserva como <b>pendiente</b>. Podrás pagar más tarde desde tu historial
                o en recepción.
              </p>
            )}

            {error && <p className="error">{error}</p>}
            <button className="btn-secundario" onClick={prevStep}>Atrás</button>
            <button className="btn-primario" onClick={handleReservar}>
              {formData.pagarAhora ? "Proceder al pago" : "Confirmar reserva sin pagar"}
            </button>
          </>
        )}

        {step === 6 && reservaConfirmada && (
          <>
            <p style={{ color: "#0f172a" }}>
              ✅ <b>{reservaConfirmada.mensaje}</b><br />
              Estado: <b>{reservaConfirmada.estado}</b><br />
              Habitación: <b>{reservaConfirmada.habitacion}</b><br />
              Entrada: <b>{reservaConfirmada.fecha_entrada}</b><br />
              Salida: <b>{reservaConfirmada.fecha_salida}</b><br />
              Total: <b>${reservaConfirmada.total}</b><br />
              Código QR: <b>{reservaConfirmada.codigoQR}</b>
            </p>
          </>
        )}
      </div>

      {/* MIS RESERVAS (se carga solo con el email del login) */}
      <MisReservas key={refreshKey} />
    </div>
  );
};

/* ---------- Subcomponente: MisReservas (lee email del login) ---------- */
const MisReservas = () => {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const email = getUsuarioActual()?.email || "";

  const cargar = async () => {
    if (!email) {
      setError("Inicia sesión para ver tus reservas.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      const url = `http://localhost:8000/hotel/mis_reservas/?email=${encodeURIComponent(email)}`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.success) setLista(data.reservas);
      else setError(data.error || "No se pudieron cargar las reservas.");
    } catch (e) {
      setError("Error de conexión al cargar reservas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []); // carga al montar

  return (
    <div className="gran-wrapper" style={{ marginTop: 16 }}>
      <h2 className="texto">Mis reservas</h2>
      <p className="subtexto">Asociadas a: <b>{email || "(sin correo)"}</b></p>
      <div style={{ margin: "8px 0" }}>
        <button className="btn-primario" onClick={cargar}>Actualizar</button>
      </div>
      {error && <p className="error">{error}</p>}
      {cargando && <p className="subtexto">Cargando…</p>}
      {!cargando && !error && lista.length === 0 && (
        <p className="subtexto">No tienes reservas registradas.</p>
      )}

      <div className="grid-habitaciones" style={{ marginTop: 10 }}>
        {lista.map((r) => (
          <div key={r.id} className="card-habitacion">
            <div className="card-body">
              <h3 className="card-title">{r.habitacion}</h3>
              <p className="card-desc">
                Entrada: {new Date(r.entrada).toLocaleString()}<br/>
                Salida: {new Date(r.salida).toLocaleString()}
              </p>
              <div className="card-meta">
                <span>Estado: <b>{r.estado}</b></span>
                <span>Total: <b>${r.monto_total}</b></span>
              </div>
              {r.codigo_qr && (
                <p className="subtexto" style={{ marginTop: 6 }}>
                  QR: <b>{r.codigo_qr}</b>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservasCliente;
