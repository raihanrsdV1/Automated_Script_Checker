/* QuestionDialog.jsx */
import React from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import "../../../styles/QuestionRubric.css";
import ReactMarkdown from 'react-markdown';

export default function QuestionDialog({ data, onClose }) {
    return (
      <div className="qr-modal-backdrop">
        <div className="qr-modal">
          <button className="qr-close" onClick={onClose}>×</button>
          <h2>{data.subject}</h2>
          <div>
            <strong>Question:</strong>
            <div className="qr-dialog-content">
              <MathJaxContext>
                <MathJax dynamic>{`\\(${data.question}\\)`}</MathJax>
              </MathJaxContext>
            </div>
          </div>
          <div>
            <strong>Rubric:</strong>
            <div className="qr-dialog-content">
              <ReactMarkdown>{data.rubric}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }