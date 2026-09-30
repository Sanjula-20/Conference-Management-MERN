import sigma from './assets/sigma.png';
import thermal from './assets/thermal.png';
import epj from './assets/epj.png';
import lecture from './assets/lecture.png';
import { Calendar, Clock, Award, Users } from 'lucide-react';

const Dates = () => {
  const importantDates = [
    {
      title: "Full length paper submission deadline",
      oldDate: "31/12/2025",
      date: "31/01/2026",
      extra: "Camera Ready Paper Submission : 23/03/2026",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-red-500"
    },
    {
      title: "Notification of final acceptance",
      oldDate: "10/01/2026",
      date: "10/02/2026",
      icon: <Award className="w-6 h-6" />,
      color: "bg-green-500"
    },
    {
      title: "Registration (Early bird) deadline",
      oldDate: "31/01/2026",
      date: "20/02/2026",
      subtitle: "Register before this date for discounted rates",
      icon: <Clock className="w-6 h-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Registration (Regular) deadline",
      oldDate: "14/02/2026",
      date: "28/02/2026",
      subtitle: "Register before this date for regular rates",
      icon: <Users className="w-6 h-6" />,
      color: "bg-orange-500"
    }
  ];

  const publications = [
    {
      title: "Sigma Journal of Engineering and Natural Sciences",
      subtitle: "",
      details: "Scopus, ESCI, IF 0.6",
      logo: sigma
    },
    {
      title: "Journal of Thermal Engineering",
      subtitle: "",
      details: "Scopus, ESCI, IF 1.4",
      logo: thermal
    },
    {
      title: "EPJ Web of Conferences",
      subtitle: "",
      details: "Scopus",
      sub: "",
      logo: epj
    },
    {
      title: "Lecture Notes in Computer Science",
      subtitle: "",
      details: "Scopus",
      sub: "Awaiting for Final Confirmation",
      logo: lecture
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Important Dates Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-sky-500 mb-8 text-center">
            Important Dates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {importantDates.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className={item.color + " text-white p-3 rounded-full"}>
                    {item.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>

                    <div className="mb-2">
                      {/* Old date */}
                      <div className="text-lg text-gray-400 line-through mb-1">
                        {item.oldDate}
                      </div>

                      {/* Logic: Only first item NOT struck */}
                      {index === 0 ? (
                        <>
                          <div className="text-2xl font-bold text-sky-600">
                            {item.date}
                          </div>
                          {item.extra && (
                            <div className="text-xl font-bold text-red-600 mt-1">
                              {item.extra}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-lg text-gray-400 line-through">
                          {item.date}
                        </div>
                      )}
                    </div>

                    {item.subtitle && (
                      <p className="text-sm text-gray-600">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publications Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-sky-500 mb-4 text-center">
            Publications
          </h2>

          <div className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            All the peer-reviewed accepted papers will be considered for the following Scopus indexed journals based on the quality.
            <br /><br />
            <div className="inline-flex items-center cursor-pointer text-white font-bold text-sm bg-gradient-to-r from-orange-400 to-red-400 px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
              It is mandatory that at least one of the authors registers for the conference and presents the paper.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {publications.map((pub, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 mb-6">
                  <img
                    src={pub.logo}
                    alt={pub.title}
                    className="mx-auto h-30 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="px-8 pb-8 text-center flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold cursor-pointer text-gray-800 mb-3 leading-tight hover:text-sky-600 transition-colors duration-300">
                      {pub.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold">
                      {pub.sub}
                    </p>
                  </div>

                  <div className="relative mt-auto">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-gray-700 text-sm font-bold uppercase tracking-widest">
                          Indexing Details
                        </span>
                      </div>
                      <p className="text-green-700 font-bold text-xl tracking-wide">
                        {pub.details}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dates;
