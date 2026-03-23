// Variables globales
let words = [];         // Lista de palabras del texto
let currentIndex = 0;   // Índice de la palabra actual
let intervalId = null;  // Para controlar la animación
let isPaused = false;

// Referencias a elementos HTML
const textoInput = document.getElementById("textoInput");
const palabraCentral = document.getElementById("palabraCentral");
const wordListDiv = document.getElementById("wordList");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const velocidadInput = document.getElementById("velocidad");
const fileInput = document.getElementById("fileInput");
// const textoInput = document.getElementById("textoInput");

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        textoInput.value = reader.result;
    };
    reader.readAsText(file);
});

// Función para dividir el texto en palabras
function procesarTexto() {
  const texto = textoInput.value.trim();
  if (!texto) return;
  words = texto.split(/\s+/); // Divide por espacios
  currentIndex = 0;
  mostrarWordList();
}

// Función para mostrar la palabra central con letra roja
function mostrarPalabra(index) {
  const palabra = words[index];
  if (!palabra) return;

  const mitad = Math.floor(palabra.length / 2);
  // Construye la palabra con la letra central en rojo
  const resultado = palabra.slice(0, mitad) +
                    `<span class="red-letter">${palabra[mitad]}</span>` +
                    palabra.slice(mitad + 1);
  palabraCentral.innerHTML = resultado;
}

// Mostrar todas las palabras a la izquierda
function mostrarWordList() {
  wordListDiv.innerHTML = "";
  words.forEach((w, i) => {
    const span = document.createElement("span");
    span.textContent = w + " ";
    span.style.cursor = "pointer";
    span.addEventListener("click", () => {
      currentIndex = i;
      mostrarPalabra(currentIndex);
    });
    wordListDiv.appendChild(span);
  });
}

// Función para iniciar el desplazamiento de palabras
function iniciar() {
  procesarTexto();
  if (intervalId) clearInterval(intervalId);

  intervalId = setInterval(() => {
    if (!isPaused) {
      mostrarPalabra(currentIndex);
      currentIndex++;
      if (currentIndex >= words.length) {
        currentIndex = 0; // Vuelve al inicio
      }
    }
  }, parseInt(velocidadInput.value));
}

// Pausar y reanudar
pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Reanudar" : "Pausar";
});

// Detener
stopBtn.addEventListener("click", () => {
  clearInterval(intervalId);
  currentIndex = 0;
  palabraCentral.innerHTML = "";
});

// Botón iniciar
startBtn.addEventListener("click", iniciar);

