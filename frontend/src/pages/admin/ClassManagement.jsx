import React, { useState, useEffect } from 'react';
import { fetchClasses, createClass, updateClass, deleteClass } from '../../api/admin';
import { toast } from 'react-toastify';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClass, setNewClass] = useState({ name: '' });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Fetch all classes on component mount
  useEffect(() => {
    loadClasses();
  }, []);

  // Function to fetch classes
  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await fetchClasses();
      setClasses(data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load classes");
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass({ ...newClass, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateClass(currentId, newClass);
        toast.success("Class updated successfully");
      } else {
        await createClass(newClass);
        toast.success("Class created successfully");
      }
      setNewClass({ name: '' });
      setEditMode(false);
      setCurrentId(null);
      loadClasses();
    } catch (error) {
      toast.error(editMode ? "Failed to update class" : "Failed to create class");
    }
  };

  // Handle edit button click
  const handleEdit = (cls) => {
    setEditMode(true);
    setCurrentId(cls.id);
    setNewClass({
      name: cls.name,
    });
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(id);
        toast.success("Class deleted successfully");
        loadClasses();
      } catch (error) {
        toast.error("Failed to delete class");
      }
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setEditMode(false);
    setCurrentId(null);
    setNewClass({ name: '' });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Class Management</h1>
      
      {/* Class Form */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Class' : 'Add New Class'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Class Name</label>
            <input
              type="text"
              name="name"
              value={newClass.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="e.g., Class 1, Class 2, etc."
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              {editMode ? 'Update Class' : 'Add Class'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Class List */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">All Classes</h2>
        {loading ? (
          <p>Loading classes...</p>
        ) : classes.length === 0 ? (
          <p>No classes found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id} className="border-b">
                    <td className="p-3">{cls.name}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleEdit(cls)}
                        className="bg-yellow-500 text-white py-1 px-2 rounded mr-2 hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id)}
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
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
  );
};

export default ClassManagement;