import Experience from "./component/Experience"
import './App.css'
import { Canvas } from "@react-three/fiber"
import * as THREE from 'three'
import ModalCrop from "./component/ModalCrop"
import { useContext, useRef } from "react"
import { ImageContext } from './context/ImageContext';
import { Stage } from "@react-three/drei"
import { button, useControls } from "leva"
import { ExperienceContext } from "./context/ExperienceContext"
import { loadDataFromFile } from "./lib/storageUtils"
import { color } from "three/examples/jsm/nodes/Nodes.js"

function App() {   
  const fileInputRef = useRef(null);

  const {lightIntensity, preset, enviroment} = useControls('Scene', {    
    lightIntensity: {value: 1, min:0, max:4, step:0.1},
    preset: {options: ['portrait', 'rembrandt', 'upfront', 'soft']},
    enviroment: {options: ['city', 'studio', 'sunset','dawn','night','warehouse','forest','apartment','park','lobby']}
  });
  const {modalOpen} = useContext(ImageContext);
  const {setModifiedHeights, setColorArray, setColorDetails} = useContext(ExperienceContext);
  const {    
    setBlockSize,           
    setXBlocks,      
    setYBlocks,
  } = useContext(ImageContext);


  useControls('Cargar Datos', {
    cargar: button(() => {
      fileInputRef.current.click();
    })
  });

  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (file) {
      loadDataFromFile(file, (data) => {
        // Actualizar los estados del contexto
        setModifiedHeights(data.heights);  
        setBlockSize(data.blockSize);
        setXBlocks(data.xBlocks);
        setYBlocks(data.yBlocks)
        setColorDetails(data.colorDetails)
        const colors = new Float32Array(data.colorDetails.length * 3);
        data.colorDetails.forEach((color, i) => {
              const colorObj = new THREE.Color(`rgb(${color[4][0]}, ${color[4][1]}, ${color[4][2]})`);
              colors[i * 3] = colorObj.r;
              colors[i * 3 + 1] = colorObj.g;
              colors[i * 3 + 2] = colorObj.b;
            });        
        setColorArray(colors);        
      });
    }
  };

    return (       
      <div id="canvas-container" className="canvas-container" style={{width:'100%', height: '100%'}}>
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
