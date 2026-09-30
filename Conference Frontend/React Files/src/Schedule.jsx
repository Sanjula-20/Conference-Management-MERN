import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp, Coffee, Utensils, Users } from 'lucide-react';

const Schedule = () => {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scheduleData = {
    day1: [
      {
        id: 'reg',
        time: '09:00 AM – 10:00 AM',
        title: 'Registration',
        venue: 'SH Block',
        extra: 'Faculty Incharge: Dr. K. Karthikkumar, AP(SG)/EEE | Mr. F. Antony Jeffrey Vaz, AP/EEE',
        type: 'plenary'
      },
      {
        id: 'inaugural',
        time: '10:00 AM – 11:00 AM',
        title: 'Inaugural Function',
        venue: 'Auditorium',
        type: 'plenary'
      },
      {
        id: 'k1',
        time: '11:00 AM – 11:45 AM',
        title: 'Keynote Talk #1',
        venue: 'Auditorium',
        speaker: 'Shri M. Vellaipandi',
        designation: 'Director General',
        organization: 'Standardisation Testing and Quality Certification Directorate (STQC), Ministry of Electronics and Information Technology, Government of India, New Delhi',
        type: 'keynote'
      },
      {
        id: 'tea1',
        time: '11:45 AM',
        title: 'Tea Break',
        type: 'break',
        icon: 'tea'
      },
      {
        id: 'k2',
        time: '11:45 AM – 12:45 PM',
        title: 'Keynote Talk #2: Semiconductor Sensors And Recent Indo-Taiwan Cooperation',
        venue: 'Auditorium',
        speaker: 'Dr. Lung-Jieh Yang',
        designation: 'Professor, Department of Mechanical and Electro-Mechanical Engineering',
        organization: 'Tamkang University, Taiwan',
        type: 'keynote'
      },
      {
        id: 'lunch',
        time: '12:45 PM – 02:00 PM',
        title: 'Lunch',
        venue: 'Ladies Hostel',
        type: 'break',
        icon: 'lunch'
      },
      {
        id: 'k3',
        time: '02:00 PM – 03:00 PM',
        title: 'Keynote Talk #3: Android Under Siege: Decoding Malware Behavior, Threat Intelligence, and Modern Cyber Defense in Mobile Ecosystems',
        venue: 'Seminar Hall / ECE Dept',
        speaker: 'Dr. M. Satheesh Kumar',
        designation: 'Associate Principal – Cybersecurity',
        organization: 'LTI Mindtree, Chennai',
        extra: 'Faculty Incharge: Dr. M. Sathish Kumar, AP(SG)/ECE',
        type: 'keynote'
      },
      {
        id: 'k4',
        time: '02:00 PM – 03:00 PM',
        title: 'Keynote Talk #4: Sustainable Building Materials',
        venue: 'Mechanical Seminar Hall',
        speaker: 'Dr. M. Ashok',
        designation: 'Principal Scientist, Corrosion and Materials Protection Division',
        organization: 'CSIR-CECRI, Karaikudi',
        extra: 'Faculty Incharge: Dr. C. Chella Gifta, Assoc. Prof/CIVIL',
        type: 'keynote'
      },
      {
        id: 'track1',
        time: '02:00 PM – 05:00 PM',
        title: 'Track 1: Advanced Computing & Cyber-Physical Systems',
        venue: 'CSE Seminar Hall',
        extra: 'Chairpersons: Dr. K. Mohaideen Pitchai, Professor | Dr. V. Anitha, AP(SG)/IT\nFaculty Incharge: Mr. K. Rajkumar, AP(SG)/CSE',
        type: 'parallel'
      },
      {
        id: 'track2a',
        time: '02:00 PM – 05:00 PM',
        title: 'Track 2A: Emerging & Frontier Technologies',
        venue: 'EEE Seminar Hall',
        extra: 'Chairpersons: Dr. F. Michael Thomas Rex, Assoc. Prof/Mech | Dr. B. Vigneswaran, Assoc. Prof/EEE\nFaculty Incharge: Mr. M. Sivapalanirajan, AP(SG)/EEE',
        type: 'parallel'
      },
      {
        id: 'tea2',
        time: '03:00 PM – 03:15 PM',
        title: 'Tea Break',
        type: 'break',
        icon: 'tea'
      },
      {
        id: 'track3',
        time: '03:00 PM – 05:00 PM',
        title: 'Track 3: Sustainable Transportation & E-Mobility',
        venue: 'Mechanical Seminar Lab',
        extra: 'Chairpersons: Dr. S. Iyahraja, Prof & Head/Mech | Dr. B. Venkatasamy, AP(SG)/EEE\nFaculty Incharge: Dr. C. Veera Ajay, AP(SG)/Mech',
        type: 'parallel'
      },
      {
        id: 'track4',
        time: '03:00 PM – 05:00 PM',
        title: 'Track 4: Nextgen Communication, VLSI & Embedded Systems',
        venue: 'e-Yantra Lab',
        extra: 'Chairpersons: Dr. Ramji Gupta, Assoc. Prof, Parul University, Vadodara, Gujarat | Dr. M. Sathish Kumar, AP(SG)/ECE\nFaculty Incharge: Mrs. C. Kaleeshwari, AP/ECE',
        type: 'parallel'
      }
    ],

    day2: [
      {
        id: 'k5',
        time: '09:30 AM – 10:30 AM',
        title: 'Keynote Talk #5: Power Electronic Controllers for Sustainable Energy Grids',
        venue: 'EEE Seminar Hall',
        speaker: 'Dr. Vijayakumar K.',
        designation: 'Associate Professor',
        organization: 'Indian Institute of Information Technology Design and Manufacturing (IIITDM), Kancheepuram',
        extra: 'Faculty Incharge: Dr. M. Gengaraj, AP(SG)/EEE',
        type: 'keynote'
      },
      {
        id: 'track2b',
        time: '10:00 AM – 01:00 PM',
        title: 'Track 2B: Emerging & Frontier Technologies',
        venue: 'UG-3 Lab / IT Lab',
        extra: 'Chairpersons: Dr. J. Naskath, Assoc. Prof/AIDS | Dr. S. Chidambaram, Associate Prof/IT\nFaculty Incharge: Ms. N. Gowthami, AP (Sr. Grade)/IT',
        type: 'parallel'
      },
      {
        id: 'track5',
        time: '10:00 AM – 01:00 PM',
        title: 'Track 5: Environment, Climate-Tech & Sustainable Infrastructure',
        venue: 'SH Seminar Lab',
        extra: 'Chairpersons: Dr. I. Padmanaban, Professor & Head | Dr. T. S. Arun Samuel, Professor\nFaculty Incharge: K. Latha, AP/S&H',
        type: 'parallel'
      },
      {
        id: 'k6',
        time: '10:30 AM – 11:30 AM',
        title: 'Keynote Talk #6: Recent Trends in VLSI Testing',
        venue: 'EEE Seminar Hall',
        speaker: 'Dr. Karthik Ramaswamy',
        designation: 'Senior Technology Leader',
        organization: 'Fermi Silicon Designs Pvt Ltd, Kaikondrahalli, Varthur(h)117, Bellandur, Bangalore',
        extra: 'Faculty Incharge: Dr. K. J. Prasanna Venkatesan, Asso. Prof/ECE',
        type: 'keynote'
      },
      {
        id: 'tea3',
        time: '11:00 AM – 11:15 AM',
        title: 'Tea Break',
        type: 'break',
        icon: 'tea'
      },
      {
        id: 'k7',
        time: '11:30 AM – 12:30 PM',
        title: 'Keynote Talk #7: Hardware Implementation of ML Algorithm for Cyber Security Application',
        venue: 'EEE Seminar Hall',
        speaker: 'Dr. Solomon Raju Kota',
        designation: 'Chief Scientist & Head, ICTD, CSIR-NAL, Bengaluru | Professor, Academy of Scientific and Innovative Research (AcSIR), Hq: Ghaziabad',
        organization: 'CSIR-NAL, Bengaluru, Karnataka',
        extra: 'Faculty Incharge: Dr. K. J. Prasanna Venkatesan, Asso. Prof/ECE',
        type: 'keynote'
      },
      {
        id: 'k8',
        time: '11:30 AM – 12:30 PM',
        title: 'Keynote Talk #8: Deep Learning for Medical Image and EEG',
        venue: 'CSE Seminar Hall',
        speaker: 'Dr. Prof. Lipo Wang',
        designation: 'Professor, School of Electrical and Electronic Engineering',
        organization: 'Nanyang Technological University, Singapore',
        extra: 'Faculty Incharge: Dr. K. Mohideen Pitchai, Prof/CSE',
        type: 'keynote'
      },
      {
        id: 'k9',
        time: '02:00 PM – 03:00 PM',
        title: 'Keynote Talk #9: Inorganic and Hybrid Materials for Water Decontamination',
        venue: 'SH Seminar Hall',
        speaker: 'Dr. Paolo Sgarbossa',
        designation: 'Professore Associato, Dipartimento di Ingegneria Industriale – DII',
        organization: 'Università degli Studi di Padova, Via F. Marzolo, 9 – Padova, Italy',
        extra: 'Faculty Incharge: Dr. E. Ramachandran',
        type: 'keynote'
      }
    ]
  };

  const typeConfig = {
    keynote: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-700',
      label: 'Keynote'
    },
    plenary: {
      border: 'border-indigo-500',
      bg: 'bg-indigo-50',
      badge: 'bg-indigo-100 text-indigo-700',
      label: 'Plenary'
    },
    parallel: {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-700',
      label: 'Parallel Track'
    },
    break: {
      border: 'border-amber-400',
      bg: 'bg-amber-50',
      badge: 'bg-amber-100 text-amber-700',
      label: 'Break'
    }
  };

  const Card = ({ s }) => {
    const cfg = typeConfig[s.type];
    const hasDetails = s.speaker || s.extra;

    return (
      <div className={`border-l-4 ${cfg.border} ${cfg.bg} p-4 mb-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                {cfg.label}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-600 font-medium">
                <Clock size={14} className="shrink-0" />
                {s.time}
              </span>
            </div>

            <h3 className="text-base font-bold text-gray-800 leading-snug">{s.title}</h3>

            {s.venue && (
              <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin size={13} className="shrink-0" />
                {s.venue}
              </p>
            )}

            {s.speaker && (
              <p className="flex items-center gap-1 text-sm text-gray-700 mt-1 font-medium">
                <Users size={13} className="shrink-0" />
                {s.speaker}
              </p>
            )}
          </div>

          {hasDetails && (
            <button
              onClick={() => toggle(s.id)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0 mt-1"
            >
              {expanded[s.id] ? (
                <><ChevronUp size={16} /> Hide</>
              ) : (
                <><ChevronDown size={16} /> Details</>
              )}
            </button>
          )}
        </div>

        {expanded[s.id] && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-sm space-y-1">
            {s.speaker && (
              <>
                <p className="font-semibold text-gray-800">{s.speaker}</p>
                {s.designation && <p className="text-gray-600">{s.designation}</p>}
                {s.organization && <p className="text-gray-600">{s.organization}</p>}
              </>
            )}
            {s.extra && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                {s.extra.split('\n').map((line, i) => (
                  <p key={i} className="text-gray-500 text-xs">{line}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const DaySection = ({ title, day, items }) => (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-lg shadow">
          <Calendar size={20} />
          {title}
        </div>
        <div className="text-sm text-gray-500 font-medium">{day}</div>
      </div>
      {items.map(s => <Card key={s.id} s={s} />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
            Conference Schedule
          </div>
          <h1 className="text-4xl font-extrabold text-blue-800 mb-1 tracking-tight">ICoDSES 2026</h1>
          <p className="text-gray-500 text-base">March 26 – 27, 2026</p>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="/ICoDSES/International Conference schedule.pdf"
            download
            className="bg-[#4ebceb] hover:bg-[#2086ca] text-white px-6 py-3 rounded-lg shadow-md text-center font-medium transition-colors duration-200"
          >
            📄 Download Session Schedule
          </a>
          <a
            href="/ICoDSES/Keynote Speakers _venue.pdf"
            download
            className="border-2 border-[#4ebceb] text-[#2086ca] px-6 py-3 rounded-lg hover:bg-[#4ebceb] hover:text-white text-center font-medium transition-colors duration-200"
          >
            🎤 Download Keynote Details
          </a>
        </div>

        {/* Legend */}
       

        <DaySection title="Day 1" day="26 March 2026" items={scheduleData.day1} />
        <DaySection title="Day 2" day="27 March 2026" items={scheduleData.day2} />

      </div>
    </div>
  );
};

export default Schedule;
