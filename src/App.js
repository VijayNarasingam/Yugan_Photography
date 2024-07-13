import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Components/Home'
import GalleryPage from './Components/GalleryPage/GalleryPage'
import AboutUs from './Components/About/AboutUs'



function App() {
 

  return (
    <BrowserRouter>
    <Routes>
      <Route path='/Yugan_Photography' element={<Home/>}/>
      <Route path='/Gallery' element={<GalleryPage/>} />
      <Route path='/About' element={<AboutUs/>} />
    </Routes>
    </BrowserRouter>
  )
}

export default App

