import { useState } from "react";
import { MapPin, Clock, User, ChevronDown, ChevronUp, Search } from "lucide-react";

const tracks = [
  {
    id: "track-1",
    title: "Track 1",
    date: "26.03.2026 (AN)",
    time: "2:00 PM",
    venue: "CSE Seminar Hall",
    track: "Advanced Computing & Cyber-Physical Systems",
    facultyIncharge: "Mr. K. Rajkumar, AP(SG)/CSE",
    color: "bg-sky-500",
    light: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-600",
    badge: "bg-sky-100 text-sky-700",
    entries: [
      { paperId: "21", title: "Multimodal Patent Novelty Detection: A Claim-Level Approach Using Deep NLP", authors: "R Tarun Subramani, Shri Vishaal D.V, Dr. J. Rajeswari", email: "tarun2210593@ssn.edu.in", phone: "9962089659" },
      { paperId: "119", title: "Diabetes Risk Prediction Using Ensemble Machine Learning For Early Clinical Decision Support", authors: "Rishika P, Dr. T. RathaJeyalakshmi", email: "rishikasunil24@gmail.com", phone: "8590388339" },
      { paperId: "315", title: "Deep Learning-Driven Knee Injury Risk Prediction Using Wearable IoT Sensors for Athletes", authors: "Dr. S. Mary Joans, B. Anusha, Eswararaju Sneha, M. Shobana Vani", email: "ecehod@velammal.edu.in", phone: "9884675641" },
      { paperId: "318", title: "Fake News Detection Using Enhanced BERT", authors: "Ms. Jeevitha R, Surya KF, Bikash Yadav, Anushree S", email: "jeedhar95@gmail.com", phone: "9786943885" },
      { paperId: "346", title: "An Intelligent Real-Time Network Bandwidth Monitoring, Control, and Optimization System using EvilSmartLimiter Algorithm", authors: "Tharanitharan N", email: "tharanitharan.n2022cse@sece.ac.in", phone: "9345840261" },
      { paperId: "357", title: "An Energy-Efficient Hybrid Spiking Neural Network for Facial Emotion Recognition Using Temporal-Spatial Feature Fusion", authors: "Aakanksha Taliwal, Dr. Ramji Gupta, R. Muthukkumar", email: "aakankshataliwal@gmail.com", phone: "9409029874" },
      { paperId: "361", title: "Design and Development of an AI-Based Predictive Modeling Architecture for Early Diagnosis and Risk Stratification of Diabetes", authors: "Thangarasan T", email: "thangarasant@mits.ac.in", phone: "9894352478" },
      { paperId: "408", title: "SILENT VOICE: A Smart-Glove System for Real-Time Sign-to-Speech Translation", authors: "Sasikala C", email: "c.sasikalacse@gmail.com", phone: "9944065928" },
      { paperId: "422", title: "XVisionNet v2: A Protocol-Aware Hybrid Ensemble Model for Network Intrusion Detection", authors: "Rajeshkumar S, NareanPrasath A K, Nitesh P K, Kesavan K, Deepanandham P, Prasanna S", email: "suyamburajesh@gmail.com", phone: "7904834470" },
    ],
  },
  {
    id: "track-2a",
    title: "Track 2A",
    date: "26.03.2026 (AN)",
    time: "2:00 PM",
    venue: "EEE Seminar Hall",
    track: "Emerging & Frontier Technologies",
    facultyIncharge: "Mr. M. Sivapalanirajan, AP(SG)/IT",
    color: "bg-violet-500",
    light: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
    entries: [
      { paperId: "27", title: "Performance Analysis of Machine Learning Techniques for the Early Diagnosis of Monkeypox Disease", authors: "P. Ramkumar, R. Uma, Anitha Ruth, Sathiya A", email: "ramkumarkohila@gmail.com", phone: "8925169095" },
      { paperId: "40", title: "Analysis Of The Performance Of Classification Enhancement For Sleep Apnea Disease Using EEG Signal", authors: "P. Ramkumar, Dr. E. Saravanakumar, Dr. R. Uma, Dr. J. Anitha Ruth, Dr. K. Abinaya", email: "ramkumarkohila@gmail.com", phone: "8925169095" },
      { paperId: "108", title: "Property-Constrained CVAE for Inverse Design of Novel Odorant Molecules: A Pilot Study in Computational Olfaction", authors: "Guna, T. RathaJeyalakshmi", email: "gunardsce@gmail.com", phone: "7349414184" },
      { paperId: "124", title: "The Future of Fire Safety: IoT-Based Smoke Detection and Predictive Analytics", authors: "S Angel Selva Packyam, S M Rajkumar, Veeranan Arunprasad, K Vinukumar", email: "angelselvapackiam@gmail.com", phone: "9360736766" },
      { paperId: "216", title: "Cross-Modal Progressive Transfer Learning for Image Captioning", authors: "Dr. Sornavalli G, Merudhula S, Kaviyapriya K", email: "sornavallig@ssn.edu.in", phone: "9894441370" },
      { paperId: "224", title: "Core-Set Based Active Learning for Efficient Deep Neural Network Training", authors: "Mareeswari G, Suresh R, Mathivanan M, Zainudeen S", email: "mareeswari@ritrjpm.ac.in", phone: "8098623088" },
      { paperId: "235", title: "Safety Jacket: An IoT Based Wearable Device with Weather Control and Fall Detection Prediction", authors: "Gokulan E A, Devdarsh N, Tarun Roshaan A S", email: "gokulanea@gmail.com", phone: "6382491539" },
      { paperId: "245", title: "Detection of Emotion-Manipulated Political Deepfake Videos Using Temporal Facial Dynamics", authors: "Kanchan Vasantrao Warkar, Sandhya Dhage, Pakhee Mohabansi, Lakshmi Madireddy", email: "kanchan22.warkar@gmail.com", phone: "9028431261" },
      { paperId: "253", title: "Transforming Language Classrooms: Harnessing Innovative Approaches to Enhance Language Teaching", authors: "Dr. K. Latha, T. Hareni, S. Sanjula, J. Sai Sankar, P. Murugan", email: "latha@nec.edu.in", phone: "9486882812" },
      { paperId: "331", title: "Modeling Neural-Muscular-Autonomic Interactions using a Conductance Fusion Matrix", authors: "Sri Nithy B, Logika N, Basitha Parveen S S, Rajeswari S", email: "—", phone: "—" },
      { paperId: "414", title: "BERT Enhanced Hierarchical Multi-Head Attention Framework For Sentiment Analysis", authors: "Dr. V. Manimaran, Bagavathi Gayathri S, Dr. V. Anitha, Dr. Joywinston James", email: "maranit@nec.edu.in", phone: "8870044077" },
    ],
  },
  {
    id: "track-2b",
    title: "Track 2B",
    date: "27.03.2026 (FN)",
    time: "10:00 AM",
    venue: "UG3-IT Lab",
    track: "Emerging & Frontier Technologies",
    facultyIncharge: "Ms. N. Gowthami, AP(SG)/IT",
    color: "bg-pink-500",
    light: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-600",
    badge: "bg-pink-100 text-pink-700",
    entries: [
      { paperId: "257", title: "DyG-GINE-AP: A Dynamic Gated Graph Isomorphism Network with Adaptive Pooling for Explainable Molecular Property Prediction", authors: "Monnishkaran Madheswaran, Keerthana Jaganathan, Balaji Narayanaswamy, Lakshmanan Shanmugam", email: "monnishkaran.m2022@vitstudent.ac.in", phone: "9790359545" },
      { paperId: "272", title: "AI-Powered Non-Invasive Therapies For Autism And Stress Emotions", authors: "Robert Renswick N, Prithviraj R, Praveen Kumar N, Sujatha R", email: "robertrenswick28@gmail.com", phone: "7305117501" },
      { paperId: "275", title: "Deep Sequential Modelling of Multi-Asset Financial Time Series via Long-Term Memory (LSTM) Networks", authors: "P Preetha,Shirsudan Kannan,S Kalaiselvi ,G Sivakamasundari", email: "preethapremkumar21102002@gmail.com", phone: "8248974512" },
      { paperId: "290", title: "Tri LSTM Based Classification of Brain Stroke Analysis", authors: "Sarangam Kodati, Nadimpally Nutesh Goud", email: "k.sarangam@gmail.com", phone: "9948216853" },
      { paperId: "298", title: "A Hybrid CNN-RNN-Based Deep Learning Architecture For Early-Stage Parkinson's Disease Identification And Patient Assistance", authors: "Sandhya S, Dhatchayaa M V, Anusha T, Rini Rayan P", email: "sandhyaselvam45@gmail.com", phone: "9080813171" },
      { paperId: "300", title: "Fetal Head Segmentation with Lightweight Hypercomplex U-Net Model", authors: "Dolly Irene J, Geetika R, Shri Selvambigai R P, Srimathi V", email: "dollyirene@velammal.edu.in", phone: "9500053753" },
      { paperId: "308", title: "An AI-Based Computational Framework for Evaluating Early-Stage Entrepreneurial Concepts (ThinkBot)", authors: "Roshan Ganapathy vel R, Iyappa Kumaran S, Karthick V, Vignesh E, Kalaivani V", email: "thorroshan337@gmail.com", phone: "9345678548" },
      { paperId: "325", title: "Edge-AI Based Autonomous Fire Detection And Suppression System Using YOLO And Multi Sensor Fusion", authors: "Dr. Mary Joans S, Dev Rithik M G, Hariharasudhan M, Shravanth Kumar V", email: "ecehod@velammal.edu.in", phone: "9884675641" },
      { paperId: "352", title: "Epileptic Seizure Prediction Using CNN-BiLSTM Networks on Scalp EEG", authors: "Dr. Ramji Gupta, Madhur Raiyani, Dr. Alpana Pandey, Dr. Richa Mishra, Dr. Mukul Jain, Dr. Muthukkumar", email: "ramjigupta398@gmail.com", phone: "8839486228" },
      { paperId: "362", title: "A Chaos-Based Approach for Secure Medical Image Protection", authors: "Shakthi V, Narmatha V, Indhumathi A, Subhashini K", email: "sec22ec144@sairamtap.edu.in", phone: "7305606705" },
      { paperId: "388", title: "Predictive Intelligence Model For Plant Leaf Disease Detection", authors: "Hari Ram Srinivasa Ragavan, Dr. V. Gomathi, Dr. G. Sivakamasundari, V. Uma Bhagavathy", email: "hari.ragavan@fau.de", phone: "8925718700" },
      { paperId: "407", title: "Elderly Fall Detection", authors: "Abirami", email: "abiramiu.ug22.cs@francisxavier.ac.in", phone: "8667783829" },
      { paperId: "409", title: "Aquila Eye AI for Safer and Smarter Roads", authors: "Chandra Mohith P, Hemlathadevi A", email: "chandramohithp@gmail.com", phone: "9150724940" },
      { paperId: "419", title: "PULSE: Predictive Understanding of Learner Status and Engagement for Week-Wise Dropout Detection in Online Learning Platforms", authors: "Sharmila K, Varshini S, Harini B S, Harshini R", email: "Sharmila.k@kpriet.ac.in", phone: "9514455685" },
    ],
  },
  {
    id: "track-3",
    title: "Track 3",
    date: "26.03.2026 (AN)",
    time: "3:00 PM",
    venue: "Mechanical Seminar Hall",
    track: "Sustainable Transportation & E-Mobility",
    facultyIncharge: "Dr. C. Veera Ajay, AP(SG)/MECH",
    color: "bg-emerald-500",
    light: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    entries: [
      { paperId: "107", title: "Intelligent Rural Transport Management System Using Deep Learning-Driven Passenger Flow and Delay Prediction", authors: "Ms. Kaviya V, Mr. R. Jeeva", email: "kaviyavellaisamy2004@gmail.com", phone: "9043820694" },
      { paperId: "310", title: "An Adaptive Road Defect Detection System With Warning Signal Generation", authors: "Arul Thilagavathi, Irene Grace PS, Swetha AR, Harine JS", email: "arulthilagavathi@velammal.edu.in", phone: "8438353511" },
      { paperId: "328", title: "Energy Harvesting and Reliability Enhancement in IRS-Assisted Drone-Based D2D Communication for B5G Systems", authors: "Ganesh Babu Loganathan", email: "ganeshme86@gmail.com", phone: "9894899918" },
      { paperId: "344", title: "Integrating Wavelet Analysis and Support Vector Regression for Accurate Wind Speed Prediction", authors: "Mohankumar J, Vijay Amirtha Raj F, Xavier Arockiaraj S, Bharathi S, Vinothkumar T, Karthikeyan M K", email: "mohanme1199@gmail.com", phone: "9894556300" },
      { paperId: "350", title: "Recent Developments in Cathode Materials for Li Ion Batteries", authors: "D. Saritha, T. V. Surendra", email: "sarithaiitm@gmail.com", phone: "9591908844" },
      { paperId: "370", title: "Extraction of Maximum Power from 8×4 PV Array using Amended Total Cross Tied Configuration", authors: "Revati Duraivelu, Swaminathan M R", email: "revatissuresh@gmail.com", phone: "9894753815" },
      { paperId: "420", title: "IoT Enabled EV Charging Station With Consumption Based Billing and Payment Gateway", authors: "Rajeshkumar S, Nitharshana E, Sujan K S, Santhosh R, Vijayakumar D, Vivek Rabinson", email: "suyamburajesh@gmail.com", phone: "7904834470" },
      { paperId: "444", title: "Development of Mobile Robot for Adhesive Coating", authors: "Arun A P", email: "arun.me22@bitsathy.ac.in", phone: "9500619356" },
      { paperId: "430/445", title: "AI-Based Rockfall Prediction and Alert System for Open-Pit Mines", authors: "Mano Varsha S, Nivethitha R", email: "manovarsha1027@gmail.com", phone: "9363030883" },
      { paperId: "432", title: "A Modality-Agnostic Deep Learning Framework for Brain Tumor Classification Using MRI and CT Imaging", authors: "Sasikala C", email: "c.sasikalacse@gmail.com", phone: "9944065928" },
    ],
  },
  {
    id: "track-4",
    title: "Track 4",
    date: "26.03.2026 (AN)",
    time: "3:00 PM",
    venue: "E-Yantra Lab",
    track: "Nextgen Communication, VLSI & Embedded Systems",
    facultyIncharge: "Mrs. C. Kaleeshwari, AP/ECE",
    color: "bg-orange-500",
    light: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
    entries: [
      { paperId: "127", title: "An IoT Based Autonomous Vacuum Cleaning Vehicle with Regenerative Energy Harvesting System", authors: "Syed Junaid Ahamed N, Vimalkanth B, Nishanth CS, S. Suganthi Amudhan", email: "junaidahamed584@gmail.com", phone: "8637434572" },
      { paperId: "150", title: "Performance Comparison of ALU Using Vedic Multiplier and Karatsuba Multiplier", authors: "Mrs. N. Pathmavathi, Mrs. Balasundari C K, T. Manoj Kumar, M. Aswin Kumar, K. Ajay", email: "pathmaece@nec.edu.in", phone: "8903319305" },
      { paperId: "267", title: "Real-Time Photo-to-Cartoon Conversion Using Lightweight Generative Adversarial Networks", authors: "Surya Prakash M, Arun Kumar K, David Dhinakaran J, Balamuralikrishnan G", email: "suryamdu570@gmail.com", phone: "6382540285" },
      { paperId: "319", title: "3D Voice Activated Robotic Arm for Surgical Assistance", authors: "Ashmitha V, Harisha D, Neeraja Shree R", email: "ashmitha315@gmail.com", phone: "8148768283" },
      { paperId: "85", title: "ANFIS-Based Intelligent MPPT for High-Efficiency Li", authors: "Harish Gandhinathan", email: "gandhinathanharish@gmail.com", phone: "7448712723" },
      { paperId: "360", title: "IoT-Enabled Gas Detection and Alert System for Sanitation Chambers", authors: "Kotteshwari G, Navamaalika P, Haripriya S, Devibalan K", email: "sec22ec234@sairamtap.edu.in", phone: "8015327439" },
      { paperId: "401", title: "An IoT-Enabled Women Safety System Using ESP32 and Cloud-Based Real-Time Location Alerts", authors: "D. Anandakumar", email: "prabhumphd91@gmail.com", phone: "9715366097" },
      { paperId: "406", title: "Analytical and Numerical Investigation of a Vertical TFET for High-Sensitivity Biosensing", authors: "Guru Prasad Murugan, T. S. Arun Samuel, I. Vivek Anand, P. Shivakami, M. Ethisha, S. Malini", email: "g.p.murugan@student.tue.nl", phone: "6380238979" },
      { paperId: "415", title: "Convolution Neural Network Based Intelligent Sericulture Automation And Monitoring", authors: "Shiny Christobel J", email: "miracle.shiny@gmail.com", phone: "8870277225" },
      { paperId: "441", title: "E-Textile Integrated Embedded Wearable Systems for Healthcare Applications", authors: "Abinesh M, Tamil Elakkiya Arumugam, Arti Vashist, Pandiaraj Manickam", email: "msabinesh1998@gmail.com", phone: "8667365740" },
    ],
  },
  {
    id: "track-5",
    title: "Track 5",
    date: "27.03.2026 (FN)",
    time: "10:00 AM",
    venue: "SH Seminar Hall",
    track: "Environment, Climate-Tech & Sustainable Infrastructure",
    facultyIncharge: "K. Latha, AP/S&H",
    color: "bg-red-500",
    light: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    badge: "bg-red-100 text-red-700",
    entries: [
      { paperId: "356", title: "A High-Efficiency 2.4 GHz GaN HEMT RF Power Amplifier: Design and Large-Signal Analysis", authors: "Manju Yadav, Dr. Ramji Gupta, Dr. R. MuthukKumar", email: "yadav.manju289@gmail.com", phone: "832009775" },
      { paperId: "217", title: "Real-Time Water Quality Monitoring and Protection Using IoT Technologies", authors: "SelvaSuriya Kumaran M, Siva Subramanian S, Praveen V, Balaganesh S, Arun R, Singaravelan S", email: "selvasuriyakumaran11@gmail.com", phone: "9042229346" },
      { paperId: "314", title: "A Sustainable, Low-Cost Agent-Based Framework for Autonomous Quality Control in Industry 5.0", authors: "S. Raghavendran, Dr. A. Kishore Kumar, Dr. A. Murugarajan", email: "raghavendranhp@gmail.com", phone: "9585963535" },
      { paperId: "330", title: "Development of Sustainable Concrete Incorporating Coconut Shell Ash", authors: "S. Shanmuga Priya, I. Padmanabhan", email: "priyacit.sundaram93@gmail.com", phone: "9994074994" },
      { paperId: "416", title: "Optimization-Enhanced Federated Learning Framework for Adaptive Water Resource Management in Farming", authors: "Manjula Devi R, Shakthi Sivapoonthamil S, Mahesh Rajar A, Mr. Yuvaraj P", email: "manjuladevi.r@kpriet.ac.in", phone: "7373727281" },
      { paperId: "148", title: "An Adaptive Wireless Power Transfer System for High-Reliability Implantable Biomedical Devices with ECG Monitoring", authors: "Akash G Manikandan S, Sai Vignesh B", email: "akashgnanamoorthy@gmail.com", phone: "—" },
      { paperId: "424", title: "A Fluoride Ion-Promoted Silicon-Oxygen Bond Cleavage-Based Sensor for Cost-Effective Detection of Fluoride Ions in Groundwater", authors: "Rusal Raj F", email: "rusalraj@dubai.bits-pilani.ac.in", phone: "9486720174" },
      { paperId: "450", title: "Potato Leaf Disease Detection using Image Analysis and Machine Learning", authors: "Sharnicka S, Shanmugaraja T, Hari Harran V P, Arul K", email: "sharnickasasi@gmail.com", phone: "8903228481" },
      { paperId: "453", title: "Statistically Adaptive Smooth Heaviside Thresholding for Robust Signal Denoising", authors: "Laksheta, Mohanapriya, Radhika", email: "lakshetadk.ece2024@citchennai.net", phone: "9176113141" },
    ],
  },
];

const totalPapers = tracks.reduce((s, t) => s + t.entries.length, 0);

export default function OrganizingCommittee() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(
    Object.fromEntries(tracks.map((t) => [t.id, true]))
  );

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const filtered = tracks
    .map((t) => ({
      ...t,
      entries: t.entries
        .slice()
        .sort((a, b) => parseInt(a.paperId) - parseInt(b.paperId))
        .filter(
        (e) =>
          !search ||
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.authors.toLowerCase().includes(search.toLowerCase()) ||
          e.paperId.includes(search)
      ),
    }))
    .filter((t) => !search || t.entries.length > 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-sky-500 mb-2 text-center">
          Organizing Committee
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Presentation schedule · {tracks.length} tracks · {totalPapers} papers
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Tracks", value: tracks.length, color: "text-sky-500" },
            { label: "Total Papers", value: totalPapers, color: "text-violet-500" },
            { label: "Venues", value: [...new Set(tracks.map((t) => t.venue))].length, color: "text-emerald-500" },
            { label: "Sessions", value: 6, color: "text-orange-500" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-5 text-center hover:shadow-lg transition-shadow duration-300">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by paper title, author, or paper ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 text-gray-700 text-sm"
          />
        </div>

        {/* Notice */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center text-white font-bold text-sm bg-gradient-to-r from-orange-400 to-red-400 px-5 py-2.5 rounded-full shadow-md">
            It is mandatory that at least one author registers and presents the paper.
          </div>
        </div>

        {/* Track cards */}
        <div className="space-y-6">
          {filtered.map((committee) => {
            const isOpen = expanded[committee.id] ?? true;
            return (
              <div
                key={committee.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Card header */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start space-x-4">
                      <div className={`${committee.color} text-white p-3 rounded-full shrink-0 flex items-center justify-center w-12 h-12 font-bold text-sm`}>
                        {committee.title.replace("Track ", "")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-bold uppercase tracking-widest ${committee.text}`}>
                            {committee.title}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${committee.badge}`}>
                            {committee.entries.length} papers
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 leading-snug">
                          {committee.track}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => toggle(committee.id)}
                      className="shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-400"
                    >
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{committee.date} · {committee.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{committee.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{committee.facultyIncharge}</span>
                    </div>
                  </div>
                </div>

                {/* Papers */}
                {isOpen && (
                  <div className={`border-t ${committee.border}`}>
                    {/* Desktop table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`${committee.light} text-left`}>
                            {["#", "Paper ID", "Title", "Authors", "Email", "Phone"].map((h, i) => (
                              <th key={i} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {committee.entries.map((entry, index) => (
                            <tr key={`${committee.id}-${entry.paperId}-${index}`} className="hover:bg-gray-50 transition-colors duration-150 align-top">
                              <td className="px-5 py-4 text-sm text-gray-400 font-medium w-10">{index + 1}</td>
                              <td className="px-5 py-4 w-24">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${committee.badge}`}>
                                  {entry.paperId}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-800 leading-relaxed">{entry.title}</td>
                              <td className="px-5 py-4 text-sm text-gray-600 leading-relaxed w-52">{entry.authors}</td>
                              <td className="px-5 py-4 text-sm text-gray-500 break-all leading-relaxed w-48">{entry.email || "—"}</td>
                              <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap w-32">{entry.phone || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="lg:hidden divide-y divide-gray-100">
                      {committee.entries.map((entry, index) => (
                        <div key={`mob-${committee.id}-${index}`} className="p-5 hover:bg-gray-50 transition-colors duration-150">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400">{index + 1}.</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${committee.badge}`}>
                              Paper {entry.paperId}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 mb-2 leading-snug">{entry.title}</p>
                          <p className="text-sm text-gray-600 mb-1">{entry.authors}</p>
                          <p className="text-xs text-gray-400 break-all">{entry.email || "—"} · {entry.phone || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <p className="text-gray-400 text-lg">No papers match your search.</p>
              <button onClick={() => setSearch("")} className="mt-4 text-sky-500 text-sm font-semibold hover:underline">
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
