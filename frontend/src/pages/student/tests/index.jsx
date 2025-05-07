import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spin, Empty, Tag, Typography, Modal, Tabs, message, Alert, Tooltip, Progress } from 'antd';
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  FormOutlined, 
  CheckCircleOutlined, 
  ArrowLeftOutlined, 
  CloudUploadOutlined, 
  UploadOutlined,
  FileDoneOutlined 
} from '@ant-design/icons';
import { fetchTests, fetchTestById } from '../../../api/tests';
import { fetchUserSubmissions, createBatchSubmissions } from '../../../api/submissions';
import './style.css';
import SubmissionForm from '../../user-dashboard/components/SubmissionForm';
import { MathJaxContext, MathJax } from 'better-react-mathjax';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Add optimized MathJax configuration
const mathJaxConfig = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  startup: {
    typeset: false,  // Prevents automatic typesetting on page load
  },
  options: {
    enableMenu: false,  // Disable the right-click menu
    menuOptions: {
      settings: {}
    },
    processing: {
      limitRenderSize: 5000  // Limit size of math to render to prevent crashes
    },
    renderActions: {
      addMenu: [], // Disable menu building
      checkLoading: []  // Disable loading check (saves resources)
    }
  },
  chtml: {
    mtextInheritFont: true  // Improves performance for mixed content
  }
};

const TestsList = () => {
  const [loading, setLoading] = useState(true);
  const [availableTests, setAvailableTests] = useState([]);
  const [submittedTests, setSubmittedTests] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTest, setActiveTest] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [testError, setTestError] = useState(null);
  const [submittedQuestions, setSubmittedQuestions] = useState([]);
  const [evaluatedQuestions, setEvaluatedQuestions] = useState([]);
  
  // New state for batch submission
  const [questionFiles, setQuestionFiles] = useState({});
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  const [batchSubmitError, setBatchSubmitError] = useState(null);
  const [batchSubmitSuccess, setBatchSubmitSuccess] = useState(false);

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        // Use the new API functions
        const testsData = await fetchTests();
        const userSubmissions = await fetchUserSubmissions();
        
        const submittedTestIds = userSubmissions.map(sub => sub.test_id);
        
        // Format tests with more information
        const formattedTests = testsData.map(test => ({
          id: test.id,
          title: test.name || `Test ${test.id}`,
          description: test.description || 'No description available',
          questionCount: test.questions ? test.questions.length : 0,
          totalMarks: test.questions ? test.questions.reduce((acc, q) => acc + (q.marks || 0), 0) : 0,
          createdAt: new Date(test.created_at).toLocaleString(),
          questions: test.questions || [],
          status: submittedTestIds.includes(test.id) ? 'submitted' : 'available',
          subject_name: test.subject_name,
          name: test.name
        }));
        
        setAvailableTests(formattedTests.filter(test => test.status === 'available'));
        setSubmittedTests(formattedTests.filter(test => test.status === 'submitted'));
        
      } catch (error) {
        console.error('Error loading tests:', error);
        message.error('Failed to load tests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  const showTestDetails = async (test) => {
    try {
      // If we don't have full question details, fetch them
      if (test.questions.length > 0 && !test.questions[0].question_text) {
        const detailedTest = await fetchTestById(test.id);
        setCurrentTest({
          ...test,
          questions: detailedTest.questions || []
        });
      } else {
        setCurrentTest(test);
      }
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error fetching test details:', error);
      message.error('Failed to load test details');
    }
  };

  const startTest = async (testId) => {
    try {
      setLoadingTest(true);
      setTestError(null);
      
      // Get detailed test data with questions
      const detailedTest = await fetchTestById(testId);
      
      setActiveTest(detailedTest);
      setSubmittedQuestions([]);
      setEvaluatedQuestions([]);
      setQuestionFiles({}); // Reset question files
      setBatchSubmitSuccess(false);
      setBatchSubmitError(null);
      setIsModalVisible(false); // Close the details modal if it's open
    } catch (error) {
      console.error('Error starting test:', error);
      setTestError('Failed to load test details. Please try again.');
      message.error('Failed to start the test. Please try again.');
    } finally {
      setLoadingTest(false);
    }
  };

  // Handle going back to test list
  const handleBackToTests = () => {
    setActiveTest(null);
    setTestError(null);
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
  
  // Handle view evaluations
  const handleViewEvaluations = () => {
    // Navigate to submissions tab in the main interface
    window.location.href = '/submissions';
  };

  // Handle file changes for batch submission
  const handleFileChange = (questionId, file) => {
    if (file) {
      // Add file to the map
      setQuestionFiles(prev => ({
        ...prev,
        [questionId]: file
      }));
      
      // Clear any previous batch submission errors when a new file is added
      if (batchSubmitError) {
        setBatchSubmitError(null);
      }
    } else {
      // Remove file from the map if set to null
      setQuestionFiles(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }
  };
  
  // Submit all answers at once
  const handleBatchSubmit = async () => {
    // Validate that there are files to submit
    const submissions = Object.entries(questionFiles).map(([questionId, file]) => ({
      questionId,
      file
    }));
    
    if (submissions.length === 0) {
      setBatchSubmitError("Please upload at least one answer before submitting.");
      return;
    }
    
    // Check total size - warn if it's above a certain threshold
    const totalSizeBytes = submissions.reduce((total, sub) => total + (sub.file?.size || 0), 0);
    const totalSizeMB = totalSizeBytes / (1024 * 1024);
    
    if (totalSizeMB > 50) {
      // Show a warning if total upload is over 50MB
      message.warning(
        `You're trying to upload ${totalSizeMB.toFixed(1)}MB which is quite large. ` + 
        `This may take some time and could cause browser performance issues.`
      );
    }
    
    setIsBatchSubmitting(true);
    setBatchSubmitError(null);
    
    try {
      // Add progress indicator for large uploads
      if (totalSizeMB > 20) {
        message.loading({
          content: 'Uploading large files, please wait...',
          duration: 0,
          key: 'uploadProgress'
        });
      }
      
      const result = await createBatchSubmissions(submissions, activeTest.id);
      
      // Clear progress indicator
      if (totalSizeMB > 20) {
        message.destroy('uploadProgress');
      }
      
      // Update state to reflect successful submission
      message.success(result.message || `Submissions are being processed in the background`);
      
      // The submissions are now processing in the background
      setBatchSubmitSuccess(true);
      
      // Show a notice about background processing
      message.info({
        content: 'Your files have been uploaded and are being processed. You can continue working.',
        duration: 8, // Show for 8 seconds
      });
      
      // Clear the question files
      setQuestionFiles({});
      
      // Update submitted questions from the result
      if (result.submissions && result.submissions.length > 0) {
        const newSubmittedQuestions = [
          ...submittedQuestions,
          ...result.submissions.map(sub => sub.question_id)
        ];
        setSubmittedQuestions([...new Set(newSubmittedQuestions)]); // Remove duplicates
      }
      
    } catch (error) {
      console.error('Error submitting batch answers:', error);
      
      // Clear progress indicator if it exists
      message.destroy('uploadProgress');
      
      if (error.response?.status === 413) {
        setBatchSubmitError('One or more files are too large. Please upload smaller PDF files (under 10MB each).');
      } else if (error.code === 'ECONNABORTED') {
        setBatchSubmitError('Upload timed out. Please try with smaller files or a better connection.');
      } else if (error.message && error.message.includes('too large')) {
        setBatchSubmitError('Files too large for the server to handle. Please reduce file sizes or upload them individually.');
      } else if (error.message && error.message.includes('Too many files')) {
        setBatchSubmitError('Too many files in batch. Please upload fewer files at once.');
      } else if (error.response?.data?.detail) {
        setBatchSubmitError(error.response.data.detail);
      } else if (error.message) {
        setBatchSubmitError(error.message);
      } else {
        setBatchSubmitError('Failed to submit your answers. Please try uploading one at a time or reduce file sizes.');
      }
    } finally {
      setIsBatchSubmitting(false);
    }
  };

  const renderTestCard = (test) => (
    <Col xs={24} sm={12} md={8} lg={8} xl={6} key={test.id}>
      <Card
        className="test-card"
        hoverable
        actions={[
          <Button 
            type="primary" 
            onClick={() => startTest(test.id)}
            disabled={test.status === 'submitted'}
          >
            {test.status === 'submitted' ? 'Already Submitted' : 'Start Test'}
          </Button>
        ]}
      >
        <div className="test-card-content">
          <div className="test-card-header">
            <Title level={4}>{test.title}</Title>
            <Tag color={test.status === 'available' ? 'green' : 'blue'}>
              {test.status === 'available' ? 'Available' : 'Submitted'}
            </Tag>
          </div>
          
          <Paragraph ellipsis={{ rows: 2 }} className="test-description">
            {test.description}
          </Paragraph>
          
          <div className="test-info">
            <div className="info-item">
              <FileTextOutlined /> 
              <Text>{test.questionCount} Questions</Text>
            </div>
            <div className="info-item">
              <FormOutlined />
              <Text>{test.totalMarks} Total Marks</Text>
            </div>
            <div className="info-item">
              <ClockCircleOutlined />
              <Text>{test.createdAt}</Text>
            </div>
          </div>
          
          <Button 
            type="link" 
            onClick={() => showTestDetails(test)}
            className="view-details-btn"
          >
            View Details
          </Button>
        </div>
      </Card>
    </Col>
  );

  const renderTestDetailsModal = () => (
    <Modal
      title={currentTest?.title}
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={[
        <Button key="back" onClick={() => setIsModalVisible(false)}>
          Close
        </Button>,
        <Button
          key="start"
          type="primary"
          onClick={() => {
            setIsModalVisible(false);
            startTest(currentTest.id);
          }}
          disabled={currentTest?.status === 'submitted'}
        >
          {currentTest?.status === 'submitted' ? 'Already Submitted' : 'Start Test'}
        </Button>
      ]}
      width={700}
    >
      {currentTest && (
        <div className="test-details-modal">
          <Paragraph>
            <Text strong>Description: </Text> 
            {currentTest.description}
          </Paragraph>
          
          <div className="test-details-info">
            <div className="details-info-item">
              <Text strong>Questions: </Text> 
              <Text>{currentTest.questionCount}</Text>
            </div>
            <div className="details-info-item">
              <Text strong>Total Marks: </Text> 
              <Text>{currentTest.totalMarks}</Text>
            </div>
            <div className="details-info-item">
              <Text strong>Created: </Text> 
              <Text>{currentTest.createdAt}</Text>
            </div>
          </div>
          
          <div className="questions-preview">
            <Title level={5}>Questions Preview:</Title>
            {currentTest.questions.map((question, index) => (
              <Card key={question.id} className="question-preview-card">
                <div className="question-header">
                  <Text strong>Question {index + 1}</Text>
                  <Tag color="blue">{question.marks} marks</Tag>
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>
                  {question.question_text}
                </Paragraph>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );

  // If a test is active, show the test taking interface with improved UI
  if (activeTest) {
    return (
      <div className="test-taking-container">
        <div className="test-header">
          <Button
            type="link"
            onClick={handleBackToTests}
            className="back-to-tests-btn"
          >
            <ArrowLeftOutlined /> Back to Tests
          </Button>
          <Title level={3}>{activeTest.name}</Title>
        </div>
        
        <div className="test-meta">
          <Tag color="blue">{activeTest.subject_name}</Tag>
          
          {activeTest.description && (
            <Paragraph>{activeTest.description}</Paragraph>
          )}
          
          <Text type="secondary">
            This test contains {activeTest.questions ? activeTest.questions.length : 0} questions
          </Text>
        </div>

        {loadingTest ? (
          <div className="loading-container">
            <Spin size="large" />
            <div className="mt-2">Loading test questions...</div>
          </div>
        ) : testError ? (
          <div className="test-error">
            <Alert type="error" message={testError} />
          </div>
        ) : activeTest.questions && activeTest.questions.length > 0 ? (
          <div>
            <div className="test-questions-header">
              <Title level={4} className="test-questions-title">Test Questions</Title>
              
              {evaluatedQuestions.length > 0 && (
                <Button
                  onClick={handleViewEvaluations}
                  type="primary"
                >
                  View Evaluation Results
                </Button>
              )}
            </div>
            
            {/* Batch Submission Card */}
            <div className="batch-submission-card bg-white p-4 mb-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3 flex-wrap">
                <div className="mb-2 md:mb-0">
                  <Title level={5} className="mb-0">Submit All Answers</Title>
                  <Text type="secondary">Upload your answers for each question and submit them all at once</Text>
                </div>
                <div className="text-right">
                  <div className="mb-1">
                    {Object.keys(questionFiles).length > 0 ? (
                      <Tag color={
                        Object.keys(questionFiles).length === activeTest.questions.length 
                          ? "success" 
                          : "warning"
                      }>
                        {Object.keys(questionFiles).length} of {activeTest.questions.length} answers ready
                      </Tag>
                    ) : (
                      <Tag color="error">No answers uploaded yet</Tag>
                    )}
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CloudUploadOutlined />}
                    loading={isBatchSubmitting}
                    onClick={handleBatchSubmit}
                    disabled={Object.keys(questionFiles).length === 0 || batchSubmitSuccess}
                    className="w-full md:w-auto"
                  >
                    {isBatchSubmitting ? 'Submitting...' : 'Submit All Answers'}
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ 
                      width: `${(Object.keys(questionFiles).length / activeTest.questions.length) * 100}%`,
                      backgroundColor: Object.keys(questionFiles).length > 0 
                        ? (Object.keys(questionFiles).length === activeTest.questions.length ? '#52c41a' : '#faad14') 
                        : '#f5f5f5'
                    }}
                  />
                </div>
              </div>
              
              {/* Success/Error Messages */}
              {batchSubmitSuccess && (
                <Alert
                  type="success"
                  message="All answers submitted successfully!"
                  description="Your answers have been uploaded and are being processed. Check the Submissions page to see your results."
                  showIcon
                  className="mb-3"
                />
              )}
              
              {batchSubmitError && (
                <Alert
                  type="error"
                  message="Error submitting answers"
                  description={batchSubmitError}
                  showIcon
                  className="mb-3"
                />
              )}
              
              {/* Instructions */}
              <Text type="secondary" className="text-sm">
                Upload a PDF file for each question below. Once you have uploaded all answers, click "Submit All Answers" to submit them in one go.
              </Text>
            </div>
            
            {evaluatedQuestions.length > 0 && (
              <div className="evaluation-status">
                <Text>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  <strong>{evaluatedQuestions.length}</strong> {evaluatedQuestions.length === 1 ? 'question has' : 'questions have'} been evaluated.
                </Text>
              </div>
            )}
            
            <div className="test-questions-list">
              {/* Remove MathJaxContext wrapper */}
              {activeTest.questions.map((question, index) => (
                <div key={question.id} className="test-question-card">
                  <SubmissionForm
                    questionSetId={activeTest.id}
                    question={question}
                    onSubmitSuccess={handleSubmitSuccess}
                    onFileChange={handleFileChange}
                    showSubmitButton={false} // Hide individual submit buttons
                    batchMode={true} // Enable batch mode behavior
                  />
                </div>
              ))}
            </div>
            
            {/* Floating Submit Button for Mobile */}
            <div className="fixed bottom-4 right-4 md:hidden z-10">
              <Tooltip title={`Submit all answers (${Object.keys(questionFiles).length}/${activeTest.questions.length})`}>
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={handleBatchSubmit}
                  disabled={Object.keys(questionFiles).length === 0 || isBatchSubmitting || batchSubmitSuccess}
                  className={Object.keys(questionFiles).length > 0 ? "pulse-animation" : ""}
                />
              </Tooltip>
            </div>
          </div>
        ) : (
          <div className="empty-questions">
            <Empty description="This test does not contain any questions." />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tests-list-container">
      <Title level={2}>Available Tests</Title>
      <Text type="secondary">Browse and take available tests</Text>
      
      <Tabs defaultActiveKey="available" className="tests-tabs">
        <TabPane 
          tab={
            <span>
              <FormOutlined />
              Available Tests
            </span>
          } 
          key="available"
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {availableTests.length === 0 ? (
                <Empty description="No available tests found" />
              ) : (
                <Row gutter={[16, 16]} className="tests-grid">
                  {availableTests.map(test => renderTestCard(test))}
                </Row>
              )}
            </>
          )}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              Submitted Tests
            </span>
          } 
          key="submitted"
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {submittedTests.length === 0 ? (
                <Empty description="No submitted tests found" />
              ) : (
                <Row gutter={[16, 16]} className="tests-grid">
                  {submittedTests.map(test => renderTestCard(test))}
                </Row>
              )}
            </>
          )}
        </TabPane>
      </Tabs>
      
      {renderTestDetailsModal()}
    </div>
  );
};

export default TestsList;