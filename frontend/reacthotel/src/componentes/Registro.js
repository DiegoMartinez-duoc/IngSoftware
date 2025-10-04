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
      <div className="wrapper2">

        <h2 className="heading">Por favor, registrate para acceder a nuestros servicios</h2>

        <div className="actions">
          <span className="divider" onClick={handleGoToLogin}>¿Ya tienes cuenta? Ingresa aquí</span>
        </div>
          
          
         
        

        <form onSubmit={handleSubmit} id="registro-formulario" className="form" noValidate>
          <div className="primera-linea">
            <input 
              name="email" 
              type="email" 
              className="form-input" 
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
              className="form-input" 
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
              className="form-input" 
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
              className="form-input" 
              id="telefono-input" 
              placeholder="Ingresa tu telefono" 
              value={formData.telefono}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="boton">
            <button type="submit" className="btn" id="btn-registro">REGISTRAR</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;