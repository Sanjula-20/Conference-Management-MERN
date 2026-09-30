import React, { createContext, useContext, useState, useEffect } from "react";

export const FontStyleContext = createContext({
  fontSize: "16px",
  setFontSize: () => {},
  fontFamily: "'Poppins', sans-serif",
  setFontFamily: () => {},
  fontWeight: "400",
  setFontWeight: () => {},
  fontStyle: "normal",
  setFontStyle: () => {},
  lineHeight: "1.5",
  setLineHeight: () => {},
});

export const FontStyleProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("'Poppins', sans-serif");
 // const [fontColor, setFontColor] = useState("#213547");
  const [fontWeight, setFontWeight] = useState("400");
  const [fontStyle, setFontStyle] = useState("normal");
  const [lineHeight, setLineHeight] = useState("1.5");

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--global-font-size", fontSize);
    root.style.setProperty("--global-font-family", fontFamily);
    // root.style.setProperty("--global-font-color", fontColor);
    root.style.setProperty("--global-font-weight", fontWeight);
    root.style.setProperty("--global-font-style", fontStyle);
    root.style.setProperty("--global-line-height", lineHeight);
  }, [fontSize, fontFamily, fontWeight, fontStyle, lineHeight]);

  return (
    <FontStyleContext.Provider
      value={{
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
      }}
    >
      {children}
    </FontStyleContext.Provider>
  );
};

export const useFontStyle = () => useContext(FontStyleContext);
