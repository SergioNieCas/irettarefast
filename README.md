# IrettareFast

## Descripción
IrettareFast es un lector de palabras por lotes (spritz-like) implementado en HTML/CSS/JS puro. Permite cargar texto desde `.txt`, `.epub`, `.pdf`, o pegar texto manualmente. La app muestra una palabra a la vez en el panel principal, con una letra central destacada. En el panel derecho se muestra la lista de palabras y se resalta la palabra activa, lo que facilita seguir el flujo de lectura.

## Características principales
- Carga de texto desde archivos:
  - `.txt` (nativo)
  - `.epub` (usando EPUB.js)
  - `.pdf` (opcional, usando PDF.js)
- Modo de lectura rápida con palabra única central y salto temporal.
- Panel de lista dinámica con la palabra activa resaltada.
- Ajustes en tiempo real:
  - Velocidad (ms) se modifica en vivo sin reiniciar.
  - Tamaño de fuente central.
  - Toggle de negrita roja para la letra central.
  - Toggle de línea vertical central de referencia.
- Animaciones y posicionamiento:
  - palabra central está centrada horizontalmente respecto a la letra pivote.
  - línea roja tiene interrupción alrededor del pivote (5px aprox) para no atravesar palabra.

## Cómo usar
1. Abrir `index.html` en un navegador moderno (recomendado: Chrome o Edge).
2. Cargar un archivo (o pegar el texto en el área `textarea`).
3. Ajustar controles:
   - `Lentitud (ms)` (velocidad)
   - `Tamaño (px)` (fuente central)
   - `Negrita roja` (favorita la letra intracéntrica roja)
   - `Línea central` (mostrar/ocultar referencia del centro)
4. Presionar `Iniciar` para comenzar.
5. `Pausar`/`Reanudar` y `Detener`.
6. Seleccionar palabras en el panel derecho para saltar directamente.

## Estructura de archivos
- `index.html`: interfaz y estructura principal.
- `style.css`: estilos, layout y animaciones.
- `script.js`: lógica de carga, lectura, controles y render.
- `sample.txt`: ejemplo de prueba rápida.

## Changelog (versión 0.4)
### Nuevo en 0.4
- Resaltado de palabra activa en el `wordList` (panel derecho) con clase `.active`.
- Formateo de `wordList` legible (flex-wrap, gap, scroll, líneas y fondo).
- Letras central con pivote fijo: la letra roja se mantiene en el mismo punto de pantalla.
- Toggle `Negrita roja` para elegir si la pivote es color/ bold o normal.
- Toggle `Línea central` para activar/desactivar línea vertical.
- Línea central con interrupción en el centro (no cruza la palabra) usando `::before` y `::after`.
- Campo adicional `Tamaño (px)` con cambio en vivo.
- Botones `Iniciar`, `Pausar`, `Detener` nivelados en el mismo ancho con `flex:1` y botón en nueva fila.
- Velocidad (`Lentitud`) ahora se aplica en vivo con `input` sin reiniciar.
- Mejoras generales de UX (estilo oscuro, interfaz compacta, padding, etc.).

## Notas de integración
- Si la lectura no arranca, verificar que hay texto en el `textarea`.
- Si al cargar EPUB/PDF se tarda, esperar que termine el procesamiento.
- Sin Node en terminal, la verificación de sintaxis se hace en navegador.

---

## Licencia
Proyecto propio, libre para modificar.
