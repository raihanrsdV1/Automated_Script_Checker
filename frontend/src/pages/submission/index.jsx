/* SubmissionsPage.jsx */
import React, { useState, useEffect } from 'react';
import SubmissionCard from '../../components/submission-component/submission-card';
import SubmissionDialog from '../../components/submission-component/submission-dialog';
import '../../styles/submissions.css';

// Dummy API
const fetchSubmissionsAPI = async () =>
  new Promise(res => setTimeout(() => res(initialSubmissions), 300));

const initialSubmissions = [
  { id: 1, testName: 'Algebra Midterm', date: '2025-05-01', status: 'Not Submitted' },
  { id: 2, testName: 'Physics Quiz 1', date: '2025-05-02', status: 'Submitted' },
  { id: 3, testName: 'Chemistry Lab Test', date: '2025-05-03', status: 'Not Submitted' },
  { id: 4, testName: 'Biology Final', date: '2025-05-04', status: 'Submitted' },
  { id: 5, testName: 'CS Data Structures', date: '2025-05-05', status: 'Not Submitted' }
];

export default function SubmissionsPage() {
  const [subs, setSubs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await fetchSubmissionsAPI();
      setSubs(data);
      setFiltered(data);
    })();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(subs.filter(s => s.testName.toLowerCase().includes(q)));
  }, [query, subs]);

  return (
    <div className="sp-container">
      <div className="sp-header">
        <h1>My Test Submissions</h1>
        <input
          type="text"
          placeholder="Search tests..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="sp-search"
        />
      </div>
      <div className="sp-grid">
        {filtered.map(s => (
          <SubmissionCard key={s.id} data={s} onClick={() => setSelected(s)} />
        ))}
        {filtered.length === 0 && <p>No tests found.</p>}
      </div>
      {selected && <SubmissionDialog data={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}