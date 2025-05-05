import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Using axios for API calls

const API_BASE_URL = 'http://0.0.0.0:3030/api'; // Adjust if your backend runs elsewhere

function Test() {
  const [testValues, setTestValues] = useState([]);
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(''); // To show success/error on submit

  // Fetch existing test values
  const fetchTestValues = async () => {
    setLoading(true);
    setError(null);
    const url = `${API_BASE_URL}/test`;
    console.log(`[API Request] GET ${url}`); // Log request
    try {
      const response = await axios.get(url);
      console.log(`[API Response] GET ${url} - Status: ${response.status}`, response.data); // Log response
      if (response.data && Array.isArray(response.data.test_values)) {
        setTestValues(response.data.test_values);
      } else {
        // Handle cases where the structure might be different or empty
        setTestValues([]);
        console.warn('Received unexpected data structure:', response.data);
      }
    } catch (err) {
      console.error(`[API Error] GET ${url} - Status: ${err.response?.status}`, err.response?.data || err.message); // Log error
      setError('Failed to fetch test values. Is the backend running?');
      setTestValues([]); // Clear values on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTestValues();
  }, []);

  // Handle form submission to add a new value
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) {
      setSubmitStatus('Value cannot be empty.');
      return;
    }
    setSubmitStatus('Submitting...');
    setError(null); // Clear previous errors

    const url = `${API_BASE_URL}/test/add`;
    const payload = { value: newValue };
    console.log(`[API Request] POST ${url}`, payload); // Log request
    try {
      const response = await axios.post(url, payload);
      console.log(`[API Response] POST ${url} - Status: ${response.status}`, response.data); // Log response
      if (response.status === 200 && response.data) {
        // Add the new value to the list optimistically or refetch
        // setTestValues([...testValues, response.data]); // Optimistic update
        setNewValue(''); // Clear input field
        setSubmitStatus(`Success: Added '${response.data.value}' (ID: ${response.data.id})`);
        fetchTestValues(); // Refetch to get the updated list including the new item
      } else {
         setSubmitStatus(`Error: Unexpected response status ${response.status}`);
      }
    } catch (err) {
      console.error(`[API Error] POST ${url} - Status: ${err.response?.status}`, err.response?.data || err.message); // Log error
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to add value.';
      setError(`Submission Error: ${errorMsg}`);
      setSubmitStatus(''); // Clear submitting status
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Backend Test Page</h1>

      {/* Display Section */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Current Test Values</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          testValues.length > 0 ? (
            <ul className="list-disc pl-5">
              {testValues.map((item) => (
                <li key={item.id}>{item.id}: {item.value}</li>
              ))}
            </ul>
          ) : (
            <p>No test values found in the database, or unable to connect.</p>
          )
        )}
         <button
            onClick={fetchTestValues}
            disabled={loading}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Refresh List
          </button>
      </div>

      {/* Add Value Form Section */}
      <div className="p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Add New Test Value</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="newValue" className="block mb-1">New Value:</label>
            <input
              type="text"
              id="newValue"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={submitStatus === 'Submitting...'}
          >
            Add Value
          </button>
          {submitStatus && <p className="mt-2 text-sm text-gray-600">{submitStatus}</p>}
        </form>
      </div>
    </div>
  );
}

export default Test;
