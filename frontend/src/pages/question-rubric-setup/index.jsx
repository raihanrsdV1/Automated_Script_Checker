/* QuestionRubricSetup.jsx */
import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, BookOpen } from 'lucide-react';
import { MathJaxContext } from 'better-react-mathjax';
import '../../styles/QuestionRubric.css';

// Components
import QuestionCard from '../../components/question-rubric-component/question-card';
import QuestionForm from '../../components/question-rubric-component/question-form';
import QuestionDialog from '../../components/question-rubric-component/question-dialog';
import QuestionSetCard from '../../components/question-rubric-component/question-set-card';
import QuestionSetForm from '../../components/question-rubric-component/question-set-form';
import QuestionSetDetail from '../../components/question-rubric-component/question-set-detail';
import AddQuestionToSetForm from '../../components/question-rubric-component/add-question-to-set-form';

// API functions
import { 
  fetchQuestions, 
  createQuestion,
  fetchQuestionSets,
  fetchQuestionSetById,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
  addQuestionsToSet,
  removeQuestionFromSet
} from '../../api/questions';

export default function QuestionRubricSetup() {
  // State for questions management
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [query, setQuery] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for question sets management
  const [questionSets, setQuestionSets] = useState([]);
  const [showQuestionSetForm, setShowQuestionSetForm] = useState(false);
  const [showAddToSetForm, setShowAddToSetForm] = useState(false);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);
  const [currentQuestionSetId, setCurrentQuestionSetId] = useState(null);
  
  // State for view mode
  const [viewMode, setViewMode] = useState('questions'); // 'questions' or 'sets'
  
  // Load questions and question sets on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (viewMode === 'questions') {
          const questionData = await fetchQuestions();
          setQuestions(questionData);
          setFilteredQuestions(questionData);
        } else {
          const setData = await fetchQuestionSets();
          setQuestionSets(setData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [viewMode]);

  // Filter questions/sets when query or data changes
  useEffect(() => {
    const q = query.toLowerCase();
    
    if (viewMode === 'questions') {
      setFilteredQuestions(
        questions.filter(item =>
          (item.subject_id && item.subject_id.toLowerCase().includes(q)) ||
          (item.question_text && item.question_text.toLowerCase().includes(q))
        )
      );
    }
    // For question sets we don't need to update state, we'll filter in the render
    
  }, [query, questions, questionSets, viewMode]);

  // Question handlers
  const handleAddQuestion = async (newQ) => {
    try {
      setIsLoading(true);
      const added = await createQuestion(newQ);
      setQuestions([added, ...questions]);
      setShowQuestionForm(false);
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Question set handlers
  const handleCreateQuestionSet = async (data) => {
    try {
      setIsLoading(true);
      const newSet = await createQuestionSet(data);
      setQuestionSets([newSet, ...questionSets]);
      setShowQuestionSetForm(false);
    } catch (error) {
      console.error('Error creating question set:', error);
      alert('Failed to create question set. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQuestionSet = async (id) => {
    try {
      setIsLoading(true);
      const set = await fetchQuestionSetById(id);
      setSelectedQuestionSet(set);
    } catch (error) {
      console.error('Error fetching question set:', error);
      alert('Failed to load question set. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestionsToSet = async (questionIds) => {
    try {
      setIsLoading(true);
      await addQuestionsToSet(currentQuestionSetId, questionIds);
      
      // Refresh the question set data
      const updatedSet = await fetchQuestionSetById(currentQuestionSetId);
      
      // Update the question sets list
      setQuestionSets(
        questionSets.map(set => 
          set.id === currentQuestionSetId ? updatedSet : set
        )
      );
      
      // If we're viewing this set, update the selected set too
      if (selectedQuestionSet && selectedQuestionSet.id === currentQuestionSetId) {
        setSelectedQuestionSet(updatedSet);
      }
      
      setShowAddToSetForm(false);
    } catch (error) {
      console.error('Error adding questions to set:', error);
      alert('Failed to add questions to set. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveQuestionFromSet = async (questionId) => {
    try {
      setIsLoading(true);
      await removeQuestionFromSet(selectedQuestionSet.id, questionId);
      
      // Refresh the question set data
      const updatedSet = await fetchQuestionSetById(selectedQuestionSet.id);
      
      setSelectedQuestionSet(updatedSet);
      
      // Update the question set in the overall state
      setQuestionSets(
        questionSets.map(set => 
          set.id === selectedQuestionSet.id ? updatedSet : set
        )
      );
    } catch (error) {
      console.error('Error removing question from set:', error);
      alert('Failed to remove question from set. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestionSet = async (id) => {
    try {
      setIsLoading(true);
      await deleteQuestionSet(id);
      
      setQuestionSets(questionSets.filter(set => set.id !== id));
      
      // If we're viewing this set, go back to the list
      if (selectedQuestionSet && selectedQuestionSet.id === id) {
        setSelectedQuestionSet(null);
      }
    } catch (error) {
      console.error('Error deleting question set:', error);
      alert('Failed to delete question set. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If we're viewing a question set detail
  if (selectedQuestionSet) {
    return (
      <MathJaxContext>
        <div className="qr-container">
          <QuestionSetDetail 
            questionSet={selectedQuestionSet}
            onBack={() => setSelectedQuestionSet(null)}
            onEdit={(id) => {
              // Here you would open the edit form for the question set
              alert('Edit question set ' + id);
            }}
            onAddQuestion={(id) => {
              setCurrentQuestionSetId(id);
              setShowAddToSetForm(true);
            }}
            onRemoveQuestion={handleRemoveQuestionFromSet}
          />
        </div>
      </MathJaxContext>
    );
  }

  // Filter question sets based on query
  const filteredSets = query
    ? questionSets.filter(set => 
        set.name.toLowerCase().includes(query.toLowerCase()) ||
        (set.description && set.description.toLowerCase().includes(query.toLowerCase())) ||
        (set.subject_id && set.subject_id.toLowerCase().includes(query.toLowerCase()))
      )
    : questionSets;

  return (
    <MathJaxContext>
      <div className="qr-container">
        <div className="qr-header">
          <h1>
            {viewMode === 'questions' ? 'Questions' : 'Question Sets'}
          </h1>
          
          <div className="qr-controls">
            <div className='tab-buttons'>
              <button 
                className={`tab-btn ${viewMode === 'questions' ? 'active' : ''}`}
                onClick={() => setViewMode('questions')}
              >
                Questions
              </button>
              <button 
                className={`tab-btn ${viewMode === 'sets' ? 'active' : ''}`}
                onClick={() => setViewMode('sets')}
              >
                Question Sets
              </button>
            </div>
            
            <div className='search-div'>
              <Search size={20} color="#cccdd7" />
              <input
                type="text"
                placeholder={`Search ${viewMode === 'questions' ? 'questions' : 'question sets'}...`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="qr-search"
              />
            </div>
            
            <button 
              className="add-btn" 
              onClick={() => viewMode === 'questions' ? setShowQuestionForm(true) : setShowQuestionSetForm(true)}
            >
              + Add {viewMode === 'questions' ? 'Question' : 'Question Set'}
            </button>
          </div>
        </div>
        
        {isLoading && <div className="loading-indicator">Loading...</div>}
        
        {/* Show forms as modals */}
        {showQuestionForm && (
          <QuestionForm
            onSubmit={handleAddQuestion}
            onCancel={() => setShowQuestionForm(false)}
          />
        )}
        
        {showQuestionSetForm && (
          <QuestionSetForm
            onSubmit={handleCreateQuestionSet}
            onCancel={() => setShowQuestionSetForm(false)}
          />
        )}
        
        {showAddToSetForm && (
          <AddQuestionToSetForm
            questionSetId={currentQuestionSetId}
            questionSetName={questionSets.find(s => s.id === currentQuestionSetId)?.name || ''}
            subjectId={questionSets.find(s => s.id === currentQuestionSetId)?.subject_id || ''}
            existingQuestions={questionSets.find(s => s.id === currentQuestionSetId)?.questions || []}
            onAdd={handleAddQuestionsToSet}
            onCancel={() => setShowAddToSetForm(false)}
            onCreateQuestion={() => {
              setShowAddToSetForm(false);
              setShowQuestionForm(true);
            }}
          />
        )}
        
        {/* Display either questions or question sets based on viewMode */}
        <div className="cards-grid">
          {viewMode === 'questions' ? (
            // Show questions
            filteredQuestions.map(q => (
              <QuestionCard key={q.id} data={q} onClick={() => setSelectedQuestion(q)} />
            ))
          ) : (
            // Show question sets
            filteredSets.map(set => (
              <QuestionSetCard 
                key={set.id} 
                data={set}
                onView={handleViewQuestionSet}
                onEdit={(id) => {
                  // Here you would open the edit form for the question set
                  alert('Edit question set ' + id);
                }}
                onDelete={handleDeleteQuestionSet}
                onAddQuestion={(id) => {
                  setCurrentQuestionSetId(id);
                  setShowAddToSetForm(true);
                }}
              />
            ))
          )}
          
          {/* Empty state messages */}
          {!isLoading && viewMode === 'questions' && filteredQuestions.length === 0 && (
            <p>No questions match your query.</p>
          )}
          
          {!isLoading && viewMode === 'sets' && filteredSets.length === 0 && (
            <p>No question sets match your query.</p>
          )}
        </div>
        
        {/* Question dialog (when a question is selected) */}
        {selectedQuestion && (
          <QuestionDialog
            data={selectedQuestion}
            onClose={() => setSelectedQuestion(null)}
          />
        )}
      </div>
    </MathJaxContext>
  );
}