import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spin, Empty, Tag, Typography, Modal, Tabs, message, Alert } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, FormOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { fetchTests, fetchTestById } from '../../../api/tests';
import { fetchUserSubmissions } from '../../../api/submissions';
import './style.css';
import SubmissionForm from '../../user-dashboard/components/SubmissionForm';
import { MathJaxContext, MathJax } from 'better-react-mathjax';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

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
      <MathJaxContext>
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
              
              {evaluatedQuestions.length > 0 && (
                <div className="evaluation-status">
                  <Text>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    <strong>{evaluatedQuestions.length}</strong> {evaluatedQuestions.length === 1 ? 'question has' : 'questions have'} been evaluated.
                  </Text>
                </div>
              )}
              
              <div className="test-questions-list">
                {activeTest.questions.map((question, index) => (
                  <div key={question.id} className="test-question-card">
                    <SubmissionForm
                      questionSetId={activeTest.id}
                      question={question}
                      onSubmitSuccess={handleSubmitSuccess}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-questions">
              <Empty description="This test does not contain any questions." />
            </div>
          )}
        </div>
      </MathJaxContext>
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