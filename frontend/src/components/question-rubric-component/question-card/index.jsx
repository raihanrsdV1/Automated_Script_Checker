import React from 'react';
import "../../../styles/QuestionRubric.css"
import { MathJax, MathJaxContext } from 'better-react-mathjax';

export default function QuestionCard({ data, onClick }) {
    return (
      <div className="qr-card" onClick={onClick}>
        <h3 className="qr-subject">{data.subject}</h3>
        <div className="qr-question truncate-text">
          <MathJaxContext>
            <MathJax dynamic>
              {'\\(' + data.question + '\\)'}
            </MathJax>
          </MathJaxContext>
        </div>
      </div>
    );
  }