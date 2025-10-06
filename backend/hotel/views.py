from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.utils import timezone
from .models import Usuario, Rol, Habitacion, Reserva, Pagos
import uuid
from django.db.models import Q, Sum
from datetime import datetime, timedelta


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
# Registro de empleado
# -----------------------

@api_view(['POST'])
def registro_empleado(request):
    try:
        data = request.data

        if Usuario.objects.filter(email=data['email']).exists():
            return JsonResponse({"valido": False, "mensaje": "El correo ya está registrado"})

        nuevo_usuario = Usuario(
            email=data['email'],
            contrasena=data['contrasena'],
            nombre=data['nombre'],
            telefono=data['telefono'],
            rol_id=Rol.objects.get(id=2)
        )
        nuevo_usuario.save()

        return JsonResponse({"valido": True, "mensaje": "Usuario registrado con éxito"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

# -----------------------
# Eliminar usuario
# -----------------------

@api_view(['POST'])
def eliminar_usuario(request):
    try:
        data = request.data
        credencial = Usuario.objects.get(id=data['id'])

        credencial.delete()

       

        return JsonResponse({"valido": True, "mensaje": "Usuario eliminado con éxito"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

# -----------------------
# Login
# -----------------------
@api_view(['POST'])
def login(request):
    try:
        data = request.data
        credencial = Usuario.objects.get(email=data['email'])
     
        if credencial.contrasena == data['contrasena']:
            if (credencial.rol_id == Rol.objects.get(id=1)):
                return JsonResponse(
                    {
                        "valido": True, 
                        "tipo": "usuario",
                        "rol": credencial.rol_id.nombre_rol,
                        "nombre": credencial.nombre,
                        "email": credencial.email
                    })
            elif (credencial.rol_id == Rol.objects.get(id=2)):
                return JsonResponse(
                    {
                        "valido": True, 
                        "tipo": "empleado",
                        "rol": credencial.rol_id.nombre_rol,
                        "nombre": credencial.nombre,
                        "email": credencial.email
                    })
            elif (credencial.rol_id == Rol.objects.get(id=3)):
                return JsonResponse(
                    {
                        "valido": True, 
                        "tipo": "admin",
                        "rol": credencial.rol_id.nombre_rol,
                        "nombre": credencial.nombre,
                        "email": credencial.email
                    })
            else:
                return JsonResponse(
                    {
                        "valido": True, 
                        "tipo": "duena",
                        "rol": credencial.rol_id.nombre_rol,
                        "nombre": credencial.nombre,
                        "email": credencial.email
                    })
        else:
            return JsonResponse({"valido": False})

    except Usuario.DoesNotExist:
        return JsonResponse({"valido": False, "mensaje": "Usuario no encontrado"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


# -----------------------
# Reserva para cliente
# -----------------------
# views.py
@api_view(['POST'])
def reservar(request):
    try:
        data = request.data

        # 1) Resolver habitación por id o por nombre (compatibilidad)
        habitacion = None
        if data.get('habitacion_id'):
            habitacion = Habitacion.objects.get(id=data['habitacion_id'])
        elif data.get('habitacion'):
            habitacion = Habitacion.objects.get(nombre=data['habitacion'])
        else:
            return JsonResponse({"success": False, "error": "Falta seleccionar la habitación"}, status=400)

        # 2) Fechas (si no envían 'fecha', usar hoy; asumimos 1 noche)
        if data.get('fecha'):
            # soporta 'YYYY-MM-DD' o ISO
            fecha_str = str(data['fecha']).split('T')[0]
            entrada = datetime.fromisoformat(fecha_str)
        else:
            entrada = timezone.now()
        salida = entrada + timedelta(days=1)

        # 3) Usuario (crea si no existe)
        usuario, _ = Usuario.objects.get_or_create(
            email=data['email'],
            defaults={
                "nombre": data.get("nombre", "Cliente"),
                "contrasena": "temporal123",
                "telefono": data.get("telefono", ""),
                "rol_id": Rol.objects.get(id=1)
            }
        )

        # 4) Monto simple por noche
        monto = int(habitacion.precio_por_noche)

        # 5) Crear reserva + pago
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
            metodo_de_pago=data.get('metodoPago', 'tarjeta'),
            id_transaccion=str(uuid.uuid4()),
            estado="aprobado"
        )

        return JsonResponse({
            "success": True,
            "mensaje": "Reserva completada",
            "codigoQR": nueva_reserva.codigo_qr,
            "total": nueva_reserva.monto_total,
            "habitacion": habitacion.nombre,
            "fecha_entrada": str(nueva_reserva.entrada.date()),
            "fecha_salida": str(nueva_reserva.salida.date()),
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
                "imagen": r.id_habitacion.imagen
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
                "imagen": h.imagen.name if h.imagen else None
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
        dataCliente = [
            {
                "id": u.id,
                "nombre": u.nombre,
                "email": u.email,
                "telefono": u.telefono,
                "rol": u.rol_id.nombre_rol
            }
            for u in usuarios if u.rol_id == Rol.objects.get(id=1)
        ]

        dataEmpleado = [
            {
                "id": u.id,
                "nombre": u.nombre,
                "email": u.email,
                "telefono": u.telefono,
                "rol": u.rol_id.nombre_rol
            }
            for u in usuarios if u.rol_id == Rol.objects.get(id=2)
        ]

        # dataClientesReserva = [
        #     {
        #         "id": u.id,
        #         "nombre": u.nombre,
        #         "email": u.email,
        #         "telefono": u.telefono,
        #         "rol": u.rol_id.nombre_rol
        #     }
        #     for u in usuarios if u.rol_id == Rol.objects.get(id=1) and Reserva.objects.get(id_usuario=u) != None
        # ]

        # print(dataClientesReserva)


        return JsonResponse({"success": True, "clientes": dataCliente, "empleados": dataEmpleado})
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
                "codigo_qr": r.codigo_qr,
                "imagen": r.id_habitacion.imagen.name if r.id_habitacion.imagen else None
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

@api_view(['GET'])
def mis_reservas(request):
    """
    GET /hotel/mis_reservas?email=usuario@correo.com&estado=confirmada|pendiente|cancelada  (estado opcional)
    También acepta ?usuario_id=123
    """
    try:
        email = request.GET.get("email")
        usuario_id = request.GET.get("usuario_id")
        estado = request.GET.get("estado")  # opcional

        if not email and not usuario_id:
            return JsonResponse({"success": False, "error": "Falta email o usuario_id"}, status=400)

        if usuario_id:
            reservas = Reserva.objects.filter(id_usuario__id=usuario_id)
        else:
            reservas = Reserva.objects.filter(id_usuario__email=email)

        if estado:
            reservas = reservas.filter(estado=estado)

        reservas = reservas.order_by("-entrada")

        data = [{
            "id": r.id,
            "habitacion": r.id_habitacion.nombre,
            "entrada": r.entrada.isoformat(),
            "salida": r.salida.isoformat(),
            "estado": r.estado,
            "monto_total": r.monto_total,
            "codigo_qr": r.codigo_qr,
            "imagen": r.id_habitacion.imagen.name if r.id_habitacion.imagen else None,
        } for r in reservas]

        return JsonResponse({"success": True, "reservas": data})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


@api_view(['POST'])
def pagar_reserva(request):
    """
    Body: { "reserva_id": 123, "metodoPago": "tarjeta" }
    """
    try:
        data = request.data
        reserva_id = data.get("reserva_id")
        metodo = data.get("metodoPago", "tarjeta")
        if not reserva_id:
            return JsonResponse({"success": False, "error": "Falta reserva_id"}, status=400)

        reserva = Reserva.objects.get(id=reserva_id)
        if reserva.estado == "confirmada":
            return JsonResponse({"success": False, "error": "La reserva ya está confirmada"}, status=400)

        pago = Pagos.objects.create(
            id_reserva=reserva,
            monto=reserva.monto_total,
            metodo_de_pago=metodo,
            id_transaccion=str(uuid.uuid4()),
            estado="aprobado"
        )
        reserva.estado = "confirmada"
        reserva.save(update_fields=["estado"])

        return JsonResponse({
            "success": True,
            "mensaje": "Pago realizado y reserva confirmada",
            "reserva_id": reserva.id,
            "pago": {
                "metodo": pago.metodo_de_pago,
                "estado": pago.estado,
                "id_transaccion": pago.id_transaccion
            }
        })

    except Reserva.DoesNotExist:
        return JsonResponse({"success": False, "error": "Reserva no encontrada"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)