import React, { useState } from 'react';
import '../estilos/Cliente.css'; 

const ReservasCliente = ({ onViewChange }) => {
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
 
    if (!formData.email || !formData.contrasena) {
      setError('Por favor, complete todos los campos');
    } else {
      setError(null);
     
    }
  };

  const handleGoToLogin = () => {
    onViewChange("login");
  };

  return (
    <div className="cliente-container">
      <div className="gran-wrapper">

        <h2 className="texto">Reservas</h2>
        
      </div>

      

      <div id="tarjeta-1">
        <h2 className="texto">Reservas</h2>
      </div>

      <div id="tarjeta-2">
        <h2 className="texto">Reservas</h2>
      </div>

      <div id="tarjeta-3">
        <h2 className="texto">Reservas</h2>
      </div>
        
      
    </div>
  );
};

export default ReservasCliente;