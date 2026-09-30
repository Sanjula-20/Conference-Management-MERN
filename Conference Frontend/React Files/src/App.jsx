import React, { useEffect } from 'react';
import ConferenceBanner from './ConferenceBanner';
import bgimage from './assets/image0.jpg';
import Section from './Section';
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen  bg-cover bg-fixed bg-center"
      style={{ backgroundImage: `url(${bgimage})`, scrollBehavior: 'smooth' }}
    >
      {/* ✅ Push content below header */}
      <div  className='backdrop-blur-sm ' >
         <ConferenceBanner />

      </div>

          <Section />

    </div>
  );
}

export default App;
