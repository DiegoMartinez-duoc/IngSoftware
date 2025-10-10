from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.utils import timezone
from .models import Usuario, Rol, Habitacion, Reserva, Pagos
import uuid
from django.db.models import Q, Sum
from datetime import datetime, timedelta, timezone
from django.utils import timezone
from django.utils import timezone  
from uuid import uuid4  # <-- en la cabecera del archivo

from django.views.decorators.csrf import csrf_exempt
import json





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
def to_bool(v):
    """Convierte 'true'/'false'/1/0/True/False a booleano real."""
    if isinstance(v, bool):
        return v
    if v is None:
        return False
    s = str(v).strip().lower()
    return s in ("true", "1", "yes", "y", "on")

@csrf_exempt
@api_view(['POST'])
def reservar(request):
    try:
        data = request.data

        # 1) Resolver habitación por id o por nombre
        habitacion = None
        if data.get('habitacion_id'):
            habitacion = Habitacion.objects.get(id=data['habitacion_id'])
        elif data.get('habitacion'):
            habitacion = Habitacion.objects.get(nombre=data['habitacion'])
        else:
            return JsonResponse({"success": False, "error": "Falta seleccionar la habitación"}, status=400)

        # 2) Fechas (si no envían 'fecha', usar hoy; asumimos 1 noche)
        if data.get('fecha'):
            # soporta 'YYYY-MM-DD' (del front) o ISO
            fecha_str = str(data['fecha']).split('T')[0]
            # naive -> vuelve aware con la tz de Django
            entrada_naive = datetime.strptime(fecha_str, "%Y-%m-%d")
            entrada = timezone.make_aware(
                entrada_naive,
                timezone=timezone.get_default_timezone()  # o get_current_timezone()
            )
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
                "rol_id": Rol.objects.get(id=1),
            }
        )

        # 4) Monto simple por noche (tu campo es CharField)
        try:
            precio_noche = int(habitacion.precio_por_noche)
        except Exception:
            return JsonResponse({"success": False, "error": "Precio inválido en habitación"}, status=500)
        total = precio_noche * 1  # 1 noche

        # 5) Flag y método de pago
        pagar_ahora = to_bool(data.get("pagarAhora"))
        metodo = (data.get("metodoPago") or "").strip().lower()

        if pagar_ahora and metodo not in {"webpay", "tarjeta", "paypal"}:
            return JsonResponse({"success": False, "error": "Método de pago inválido o faltante."}, status=400)

        # 6) Estado según flag
        estado = "confirmada" if pagar_ahora else "pendiente"

        # 7) Crear reserva
        reserva = Reserva.objects.create(
            id_usuario=usuario,
            id_habitacion=habitacion,
            entrada=entrada,
            salida=salida,
            monto_total=total,
            estado=estado,
            codigo_qr=f"QR-{uuid4()}",
        )

        # 8) Si paga ahora, crear registro en Pagos
        pago_info = None
        if pagar_ahora:
            id_tx = f"TX-{uuid4()}"
            pago = Pagos.objects.create(
                id_reserva=reserva,
                monto=total,
                metodo_de_pago=metodo,
                id_transaccion=id_tx,
                estado="aprobado",
            )
            pago_info = {
                "metodo": pago.metodo_de_pago,
                "estado": pago.estado,
                "id_transaccion": pago.id_transaccion,
            }

        # 9) Respuesta
        return JsonResponse({
            "success": True,
            "mensaje": "Reserva creada correctamente",
            "estado": reserva.estado,  # <- 'pendiente' o 'confirmada'
            "habitacion": habitacion.nombre,
            "fecha_entrada": reserva.entrada.isoformat(),
            "fecha_salida": reserva.salida.isoformat(),
            "total": total,
            "codigoQR": reserva.codigo_qr,
            "pago": pago_info,
        })

    except Habitacion.DoesNotExist:
        return JsonResponse({"success": False, "error": "Habitación no encontrada"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)
    
   
CANCEL_MIN_HOURS = 48
ESTADOS_CANCELABLES = {"pendiente", "pagada", "confirmada"}



@csrf_exempt
def cancelar_reserva(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    try:
        payload = json.loads(request.body.decode('utf-8'))
        rid = payload.get('id')
        email = payload.get('email')
        if not rid or not email:
            return JsonResponse({'success': False, 'error': 'Faltan datos'}, status=400)

        # ⬇️ usa el email del usuario relacionado por la FK id_usuario
        reserva = (Reserva.objects
                   .select_related('id_usuario')
                   .get(id=rid, id_usuario__email=email))

        estado = (reserva.estado or '').lower()
        if estado not in ESTADOS_CANCELABLES:
            return JsonResponse({'success': False, 'error': 'El estado no permite cancelación'}, status=400)

        if not reserva.entrada:
            return JsonResponse({'success': False, 'error': 'Fecha de entrada inválida'}, status=400)

        ahora = timezone.now()
        diff_hours = (reserva.entrada - ahora).total_seconds() / 3600.0
        if diff_hours < CANCEL_MIN_HOURS:
            return JsonResponse(
                {'success': False,
                 'error': f'No se puede cancelar a menos de {CANCEL_MIN_HOURS} horas de la entrada'},
                status=400
            )

        # (Opcional) reembolso según antelación
        refund = 1.0 if diff_hours >= 24*7 else (0.5 if diff_hours >= CANCEL_MIN_HOURS else 0.0)

        reserva.estado = 'cancelada'
        reserva.save(update_fields=['estado'])

        return JsonResponse({'success': True, 'estado': 'cancelada', 'refund_percent': int(refund*100)})

    except Reserva.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Reserva no encontrada o no pertenece al usuario'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

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


@csrf_exempt
def pagar_reserva(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Método no permitido"}, status=405)
    try:
        payload = json.loads(request.body.decode("utf-8"))
        rid = payload.get("id")
        email = payload.get("email")
        metodo = payload.get("metodoPago") or "webpay"

        if not rid or not email:
            return JsonResponse({"success": False, "error": "Faltan datos"}, status=400)

        # Validar propiedad de la reserva por email del usuario
        reserva = (Reserva.objects
                   .select_related("id_usuario")
                   .get(id=rid, id_usuario__email=email))

        if (reserva.estado or "").lower() != "pendiente":
            return JsonResponse({"success": False, "error": "La reserva no está pendiente"}, status=400)

        # aquí iría la integración real con WebPay/TPV...
        # Simulación de aprobación:
        id_tx = f"TX-{uuid4()}"
        Pagos.objects.create(
            id_reserva=reserva,
            monto=reserva.monto_total,
            metodo_de_pago=metodo,
            id_transaccion=id_tx,
            estado="aprobado",      # o "capturado"
        )

        reserva.estado = "confirmada"
        reserva.save(update_fields=["estado"])

        return JsonResponse({"success": True, "estado": "confirmada", "id_transaccion": id_tx})
    except Reserva.DoesNotExist:
        return JsonResponse({"success": False, "error": "Reserva no encontrada o no pertenece al usuario"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)