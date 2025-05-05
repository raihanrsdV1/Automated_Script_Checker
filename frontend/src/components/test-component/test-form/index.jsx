/* TestForm.jsx */
import React, { useState } from 'react';
import '../../../styles/test.css';
import { initialQuestions } from '../../../pages/question-rubric-setup/data';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const subjects = [...new Set(initialQuestions.map(q=>q.subject))];
function truncateLatex(latex, maxLen = 80) {
    const clean = latex.replace(/\s+/g, ' ').trim();
    return clean.length > maxLen ? clean.slice(0, maxLen) + '...' : clean;
  }
  
export default function TestForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(subjects[0]);
  const [available, setAvailable] = useState(
    initialQuestions.filter(q=>q.subject===subjects[0])
  );
  const [selectedQs, setSelectedQs] = useState([]);

  const handleSubjectChange = e => {
    const val = e.target.value;
    setSubject(val);
    setAvailable(initialQuestions.filter(q=>q.subject===val));
    setSelectedQs([]);
  };
  const toggleQ = id => setSelectedQs(s =>
    s.includes(id)? s.filter(x=>x!==id): [...s, id]
  );
  const handleCreate = () => onSubmit({ name, subject, setter: 'Current Teacher', questions: selectedQs });

  return (
    <div className="ts-backdrop">
      <div className="ts-form">
        <h2>Create New Test</h2>
        <label>Test Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} />
        <label>Subject</label>
        <select value={subject} onChange={handleSubjectChange}>
          {subjects.map(s=><option key={s}>{s}</option>)}
        </select>
        <label>Select Questions</label>
        <div className="ts-questions-list">
        <MathJaxContext>
        {available.map(q => (
            <div
            key={q.id}
            className={`ts-qlist-item ${selectedQs.includes(q.id) ? 'selected' : ''}`}
            onClick={() => toggleQ(q.id)}
            >
            <MathJax dynamic>
                {`\\(${truncateLatex(q.question, 80)}\\)`}
            </MathJax>
            </div>
        ))}
        </MathJaxContext>
        </div>
        <div className="ts-form-buttons">
          <button className="btn btn-green" onClick={handleCreate}>Create</button>
          <button className="btn btn-gray" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
