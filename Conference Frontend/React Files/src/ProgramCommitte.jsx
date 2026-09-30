import Header from "./Header";
import Footer from "./Footer";

const ProgramCommittee = () => {
  const committeeMembers = [
    // General Chair
    {
      id: 1,
      name: "Dr. M. A. Neelakantan",
      position: "Senior Dean (IFA and R&D) ",
      department: "NEC",
      role: "General Chair"
    },
    // General Co-Chairs
    {
      id: 2,
      name: "Dr. R. V. Maheswari",
      position: "Professor",
      department: "EEE",
      role: "General Co-Chair"
    },
    {
      id: 3,
      name: "Dr. R. Harichandran",
      position: "Professor",
      department: "Mech",
      role: "General Co-Chair"
    },
    // Programme Committee Members
    {
      id: 4,
      name: "Dr. D. Manimegalai",
      position: "COE",
      department: "CSE",
      role: "Programme Committee"
    },
    {
      id: 5,
      name: "Dr. A. Shenbagavalli",
      position: "Dean (Academic & FDS)",
      department: "ECE",
      role: "Programme Committee"
    },
    {
      id: 11,
      name: "Dr. S. Tamilselvi",
      position: "Prof. & Head",
      department: "ECE",
      role: "Programme Committee"
    },
    {
      id: 7,
      name: "Dr. B. Paramasivan",
      position: "Dean (PG Studies)",
      department: "CSE",
      role: "Programme Committee"
    },
    {
      id: 6,
      name: "Dr. K. G. Srinivasagan",
      position: "Dean (IR), Prof. & Head",
      department: "IT",
      role: "Programme Committee"
    },
    {
      id: 9,
      name: "Dr. V. Gomathi",
      position: "Prof. & Head",
      department: "CSE",
      role: "Programme Committee"
    },
    {
      id: 8,
      name: "Dr. M. Willjuice Iruthayarajan",
      position: "Prof. & Head",
      department: "EEE",
      role: "Programme Committee"
    },
    {
      id: 12,
      name: "Dr. S. Iyahraja",
      position: "Prof. & Head",
      department: "Mech",
      role: "Programme Committee"
    },
    {
      id: 10,
      name: "Dr. V. Kalaivani",
      position: "Prof. & Head",
      department: "AI&DS",
      role: "Programme Committee"
    },
    {
      id: 13,
      name: "Dr. I. Padmanaban",
      position: "Prof. & Head",
      department: "Civil",
      role: "Programme Committee"
    },
    {
      id: 14,
      name: "Dr. L. Kalaivani",
      position: "Prof. & Head",
      department: "SPQAC",
      role: "Programme Committee"
    },
    {
      id: 15,
      name: "Dr. T. S. Arun Samuel",
      position: "Professor",
      department: "ECE",
      role: "Programme Committee"
    },
    {
      id: 19,
      name: "Dr. S. Thalamuthu",
      position: "Associate Professor",
      department: "S&H",
      role: "Programme Committee"
    },
    {
      id: 16,
      name: "Dr. S. Kalaiselvi",
      position: "Associate Professor",
      department: "CSE",
      role: "Programme Committee"
    },
    {
      id: 17,
      name: "Dr. D. Vignesh Kumar",
      position: "Associate Professor",
      department: "Mech",
      role: "Programme Committee"
    },
    {
      id: 18,
      name: "Dr. S. Dheenathayalan",
      position: "Associate Professor",
      department: "CSE",
      role: "Programme Committee"
    }
  ];

  const generalChair = committeeMembers.filter(member => member.role === "General Chair");
  const generalCoChairs = committeeMembers.filter(member => member.role === "General Co-Chair");
  const programmeCommittee = committeeMembers.filter(member => member.role === "Programme Committee");

  const getRoleColor = (role) => {
    switch (role) {
      case "General Chair":
        return "bg-purple-100 text-purple-800 border-purple-500";
      case "General Co-Chair":
        return "bg-indigo-100 text-indigo-800 border-indigo-500";
      case "Programme Committee":
        return "bg-blue-100 text-blue-800 border-blue-500";
      default:
        return "bg-gray-100 text-gray-800 border-gray-500";
    }
  };

  const getRoleGradient = (role) => {
    switch (role) {
      case "General Chair":
        return "from-purple-600 to-purple-700";
      case "General Co-Chair":
        return "from-indigo-600 to-indigo-700";
      case "Programme Committee":
        return "from-blue-600 to-blue-700";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  const MemberCard = ({ member, index }) => (
    <div className={`bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 hover:shadow-lg transition-shadow duration-200 ${getRoleColor(member.role).split(' ')[2]}`}>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {member.position}{member.department ? ` / ${member.department}` : ''}
            </p>
          </div>
          <span className="text-xs text-gray-500 ml-2">#{index + 1}</span>
        </div>
        <div className="pt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
            {member.role}
          </span>
        </div>
      </div>
    </div>
  );

  const renderSection = (members, title, role) => (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        {title}
      </h2>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`bg-gradient-to-r ${getRoleGradient(role)} text-white`}>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member, index) => (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-gray-50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                        {member.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                        {member.department || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="text-center mb-8">
          <div className={`w-20 h-1 bg-gradient-to-r ${getRoleGradient(role)} mx-auto rounded-full`}></div>
        </div>
        
        <div className="space-y-4">
          {members.map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
     

      <main className="flex-grow py-44 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Program Committee
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Leadership and organizing committee members for the conference
            </p>
          </div>

          {/* General Chair Section */}
          {renderSection(generalChair, "General Chair", "General Chair")}

          {/* General Co-Chairs Section */}
          {renderSection(generalCoChairs, "General Co-Chairs", "General Co-Chair")}

          {/* Programme Committee Section */}
          {renderSection(programmeCommittee, "Programme Committee Members", "Programme Committee")}
        </div>
      </main>

     
    </div>
  );
};

export default ProgramCommittee;
