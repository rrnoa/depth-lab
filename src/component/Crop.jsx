import { useState, useEffect, useContext } from 'react';
import * as THREE from 'three';
import Cropper from 'react-easy-crop';
import "react-easy-crop/react-easy-crop.css";
import './Crop.css';
import getCroppedImg from '../lib/cropImage';
import pixelateImg from "../lib/pixelate";
import { ImageContext } from '../context/ImageContext';
import { ExperienceContext } from '../context/ExperienceContext'; 
import ImageSidebar from './ImageSidebar';
import { pixelate16 } from '../lib/pixel16';
import Barloader from "react-spinners/ClipLoader";

const override = {
  display: "block",
  margin: "0 auto"
};

const Crop = () => {

  const {blockSize,
      setBlockSize,      
      setXBlocks,      
      setYBlocks,
      setHeights,
      selectedDepthMap,
      selectedImage,      
      setModalOpen,
      setAllColors,
      frameWidth, setFrameWidth,
      frameHeight, setFrameHeight} = useContext(ImageContext);
  
  const {setColorArray, processing, setProcessing} = useContext(ExperienceContext);  
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  //const [pxImg, setPxImg] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)


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


  const loadDepthMap = async (pxImg, xBlocks, yBlocks, startX, startY) => {
    try {
      // Fetch the depth map image from the URL      
      const response = await fetch(selectedDepthMap);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      pixelate16(arrayBuffer, pxImg, xBlocks, yBlocks, startX, startY, (alturas) => {
        setHeights(alturas);
        setProcessing(false)
      });
  
    } catch (error) {
      console.error('Error loading depth map image:', error);
    }
  }

  const pixelateImgHandler = async () => {
    setProcessing(true);
    const PixelObj = await pixelateImg(croppedImage, frameWidth, frameHeight, blockSize);
    await loadDepthMap(PixelObj.imageURL, PixelObj.xBlocks, PixelObj.yBlocks, croppedAreaPixels.x, croppedAreaPixels.y)

      //setPxImg(PixelObj.imageURL);
      setAllColors(PixelObj.allColors);
      setXBlocks(PixelObj.xBlocks);
      setYBlocks(PixelObj.yBlocks); 
      
      const colors = new Float32Array(PixelObj.xBlocks * PixelObj.yBlocks * 3);
      PixelObj.allColors.forEach((color, i) => {
        const colorObj = new THREE.Color(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
        colors[i * 3] = colorObj.r;
        colors[i * 3 + 1] = colorObj.g;
        colors[i * 3 + 2] = colorObj.b;
      });
      setColorArray(colors);
  }

  const handlerAplicar = async() => {
    await pixelateImgHandler();
    //await loadDepthMap();
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

   return (
   <>

    <div className="new-screen-container">
      <div className="main-area">
        {imageSrc  && (
          <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={frameWidth / frameHeight}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          zoomSpeed = {0.2}
        />
        )}
      </div>
      <ImageSidebar/>
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
          <label htmlFor="height">Ancho del bloque</label>
          <select
            value={blockSize}
            onChange={(e) => setBlockSize(Number(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={0.5}>0.5</option>
          </select>
        </div> 
        <button onClick={()=>handlerAplicar()}>
          <span className="ok desktop-text">Aceptar</span>
          <span className="ok mobile-text">Ok</span>
        </button>   
        <button onClick={()=>setModalOpen(false)}>
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

