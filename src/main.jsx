import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { StrictMode } from 'react'
import ImageContextProvider from './context/ImageContext';


ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ImageContextProvider>
      <App></App>
    </ImageContextProvider>    
  </StrictMode>
)
