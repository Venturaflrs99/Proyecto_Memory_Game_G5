import json
import random
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import SesionJuego, EstadisticasJugador

def login_view(request):
    return render(request, 'juego/login.html')

@csrf_exempt
def login_procesar(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True, 'message': 'Login exitoso'})
        else:
            return JsonResponse({'success': False, 'message': 'Usuario o contraseña incorrectos'})
    
    return JsonResponse({'success': False, 'message': 'Metodo no permitido'})

@csrf_exempt
def registro_procesar(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'message': 'El nombre de usuario ya existe'})
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'message': 'El correo electronico ya esta registrado'})
        
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        
        EstadisticasJugador.objects.create(usuario=user)
        
        login(request, user)
        
        return JsonResponse({'success': True, 'message': 'Registro exitoso'})
    
    return JsonResponse({'success': False, 'message': 'Metodo no permitido'})

def logout_view(request):
    logout(request)
    return redirect('login')

@login_required(login_url='/login/')
def nivel_view(request):
    return render(request, 'juego/nivel.html', {'usuario': request.user.username})

@login_required(login_url='/login/')
def index(request):
    nivel = request.GET.get('nivel', 'basico')
    return render(request, 'juego/index.html', {
        'usuario': request.user.username,
        'nivel': nivel
    })

@login_required(login_url='/login/')
def estadisticas_view(request):
    estadisticas, created = EstadisticasJugador.objects.get_or_create(usuario=request.user)
    return render(request, 'juego/estadisticas.html', {
        'usuario': request.user.username,
        'estadisticas': estadisticas
    })

@csrf_exempt
@login_required(login_url='/login/')
def nuevo_juego(request):
    if request.method == 'POST':
        nivel = request.POST.get('nivel', 'basico')
        
        intentos_por_nivel = {
            'basico': 6,
            'medio': 4,
            'avanzado': 2
        }
        intentos = intentos_por_nivel.get(nivel, 6)
        
        imagenes = [
            '1.jpg', '2.jpg', '3.jpg', '4.jpg',
            '5.jpg', '6.jpg', '7.jpg', '8.jpg'
        ] * 2
        random.shuffle(imagenes)
        
        sesion = SesionJuego.objects.create(
            id_sesion=request.POST.get('id_sesion', ''),
            estado_tablero=json.dumps(imagenes),
            usuario=request.user,
            nivel=nivel,
            intentos_restantes=intentos,
            tiempo_inicio=timezone.now()
        )
        
        return JsonResponse({
            'tablero': imagenes,
            'id_sesion': sesion.id_sesion,
            'puntuacion': sesion.puntuacion,
            'movimientos': sesion.movimientos,
            'intentos': sesion.intentos_restantes,
            'nivel': sesion.nivel,
            'usuario': request.user.username,
            'tiempo_restante': 60
        })

@csrf_exempt
@login_required(login_url='/login/')
def hacer_movimiento(request):
    if request.method == 'POST':
        datos = json.loads(request.body)
        id_sesion = datos.get('id_sesion')
        indice1 = datos.get('indice1')
        indice2 = datos.get('indice2')
        
        try:
            sesion = SesionJuego.objects.get(id_sesion=id_sesion, usuario=request.user)
            tablero = sesion.obtener_tablero()
            
          
            tiempo_restante = sesion.tiempo_restante()
            if tiempo_restante <= 0:
                sesion.tiempo_fin = timezone.now()
                sesion.resultado = 'derrota'
                sesion.save()
                
               
                estadisticas, _ = EstadisticasJugador.objects.get_or_create(usuario=request.user)
                estadisticas.actualizar_estadisticas(sesion)
                
                return JsonResponse({
                    'error': 'tiempo',
                    'mensaje': '¡Se acabo el tiempo!',
                    'tiempo_restante': 0
                })
            
            coincidencia = tablero[indice1] == tablero[indice2]
            
            if coincidencia:
                sesion.puntuacion += 10
            else:
                sesion.intentos_restantes -= 1
            
            sesion.movimientos += 1
            sesion.save()
            
          
            juego_terminado_por_intentos = sesion.intentos_restantes <= 0
            
            juego_ganado = False  
            
            if juego_terminado_por_intentos:
                sesion.tiempo_fin = timezone.now()
                sesion.resultado = 'derrota'
                sesion.save()
                
            
                estadisticas, _ = EstadisticasJugador.objects.get_or_create(usuario=request.user)
                estadisticas.actualizar_estadisticas(sesion)
            
            return JsonResponse({
                'coincidencia': coincidencia,
                'puntuacion': sesion.puntuacion,
                'movimientos': sesion.movimientos,
                'intentos': sesion.intentos_restantes,
                'juego_terminado': juego_terminado_por_intentos,
                'juego_ganado': juego_ganado,
                'tiempo_restante': sesion.tiempo_restante(),
                'carta1': tablero[indice1],
                'carta2': tablero[indice2]
            })
        except SesionJuego.DoesNotExist:
            return JsonResponse({'error': 'Sesion no encontrada'}, status=404)