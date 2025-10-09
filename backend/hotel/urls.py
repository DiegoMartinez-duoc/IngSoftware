from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # ---------- Cliente ----------
    path('registro/', views.registro, name='registro'),
    path('login/', views.login, name='login'),
    path('reservar/', views.reservar, name='reservar'),
    path('listar_habitaciones/', views.listar_habitaciones, name='listar_habitaciones'),
    path('mis_reservas/', views.mis_reservas, name='mis_reservas'),
    path('pagar_reserva/', views.pagar_reserva, name='pagar_reserva'),  # opcional 
    path('cancelar_reserva/', views.cancelar_reserva, name='cancelar_reserva'),

    # ---------- Empleado ----------
    path('reservas/', views.listar_reservas, name='listar_reservas'),

    # ---------- Admin ----------
    path('registroEmpleado/', views.registro_empleado, name='registroEmpleado'),
    path('usuarios/', views.listar_usuarios, name='listar_usuarios'),
    path('usuarios/eliminar/', views.eliminar_usuario, name='eliminar_usuario'),
    path('reservas/confirmadas/', views.listar_reservas_confirmadas, name='listar_reservas_confirmadas'),
    path('reportes/generar/', views.generar_reporte, name='generar_reporte'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# (si sirves imágenes de habitaciones en desarrollo)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
