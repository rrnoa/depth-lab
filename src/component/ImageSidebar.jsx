import React, { useContext } from 'react';
import './ImageSidebar.css';
import { ImageContext } from '../context/ImageContext';

const ImageSidebar = () => {

  const {setSelectedImage, setSelectedDepthMap} = useContext(ImageContext);

  const imagePairs = [
    { image: '1.png', depthMap: '1_depth.png' },
    { image: '2.jpg', depthMap: '2_depth.png' },
    { image: '3.jpeg', depthMap: '3_depth.png' },
    { image: '4.jpg', depthMap: '4_depth.png' },
    { image: '5.jpg', depthMap: '5_depth.png' },
    { image: '6.jpg', depthMap: '6_depth.png' },
    { image: '7.jpg', depthMap: '7_depth.png' },
    { image: '8.jpg', depthMap: '8_depth.png' },
    { image: '9.jpg', depthMap: '9_depth.png' },
    { image: '10.jpg', depthMap: '10_depth.png' },
    { image: '11.jpg', depthMap: '11_depth.png' },
    { image: '12.jpg', depthMap: '12_depth.png' },
    { image: '13.jpeg', depthMap: '13_depth.png' },
    { image: '14.jpg', depthMap: '14_depth.png' },
    { image: '15.jpeg', depthMap: '15_depth.png' },
    { image: '16.jpg', depthMap: '16_depth.png' },
  ];

  const clickHandler = (pair)=> {
    setSelectedImage(`/img/${pair.image}`);
    setSelectedDepthMap(`/img/${pair.depthMap}`);
  }


  return (
    <div className="image-sidebar">
      {imagePairs.map((pair, index) => (
        <img
          key={index}
          src={`/img/${pair.image}`}
          alt={`Image ${index + 1}`}
          className="sidebar-image"
          //onClick={() => { setSelectedImage(`/img/${pair.image}`, `/img/${pair.depthMap}`); }}
          onClick={() => { clickHandler(pair) }}
        />
      ))}
    </div>
  );
};

export default ImageSidebar;
