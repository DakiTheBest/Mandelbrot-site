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
  const maxIterations = calculateIterations(zoom);
  const canvasSize = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const imageData = ctx.createImageData(canvasSize, canvasSize);
  const data = imageData.data;

  for (let x = 0; x < canvasSize; x++) {
    for (let y = 0; y < canvasSize; y++) {
      let a = (x - canvasSize / 2) / (0.5 * zoom * canvasSize) + offsetX;
      let b = (y - canvasSize / 2) / (0.5 * zoom * canvasSize) + offsetY;

      let ca = a;
      let cb = b;
      let n = 0;

      while (n < maxIterations) {
        const aa = a * a - b * b;
        const bb = 2 * a * b;

        a = aa + ca;
        b = bb + cb;

        if (Math.abs(a + b) > 16) {
          break;
        }

        n++;
      }

      const bright = (n / maxIterations) * 255;
      const pixelIndex = (y * canvasSize + x) * 4;

      data[pixelIndex] = bright;
      data[pixelIndex + 1] = bright;
      data[pixelIndex + 2] = bright;
      data[pixelIndex + 3] = 255;
    }
  }

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

canvas.addEventListener("mousedown", startDragging);
reset.addEventListener("click", resetZoom);
document.addEventListener("mousemove", handleDrag);
document.addEventListener("mouseup", stopDragging);
document.addEventListener("wheel", zoomMandelbrot);

drawMandelbrot();
