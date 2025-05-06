/* TestSetup.jsx */
import React, { useState, useEffect } from 'react';
import TestCard from '../../components/test-component/test-card';
import TestForm from '../../components/test-component/test-form';
import TestDialog from '../../components/test-component/test-dialog';
import '../../styles/test.css';

// Import the updated test API functions that use question sets
import { fetchTests, createTest } from '../../api/tests';

export default function TestSetup() {
  const [tests, setTests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTests = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTests();
        // Transform question sets to match expected test format
        const formattedTests = data.map(questionSet => ({
          id: questionSet.id,
          name: questionSet.name,
          subject: questionSet.subject_name || 'Unknown',
          description: questionSet.description || '',
          questions: questionSet.questions ? questionSet.questions.map(q => q.id) : [],
          // Adding a empty setter property since the user will be the one who created it
          setter: 'Current User'
        }));
        setTests(formattedTests);
        setFiltered(formattedTests);
      } catch (err) {
        console.error('Error loading tests:', err);
        setError('Failed to load tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      tests.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.subject.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      )
    );
  }, [query, tests]);

  const handleAdd = async testData => {
    setLoading(true);
    try {
      // Transform the test data to match question set format
      const questionSetData = {
        name: testData.name,
        description: testData.description || '',
        subject_id: testData.subject
      };
      
      const result = await createTest(questionSetData);
      
      // If successful, add test to list
      if (result && result.id) {
        // Add the new test to the beginning of the list
        setTests([{
          id: result.id,
          name: testData.name,
          subject: testData.subject_name || testData.subject,
          description: testData.description || '',
          questions: [],
          setter: 'Current User'
        }, ...tests]);
      }
      
      setShowForm(false);
    } catch (err) {
      console.error('Error creating test:', err);
      alert('Failed to create test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ts-container">
      <div className="ts-header">
        <h1>Manage Tests</h1>
        <div className="ts-controls">
          <input
            type="text"
            placeholder="Search tests..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="ts-search"
          />
          <button 
            className="ts-add-btn" 
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            + Create Test
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message p-3 mb-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {loading && !showForm && (
        <div className="loading p-4 text-center">
          Loading tests...
        </div>
      )}
      
      {showForm && (
        <TestForm 
          onSubmit={handleAdd} 
          onCancel={() => setShowForm(false)} 
          loading={loading}
        />
      )}
      
      <div className="ts-grid">
        {filtered.map(t => (
          <TestCard key={t.id} data={t} onClick={() => setSelected(t)} />
        ))}
        {!loading && filtered.length === 0 && (
          <p className="no-tests p-4 text-center text-gray-500">
            {query ? 'No tests match your search.' : 'No tests found. Create one to get started!'}
          </p>
        )}
      </div>
      
      {selected && (
        <TestDialog 
          data={selected} 
          onClose={() => setSelected(null)} 
        />
      )}
    </div>
  );
}
