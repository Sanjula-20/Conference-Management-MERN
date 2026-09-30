import React from 'react';
import arunachalamImg from './assets/thiru-k-arunachalam-2.jpg';
import shanmugavelImg from './assets/Shanmugavel.jpg';
import kalidasaImg from './assets/Principal(Kalidasa Murugavel).jpg';
import vice_chairman from './assets/Krishnamoorthy.png'
import chairman1 from './assets/Chennammal Ramasamy.jpg'
import VisitorCounter from './VisitorCounter';
import { FaBell } from "react-icons/fa";
import { Link } from 'react-router-dom';


function Section() {
  return (
    <div className="bg-white py-12 px-4 md:px-8 lg:px-16">


<div className="max-w-6xl mx-auto mb-16 relative">

  {/* Glow Effect */}
  <div className="absolute -inset-2 bg-gradient-to-r from-[#4ebceb] to-[#2086ca] opacity-25 blur-2xl rounded-3xl"></div>

  <div className="relative bg-white border-2 border-[#4ebceb] rounded-2xl shadow-xl overflow-hidden">

    {/* Header */}
    <div className="bg-gradient-to-r from-[#4ebceb] to-[#2086ca] text-white py-4 px-6 flex items-center justify-center gap-3 font-bold text-lg tracking-wide">
      <FaBell className="text-white animate-pulse" />
      Conference Preamble
    </div>

    {/* 🔥 Highlighted Background */}
    <div className="bg-gradient-to-br from-[#e0f7ff] via-[#f0fbff] to-[#c7ecff] relative">

      {/* Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(78,188,235,0.25),transparent_60%)] pointer-events-none"></div>

      <div className="relative">

        {[
          {
            label: "Conference Info",
            value:
              "The International Conference on Deep Tech and Sustainable Engineering Solutions (ICoDSES–2026) was conceived and initiated in August 2025."
          },
          {
            label: "Submissions",
            value: (
              <>
                The conference received a total of{" "}
                <span className="text-[#4ebceb] font-bold text-xl">393</span> paper submissions from across India and abroad.
              </>
            )
          },
          {
            label: "Review Process",
            value:
              "All submissions underwent a rigorous peer-review process including plagiarism checks, AI-detection analysis, and evaluations by internal and external experts."
          },
          {
            label: "Shortlisted Papers",
            value: (
              <>
                <span className="text-[#4ebceb] font-bold text-xl">109</span> papers shortlisted.
              </>
            )
          },
          {
            label: "Registered Papers",
            value: (
              <>
                <span className="text-[#4ebceb] font-bold text-xl">63</span> papers registered.
              </>
            )
          }
        ].map((item, index) => (
          <div
            key={index}
            className="grid md:grid-cols-4 gap-4 px-6 md:px-10 py-5 border-b last:border-none border-blue-200 hover:bg-white/60 transition duration-300"
          >
            <div className="font-semibold text-[#2086ca] text-lg">
              {item.label}
            </div>

            <div className="md:col-span-3 text-gray-700 text-[15px] md:text-lg leading-relaxed">
              {item.value}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center px-6 py-6 bg-blue-100 font-semibold text-[#2086ca]">
          We thank all academicians and researchers for submitting their manuscripts to our Conference.
        </div>

      </div>
    </div>
  </div>
  
</div> 

      <div
        className="mb-8  md:mb-10 flex align-middle justify-center "
        
      >
        <Link to="/organizing-committee"
       
          type="button"
          className="relative inline-flex items-center justify-center px-6 py-3 md:px-20 md:py-4 rounded-xl text-white font-bold tracking-wide bg-gradient-to-r from-[#e33333] to-[#f0690f]  hover:scale-105 transition-all duration-300"
        >
          Track Details
        </Link>
      </div> {/* About Section */}
      <div className="max-w-6xl mx-auto text-center">
        <h2
          className="font-bold text-[#4ebceb] text-3xl md:text-5xl mb-6"
          data-aos="fade-up"
          data-aos-duration="400"
        >
          About ICoDSES-2026
        </h2>

        {/* Visitor Counter centered under heading */}
        <div
          className="mb-10 flex justify-center"
          data-aos="zoom-in"
          data-aos-delay="200"
          data-aos-duration="1000"
        >
          <VisitorCounter/>

        </div>

        <div className="space-y-6 text-[#2086ca] text-lg md:text-xl leading-relaxed text-justify">
          <p
            data-aos="fade-right"
            data-aos-delay="300"
            data-aos-duration="500"
          >
            The International Conference on Deep Tech and Sustainable Engineering Solutions (ICoDSES-2026) is set to be a hub of expertise, knowledge sharing, and collaboration in the rapidly evolving fields of Deep Technology and Sustainable Engineering. This peer-reviewed conference will focus on the critically important theme: <strong>Innovating for a Sustainable Future: Bridging Deep Tech and Environmental Impact</strong>.
          </p>

          <p
            data-aos="fade-left"
            data-aos-delay="400"
            data-aos-duration="500"
          >
            As the world faces unprecedented climate change, resource depletion, and sustainability challenges, the need for innovative engineering solutions becomes even more urgent. ICoDSES-2026 will spotlight how deep technologies – including artificial intelligence, robotics, blockchain, and advanced materials – are harnessed to create sustainable, environmentally conscious solutions.
          </p>

          <p
            data-aos="fade-right"
            data-aos-delay="500"
            data-aos-duration="500"
          >
            The core objective of ICoDSES-2026 is to foster a comprehensive dialogue between researchers, industry leaders, and policymakers, encouraging collaborations that prioritize the responsible and ethical deployment of technology. With a strong emphasis on addressing the environmental impact of modern technological advancements, ICoDSES-2026 will provide a unique platform to discuss solutions, share research findings, and build the partnerships necessary to foster a sustainable future for all.
          </p>
        </div>
      </div>

      {/* Publications Section */}
      <div className="max-w-6xl mx-auto mt-16 md:mt-24 text-center">
        <h2
          className="font-bold text-[#4ebceb] text-3xl md:text-5xl mb-8"
          data-aos="fade-up"
          data-aos-delay="600"
          data-aos-duration="500"
        >
          Previous Conference Publications
        </h2>

        <ul className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
          <li
            data-aos="fade-right"
            data-aos-delay="500"
            data-aos-duration="1000"
          >
            <div className="w-full h-20 flex items-center justify-center bg-white border border-gray-200 mx-auto rounded-lg shadow-sm hover:shadow-md hover:border-[#4ebceb] hover:-translate-y-1 transition-all duration-300">
              <a
                href="https://ieeexplore.ieee.org/xpl/conhome/7589933/proceeding"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#2086ca] font-semibold text-lg md:text-xl px-4 text-center"
              >
                <i className="fas fa-external-link-alt"></i>
                ICCTIDE'16 - IEEE Xplore
              </a>
            </div>
          </li>

          <li
            data-aos="fade-right"
            data-aos-delay="500"
            data-aos-duration="500"
          >
            <div className="w-full h-24 flex items-center justify-center bg-white border border-gray-200 mx-auto rounded-lg shadow-sm hover:shadow-md hover:border-[#4ebceb] hover:-translate-y-1 transition-all duration-300">
              <a
                href="https://doi.org/10.1063/12.0007300"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#2086ca] font-semibold text-sm md:text-xl px-4 text-center"
              >
                <i className="fas fa-external-link-alt"></i>
                AICTE Sponsored National Online Conference on Data Science and Intelligent Information Technology
              </a>
            </div>
          </li>
        </ul>
      </div>
      {/* Conference Brochure Download */}
      <div className="max-w-6xl mx-auto mt-16 md:mt-24 text-center">
        <div
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="500"
          className="mb-12"
        >
          <a
            href="/ICoDSES/ICoDSES-2026-Brochure.pdf"
            download="ICoDSES-2026-Brochure.pdf"
            className="inline-flex items-center gap-3 bg-[#4ebceb] hover:bg-[#2086ca] text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg md:text-xl"
          >
            <i className="fas fa-download"></i>
            Download Conference Brochure
          </a>
        </div>
      </div>
         
      {/* Organizational Committee Section */}
      <div className="max-w-6xl pt-8 md:pt-12 mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 md:mb-16 lg:mb-24">
      <h2 
        className="font-bold text-[#4ebceb] text-2xl sm:text-3xl lg:text-5xl mb-8 md:mb-12"
        data-aos="fade-up"
        data-aos-duration="500"
      >
        Organizational Committee
      </h2>


      {/* Top 3 Members - Mobile: Stack vertically, Tablet+: 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">

        {/* Chairman */}
        <div
          className="text-center mx-auto max-w-xs"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="500"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden border-2 sm:border-4 border-[#4ebceb] shadow-lg">
            <img
              src={chairman1}
              alt="Tmt. Chennammal Ramasamy"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2086ca] mb-1 md:mb-2 px-2">
            Tmt. Chennammal Ramasamy
          </h3>
          <p className="text-[#4ebceb] font-semibold text-base sm:text-lg">CHAIRMAN</p>
        </div>

        {/* Vice Chairman */}
        <div
          className="text-center mx-auto max-w-xs"
          data-aos="fade-up"
          data-aos-delay="300"
          data-aos-duration="500"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden border-2 sm:border-4 border-[#4ebceb] shadow-lg">
            <img
              src={vice_chairman}
              alt="Thiru. K.R. Krishnamoorthy"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2086ca] mb-1 md:mb-2 px-2">
            Thiru. K.R. Krishnamoorthy
          </h3>
          <p className="text-[#4ebceb] font-semibold text-base sm:text-lg">VICE CHAIRMAN</p>
        </div>

        {/* Correspondent - On mobile, this will be full width on its own row when using sm:grid-cols-2 */}
        <div
          className="text-center mx-auto max-w-xs sm:col-span-2 lg:col-span-1"
          data-aos="fade-up"
          data-aos-delay="400"
          data-aos-duration="500"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden border-2 sm:border-4 border-[#4ebceb] shadow-lg">
            <img
              src={arunachalamImg}
              alt="Thiru K. R. Arunachalam"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2086ca] mb-1 md:mb-2 px-2">
            Thiru K. R. Arunachalam
          </h3>
          <p className="text-[#4ebceb] font-semibold text-base sm:text-lg">CORRESPONDENT</p>
        </div>
      </div>

      {/* Bottom 2 Members - Always centered */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 md:gap-8 lg:gap-12">
        
        {/* Chief Patron */}
        <div
          className="text-center mx-auto max-w-xs"
          data-aos="fade-up"
          data-aos-delay="500"
          data-aos-duration="500"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden border-2 sm:border-4 border-[#4ebceb] shadow-lg">
            <img
              src={shanmugavelImg}
              alt="Dr.S.Shanumgavel"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2086ca] mb-1 md:mb-2 px-2">
            Dr. S. Shanmugavel
          </h3>
          <p className="text-[#4ebceb] font-semibold text-base sm:text-lg">CHIEF PATRON</p>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Director, NEC</p>
        </div>

        {/* Patron */}
        <div
          className="text-center mx-auto max-w-xs"
          data-aos="fade-up"
          data-aos-delay="600"
          data-aos-duration="500"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden border-2 sm:border-4 border-[#4ebceb] shadow-lg">
            <img
              src={kalidasaImg}
              alt="Dr.K.Kalidasa Murugavel"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2086ca] mb-1 md:mb-2 px-2">
            Dr. K. Kalidasa Murugavel
          </h3>
          <p className="text-[#4ebceb] font-semibold text-base sm:text-lg">PATRON</p>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Principal, NEC</p>
        </div>
      </div>
    </div>    </div>
  );
}

export default Section;
