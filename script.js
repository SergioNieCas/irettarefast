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

