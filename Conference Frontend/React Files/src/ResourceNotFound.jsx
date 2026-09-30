import React from 'react';
import Header from './Header';
import svg from './assets/x-round.svg'
import Footer from './Footer';

const ResourceNotFound = () => {
  return (
    <>
    {/* <Header/> */}
     <div className="min-h-[70vh] flex flex-col items-center justify-center font-sans ">
        
     
        <img className='w-20' src={svg} alt="" />
        
      
      <h1 className="mt-7 mb-3 text-3xl font-bold text-[#FF6174]">404: Resource Not Found</h1>
      <p className="mb-6 max-w-xs text-center text-gray-600">
        Sorry, the resource you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
        className="px-6 py-2 bg-[#ff445a] text-white rounded-md font-semibold shadow-md hover:bg-blue-500 transition duration-500 "
      >
        Back to Home
      </a>
    </div>
    
    </>
   
  );
};

export default ResourceNotFound;
