import React, { useState } from 'react';
import '../estilos/Registro.css';

const Registro = ({ onViewChange }) => {
  const [formData, setFormData] = useState({
    email: '',
    contrasena: '',
    nombre: '',
    telefono: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.contrasena || !formData.nombre || !formData.telefono) {
      setError('Por favor, complete todos los campos');
      return;
    }

    fetch("http://localhost:8000/hotel/registro/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(response => {
        console.log('Registro exitoso:', response?.nombre);
        handleGoToInicioCliente();
      })
      .catch(err => {
        console.error("Error:", err);
        setError('No se pudo registrar. Intente nuevamente.');
      });
  };

  const handleGoToLogin = () => onViewChange("login");
  const handleGoToInicioCliente = () => onViewChange("inicioCliente");

  return (
    <div className="login-container">
      <div className="wrapper2">
        <h2 className="text-center">Por favor, regístrate para acceder a nuestros servicios</h2>

        <form onSubmit={handleSubmit} id="registro-formulario" className="validacion" noValidate>
          <div className="primera-linea">
            <input
              name="email"
              type="email"
              className="formulario"
              id="email-input"
              placeholder={error ? "Correo inválido" : "Ingresa tu email"}
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
              className="formulario"
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
              className="formulario"
              id="nombre-input"
              placeholder="Ingresa tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="cuarta-linea">
            <input
              name="telefono"
              type="tel"
              className="formulario"
              id="telefono-input"
              placeholder="Ingresa tu teléfono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="feedback" role="alert">{error}</p>}

          <div className="boton">
            <button type="submit" className="registrar">REGISTRAR</button>
          </div>
        </form>

        <p className="ir-login">
          ¿Ya tienes una cuenta? Ingresa <span id="login" onClick={handleGoToLogin}>aquí</span>
        </p>
      </div>
    </div>
  );
};

export default Registro;
