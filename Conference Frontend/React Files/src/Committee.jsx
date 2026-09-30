const Committee = () => {
  const experts = [
    {
      id: 1,
      name: "Dr. Paolo Sgarbossa",
      institution: "University of Padova, Department of Industrial Engineering",
      country: "Italy",
      type: "International"
    },
    {
      id: 2,
      name: "Dr. Chidambaram Sabarathinam",
      institution: "Kuwait Institute for Scientific Research, Water Research Center",
      country: "Kuwait",
      type: "International"
    },
    {
      id: 3,
      name: "Dr. Balaji Narayanaswamy",
      institution: "The University of Sydney",
      country: "Australia",
      type: "International"
    },
    {
      id: 4,
      name: "Dr. Jiankun Hu",
      institution: "The University of New South Wales, ADFA",
      country: "Australia",
      type: "International"
    },
    {
      id: 5,
      name: "Dr. Hsiao-Hwa Chen",
      institution: "National Cheng Kung University",
      country: "Taiwan",
      type: "International"
    },
    {
      id: 6,
      name: "Dr. Nirmalya Roy",
      institution: "University of Maryland, Baltimore",
      country: "United States",
      type: "International"
    },
    {
      id: 7,
      name: "Dr. Moncef Gabbouj",
      institution: "Tampere University",
      country: "Finland",
      type: "International"
    },
    {
      id: 8,
      name: "Dr. P. N. Suganthan",
      institution: "Qatar University, KINDI Computing Research Center",
      country: "Qatar",
      type: "International"
    },
    {
      id: 9,
      name: "Dr. R. Brakaspathy",
      institution: "Indian Institute of Technology Madras, Chennai",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 10,
      name: "Dr. M. Panchamtcharam",
      institution: "Indian Institute of Technology Tirupati",
      country: "India (Andhra Pradesh)",
      type: "National"
    },
    {
      id: 11,
      name: "Dr. Muthu Senthil Pandian",
      institution: "SSN Research Centre, SSN Institutions, Chennai",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 12,
      name: "Dr. G. Siva Kumar",
      institution: "ARCI, Hyderabad",
      country: "India (Telangana)",
      type: "National"
    },
    {
      id: 13,
      name: "Dr. Vishal Santosh Sharma",
      institution: "NIT Jalandhar, Punjab",
      country: "India (Punjab)",
      type: "National"
    },
    {
      id: 14,
      name: "Dr.-Ing. M. Duraiselvam",
      institution: "NIT Tiruchirappalli",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 15,
      name: "Dr. M. Surendar",
      institution: "NIT Puducherry",
      country: "India (Puducherry)",
      type: "National"
    },
    {
      id: 16,
      name: "Dr. D. Sriram Kumar",
      institution: "NIT Trichy",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 17,
      name: "Dr. C. Krishna Mohan",
      institution: "IIT Hyderabad",
      country: "India (Telangana)",
      type: "National"
    },
    {
      id: 18,
      name: "Dr. V. Natarajan",
      institution: "SETS, Chennai",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 19,
      name: "Dr. V. Masilamani",
      institution: "IIITDM Kancheepuram",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 20,
      name: "Dr. N. Sankara Narayanan",
      institution: "NIT Tiruchirappalli",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 21,
      name: "Dr. P. Somasundaram",
      institution: "Anna University, CEG Campus, Chennai",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 22,
      name: "Dr. M. Ashok",
      institution: "CSIR-CECRI, Karaikudi",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 23,
      name: "M. D. Selvaraj",
      institution: "IIITDM Kancheepuram",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 24,
      name: "Dr. J. Klutto Milleth",
      institution: "CEWiT, IIT Madras",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 25,
      name: "Dr.G. Lakshminarayanan",
      institution: "NIT Tiruchirappalli",
      country: "India (Tamil Nadu)",
      type: "National"
    },
    {
      id: 26,
      name: "Dr. Shajulin Benedict",
      institution: "IIT Kottayam",
      country: "India (Kerala)",
      type: "National"
    },
  ];

  const internationalExperts = experts.filter(expert => expert.type === "International");
  const nationalExperts = experts.filter(expert => expert.type === "National");

  const MemberCard = ({ expert, index, type }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-[#4ebceb]  hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{expert.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{expert.institution}</p>
          </div>
          <span className="text-xs text-gray-500 ml-2">#{index + 1}</span>
        </div>
        <div className="pt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            type === "International" 
              ? 'bg-blue-100 text-[#4ebceb]' 
              : 'bg-green-100 text-green-800'
          }`}>
            {type === "National" ? expert.country.replace('India (', '').replace(')', '') : expert.country}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow py-44 px-4">
        <div className="max-w-4xl  mx-auto">
          <div className="text-center  mb-12">
            <h1 className="text-4xl md:text-5xl  font-bold text-gray-800 mb-4">
              Advisory Committee Members
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Distinguished experts and researchers from around the world
            </p>
          </div>

          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden lg:block">
            {/* International Members Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                International Members
              </h2>
              
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-[#4ebceb] text-white">
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                          S.No
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                          Institution
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                          Country
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {internationalExperts.map((expert, index) => (
                        <tr 
                          key={expert.id} 
                          className={`hover:bg-blue-50 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            {expert.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                              {expert.institution}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {expert.country}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* National Members Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                National Members
              </h2>
              
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                          S.No
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                          Institution
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                          State
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {nationalExperts.map((expert, index) => (
                        <tr 
                          key={expert.id} 
                          className={`hover:bg-green-50 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            {expert.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                              {expert.institution}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {expert.country.replace('India (', '').replace(')', '')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Card View - Hidden on desktop */}
          <div className="lg:hidden">
            {/* International Members Section */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  International Members
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-4">
                {internationalExperts.map((expert, index) => (
                  <MemberCard key={expert.id} expert={expert} index={index} type="International" />
                ))}
              </div>
            </div>

            {/* National Members Section */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  National Members
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-4">
                {nationalExperts.map((expert, index) => (
                  <div key={expert.id} className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-l-green-500 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{expert.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{expert.institution}</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">#{index + 1}</span>
                      </div>
                      <div className="pt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {expert.country.replace('India (', '').replace(')', '')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}

export default Committee
