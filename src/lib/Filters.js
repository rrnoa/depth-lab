//import { decode, encode } from 'https://cdn.skypack.dev/fast-png';


export const escalarPulgadas = (alturas, rango, delta) => {
    const scala = [];
    for (let index = delta; index <= rango; index+=delta) {
        scala.push(index);
    }

    return scaleDepthValues(alturas, scala);

}

function scaleDepthValues(depthMap, targetRanges) {
    const scaledDepthMap = depthMap.map(value => {
      // Encontrar el rango más cercano al valor actual
      let closestRange = targetRanges[0];
      let minDiff = Math.abs(value - closestRange);
  
      for (let i = 1; i < targetRanges.length; i++) {
        const diff = Math.abs(value - targetRanges[i]);
        if (diff < minDiff) {
          closestRange = targetRanges[i];
          minDiff = diff;
        }
      }
  
      return closestRange;
    });

    return scaledDepthMap;
  }  

  export function smoothHeightMap(heightMap, width, height, radius) {
    const smoothedHeightMap = [...heightMap];
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
  
        for (let ry = -radius; ry <= radius; ry++) {
          const ny = y + ry;
          if (ny >= 0 && ny < height) {
            for (let rx = -radius; rx <= radius; rx++) {
              const nx = x + rx;
              if (nx >= 0 && nx < width) {
                const neighborIdx = ny * width + nx;
                sum += heightMap[neighborIdx];
                count++;
              }
            }
          }
        }
  
        const currentIdx = y * width + x;
        smoothedHeightMap[currentIdx] = sum / count;
      }
    }
  
    return smoothedHeightMap;
  } 

  export function contornos(heightMap, width, height, precision) {
    const contourMask = new Array(height * width).fill(false);
    // Paso 1: Identificar contornos
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentIdx = y * width + x;
        const currentHeight = heightMap[currentIdx];
  
        for (let ry = -1; ry <= 1; ry++) {
          const ny = y + ry;
          if (ny >= 0 && ny < height) {
            for (let rx = -1; rx <= 1; rx++) {
              const nx = x + rx;
              if (nx >= 0 && nx < width) {
                const neighborIdx = ny * width + nx;
                const neighborHeight = heightMap[neighborIdx];
  
                if ((currentHeight - neighborHeight) > precision) {
                  contourMask[currentIdx] = true;
                  break;
                }
              }
            }
          }
        }
      }
    }

    return contourMask;
  }
  
  export function smoothHeightMapContours(heightMap, width, height, radius, precision) {
    const smoothedHeightMap = [...heightMap];
    const contourMask = new Array(height * width).fill(false);
  
    // Paso 1: Identificar contornos
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentIdx = y * width + x;
        const currentHeight = heightMap[currentIdx];
  
        for (let ry = -1; ry <= 1; ry++) {
          const ny = y + ry;
          if (ny >= 0 && ny < height) {
            for (let rx = -1; rx <= 1; rx++) {
              const nx = x + rx;
              if (nx >= 0 && nx < width) {
                const neighborIdx = ny * width + nx;
                const neighborHeight = heightMap[neighborIdx];
  
                if (Math.abs(currentHeight - neighborHeight) > precision) {
                  contourMask[currentIdx] = true;
                  break;
                }
              }
            }
          }
        }
      }
    }
  
    // Paso 2: Aplicar suavizado solo en contornos
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!contourMask[y * width + x]) {
          continue;
        }
  
        let sum = 0;
        let count = 0;
  
        for (let ry = -radius; ry <= radius; ry++) {
          const ny = y + ry;
          if (ny >= 0 && ny < height) {
            for (let rx = -radius; rx <= radius; rx++) {
              const nx = x + rx;
              if (nx >= 0 && nx < width) {
                const neighborIdx = ny * width + nx;
                sum += heightMap[neighborIdx];
                count++;
              }
            }
          }
        }
  
        const currentIdx = y * width + x;
        smoothedHeightMap[currentIdx] = sum / count;
      }
    }
  
    return smoothedHeightMap;
  }

  export function smoothHeightMapContrast(heightMap, width, height, radius, precision) {
    const smoothedHeightMap = [...heightMap];
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentIdx = y * width + x;
        const currentHeight = heightMap[currentIdx];
  
        let highContrast = false;
  
        for (let ry = -1; ry <= 1; ry++) {
          const ny = y + ry;
          if (ny >= 0 && ny < height) {
            for (let rx = -1; rx <= 1; rx++) {
              const nx = x + rx;
              if (nx >= 0 && nx < width) {
                const neighborIdx = ny * width + nx;
                const neighborHeight = heightMap[neighborIdx];
  
                if (Math.abs(currentHeight - neighborHeight) > precision) {
                  highContrast = true;
                  break;
                }
              }
            }
          }
          if (highContrast) break;
        }
  
        if (highContrast) {
          let sum = 0;
          let count = 0;
  
          for (let ry = -radius; ry <= radius; ry++) {
            const ny = y + ry;
            if (ny >= 0 && ny < height) {
              for (let rx = -radius; rx <= radius; rx++) {
                const nx = x + rx;
                if (nx >= 0 && nx < width) {
                  const neighborIdx = ny * width + nx;
                  sum += heightMap[neighborIdx];
                  count++;
                }
              }
            }
          }
  
          smoothedHeightMap[currentIdx] = sum / count;
        }
      }
    }
  
    return smoothedHeightMap;
  }

  export function smoothHeightMapContoursOpenCV(heightMap, width, height, radius, precision) {
    let src = cv.matFromArray(height, width, cv.CV_16UC1, heightMap);
    let grad_x = new cv.Mat();
    let grad_y = new cv.Mat();
    let abs_grad_x = new cv.Mat();
    let abs_grad_y = new cv.Mat();
    let scaled_grad_x = new cv.Mat();
    let scaled_grad_y = new cv.Mat();
    let edges = new cv.Mat();
    let mask = new cv.Mat(); // Matriz para la máscara
    let blurred = new cv.Mat();
    let result = new cv.Mat();
  
    // Aplicar el operador de Sobel con un tipo de dato de mayor precisión
    cv.Sobel(src, grad_x, cv.CV_16S, 1, 0, 3, 1, 0, cv.BORDER_DEFAULT);
    cv.Sobel(src, grad_y, cv.CV_16S, 0, 1, 3, 1, 0, cv.BORDER_DEFAULT);
  
    // Tomar los valores absolutos de los gradientes
    cv.absdiff(grad_x, cv.Mat.zeros(grad_x.size(), cv.CV_16S), abs_grad_x);
    cv.absdiff(grad_y, cv.Mat.zeros(grad_y.size(), cv.CV_16S), abs_grad_y);
  
    // Normalizar los gradientes absolutos a 8 bits
    cv.normalize(abs_grad_x, scaled_grad_x, 0, 255, cv.NORM_MINMAX, cv.CV_8U);
    cv.normalize(abs_grad_y, scaled_grad_y, 0, 255, cv.NORM_MINMAX, cv.CV_8U);
  
    // Combinar ambos gradientes
    cv.addWeighted(scaled_grad_x, 0.5, scaled_grad_y, 0.5, 0, edges);
  
    // Aplicar un umbral para crear la máscara binaria de bordes
    cv.threshold(edges, mask, precision, 255, cv.THRESH_BINARY);
  
    // Mostrar la máscara en el nuevo canvas
    //cv.imshow('maskCanvas', mask);
  
    // Aplicar el desenfoque gaussiano a la imagen original
    let aggressiveKernelSize = radius * 2 + 1; // Aumentar el tamaño del kernel
    cv.GaussianBlur(src, blurred, new cv.Size(aggressiveKernelSize, aggressiveKernelSize), 0);
  
    // Usar la máscara para combinar la imagen original con la desenfocada
    src.copyTo(result);
    blurred.copyTo(result, mask);
  
    console.log(result.data16U);
    //downloadSmoothedImage(result.data16U, width, height);
  
    const smoothEdges = [...result.data16U];
    // Mostrar los resultados
    //cv.imshow('edgeCanvas', edges);
    //cv.imshow('smoothedCanvas', result);
  
    src.delete();
    grad_x.delete();
    grad_y.delete();
    abs_grad_x.delete();
    abs_grad_y.delete();
    scaled_grad_x.delete();
    scaled_grad_y.delete();
    edges.delete();
    mask.delete();
    blurred.delete();
    result.delete();

    return smoothEdges;
  }

  /* function downloadSmoothedImage(heightMap, width, height) {
    const png = encode({
      width,
      height,
      data: new Uint16Array(heightMap),
      channels: 1,
      depth: 16
    });
    const blob = new Blob([png], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
  
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'smoothed_image.png'; // Nombre del archivo descargado
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink); // Eliminar el enlace después de la descarga
  } */
  
  
  
  
  
  
  
  
  