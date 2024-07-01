import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls} from '@react-three/drei';
import { button, useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { ImageContext } from '../context/ImageContext';
import { escalarPulgadas, smoothHeightMapContrast } from '../lib/Filters';

const tempObject = new THREE.Object3D();
const INCH_TO_METERS = 0.0254;

function Experience() {
  
  const { setModalOpen, heights, xBlocks, yBlocks, allColors, blockSize } = useContext(ImageContext); 
  const meshRef = useRef();

  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const [selectedHeight, setSelectedHeight] = useState(0);
  const [modifiedHeights, setModifiedHeights] = useState(heights.map(height => height));

  const { perfVisible } = useControls('Inicio',{
    perfVisible: true,
    cropImg: button(() => setModalOpen(true)),
  });

  const { cutHeight, maxScaleFactor, delta } = useControls('Escalar',{
    cutHeight: {value: 0.5, step: 0.01, min: 0, max: 1},
    maxScaleFactor: {value: 5, step: 0.01, min: 0, max: 20},
    delta: {options: [0.125, 0.25, 0.5, 1]}
  });

  const { smoothEdges, toneMapped } = useControls('Filters',{
    smoothEdges: false,
    toneMapped: false
  });

  const { selectedHeightControl } = useControls('Selected Block', {
    selectedHeightControl: {
      //value: selected !== null ? modifiedHeights[selected]: 0,
      value: 0,
      step: 0.125,
      min: 0,
      max: 20,
      onChange: (value) => {
        if (selected !== null) {
          console.log(value);
          const newHeights = [...modifiedHeights];
          newHeights[selected] = value;
          setModifiedHeights(newHeights);
        }
      }
    }
  });

  const scaledHeights = useMemo(() => {
    return processHeights(heights, xBlocks, yBlocks, cutHeight, maxScaleFactor, delta, smoothEdges);
  },[heights,xBlocks, yBlocks, cutHeight, maxScaleFactor, delta, smoothEdges])

  const colorArray = useMemo(() => {
    const colors = new Float32Array(xBlocks * yBlocks * 3); // Tres componentes por vértice (R, G, B)
    allColors.forEach((color, i) => {
      colors[i * 3] = color[0] / 255 ;
      colors[i * 3 + 1] = color[1] / 255;
      colors[i * 3 + 2] = color[2] / 255;
    });
    return colors;
  }, [allColors, xBlocks, yBlocks]);

  useEffect(() => {
    const mesh = meshRef.current;
    const colors = new Float32Array(colorArray);

    if (hovered !== null) {
      colors[hovered * 3] = 1;
      colors[hovered * 3 + 1] = 0.5;
      colors[hovered * 3 + 2] = 0;
    }

    if (selected !== null) {
      colors[selected * 3] = 1;
      colors[selected * 3 + 1] = 0;
      colors[selected * 3 + 2] = 0;
    }

    mesh.geometry.attributes.color.array = colors;
    mesh.geometry.attributes.color.needsUpdate = true;
  }, [hovered, selected, colorArray]);



  useEffect(() => {   
    console.log("cambiando") 
    const blockSizeInch = blockSize * INCH_TO_METERS;
    const mesh = meshRef.current;
    let i = 0;
    for (let j = 0; j < yBlocks; j++) {
      for (let k = 0; k < xBlocks; k++) {
        const id = i++;
        const height = selected === id ? modifiedHeights[id] : scaledHeights[id];
        tempObject.position.set(
          k * blockSizeInch - (xBlocks * blockSizeInch) / 2,
          (yBlocks - j - 1) * blockSizeInch - (yBlocks * blockSizeInch) / 2,
          height / 2
        );
        tempObject.scale.set(1, 1, height);
        tempObject.updateMatrix();
        mesh.setMatrixAt(id, tempObject.matrix);
      }
    }
    /* if (selected !== null) {
      tempObject.position.set(
        (selected % xBlocks) * blockSizeInch - (xBlocks * blockSizeInch) / 2,
        (yBlocks - 1 - Math.floor(selected / xBlocks)) * blockSizeInch - (yBlocks * blockSizeInch) / 2,
        selectedHeight * INCH_TO_METERS / 2
      );
      tempObject.scale.set(1, 1, selectedHeight * INCH_TO_METERS);
      tempObject.updateMatrix();
      mesh.setMatrixAt(selected, tempObject.matrix);
    } */
    mesh.geometry.attributes.color.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
  }, [scaledHeights, modifiedHeights, selected, blockSize, xBlocks, yBlocks]); 

  return (
    <>
      {perfVisible? <Perf position="top-left"/>: null}
      <OrbitControls />
      <instancedMesh 
      ref={meshRef} 
      args={[null, null, xBlocks * yBlocks]}
      castShadow 
      receiveShadow
      onPointerMove={(e) => {
        e.stopPropagation();
        setHovered(e.instanceId);
      }}
      onPointerOut={(e) => {
        setHovered(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(e.instanceId);
        setSelectedHeight(modifiedHeights[e.instanceId]);
      }}
      >
        <boxGeometry args={[blockSize * INCH_TO_METERS, blockSize * INCH_TO_METERS, 1]}>
          <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </boxGeometry>
        <meshStandardMaterial toneMapped={toneMapped} vertexColors/>
      </instancedMesh>      
    </>
  );
}

const processHeights = (heights, xBlocks, yBlocks, cutHeight = 0.5, maxScaleFactor = 10, delta = 0.0254, smoothEdges = false) => {
  maxScaleFactor = maxScaleFactor * 0.0254;
  delta = delta * 0.0254;
  //const depthMin = Math.min(...heights);
  const depthMax = Math.max(...heights);

  let alturas = heights.map(height => depthMax - height);

  //recortar las alturas
  for (let index = 0; index < alturas.length; index++) {
    if ( alturas[index] < cutHeight * depthMax) {
        alturas[index] = cutHeight * depthMax;
    }       
  }

  //Llevarlo a que quepa en 10 pulgadas. Me dice que parte de las 10 pulgadas representa cada altura
    //(heights[i] - depthMin) / (depthMax - depthMin); me da un valor de 0-1
    //en definitiva me devuelve alturas entre 0 y 0.254/2 (estamos usando 5 pulgadas) 
  const depthMinCropped = Math.min(...alturas);
  const depthMaxCropped = Math.max(...alturas);
  let alturasPulgadas= [];
  for (let i = 0; i < alturas.length; i++) {
    alturasPulgadas.push(maxScaleFactor * (alturas[i] - depthMinCropped) / (depthMaxCropped - depthMinCropped)) ;
    if(alturasPulgadas[i] === 0) alturasPulgadas[i] = 0.0254/2 // que el fondo sea de media pulgada minimo
  }  

  if (smoothEdges) alturasPulgadas = smoothHeightMapContrast(alturasPulgadas, xBlocks, yBlocks, 2, 0.0254 / 2);
  
  //Manejar los escalones
  return escalarPulgadas(alturasPulgadas, maxScaleFactor, delta);
};

export default Experience;
