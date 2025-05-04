/* TestCard.jsx */
import React from 'react';
import '../../../styles/test.css';

export default function TestCard({ data, onClick }) {
  return (
    <div className="ts-card" onClick={onClick}>
      <div className="ts-card-name">{data.name}</div>
    </div>
  );
}