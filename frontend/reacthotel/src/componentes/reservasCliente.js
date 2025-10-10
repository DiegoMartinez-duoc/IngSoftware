import React, { useEffect, useState } from "react";
import "../estilos/Cliente.css";

// ==== Helpers de sesión (tolerantes) ====
const readUser = () => {
  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("usuarioActual");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return {
      email: u?.email ?? "",
      nombre: u?.nombre ?? u?.name ?? u?.username ?? "",
      telefono: u?.telefono ?? "",
      rol: u?.rol ?? "",
      tipo: u?.tipo ?? "usuario",
    };
  } catch {
    return null;
  }
};

const ReservasCliente = () => {
  const [step, setStep] = useState(1);
  const [habitaciones, setHabitaciones] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [error, setError] = useState("");
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // refrescar "Mis reservas" tras reservar

  // usuario reactivo
  const [user, setUser] = useState(() => readUser());

  const [formData, setFormData] = useState({
    fecha: "",
    habitacion_id: "",
    nombre: "",
    email: "",
    metodoPago: "",
    pagarAhora: true,
  });

  // === 0) Mantener sincronizado user desde localStorage ===
  useEffect(() => {
    const refresh = () => setUser(readUser());
    refresh();
    const onStorage = (e) => {
      if (!e || !e.key || ["user", "usuarioActual"].includes(e.key)) refresh();
    };
    const onFocus = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // === 1) Al montar / cuando cambie user: auto-cargar email y nombre ===
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        nombre: user.nombre || prev.nombre,
      }));
    }
  }, [user?.email, user?.nombre]);

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
        setRefreshKey((k) => k + 1); // refresca "Mis reservas"
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
                  aria-label="Método de pago"
                >
                  <option value="">--Seleccione--</option>
                  <option value="webpay">WebPay</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="paypal">PayPal</option>
                </select>
                <p className="subtexto" style={{ marginTop: 6 }}>
                  Puedes cambiar a “pagar después” desmarcando la opción en el paso anterior.
                </p>
              </>
            ) : (
              <p className="subtexto" style={{ color:"#0f172a" }}>
                Se registrará tu reserva como <b>pendiente</b>. Podrás pagar más tarde desde tu historial
                o en recepción.
              </p>
            )}

            {error && <p className="error">{error}</p>}

            <button className="btn-secundario" onClick={prevStep}>Atrás</button>
            <button
              className="btn-primario"
              onClick={handleReservar}
              disabled={formData.pagarAhora && !formData.metodoPago}
              title={
                formData.pagarAhora && !formData.metodoPago
                  ? "Selecciona un método de pago para continuar"
                  : (formData.pagarAhora ? "Proceder al pago" : "Confirmar sin pagar")
              }
            >
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

      {/* MIS RESERVAS (usa user REACTIVO) */}
      <MisReservas key={refreshKey} user={user} />
    </div>
  );
};

/* ---------- Subcomponente: MisReservas (historial + pagar/cancelar) ---------- */
const MisReservas = ({ user }) => {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId, setPayingId] = useState(null); // NEW

  const email = user?.email || "";

  const cargar = async () => {
    if (!email) {
      setError("Inicia sesión para ver tus reservas.");
      setLista([]);
      return;
    }
    setError("");
    setCargando(true);
    try {
      const url = `http://localhost:8000/hotel/mis_reservas/?email=${encodeURIComponent(email)}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      if (data.success) setLista(data.reservas || []);
      else { setError(data.error || "No se pudieron cargar las reservas."); setLista([]); }
    } catch (e) {
      setError("Error de conexión al cargar reservas.");
      setLista([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [email]);

  // Normaliza estado para comparar (quita tildes/espacios y a minúsculas)
  const norm = (s) =>
    (s ?? "")
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLowerCase();

  // Regla de cancelación: estados válidos + 48h antes de la entrada
  const puedeCancelar = (reserva) => {
    const estado = norm(reserva.estado);
    if (!["pendiente", "pagada", "confirmada"].includes(estado)) return false;

    const entrada = new Date(reserva.entrada || reserva.fecha_entrada || reserva.fecha);
    if (isNaN(entrada)) return false;

    const horasFaltantes = (entrada.getTime() - Date.now()) / 36e5;
    return horasFaltantes >= 48;
  };

  const cancelarReserva = async (reserva) => {
    if (!email) return;
    const confirmado = window.confirm(
      `¿Deseas cancelar la reserva de "${reserva.habitacion}" para el ${new Date(reserva.entrada || reserva.fecha_entrada).toLocaleString()}?`
    );
    if (!confirmado) return;

    try {
      setCancellingId(reserva.id);
      const r = await fetch("http://localhost:8000/hotel/cancelar_reserva/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reserva.id, email }),
      });
      const data = await r.json();
      if (data.success) {
        setLista((prev) => prev.map(item =>
          item.id === reserva.id ? { ...item, estado: "cancelada" } : item
        ));
        alert("Reserva cancelada.");
      } else {
        alert(data.error || "No se pudo cancelar la reserva.");
      }
    } catch (e) {
      alert("Error de conexión al cancelar.");
    } finally {
      setCancellingId(null);
    }
  };

  // === Pagar reserva pendiente ===
  const pagarReserva = async (reserva) => {
    if (!email) return;
    const confirmado = window.confirm(
      `¿Deseas pagar ahora la reserva de "${reserva.habitacion}"?\n` +
      `Entrada: ${new Date(reserva.entrada || reserva.fecha_entrada).toLocaleString()}`
    );
    if (!confirmado) return;

    try {
      setPayingId(reserva.id);
      const r = await fetch("http://localhost:8000/hotel/pagar_reserva/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reserva.id,
          email,
          metodoPago: "webpay", // o "tarjeta"/"paypal"
        }),
      });
      const data = await r.json();
      if (data.success) {
        setLista((prev) =>
          prev.map((it) =>
            it.id === reserva.id ? { ...it, estado: "confirmada" } : it
          )
        );
        alert("Pago realizado con éxito. ¡Reserva confirmada!");
      } else {
        alert(data.error || "No se pudo procesar el pago.");
      }
    } catch {
      alert("Error de conexión al pagar.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="gran-wrapper" style={{ marginTop: 16 }}>
      <h2 className="texto">Mis reservas</h2>
      <p className="subtexto">Asociadas a: <b>{email || "(sin correo)"}</b></p>
      <div style={{ margin: "8px 0" }}>
        <button className="btn-primario" onClick={cargar} disabled={cargando || !email}>
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {!cargando && !error && lista.length === 0 && (
        <p className="subtexto">No tienes reservas registradas.</p>
      )}

      <div className="grid-habitaciones" style={{ marginTop: 10 }}>
        {lista.map((r) => {
          const cancelable = puedeCancelar(r);
          const enCancelacion = cancellingId === r.id;
          const esPendiente = norm(r.estado) === "pendiente";

          return (
            <div key={r.id} className="card-habitacion">
              <div className="card-body">
                <h3 className="card-title">{r.habitacion}</h3>
                <p className="card-desc">
                  Entrada: {new Date(r.entrada || r.fecha_entrada).toLocaleString()}<br/>
                  Salida: {new Date(r.salida || r.fecha_salida).toLocaleString()}
                </p>
                <div className="card-meta">
                  <span>Estado: <b style={{ textTransform:"capitalize" }}>{r.estado}</b></span>
                  <span>Total: <b>${r.monto_total || r.total}</b></span>
                </div>

                <div style={{ marginTop: 10, display:"flex", gap:8, flexWrap:"wrap" }}>
                  <button
                    className="btn-cancelar"
                    disabled={!cancelable || enCancelacion}
                    onClick={() => cancelarReserva(r)}
                    title={
                      cancelable
                        ? "Cancelar esta reserva (permitido hasta 48h antes)"
                        : "No puedes cancelar: faltan menos de 48h o el estado no lo permite"
                    }
                  >
                    {enCancelacion ? "Cancelando..." : "Cancelar reserva"}
                  </button>

                  {esPendiente && (
                    <button
                      className="btn-pagar"
                      disabled={payingId === r.id}
                      onClick={() => pagarReserva(r)}
                      title="Pagar ahora y confirmar"
                    >
                      {payingId === r.id ? "Procesando pago…" : "Pagar ahora"}
                    </button>
                  )}
                </div>

                {r.codigo_qr && (
                  <p className="subtexto" style={{ marginTop: 6 }}>
                    QR: <b>{r.codigo_qr}</b>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservasCliente;
