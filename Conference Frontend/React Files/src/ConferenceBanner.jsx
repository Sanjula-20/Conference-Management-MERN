import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

import image0 from './assets/image0.jpg';

const ConferenceBanner = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }, []);

  const handleRegisterNowClick = () => {
    if (token) {
      navigate('/paper-status');
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      <section
        data-aos="fade-up"
        data-aos-delay="200"
        data-aos-duration="500"
        className="relative min-h-screen pt-[64px] flex items-center justify-center text-center px-4 sm:px-8 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url(${image0})`
        }}
        id="home"
      >
        {/* Black shade */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>

        <div className="max-w-4xl mx-auto relative z-20 text-white px-4 py-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
            ICoDSES-2026
          </h1>

          <p className="text-xl md:text-3xl mb-4 font-medium text-white drop-shadow-md">
            International Conference on Deep Tech and Sustainable Engineering Solutions
          </p>

          <p className="text-lg md:text-2xl mb-8 text-blue-200 font-semibold drop-shadow-sm">
            March 26 and 27, 2026 <br  />
            <span  className="text-lg md:text-2xl mb-8 text-blue-200 font-semibold drop-shadow-sm">Hybrid</span>
          </p>

          <div className="bg-white/10 backdrop-blur-[1px] border-l-4 border-blue-300 p-4 mb-8 text-left max-w-2xl mx-auto rounded-r">
            <p className="text-lg md:text-2xl text-blue-100 font-medium">
              Special Focus on Sustainable Engineering Solutions
            </p>
          </div>

          <div className="mb-12 space-y-2 text-lg text-white/90">
            <p className="font-bold drop-shadow-sm">National Engineering College</p>
            <p>K.R. Nagar, Kovilpatti - 628503</p>
            <p>Thoothukudi, Tamilnadu, India</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRegisterNowClick}
              className="inline-block bg-[#2086ca] hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Login
            </button>

            <a
              href="/ICoDSES/ICoDSES-2026 Template.pptx"
              download="ICoDSES-2026 Template.pptx"
              className="inline-block bg-white/20 hover:bg-white/30 border border-blue-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Download PPT Template
            </a>
          </div>
        </div>
      </section>

      <div id="registration" className="scroll-mt-20"></div>
    </>
  );
};

export default ConferenceBanner;
