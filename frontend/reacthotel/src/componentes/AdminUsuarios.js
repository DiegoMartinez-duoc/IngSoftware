import React, { useState, useEffect } from "react";
import "../estilos/Admin.css";
import usuarioImg from "../img/usuario.png";


const AdminUsuarios = ({ onLogout }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [clientesReserva, setClientesReserva] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
      email: '',
      contrasena: '',
      nombre: '',
      telefono: ''
    });

  // -----------------------
  // Funciones para backend
  // -----------------------

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
    fetch("http://localhost:8000/hotel/registroEmpleado/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(response => {

        const data = response.nombre;
        console.log('Registro exitoso:', data);

        fetchUsuarios();
        
      })
      .catch(error => {
        console.error("Error:", error);
        
      });
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:8000/hotel/usuarios/");
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.clientes);
        setEmpleados(data.empleados);
        setClientesReserva(data.clientes);
      } else {
        setError(data.error || "Error al cargar usuarios");
      }
    } catch (err) {
      setError("Error de conexión con backend");
    }
  };

  const eliminarUsuario = (id) => {
    fetch("http://localhost:8000/hotel/usuarios/eliminar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({"id":id}),
    })
      .then(res => res.json())
      .then(response => {

        fetchUsuarios();
        
      })
      .catch(error => {
        console.error("Error:", error);
        
      });
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);


  // -----------------------
  // Renderizado por pasos
  // -----------------------
  return (
    <div className="admin-container">
      <div className="contenedor-principal">
        <div className="empleado-wrapper">
          <h3 className="texto-admin">Registrar Empleado</h3>
          <form onSubmit={handleSubmit} id="registro-formulario" className="validacion" noValidate>
            <input 
              name="email" 
              type="email" 
              className="empleado-formulario-admin" 
              id="empleado-email-input" 
              placeholder="Ingresa el email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
            <input 
              name="contrasena" 
              type="password" 
              className="empleado-formulario-admin" 
              id="empleado-contrasena-input" 
              placeholder="Ingresa la contraseña" 
              value={formData.contrasena}
              onChange={handleChange}
              required 
            />
            <input 
              name="nombre" 
              type="text" 
              className="empleado-formulario-admin" 
              id="empleado-nombre-input" 
              placeholder="Ingresa el nombre" 
              value={formData.nombre}
              onChange={handleChange}
              required 
            />
            <input 
              name="telefono" 
              type="tel" 
              className="empleado-formulario-admin" 
              id="empleado-telefono-input" 
              placeholder="Ingresa el teléfono" 
              value={formData.telefono}
              onChange={handleChange}
              required 
            />
            <div className="boton">
              <button type="submit" className="empleado-registrar">REGISTRAR</button>
            </div>
          </form>
          
          {error && <p className="error">{error}</p>}
       
        </div>

        <div className="lista-wrapper">
          <h5 style={{fontSize:"medium"}} className="texto seccion-titulo">Clientes</h5>
          <div className="usuarios-grid">
            {usuarios.map((u) => (
              <div className="usuario-card" key={u.id}>
                <img className="usuarioImg" src={usuarioImg} alt="Usuario" />
                <div className="usuario-info">
                  <strong>{u.nombre}</strong>
                  {u.email}<br />
                  {u.telefono}<br />
                  Rol: {u.rol}
                </div>
                <button className="eliminar-boton" onClick={() => {eliminarUsuario(u.id)}}>ELIMINAR</button>
              </div>
            ))}
          </div>

          <h5 style={{fontSize:"medium"}} className="texto seccion-titulo">Empleados</h5>
          <div className="usuarios-grid">
            {empleados.map((u) => (
              <div className="usuario-card" key={u.id}>
                <img className="usuarioImg" src={usuarioImg} alt="Empleado" />
                <div className="usuario-info">
                  <strong>{u.nombre}</strong>
                  {u.email}<br />
                  {u.telefono}<br />
                  Rol: {u.rol}
                </div>
                <button className="eliminar-boton" onClick={() => {eliminarUsuario(u.id)}}>ELIMINAR</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    
      <div className="espacio-inferior">
        <div className="tarjeta-inferior">
          <h5 style={{fontSize:"medium"}} className="texto seccion-titulo">Clientes con reserva</h5>
          <div style={{height:"150px" , display:"flex", marginTop:"70px", marginLeft:"-150px"}} className="usuarios-grid">
            {clientesReserva.map((u) => (
              <div className="usuario-card" key={u.id}>
                <img className="usuarioImg" src={usuarioImg} alt="Empleado" />
                <div className="usuario-info">
                  <strong>{u.nombre}</strong>
                  {u.email}<br />
                  {u.telefono}<br />
                  Rol: {u.rol}
                </div>
              </div>
            ))}
          </div>
          
        </div>

        <div className="tarjeta-inferior">
          <h5 style={{fontSize:"medium"}} className="texto seccion-titulo">Clientes mas inactivos</h5>
          <div style={{height:"150px" , display:"flex", marginTop:"70px", marginLeft:"-160px"}} className="usuarios-grid">
            {clientesReserva.map((u) => (
              <div className="usuario-card" key={u.id}>
                <img className="usuarioImg" src={usuarioImg} alt="Empleado" />
                <div className="usuario-info">
                  <strong>{u.nombre}</strong>
                  {u.email}<br />
                  {u.telefono}<br />
                  Rol: {u.rol}
                </div>
              </div>
            ))}
          </div>
         
        </div>

        <div className="tarjeta-inferior">
          <h5 style={{fontSize:"medium"}} className="texto seccion-titulo">Empleados mas inactivos</h5>
          <div style={{height:"150px" , display:"flex", marginTop:"70px", marginLeft:"-180px"}} className="usuarios-grid">
            {empleados.length > 0 && (
              <div className="usuario-card" key={empleados[0].id}>
                <img className="usuarioImg" src={usuarioImg} alt="Empleado" />
                <div className="usuario-info">
                  <strong>{empleados[0].nombre}</strong>
                  {empleados[0].email}<br />
                  {empleados[0].telefono}<br />
                  Rol: {empleados[0].rol}
                </div>
              </div>
            )}
          </div>
         
        </div>
      </div>
      {/* <button onClick={onLogout} 
      style={{ background: "#fff", color: "#732d91", border: "2px solid #732d91", 
      borderRadius: "6px", padding: "8px 18px", width:"500px" }}>
        Cerrar sesión
        </button> */}
    </div>
  );
};

export default AdminUsuarios;
