import React, { useState } from 'react'
import './GalleryPage.css'
import CloseIcon from '../../img/Close.svg'

import img1 from '../../img/gallery/outdoor/img-1.jpeg'
import img2 from '../../img/gallery/outdoor/img-2.jpeg'
import img3 from '../../img/gallery/outdoor/img-10.jpeg'
import img4 from '../../img/gallery/outdoor/img-11.jpeg'
import img5 from '../../img/gallery/outdoor/img-12.jpeg'
import img6 from '../../img/gallery/outdoor/img-3.jpeg'
import img7 from '../../img/gallery/outdoor/img-4.jpeg'
import img8 from '../../img/gallery/outdoor/img-5.jpeg'
import img9 from '../../img/gallery/outdoor/img-6.jpeg'
import img10 from '../../img/gallery/outdoor/img-7.jpeg'
import img11 from '../../img/gallery/outdoor/img-8.jpeg'
import img12 from '../../img/gallery/outdoor/img-9.jpeg'



const GalleryPage = () => {

  let data =[
      {
        id: 1,
        imgSrc: img1,
      },
      {
        id: 2,
        imgSrc: img2,
      },
      {
        id: 3,
        imgSrc: img3,
      },
      {
        id: 4,
        imgSrc: img4,
      },
      {
        id: 5,
        imgSrc: img5,
      },
      {
        id: 6,
        imgSrc: img6,
      },
      {
        id: 7,
        imgSrc: img7,
      },
      {
        id: 8,
        imgSrc: img8,
      }, {
        id: 9,
        imgSrc: img9,
      },
      {
        id: 10,
        imgSrc: img10,
      },
      {
        id: 11,
        imgSrc: img11,
      },
      {
        id: 12,
        imgSrc: img12,
      },
    
  ]  

  const [model, setModel] = useState(false);
  const [tempImgSrc, setTempImgSrc] = useState('');

  const getImg =(imgSrc)=>{
      setTempImgSrc(imgSrc);
      setModel(true);

  }

  return (
    <div>

      <div className={model? "model open": "model"}>
          <img src={tempImgSrc} alt="" />
          <div className="close"><img src={CloseIcon} onClick={()=> setModel(false)} /></div>
      </div>

      <h1>gallery</h1>

      <div className="gallery">

          {data.map((item, index)=>{
            return(
              <div className="pics" key={index} onClick={()=> getImg(item.imgSrc)}>
                <img src={item.imgSrc} />
              </div>
            )
          })}

      </div>

    </div>
  )
}

export default GalleryPage
