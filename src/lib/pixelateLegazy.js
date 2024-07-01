export function pixelateImageLegacy(sourceImage, dpi, blockSizeInch = 1, callback) {
    const blockPixelSize = blockSizeInch * dpi;

    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Esto es útil si la imagen está en un dominio diferente
    img.src = sourceImage;
  
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');  

      console.log("DImensiones mapa de profundiad Original",img.width, img.height)
      // Ajustar el tamaño del canvas al tamaño reducido
      const newWidth = Math.floor(img.width / blockPixelSize); 
      const newHeight = Math.floor(img.height / blockPixelSize);

      console.log("DImensiones mapa de profundiad pequeño", newWidth, newHeight)
  
      canvas.width = newWidth;
      canvas.height = newHeight;
  
      // Dibujar la imagen reducida en el canvas
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
  
      // Crear un segundo canvas para escalar de vuelta a tamaño original
      const canvasGrande = document.createElement('canvas');
      const ctxGrande = canvasGrande.getContext('2d');
      canvasGrande.width = img.width;
      canvasGrande.height = img.height;
      ctxGrande.imageSmoothingEnabled = false; // Deshabilitar suavizado para efecto pixelado
  
      console.log("img.width, img.height", img.width, img.height);
      // Dibujar la imagen pixelada en el canvas grande
      ctxGrande.drawImage(canvas, 0, 0, newWidth, newHeight, 0, 0, img.width, img.height);
  
      // Convertir el canvas a una URL de imagen
      const pixelatedImageUrl = canvasGrande.toDataURL();
  
      // Extraer los datos de píxeles de la imagen reducida
      const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
      const alturas = [];
      for (let i = 0; i < imageData.data.length; i += 4) {
        // Obtener solo los valores RGB de cada píxel
        alturas.push(imageData.data[i]);
      }
      //newWidth es la cantidad de bloques en x
      //newHeight es la cantidad de bloques en y
      callback(alturas, newWidth, newHeight, pixelatedImageUrl);
    };
  
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      callback(null, null, error);
    };
  }