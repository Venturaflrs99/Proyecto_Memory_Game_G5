from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('login/', views.login_view, name='login'),
    path('login-procesar/', views.login_procesar, name='login_procesar'),
    path('registro-procesar/', views.registro_procesar, name='registro_procesar'),
    path('logout/', views.logout_view, name='logout'),
    path('nivel/', views.nivel_view, name='nivel'),
    path('juego/', views.index, name='index'),
    path('estadisticas/', views.estadisticas_view, name='estadisticas'), 
    path('api/nuevo-juego/', views.nuevo_juego, name='nuevo_juego'),
    path('api/hacer-movimiento/', views.hacer_movimiento, name='hacer_movimiento'),
]