import React, { useState, useEffect } from 'react';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../../api/admin';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  // State for subjects
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // State for form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch subjects on component mount
  useEffect(() => {
    loadSubjects();
  }, []);
  
  // Load all subjects from API
  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error("Failed to load subjects");
      console.error("Error loading subjects:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Subject name cannot be empty");
      return;
    }
    
    try {
      setLoading(true);
      const subjectData = { name, description };
      
      if (isEditing && selectedSubject) {
        await updateSubject(selectedSubject.id, subjectData);
        toast.success("Subject updated successfully");
      } else {
        await createSubject(subjectData);
        toast.success("Subject created successfully");
      }
      
      // Reset form and refresh subject list
      resetForm();
      await loadSubjects();
    } catch (error) {
      toast.error(isEditing ? "Failed to update subject" : "Failed to add subject");
      console.error("Error submitting subject:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit button click
  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setName(subject.name);
    setDescription(subject.description || '');
    setIsEditing(true);
  };
  
  // Handle delete button click
  const handleDelete = async (subjectId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        setLoading(true);
        await deleteSubject(subjectId);
        toast.success("Subject deleted successfully");
        await loadSubjects();
      } catch (error) {
        toast.error("Failed to delete subject");
        console.error("Error deleting subject:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Reset form fields and editing state
  const resetForm = () => {
    setName('');
    setDescription('');
    setIsEditing(false);
    setSelectedSubject(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Subject Management</h1>
        <p className="text-gray-600 text-center">Add, edit or remove subjects for your courses</p>
      </div>
      
      <div className="grid md:grid-cols-12 gap-6">
        {/* Subject Form - Left Column */}
        <div className="md:col-span-5 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Subject' : 'Add New Subject'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">
                Subject Name*
              </label>
              <input
                id="subjectName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter subject name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="subjectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="subjectDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter subject description"
              ></textarea>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                disabled={loading}
              >
                {isEditing ? 'Update Subject' : 'Add Subject'}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Subjects List - Right Column */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">All Subjects</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : subjects.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No subjects found.</p>
                <p className="text-sm text-gray-400 mt-1">Add your first subject using the form on the left.</p>
              </div>
            ) : (
              <div className="overflow-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{subject.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 line-clamp-2">{subject.description || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;