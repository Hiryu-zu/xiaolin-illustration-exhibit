const fileInput = document.getElementById("fileInput");
const selectButton = document.getElementById("selectButton");
const dropArea = document.getElementById("dropArea");
const flipButton = document.getElementById("flipButton");
const compareButton = document.getElementById("compareButton");
const downloadButton = document.getElementById("downloadButton");
const resetButton = document.getElementById("resetButton");
const statusText = document.getElementById("status");
const canvasGrid = document.getElementById("canvasGrid");
const brushSizeInput = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");

const sourceCanvas = document.getElementById("sourceCanvas");
const resultCanvas = document.getElementById("resultCanvas");
const sourceCtx = sourceCanvas.getContext("2d");
const resultCtx = resultCanvas.getContext("2d", { willReadFrequently: true });

const originalBuffer = document.createElement("canvas");
const flippedBuffer = document.createElement("canvas");
const originalCtx = originalBuffer.getContext("2d");
const flippedCtx = flippedBuffer.getContext("2d");

let originalImage = null;
let originalFileName = "flipped-image";
let isFlipped = false;
let isCompareSingle = false;
let isPainting = false;
let brushSize = Number(brushSizeInput.value);

selectButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) loadImageFile(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropArea.classList.add("is-dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropArea.classList.remove("is-dragover");
  });
});

dropArea.addEventListener("drop", (event) => {
  const file = event.dataTransfer.files?.[0];
  if (file) loadImageFile(file);
});

flipButton.addEventListener("click", () => {
  if (!originalImage) return;
  drawFlippedImage();
  isFlipped = true;
  downloadButton.disabled = false;
  statusText.textContent = "左右反転しました。反転で崩れた小物や文字は、結果側キャンバスをブラシでなぞって補正できます。";
});

compareButton.addEventListener("click", () => {
  isCompareSingle = !isCompareSingle;
  canvasGrid.classList.toggle("compare-single", isCompareSingle);
  compareButton.textContent = isCompareSingle ? "元画像も表示" : "結果だけ表示";
});

downloadButton.addEventListener("click", () => {
  if (!isFlipped) return;

  const link = document.createElement("a");
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  link.download = `${baseName}_mirror_fixed.png`;
  link.href = resultCanvas.toDataURL("image/png");
  link.click();
});

resetButton.addEventListener("click", resetTool);

brushSizeInput.addEventListener("input", () => {
  brushSize = Number(brushSizeInput.value);
  brushSizeValue.textContent = `${brushSize}px`;
});

resultCanvas.addEventListener("pointerdown", (event) => {
  if (!isFlipped) return;
  isPainting = true;
  resultCanvas.setPointerCapture(event.pointerId);
  paintRepair(event);
});

resultCanvas.addEventListener("pointermove", (event) => {
  if (!isPainting || !isFlipped) return;
  paintRepair(event);
});

["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
  resultCanvas.addEventListener(eventName, () => {
    isPainting = false;
  });
});

function loadImageFile(file) {
  if (!file.type.startsWith("image/")) {
    statusText.textContent = "画像ファイルを選択してください。";
    return;
  }

  originalFileName = file.name;
  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      originalImage = img;
      isFlipped = false;
      setCanvasSize(sourceCanvas, img.naturalWidth, img.naturalHeight);
      setCanvasSize(resultCanvas, img.naturalWidth, img.naturalHeight);
      setCanvasSize(originalBuffer, img.naturalWidth, img.naturalHeight);
      setCanvasSize(flippedBuffer, img.naturalWidth, img.naturalHeight);
      drawSourceImage();
      drawFlippedBuffer();
      drawPlaceholderResult();
      flipButton.disabled = false;
      compareButton.disabled = false;
      downloadButton.disabled = true;
      resetButton.disabled = false;
      statusText.textContent = `読み込み完了: ${file.name} (${img.naturalWidth}x${img.naturalHeight}px)`;
    };

    img.onerror = () => {
      statusText.textContent = "画像の読み込みに失敗しました。別の画像を試してください。";
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
}

function resetTool() {
  originalImage = null;
  originalFileName = "flipped-image";
  isFlipped = false;
  fileInput.value = "";
  [sourceCtx, resultCtx, originalCtx, flippedCtx].forEach((ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  });
  [sourceCanvas, resultCanvas, originalBuffer, flippedBuffer].forEach((canvas) => {
    setCanvasSize(canvas, 0, 0);
  });
  flipButton.disabled = true;
  compareButton.disabled = true;
  downloadButton.disabled = true;
  resetButton.disabled = true;
  statusText.textContent = "画像を読み込んでください。";
}

function setCanvasSize(canvas, width, height) {
  canvas.width = width;
  canvas.height = height;
  if (canvas === sourceCanvas || canvas === resultCanvas) {
    canvas.style.display = width && height ? "block" : "none";
  }
}

function drawSourceImage() {
  sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  sourceCtx.drawImage(originalImage, 0, 0);

  originalCtx.clearRect(0, 0, originalBuffer.width, originalBuffer.height);
  originalCtx.drawImage(originalImage, 0, 0);
}

function drawFlippedBuffer() {
  flippedCtx.clearRect(0, 0, flippedBuffer.width, flippedBuffer.height);
  flippedCtx.save();
  flippedCtx.translate(flippedBuffer.width, 0);
  flippedCtx.scale(-1, 1);
  flippedCtx.drawImage(originalImage, 0, 0);
  flippedCtx.restore();
}

function drawPlaceholderResult() {
  resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  resultCtx.save();
  resultCtx.globalAlpha = 0.36;
  resultCtx.drawImage(originalImage, 0, 0);
  resultCtx.restore();
}

function drawFlippedImage() {
  resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  resultCtx.drawImage(flippedBuffer, 0, 0);
}

function paintRepair(event) {
  const point = getCanvasPoint(event, resultCanvas);
  const radius = brushSize / 2;
  const dx = clamp(point.x - radius, 0, resultCanvas.width);
  const dy = clamp(point.y - radius, 0, resultCanvas.height);
  const size = Math.min(brushSize, resultCanvas.width - dx, resultCanvas.height - dy);
  const mode = document.querySelector("input[name='brushMode']:checked").value;

  if (size <= 0) return;

  resultCtx.save();
  resultCtx.beginPath();
  resultCtx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  resultCtx.clip();

  if (mode === "unmirror") {
    const sx = clamp(resultCanvas.width - dx - size, 0, originalBuffer.width - size);
    resultCtx.drawImage(originalBuffer, sx, dy, size, size, dx, dy, size, size);
  } else {
    resultCtx.drawImage(flippedBuffer, dx, dy, size, size, dx, dy, size, size);
  }

  resultCtx.restore();
}

function getCanvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
