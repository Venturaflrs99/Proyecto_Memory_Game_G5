import json
import random
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Avg, Count

class SesionJuego(models.Model):
    id_sesion = models.CharField(max_length=100, unique=True)
    puntuacion = models.IntegerField(default=0)
    movimientos = models.IntegerField(default=0)
    intentos_restantes = models.IntegerField(default=6)
    nivel = models.CharField(max_length=20, default='basico')
    estado_tablero = models.TextField(default='[]')
    creado_en = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    tiempo_inicio = models.DateTimeField(default=timezone.now)
    tiempo_fin = models.DateTimeField(null=True, blank=True)
    resultado = models.CharField(max_length=20, null=True, blank=True)
    
    def guardar_tablero(self, tablero):
        self.estado_tablero = json.dumps(tablero)
    
    def obtener_tablero(self):
        return json.loads(self.estado_tablero)
    
    def tiempo_restante(self):
        if self.tiempo_fin:
            return 0
        tiempo_transcurrido = (timezone.now() - self.tiempo_inicio).seconds
        return max(0, 60 - tiempo_transcurrido)
    
    def duracion_partida(self):
        if self.tiempo_fin:
            return (self.tiempo_fin - self.tiempo_inicio).seconds
        return 0

class EstadisticasJugador(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='estadisticas')
    total_victorias = models.IntegerField(default=0)
    total_derrotas = models.IntegerField(default=0)
    total_partidas = models.IntegerField(default=0)
    tiempo_total = models.IntegerField(default=0)
    nivel_basico_jugado = models.IntegerField(default=0)
    nivel_medio_jugado = models.IntegerField(default=0)
    nivel_avanzado_jugado = models.IntegerField(default=0)
    
    def actualizar_estadisticas(self, partida):
        self.total_partidas += 1
        
        if partida.resultado == 'victoria':
            self.total_victorias += 1
        elif partida.resultado == 'derrota':
            self.total_derrotas += 1
        
        duracion = partida.duracion_partida()
        self.tiempo_total += duracion
        
        if partida.nivel == 'basico':
            self.nivel_basico_jugado += 1
        elif partida.nivel == 'medio':
            self.nivel_medio_jugado += 1
        elif partida.nivel == 'avanzado':
            self.nivel_avanzado_jugado += 1
        
        self.save()
    
    def promedio_tiempo(self):
        if self.total_partidas == 0:
            return 0
        return round(self.tiempo_total / self.total_partidas, 2)
    
    def nivel_mas_jugado(self):
        niveles = {
            'basico': self.nivel_basico_jugado,
            'medio': self.nivel_medio_jugado,
            'avanzado': self.nivel_avanzado_jugado
        }
        if max(niveles.values()) == 0:
            return 'Ninguno'
        return max(niveles, key=niveles.get).capitalize()
    
    def win_rate(self):
        if self.total_partidas == 0:
            return 0
        return round((self.total_victorias / self.total_partidas) * 100, 2)