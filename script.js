// Variables globales
let words = [];         // Lista de palabras del texto
let currentIndex = 0;   // Índice de la palabra actual
let intervalId = null;  // Para controlar la animación
let isPaused = false;
let isRunning = false;

// Referencias a elementos HTML
const textoInput = document.getElementById("textoInput");
const palabraCentral = document.getElementById("palabraCentral");
const wordListDiv = document.getElementById("wordList");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const velocidadInput = document.getElementById("velocidad");
const fontSizeInput = document.getElementById("fontSize");
const toggleBold = document.getElementById("toggleBold");
const toggleLine = document.getElementById("toggleLine");
const fileInput = document.getElementById("fileInput");
let wordSpans = [];
const customButton = document.getElementById("customButton");
const fileName = document.getElementById("fileName");
const formatoInfo = document.getElementById("formatoInfo");

// Función para leer archivos TXT
function leerTXT(file) {
    const reader = new FileReader();
    reader.onload = () => {
        textoInput.value = reader.result;
        formatoInfo.textContent = "✓ TXT cargado";
    };
    reader.readAsText(file);
}

// Función para leer archivos EPUB
async function leerEPUB(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const book = ePub(arrayBuffer);
        
        await book.ready;

        // Obtener el contenido completo del libro
        let contenidoCompleto = "";
        
        // Iterar sobre todos los ítems en el spine del libro
        for (let item of book.spine.spineItems) {
            try {
                const html = await item.load(book.load.bind(book));
                const contenido = await item.render();
                
                if (contenido) {
                    // Crear un elemento temporal para parsear el HTML
                    const temp = document.createElement("div");
                    temp.innerHTML = contenido;
                    
                    // Extraer solo el texto, eliminando etiquetas
                    const texto = temp.innerText || temp.textContent;
                    contenidoCompleto += texto + " ";
                }
            } catch (e) {
                console.warn("Error al procesar sección del EPUB:", e);
            }
        }

        textoInput.value = contenidoCompleto.trim();
        formatoInfo.textContent = `✓ EPUB cargado (${Math.round(contenidoCompleto.length / 1000)}KB)`;
    } catch (error) {
        throw new Error("Error al leer EPUB: " + error.message);
    }
}

// Función para leer archivos PDF (opcional, requiere PDF.js)
async function leerPDF(file) {
    // Cargar PDF.js desde CDN si no está disponible
    if (typeof pdfjsLib === 'undefined') {
        await cargarPDF_js();
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let contenidoCompleto = "";

        for (let numPagina = 1; numPagina <= pdf.numPages; numPagina++) {
            const pagina = await pdf.getPage(numPagina);
            const contenido = await pagina.getTextContent();
            const textos = contenido.items.map(item => item.str).join(" ");
            contenidoCompleto += textos + " ";
        }

        textoInput.value = contenidoCompleto.trim();
        formatoInfo.textContent = `✓ PDF cargado (${pdf.numPages} páginas)`;
    } catch (error) {
        throw new Error("Error al leer PDF: " + error.message);
    }
}

// Cargar PDF.js desde CDN
async function cargarPDF_js() {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Cuando se hace click en el botón, se abre el selector real
customButton.addEventListener("click", () => fileInput.click());

// Manejar diferentes tipos de archivo
fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    fileName.textContent = file.name;
    formatoInfo.textContent = "Procesando...";

    try {
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (extension === "txt") {
            leerTXT(file);
        } else if (extension === "epub") {
            await leerEPUB(file);
        } else if (extension === "pdf") {
            await leerPDF(file);
        } else {
            formatoInfo.textContent = "Formato no soportado";
        }
    } catch (error) {
        console.error("Error al procesar archivo:", error);
        formatoInfo.textContent = `Error: ${error.message}`;
    }
});

// Función para dividir el texto en palabras
function procesarTexto() {
  const texto = textoInput.value.trim();
  if (!texto) return;

  words = texto.split(/\s+/); // Divide por espacios
  currentIndex = 0;
  mostrarWordList();
  if (words.length > 0) {
    mostrarPalabra(currentIndex);
  }
}

function actualizarWordListActive(index) {
  wordSpans.forEach((span, i) => {
    span.classList.toggle("active", i === index);
  });
}

// Función para mostrar la palabra central con letra roja
function mostrarPalabra(index) {
  const palabra = words[index];
  if (!palabra) return;

  const mitad = Math.floor(palabra.length / 2);
  const pre = palabra.slice(0, mitad);
  const pivot = palabra[mitad] || "";
  const post = palabra.slice(mitad + 1);

  palabraCentral.innerHTML =
    `<span class="pre">${pre}</span>` +
    `<span class="pivot red-letter${toggleBold.checked ? " bold" : ""}">${pivot}</span>` +
    `<span class="post">${post}</span>`;

  palabraCentral.style.fontSize = `${fontSizeInput.value}px`;

  // Ajustar hueco de la línea central para no tocar la letra
  const gap = Math.max(30, parseFloat(fontSizeInput.value) * 1.8);
  document.querySelector('.display').style.setProperty('--line-gap', `${gap}px`);

  actualizarWordListActive(index);

  const activeSpan = wordListDiv.querySelector(`[data-index="${index}"]`);

  if (toggleLine.checked) {
    document.querySelector('.display').classList.add('line-visible');
  } else {
    document.querySelector('.display').classList.remove('line-visible');
  }
  if (activeSpan) {
    activeSpan.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }

  // Mantener la letra roja en el mismo punto (centro horizontal del contenedor)
  const preSpan = palabraCentral.querySelector(".pre");
  const pivotSpan = palabraCentral.querySelector(".pivot");

  const preWidth = preSpan ? preSpan.offsetWidth : 0;
  const pivotWidth = pivotSpan ? pivotSpan.offsetWidth : 0;

  palabraCentral.style.position = "absolute";
  palabraCentral.style.left = `calc(50% - ${preWidth + pivotWidth / 2}px)`;
  palabraCentral.style.top = "50%";
  palabraCentral.style.transform = "translateY(-50%)";
}

// Mostrar todas las palabras a la izquierda
function mostrarWordList() {
  wordListDiv.innerHTML = "";
  wordSpans = [];

  words.forEach((w, i) => {
    const span = document.createElement("span");
    span.textContent = w;
    span.dataset.index = i;
    span.addEventListener("click", () => {
      currentIndex = i;
      mostrarPalabra(currentIndex);
    });
    wordListDiv.appendChild(span);
    wordSpans.push(span);
  });

  actualizarWordListActive(currentIndex);
}

function crearIntervalo() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(() => {
    if (!isPaused && words.length > 0) {
      mostrarPalabra(currentIndex);
      currentIndex++;
      if (currentIndex >= words.length) {
        currentIndex = 0;
      }
    }
  }, parseInt(velocidadInput.value, 10));
}

// Función para iniciar el desplazamiento de palabras
function iniciar() {
  procesarTexto();
  if (!words.length) {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    return;
  }

  crearIntervalo();
  isRunning = true;
}

// Pausar y reanudar
pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Reanudar" : "Pausar";
});

// Detener
stopBtn.addEventListener("click", () => {
  clearInterval(intervalId);
  intervalId = null;
  isRunning = false;
  isPaused = false;
  currentIndex = 0;
  palabraCentral.innerHTML = "";
  wordSpans.forEach(span => span.classList.remove("active"));
});

// Ajuste de tamaño de fuente central
fontSizeInput.addEventListener("input", () => {
  palabraCentral.style.fontSize = `${fontSizeInput.value}px`;
  if (words.length > 0) {
    mostrarPalabra(currentIndex);
  }
});

// Ajuste de velocidad en vivo
velocidadInput.addEventListener("input", () => {
  if (isRunning && intervalId) {
    crearIntervalo();
  }
});

// Toggle negrita de letra roja
toggleBold.addEventListener("change", () => {
  if (words.length > 0) {
    mostrarPalabra(currentIndex);
  }
});

// Toggle línea central
toggleLine.addEventListener("change", () => {
  const display = document.querySelector('.display');
  if (toggleLine.checked) {
    display.classList.add('line-visible');
  } else {
    display.classList.remove('line-visible');
  }
});

// Botón iniciar
startBtn.addEventListener("click", iniciar);

