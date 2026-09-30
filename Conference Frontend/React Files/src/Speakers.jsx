import React from 'react';
import lung from './assets/lung.jpg';
import chandra from './assets/chandra.jpg'; 
import vassil from './assets/vassil.jpg'; 
import solo from './assets/solo.jpg';
import karthick from './assets/karthick.jpg';
import paolo from './assets/Paolo.png';
import Panchamtcharam from './assets/Panchamtcharam.png';
import chidambaram from './assets/chidambaram.jpg';
import Shajulin from './assets/Shajulin.jpg'

const KeynoteSpeakers = () => {
  const speakers = [
    { id: 1, name: "Dr. Lung-Jieh Yang", title: "Professor", department: "Department of Mechanical and Electro-Mechanical Engineering", institution: "Tamkang University, Taiwan", image: lung },
    { id: 2, name: "Prof. Anastasios P. Vassilopoulos", title: "EDCE Director", department: "Composite Mechanics Group (GR-MeC)", institution: "Ecole Polytechnique Fédérale de Lausanne, Lausanne", image: vassil },
    { id: 3, name: "Dr. Solomon Raju Kota", title: "Chief Scientist & Head, ICTD, CSIR-NAL", department: "Professor, Academy of Scientific and Innovative Research (AcSIR)", institution: "Bengaluru, Karnataka, Hq: Ghaziabad", image: chandra },
    { id: 4, name: "Dr. C. Chandra Shekhar", title: "Professor", department: "Department of Computer Science & Engineering", institution: "IIT Madras, Chennai", image: solo },
    { id: 5, name: "Dr. Karthik Ramaswamy", title: "Senior Technology Leader", department: "Senior Technology Leader, Fermi Silicon Designs Pvt Ltd", institution: "Kaikondrahalli, Varthur(h)117, Bellandur, Bangalore", image: karthick },
    { id: 6, name: "Dr. Paolo Sgarbossa", title: "Professore Associato", department: "Dipartimento di Ingegneria Industriale - DII", institution: "Via F. Marzolo, 9 - Padova, Italy", image: paolo },
    { id: 7, name: "Dr. Panchamtcharam", title: "Associate Professor", department: "Department of Mathematics and Statistics", institution: "Yerpedu-Venkatagiri Road, Tirupati", image: Panchamtcharam },
    { id: 8, name: "Dr. Chidambaram Sabarathinam", title: "Research Scientist", department: "Water Research Center, Kuwait", institution: "Kuwait Institute for Scientific Research", image: chidambaram },
    { id: 9, name: "Dr. Shajulin Benedict", title: "Associate Professor", department: "Information Technology , Kottayam", institution: "Indian Institute of Information Technology Kottayam", image: Shajulin }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20" style={{ marginTop: '80px' }}>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-4" style={{ color: '#4ebceb' }}>Speakers</h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">Meet our keynote speakers — experts and leaders from academia and industry.</p>
        </div>

        {/* Responsive card grid implemented with flex-wrap so last row centers nicely */}
        <div className="flex flex-wrap justify-center -mx-4">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="px-4 mb-8 w-full sm:w-1/2 lg:w-1/3">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div
                    className="rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 transform-gpu hover:scale-105"
                    style={{ width: 160, height: 160, border: '4px solid #4ebceb' }}
                  >
                    <img
                      src={speaker.image}
                      alt={speaker.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ color: '#2086ca' }}>{speaker.name}</h3>

                {speaker.title && (
                  <p className="text-sm sm:text-base font-semibold italic mb-2" style={{ color: '#4ebceb' }}>{speaker.title}</p>
                )}

                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-1">{speaker.department}</p>
                {speaker.institution && (
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{speaker.institution}</p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default KeynoteSpeakers;
