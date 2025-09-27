from django.urls import path
<<<<<<< HEAD
from .views import registro, login
=======
from .views import (
    registro,
    login,
    reservar,
    listar_reservas,
    listar_habitaciones,
    listar_usuarios,
    listar_reservas_confirmadas,
    generar_reporte
)
>>>>>>> ee26b58 (Modificado reservaCliente.js, añadido reservaEmpleado.js, AdminPanel.js,Empleado.css, Admin.css)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
<<<<<<< HEAD
    path('registro/', registro, name='registro'),
    path('login/', login, name='login'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
=======
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
    path('usuarios/', listar_usuarios, name='listar_usuarios'),
    path('reservas/confirmadas/', listar_reservas_confirmadas, name='listar_reservas_confirmadas'),
    path('reportes/generar/', generar_reporte, name='generar_reporte'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
>>>>>>> ee26b58 (Modificado reservaCliente.js, añadido reservaEmpleado.js, AdminPanel.js,Empleado.css, Admin.css)
