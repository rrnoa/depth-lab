import React, { useContext } from 'react'
import Cropper from 'react-easy-crop';
import ReactModal from 'react-modal';
import { ImageContext } from '../context/ImageContext';
import Crop from './Crop';

ReactModal.setAppElement('#root')

const ModalCrop = ({isOpen}) => {

  return (
    <ReactModal
        isOpen={isOpen}
    >
    <Crop/>
    </ReactModal>
  )
}

export default ModalCrop