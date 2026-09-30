import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { apiUrl } from '../../src/config';

export const Registration = () => {
  const [formData, setFormData] = useState({
  paperTitle: "",
  authors: [],
  abstract: null,
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

  useEffect(() => {
    const generateUserId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substr(2, 5);
      return `REG${timestamp}${randomStr}`.toUpperCase();
    };
    setFormData(prev => ({ ...prev, userId: generateUserId() }));
  }, []);

  const typeOptions = [
    { value: "ug_student", label: "UG Student" },
    { value: "pg_student", label: "PG Student" },
    { value: "faculty", label: "Faculty" },
    { value: "industry", label: "Industry" }
  ];

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
    setFormData(prev => ({ ...prev, abstract: file }));
    if (errors.abstract) setErrors(prev => ({ ...prev, abstract: "" }));
  };

  const handlePaperChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    let newErrors = {};
    if (formData.authors.length === 0) newErrors.authors = "At least one author required";
    if (!formData.paperTitle.trim()) newErrors.paperTitle = "Required";
    if (!formData.abstract) newErrors.abstract = "Required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alert("Please fix errors before submitting");
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "abstract" && value) form.append("abstract", value);
      else if (key === "authors") form.append("authors", JSON.stringify(value));
      else form.append(key, value);
    });

    try {
      const res = await fetch(apiUrl("/registration"), {
        method: "POST",
        body: form
      });
      const data = await res.json();
      if (res.ok) {
        // Use the id returned from the backend for any further reference
        alert(`Registration successful! Your Registration ID is: ${data.id}`);
        // Optionally, you can clear the form or redirect here
      }
      else alert(data.error || "Registration failed.");
    } catch {
      alert("Network error.");
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
            <div className="mb-6 p-3 bg-blue-50 rounded border text-center">
              <span className="text-sm text-gray-600">User ID: </span>
              <span className="font-mono font-bold text-blue-600">{formData.userId}</span>
            </div>

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
                    <div key={idx} className="p-4 border rounded-md bg-gray-50 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{author.name}</p>
                        <p className="text-sm text-gray-600">{author.designation}, {author.institution}</p>
                        <p className="text-sm text-gray-600">{author.email} | {author.mobile}</p>
                      </div>
                      <div className="flex gap-2">
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
                <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" id="abstract-upload" />
                <label htmlFor="abstract-upload" className="cursor-pointer text-sm text-gray-600">
                  {formData.abstract ? <span className="text-blue-600 font-medium">{formData.abstract.name}</span>
                    : <> <span className="text-blue-600 underline">Choose file</span> or drag here <div className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max 10MB)</div> </>}
                </label>
              </div>
              {errors.abstract && <p className="text-red-500 text-xs mt-2">{errors.abstract}</p>}
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button type="button" onClick={handleSubmit}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                Submit Registration
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

async function sendConfirmationEmail({ registrationId, ...otherFields }) {
  const html = `
    <p>Thank you for registering!</p>
    <p>Your Registration ID is: <b>${registrationId}</b></p>
    <!-- ...other email content... -->
  `;

}
