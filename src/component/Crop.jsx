import { useState, useEffect, useContext, useRef } from 'react';
import * as THREE from 'three';
import Cropper from 'react-easy-crop';
import "react-easy-crop/react-easy-crop.css";
import './Crop.css';
import getCroppedImg from '../lib/cropImage';
import pixelateImg from "../lib/pixelate";
import { ImageContext } from '../context/ImageContext';
import { ExperienceContext } from '../context/ExperienceContext'; 
//import ImageSidebar from './ImageSidebar';
import { pixelate16 } from '../lib/pixel16';
//import Barloader from "react-spinners/ClipLoader";


const Crop = () => {

  const {blockSize,
      setBlockSize,      
      setXBlocks,      
      setYBlocks,
      setHeights,
      selectedDepthMap,
      selectedImage,      
      setModalOpen,
      frameWidth, setFrameWidth,
      frameHeight, setFrameHeight} = useContext(ImageContext);
  
  const {setColorArray, processing, setProcessing, setColorDetails} = useContext(ExperienceContext);  
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  //const [pxImg, setPxImg] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null)

  const imgInputRef = useRef(null);


  useEffect(() => {
    if (selectedImage) {
      createImage(selectedImage)
        .then(image => {
          // Convert image to data URL
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, image.width, image.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          setImageSrc(dataUrl);
        })
        .catch(console.error);
    }
  }, [selectedImage]);


  const loadDepthMap = async (ajustedImg, pxImg, xBlocks, yBlocks) => {
    try {
      //saveCroppedImage(ajustedImg, 'para_enviar_marigold_redimensionada.jpg')
      const responseFromUrl = await fetch(ajustedImg);//esta es la imagen redimensionada
      const blob = await responseFromUrl.blob(); 

      const formData = new FormData();
      formData.append("file", blob); 

      // Realizar la solicitud a la API
      const response = await fetch("https://rrnoa-woodxel-marigold-v2.hf.space/predict-depth/", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`);
      }
  
      // Recibir la imagen de profundidad como blob
      const depthBlob = await response.blob();

      // Opción de descarga
     /*  const downloadLink = document.createElement("a");
      const depthUrl = URL.createObjectURL(depthBlob);
      downloadLink.href = depthUrl;
      downloadLink.download = "depth_map.png"; // Nombre del archivo descargado
      downloadLink.click(); */
 
      const arrayBuffer = await depthBlob.arrayBuffer();
  
      // Procesar la imagen de profundidad
      pixelate16(arrayBuffer, pxImg, xBlocks, yBlocks, (alturas) => {
        console.log("en Crop",alturas)
        setHeights(alturas);
        setProcessing(false);
      });
    } catch (error) {
      console.error("Error loading depth map image:", error);
    }
  };
  

  const base64ToBlob = (pxImg) => {
    const base64Data = pxImg.split(",")[1]; // Remover el prefijo "data:image/png;base64,"
    const binaryData = atob(base64Data);
    const byteNumbers = Array.from(binaryData, (char) => char.charCodeAt(0));
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: "image/png" });
    return blob
  };

  const pixelateImgHandler = async () => {
    setProcessing(true);
    const PixelObj = await pixelateImg(croppedImage, frameWidth, frameHeight, blockSize);

    //saveCroppedImage(PixelObj.imageURL, 'pixelada.jpg')
    //console.log("PixelObj.xBlocks, PixelObj.yBlocks", PixelObj.xBlocks, PixelObj.yBlocks, croppedAreaPixels.x, croppedAreaPixels.y)

    await loadDepthMap(PixelObj.imageAjustedURL, PixelObj.imagePixelURL, PixelObj.xBlocks, PixelObj.yBlocks)

      //setPxImg(PixelObj.imageURL);    
    
    setXBlocks(PixelObj.xBlocks);
    setYBlocks(PixelObj.yBlocks); 
      

    //aqui utilizar colordetails en lugar de allcolors
    //cuando el usuario copia un color CTRL+C en Experience deberia copiar colordetails y convertirlo usando esta misma formula
    //
    const colors = new Float32Array(PixelObj.xBlocks * PixelObj.yBlocks * 3);
    PixelObj.colorDetails.forEach((color, i) => {
      const colorObj = new THREE.Color(`rgb(${color[4][0]}, ${color[4][1]}, ${color[4][2]})`);
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    });
    console.log("setColorArray(colors)", colors)
    setColorArray(colors); 
    setColorDetails(PixelObj.colorDetails)

  }

  const handlerAplicar = async() => {
    await pixelateImgHandler();
    setModalOpen(false);
  }

  const onCropComplete = async (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImage);     
            
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const saveCroppedImage = (croppedImageUrl, fileName = "cropped_img.jpeg") => {
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

  const handleFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result); // Guarda la imagen en formato Base64
      };
      reader.readAsDataURL(file);
  
      setUploadedFile(file); // Guarda el archivo original
    }
  };

   return (
   <>

    <div className="new-screen-container">
      <div className="main-area">
        {!imageSrc ? (
          <div
            className="upload-area"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              handleFile(file);
            }}
            onClick={() => imgInputRef.current.click()}
          >
            <p>Haz clic o arrastra una imagen aquí para cargarla</p>
          </div>
        ) : (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={frameWidth / frameHeight}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            zoomSpeed={0.2}
          />
        )}
        <input
          type="file"
          accept=".png, .jpg, .jpeg"
          ref={imgInputRef}
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
      {imageSrc && (
        <div className="image-controls">
          <button onClick={() => imgInputRef.current.click()}>
            Cambiar imagen
          </button>
        </div>
      )}
      <div className="bottom-section">
        <div className="input-group">
          <label htmlFor="width">Ancho:</label>
          <input
            type="number"
            value={frameWidth}
            onChange={(e) => setFrameWidth(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="height">Alto:</label>
          <input
            type="number"
            value={frameHeight}
            onChange={(e) => setFrameHeight(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="blockSize">Ancho del bloque:</label>
          <select
            value={blockSize}
            onChange={(e) => setBlockSize(Number(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={0.375}>0.375</option>
            <option value={0.5}>0.5</option>
          </select>
        </div>
        <button onClick={() => handlerAplicar()}>
          <span className="ok desktop-text">Aceptar</span>
          <span className="ok mobile-text">Ok</span>
        </button>
        <button onClick={() => setModalOpen(false)}>
          <span className="cancel desktop-text">Cancelar</span>
          <span className="cancel mobile-text">X</span>
        </button>
      </div>
    </div>

   </>    
  );
};

async function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}


export default Crop;

