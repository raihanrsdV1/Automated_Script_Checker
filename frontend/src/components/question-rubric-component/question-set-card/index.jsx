import React from 'react';
import '../../../styles/QuestionRubric.css';
import { BookOpen, Edit, Trash, PlusSquare, Download } from 'lucide-react';
import axiosInstance from '../../../api/axiosConfig';

export default function QuestionSetCard({ data, onView, onEdit, onDelete, onAddQuestion }) {
  // Extract subject name
  const subjectName = data.subject_name || data.subject || 'Unknown Subject';
  
  // Get question count
  const questionCount = data.questions ? data.questions.length : 0;
  
  // Truncate description for display
  const truncateDescription = (desc, maxLength = 150) => {
    if (!desc) return 'No description';
    if (desc.length > maxLength) {
      return desc.substring(0, maxLength) + '...';
    }
    return desc;
  };

  // Handle click events and prevent bubbling
  const handleViewClick = (e) => {
    e.stopPropagation();
    onView(data.id);
  };
  
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(data.id);
  };
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${data.name}"?`)) {
      onDelete(data.id);
    }
  };
  
  const handleAddQuestionClick = (e) => {
    e.stopPropagation();
    onAddQuestion(data.id);
  };

  const handleReportClick = async (e) => {
    e.stopPropagation();
    try {
      // Show loading indicator to user
      const loadingToast = window.toast?.loading 
        ? window.toast.loading('Generating report...') 
        : alert('Generating report, please wait...');
      
      // Make API request to download the report
      const response = await axiosInstance.get(`/questions/sets/${data.id}/report`, {
        responseType: 'blob' // Important for handling PDF file downloads
      });
      
      // Create a URL for the blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${data.name.replace(/\s+/g, '_')}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      if (window.toast?.success) {
        window.toast.success('Report downloaded successfully');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      if (window.toast?.error) {
        window.toast.error('Failed to generate report. Please try again.');
      } else {
        alert('Failed to generate report. Please try again.');
      }
    }
  };

  return (
    <div className="question-set-card">
      <div className="card-header">
        <h3>{data.name}</h3>
        <div className="subject-badge">{subjectName}</div>
      </div>
      
      <div className="card-content">
        <p className="description">{truncateDescription(data.description)}</p>
        <div className="question-count">
          <BookOpen size={16} />
          <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      <div className="card-actions">
        <button className="action-btn view" onClick={handleViewClick} title="View Question Set">
          <BookOpen size={16} />
        </button>
        
        <button className="action-btn edit" onClick={handleEditClick} title="Edit Question Set">
          <Edit size={16} />
        </button>
        
        <button className="action-btn add" onClick={handleAddQuestionClick} title="Add Questions">
          <PlusSquare size={16} />
        </button>
        
        <button className="action-btn report" onClick={handleReportClick} title="Generate Report">
          <Download size={16} />
        </button>
        
        <button className="action-btn delete" onClick={handleDeleteClick} title="Delete Question Set">
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
}