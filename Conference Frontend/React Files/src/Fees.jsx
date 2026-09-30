import { Link } from 'react-router-dom';
import feesFlow from './assets/feeFlow.jpg'

const RegistrationTable = () => {
  const registrationData = [
    {
      category: "Research Scholar/Student",
      indian: "8,000",
      foreign: "90"
    },
    {
      category: "Academia",
      indian: "9,000",
      foreign: "100"
    },
    {
      category: "R&D, Industry Delegates",
      indian: "10,000",
      foreign: "110"
    },
    {
      category: "Additional Participant",
      indian: "1,500",
      foreign: "20"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="max-w-7xl mx-auto py-5 relative z-10 px-4">
        
       {/* Paper Submission Guidelines Section */}
        <div className=" pt-24 ">
          <div className="bg-white/95 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl border border-sky-200/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 via-[#3aa3d9]/5 to-[#2086ca]/5"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-sky-400 mb-3 sm:mb-4">
                  Paper Submission Guidelines
                </h2>
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-1.5 sm:h-2 bg-gradient-to-r from-sky-400 via-[#3aa3d9] to-[#2086ca] rounded-full shadow-lg"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-sky-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-sky-200/70 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-400 via-[#3aa3d9] to-[#2086ca] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg sm:text-xl">📄</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-sky-800">Paper Format</h3>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-sky-700">
                    <li className="flex items-start space-x-2 sm:space-x-3">
                      <span className="text-emerald-500 font-bold mt-1">•</span>
                      <span><strong>Language:</strong> Papers should be written in English</span>
                    </li>
                    <li className="flex items-start space-x-2 sm:space-x-3">
                      <span className="text-emerald-500 font-bold mt-1">•</span>
                      <span><strong>Format:</strong>Use the conference template <a className=' text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 decoration-slate-400 transition'   href="/ICoDSES/Paper%20format.docx"  download > (link for paper format)    </a>  </span>
                    </li>
                    <li className="flex items-start space-x-2 sm:space-x-3">
                      <span className="text-emerald-500 font-bold mt-1">•</span>
                      <span><strong>Length:</strong> Minimum 10 pages (one column format) including figures, tables, and references</span>
                    </li>
                    <li className="flex items-start space-x-2 sm:space-x-3">
                      <span className="text-emerald-500 font-bold mt-1">•</span>
                      <span><strong>File Format:</strong> Submit in PDF format</span>
                    </li>
                    <li className="flex items-start space-x-2 sm:space-x-3">
                      <span className="text-emerald-500 font-bold mt-1">•</span>
                      <span><strong>Submission:</strong> Use the conference's online submission system</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-purple-200/70 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br via-[#3aa3d9] to-[#2086ca] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg sm:text-xl">✓</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#3aa3d9]">Paper Requirements</h3>

                  </div>
                  <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                    <li className="flex items-start space-x-2 sm:space-x-3">
                      <span className="text-emerald-500 font-bold mt-1">•</span>
                      <span><strong>Originality:</strong> Must be original, not previously published or submitted elsewhere</span>
                    </li>
                    <li className="flex items-start space-x-2 sm:space-x-3">
                      <span className="text-emerald-500 font-bold mt-1">•</span>
                      <span><strong>Content:</strong> Must be relevant to the conference theme and topics</span>
                    </li>
                    <li className="flex items-start space-x-2 sm:space-x-3">
                      <span className="text-emerald-500 font-bold mt-1">•</span>
                      <span><strong>Technical Quality:</strong> Should demonstrate technical soundness, clarity, and coherence</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-emerald-200/70 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 via-[#3aa3d9] to-[#2086ca] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg sm:text-xl">🔍</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-800">Review Process</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base text-emerald-700">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <span className="text-emerald-500 font-bold mt-1">•</span>
                    <span><strong>Peer Review:</strong> All papers undergo rigorous peer-review process</span>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <span className="text-emerald-500 font-bold mt-1">•</span>
                    <span><strong>Review Criteria:</strong> Evaluated based on technical quality, originality, relevance, and presentation</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 bg-gradient-to-r from-sky-100 via-[#3aa3d9]/20 to-[#2086ca]/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-sky-500">
                <p className="text-sky-800 font-semibold text-center text-sm sm:text-base">
                  📌 All submissions will be available through the conference's online submission system on the website
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fees Flow Section */}
        <div className="text-center mb-6 sm:mb-8 mt-6 sm:mt-10 md:mt-16 lg:mt-20">
          <div className="bg-white/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 via-[#3aa3d9]/5 to-[#2086ca]/5"></div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-sky-400 mb-3 sm:mb-4 ">Registration Process Flow</h2>
            <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-1.5 sm:h-2 bg-gradient-to-r from-sky-400 via-[#3aa3d9] to-[#2086ca] rounded-full shadow-lg"></div>
                </div>
            <div className="relative z-10 flex justify-center">
              <div className="p-2 sm:p-3 md:p-4 bg-white/90 rounded-lg sm:rounded-xl md:rounded-2xl text-center shadow-lg border border-sky-200/50 w-full">
                <img src={feesFlow} alt="Registration Process Flow" className="w-full sm:w-[90%] md:w-[85%] lg:w-[80%] mx-auto h-auto rounded-lg sm:rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        
        {/* Submit Paper Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-center items-center gap-4 px-3">
          <Link
            to="/auth"
            className="group relative inline-flex items-center space-x-2 sm:space-x-3 md:space-x-4 bg-gradient-to-r from-sky-500 via-[#3aa3d9] to-[#2086ca] hover:from-sky-600 hover:via-[#3aa3d9] hover:to-[#2086ca] text-white  font-bold py-3 sm:py-4 px-4 sm:px-6 md:px-8 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 overflow-hidden w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center space-x-2 sm:space-x-3 md:space-x-4 w-full sm:w-auto justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl sm:text-2xl">📤</span>
              </div>
              <div className="text-left flex-1 sm:flex-initial">
                <div className="text-base sm:text-lg md:text-xl font-bold">Submit Paper</div>
                <div className="text-xs sm:text-sm text-white/90">Access submission portal</div>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:translate-x-1 transition-transform duration-300">
                <span className="text-lg sm:text-xl">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Editorial Board Section */}
        <div className="mt-6 sm:mt-10 md:mt-16 lg:mt-20 mb-6 sm:mb-8">
          <div className="bg-white/95 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl border border-sky-200/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-[#3aa3d9]/5 to-[#2086ca]/5"></div>
            
           
            <div className="relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-sky-400 mb-3 sm:mb-4">
                  GUEST EDITORS
                </h2>
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-1.5 sm:h-2 bg-gradient-to-r from-purple-400 via-[#3aa3d9] to-[#2086ca] rounded-full shadow-lg"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {[
                  { name: "Dr. Lung-Jieh Yang", title: "Department of Mechanical and Electro-Mechanical EngineerinngTamkang University, Taiwan" },
                  { name: "Prof. Anastasios P. Vassilopoulos", title: "Composite Mechanics Group (GR-MeC)Ecole Polytechnique Fédérale de Lausanne, Lausanne" },
                  { name: "Dr. Solomon Raju Kota", title: "Professor, Academy of Scientific and Innovative Research (AcSIR)Bengaluru, Karnataka, Hq: Ghaziabad" },
                  { name: "Dr. C. Chandra Shekhar", title: "Department of Computer Science & EngineeringIIT Madras, Chennai" },
                  { name: "Dr. Karthik Ramaswamy", title: "Senior Technology Leader, Fermi Silicon Designs Pvt LtdKaikondrahalli, Varthur(h)117, Bellandur, Bangalore" },
                  { name: "Dr. Paolo Sgarbossa", title: "Dipartimento di Ingegneria Industriale - DIIVia F. Marzolo, 9 - Padova, Italy" },
                  
                ].map((member, index) => (
                  <div key={index} className="bg-gradient-to-br from-white to-sky-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-sky-200/70 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br via-[#3aa3d9] to-[#2086ca] rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white text-xs sm:text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sky-800 text-sm sm:text-base md:text-lg mb-1">{member.name}</h3>
                        <p className="text-xs sm:text-sm text-sky-600 leading-relaxed">{member.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
         <div className="mt-6 sm:mt-10 md:mt-16 lg:mt-20 mb-6 sm:mb-8">
          <div className="bg-white/95 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl border border-sky-200/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-[#3aa3d9]/5 to-[#2086ca]/5"></div>
            
           
            <div className="relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-sky-400 mb-3 sm:mb-4">
                  MEMBERS
                </h2>
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-1.5 sm:h-2 bg-gradient-to-r from-purple-400 via-[#3aa3d9] to-[#2086ca] rounded-full shadow-lg"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {[
                  { name: "Dr. Jiankun Hu", title: "Professor, School of Systems and Computing, University of New South Wales." },
                  { name: "Dr. Paolo Sgarbossa", title: "Department of Industrial Engineering, University of Padova, Padova, Italy." },
                  { name: "Dr. K. Mohaideen Pitchai", title: "Professor, Department of Computer Science and Engineering, National Engineering College, K.R. Nagar, Kovilpatti-628 503, Tamil Nadu, INDIA." },
                  { name: "Dr. R. Harichandran", title: "Professor, Department of Mechanical Engineering, National Engineering College, K.R. Nagar, Kovilpatti-628 503, Tamil Nadu, INDIA." },
                  { name: "Dr. T.S. Arun Samuel", title: "Professor, Department of Electronics and Communication Engineering, National Engineering College, K.R.Nagar, Kovilpatti-628 503, Tamil Nadu, INDIA." },
                  { name: "Dr. F. Michael Thomas Rex", title: "Associate Professor, Department of Mechanical Engineering, National Engineering College, K.R. Nagar, Kovilpatti-628 503, Tamil Nadu, INDIA." },
                  { name: "Dr. C. Chella Gifta", title: "Associate Professor, Department of Civil Engineering, National Engineering College, K.R. Nagar, Kovilpatti-628 503, Tamil Nadu, INDIA." },
                  { name: "Dr. B. Vigneshwaran", title: "Associate Professor, Department of Electrical and Electronics Engineering, National Engineering College, K.R.Nagar, Kovilpatti-628 503, Tamil Nadu, INDIA." },
                  { name: "Dr. E. Ramachandran", title: "Assistant Professor (Senior Grade), Department of Science and Humanities, National Engineering College, K.R.Nagar, Kovilpatti-628 503, Tamil Nadu, INDIA." }
                ].map((member, index) => (
                  <div key={index} className="bg-gradient-to-br from-white to-sky-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-sky-200/70 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br via-[#3aa3d9] to-[#2086ca] rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white text-xs sm:text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sky-800 text-sm sm:text-base md:text-lg mb-1">{member.name}</h3>
                        <p className="text-xs sm:text-sm text-sky-600 leading-relaxed">{member.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Enhanced Header Section */}
        <div className="text-center mb-8 sm:mb-12 relative pt-8">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-sky-400 mb-3 sm:mb-4">
              Registration Fee Structure
            </h1>
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-20 sm:w-32 h-2 bg-gradient-to-r from-sky-400 to-sky-600 rounded-full shadow-lg"></div>
            </div>
            <p className="text-sky-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              Choose your registration category based on your professional profile
            </p>
          </div>
        </div>

        {/* Enhanced Main Table Container */}
        <div className="relative mb-8">
          {/* Enhanced Background decoration */}
          <div className="absolute -inset-2 sm:-inset-4 md:-inset-6 bg-gradient-to-r from-sky-400/10 via-emerald-400/8 to-sky-600/10 rounded-3xl"></div>
          <div className="absolute -inset-1 sm:-inset-2 md:-inset-4 bg-gradient-to-br from-white/50 to-sky-100/50 rounded-3xl"></div>
          
          <div className="relative bg-white/95 rounded-3xl shadow-2xl border border-sky-200/50 overflow-hidden">
            {/* Enhanced Table Header Decoration */}
            <div className="h-2 sm:h-3 bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-600 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-600 animate-pulse opacity-75"></div>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-sky-100/90 to-sky-50/90">
                    <th className="border-r border-sky-200/70 px-6 py-6 text-left font-bold text-sky-800 bg-white/80 min-w-[280px] relative group">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-10 bg-gradient-to-b from-sky-400 to-sky-600 rounded-full shadow-lg group-hover:scale-110 transition-all duration-300"></div>
                        <span className="text-xl">Category</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>
                    </th>
                    <th className="border-r border-sky-200/70 px-6 py-6 text-center font-bold text-sky-800 bg-white/60">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl drop-shadow-lg">🇮🇳</span>
                          <span className="text-2xl font-bold">Indian Delegates</span>
                        </div>
                        <div className="text-sm text-sky-600 bg-sky-100 px-4 py-2 rounded-lg font-bold shadow-sm">₹ INR</div>
                      </div>
                    </th>
                    <th className="px-6 py-6 text-center font-bold text-sky-800 bg-white/60">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl drop-shadow-lg">🌍</span>
                          <span className="text-2xl font-bold">Foreign Delegates</span>
                        </div>
                        <div className="text-sm text-sky-600 bg-sky-100 px-4 py-2 rounded-lg font-bold shadow-sm">$ USD</div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrationData.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`group hover:bg-sky-50/70 hover:shadow-lg transition-all duration-300 ${
                        index % 2 === 0 ? "bg-white/80" : "bg-sky-25/50"
                      }`}
                    >
                      <td className="border-r border-sky-200/70 px-6 py-6 font-semibold text-sky-800 relative">
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-12 rounded-full transition-all duration-300 group-hover:w-3 group-hover:scale-110 shadow-lg ${
                            index === 0 ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 
                            index === 1 ? 'bg-gradient-to-b from-purple-400 to-purple-600' : 
                            index === 2 ? 'bg-gradient-to-b from-sky-400 to-sky-600' : 
                            'bg-gradient-to-b from-orange-400 to-orange-600'
                          }`}></div>
                          <div>
                            <span className="text-lg font-bold">{row.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="border-r border-sky-200/70 px-4 py-6 text-center relative group">
                        <div className="bg-gradient-to-br from-sky-50 to-sky-100/80 rounded-xl p-4 border-2 border-sky-200/70 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 group-hover:border-sky-300 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-sky-200/20 to-transparent"></div>
                          <div className="relative z-10">
                            <div className="text-3xl font-bold text-sky-700">₹{row.indian}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center relative group">
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 rounded-xl p-4 border-2 border-emerald-200/70 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 group-hover:border-emerald-300 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-transparent"></div>
                          <div className="relative z-10">
                            <div className="text-3xl font-bold text-emerald-700">${row.foreign}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden p-4 sm:p-6 space-y-6">
              {registrationData.map((row, index) => (
                <div key={index} className="bg-white/95 rounded-2xl shadow-lg border border-sky-200 overflow-hidden">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-sky-100 to-sky-50 p-4 sm:p-6 border-b border-sky-200">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`w-2 h-12 rounded-full shadow-lg ${
                        index === 0 ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 
                        index === 1 ? 'bg-gradient-to-b from-purple-400 to-purple-600' : 
                        index === 2 ? 'bg-gradient-to-b from-sky-400 to-sky-600' : 
                        'bg-gradient-to-b from-orange-400 to-orange-600'
                      }`}></div>
                      <div>
                        <span className="text-lg sm:text-xl font-bold text-sky-800">{row.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Grid */}
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Indian Pricing */}
                      <div className="bg-gradient-to-br from-sky-50 to-sky-100/80 rounded-xl p-4 border-2 border-sky-200/70 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-200/20 to-transparent"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <span className="text-2xl">🇮🇳</span>
                            <span className="font-bold text-sm text-sky-700">Indian</span>
                          </div>
                          <div className="text-2xl sm:text-3xl font-bold text-sky-700 mb-1">₹{row.indian}</div>
                          <div className="text-xs text-sky-600 font-bold">INR</div>
                        </div>
                      </div>
                      {/* Foreign Pricing */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 rounded-xl p-4 border-2 border-emerald-200/70 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-transparent"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <span className="text-2xl">🌍</span>
                            <span className="font-bold text-sm text-emerald-700">Foreign</span>
                          </div>
                          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-1">${row.foreign}</div>
                          <div className="text-xs text-emerald-600 font-bold">USD</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Foreign Participants Payment Details */}
        <div className="mt-8 sm:mt-12 md:mt-16 bg-gradient-to-br from-sky-50 to-white rounded-2xl shadow-xl border-2 border-sky-200/70 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 via-[#3aa3d9] to-[#2086ca] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🌍</span>
            </div>
            <h4 className="text-lg font-bold text-sky-800">Foreign Participants Payment Details</h4>
          </div>
          <p className="text-sm text-sky-700 mb-3">
            Foreign participants alone should make the payment using the following bank account:
          </p>
          <div className="text-sm text-sky-800 space-y-1 font-medium bg-sky-100/80 rounded-lg p-4 border border-sky-200">
            <p><span className="font-bold">Bank:</span> STATE BANK OF INDIA</p>
            <p><span className="font-bold">Branch:</span> New Delhi - 110001</p>
            <p><span className="font-bold">Account Number:</span> 40250032867</p>
          </div>
          <p className="text-sm text-sky-700 mt-4">
            After completing the payment, please fill out the following form and upload your payment details:{" "}
            <a
              href="https://forms.gle/hjNPfzmveFqiMU8B8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 font-medium"
            >
              https://forms.gle/hjNPfzmveFqiMU8B8
            </a>
          </p>
        </div>

        {/* Enhanced Info Cards */}
        <div className="mt-8 sm:mt-12 md:mt-16 pb-8 sm:pb-12 md:pb-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white/95 rounded-2xl p-6 sm:p-8 border border-sky-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl sm:text-2xl">⚡</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-sky-800">Early Bird Benefits</h3>
              </div>
              <p className="text-sky-600 leading-relaxed text-sm sm:text-base">Register early and save significantly on your conference fees. Limited time offer with extended deadlines for planning.</p>
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-xs sm:text-sm font-bold text-emerald-700">💡 Save up to ₹1,000 / $25</div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 rounded-2xl p-6 sm:p-8 border border-sky-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl sm:text-2xl">💰</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-sky-800">What's Included</h3>
              </div>
              <p className="text-sky-600 leading-relaxed text-sm sm:text-base">All prices include conference materials, meals, networking sessions, and official certificate of participation.</p>
              <div className="mt-4 p-3 bg-sky-50 rounded-lg border border-sky-200">
                <div className="text-xs sm:text-sm font-bold text-sky-700">📦 Complete Conference Package</div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 rounded-2xl p-6 sm:p-8 border border-sky-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl sm:text-2xl">📋</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-sky-800">Tax Information</h3>
              </div>
              <p className="text-sky-600 leading-relaxed text-sm sm:text-base">All registration fees are inclusive of applicable taxes. No hidden charges or additional fees at checkout.</p>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-xs sm:text-sm font-bold">✅ Tax Inclusive Pricing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Call to Action */}
        
      </div>
     
    </div>
  );
};
export default RegistrationTable;
