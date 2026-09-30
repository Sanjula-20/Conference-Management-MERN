import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import Header from './Header';
import Footer from './Footer';
import { AuthContext } from './AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useLocation } from 'react-router-dom';
import { apiUrl } from "./config";

export const Registration = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get paper and isResubmission flag from navigation state
  const paper = location.state?.paper || null;
  const isResubmission = location.state?.isResubmission || false;
  const isFinalSubmission = location.state?.isFinalSubmission || false;
  const assignedReviewerId = location.state?.assignedReviewerId || null;
  const autoAssign = location.state?.autoAssign || false;
  const originalPaperId = location.state?.originalPaperId || null;

  useEffect(() => {
    // Check if token is present in URL (from Google OAuth)
    const token = searchParams.get('token');
    if (token) {
      login(token);
      // Remove token from URL for security
      navigate('/registration', { replace: true });
    }
  }, [searchParams, login, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
  paperTitle: "",
  authors: [],
  abstract: null,
  tracks: "",
  country: "",
  state: "",
  city: "",
  assignedReviewerId: assignedReviewerId, // store assignedReviewerId for resubmission
});



  const [newAuthor, setNewAuthor] = useState({
    name: "",
    designation: "",
    type: "",
    institution: "",
    email: "",
    mobile: ""
  });

  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountryIso2, setSelectedCountryIso2] = useState("");
  const [selectedStateIso2, setSelectedStateIso2] = useState("");
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const generateUserId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substr(2, 5);
      return `REG${timestamp}${randomStr}`.toUpperCase();
    };
    setFormData(prev => ({ ...prev, userId: generateUserId() }));
  }, []);

  // Prefill form data if resubmission or final submission
  useEffect(() => {
    if ((isResubmission || isFinalSubmission) && paper) {
      setFormData(prev => ({
        ...prev,
        paperTitle: paper.paperTitle || "",
        authors: paper.authors ? (typeof paper.authors === 'string' ? JSON.parse(paper.authors) : paper.authors) : [],
        abstract: null, // Always set to null for resubmission and final submission
        tracks: paper.tracks || "",
        country: paper.country || "",
        state: paper.state || "",
        city: paper.city || "",
        assignedReviewerId: assignedReviewerId || paper.assignedReviewerId || null,
      }));
      // Set selectedCountryIso2 if country is prefilled
      if (paper.country) {
        const selectedCountry = countries.find(c => c.name === paper.country);
        if (selectedCountry) {
          setSelectedCountryIso2(selectedCountry.iso2);
        }
      }
    }
  }, [isResubmission, isFinalSubmission, paper, countries, assignedReviewerId]);

  const [typeOptions, setTypeOptions] = useState([]);

  const tracksOptions = [
    "Emerging & Frontier Technologies",
    "Sustainable Energy & Power Systems",
    "Environment, Climate-Tech & Sustainable Infrastructure",
    "Advanced Computing & Cyber-Physical Systems",
    "Sustainable Transportation & E-Mobility",
    "Nextgen communication, VLSI & Embedded Systems"
  ];

  // Country and author-type options come from the database.  They can be
  // changed by an administrator without rebuilding the frontend.
  useEffect(() => {
    const fetchRegistrationOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(apiUrl("/registration/options"), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCountries(data.countries || []);
          setTypeOptions(data.authorTypes || []);
        } else {
          console.error("Failed to fetch registration options:", res.status);
        }
      } catch (error) {
        console.error("Error fetching registration options:", error);
      }
    };
    if (user) fetchRegistrationOptions();
  }, [user]);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountryIso2) {
      setLoadingStates(true);
      const fetchStates = async () => {
        try {
          const res = await fetch(`https://api.countrystatecity.in/v1/countries/${selectedCountryIso2}/states`, {
            headers: {
              "X-CSCAPI-KEY": "Z1Zoa2V3RmplM3JqS3ZNM3dNY3AwdXkxTWdlSVZPVzczYVV3RXQ0WA=="
            }
          });
          const data = await res.json();
          setStates(data);
        } catch (error) {
          console.error("Error fetching states:", error);
          setStates([]);
        } finally {
          setLoadingStates(false);
        }
      };
      fetchStates();
    } else {
      setStates([]);
      setLoadingStates(false);
    }
  }, [selectedCountryIso2]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedStateIso2 && selectedCountryIso2) {
      setLoadingCities(true);
      const fetchCities = async () => {
        try {
          const res = await fetch(`https://api.countrystatecity.in/v1/countries/${selectedCountryIso2}/states/${selectedStateIso2}/cities`, {
            headers: {
              "X-CSCAPI-KEY": "Z1Zoa2V3RmplM3JqS3ZNM3dNY3AwdXkxTWdlSVZPVzczYVV3RXQ0WA=="
            }
          });
          if (res.ok) {
            const data = await res.json();
            setCities(data);
          } else {
            console.error("Failed to fetch cities:", res.status);
            setCities([]);
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setLoadingCities(false);
    }
  }, [selectedStateIso2, selectedCountryIso2]);



  const handleNewAuthorChange = (e) => {
    const { name, value } = e.target;
    setNewAuthor(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const addOrUpdateAuthor = () => {
    const { name, designation, type, institution, email, mobile } = newAuthor;
    let newErrors = {};
    if (!name.trim()) newErrors.name = "Required";
    if (!designation.trim()) newErrors.designation = "Required";
    if (!type) newErrors.type = "Required";
    if (!institution.trim()) newErrors.institution = "Required";
    if (!email.trim()) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!mobile.trim()) newErrors.mobile = "Required";
    else if (!/^\d{10}$/.test(mobile.replace(/\D/g, ""))) newErrors.mobile = "Invalid mobile";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editIndex !== null) {
      const updated = [...formData.authors];
      updated[editIndex] = newAuthor;
      setFormData(prev => ({ ...prev, authors: updated }));
      setEditIndex(null);
    } else {
      setFormData(prev => ({ ...prev, authors: [...prev.authors, newAuthor] }));
    }

    setNewAuthor({ name: "", designation: "", type: "", institution: "", email: "", mobile: "" });
    setErrors({});
  };

  const editAuthor = (index) => {
    setNewAuthor(formData.authors[index]);
    setEditIndex(index);
  };

  const deleteAuthor = (index) => {
    setFormData(prev => ({ ...prev, authors: prev.authors.filter((_, i) => i !== index) }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    // Check both MIME type and file extension for better compatibility
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);

    if (!isValidType) {
      showToast("Only PDF, DOC, and DOCX files are allowed for abstract", "error");
      e.target.value = null; // Clear the file input
      return;
    }

    setFormData(prev => ({ ...prev, abstract: file }));
    if (errors.abstract) setErrors(prev => ({ ...prev, abstract: "" }));
  };

  const handlePaperChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const clearForm = () => {
    setFormData({
      paperTitle: "",
      authors: [],
      abstract: null,
      tracks: "",
      country: "",
      state: "",
      city: "",
      userId: formData.userId // Keep the same user ID
    });
    setNewAuthor({
      name: "",
      designation: "",
      type: "",
      institution: "",
      email: "",
      mobile: ""
    });
    setEditIndex(null);
    setErrors({});
    setSelectedCountryIso2("");
    setSelectedStateIso2("");
    setStates([]);
    setCities([]);
    
    // Clear file input
    const fileInput = document.getElementById('abstract-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async () => {
    let newErrors = {};
    if (formData.authors.length === 0) newErrors.authors = "At least one author required";
    if (!formData.paperTitle.trim()) newErrors.paperTitle = "Required";
    if (!formData.tracks) newErrors.tracks = "Required";
    if (!formData.country) newErrors.country = "Required";
    if (!formData.state) newErrors.state = "Required";
    if (!formData.abstract) newErrors.abstract = "Required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast("Please fill all the details before submitting", "error");
      return;
    }

    setIsLoading(true);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "abstract" && value) form.append("abstract", value);
      else if (key === "authors") form.append("authors", JSON.stringify(value));
      else if (key === "assignedReviewerId" && value) form.append("assignedReviewerId", value);
      else form.append(key, value);
    });
    form.append("autoAssign", autoAssign);
    form.append("originalPaperId", originalPaperId);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl("/registration"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Registration successful! Your Registration ID is: ${data.id}`);
        clearForm();
        // Redirect to paper status page after 3 seconds
        setTimeout(() => {
          navigate('/paper-status');
        }, 3000);
      } else {
        showToast(data.error || "Registration failed.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col pt-22 min-h-screen">
      <Header />

      <main className="flex-grow py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-500 mb-2">Registration</h2>
            <p className="text-gray-600">Conference Registration Form</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            {/* User ID */}
            {/* <div className="mb-6 p-3 bg-blue-50 rounded border text-center">
              <span className="text-sm text-gray-600">User ID: </span>
              <span className="font-mono font-bold text-blue-600">{formData.userId}</span>
            </div> */}

            {/* Author Section */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Authors</h3>

              {/* Author Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" name="name" value={newAuthor.name} onChange={handleNewAuthorChange}
                  placeholder="Full Name"
                  className={`px-3 py-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"}`} />
                <input type="text" name="designation" value={newAuthor.designation} onChange={handleNewAuthorChange}
                  placeholder="Designation"
                  className={`px-3 py-2 border rounded-md ${errors.designation ? "border-red-500" : "border-gray-300"}`} />
                <select name="type" value={newAuthor.type} onChange={handleNewAuthorChange}
                  className={`px-3 py-2 border rounded-md ${errors.type ? "border-red-500" : "border-gray-300"}`}>
                  <option value="">Select Type</option>
                  {typeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <input type="text" name="institution" value={newAuthor.institution} onChange={handleNewAuthorChange}
                  placeholder="Institution"
                  className={`px-3 py-2 border rounded-md ${errors.institution ? "border-red-500" : "border-gray-300"}`} />
                <input type="email" name="email" value={newAuthor.email} onChange={handleNewAuthorChange}
                  placeholder="Email"
                  className={`px-3 py-2 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"}`} />
                <input type="tel" name="mobile" value={newAuthor.mobile} onChange={handleNewAuthorChange}
                  placeholder="Mobile Number"
                  className={`px-3 py-2 border rounded-md ${errors.mobile ? "border-red-500" : "border-gray-300"}`} />
              </div>

              <button type="button" onClick={addOrUpdateAuthor}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                {editIndex !== null ? "Update Author" : "Add Author"}
              </button>
              {errors.authors && <p className="text-red-500 text-sm mt-2">{errors.authors}</p>}
            </div>

            {/* Author Grid */}
            {formData.authors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3">Author List</h4>
                <div className="grid gap-4">
                  {formData.authors.map((author, idx) => (
                    <div key={idx} className="p-4 border rounded-md bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <p className="font-medium">{author.name}</p>
                        <p className="text-sm text-gray-600">{author.designation}, {author.institution}</p>
                        <p className="text-sm text-gray-600">{author.email} | {author.mobile}</p>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <button onClick={() => editAuthor(idx)} className="text-blue-500 hover:underline text-sm">Edit</button>
                        <button onClick={() => deleteAuthor(idx)} className="text-red-500 hover:underline text-sm">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paper Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Paper Details</h3>
              <input type="text" name="paperTitle" value={formData.paperTitle} onChange={handlePaperChange}
                placeholder="Paper Title"
                className={`w-full px-3 py-2 border rounded-md mb-4 ${errors.paperTitle ? "border-red-500" : "border-gray-300"}`} />
              {errors.paperTitle && <p className="text-red-500 text-xs mb-2">{errors.paperTitle}</p>}

              <div className={`border-2 border-dashed rounded-md p-4 text-center ${errors.abstract ? "border-red-500 bg-red-50" : "border-gray-300"}`}>
                <span className='text-red-700' >Accept PDF, DOC, DOCX</span>
                <br />
                <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" id="abstract-upload" />
                <label htmlFor="abstract-upload" className="cursor-pointer text-sm text-gray-600">
                  {formData.abstract ? <span className="text-blue-600 font-medium">{formData.abstract.name}</span>
                    : <> <span className="text-blue-600 underline">Choose file</span> or drag here <div className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max 10MB)</div> </>}
                </label>
              </div>
              {errors.abstract && <p className="text-red-500 text-xs mt-2">{errors.abstract}</p>}
            </div>

            {/* Conference Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Conference Details</h3>
              
              {/* Tracks */}
              <select 
                name="tracks" 
                value={formData.tracks} 
                onChange={handlePaperChange}
                className={`w-full px-3 py-2 border rounded-md mb-4 ${errors.tracks ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Track</option>
                {tracksOptions.map((track, idx) => (
                  <option key={idx} value={track}>{track}</option>
                ))}
              </select>
              {errors.tracks && <p className="text-red-500 text-xs mb-2">{errors.tracks}</p>}

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select 
                  name="country" 
                  value={formData.country} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, country: value, state: "", city: "" }));
                    const selectedCountry = countries.find(c => c.name === value);
                    if (selectedCountry) {
                      setSelectedCountryIso2(selectedCountry.iso2);
                      setStates([]);
                      setCities([]);
                      setSelectedStateIso2("");
                    } else {
                      setSelectedCountryIso2("");
                      setStates([]);
                      setCities([]);
                      setSelectedStateIso2("");
                    }
                    if (errors.country) setErrors(prev => ({ ...prev, country: "" }));
                  }}
                  className={`px-3 py-2 border rounded-md ${errors.country ? "border-red-500" : "border-gray-300"}`}
                  disabled={isLoading}
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country.iso2} value={country.name}>{country.name}</option>
                  ))}
                </select>

                <select
                  name="state"
                  value={formData.state}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, state: value, city: "" }));
                    const selectedState = states.find(s => s.name === value);
                    if (selectedState) {
                      setSelectedStateIso2(selectedState.iso2);
                      setCities([]);
                    } else {
                      setSelectedStateIso2("");
                      setCities([]);
                    }
                    if (errors.state) setErrors(prev => ({ ...prev, state: "" }));
                  }}
                  className={`px-3 py-2 border rounded-md ${errors.state ? "border-red-500" : "border-gray-300"}`}
                  disabled={!selectedCountryIso2 || isLoading}
                >
                  <option value="">
                    {loadingStates ? "Loading states..." : "Select State/Province"}
                  </option>
                  {states.map(state => (
                    <option key={state.iso2} value={state.name}>{state.name}</option>
                  ))}
                </select>

                <select
                  name="city"
                  value={formData.city}
                  onChange={handlePaperChange}
                  className="px-3 py-2 border rounded-md border-gray-300"
                  disabled={!selectedStateIso2 || isLoading}
                >
                  <option value="">
                    {loadingCities ? "Loading cities..." : "Select City (Optional)"}
                  </option>
                  {cities.map(city => (
                    <option key={city.id} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>
              {errors.country && <p className="text-red-500 text-xs mb-2">{errors.country}</p>}
              {errors.state && <p className="text-red-500 text-xs mb-2">{errors.state}</p>}
            </div>

            {/* Submit */}
            <div className="pt-6">
               <button
    type="button"
    onClick={handleSubmit}
    disabled={isLoading}
    className={`w-full py-2 px-4 rounded-md flex justify-center items-center gap-2 ${
      isLoading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600 text-white"
    }`}
  >
    {isLoading ? (
      <>
        <svg className="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
        </svg>
        <span>Submitting...</span>
      </>
    ) : (
      isFinalSubmission ? "Submit Final Paper" : "Submit Registration"
    )}
  </button>

              </div>

            {/* Toast Notification */}
            {toast.show && (
  <div 
    className={`fixed top-25 right-6 px-4 py-3 rounded-2xl shadow-lg z-50 flex items-center gap-3 transition-all duration-300 transform ${
      toast.type === "error" 
        ? "bg-red-500 text-white animate-bounce" 
        : "bg-green-500 text-white animate-bounce"
    }`}
  >
    <span className="text-sm font-medium">{toast.message}</span>
    <button 
      onClick={() => setToast({ show: false, message: "", type: "" })} 
      className="text-white hover:text-gray-200 text-lg leading-none"
    >
      &times;
    </button>
  </div>
)}
          </div>
        </div>
      </main>

      
    </div>
  );
};
