import React, { useEffect, useMemo, useState } from "react";
import "../estilos/Cliente.css";

const API_BASE = "http://localhost:8000/hotel";
const MEDIA_BASE = "http://localhost:8000/media/"; // MUY IMPORTANTE para las imágenes

const InicioCliente = ({ onViewChange }) => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Traer usuario guardado (desde Registro/Login)
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  // Formatear CLP (bonito)
  const fmtCLP = (n) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(n ?? 0);

  // Cargar habitaciones disponibles
  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        const res = await fetch(`${API_BASE}/listar_habitaciones/`);
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`HTTP ${res.status} - ${t}`);
        }
        const json = await res.json();
        if (json.success) {
          // Solo mostramos 4
          setHabitaciones((json.habitaciones || []).slice(0, 4));
        } else {
          setErr(json.error || "No se pudieron cargar las habitaciones");
        }
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    };
    fetchHabitaciones();
  }, []);

  // Reservar
  const handleReservar = async (h) => {
    if (!user) {
      alert("Inicia sesión para reservar.");
      onViewChange?.("login");
      return;
    }
    try {
      const body = {
        email: user.email,
        nombre: user.nombre,
        telefono: user.telefono || "", // si lo guardas en localStorage, úsalo
        habitacion: h.nombre,          // ¡ojo! tu view busca por nombre
        metodoPago: "webpay",
      };
      const res = await fetch(`${API_BASE}/reservar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        // Aquí puedes usar un modal. Por ahora, simple alerta.
        alert(
          `✅ Reserva completada\n` +
          `Habitación: ${json.habitacion}\n` +
          `Total: ${fmtCLP(json.total)}\n` +
          `Código QR: ${json.codigoQR}`
        );
      } else {
        alert(json.error || "No se pudo completar la reserva");
      }
    } catch (e) {
      alert("Error de conexión al reservar");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    onViewChange?.("login");
  };

  return (
    <div className="cliente-container">
      <header className="cliente-header">
        <div>
          <h1 className="texto">
            {user ? `Bienvenido, ${user.nombre}` : "Bienvenido"}
          </h1>
          <p className="subtexto">Explora y reserva tu próxima habitación</p>
        </div>
       <div className="header-actions">
  {user && (
    <button className="btn-secundario" onClick={logout}>
      Cerrar sesión
    </button>
  )}
</div>
      </header>

      {loading && (
        <section className="grid-habitaciones">
          {Array.from({ length: 4 }).map((_, i) => (
            <article key={i} className="card-habitacion skeleton">
              <div className="card-media" />
              <div className="card-body">
                <div className="sk-line sk-title" />
                <div className="sk-line" />
                <div className="sk-line short" />
                <div className="sk-btn" />
              </div>
            </article>
          ))}
        </section>
      )}

      {err && <p className="error">{err}</p>}

      {!loading && !err && (
        <section className="grid-habitaciones">
          {habitaciones.length === 0 && (
            <p className="texto">No hay habitaciones disponibles ahora.</p>
          )}

          {habitaciones.map((h) => {
            // *** Lo más importante: cómo cargas la imagen desde la BD ***
            // El backend envía, por ejemplo: "habitaciones/doble1.jpg"
            // Se debe renderizar como: http://localhost:8000/media/habitaciones/doble1.jpg
            const imgSrc = h.imagen
              ? `${MEDIA_BASE}${h.imagen}`
              : "/img/Habitacion2";

            return (
              <article key={h.id} className="card-habitacion">
                <div className="card-media">
                  <img
                    src={imgSrc}               // <= AQUÍ VA LA RUTA /media/ + h.imagen
                    alt={h.nombre}
                    className="card-img"
                    loading="lazy"
                  />
                </div>
                <div className="card-body">
                  <h3 className="card-title">{h.nombre}</h3>
                  {h.descripcion && <p className="card-desc">{h.descripcion}</p>}
                  <div className="card-meta">
                    <span>Capacidad: {h.capacidad}</span>
                    <span>Precio: {fmtCLP(h.precio)} / noche</span>
                  </div>
                  <button
                    className="btn-primario"
                    onClick={() => handleReservar(h)}
                    disabled={!user}
                    title={user ? "Reservar ahora" : "Inicia sesión para reservar"}
                  >
                    Reservar
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default InicioCliente;
