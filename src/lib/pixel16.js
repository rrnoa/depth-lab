import UPNG from 'upng-js';

export async function pixelate16(buffer, pixelImageUrl, numBlocksX, numBlocksY, callback) {
  const pxImg = new Image();
  pxImg.src = pixelImageUrl;

  pxImg.onload = () => {
    const png = UPNG.decode(buffer);
    // Las dimensiones se toman de la imagen original pixelada
    const width = pxImg.width;
    const height = pxImg.height;
    const depth = png.depth;

    const depthData = [];


    //-------------------esto solo sirve para dibujar ---------------
    const canvas = document.createElement("canvas");
    canvas.width = width; // Asegurar que el canvas tiene el tamaño correcto
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    //----------------------esto solo sirve para dibujar ----------------


    // Obtener los datos de los píxeles directamente de la propiedad 'data'
    let data = png.data;
    // Asegurarnos de que estamos manejando datos de 16 bits
    if (depth === 16) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * png.width + x) * 2;
          if (idx >= data.length) continue; // Evitar el desbordamiento de índice
          const value = (data[idx] << 8) | data[idx + 1];
          depthData.push(value);         
        }
      }
    } else {
      // Manejo de otras profundidades (e.g., 8 bits por canal)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * png.width + x) * 4;
          if (idx >= data.length) continue; // Evitar el desbordamiento de índice
          const pixelIdx = (y * width + x) * 4;
          imageData.data[pixelIdx] = data[idx];
          imageData.data[pixelIdx + 1] = data[idx + 1];
          imageData.data[pixelIdx + 2] = data[idx + 2];
          imageData.data[pixelIdx + 3] = data[idx + 3];
        }
      }
    }

    // Aplicar pixelado a depthData
    const pixelatedDepthData = applyPixelation(depthData, width, height, numBlocksX, numBlocksY);
    
    callback(pixelatedDepthData);
  };
}

// Función para aplicar pixelado a los datos de profundidad
function applyPixelation(depthData, width, height, numBlocksX, numBlocksY) {
  const blockWidth = Math.ceil(width / numBlocksX);
  const blockHeight = Math.ceil(height / numBlocksY);
  const pixelatedDepthData = new Uint16Array(numBlocksX * numBlocksY);

  for (let by = 0; by < numBlocksY; by++) {
    for (let bx = 0; bx < numBlocksX; bx++) {
      let sum = 0;
      let count = 0;

      for (let y = by * blockHeight; y < (by + 1) * blockHeight && y < height; y++) {
        for (let x = bx * blockWidth; x < (bx + 1) * blockWidth && x < width; x++) {
          sum += depthData[y * width + x];
          count++;
        }
      }

      const average = sum / count;
      pixelatedDepthData[by * numBlocksX + bx] = average;
    }
  }

  //drawPixelatedDataAndDownload(pixelatedDepthData, numBlocksX, numBlocksY, width, height);

  return pixelatedDepthData;
}

function drawPixelatedDataAndDownload(pixelatedDepthData, numBlocksX, numBlocksY, width, height) {
  // Crear un canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Crear un ImageData para dibujar los píxeles
  const imageData = ctx.createImageData(width, height);

  // Calcular el tamaño de los bloques
  const blockWidth = Math.ceil(width / numBlocksX);
  const blockHeight = Math.ceil(height / numBlocksY);

  // Dibujar los datos pixelados en el ImageData
  for (let by = 0; by < numBlocksY; by++) {
    for (let bx = 0; bx < numBlocksX; bx++) {
      const value = pixelatedDepthData[by * numBlocksX + bx];
      const scaledValue = value >> 8; // Escalar el valor a 8 bits para visualizar

      for (let y = by * blockHeight; y < (by + 1) * blockHeight && y < height; y++) {
        for (let x = bx * blockWidth; x < (bx + 1) * blockWidth && x < width; x++) {
          const pixelIdx = (y * width + x) * 4;
          imageData.data[pixelIdx] = scaledValue;       // R
          imageData.data[pixelIdx + 1] = scaledValue;   // G
          imageData.data[pixelIdx + 2] = scaledValue;   // B
          imageData.data[pixelIdx + 3] = 255;           // A
        }
      }
    }
  }

  // Poner el ImageData en el canvas
  ctx.putImageData(imageData, 0, 0);

  // Descargar la imagen
  const link = document.createElement("a");
  link.download = "pixelated_image.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

const saveCroppedImage = (croppedImageUrl, fileName = "cropped_image.jpeg") => {
  // Crear un enlace <a> dinámicamente
  const downloadLink = document.createElement("a");
  downloadLink.href = croppedImageUrl; // URL creada por URL.createObjectURL
  downloadLink.download = fileName; // Nombre del archivo que será descargado

  // Simular un clic para iniciar la descarga
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Limpieza: remover el enlace
  document.body.removeChild(downloadLink);
};
