import { useState } from 'react';

// Mock Footer and Header components
import Footer from './Footer';
import Header from './Header';

const ResearchTracks = () => {
  const [expandedTrack, setExpandedTrack] = useState(null);

  const AtomIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <path d="M20.5 6c-1.5-2.6-4.9-3.3-8.5-3.3S5.5 3.4 4 6c-1.5 2.6-.5 6.2 2.5 9s7.5 4.8 11.5 4.8 6-2.4 2.5-6-8-6.2-12.5-6.2" />
    </svg>
  );

  const EnergyIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );

  const LeafIcon = () => (
    <svg viewBox="0 0 30 30" className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="currentColor">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.47 17.17 9.39 11.6 17 10c6.15-1.31 9.05-4.11 10-6.5-2.39-.95-5.19-2.24-10 4.5z"/>
    </svg>
  );

  const ComputerIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="currentColor">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const CarIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="currentColor">
      <path d="M14 16H9m10 0h3l-3-4.5L21 9h-4l-1-4H8L7 9H3l2 2.5L2 16h3m4 0a2 2 0 1 0 4 0m8 0a2 2 0 1 0 4 0" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );

  const ChipIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <rect x="9" y="9" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="2"/>
      <line x1="9" y1="1" x2="9" y2="4" stroke="currentColor" strokeWidth="2"/>
      <line x1="15" y1="1" x2="15" y2="4" stroke="currentColor" strokeWidth="2"/>
      <line x1="9" y1="20" x2="9" y2="23" stroke="currentColor" strokeWidth="2"/>
      <line x1="15" y1="20" x2="15" y2="23" stroke="currentColor" strokeWidth="2"/>
      <line x1="20" y1="9" x2="23" y2="9" stroke="currentColor" strokeWidth="2"/>
      <line x1="20" y1="14" x2="23" y2="14" stroke="currentColor" strokeWidth="2"/>
      <line x1="1" y1="9" x2="4" y2="9" stroke="currentColor" strokeWidth="2"/>
      <line x1="1" y1="14" x2="4" y2="14" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const ChevronDownIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  );

  const ChevronUpIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18,15 12,9 6,15"/>
    </svg>
  );

  const LightbulbIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7zM9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"/>
    </svg>
  );

  const tracks = [
    {
      id: 1,
      title: "Emerging & Frontier Technologies",
      icon: AtomIcon,
      gradient: "from-cyan-500 via-blue-500 to-blue-600",
      description: "Cutting-edge AI, quantum computing, and advanced materials research",
      topics: [
        "Artificial Intelligence & Machine Learning",
        "Quantum Technology", 
        "Advanced Materials & Nanotechnology",
        "Functional and Smart Polymers",
        "Robotics, Mechatronics & Automation",
        "AI in Healthcare and Automation",
        "AI & LLMs for Second Language Acquisition"
      ]
    },
    {
      id: 2,
      title: "Sustainable Energy & Power Systems",
      icon: EnergyIcon,
      gradient: "from-cyan-500 via-blue-500 to-blue-600",
      description: "Revolutionary energy solutions for a sustainable future",
      topics: [
        "Renewable Energy Technologies",
        "Energy Storage & Battery Technologies", 
        "Smart Grid & Power Electronics",
        "High Voltage & Insulation Systems",
        "Smart Cities & Urban Sustainability"
      ]
    },
    {
      id: 3,
      title: "Environment, Climate-Tech & Sustainable Infrastructure",
      icon: LeafIcon,
      gradient: "from-cyan-500 via-blue-500 to-blue-600",
      description: "Environmental solutions and climate change technologies",
      topics: [
        "Sustainable Manufacturing & Industry 5.0",
        "Green Building Technologies",
        "Water Quality & Waste Management Systems",
        "Climate Change Mitigation Technologies", 
        "Environmental Sensing & Monitoring",
        "Ecosystem Restoration Technologies",
        "Remote sensing and geospatial technologies"
      ]
    },
    {
      id: 4,
      title: "Advanced Computing & Cyber-Physical Systems",
      icon: ComputerIcon,
      gradient: "from-cyan-500 via-blue-500 to-blue-600",
      description: "Next-generation computing and cybersecurity innovations",
      topics: [
        "Web 3.0 Technologies",
        "Future trends in AR/VR",
        "Provable Security",
        "Edge Computing & IoT for Sustainability",
        "Queueing Networks",
        "Cybersecurity for Critical Infrastructure", 
        "Digital Twins & Simulation Technologies"
      ]
    },
    {
      id: 5,
      title: "Sustainable Transportation & E-Mobility",
      icon: CarIcon,
      gradient: "from-cyan-500 via-blue-500 to-blue-600",
      description: "Future of transportation and electric mobility solutions",
      topics: [
        "Electric Vehicles (EVs) & Hybrid Electric Vehicles (HEVs)",
        "Battery Management Systems & Charging Infrastructure",
        "Green & Next Generation Battery",
        "Hydrogen Fuel Cell Vehicles", 
        "Smart Mobility & Intelligent Transportation Systems",
        "Recycling & Lifecycle Management of EV Components"
      ]
    },
    {
      id: 6,
      title: "Nextgen Communication, VLSI & Embedded Systems",
      icon: ChipIcon,
      gradient: "from-cyan-500 via-blue-500 to-blue-600",
      description: "Advanced communication systems and embedded technologies",
      topics: [
        "5G New Radio (NR) and evolution toward 6G air interfaces",
        "Terahertz (THz) and millimeter-wave (mmWave) communications",
        "Massive MIMO, beam forming, and advanced antenna designs",
        "Reconfigurable intelligent surfaces (RIS) and smart metasurfaces",
        "AI-driven network design and self-optimization",
        "VLSI Design and Nano electronics",
        "Embedded system for Intelligent Applications"
      ]
    }
  ];

  const toggleExpand = (trackId) => {
    setExpandedTrack(expandedTrack === trackId ? null : trackId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
     
      <div className="max-w-7xl mt-14 mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="bg-gradient-to-r from-[#4ebceb] via-[#3aa3d9] to-[#2086ca] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-clip-text text-transparent mb-4 sm:mb-6 pt-8 sm:pt-12 transition-all duration-300 leading-tight">
            Research Tracks
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-700 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Exploring the frontiers of technology and innovation across six cutting-edge research domains
          </p>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#4ebceb] via-[#3aa3d9] to-[#2086ca] rounded-full mx-auto"></div>
        </div>

        {/* Tracks Grid */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {tracks.map((track) => {
            const IconComponent = track.icon;
            const isExpanded = expandedTrack === track.id;

            return (
              <div
                key={track.id}
                className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-200/50"
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${track.gradient} p-4 sm:p-6 md:p-8 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/5"></div>
                  <div className="relative z-10">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                          <IconComponent />
                        </div>
                        <button
                          onClick={() => toggleExpand(track.id)}
                          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </button>
                      </div>
                      <h3 className="text-lg font-bold mb-2 leading-tight">
                        {track.title}
                      </h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {track.description}
                      </p>
                    </div>

                    {/* Tablet and Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                          <IconComponent />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
                            {track.title}
                          </h3>
                          <p className="text-white/90 text-sm md:text-base lg:text-lg leading-relaxed">
                            {track.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpand(track.id)}
                        className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300 flex-shrink-0 ml-4"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-4 sm:p-6 md:p-8">
                    <h4 className="text-base sm:text-lg md:text-xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <LightbulbIcon />
                      Research Areas
                    </h4>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                      {track.topics.map((topic, topicIndex) => (
                        <div
                          key={topicIndex}
                          className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl border border-blue-200/60 hover:shadow-md hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                        >
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <p className="text-blue-800 leading-relaxed font-medium text-xs sm:text-sm md:text-base">
                            {topic}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Border */}
                <div className={`h-1 bg-gradient-to-r ${track.gradient}`}></div>
              </div>
            );
          })}
        </div>
      </div>
     
    </div>
  );
};

export default ResearchTracks;
