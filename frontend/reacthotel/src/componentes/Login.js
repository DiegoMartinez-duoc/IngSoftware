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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación antes de llamar al backend
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

      // Manejo básico de errores HTTP
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Error HTTP ${res.status}`);
      }

      const response = await res.json();

      if (response?.valido === true) {
        switch (response.rol) {
          case 'usuario':
            handleGoToInicioCliente();
            break;
          case 'empleado':
            handleGoToInicioEmpleado();
            break;
          case 'duena':
            handleGoToInicioDuena();
            break;
          case 'admin':
            handleGoToAdmin();
            break;
          default:
            setServerMsg('Rol no reconocido. Contacte al administrador.');
        }
      } else {
        // Mensaje amigable si el backend no valida
        setServerMsg(response?.mensaje || 'Credenciales inválidas o usuario no encontrado.');
      }
    } catch (err) {
      console.error('Error:', err);
      setServerMsg('No se pudo iniciar sesión. Intente nuevamente en unos segundos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegistro = () => onViewChange?.('registro');
  const handleGoToRecuperar = () => onViewChange?.('recuperar'); 
  const handleGoToInicioCliente = () => onViewChange?.('inicioCliente');
  const handleGoToInicioEmpleado = () => onViewChange?.('inicioEmpleado');
  const handleGoToInicioDuena = () => onViewChange?.('inicioDuena');
  const handleGoToAdmin = () => onViewChange?.("adminPanel");

  return (
    <div className="login-container">
      <div className="wrapper">
        <h2 className="heading" style={{color:"white"}}>Por favor, ingresa para acceder a nuestros servicios.</h2>

        {/* Enlaces superiores (registro + recuperar) */}
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
          {/* Mensajes de error/estado */}
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
