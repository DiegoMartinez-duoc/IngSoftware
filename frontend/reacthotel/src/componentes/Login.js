import React, { useState } from 'react';
import '../estilos/Login.css';

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

  const saveUser = (data) => {
    // data viene de /hotel/login/
    const usuario = {
      email: data.email,
      nombre: data.nombre,
      rol: data.rol,     // p.ej. "Cliente", "Empleado", etc.
      tipo: data.tipo,   // "usuario" | "empleado" | "admin" | "duena"
    };
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
  };

  const clearUser = () => {
    localStorage.removeItem('usuarioActual');
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
        setServerMsg('Rol/tipo no reconocido. Contacte al administrador.');
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
      const res = await fetch('http://localhost:8000/hotel/login/', {
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
        // 1) Guardar sesión
        saveUser(response);
        // 2) Rutear por "tipo" (no por "rol")
        routeByTipo(response.tipo);
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
          {/* Puedes agregar más acciones si quieres */}
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
