import { useState, useEffect } from 'react';
import { fetchQuestionSets, fetchSubjects } from '../../../api/questions';
import { MathJax } from 'better-react-mathjax';

function QuestionBrowser({ onSelectQuestionSet }) {
  const [questionSets, setQuestionSets] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch subjects and question sets when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch subjects
        const subjectsData = await fetchSubjects();
        setSubjects(subjectsData);

        // Fetch question sets (without subject filtering initially)
        const setsData = await fetchQuestionSets();
        setQuestionSets(setsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load question sets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle subject filter change
  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    
    if (!subjectId) {
      // If "All Subjects" is selected, fetch all question sets
      try {
        setLoading(true);
        const setsData = await fetchQuestionSets();
        setQuestionSets(setsData);
      } catch (err) {
        console.error('Error loading question sets:', err);
        setError('Failed to load question sets. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Otherwise, filter by the selected subject
      try {
        setLoading(true);
        const setsData = await fetchQuestionSets(subjectId);
        setQuestionSets(setsData);
      } catch (err) {
        console.error('Error loading filtered question sets:', err);
        setError('Failed to filter question sets. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle clicking on a question set
  const handleQuestionSetClick = (questionSet) => {
    if (onSelectQuestionSet) {
      onSelectQuestionSet(questionSet);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading question sets...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  return (
    <div>
      {/* Subject filter */}
      <div className="mb-4">
        <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Subject
        </label>
        <select
          id="subject-filter"
          value={selectedSubject}
          onChange={handleSubjectChange}
          className="mt-1 block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Question Sets List */}
      {questionSets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionSets.map((questionSet) => (
            <div
              key={questionSet.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => handleQuestionSetClick(questionSet)}
            >
              <h3 className="font-semibold text-lg mb-1">{questionSet.name}</h3>
              <div className="text-sm text-blue-600 mb-2">
                {questionSet.subject_name || "Unknown Subject"}
              </div>
              {questionSet.description && (
                <p className="text-gray-600 text-sm mb-3">{questionSet.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {questionSet.questions ? `${questionSet.questions.length} questions` : '0 questions'}
                </span>
                <button
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuestionSetClick(questionSet);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No question sets found.
          {selectedSubject && " Try selecting a different subject."}
        </div>
      )}
    </div>
  );
}

export default QuestionBrowser;