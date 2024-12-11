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

const GenerarPDFAgrupados = (colorDetails, heights, xBlocks, yBlocks) => {

  console.log(heights);

  const INCH = 0.0254;

  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: [216, 279], // Tamaño en mm (8.5 x 11 pulgadas)
  });

  const pageHeight = 279;

  // Objeto para almacenar la agrupación
  const groupedData = {};

  // Recorrer la matriz de alturas y colores
  for (let y = 0; y < yBlocks; y++) {
    for (let x = 0; x < xBlocks; x++) {
      const index = y * xBlocks + x;
      const heightInch = heights[index] / INCH
      const heightKey = heightInch.toFixed(3); // Agrupar por alturas redondeadas
      const colorDetail = colorDetails[index];

      // Crear agrupación por altura si no existe
      if (!groupedData[heightKey]) {
        groupedData[heightKey] = {};
      }

      // Crear agrupación por color si no existe
      const colorKey = colorDetail[3]; // Código hexadecimal como clave
      if (!groupedData[heightKey][colorKey]) {
        groupedData[heightKey][colorKey] = {
          count: 0,
          details: colorDetail,
        };
      }

      // Incrementar el contador para este color y altura
      groupedData[heightKey][colorKey].count++;
    }
  }

  // Generar el PDF con los datos agrupados
  let yOffset = 10;

  doc.setFontSize(12);

  for (const heightKey in groupedData) {
    if (yOffset > pageHeight - 30) {
      doc.addPage();
      yOffset = 10;
    }

    // Mostrar la altura
    doc.setFontSize(10);
    doc.text(`Altura: ${heightKey} in`, 20, yOffset);
    yOffset += 10;

    for (const colorKey in groupedData[heightKey]) {
      const { count, details } = groupedData[heightKey][colorKey];
      const [brand, name, code, hex, [r, g, b]] = details;

      if (yOffset > pageHeight - 20) {
        doc.addPage();
        yOffset = 10;
      }

      // Mostrar el color
      doc.setFillColor(r, g, b);
      doc.rect(20, yOffset, 10, 5, "F");

      // Mostrar los detalles del color
      doc.setFontSize(9);
      doc.text(
        `${brand}, ${name}, ${code}, ${hex}, Cantidad: ${count}`,
        35,
        yOffset + 4
      );

      yOffset += 10;
    }
  }

  // Guardar el PDF
  doc.save("grouped_colors_heights.pdf");
};



export {GeneratePDFButton, GenerarPDFColores, GenerarPDFAgrupados};
