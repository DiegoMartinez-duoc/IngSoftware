from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.utils import timezone
from .models import Usuario, Rol, Habitacion, Reserva, Pagos
import uuid
from django.db.models import Q, Sum

# -----------------------
# Registro de usuario
# -----------------------
@api_view(['POST'])
def registro(request):
    try:
        data = request.data

        if Usuario.objects.filter(email=data['email']).exists():
            return JsonResponse({"valido": False, "mensaje": "El correo ya está registrado"})

        nuevo_usuario = Usuario(
            email=data['email'],
            contrasena=data['contrasena'],
            nombre=data['nombre'],
            telefono=data['telefono'],
            rol_id=Rol.objects.get(id=1)
        )
        nuevo_usuario.save()

        return JsonResponse({"valido": True, "mensaje": "Usuario registrado con éxito"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


# -----------------------
# Login con rol
# -----------------------
@api_view(['POST'])
def login(request):
    try:
        data = request.data
        credencial = Usuario.objects.get(email=data['email'])

        if credencial.contrasena == data['contrasena']:
            return JsonResponse({
                "valido": True,
                "rol": credencial.rol_id.nombre_rol,
                "nombre": credencial.nombre,
                "email": credencial.email
            })
        else:
            return JsonResponse({"valido": False, "mensaje": "Contraseña incorrecta"})

    except Usuario.DoesNotExist:
        return JsonResponse({"valido": False, "mensaje": "Usuario no encontrado"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)



# -----------------------
# Reserva para cliente
# -----------------------
@api_view(['POST'])
def reservar(request):
    try:
        data = request.data

        habitacion = Habitacion.objects.get(nombre=data['habitacion'])

        entrada = timezone.now()
        salida = timezone.now()  # por ahora igual

        usuario, created = Usuario.objects.get_or_create(
            email=data['email'],
            defaults={
                "nombre": data['nombre'],
                "contrasena": "temporal123",
                "telefono": data.get("telefono", ""),
                "rol_id": Rol.objects.get(id=1)
            }
        )

        monto = int(habitacion.precio_por_noche)
        codigo_qr = f"QR-{uuid.uuid4()}"

        nueva_reserva = Reserva.objects.create(
            id_usuario=usuario,
            id_habitacion=habitacion,
            entrada=entrada,
            salida=salida,
            monto_total=monto,
            estado="confirmada",
            codigo_qr=codigo_qr
        )

        pago = Pagos.objects.create(
            id_reserva=nueva_reserva,
            monto=monto,
            metodo_de_pago=data['metodoPago'],
            id_transaccion=str(uuid.uuid4()),
            estado="aprobado"
        )

        return JsonResponse({
            "success": True,
            "mensaje": "Reserva completada",
            "codigoQR": nueva_reserva.codigo_qr,
            "total": nueva_reserva.monto_total,
            "habitacion": habitacion.nombre,
            "fecha": str(nueva_reserva.entrada.date()),
            "pago": {
                "metodo": pago.metodo_de_pago,
                "estado": pago.estado,
                "id_transaccion": pago.id_transaccion
            }
        })

    except Habitacion.DoesNotExist:
        return JsonResponse({"success": False, "error": "Habitación no encontrada"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


# -----------------------
# Listar reservas (empleado/admin)
# -----------------------
@api_view(['GET'])
def listar_reservas(request):
    try:
        fecha_inicio = request.GET.get("inicio")
        fecha_fin = request.GET.get("fin")

        reservas = Reserva.objects.all()

        if fecha_inicio and fecha_fin:
            reservas = reservas.filter(
                Q(entrada__date__gte=fecha_inicio) & Q(salida__date__lte=fecha_fin)
            )

        data = [
            {
                "id": r.id,
                "cliente": r.id_usuario.nombre,
                "email": r.id_usuario.email,
                "habitacion": r.id_habitacion.nombre,
                "entrada": str(r.entrada),
                "salida": str(r.salida),
                "estado": r.estado,
                "monto": r.monto_total,
                "codigo_qr": r.codigo_qr,
            }
            for r in reservas
        ]

        return JsonResponse({"success": True, "reservas": data})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


# -----------------------
# Listar habitaciones disponibles
# -----------------------
@api_view(['GET'])
def listar_habitaciones(request):
    try:
        habitaciones = Habitacion.objects.filter(disponible=True)

        data = [
            {
                "id": h.id,
                "nombre": h.nombre,
                "descripcion": h.descripcion,
                "precio": h.precio_por_noche,
                "capacidad": h.capacidad,
            }
            for h in habitaciones
        ]

        return JsonResponse({"success": True, "habitaciones": data})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


# -----------------------
# Admin: listar usuarios
# -----------------------
@api_view(['GET'])
def listar_usuarios(request):
    try:
        usuarios = Usuario.objects.all()
        data = [
            {
                "id": u.id,
                "nombre": u.nombre,
                "email": u.email,
                "telefono": u.telefono,
                "rol": u.rol_id.nombre_rol
            }
            for u in usuarios
        ]
        return JsonResponse({"success": True, "usuarios": data})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


# -----------------------
# Admin: listar reservas confirmadas
# -----------------------
@api_view(['GET'])
def listar_reservas_confirmadas(request):
    try:
        reservas = Reserva.objects.filter(estado="confirmada").order_by('-entrada')
        data = [
            {
                "id": r.id,
                "cliente": r.id_usuario.nombre,
                "email": r.id_usuario.email,
                "habitacion": r.id_habitacion.nombre,
                "entrada": str(r.entrada),
                "salida": str(r.salida),
                "monto_total": r.monto_total,
                "codigo_qr": r.codigo_qr
            }
            for r in reservas
        ]
        return JsonResponse({"success": True, "reservas": data})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


# -----------------------
# Admin: generar reportes
# -----------------------
@api_view(['POST'])
def generar_reporte(request):
    try:
        data = request.data
        tipo = data.get("tipo")
        periodo_inicio = data.get("inicio")
        periodo_fin = data.get("fin")

        reservas = Reserva.objects.filter(
            entrada__date__gte=periodo_inicio,
            salida__date__lte=periodo_fin
        )

        if tipo == "ventas":
            total = reservas.aggregate(Sum('monto_total'))['monto_total__sum'] or 0
            reporte = {"tipo": tipo, "total_ventas": total, "cantidad_reservas": reservas.count()}
        elif tipo == "ocupacion":
            reporte = {"tipo": tipo, "cantidad_reservas": reservas.count()}
        else:
            reporte = {"tipo": tipo, "detalle": [r.id for r in reservas]}

        return JsonResponse({"success": True, "reporte": reporte})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)
