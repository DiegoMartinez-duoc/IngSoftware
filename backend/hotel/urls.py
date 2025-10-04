from django.urls import path
from .views import (
    registro,
    registro_empleado,
    eliminar_usuario,
    login,
    reservar,
    listar_reservas,
    listar_habitaciones,
    listar_usuarios,
    listar_reservas_confirmadas,
    generar_reporte
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # -----------------------
    # Endpoints de usuario/cliente
    # -----------------------
    path('registro/', registro, name='registro'),
    path('login/', login, name='login'),
    path('reservar/', reservar, name='reservar'),

    # -----------------------
    # Endpoints de empleado
    # -----------------------
    path('reservas/', listar_reservas, name='listar_reservas'),
    path('habitaciones/', listar_habitaciones, name='listar_habitaciones'),

    # -----------------------
    # Endpoints de admin
    # -----------------------
    path('registroEmpleado/', registro_empleado, name='registroEmpleado'),
    path('usuarios/', listar_usuarios, name='listar_usuarios'),
    path('usuarios/eliminar/', eliminar_usuario, name='eliminar_usuario'),
    path('reservas/confirmadas/', listar_reservas_confirmadas, name='listar_reservas_confirmadas'),
    path('reportes/generar/', generar_reporte, name='generar_reporte'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
