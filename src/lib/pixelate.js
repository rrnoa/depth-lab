
export default function pixelateImg(croppedImageSrc, frameWidth, frameHeight, blockSize ) {  
  //recuerda que le numeor de pulgadas es fijo, al final la suma de bloques tiene que dar esa longitud

  const xBlocks = Math.floor(frameWidth / blockSize); // si son 0.5 pulgadas entonces es el doble de bloqes
  const yBlocks = Math.floor(frameHeight / blockSize);

  // Set canvas size
  return new Promise((resolve, reject) => {
    const croppedImage = new Image();
    croppedImage.src = croppedImageSrc;
    

    croppedImage.onload = () => {
      //saveCroppedImage(croppedImageSrc,"sin_pixel_solo_crop.jpg")
      let ctxSettings = {
        willReadFrequently: true,
        mozImageSmoothingEnabled: false,
        webkitImageSmoothingEnabled: false,
        imageSmoothingEnabled: false,
      };

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", ctxSettings);


      let canvasWidth = croppedImage.width; // Ancho fijo

      const blockPixelSize = Math.max(Math.floor(canvasWidth / xBlocks), 1);

      let width = blockPixelSize * xBlocks;
      let height = blockPixelSize * yBlocks;
      canvas.width = width;
      canvas.height = height;


      // Dibujar la imagen redimensionada en el canvas
      ctx.drawImage(
        croppedImage,
        0,
        0,
        croppedImage.width,
        croppedImage.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      //la  imagen cropeada(croppedImage) ahora se ajustó a nuevas dimensiones
      //en lugar ed hacerle un crop lo que se hace es redimensionar

      let imageAjusted = canvas.toDataURL() //salva la imagen antes de ser pixelada, esta ser'a la imagen que enviaremos a marigold

      // Get image data in form of array of pixels (RGBA) not array of arrays
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const imData = imageData.data;

      let workerUrl = 'woodxel-resources/js/pixelWorker.js';
      if (import.meta.env.MODE !== 'development') {
        workerUrl = new URL('woodxel-resources/js/pixelWorker.js', window.location.origin).href;
        console.log(workerUrl,"workerUrl")
      }	

      const worker = new Worker(workerUrl,{ type: 'module' });
      worker.postMessage({ 
          imData: imData,         
          width: canvas.width,
          height: canvas.height = height,
          xBlockSize: blockPixelSize,
          yBlockSize: blockPixelSize,
          kMeansClusters: 30
      });

      worker.onmessage = function(e) {
        const { allColors, colorDetails} = e.data;
        worker.terminate();

      //construir la imagen pixelada
      let i = 0;
        for (let y = 0; y < canvas.height; y += blockPixelSize) {
          for (let x = 0; x < canvas.width; x += blockPixelSize) {
            
            ctx.clearRect(x, y, blockPixelSize, blockPixelSize);
            
            ctx.fillStyle =  "rgb(" + allColors[i][0] + "," + allColors[i][1] + "," +allColors[i][2] + ")";
            ctx.fillRect(x, y, blockPixelSize, blockPixelSize);
            i++;
          }
        }

        resolve({
          imageAjustedURL: imageAjusted,
          imagePixelURL: canvas.toDataURL(),
          allColors: allColors,
          colorDetails: colorDetails,
          xBlocks: xBlocks,
          yBlocks: yBlocks
        });
      };
        worker.onerror = function(error) {
          worker.terminate();
          reject(error);
        };      
    };
    croppedImage.onerror = (error) => {
      reject(error);
    };
  });
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
