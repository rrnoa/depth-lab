import { jsPDF } from "jspdf";

const GeneratePDFButton = (xBlocks, yBlocks, blockSize, modifiedHeights) => {
  const INCH = 0.0254;
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: [216, 279], // Tamaño carta en mm
  });

  // Configuración de bloques por región
  const regionSize = 12; // Cada región tiene un máximo de 12 x 12 bloques
  const pageWidth = 216 - 20; // Ancho del área usable (con márgenes de 10 mm)
  const pageHeight = 279 - 20; // Alto del área usable (con márgenes de 10 mm)
  const tileSize = pageWidth / regionSize; // Tamaño de cada celda en mm

  doc.setFontSize(8);

  let currentPage = 1;

  // Dibujar cada región en páginas individuales
  const totalRegionsX = Math.ceil(xBlocks / regionSize); // Cantidad de regiones horizontales
  const totalRegionsY = Math.ceil(yBlocks / regionSize); // Cantidad de regiones verticales

  for (let regionYIndex = 0; regionYIndex < totalRegionsY; regionYIndex++) {
    for (let regionXIndex = 0; regionXIndex < totalRegionsX; regionXIndex++) {
      doc.addPage();
      doc.setFontSize(8);

      const startX = 10; // Margen izquierdo
      const startY = 10; // Margen superior

      // Dibujar bloques dentro de esta región
      for (let j = 0; j < regionSize; j++) {
        for (let i = 0; i < regionSize; i++) {
          const globalY = regionYIndex * regionSize + j;
          const globalX = regionXIndex * regionSize + i;

          // Validar que no excedamos los límites de la matriz
          if (globalY >= yBlocks || globalX >= xBlocks) continue;

          const index = globalY * xBlocks + globalX;
          const height = modifiedHeights[index];

          // Dibujar el bloque
          doc.rect(
            startX + i * tileSize,
            startY + j * tileSize,
            tileSize,
            tileSize
          );

          // Escribir la altura como fracción
          doc.text(
            `${(height / INCH).toFixed(3)}`,
            startX + i * tileSize + tileSize / 2,
            startY + j * tileSize + tileSize / 2,
            { align: "center", baseline: "middle" }
          );
        }
      }

      // Título para cada página
      doc.text(
        `Región (${regionYIndex + 1}, ${regionXIndex + 1}) - Página ${currentPage}`,
        10,
        pageHeight + 5 // Justo debajo del área usable
      );
      currentPage++;
    }
  }

  // Página final con un grid resumen
  doc.addPage();
  const gridTileSize = pageWidth / totalRegionsX; // Tamaño de cada región en el grid final
  const gridStartX = 10;
  const gridStartY = 10;

  doc.setFontSize(10);
  doc.text("Grid Resumen", pageWidth / 2 + 10, 10, { align: "center" });

  for (let gridY = 0; gridY < totalRegionsY; gridY++) {
    for (let gridX = 0; gridX < totalRegionsX; gridX++) {
      const rectX = gridStartX + gridX * gridTileSize;
      const rectY = gridStartY + gridY * gridTileSize;

      // Dibujar la celda del grid resumen
      doc.rect(rectX, rectY, gridTileSize, gridTileSize);

      // Etiquetar la posición de la región
      doc.text(
        `${gridY + 1}, ${gridX + 1}`,
        rectX + gridTileSize / 2,
        rectY + gridTileSize / 2,
        { align: "center", baseline: "middle" }
      );
    }
  }

  // Guardar el PDF
  doc.save("matriz_bloques.pdf");
};
export default GeneratePDFButton;
