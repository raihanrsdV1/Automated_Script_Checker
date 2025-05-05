import { useState } from 'react';
import { MathJaxContext } from 'better-react-mathjax';
import QuestionBrowser from './components/QuestionBrowser';
import SubmissionForm from './components/SubmissionForm';
import SubmissionHistory from './components/SubmissionHistory';
import { fetchQuestionSetById } from '../../api/questions';

function UserDashboard() {
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);
  const [activeTab, setActiveTab] = useState('questions'); // tabs: 'questions', 'submissions'
  const [submittedQuestions, setSubmittedQuestions] = useState([]);
  const [evaluatedQuestions, setEvaluatedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle question set selection
  const handleSelectQuestionSet = async (questionSet) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch the complete question set with all questions
      const detailedQuestionSet = await fetchQuestionSetById(questionSet.id);
      setSelectedQuestionSet(detailedQuestionSet);
      setSubmittedQuestions([]);
      setEvaluatedQuestions([]);
    } catch (err) {
      console.error('Error fetching question set details:', err);
      setError('Failed to load question set details. Please try again.');
      // Still set the basic question set data so the user can go back
      setSelectedQuestionSet(questionSet);
    } finally {
      setLoading(false);
    }
  };

  // Handle going back to question sets list
  const handleBackToQuestionSets = () => {
    setSelectedQuestionSet(null);
    setError(null);
  };

  // Handle successful submission
  const handleSubmitSuccess = (questionId, result, evaluated = false) => {
    if (!submittedQuestions.includes(questionId)) {
      setSubmittedQuestions([...submittedQuestions, questionId]);
    }
    
    if (evaluated && !evaluatedQuestions.includes(questionId)) {
      setEvaluatedQuestions([...evaluatedQuestions, questionId]);
    }
  };
  
  // Handle tab switch to submission history after evaluation
  const handleViewEvaluations = () => {
    setActiveTab('submissions');
  };

  return (
    <MathJaxContext>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">User Dashboard</h1>
        <p className="mb-6 text-gray-600">Here you can browse questions, submit answers, view results, and request rechecks.</p>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('questions')}
            >
              Question Sets
            </button>
            <button
              className={`${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('submissions')}
            >
              Submission History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'questions' ? (
          <div>
            {!selectedQuestionSet ? (
              // Question Sets Browser
              <section>
                <h2 className="text-xl font-semibold mb-4">Browse Question Sets</h2>
                <QuestionBrowser onSelectQuestionSet={handleSelectQuestionSet} />
              </section>
            ) : (
              // Question Set Detail with Submission Forms
              <section>
                <div className="flex items-center mb-6">
                  <button
                    onClick={handleBackToQuestionSets}
                    className="mr-4 text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← Back to Question Sets
                  </button>
                  <h2 className="text-xl font-semibold">{selectedQuestionSet.name}</h2>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                  <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {selectedQuestionSet.subject_name}
                    </span>
                  </div>
                  
                  {selectedQuestionSet.description && (
                    <p className="text-gray-600 mb-4">{selectedQuestionSet.description}</p>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Contains {selectedQuestionSet.questions ? selectedQuestionSet.questions.length : 0} questions
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading questions...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                    {error}
                  </div>
                ) : selectedQuestionSet.questions && selectedQuestionSet.questions.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Questions</h3>
                    
                    {evaluatedQuestions.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 mb-6 flex justify-between items-center">
                        <p>
                          <strong>{evaluatedQuestions.length}</strong> {evaluatedQuestions.length === 1 ? 'submission' : 'submissions'} have been evaluated.
                        </p>
                        <button
                          onClick={handleViewEvaluations}
                          className="py-1 px-3 border border-blue-300 rounded text-sm font-medium text-blue-700 hover:bg-blue-100"
                        >
                          View Results
                        </button>
                      </div>
                    )}
                    
                    <div className="space-y-8">
                      {selectedQuestionSet.questions.map((question) => (
                        <div key={question.id} className="mb-6">
                          <SubmissionForm
                            questionSetId={selectedQuestionSet.id}
                            question={question}
                            onSubmitSuccess={handleSubmitSuccess}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                    This question set does not contain any questions.
                  </div>
                )}
              </section>
            )}
          </div>
        ) : (
          // Submission History Tab
          <section>
            <h2 className="text-xl font-semibold mb-4">Your Submission History</h2>
            <SubmissionHistory />
          </section>
        )}
      </div>
    </MathJaxContext>
  );
}

export default UserDashboard;