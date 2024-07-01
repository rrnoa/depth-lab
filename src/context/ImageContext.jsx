import {createContext, useState} from "react"

export const ImageContext = createContext();

const ImageContextProvider = ({children}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDepthMap, setSelectedDepthMap] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [xBlocks, setXBlocks] = useState(0);
  const [yBlocks, setYBlocks] = useState(0);
  const [frameWidth, setFrameWidth] = useState(40);
  const [frameHeight, setFrameHeight] = useState(40);
  const [blockSize, setBlockSize] = useState(0.5);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [allColors, setAllColors] = useState([]);
  const [heights, setHeights] = useState([]);


  const data = {
    xBlocks, setXBlocks,
    yBlocks, setYBlocks,
    selectedImage, setSelectedImage,
    selectedDepthMap, setSelectedDepthMap,
    croppedImage, setCroppedImage,
    croppedAreaPixels, setCroppedAreaPixels,
    blockSize, setBlockSize,
    modalOpen, setModalOpen,
    imageSrc, setImageSrc,
    allColors, setAllColors,
    heights, setHeights,
    frameWidth, setFrameWidth,
    frameHeight, setFrameHeight
  }

  return ( 
    <ImageContext.Provider value={data}>
        {children}
    </ImageContext.Provider>   
  )
}

export default ImageContextProvider
