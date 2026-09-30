import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';


import neclogo from './assets/Nec-Logo-White1 (1).png';
import { FontStyleContext } from './context/FontStyleContext';
import { FRONTEND_BASE_URL } from './config';
// Mock components for demth='40' height='40'%3E%3Crect fill='%23fff' width='40' height='40'/%3E%3C/svg%3E";

const AuthContext = React.createContext({ token: null, logout: () => {} });

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { token, logout } = useContext(AuthContext);
  const {
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    // fontColor,
    // setFontColor,
    fontWeight,
    setFontWeight,
    fontStyle,
    setFontStyle,
    lineHeight,
    setLineHeight,
  } = useContext(FontStyleContext);

  // Temporary state for settings
  const [tempFontSize, setTempFontSize] = useState(fontSize);
  const [tempFontFamily, setTempFontFamily] = useState(fontFamily);
  // const [tempFontColor, setTempFontColor] = useState(fontColor);
  const [tempFontWeight, setTempFontWeight] = useState(fontWeight);
  const [tempFontStyle, setTempFontStyle] = useState(fontStyle);
  const [tempLineHeight, setTempLineHeight] = useState(lineHeight);

  // Initialize temp values when modal opens
  useEffect(() => {
    if (isSettingsModalOpen) {
      setTempFontSize(fontSize);
      setTempFontFamily(fontFamily);
      // setTempFontColor(fontColor);
      setTempFontWeight(fontWeight);
      setTempFontStyle(fontStyle);
      setTempLineHeight(lineHeight);
    }
  }, [isSettingsModalOpen, fontSize, fontFamily, fontWeight, fontStyle, lineHeight]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleBold = () => setTempFontWeight(tempFontWeight === "700" ? "400" : "700");
  const toggleItalic = () => setTempFontStyle(tempFontStyle === "italic" ? "normal" : "italic");

  const applySettings = () => {
    setFontSize(tempFontSize);
    setFontFamily(tempFontFamily);
    // setFontColor(tempFontColor);
    setFontWeight(tempFontWeight);
    setFontStyle(tempFontStyle);
    setLineHeight(tempLineHeight);
    setIsSettingsModalOpen(false);
  };

  return (
    <>
      <header className="bg-gradient-to-r px-3.5 from-[#4ebceb] via-[#3aa3d9] to-[#2086ca] fixed right-0 left-0 top-0 z-[999] shadow-2xl backdrop-blur-sm border-b border-white/10">
        <nav className="mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <div className="p-2">
              <img className="w-[40px]" src={neclogo} alt="NEC Logo" />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex space-x-8 items-center">
            <a
              href={FRONTEND_BASE_URL}
              className="relative text-white font-bold text-lg px-4 py-2 rounded-xl bg-blue-500 border-2 border-white/30"
            >
              Pre-conference
            </a>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/dates">Important Dates</NavLink>
            <NavLink to="/tracks">Call for Papers</NavLink>

            {/* Desktop Dropdown Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative text-white font-medium text-lg flex items-center gap-2 px-4 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:scale-105 backdrop-blur-sm"
              >
                <span>Committee</span>
                <svg
                  className={`w-4 h-4 text-white/80 transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''} drop-shadow-sm`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-300/0 via-blue-200/0 to-purple-200/0 hover:from-blue-300/20 hover:via-blue-200/10 hover:to-purple-200/20 transition-all duration-300 -z-10 blur-sm"></div>
              </button>

              <div className={`absolute left-0 mt-9 w-64 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 transition-all duration-300 origin-top overflow-hidden ${
                isDropdownOpen 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
              }`}>
                <div className="py-2">
                  <Link
                    to="/committee"
                    className="group/item flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 hover:text-blue-800 transition-all duration-300 border-l-4 border-transparent hover:border-blue-400 hover:shadow-sm"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"></div>
                    <span className="font-medium">Advisory Committee</span>
                  </Link>
                  <Link
                    to="/program-committee"
                    className="group/item flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 hover:text-blue-800 transition-all duration-300 border-l-4 border-transparent hover:border-blue-400 hover:shadow-sm"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"></div>
                    <span className="font-medium">Program Committee</span>
                  </Link>
                </div>
              </div>
            </div>

            <NavLink to="/speakers">Speakers</NavLink>
            <NavLink to="/schedule">Schedule</NavLink>
            <NavLink to="/fees">Paper Submission</NavLink>
        
           
            

            {token && (
              <button
                onClick={logout}
                className="text-white font-medium text-lg px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`bg-gradient-to-b from-[#2086ca]/95 to-[#4ebceb]/95 backdrop-blur-md lg:hidden absolute top-full left-0 right-0 w-full overflow-hidden transition-all duration-500 ease-in-out z-[998] ${
              isOpen ? 'max-h-[80vh] py-4 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="flex flex-col space-y-3 px-6 overflow-y-auto max-h-[75vh]">
             <a
              href={FRONTEND_BASE_URL}
              className="relative text-white font-bold text-lg px-4 py-2 rounded-xl bg-blue-500 border-2 border-white/30"
            >
              Pre-conference
            </a>
              <MobileNavLink to="/" onClick={toggleMenu}>
                Home
              </MobileNavLink>
              <MobileNavLink to="/dates" onClick={toggleMenu}>
                Important Dates
              </MobileNavLink>
              <MobileNavLink to="/tracks" onClick={toggleMenu}>
                Call for Papers
              </MobileNavLink>

              {/* Fixed Mobile Committee Dropdown */}
              <div className="py-1">
                <details className="group">
                  <summary className="text-white font-medium text-lg cursor-pointer py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/30 list-none flex items-center justify-between">
                    <span>Committee</span>
                    <svg
                      className="w-5 h-5 text-white/80 transform group-open:rotate-180 transition-transform duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </summary>

                  <div className="mt-2 space-y-2 pl-2">
                    <Link
                      to="/committee"
                      onClick={toggleMenu}
                      className="flex items-center text-white/90 font-medium text-base py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 transition-all duration-300"
                    >
                      <div className="w-2 h-2 bg-white/60 rounded-full mr-3"></div>
                      Advisory Committee
                    </Link>
                    <Link
                      to="/program-committee"
                      onClick={toggleMenu}
                      className="flex items-center text-white/90 font-medium text-base py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 transition-all duration-300"
                    >
                      <div className="w-2 h-2 bg-white/60 rounded-full mr-3"></div>
                      Program Committee
                    </Link>
                  </div>
                </details>
              </div>

              <MobileNavLink to="/speakers" onClick={toggleMenu}>
                Speakers
              </MobileNavLink>
              <MobileNavLink to="/schedule" onClick={toggleMenu}>
                Schedule
              </MobileNavLink>
              <MobileNavLink to="/fees" onClick={toggleMenu}>
                Paper Submission
              </MobileNavLink>

           

              

              {token && (
                <div className="pt-2">
                  <button
                    onClick={logout}
                    className="w-full text-white font-medium text-lg py-3 px-4 bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Settings Modal - Separate Window */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md max-h-[85vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-semibold">🧩 Text Settings</h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                aria-label="Close"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family:
                </label>
                <select
                  value={tempFontFamily}
                  onChange={(e) => setTempFontFamily(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="'Poppins', sans-serif">Poppins</option>
                  <option value="'Arial', sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size (px):
                </label>
                <input
                  type="number"
                  min="10"
                  max="72"
                  value={parseInt(tempFontSize)}
                  onChange={(e) => setTempFontSize(e.target.value + "px")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Style:
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={toggleBold}
                    className={`flex-1 py-3 font-bold rounded-lg transition-all ${
                      tempFontWeight === "700"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={toggleItalic}
                    className={`flex-1 py-3 italic rounded-lg transition-all ${
                      tempFontStyle === "italic"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    I
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Height: {tempLineHeight}
                </label>
                <input
                  type="range"
                  step="0.1"
                  min="1"
                  max="3"
                  value={tempLineHeight}
                  onChange={(e) => setTempLineHeight(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={applySettings}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md"
                >
                  Apply Changes
                </button>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="relative text-white font-medium text-lg group px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
  >
    {children}
    <span className="absolute left-1/2 bottom-0 h-0.5 bg-white w-0 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
  </Link>
);

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

const MobileNavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="text-white font-medium text-lg py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all duration-300 block"
  >
    {children}
  </Link>
);

MobileNavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func
};

export default Header;
