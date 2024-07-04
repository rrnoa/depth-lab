import Experience from "./component/Experience"
import './App.css'
import LeftSideBar from "./component/LeftSideBar"
import { Canvas } from "@react-three/fiber"
import * as THREE from 'three'
import ModalCrop from "./component/ModalCrop"
import { useContext, useRef, useState } from "react"
import { ImageContext } from './context/ImageContext';
import { Stage } from "@react-three/drei"
import { button, useControls } from "leva"
import { ExperienceContext } from "./context/ExperienceContext"
import { loadDataFromFile } from "./lib/storageUtils"

function App() {   
  const fileInputRef = useRef(null);

  const {lightIntensity, preset, enviroment} = useControls('Scene', {    
    lightIntensity: {value: 1, min:0, max:4, step:0.1},
    preset: {options: ['portrait', 'rembrandt', 'upfront', 'soft']},
    enviroment: {options: ['city', 'studio', 'sunset','dawn','night','warehouse','forest','apartment','park','lobby']}
  });
  const {modalOpen} = useContext(ImageContext);
  const {setModifiedHeights, setColorArray} = useContext(ExperienceContext);

  useControls('Cargar Datos', {
    cargar: button(() => {
      fileInputRef.current.click();
    })
  });

  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (file) {
      loadDataFromFile(file, (data) => {
        console.log(data)
        // Actualizar los estados del contexto
        setModifiedHeights(data.heights);
        const colors = new Float32Array(data.colors.length * 3);
        data.colors.forEach((color, i) => {
          colors[i * 3] = color[0] / 255;
          colors[i * 3 + 1] = color[1] / 255;
          colors[i * 3 + 2] = color[2] / 255;
        });
        setColorArray(colors);
      });
    }
  };

    return (    
      <div className="canvas-container" style={{width:'100%', height: '100%'}}>
      <Canvas
        frameloop="demand"
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
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleLoad}
      /> 
      </div>
    )
    
}

export default App
