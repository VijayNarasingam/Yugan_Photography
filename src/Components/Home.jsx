import React, { useEffect, useState } from 'react'
import './Home.css'
import ScrollableContainer from './ScrollableContainer'


import wedding from '../img/wedding.jpg'
import birthday from '../img/birthday.jpg'
import logo from '../img/logo.png'
import pic1 from '../img/IMG_0821.jpg'
import pic2 from '../img/IMG_1179.jpg'
import baby from '../img/baby.jpeg'
import festival from '../img/festival.jpeg'


import facebook from '../img/Facebook.png'
import instagram from '../img/Instagram.png'
import twitter from '../img/TwitterX.png'

import mountain from '../img/mountain.png'
import mountain1 from '../img/mountain1.png'
import mountain2 from '../img/mountain2.png'
import photographerClick from '../img/vivid-sitting-photographer1.gif'
import photographerFrame from '../img/photography_drawing1 1.svg'


const Home = () => {

  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(()=>{
      window.addEventListener("scroll", handleScroll);

      return () => window.removeEventListener("scroll", handleScroll);

  },[]);
 


  const imageUrls = [
    { url: wedding, link: '/gallery', text: 'Wedding' },
    { url: birthday, link: '/gallery', text: 'Outdoor' },
    { url: pic1, link: '/gallery', text: 'Indoor' },
    { url: pic2, link: '/gallery', text: 'Candid' },
    { url: baby, link: '/gallery', text: 'Birthday' },
    { url: festival, link: '/gallery', text: 'Link 6' },
    { url: pic2, link: '/gallery', text: 'Link 7' }

];


  return (
    <div className='body'>
      <nav className='flex '>
        <div className='logo'>
            <img src={logo} alt="" />
        </div>
        <div>
            <ul>
                <a href="/"><li>Home</li></a>
                <a href="/"><li>Cam Rent</li></a>
                <a href="/about"><li>About</li></a>
                <a href="/about#aboutContact"><li>Contact</li></a>
            </ul>
        </div>
        <div>
        <a href="https://forms.visme.co/formsPlayer/y4vo60d4-yugan-photography-booking-page"> <button>Book Now</button></a>

        </div>

       </nav>
   {/* ================================================================================================================= */}

      <div className="headbackground">

        <img src={mountain} alt="" className='mountain' />
        <img src={mountain1} alt="" className='mountain1' style={{transform:`translateX(${offsetY * -1}px)`} } />
        <img src={mountain2} alt="" className='mountain2' style={{transform:`translateX(${offsetY * 1}px)`} } />
        <img src={photographerClick} alt="" className='photographer' style={{transform:`translateX(${offsetY * -1}px)`} } />
        <img src={photographerFrame} alt="" className='photoFrame' style={{transform:`translatex(${offsetY * 1}px)`}}/>
        <h1 className='studiotext'  style={{transform:`translateY(${offsetY * -1}px)`}} >Yugan</h1>
        <h1 className='studiotext studiotext2'style={{transform:`translateY(${offsetY * -1}px)`}}>Photography</h1>
      </div>

     

{/* ========================================================================================================================== */}
      <div className="visme_d" data-title="Yugan Photography booking page" data-url="y4vo60d4-yugan-photography-booking-page?fullPage=true" data-domain="forms" data-full-page="true" data-min-height="100vh" data-form-id="80314"></div><script src="https://static-bundles.visme.co/forms/vismeforms-embed.js"></script>

      <div className="divisions">
        <div className="background"  >
              <div className="box1">
                  <img src={wedding} alt="" />
                      <div className="info">
                      <h1>Wedding</h1>
                      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                      <a href="#" className='btn'>Read More</a>
                      </div>
              </div>

              <div className="box1">
                  <img src={birthday} alt="" />
                  <div className="info">
                      <h1>Birthday</h1>
                      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                      <a href="#" className='btn'>Read More</a>
                      </div>
              </div>

              <div className="box1">
                  <img src={pic1} alt="" />
                  <div className="info">
                      <h1>Heading</h1>
                      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                      <a href="#" className='btn'>Read More</a>
                      </div>
              </div>

              <div className="box1">
                  <img src={pic2} alt="" />
                  <div className="info">
                      <h1>Heading</h1>
                      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                      <a href="#" className='btn'>Read More</a>
                      </div>
              </div>
             
        </div>
      </div>
{/* ================================================================================================================ */}
<section className="art">
      <h1>Yugan Photography</h1>
      <div className="background">
        <div className="card" data-aos="slide-right" data-aos-duration="1000"  >
          <img src={pic1} alt="" />
          <div className="info">
           
          </div>
        </div>
      </div>

</section>
{/* ==================================================================================================================== */}
<section className="sentence">
    <div className="collectText" data-aos="slide-left" data-aos-duration="3000">
        <h3 data-aos="slide-left" data-aos-duration="2000" data-aos-delay="0" >Text line</h3>
        <h1 data-aos="slide-left" data-aos-duration="2000" data-aos-delay="100">Related sentence ir tipocs</h1>
        <p data-aos="slide-left" data-aos-duration="2000" data-aos-delay="400">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <button data-aos="slide-left" data-aos-duration="3000"  data-aos-delay="600">Read more  <span>►</span> </button>
    </div>

</section>
{/* ====================================================================================================================== */}
<section className="show">
        <div className="alltext">
          <div className="card1" data-aos="slide-left" data-aos-duration="3000"  >
            <h1>Photography</h1>
            <h3>Art was not make, It's</h3>
            <h1>Creates</h1>
          </div>

          <div className="card2" data-aos="fade-up" data-aos-duration="1000">
            <div className="warpper">
              <img src={wedding} alt="" />
              <img src={birthday} alt="" />              
              <img src={pic1} alt="" />
              <img src={pic2} alt="" />

            </div>
          </div>
        </div>
</section>

{/* ================================================================================================== */}
<section className="event">

   <div className="text">
   <h3 data-aos="slide-right" data-aos-duration="3000"  >Event</h3>
   <h1 data-aos="flip-up" data-aos-duration="3000"  >Organizing a Conference ?</h1>
   </div>
  <button>Read more  <span>►</span> </button>


</section>

{/* =================================================================================================== */}

<section className="Container">
<section className="scrollable-section">

                    <ScrollableContainer imageUrls={imageUrls} />
                </section>
</section>

{/* ================================================================================================================= */}
<div id="footer">
    <div className="social-icons">
      <a className='facebook' href="#"><img src={facebook} alt="" /></a>
      <a className='instagram one' href="https://www.instagram.com/_yugan_photography/"><img src={instagram} alt="" /></a>
      <a className='twitter' href="#"><img src={twitter} alt="" /></a>
    </div>
    <div className="studio-logo">
      <img src="" alt="" />
      <h1></h1>
    </div>
    <div className="links">
      <a href="/about">About</a>
      <a href="#">Our Works</a>
      <a href="#">Shop</a>
      <a href="mailto:ajithpadh@gmail.com">Contact</a>
    </div>

</div>

{/* ============================================================================================================ */}

<div id="copyrights">
  <p>copyright &copy; Vijay Narasingam</p>
</div>
    </div>
  )
}

export default Home
