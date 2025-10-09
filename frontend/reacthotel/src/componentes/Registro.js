import React, { useState } from 'react';
import '../estilos/Registro.css';

const API_BASE = 'http://localhost:8000/hotel';

const Registro = ({ onViewChange }) => {
  const [formData, setFormData] = useState({
    email: '',
    contrasena: '',
    nombre: '',
    telefono: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (serverMsg) setServerMsg(null);
  };

  // Guarda el usuario igual que en Login
  const saveUser = (data) => {
    const usuario = {
      email: data.email ?? formData.email ?? '',
      nombre: data.nombre ?? formData.nombre ?? '',
      telefono: data.telefono ?? formData.telefono ?? '',
      rol: data.rol ?? '',
      tipo: data.tipo ?? 'usuario',
    };
    localStorage.setItem('user', JSON.stringify(usuario));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.contrasena || !formData.nombre || !formData.telefono) {
      setError('Por favor, complete todos los campos');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/registro/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Error HTTP ${res.status}`);
      }

      const response = await res.json();

      // Asumo que el backend retorna { success: true, usuario: {...} } o similar
      if (response?.success) {
        const u = response.usuario ?? response; // fallback
        saveUser(u);
        onViewChange?.('inicioCliente'); // ir directo al inicio del cliente
      } else {
        setServerMsg(response?.error || 'No se pudo registrar el usuario.');
      }
    } catch (err) {
      console.error('Error:', err);
      setServerMsg('No se pudo registrar. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => onViewChange('login');

  return (
    <div className="login-container">
      <div className="wrapper2">
        <h2 className="heading">Por favor, regístrate para acceder a nuestros servicios</h2>

        <div className="actions">
          <span className="divider" onClick={handleGoToLogin}>
            ¿Ya tienes cuenta? Ingresa aquí
          </span>
        </div>

        <form onSubmit={handleSubmit} id="registro-formulario" className="form" noValidate>
          <div className="primera-linea">
            <input
              name="email"
              type="email"
              className="form-input"
              id="email-input"
              placeholder={error ? 'Correo inválido' : 'Ingresa tu email'}
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="segunda-linea">
            <input
              name="contrasena"
              type="password"
              className="form-input"
              id="contrasena-input"
              placeholder="Ingresa tu contraseña"
              value={formData.contrasena}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="tercera-linea">
            <input
              name="nombre"
              type="text"
              className="form-input"
              id="nombre-input"
              placeholder="Ingresa tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="cuarta-linea">
            <input
              name="telefono"
              type="tel"
              className="form-input"
              id="telefono-input"
              placeholder="Ingresa tu teléfono"
              value={formData.telefono}
              onChange={handleChange}
              required
              autoComplete="tel"
            />
          </div>

          {(error || serverMsg) && (
            <p className="feedback" role="alert">
              {error || serverMsg}
            </p>
          )}

          <div className="boton">
            <button type="submit" className="btn" id="btn-registro" disabled={loading}>
              {loading ? 'Registrando…' : 'REGISTRAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;
