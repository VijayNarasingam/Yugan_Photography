import React from 'react'
import './AboutUs.css'

import logo from '../../img/logo.png'
import ajith from '../../img/ajith.png'
import pencilart from '../../img/pencilart.png'
import icon1 from '../../img/CameraIcon1.png'
import icon2 from '../../img/CameraIcon2.png'
import icon3 from '../../img/CameraIcon3.png'
import icon4 from '../../img/CameraIcon4.png'

const AboutUs = () => {
  return (
    <div>
      <nav className='flex '>
        <div className='logo'>
            <img src={logo} alt="" />
        </div>
        <div>
            <ul>
                <a href="/"><li>Home</li></a>
                <a href="#"><li>Cam Rent</li></a>
                <a href="/about"><li>About</li></a>
                <a href="#aboutContact"><li>Contact</li></a>
            </ul>
        </div>
        <div>
        <a href="https://forms.visme.co/formsPlayer/y4vo60d4-yugan-photography-booking-page"> <button>Book Now</button></a>

        </div>
       </nav>

       {/* ================================================================================================================ */}

        <div className="aboutbackground">
            
            <div className="aboutIcons" data-aos="fade-up"
                                        data-aos-duration="3000" >
                <div className="icon1 icon">
                    <img src={icon1} alt="" />
                </div>
                <div className="icon2 icon">
                <img src={icon2} alt="" />
                </div>
                <div className="icon3 icon">
                <img src={icon3} alt="" />
                </div>
                <div className="icon4 icon">
                <img src={icon4} alt="" />
                </div>

            </div>


               <div className="image">
               <img src={ajith} alt="" data-aos="fade-up"
                                        data-aos-duration="3000"
                                        data-aos-delay="3000"  />
               </div>
            
            
                <h1 data-aos="flip-up"
                 data-aos-duration="2000"
                 data-aos-delay="2000" 
                 >YUGAN </h1>
                <h2 data-aos="flip-down"
                 data-aos-duration="2000"
                 data-aos-delay="2000" 
                 >PHOTOGRAPHY</h2>

        </div>

        {/* =========================================================================== */}

        <section className="about">
            <div className="aboutContainer">
                <div className="image">
                <div className="whitebox"></div>
                <img src={pencilart} alt="" />
                </div>
                <div className="aboutText" >
                    <p data-aos="fade-left"
                       data-aos-duration="3000">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minus commodi dignissimos reiciendis? Sint, incidunt itaque modi, labore amet est ea nisi, quasi dolore dolorem tenetur vero aspernatur id eaque sapiente!</p>
                    <p data-aos="fade-left"
                       data-aos-duration="3000"
                       data-aos-delay="300"
                       >Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minus commodi dignissimos reiciendis? Sint, incidunt itaque modi, labore amet est ea nisi, quasi dolore dolorem tenetur vero aspernatur id eaque sapiente!</p>
                    <p data-aos="fade-left"
                       data-aos-duration="3000"
                       data-aos-delay="600">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minus commodi dignissimos reiciendis? Sint, incidunt itaque modi, labore amet est ea nisi, quasi dolore dolorem tenetur vero aspernatur id eaque sapiente!</p>

                
                </div>


            </div>

        </section>

        <section id="aboutContact">
            <div className="ContactTitle">
                <h3>Contact</h3>
            </div>
            
            <div className="ContactDetail">
            <h3>+91 9081585156</h3>
            <h4><a href="mailto:ajithpadhu@gmail.com">ajithpadhu@gmail.com</a></h4>

            </div>

           <div className="contactIcons">
           <div className="aboutIcons"  >
                <div className="icon1 icon">
                    <img src={icon1} alt="" />
                </div>
                <div className="icon2 icon">
                <img src={icon2} alt="" />
                </div>
                <div className="icon3 icon">
                <img src={icon3} alt="" />
                </div>
                <div className="icon4 icon">
                <img src={icon4} alt="" />
                </div>

            </div>

           </div>

            </section>

     
    </div>
  )
}

export default AboutUs
