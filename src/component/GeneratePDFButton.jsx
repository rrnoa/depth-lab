import { jsPDF } from "jspdf";

const GeneratePDFButton = (xBlocks, yBlocks, blockSize, modifiedHeights, colorDetails) => {  
  const INCH = 0.0254;
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: [216, 279], // Tamaño carta en mm
  });

  const regionSize = 24 / blockSize;
  const pageWidth = 216 - 10;
  const pageHeight = 279 - 10;
  const tileSize = pageWidth / regionSize;

  // Cantidad de bloques y dimensiones
  doc.setFontSize(12);
  doc.text(`Cantidad de bloques: ${xBlocks * yBlocks}`, 20, 20);
  doc.text(`Tamaño del bloque: ${blockSize}"`, 20, 30);
  doc.text(`Dimensiones: ${xBlocks} x ${yBlocks} bloques`, 20, 40);

  // Función para dividir dimensiones en regiones uniformes
  function distribuirEnGrupos(numero, maxTamanoGrupo) {
    let minGrupos = Math.ceil(numero / maxTamanoGrupo);
    let tamanoBase = Math.floor(numero / minGrupos);
    let excedente = numero % minGrupos;
    let grupos = new Array(minGrupos).fill(tamanoBase);

    for (let i = 0; i < excedente; i++) {
      grupos[i] += 1;
    }

    return grupos;
  }

  // Agrupar colores y asignar números consecutivos
  const colorMap = new Map();
  let colorCounter = 1;

  colorDetails.forEach((colorDetail) => {
    const colorKey = colorDetail.slice(1, 4).join("-"); // Clave única basada en nombre, código y hex
    if (!colorMap.has(colorKey)) {
      colorMap.set(colorKey, colorCounter++);
    }
  });

  const xRegions = distribuirEnGrupos(xBlocks, regionSize);
  const yRegions = distribuirEnGrupos(yBlocks, regionSize);

  let currentPage = 1;

  for (let regionYIndex = 0, startY = 0; regionYIndex < yRegions.length; regionYIndex++) {
    const regionHeight = yRegions[regionYIndex];

    for (let regionXIndex = 0, startX = 0; regionXIndex < xRegions.length; regionXIndex++) {
      const regionWidth = xRegions[regionXIndex];

      doc.addPage();

      for (let j = 0; j < regionHeight; j++) {
        for (let i = 0; i < regionWidth; i++) {
          const globalY = startY + j;
          const globalX = startX + i;

          if (globalY >= yBlocks || globalX >= xBlocks) continue;

          const index = globalY * xBlocks + globalX;
          const height = modifiedHeights[index];
          const colorDetail = colorDetails[index];
          const colorKey = colorDetail.slice(1, 4).join("-");
          const colorNumber = colorMap.get(colorKey); // Número único del color
          const [r, g, b] = colorDetail[4]; // RGB

          // Dibujar el rectángulo del bloque con color de fondo
          doc.setFillColor(r, g, b);
          doc.rect(
            5 + i * tileSize,
            5 + j * tileSize,
            tileSize,
            tileSize,
            "F"
          );

          // Agregar número del color y altura
          doc.setFontSize(4);
          doc.setTextColor(0, 0, 0); // Color del texto negro para contraste
          doc.text(
            `${colorNumber}`,
            5 + i * tileSize + tileSize / 2,
            5 + j * tileSize + tileSize / 3,
            { align: "center" }
          );
          doc.text(
            `${decimalToMixedFraction((height / INCH).toFixed(3))}`,
            5 + i * tileSize + tileSize / 2,
            5 + j * tileSize + (2 * tileSize) / 3,
            { align: "center" }
          );
        }
      }

      doc.setFontSize(12);

      doc.text(
        `Región (${regionYIndex + 1}, ${regionXIndex + 1}) - Página ${currentPage}`,
        10,
        pageHeight + 5
      );

      currentPage++;
      startX += regionWidth;
    }

    startY += regionHeight;
  }

  // Guardar el PDF
  doc.save("matriz_bloques.pdf");
};

const GenerateGripWhite = (xBlocks, yBlocks, blockSize, modifiedHeights, colorDetails) => {  
  const INCH = 0.0254;
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: [216, 279], // Tamaño carta en mm
  });

  const regionSize = 24 / blockSize;
  const pageWidth = 216 - 10;
  const pageHeight = 279 - 10;
  const tileSize = pageWidth / regionSize;

  // Cantidad de bloques y dimensiones
  doc.setFontSize(12);
  doc.text(`Cantidad de bloques: ${xBlocks * yBlocks}`, 20, 20);
  doc.text(`Tamaño del bloque: ${blockSize}"`, 20, 30);
  doc.text(`Dimensiones: ${xBlocks} x ${yBlocks} bloques`, 20, 40);

  // Función para dividir dimensiones en regiones uniformes
  function distribuirEnGrupos(numero, maxTamanoGrupo) {
    let minGrupos = Math.ceil(numero / maxTamanoGrupo);
    let tamanoBase = Math.floor(numero / minGrupos);
    let excedente = numero % minGrupos;
    let grupos = new Array(minGrupos).fill(tamanoBase);

    for (let i = 0; i < excedente; i++) {
      grupos[i] += 1;
    }

    return grupos;
  }

  // Agrupar colores y asignar números consecutivos
  const colorMap = new Map();
  let colorCounter = 1;

  colorDetails.forEach((colorDetail) => {
    const colorKey = colorDetail.slice(1, 4).join("-"); // Clave única basada en nombre, código y hex
    if (!colorMap.has(colorKey)) {
      colorMap.set(colorKey, colorCounter++);
    }
  });

  const xRegions = distribuirEnGrupos(xBlocks, regionSize);
  const yRegions = distribuirEnGrupos(yBlocks, regionSize);

  let currentPage = 1;

  for (let regionYIndex = 0, startY = 0; regionYIndex < yRegions.length; regionYIndex++) {
    const regionHeight = yRegions[regionYIndex];

    for (let regionXIndex = 0, startX = 0; regionXIndex < xRegions.length; regionXIndex++) {
      const regionWidth = xRegions[regionXIndex];

      doc.addPage();

      for (let j = 0; j < regionHeight; j++) {
        for (let i = 0; i < regionWidth; i++) {
          const globalY = startY + j;
          const globalX = startX + i;

          if (globalY >= yBlocks || globalX >= xBlocks) continue;

          const index = globalY * xBlocks + globalX;
          const height = modifiedHeights[index];
          const colorDetail = colorDetails[index];
          const colorKey = colorDetail.slice(1, 4).join("-");
          const colorNumber = colorMap.get(colorKey); // Número único del color
          const [r, g, b] = colorDetail[4]; // RGB

          // Dibujar el rectángulo del bloque con color de fondo
          doc.rect(
            5 + i * tileSize,
            5 + j * tileSize,
            tileSize,
            tileSize
          );

          // Agregar número del color y altura
          doc.setFontSize(4);
          doc.setTextColor(0, 0, 0); // Color del texto negro para contraste
          doc.text(
            `${colorNumber}`,
            5 + i * tileSize + tileSize / 2,
            5 + j * tileSize + tileSize / 3,
            { align: "center" }
          );
          doc.text(
            `${decimalToMixedFraction((height / INCH).toFixed(3))}`,
            5 + i * tileSize + tileSize / 2,
            5 + j * tileSize + (2 * tileSize) / 3,
            { align: "center" }
          );
        }
      }

      doc.setFontSize(12);

      doc.text(
        `Región (${regionYIndex + 1}, ${regionXIndex + 1}) - Página ${currentPage}`,
        10,
        pageHeight + 5
      );

      currentPage++;
      startX += regionWidth;
    }

    startY += regionHeight;
  }

  // Guardar el PDF
  doc.save("matriz_bloques_blanco.pdf");
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

    const splitLines = doc.splitTextToSize(heightsText, pageWidth - 40);
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


export {GeneratePDFButton, GenerateGripWhite, GenerarPDFAgrupados};



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
  
