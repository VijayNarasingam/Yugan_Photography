import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Components/Home'
import GalleryPage from './Components/GalleryPage/GalleryPage'
import AboutUs from './Components/About/AboutUs'



function App() {
 

  return (
    <BrowserRouter>
    <Routes>
      <Route path='/yugan_photography' element={<Home/>}/>
      <Route path='/gallery' element={<GalleryPage/>} />
      <Route path='/about' element={<AboutUs/>} />
    </Routes>
    </BrowserRouter>
  )
}

export default App

