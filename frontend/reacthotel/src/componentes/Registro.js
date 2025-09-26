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
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Datos del formulario:', formData);

    fetchData();
 
    if (!formData.email || !formData.contrasena) {
      setError('Por favor, complete todos los campos');
    } else {
      setError(null);
     
    }
  };

  const fetchData = () => {
    fetch("http://localhost:8000/hotel/registro/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(response => {

        const data = response.nombre;
        console.log('Registro exitoso:', data);
        
        handleGoToInicioCliente();
      })
      .catch(error => {
        console.error("Error:", error);
        
      });
  };

  const handleGoToLogin = () => {
    onViewChange("login");
  };

  const handleGoToInicioCliente = () => {
    onViewChange("inicioCliente");
  };

  return (
    <div className="login-container">
      <div className="wrapper">

        <h2 className="text-center">Por favor, registrate para acceder a nuestros servicios</h2>
        <form onSubmit={handleSubmit} id="registro-formulario" className="validacion" noValidate>
          <div className="primera-linea">
            <input 
              name="email" 
              type="email" 
              className="formulario" 
              id="email-input" 
              placeholder={error ? "Correo invalido" : "Ingresa tu email"} 
              value={formData.email}
              onChange={handleChange}
              required 
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
              placeholder="Ingresa tu telefono" 
              value={formData.telefono}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="boton">
            <button type="submit" className="registrar">REGISTRAR</button>
          </div>
        </form>

        <h7 className="ir-login">
          ¿Ya tienes una cuenta? Ingresa <span id="login" onClick={handleGoToLogin}>aquí</span>
        </h7>
      </div>
    </div>
  );
};

export default Registro;