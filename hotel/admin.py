from django.contrib import admin
from .models import (Rol, Usuario, Habitacion, Reserva, Pagos, Reporte)

admin.site.register(Rol)
admin.site.register(Usuario)
admin.site.register(Habitacion)
admin.site.register(Reserva)
admin.site.register(Pagos)
admin.site.register(Reporte)
