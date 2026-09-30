import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebookF, faXTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import GoogleTranslate from './GoogleTranslate';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#4ebceb] to-[#2086ca] text-white py-8 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Footer Content Sections */}
        <div className="flex flex-col md:flex-row justify-center gap-12 mb-8">
          {/* Contact Section */}
          <div className="footer-section md:w-auto text-center md:text-left">
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <div className="flex flex-col items-center md:items-start space-y-2">
              <p className="text-white/80">The ICoDSES-2026</p>
              <p className="text-white/80">For further queries, please write to</p>
              <a 
                href="mailto:icodses2026@nec.edu.in" 
                className="text-white/80 hover:text-white transition-colors duration-300"
              >
                icodses2026@nec.edu.in
              </a>
            </div>
          </div>

          {/* Venue Section */}
          <div className="footer-section md:w-auto text-center md:text-left">
            <h3 className="text-white text-lg font-semibold mb-4">Venue</h3>
            <div className="flex flex-col items-center md:items-start space-y-2">
              <p className="text-white/80">National Engineering College</p>
              <p className="text-white/80">K.R.Nagar, Kovilpatti - 628503</p>
              <p className="text-white/80">Thoothukudi, Tamilnadu, India</p>
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-6">
          <a href="https://www.instagram.com/national_engineering_college/?hl=en" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
            <FontAwesomeIcon icon={faInstagram} size="lg" />
          </a>
          <a href="https://x.com/neckvp?lang=en" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
            <FontAwesomeIcon icon={faFacebookF} size="lg" />
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
            <FontAwesomeIcon icon={faXTwitter} size="lg" />
          </a>
          <a href="https://www.linkedin.com/school/national-engineering-college/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
            <FontAwesomeIcon icon={faLinkedinIn} size="lg" />
          </a>
        </div>

        {/* Google Translate */}
        <div className="flex justify-center mb-4">
          <GoogleTranslate />
        </div>

        {/* Copyright */}
        <p className="text-center text-white/60 text-sm">
          © 2026 ICoDSES. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
