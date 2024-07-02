import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
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
  const [modifiedHeights, setModifiedHeights] = useState([]);

  const { perfVisible } = useControls('Inicio', {
    perfVisible: false,
    cropImg: button(() => setModalOpen(true)),
  });

  const { cutHeight, maxScaleFactor, delta } = useControls('Escalar', {
    cutHeight: { value: 0.5, step: 0.01, min: 0, max: 1 },
    maxScaleFactor: { value: 5, step: 0.01, min: 0, max: 20 },
    delta: { options: [0.125, 0.25, 0.5, 1] }
  });

  const { smoothEdges, toneMapped } = useControls('Filters', {
    smoothEdges: false,
    toneMapped: true
  });

  const [, setBlockColor] = useControls("Copiar Colores",()=> ({
    blockColor: 'green',
  }))

  const scaledHeights = useMemo(() => {
    return processHeights(heights, xBlocks, yBlocks, cutHeight, maxScaleFactor, delta, smoothEdges);
  }, [heights, xBlocks, yBlocks, cutHeight, maxScaleFactor, delta, smoothEdges]);

  useEffect(() => {
    setModifiedHeights(scaledHeights);
  }, [scaledHeights]);

  const colorArray = useMemo(() => {
    const colors = new Float32Array(xBlocks * yBlocks * 3);
    allColors.forEach((color, i) => {
      colors[i * 3] = color[0] / 255;
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
      //set({r: colors[selected * 3], g: colors[selected * 3 + 1], b: colors[selected * 3 + 2]})
      console.log(`rgb(${colors[selected * 3]*255},${colors[selected * 3 + 1]*255}, ${colors[selected * 3 + 2]*255})`)
      setBlockColor({blockColor: `rgb(${colors[selected * 3]*255},${colors[selected * 3 + 1]*255}, ${colors[selected * 3 + 2]*255})`})
      colors[selected * 3] = 1;
      colors[selected * 3 + 1] = 0;
      colors[selected * 3 + 2] = 0;
    }

    mesh.geometry.attributes.color.array = colors;
    mesh.geometry.attributes.color.needsUpdate = true;
  }, [hovered, selected, colorArray]);

  useEffect(() => {
    const blockSizeInch = blockSize * INCH_TO_METERS;
    const mesh = meshRef.current;
    let i = 0;
    for (let j = 0; j < yBlocks; j++) {
      for (let k = 0; k < xBlocks; k++) {
        const id = i++;
        const height = modifiedHeights[id];
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
    mesh.instanceMatrix.needsUpdate = true;
  }, [modifiedHeights, blockSize, xBlocks, yBlocks]);

  const handleBlockClick = (e) => {
    e.stopPropagation();
    const instanceId = e.instanceId;
    if (e.ctrlKey) {
      setModifiedHeights(prevHeights => {
        const newHeights = [...prevHeights];
        newHeights[instanceId] += delta * INCH_TO_METERS;
        return newHeights;
      });
    } else if (e.shiftKey) {
      setModifiedHeights(prevHeights => {
        const newHeights = [...prevHeights];
        newHeights[instanceId] = Math.max(newHeights[instanceId] - delta * INCH_TO_METERS, 0.0254 / 2);
        return newHeights;
      });
    } else {
      setSelected(instanceId);
    }
  };


  return (
    <>
      {perfVisible ? <Perf position="top-left" /> : null}
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
        onPointerOut={() => {
          setHovered(null);
        }}
        onClick={handleBlockClick}
      >
        <boxGeometry args={[blockSize * INCH_TO_METERS, blockSize * INCH_TO_METERS, 1]}>
          <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </boxGeometry>
        <meshStandardMaterial toneMapped={toneMapped} vertexColors />
      </instancedMesh>
    </>
  );
}

const processHeights = (heights, xBlocks, yBlocks, cutHeight = 0.5, maxScaleFactor = 10, delta = 0.0254, smoothEdges = false) => {
  maxScaleFactor = maxScaleFactor * 0.0254;
  delta = delta * 0.0254;
  const depthMax = Math.max(...heights);

  let alturas = heights.map(height => depthMax - height);

  for (let index = 0; index < alturas.length; index++) {
    if (alturas[index] < cutHeight * depthMax) {
      alturas[index] = cutHeight * depthMax;
    }
  }

  const depthMinCropped = Math.min(...alturas);
  const depthMaxCropped = Math.max(...alturas);
  let alturasPulgadas = [];
  for (let i = 0; i < alturas.length; i++) {
    alturasPulgadas.push(maxScaleFactor * (alturas[i] - depthMinCropped) / (depthMaxCropped - depthMinCropped));
    if (alturasPulgadas[i] === 0) alturasPulgadas[i] = 0.0254 / 2;
  }

  if (smoothEdges) alturasPulgadas = smoothHeightMapContrast(alturasPulgadas, xBlocks, yBlocks, 2, 0.0254 / 2);

  return escalarPulgadas(alturasPulgadas, maxScaleFactor, delta);
};

export default Experience;
