import {createContext, useState} from "react"

export const ExperienceContext = createContext();

const ExperienceContextProvider = ({children}) => {
  const [modifiedHeights, setModifiedHeights] = useState([]);
  const [colorArray, setColorArray] = useState(new Float32Array());
  
  const data = { 
    modifiedHeights, setModifiedHeights,
    colorArray, setColorArray  
  }

  return ( 
    <ExperienceContext.Provider value={data}>
        {children}
    </ExperienceContext.Provider>   
  )
}

export default ExperienceContextProvider