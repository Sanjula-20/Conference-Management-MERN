// VisitorCounter.jsx
import React, { useState, useEffect } from 'react';
import { apiUrl } from "./config";

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const response = await fetch(apiUrl("/visitors"), {
          method: 'POST',
          credentials: 'include', 
        });
        if (response.ok) {
          const data = await response.json();
          setVisitorCount(data.count);
        } else {
          console.error('Failed to fetch visitor count');
          setVisitorCount(0);
        }
      } catch (error) {
        console.error('Error fetching visitor count:', error);
        setVisitorCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorCount();
  }, []);

  const renderDigits = (number) => {
    return number
      .toString()
      .padStart(4, '0')
      .split('')
      .map((digit, index) => (
        <span
          key={index}
          className="bg-cyan-500 text-white font-bold px-6 py-4 m-1 rounded-lg shadow-lg text-4xl"
        >
          {digit}
        </span>
      ));
  };

  return (
    <div data-aos="fade-up"
            data-aos-delay="500"
            data-aos-duration="1000" className="flex flex-col items-center justify-center mb-6">
      <h1 className="text-3xl font-bold text-[#2086ca] mb-4">
         Visitors
      </h1>
      <div className="flex items-center p-4 rounded-xl shadow-xl">
        {renderDigits(visitorCount)}
      </div>
    </div>
  );
};

export default VisitorCounter;
