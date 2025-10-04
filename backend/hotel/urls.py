from django.urls import path
from .views import (
    registro,
    login,
    reservar,
    listar_reservas,
    listar_habitaciones,
    listar_usuarios,
    listar_reservas_confirmadas,
    generar_reporte,
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
    # Endpoints generales
    # -----------------------
    path('habitaciones/', listar_habitaciones, name='listar_habitaciones'),

    # -----------------------
    # Endpoints de empleado
    # -----------------------
    path('empleado/reservas/', listar_reservas, name='empleado_reservas'),

    # -----------------------
    # Endpoints de dueña
    # -----------------------
    path('duena/reservas/', listar_reservas, name='duena_reservas'),
    path('duena/reportes/', generar_reporte, name='duena_reportes'),

    # -----------------------
    # Endpoints de admin
    # -----------------------
    path('usuarios/', listar_usuarios, name='listar_usuarios'),
    path('reservas/confirmadas/', listar_reservas_confirmadas, name='listar_reservas_confirmadas'),
    path('reportes/generar/', generar_reporte, name='generar_reporte'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
