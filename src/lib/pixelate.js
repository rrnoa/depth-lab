
export default function pixelateImg(croppedImageSrc, frameWidth, frameHeight, blockSize ) {  

  const xBlocks = Math.floor(frameWidth / blockSize); // si son 0.5 pulgadas entonces es el doble de bloqes
  const yBlocks = Math.floor(frameHeight / blockSize);
  // Set canvas size
  return new Promise((resolve, reject) => {
    const croppedImage = new Image();
    croppedImage.src = croppedImageSrc;

    croppedImage.onload = () => {
      let ctxSettings = {
        willReadFrequently: true,
        mozImageSmoothingEnabled: false,
        webkitImageSmoothingEnabled: false,
        imageSmoothingEnabled: false,
      };

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", ctxSettings);

      let croppedWidth = croppedImage.width;

      let blockPixelSize = Math.floor(croppedWidth / xBlocks);

      const correctImgWidth = blockPixelSize * xBlocks;//la Longitudes ajustas
      const correctImgHeight = blockPixelSize * yBlocks;//la Longitudes ajustas

      canvas.width = correctImgWidth;
      canvas.height = correctImgHeight;     

      // Draw initial image (en el canvas que esta oculto se dibuja la image con crop)
      ctx.drawImage(
        croppedImage,
        0,
        0,
        correctImgWidth,
        correctImgHeight,
        0,
        0,
        correctImgWidth,
        correctImgHeight
      );

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
          width: correctImgWidth,
          height: correctImgHeight,
          xBlockSize: blockPixelSize,
          yBlockSize: blockPixelSize,
          kMeansClusters: 30
      });

      worker.onmessage = function(e) {
        const { allColors, colorDetails} = e.data;
        worker.terminate();

      //construir la imagen pixelada
      let i = 0;
        for (let y = 0; y < correctImgHeight; y += blockPixelSize) {
          for (let x = 0; x < correctImgWidth; x += blockPixelSize) {
            
            ctx.clearRect(x, y, blockPixelSize, blockPixelSize);
            
            ctx.fillStyle =  "rgb(" + allColors[i][0] + "," + allColors[i][1] + "," +allColors[i][2] + ")";
            ctx.fillRect(x, y, blockPixelSize, blockPixelSize);
            i++;
          }
        }

        resolve({
          imageURL: canvas.toDataURL(),
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
