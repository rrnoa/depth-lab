import Experience from "./component/Experience"
import './App.css'
import LeftSideBar from "./component/LeftSideBar"
import { Canvas } from "@react-three/fiber"
import * as THREE from 'three'
import ModalCrop from "./component/ModalCrop"
import { useContext, useState } from "react"
import { ImageContext } from './context/ImageContext';
import { Stage } from "@react-three/drei"
import { useControls } from "leva"


function App() { 

  const {lightIntensity, preset, enviroment} = useControls('Scene', {    
    lightIntensity: {value: 1, min:0, max:4, step:0.1},
    preset: {options: ['portrait', 'rembrandt', 'upfront', 'soft']},
    enviroment: {options: ['city', 'studio', 'sunset','dawn','night','warehouse','forest','apartment','park','lobby']}
  });
  const {modalOpen} = useContext(ImageContext); 
    return (
      <div className="canvas-container" style={{width:'100%', height: '100%'}}>
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
            far: 1,           
        } }
        style={{ width: '100%', height: '100%' }}
      >
        {/* <directionalLight position={[1, 1, 1]} /> */}
        <Stage intensity={lightIntensity} preset={preset} environment={enviroment}>
        <Experience></Experience>

        </Stage>
      </Canvas>
      {<ModalCrop isOpen={modalOpen}/>}
        
      </div>
    )
    
}

export default App
