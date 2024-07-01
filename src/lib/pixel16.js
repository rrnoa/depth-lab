import UPNG from 'upng-js';

export async function pixelate16(buffer, pixelImageUrl, numBlocksX, numBlocksY, startX, startY, callback) {
  const pxImg = new Image();
  pxImg.src = pixelImageUrl;

  pxImg.onload = () => {
    const png = UPNG.decode(buffer);
    // Las dimensiones se toman de la imagen original pixelada
    const width = pxImg.width;
    const height = pxImg.height;
    const depth = png.depth;

    const depthData = [];

    const canvas = document.createElement("canvas");
    canvas.width = width; // Asegurar que el canvas tiene el tamaño correcto
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);

    // Obtener los datos de los píxeles directamente de la propiedad 'data'
    let data = png.data;
    // Asegurarnos de que estamos manejando datos de 16 bits
    if (depth === 16) {
      for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
          const idx = (y * png.width + x) * 2;
          if (idx >= data.length) continue; // Evitar el desbordamiento de índice
          const value = (data[idx] << 8) | data[idx + 1];
          depthData.push(value);         
        }
      }
    } else {
      // Manejo de otras profundidades (e.g., 8 bits por canal)
      for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
          const idx = (y * png.width + x) * 4;
          if (idx >= data.length) continue; // Evitar el desbordamiento de índice
          const pixelIdx = ((y - startY) * width + (x - startX)) * 4;
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

  return pixelatedDepthData;
}

// Función para dibujar el pixelatedDepthData en el canvas
function drawPixelatedData(pixelatedDepthData, numBlocksX, numBlocksY, width, height, imageData) {
  const blockWidth = Math.ceil(width / numBlocksX);
  const blockHeight = Math.ceil(height / numBlocksY);

  for (let by = 0; by < numBlocksY; by++) {
    for (let bx = 0; bx < numBlocksX; bx++) {
      const value = pixelatedDepthData[by * numBlocksX + bx];
      const scaledValue = value >> 8; // Escalar el valor a 8 bits para visualizar

      for (let y = by * blockHeight; y < (by + 1) * blockHeight && y < height; y++) {
        for (let x = bx * blockWidth; x < (bx + 1) * blockWidth && x < width; x++) {
          const pixelIdx = (y * width + x) * 4;
          imageData.data[pixelIdx] = scaledValue;
          imageData.data[pixelIdx + 1] = scaledValue;
          imageData.data[pixelIdx + 2] = scaledValue;
          imageData.data[pixelIdx + 3] = 255;
        }
      }
    }
  }
}
