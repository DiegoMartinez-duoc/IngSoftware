import React, { useState } from 'react';
import '../estilos/Login.css';

const API_BASE = 'http://localhost:8000/hotel';

const Login = ({ onViewChange }) => {
  const [formData, setFormData] = useState({ email: '', contrasena: '' });
  const [error, setError] = useState(null);
  const [serverMsg, setServerMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    if (error) setError(null);
    if (serverMsg) setServerMsg(null);
  };

  // ==== GUARDA USUARIO COMO "user" (coherente con InicioCliente) ====
  const saveUser = (data) => {
    // Normaliza campos por si el backend usa otros nombres
    const usuario = {
      email: data.email ?? formData.email ?? '',
      nombre: data.nombre ?? data.name ?? data.fullName ?? data.username ?? '',
      telefono: data.telefono ?? '',
      rol: data.rol ?? '',
      tipo: data.tipo ?? 'usuario', // usuario | empleado | admin | duena
    };
    localStorage.setItem('user', JSON.stringify(usuario));
    // notifica a otros componentes
    window.dispatchEvent(new Event('storage'));
  };

  const clearUser = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
  };

  const routeByTipo = (tipo) => {
    switch (tipo) {
      case 'usuario':
        onViewChange?.('inicioCliente');
        break;
      case 'empleado':
        onViewChange?.('inicioEmpleado');
        break;
      case 'duena':
        onViewChange?.('inicioDuena');
        break;
      case 'admin':
        onViewChange?.('adminPanel');
        break;
      default:
        onViewChange?.('inicioCliente'); // fallback
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.contrasena) {
      setError('Por favor, complete todos los campos');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Error HTTP ${res.status}`);
      }

      const response = await res.json();

      if (response?.valido === true) {
        // 1) Guardar sesión (clave "user")
        saveUser(response);
        // 2) Rutear por tipo (si viene); si no, a inicioCliente
        routeByTipo(response.tipo ?? 'usuario');
      } else {
        clearUser();
        setServerMsg(response?.mensaje || 'Credenciales inválidas o usuario no encontrado.');
      }
    } catch (err) {
      console.error('Error:', err);
      clearUser();
      setServerMsg('No se pudo iniciar sesión. Intente nuevamente en unos segundos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegistro = () => onViewChange?.('registro');
  const handleGoToRecuperar = () => onViewChange?.('recuperar');

  return (
    <div className="login-container">
      <div className="wrapper">
        <h2 className="heading" style={{ color: 'white' }}>
          Por favor, ingresa para acceder a nuestros servicios.
        </h2>

        <div className="actions">
          <span className="link1" id="registro" onClick={handleGoToRegistro}>
            ¿No tienes cuenta? Regístrate aquí
          </span>
          <span className="divider">·</span>
        </div>

        <form onSubmit={handleSubmit} id="registro-formulario" className="form" noValidate>
          <input
            name="email"
            type="email"
            className="form-input"
            placeholder={error ? 'No existe usuario con este correo' : 'Ingresa tu correo electrónico'}
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            aria-label="Correo electrónico"
          />

          <input
            name="contrasena"
            type="password"
            className="form-input"
            placeholder="Ingresa tu contraseña"
            value={formData.contrasena}
            onChange={handleChange}
            required
            autoComplete="current-password"
            aria-label="Contraseña"
          />

          <span className="link2" id="recuperar" onClick={handleGoToRecuperar}>
            ¿Olvidaste tu contraseña? Recupera aquí
          </span>

          {(error || serverMsg) && (
            <p className="feedback" role="alert">
              {error || serverMsg}
            </p>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Accediendo…' : 'ACCESO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
