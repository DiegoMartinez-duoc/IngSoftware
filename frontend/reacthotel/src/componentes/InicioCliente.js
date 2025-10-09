import React, { useEffect, useState } from "react";
import "../estilos/Cliente.css";

const API_BASE = "http://localhost:8000/hotel";
const MEDIA_BASE = "http://localhost:8000/media/"; // para imágenes de la BD

const InicioCliente = ({ onViewChange }) => {
  // ====== ESTADOS ======
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Usuario (lectura reactiva y tolerante)
  const [user, setUser] = useState(null);

  // ====== UTIL: FORMATEO CLP ======
  const fmtCLP = (n) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(n ?? 0);

  // ====== LECTURA REACTIVA DEL USUARIO ======
  useEffect(() => {
    const readUser = () => {
      try {
        const raw =
          localStorage.getItem("user") ||
          localStorage.getItem("usuario") ||
          localStorage.getItem("authUser");

        if (!raw) return setUser(null);

        const u = JSON.parse(raw);
        const nombre =
          u?.nombre ?? u?.name ?? u?.Nombre ?? u?.fullName ?? u?.username ?? null;

        setUser(nombre ? { ...u, nombre } : u ?? null);
      } catch {
        setUser(null);
      }
    };

    // leer al montar
    readUser();

    // si cambia en otra pestaña/ventana
    const onStorage = (e) => {
      if (["user", "usuario", "authUser"].includes(e.key)) readUser();
    };

    // al recuperar foco (si volviste desde login u otra vista)
    const onFocus = () => readUser();

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // ====== CARGA DE HABITACIONES ======
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

  // ====== IR A RESERVAS (sin reservar aún) ======
  const irAReservas = (h) => {
    // si no está logueado, ve a login
    if (!user) {
      onViewChange?.("login");
      return;
    }
    // Deja preseleccionada la habitación para el flujo de reservas
    sessionStorage.setItem("preReservaHabitacionId", String(h.id));
    onViewChange?.("reservasCliente");
  };

  // ====== RENDER ======
  return (
    <div className="cliente-container">
      <header className="cliente-header">
        <div>
          <h1 style={{ color: "#111", position: "relative", zIndex: 5 }}>
            {(() => {
              // Fallback directo a localStorage por si el estado aún no cargó
              const u =
                user ||
                (() => {
                  try {
                    return JSON.parse(localStorage.getItem("user") || "null");
                  } catch {
                    return null;
                  }
                })();
              const nombre =
                u?.nombre ??
                u?.name ??
                u?.Nombre ??
                u?.fullName ??
                u?.username ??
                null;
              return nombre ? `Bienvenido, ${nombre}` : "Bienvenido";
            })()}
          </h1>
          <p className="subtexto">Explora y reserva tu próxima habitación</p>
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
            const imgSrc = h.imagen ? `${MEDIA_BASE}${h.imagen}` : "/img/Habitacion2";
            return (
              <article key={h.id} className="card-habitacion">
                <div className="card-media">
                  <img
                    src={imgSrc}
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
                    onClick={() => irAReservas(h)}
                    title="Ir a reservar"
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
