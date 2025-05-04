/* TestDialog.jsx */
import React from 'react';
import '../../../styles/test.css';
import QuestionCard from '../../question-rubric-component/question-card';
import { initialQuestions } from '../../../pages/question-rubric-setup/data';

export default function TestDialog({ data, onClose }) {
  const questions = initialQuestions.filter(q => data.questions.includes(q.id));
  return (
    <div className="ts-backdrop">
      <div className="ts-dialog">
        <button className="ts-close" onClick={onClose}>×</button>
        <h2>{data.name}</h2>
        <p><strong>Subject:</strong> {data.subject}</p>
        <p><strong>Setter:</strong> {data.setter}</p>
        <h3>Questions in this test:</h3>
        <div className="ts-question-grid">
          {questions.map(q => (
            <QuestionCard key={q.id} data={q} onClick={()=>{}} />
          ))}
        </div>
      </div>
    </div>
  );
}