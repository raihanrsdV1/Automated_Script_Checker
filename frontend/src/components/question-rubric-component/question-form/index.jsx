/* QuestionForm.jsx */
import React, { useState, useEffect } from 'react'
import '../../../styles/QuestionRubric.css';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import ReactMarkdown from 'react-markdown';

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'
];

export default function QuestionForm({ onSubmit, onCancel }) {
    const [subject, setSubject] = useState(subjects[0]);
    const [question, setQuestion] = useState('');
    const [rubric, setRubric] = useState('');
  
    useEffect(() => window.scrollTo(0, 0), []);
  
    return (
      <div className="qr-form-backdrop">
        <div className="qr-form">
          <h2>Add New Question</h2>
          <label>Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)}>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label>Question (LaTeX)</label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} />
          {question && (
            <div className="qr-form-preview">
              <MathJaxContext>
                <MathJax dynamic>{`\\(${question}\\)`}</MathJax>
              </MathJaxContext>
            </div>
          )}
          <label>Rubric (Markdown)</label>
          <textarea value={rubric} onChange={e => setRubric(e.target.value)} />
          {rubric && (
            <div className="qr-form-preview">
              <ReactMarkdown>{rubric}</ReactMarkdown>
            </div>
          )}
          <div className="qr-form-buttons">
            <button className="btn btn-green" onClick={() => onSubmit({ subject, question, rubric })}>Create</button>
            <button className="btn btn-gray" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
