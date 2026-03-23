class JuegoMemoria {
constructor() {
this.tablero = document.getElementById('tablero');
this.puntuacionElement = document.getElementById('puntuacion');
this.movimientosElement = document.getElementById('movimientos');
this.intentosElement = document.getElementById('intentos');
this.tiempoElement = document.getElementById('tiempo');
this.btnNuevoJuego = document.getElementById('btnNuevoJuego');
        
    
const urlParams = new URLSearchParams(window.location.search);
this.nivel = urlParams.get('nivel') || 'basico';
        
this.cartas = [];
this.cartasVolteadas = [];
this.paresEncontrados = 0;
this.totalPares = 8;
this.idSesion = this.generarIdSesion();
this.puedeVoltear = true;
this.intentosRestantes = 0;
this.tiempoRestante = 60;
this.temporizador = null;
this.juegoTerminado = false;
this.vistaPrevia = false;
        

this.inicializarSonidos();
        
this.iniciar();
}
    
inicializarSonidos() {

this.sonidos = {
musicaFondo: new Audio(),
gameOver: new Audio('/static/juego/audios/game_over.mpeg'),
victoria: new Audio('/static/juego/audios/victoria.mpeg')
};
        
let musicaPath = '';
switch(this.nivel) {
case 'basico':
musicaPath = '/static/juego/audios/musica_basico.mpeg';
break;
case 'medio':
musicaPath = '/static/juego/audios/musica_medio.mpeg';
break;
case 'avanzado':
musicaPath = '/static/juego/audios/musica_avanzado.mpeg';
break;
}
        
this.sonidos.musicaFondo.src = musicaPath;
this.sonidos.musicaFondo.loop = true;
this.sonidos.musicaFondo.volume = 0.5;
        
this.sonidos.gameOver.volume = 0.7;
this.sonidos.victoria.volume = 0.7;
}
    
detenerMusica() {
if (this.sonidos && this.sonidos.musicaFondo) {
this.sonidos.musicaFondo.pause();
this.sonidos.musicaFondo.currentTime = 0;
}
}
    
reproducirMusica() {

this.sonidos.musicaFondo.play().catch(error => {
console.log('Autoplay bloqueado por el navegador. Intentando con interacción del usuario');

this.configurarReproduccionPorInteraccion();
});
}
    
configurarReproduccionPorInteraccion() {

const iniciarMusica = () => {
this.sonidos.musicaFondo.play().catch(e => console.log('Error al reproducir musica:', e));
document.removeEventListener('click', iniciarMusica);
document.removeEventListener('touchstart', iniciarMusica);
};
        
document.addEventListener('click', iniciarMusica);
document.addEventListener('touchstart', iniciarMusica);
}
    
generarIdSesion() {
return 'sesion_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
    
async iniciar() {
this.btnNuevoJuego.addEventListener('click', () => this.empezarNuevoJuego());
await this.empezarNuevoJuego();
}
    
detenerTemporizador() {
if (this.temporizador) {
clearInterval(this.temporizador);
this.temporizador = null;
}
}
    
iniciarTemporizador() {
this.detenerTemporizador();
this.temporizador = setInterval(() => {
if (this.juegoTerminado || this.vistaPrevia) {
return;
}
            
this.tiempoRestante--;
this.actualizarTiempo();
            
if (this.tiempoRestante <= 0) {
this.detenerTemporizador();
this.tiempoRestante = 0;
this.actualizarTiempo();
this.juegoTerminado = true;
this.puedeVoltear = false;
this.detenerMusica();
this.sonidos.gameOver.play();
alert('¡SE ACABO EL TIEMPO!');
setTimeout(() => {
window.location.href = '/estadisticas/';
}, 2000);
}
}, 1000);
    }
    
async empezarNuevoJuego() {
this.idSesion = this.generarIdSesion();
this.cartasVolteadas = [];
this.paresEncontrados = 0;
this.puedeVoltear = false;
this.juegoTerminado = false;
this.vistaPrevia = true;
this.detenerTemporizador();
this.detenerMusica();
        
try {
const formData = new FormData();
formData.append('id_sesion', this.idSesion);
formData.append('nivel', this.nivel);
            
const respuesta = await fetch('/api/nuevo-juego/', {
method: 'POST',
body: formData
});
            
const datos = await respuesta.json();
this.cartas = datos.tablero;
this.intentosRestantes = datos.intentos;
this.tiempoRestante = datos.tiempo_restante || 60;
            
this.inicializarSonidos();
            
this.actualizarPuntuacion(datos.puntuacion);
this.actualizarMovimientos(datos.movimientos);
this.actualizarIntentos();
this.actualizarTiempo();
this.dibujarTablero();
            

this.reproducirMusica();
            

this.mostrarVistaPrevia();
            
} catch (error) {
console.error('Error al iniciar nuevo juego:', error);
}
}
    
mostrarVistaPrevia() {
console.log('Mostrando vista previa por 5 segundos');
        
   
for (let i = 0; i < this.cartas.length; i++) {
const carta = this.tablero.children[i];
if (carta) {
carta.classList.add('volteada');
}
}
        
setTimeout(() => {
for (let i = 0; i < this.cartas.length; i++) {
const carta = this.tablero.children[i];
if (carta) {
carta.classList.remove('volteada');
}
}
            
this.vistaPrevia = false;
this.puedeVoltear = true;
this.iniciarTemporizador();
console.log('Vista previa terminada');
            
}, 5000);
}
    
dibujarTablero() {
this.tablero.innerHTML = '';
        
this.cartas.forEach((nombreImagen, indice) => {
const elementoCarta = document.createElement('div');
elementoCarta.className = 'carta';
elementoCarta.dataset.indice = indice;
            
const img = document.createElement('img');
const rutaCompleta = `/static/juego/imagenes/${nombreImagen}`;
            
img.src = rutaCompleta;
img.alt = 'carta';
img.style.width = '100%';
img.style.height = '100%';
img.style.objectFit = 'cover';
            
elementoCarta.appendChild(img);
elementoCarta.addEventListener('click', () => this.manejarClickCarta(indice));
this.tablero.appendChild(elementoCarta);
});
}
    
async manejarClickCarta(indice) {
if (this.vistaPrevia) {
alert('Espere 5 segundos para memorizar las cartas');
return;
}
        
if (!this.puedeVoltear || this.juegoTerminado) return;
if (this.intentosRestantes <= 0) {
alert('¡No quedan mas intentos!');
return;
}
if (this.tiempoRestante <= 0) {
alert('¡Se acabo el tiempo!');
return;
}
        
const elementoCarta = this.tablero.children[indice];
        
if (elementoCarta.classList.contains('volteada') || 
elementoCarta.classList.contains('encontrada')) {
return;
}
        
if (this.cartasVolteadas.length >= 2) return;
        
elementoCarta.classList.add('volteada');
this.cartasVolteadas.push(indice);
        
if (this.cartasVolteadas.length === 2) {
this.puedeVoltear = false;
await this.verificarCoincidencia();
}
}
    
async verificarCoincidencia() {
const [indice1, indice2] = this.cartasVolteadas;
        
try {
const respuesta = await fetch('/api/hacer-movimiento/', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
id_sesion: this.idSesion,
indice1: indice1,
indice2: indice2
})
});
            
const datos = await respuesta.json();
            
if (datos.error === 'tiempo') {
this.juegoTerminado = true;
this.puedeVoltear = false;
this.detenerTemporizador();
this.detenerMusica();
this.sonidos.gameOver.play();
alert(datos.mensaje);
setTimeout(() => {
window.location.href = '/estadisticas/';
}, 2000);
return;
}
            
this.actualizarPuntuacion(datos.puntuacion);
this.actualizarMovimientos(datos.movimientos);
this.intentosRestantes = datos.intentos;
this.actualizarIntentos();
            
if (datos.tiempo_restante !== undefined) {
this.tiempoRestante = datos.tiempo_restante;
this.actualizarTiempo();
}
            
if (datos.coincidencia) {
this.tablero.children[indice1].classList.add('encontrada');
this.tablero.children[indice2].classList.add('encontrada');
this.paresEncontrados++;
                
if (this.paresEncontrados === this.totalPares) {
this.juegoTerminado = true;
this.detenerTemporizador();
this.detenerMusica();
this.sonidos.victoria.play();
setTimeout(() => {
alert('¡FELICIDADES! HAS GANADO EL JUEGO');
setTimeout(() => {
window.location.href = '/estadisticas/';
}, 1500);
}, 500);
return;
}
                
setTimeout(() => {
this.cartasVolteadas = [];
this.puedeVoltear = true;
}, 500);
                
} else {
setTimeout(() => {
this.tablero.children[indice1].classList.remove('volteada');
this.tablero.children[indice2].classList.remove('volteada');
                    
this.cartasVolteadas = [];
this.puedeVoltear = true;
                    
if (this.intentosRestantes <= 0 && this.paresEncontrados < this.totalPares) {
this.juegoTerminado = true;
this.detenerTemporizador();
this.detenerMusica();
this.puedeVoltear = false;
this.sonidos.gameOver.play();
alert('GAME OVER - No hay mas intentos');
setTimeout(() => {
window.location.href = '/estadisticas/';
}, 2000);
}
}, 1000);
}
            
} catch (error) {
console.error('Error al verificar coincidencia:', error);
this.cartasVolteadas = [];
this.puedeVoltear = true;
}
}
    
actualizarTiempo() {
if (this.tiempoElement) {
this.tiempoElement.textContent = this.tiempoRestante;
            
this.tiempoElement.classList.remove('advertencia', 'peligro');
            
if (this.tiempoRestante <= 10) {
this.tiempoElement.classList.add('peligro');
} else if (this.tiempoRestante <= 20) {
this.tiempoElement.classList.add('advertencia');
}
}
}
    
actualizarPuntuacion(puntuacion) {
this.puntuacionElement.textContent = puntuacion;
}
    
actualizarMovimientos(movimientos) {
this.movimientosElement.textContent = movimientos;
}
    
actualizarIntentos() {
if (this.intentosElement) {
this.intentosElement.textContent = this.intentosRestantes;
            
this.intentosElement.style.color = '';
this.intentosElement.style.textShadow = '';
            
if (this.intentosRestantes <= 1) {
this.intentosElement.style.color = '#ff0000';
this.intentosElement.style.textShadow = '0 0 10px red';
this.intentosElement.style.fontWeight = 'bold';
} else if (this.intentosRestantes <= 2) {
this.intentosElement.style.color = '#ff9900';
this.intentosElement.style.textShadow = '0 0 5px orange';
}
}
}
}

document.addEventListener('DOMContentLoaded', () => {
new JuegoMemoria();
});