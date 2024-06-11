const canvas = document.getElementById("mandelbrot-canvas");
const ctx = canvas.getContext("2d");
const reset = document.getElementById("reset");

let zoom = 0.5;
let initialZoom = 0.5;
let offsetX = -0.5;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

function calculateIterations(zoom) {
  if (Math.floor(114 + 20 * Math.log(zoom)) >= 100) {
    return Math.floor(114 + 20 * Math.log(zoom));
  } else {
    return 100;
  }
}

function drawMandelbrot() {
  // Ponavljanja funkcije bazirana na nivou zuma
  const maxIterations = calculateIterations(zoom);

  // Kanvas zauzima lijevi dio ekrana (oblik kocke)
  const canvasSize = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  // Objekat prazne slike
  const imageData = ctx.createImageData(canvasSize, canvasSize);
  const data = imageData.data;

  // Prolazi kroz svaki piksel na kanvasu
  for (let x = 0; x < canvasSize; x++) {
    for (let y = 0; y < canvasSize; y++) {
      // Koordinate piksela se stavljaju u složenu ravan
      let a = (x - canvasSize / 2) / (0.5 * zoom * canvasSize) + offsetX;
      let b = (y - canvasSize / 2) / (0.5 * zoom * canvasSize) + offsetY;

      let ca = a;
      let cb = b;
      let n = 0;

      // Ponavljanje do situacije "bježanja" ili maksimalnih ponavljanja
      while (n < maxIterations) {
        const aa = a * a - b * b;
        const bb = 2 * a * b;

        a = aa + ca;
        b = bb + cb;

        // Da li je tačka izvan radiusa "bježanja"
        if (Math.abs(a + b) > 16) {
          break;
        }

        n++;
      }

      // Svijetlost se računa na osnovu ponavljanja
      const bright = (n / maxIterations) * 255;
      const pixelIndex = (y * canvasSize + x) * 4;

      // Stavlja boju u imageData
      data[pixelIndex] = bright; // r
      data[pixelIndex + 1] = bright; // g
      data[pixelIndex + 2] = bright; // b
      data[pixelIndex + 3] = 255; // a
    }
  }

  // Stavljanje slike na kanvas
  ctx.putImageData(imageData, 0, 0);
  document.getElementById("iter").innerHTML = calculateIterations(zoom);
}

function zoomMandelbrot(event) {
  // Zum po pomjeranju točkića
  const zoomFactor = 1.5;

  // Pozicija miša na kanvasu
  const cursorX = event.clientX - canvas.getBoundingClientRect().left;
  const cursorY = event.clientY - canvas.getBoundingClientRect().top;

  // Da li je miš na kanvasu
  if (
    cursorX >= 0 &&
    cursorX <= canvas.width &&
    cursorY >= 0 &&
    cursorY <= canvas.height
  ) {
    // Offset računat po poziciji miša i trenutnog zuma
    offsetX = (cursorX / canvas.width - 0.5) / zoom + offsetX;
    offsetY = (cursorY / canvas.height - 0.5) / zoom + offsetY;

    // Zum se računa zaviseći od smjera točkića
    let newZoom;
    if (event.deltaY < 0) {
      newZoom = zoom * zoomFactor; // Zoom in
    } else {
      newZoom = zoom / zoomFactor; // Zoom out
    }

    // Razlika zuma
    const newZoomDifference = newZoom / initialZoom;

    // Granica
    if (newZoomDifference <= 1e12) {
      // Update the zoom level
      zoom = newZoom;

      // Trenutna zum razlika
      const currentZoomDifference = zoom / initialZoom;

      // Format the zoom level for display
      const zoomDisplay =
        currentZoomDifference > 1e9
          ? currentZoomDifference.toExponential() // Scientific notation if greater than 1e6
          : currentZoomDifference.toFixed(2); // Fixed to two decimal places otherwise

      document.getElementById("zoomlvl").innerHTML = zoomDisplay;

      // Ponovno crtanje skupa
      drawMandelbrot();
    } else {
      // Promjena boje na maksimalnom zumu
      document.getElementById("zoomlvl").style.color = "red";
      setTimeout(() => {
        document.getElementById("zoomlvl").style.color = "white";
      }, 500);
    }
  }
}

function startDragging(event) {
  isDragging = true;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
}

function handleDrag(event) {
  if (isDragging) {
    const dragX = event.clientX - dragStartX;
    const dragY = event.clientY - dragStartY;

    offsetX -= dragX / canvas.width / zoom;
    offsetY -= dragY / canvas.height / zoom;

    dragStartX = event.clientX;
    dragStartY = event.clientY;

    drawMandelbrot();
  }
}

function stopDragging() {
  isDragging = false;
}

function resetZoom() {
  zoom = 0.5;
  initialZoom = 0.5;
  offsetX = -0.5;
  offsetY = 0;
  dragStartX = 0;
  dragStartY = 0;

  drawMandelbrot();
}

function hideTutorial() {
  document.getElementById("opis").style.display = "none";
}

canvas.addEventListener("mousedown", startDragging);
canvas.addEventListener("mousedown", hideTutorial);
document.addEventListener("mousemove", handleDrag);
document.addEventListener("mouseup", stopDragging);
document.addEventListener("wheel", zoomMandelbrot);
canvas.addEventListener("wheel", hideTutorial);
reset.addEventListener("click", resetZoom);

// Prva slika skupa
drawMandelbrot();
