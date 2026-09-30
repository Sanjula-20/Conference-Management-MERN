import React, { useContext } from 'react';
import { FontStyleContext } from '../context/FontStyleContext';

const TextSettingsModal = ({ isOpen, onClose }) => {
  const {
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    fontColor,
    setFontColor,
    fontWeight,
    setFontWeight,
    fontStyle,
    setFontStyle,
    lineHeight,
    setLineHeight,
  } = useContext(FontStyleContext);

  const toggleBold = () => setFontWeight(fontWeight === "700" ? "400" : "700");
  const toggleItalic = () => setFontStyle(fontStyle === "italic" ? "normal" : "italic");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
          🧩 Text Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Family:
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="'Poppins', sans-serif">Poppins</option>
              <option value="'Arial', sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size (px):
            </label>
            <input
              type="number"
              min="10"
              max="72"
              value={parseInt(fontSize)}
              onChange={(e) => setFontSize(e.target.value + "px")}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Color:
            </label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleBold}
              className={`flex-1 py-2 font-bold rounded-lg ${
                fontWeight === "700"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              B
            </button>
            <button
              onClick={toggleItalic}
              className={`flex-1 py-2 italic rounded-lg ${
                fontStyle === "italic"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              I
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Line Height:
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="3"
              value={lineHeight}
              onChange={(e) => setLineHeight(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextSettingsModal;
