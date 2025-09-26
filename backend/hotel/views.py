from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse

from .models import Usuario, Rol
from .forms import UsuarioForm

# Create your views here.
@api_view(['POST'])
def registro(request):
    try:
        data = request.data

        if Usuario.objects.filter(email=data['email']).exists():
            return JsonResponse({"valido": False})

        nuevo_usuario = Usuario(
            email = data['email'],
            contrasena = data['contrasena'],
            nombre = data['nombre'],
            telefono = data['telefono'],
            rol_id=Rol.objects.get(id='1')
        )

        print(data['email'])
       
        nuevo_usuario.save()

        print(data['email'])

        return JsonResponse({
            "valido": True
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    

@api_view(['POST'])
def login(request):
    try:
        data = request.data

        credencial = Usuario.objects.get(email=data['email'])

        if credencial.contrasena == data['contrasena']:
            return JsonResponse({
            "valido": True
            })
        else:
            return JsonResponse({
            "valido": False
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)