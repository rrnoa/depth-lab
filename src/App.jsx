import Experience from "./component/Experience"
import './App.css'
import LeftSideBar from "./component/LeftSideBar"
import { Canvas } from "@react-three/fiber"
import * as THREE from 'three'
import ModalCrop from "./component/ModalCrop"
import { useContext, useState } from "react"
import { ImageContext } from './context/ImageContext';
import { Stage } from "@react-three/drei"


function App() { 
  const {modalOpen} = useContext(ImageContext); 
    return (
      <>
        {/* <LeftSideBar /> */}
      <Canvas
        gl={ {
            antialias: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            outputEncoding: THREE.SRGBEncoding
        } }
        camera={ {
            fov: 45,
            near: 0.1,
            far: 7,           
        } }
      >
        {/* <directionalLight position={[1, 1, 1]} /> */}
        <Stage>
        <Experience></Experience>

        </Stage>
      </Canvas>
      {<ModalCrop isOpen={modalOpen}/>}
        
      </>
    )
    
}

export default App
