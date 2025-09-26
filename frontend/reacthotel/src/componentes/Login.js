import React, { useState } from 'react';
import '../estilos/Login.css'; 

const Login = ({ onViewChange }) => {
  const [formData, setFormData] = useState({
    email: '',
    contrasena: ''
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
    fetch("http://localhost:8000/hotel/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(response => {

        if (response.valido == true) {
          handleGoToInicioCliente();
        }
          
        
        
      })
      .catch(error => {
        console.error("Error:", error);
        
      });
  };

  const handleGoToRegistro = () => {
    onViewChange("registro");
  };

  const handleGoToInicioCliente = () => {
    onViewChange("inicioCliente");
  };

  return (
    <div className="login-container">
      <div className="wrapper">

        <h2 className="text-center">Por favor, ingresa para acceder a nuestros servicios</h2>
        <form onSubmit={handleSubmit} id="registro-formulario" className="validacion" noValidate>
          <div className="primera-linea">
            <input 
              name="email" 
              type="email" 
              className="formulario" 
              id="email-input" 
              placeholder={error ? "No existe usuario con este correo" : "Ingresa tu email"} 
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
          <div className="boton">
            <button type="submit" className="registrar">LOGIN</button>
          </div>
        </form>

        <h7 className="ir-registro">
          ¿No tienes una cuenta? Regístrate <span id="registro" cursor="pointer" onClick={handleGoToRegistro} style={{ color: '#459875' }}>aquí</span>
        </h7>
        <h7 className="ir-recuperacion">
          ¿Olvidaste tu contraseña? Recupérala <span id="ir-registro" style={{ color: '#459875' }}>aquí
          </span>
        </h7>
      </div>
    </div>
  );
};

export default Login;