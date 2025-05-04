/* QuestionRubricSetup.jsx */
import React, { useState, useEffect } from 'react';
import QuestionCard from '../../components/question-rubric-component/question-card';
import QuestionForm from '../../components/question-rubric-component/question-form';
import QuestionDialog from '../../components/question-rubric-component/question-dialog';
import '../../styles/QuestionRubric.css';
import { initialQuestions } from './data';
import { Search } from 'lucide-react';

// --- Dummy API service functions ---
const fetchQuestionsAPI = async () => {
  // Simulate API delay
  return new Promise(resolve => setTimeout(() => resolve(initialQuestions), 300));
};
const addQuestionAPI = async (newQ) => {
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve({ ...newQ, id: Date.now() }), 300));
};


export default function QuestionRubricSetup() {
  const [questions, setQuestions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  // load questions on mount
  useEffect(() => {
    (async () => {
      const data = await fetchQuestionsAPI();
      setQuestions(data);
      setFiltered(data);
    })();
  }, []);

  // update filtered list when query or questions change
  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      questions.filter(item =>
        item.subject.toLowerCase().includes(q) ||
        item.question.toLowerCase().includes(q)
      )
    );
  }, [query, questions]);

  const handleAdd = async (newQ) => {
    const added = await addQuestionAPI(newQ);
    setQuestions([added, ...questions]);
    setShowForm(false);
  };

  return (
    <div className="qr-container">
      <div className="qr-header">
        <h1>Question & Rubric Setup</h1>
        <div className="qr-controls">
          <div className='search-div'>
          <Search size={20} color="#cccdd7" />
          <input
            type="text"
            placeholder="Search by subject or text..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="qr-search"
          />
          </div>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            + Add Question
          </button>
        </div>
      </div>
      {showForm && (
        <QuestionForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}
      <div className="cards-grid">
        {filtered.map(q => (
          <QuestionCard key={q.id} data={q} onClick={() => setSelected(q)} />
        ))}
        {filtered.length === 0 && <p>No questions match your query.</p>}
      </div>
      {selected && (
        <QuestionDialog
          data={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}