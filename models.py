from django.db import models

class Rol(models.Model):
    id = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.nombre_rol

class Usuario(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=255, unique=True)
    contrasena = models.CharField(max_length=255, unique=False)
    nombre = models.CharField(max_length=255, unique=False)
    telefono = models.CharField(max_length=50, unique=False)
    rol_id = models.ForeignKey(Rol, on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre

class Habitacion(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255, unique=False)
    descripcion = models.TextField()
    precio_por_noche = models.CharField(max_length=255, unique=False)
    capacidad = models.PositiveIntegerField(default=0)
    disponible = models.BooleanField(default=True)
    imagen = models.ImageField(upload_to='habitaciones/', null=True, blank=True)

    def __str__(self):
        return self.descripcion
    
class Reserva(models.Model):
    id = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    id_habitacion = models.ForeignKey(Habitacion, on_delete=models.CASCADE)
    entrada = models.DateTimeField(auto_now_add=False)
    salida = models.DateTimeField(auto_now_add=False)
    monto_total = models.PositiveIntegerField(default=0)
    estado = models.CharField(max_length=255, unique=False)
    codigo_qr = models.TextField()
    def __str__(self):
        return self.estado
    
class Pagos(models.Model):
    id = models.AutoField(primary_key=True)
    id_reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE)
    monto = models.PositiveIntegerField(default=0)
    metodo_de_pago = models.CharField(max_length=255, unique=False)
    id_transaccion = models.CharField(max_length=255, unique=False)
    estado = models.CharField(max_length=255, unique=False)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.estado
    
class Reporte(models.Model):
    id = models.AutoField(primary_key=True)
    tipo = models.CharField(max_length=255, unique=False)
    periodo = models.CharField(max_length=255, unique=False)
    creacion = models.DateTimeField(auto_now_add=True)
    datos = models.JSONField()
    def __str__(self):
        return self.tipo
