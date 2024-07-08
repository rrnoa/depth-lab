import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { StrictMode, Suspense } from 'react'
import ImageContextProvider from './context/ImageContext';
import ExperienceContextProvider from "./context/ExperienceContext"

import { Loader } from '@react-three/drei';


ReactDOM.createRoot(document.getElementById('root')).render(
    <ImageContextProvider>
      <ExperienceContextProvider>
        <Suspense>
          <App/>
        </Suspense>
        <Loader/>
      </ExperienceContextProvider>      
    </ImageContextProvider>
)
