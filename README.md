# Memory Game 🎮

Juego de memoria interactivo desarrollado con Django.

## Características

- 🎯 Tres niveles de dificultad (Básico, Medio, Avanzado)
- 🎵 Efectos de sonido y música de fondo
- 📊 Sistema de estadísticas de jugador
- 👤 Autenticación de usuarios
- ⏱️ Control de tiempo y intentos
- 📱 Interfaz responsiva

## Requisitos

### Opción 1: Instalación Local
- Python 3.9+
- pip

### Opción 2: Docker
- Docker Desktop
- Docker Compose

## Instalación

### Local

1. **Clonar repositorio**
```bash
git clone https://github.com/Venturaflrs99/Proyecto_Memory_Game_G5.git
cd Proyecto_Memory_Game_G5
```

2. **Crear entorno virtual**
```bash
python -m venv venv
venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Migraciones**
```bash
python manage.py migrate
```

5. **Ejecutar servidor**
```bash
python manage.py runserver
```

Accede a: `http://localhost:8000`

### Ejecutar en Docker

1. **Construir imagen**
```bash
docker-compose build
```

2. **Ejecutar contenedor**
```bash
docker-compose up
```

Accede a: `http://localhost:8000`


## Uso

1. Registrate o inicia sesión
2. Selecciona un nivel de dificultad
3. Observa los pares de cartas
4. Emparejalas en el menor tiempo posible
5. Revisa tus estadísticas

## Autores - Grupo 5 - Arquitectura de Computadoras
- Hector Josue Nuñez Perdomo - 202320120070 
- Pedro Joaquin Bustillo Ochoa - 202310110004 
- Jose Antonio Baca Hernandez - 202310110073 
- Diego Alejandro Galo Martínez - 202310110442 
- Bellymar Celeste Amaya Andino - 201820010372 
- Josue Daniel Ventura Flores - 202220120030 
- Manuel Antonio Coto Tenorio - 201710120028
