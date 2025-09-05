-- Creacion base de datos
CREATE DATABASE hotel_pacific_reef;
\c hotel_pacific_reef;

-- Enumeraciones
CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'cancelada', 'completada');
CREATE TYPE estado_pago AS ENUM ('pendiente', 'completado', 'fallido');

-- Rol
CREATE TABLE rol (
    id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(255) UNIQUE NOT NULL
);

-- Usuarios
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    id_rol INTEGER REFERENCES rol(id) ON DELETE CASCADE,
);

-- Habitaciones
CREATE TABLE habitacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_por_noche DECIMAL(10, 2) NOT NULL,
    capacidad INTEGER NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    imagen VARCHAR(255)
);

-- Reservas
CREATE TABLE reserva (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES cliente(id) ON DELETE CASCADE,
    id_habitacion INTEGER REFERENCES habitacion(id) ON DELETE CASCADE,
    entrada DATE NOT NULL,
    salida DATE NOT NULL,
    monto_total DECIMAL(10, 2) NOT NULL,
    estado estado_reserva DEFAULT 'pendiente',
    qr_code TEXT,
);

-- Pagos
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER REFERENCES reserva(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_de_pago VARCHAR(50) NOT NULL,
    id_transaccion VARCHAR(255),
    estado estado_pago DEFAULT 'pendiente'
);

-- Reportes
CREATE TABLE reporte (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    periodo VARCHAR(50) NOT NULL,
    creacion DATE NOT NULL,
    datos JSON NOT NULL,
);
