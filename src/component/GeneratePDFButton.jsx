import { jsPDF } from "jspdf";

const GeneratePDFButton = (xBlocks, yBlocks, blockSize, modifiedHeights) => {
  const INCH = 0.0254;
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: [216, 279], // Tamaño carta en mm
  });

  const regionSize = 12;
  const pageWidth = 216 - 20;
  const pageHeight = 279 - 20;
  const tileSize = pageWidth / regionSize;

  doc.setFontSize(12);

  // Cantidad de bloques y dimensiones
  doc.setFontSize(10);
  doc.text(`Cantidad de bloques: ${xBlocks * yBlocks}`, 20, 20);
  doc.text(`Tamaño del bloque: ${blockSize} mm`, 20, 30);
  doc.text(`Dimensiones: ${xBlocks} x ${yBlocks}`, 20, 40);

  // Agrupar bloques por altura
  const groupedHeights = {};
  modifiedHeights.forEach((height) => {
    const roundedHeight = (height / INCH).toFixed(3); // Agrupar por alturas redondeadas
    if (!groupedHeights[roundedHeight]) {
      groupedHeights[roundedHeight] = 0;
    }
    groupedHeights[roundedHeight]++;
  });

  // Mostrar lista agrupada por alturas
  doc.text("Bloques agrupados por altura:", 20, 60);
  const heights = Object.keys(groupedHeights).sort((a, b) => parseFloat(a) - parseFloat(b));
  let currentY = 70;

  heights.forEach((height) => {
    if (currentY > pageHeight - 10) {
      doc.addPage(); // Agregar nueva página si el contenido excede el límite
      currentY = 20;
    }
    doc.text(`Altura: ${height} in - Cantidad: ${groupedHeights[height]}`, 20, currentY);
    currentY += 10;
  });

  // Página para las regiones de bloques
  const totalRegionsX = Math.ceil(xBlocks / regionSize);
  const totalRegionsY = Math.ceil(yBlocks / regionSize);

  let currentPage = 2; // Comenzar la cuenta de páginas desde la segunda

  for (let regionYIndex = 0; regionYIndex < totalRegionsY; regionYIndex++) {
    for (let regionXIndex = 0; regionXIndex < totalRegionsX; regionXIndex++) {
      doc.addPage();
      const startX = 10;
      const startY = 10;

      for (let j = 0; j < regionSize; j++) {
        for (let i = 0; i < regionSize; i++) {
          const globalY = regionYIndex * regionSize + j;
          const globalX = regionXIndex * regionSize + i;

          if (globalY >= yBlocks || globalX >= xBlocks) continue;

          const index = globalY * xBlocks + globalX;
          const height = modifiedHeights[index];

          doc.rect(
            startX + i * tileSize,
            startY + j * tileSize,
            tileSize,
            tileSize
          );

          doc.text(
            `${(height / INCH).toFixed(3)}`,
            startX + i * tileSize + tileSize / 2,
            startY + j * tileSize + tileSize / 2,
            { align: "center" }
          );
        }
      }

      doc.text(
        `Región (${regionYIndex + 1}, ${regionXIndex + 1}) - Página ${currentPage}`,
        10,
        pageHeight + 5
      );
      currentPage++;
    }
  }

  // Página final con el grid resumen
  doc.addPage();
  const gridTileSize = pageWidth / totalRegionsX;
  const gridStartX = 10;
  const gridStartY = 10;

  doc.setFontSize(10);
  doc.text("Grid Resumen", pageWidth / 2 + 10, 10, { align: "center" });

  for (let gridY = 0; gridY < totalRegionsY; gridY++) {
    for (let gridX = 0; gridX < totalRegionsX; gridX++) {
      const rectX = gridStartX + gridX * gridTileSize;
      const rectY = gridStartY + gridY * gridTileSize;

      doc.rect(rectX, rectY, gridTileSize, gridTileSize);

      doc.text(
        `${gridY + 1}, ${gridX + 1}`,
        rectX + gridTileSize / 2,
        rectY + gridTileSize / 2,
        { align: "center" }
      );
    }
  }

  // Guardar el PDF
  doc.save("matriz_bloques.pdf");
};



const GenerarPDFColores = (colors, colorDetails, xBlocks, yBlocks) => {
  if (colors.length !== xBlocks * yBlocks * 3) {
      console.error("El número de colores no coincide con el tamaño de la matriz");
      return;
  }

  const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [216, 279], // Tamaño en mm (8.5 x 11 pulgadas)
  });

  const pageWidth = 216;
  const pageHeight = 279;

  // Mapa para asignar números a los colores
  const colorNumbers = new Map(); // Mapear colores a números consecutivos
  let colorNumber = 1;

  // Crear una matriz con los números de los colores
  const numberMatrix = [];
  let colorIndex = 0;

  for (let y = 0; y < yBlocks; y++) {
      const row = [];
      for (let x = 0; x < xBlocks; x++) {
          const r = Math.round(colors[colorIndex++] * 255);
          const g = Math.round(colors[colorIndex++] * 255);
          const b = Math.round(colors[colorIndex++] * 255);

          // Crear el identificador único del color
          const colorKey = `${r},${g},${b}`;

          // Asignar un número al color si no lo tiene
          if (!colorNumbers.has(colorKey)) {
              colorNumbers.set(colorKey, {num: colorNumber++, count: 1, index: (colorIndex / 3) - 1});
          } else {
            const existingEntry = colorNumbers.get(colorKey);
            existingEntry.count += 1; // Incrementar el valor de count
            colorNumbers.set(colorKey, existingEntry); // Actualizar el Map con el nuevo valor
          }
          row.push(colorNumbers.get(colorKey).num);
      }
      numberMatrix.push(row);
  }

  // Página de detalles de colores
  doc.setFontSize(10);
  doc.text(`Dimensiones de la matriz: ${xBlocks} x ${yBlocks}`, 20, 10);
  doc.text(`Total de bloques: ${colors.length / 3}`, 20, 20);
  
  let i=0;
  for (const [colorKey, value] of colorNumbers) {
    let details = colorDetails[value.index]
/*     console.log(`Color: ${colorKey}, Num: ${value.num}, Count: ${value.count}, Index: ${value.index}`);*/

    doc.text( `${value.num}`, 20, 40 + i * 6);
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(details[4][0], details[4][1], details[4][2]);
    doc.rect(30 , 37 + i * 6, 10, 4, "FD");
    
    doc.text( `${details[0]} , ${details[1]}, ${details[2]}, ${details[3]}`, 45, 40 + i * 6);

    console.log(value.index, details[4]);
    i++;
  }

  // Página para la matriz coloreada
  doc.addPage();
  const cellSize = Math.min(pageWidth / xBlocks, pageHeight / yBlocks);
  const offsetX = (pageWidth - cellSize * xBlocks) / 2;
  const offsetY = (pageHeight - cellSize * yBlocks) / 2;

  colorIndex = 0;

  // Dibujar las celdas coloreadas
  for (let y = 0; y < yBlocks; y++) {
      for (let x = 0; x < xBlocks; x++) {

          let detail = colorDetails[colorIndex++];

          const r = detail[4][0];
          const g = detail[4][1];
          const b = detail[4][2];

          const posX = offsetX + x * cellSize;
          const posY = offsetY + y * cellSize;

          doc.setFillColor(r, g, b);
          doc.rect(posX, posY, cellSize, cellSize, "F");
      }
  }

  // Página para la matriz numerada
  doc.addPage();

  // Dibujar las celdas numeradas
  for (let y = 0; y < yBlocks; y++) {
      for (let x = 0; x < xBlocks; x++) {
          const posX = offsetX + x * cellSize;
          const posY = offsetY + y * cellSize;

          // Número en la celda
          doc.setFontSize(8);
          doc.text(
              `${numberMatrix[y][x]}`,
              posX + cellSize / 2,
              posY + cellSize / 2,
              {
                  align: "center",
                  baseline: "middle",
              }
          );
      }
  }

  doc.save("matrix_colors.pdf");
};

const GenerarPDFAgrupados = (colorDetails, heights, xBlocks, yBlocks, blockSize) => {
  const xInchs = xBlocks * blockSize;
  const yInchs = yBlocks * blockSize;
  const INCH = 0.0254;
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: [216, 279],
  });

  const pageHeight = 279;
  const pageWidth = 216;

  // Validar entradas
  if (heights.length !== xBlocks * yBlocks || colorDetails.length !== xBlocks * yBlocks) {
    console.error("El tamaño de heights o colorDetails no coincide con las dimensiones de la matriz.");
    return;
  }

  const groupedData = {};

  // Agrupar datos por color y altura
  for (let y = 0; y < yBlocks; y++) {
    for (let x = 0; xBlocks > x; x++) {
      const index = y * xBlocks + x;
      const heightInch = (heights[index] / INCH).toFixed(3);
      const colorDetail = colorDetails[index];
      const colorKey = colorDetail[3];

      if (!groupedData[colorKey]) {
        groupedData[colorKey] = {
          details: colorDetail,
          heights: {},
        };
      }

      if (!groupedData[colorKey].heights[heightInch]) {
        groupedData[colorKey].heights[heightInch] = 0;
      }

      groupedData[colorKey].heights[heightInch]++;
    }
  }

  // Generar el PDF principal con datos agrupados
  let yOffset = 10;
  doc.setFontSize(12);
  doc.text("Dimensiones: " + xInchs + "x" + yInchs, 10, yOffset, { align: "left" });
  yOffset += 5;
  doc.text("Bloque: " + blockSize + "\"", 10, yOffset, { align: "left" });

  yOffset += 10;

  let colorIndex = 1; // Para el número consecutivo

  for (const colorKey in groupedData) {
    const { details, heights } = groupedData[colorKey];
    const [brand, name, code, hex, [r, g, b]] = details;

    if (yOffset > pageHeight - 20) {
      doc.addPage();
      yOffset = 10;
    }

    // Mostrar el color y los detalles
    doc.setFillColor(r, g, b);
    doc.rect(10, yOffset, 10, 5, "F");

    doc.setFontSize(9);
    doc.text(
      `${colorIndex}. ${brand}, ${name}, ${code}, ${hex}`,
      25,
      yOffset + 4
    );

    colorIndex++; // Incrementar el número consecutivo

    yOffset += 10;

    // Mostrar las alturas y cantidades en líneas ajustadas
    const heightsText = Object.entries(heights)
      .map(([height, count]) => `(${decimalToMixedFraction(parseFloat(height))}, ${count})`)
      .join(" ");

    const splitLines = doc.splitTextToSize(heightsText, pageWidth - 20);
    for (const line of splitLines) {
      if (yOffset > pageHeight - 10) {
        doc.addPage();
        yOffset = 10;
      }
      doc.text(line, 25, yOffset);
      yOffset += 6;
    }
  }

  // Agregar una nueva página con colores agrupados en cuadros grandes
  doc.addPage();
  const boxSize = pageWidth / 5; // Tamaño del cuadro de color ajustado para 5 elementos por fila
  const colorsPerRow = 5;
  let currentX = 0;
  let currentY = 0;

  // Agrupar colores únicos por brand
  const uniqueColors = Object.values(groupedData).map(({ details }) => details);

  uniqueColors.forEach((color, index) => {
    const [brand, name, code, hex, [r, g, b]] = color;

    // Dibujar el cuadro de color
    doc.setFillColor(r, g, b);
    doc.rect(currentX, currentY, boxSize, boxSize, "F");

    // Agregar texto dentro del cuadro con número consecutivo
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${index + 1}. ${brand}\n${name}`,
      currentX + 18,
      currentY + boxSize / 2,
      { maxWidth: boxSize - 4, align: "center" }
    );

    // Ajustar posición para el siguiente cuadro
    currentX += boxSize;
    if ((index + 1) % colorsPerRow === 0) {
      currentX = 0;
      currentY += boxSize;
    }

    // Agregar nueva página si se excede el espacio vertical
    if (currentY + boxSize > pageHeight) {
      doc.addPage();
      currentX = 0;
      currentY = 0;
    }
  });

  // Agregar una nueva página con divisiones de la obra en regiones
  doc.addPage();

  function distribuirEnGrupos(numero, maxTamanoGrupo) {
    let minGrupos = Math.ceil(numero / maxTamanoGrupo);
    let tamanoBase = Math.floor(numero / minGrupos);
    let excedente = numero % minGrupos;
    let grupos = new Array(minGrupos).fill(tamanoBase);

    // Distribuir el excedente para equilibrar los grupos tanto como sea posible
    for (let i = 0; i < excedente; i++) {
      grupos[i] += 1;
    }

    return grupos;
  }

  const xGrupos = distribuirEnGrupos(xInchs, 24);
  const yGrupos = distribuirEnGrupos(yInchs, 24);

  console.log(xGrupos,yGrupos);

  const regionWidth = pageWidth - 20; // Espacio disponible para dibujar
  const regionHeight = pageHeight - 20;
  const scaleX = regionWidth / xInchs;
  const scaleY = regionHeight / yInchs;
  const scale = Math.min(scaleX, scaleY);

  let panelNumber = 1;
  let startY = 0;

  for (const yTamano of yGrupos) {
    let startX = 0;
    for (const xTamano of xGrupos) {
      // Dibujar el rectángulo para la región
      doc.setDrawColor(0);
      doc.rect(
        10 + startX * scale,
        10 + startY * scale,
        xTamano * scale,
        yTamano * scale
      );

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Asegurar que el texto sea negro
      doc.text(
        `Región ${panelNumber}: ${xTamano}x${yTamano}`,
        10 + startX * scale + xTamano * scale / 2, // Centrar horizontalmente
        10 + startY * scale + yTamano * scale / 2, // Centrar verticalmente
        { align: "center" }
      );

      panelNumber++;
      startX += xTamano;
    }
    startY += yTamano;
  }

  const fileName = `grouped_by_colors_${new Date().toISOString()}.pdf`;
  doc.save(fileName);
};


export {GeneratePDFButton, GenerarPDFColores, GenerarPDFAgrupados};



  function decimalToMixedFraction(decimal) {
    const whole = Math.floor(decimal); // Parte entera
    const fractional = decimal - whole; // Parte fraccionaria
  
    if (fractional === 0) {
      return `${whole}"`; // Solo parte entera
    }
  
    // Definir las fracciones posibles basadas en 1/8
    const eighths = [
      { value: 1 / 8, text: '1/8' },
      { value: 2 / 8, text: '1/4' },
      { value: 3 / 8, text: '3/8' },
      { value: 4 / 8, text: '1/2' },
      { value: 5 / 8, text: '5/8' },
      { value: 6 / 8, text: '3/4' },
      { value: 7 / 8, text: '7/8' },
    ];
  
    // Encontrar la fracción más cercana
    let closestFraction = '';
    for (const { value, text } of eighths) {
      if (Math.abs(fractional - value) < 1 / 16) { // Usar una tolerancia razonable
        closestFraction = text;
        break;
      }
    }
  
    // Construir el número mixto
    if (whole === 0) {
      return `${closestFraction}"`; // Solo fracción
    } else if (closestFraction) {
      return `${whole}"${closestFraction}`; // Mixto
    } else {
      return `${whole}"`; // Solo entero
    }
  }
  
