import React, { useState, useEffect } from 'react';
import { Table, Card, Spin, Empty, Typography, Tag, Button, message, Drawer, Collapse, Space, Row, Col, Badge, Progress, Statistic, Tabs, List, Divider } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, FileTextOutlined, BookOutlined, TrophyOutlined, FilePdfOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../../config';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const SubmissionsList = () => {
  const [loading, setLoading] = useState(true);
  const [questionSets, setQuestionSets] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/submissions/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Log the raw API response for debugging
        console.log('API Response:', response.data);

        // Process question sets if available, otherwise use dummy data
        let processedQuestionSets = [];
        
        if (response.data && response.data.length > 0) {
          // Process the real data from API
          processedQuestionSets = response.data.map(questionSet => {
            console.log('Processing question set:', questionSet);
            
            // Process questions in this set
            const questions = questionSet.questions || [];
            let totalObtainedMarks = 0;
            let totalPossibleMarks = 0;
            
            // Process each question and calculate totals
            const processedQuestions = questions.map(question => {
              console.log('Processing question:', question);
              
              // Status text formatting
              const statusText = question.status === 'completed' ? 'Evaluated' : 
                                 question.status === 'pending' ? 'Under Review' : 'Failed';
              
              // Calculate percentage for this question
              const totalMarks = question.total_marks || 0;
              const obtainedMarks = question.result || 0;
              totalObtainedMarks += obtainedMarks;
              totalPossibleMarks += totalMarks;
              
              const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
              
              return {
                ...question,
                key: question.id,
                status: statusText,
                percentage
              };
            });
            
            // Calculate scores and percentages for the question set
            const scorePercentage = totalPossibleMarks > 0 
              ? Math.round((totalObtainedMarks / totalPossibleMarks) * 100) 
              : 0;
            
            const completionPercentage = 100; // Assuming all questions in the set were attempted
            
            return {
              ...questionSet,
              key: questionSet.id,
              questions: processedQuestions,
              total_marks_obtained: totalObtainedMarks,
              total_possible_marks: totalPossibleMarks,
              score_percentage: scorePercentage,
              completion_percentage: completionPercentage,
              submitted_at: questionSet.first_attempt_date 
                ? new Date(questionSet.first_attempt_date).toLocaleString() 
                : 'Unknown date'
            };
          });
          
          console.log('Processed question sets:', processedQuestionSets);
        } else {
          console.log('No data from API, using dummy data');
          // Generate dummy question sets
          processedQuestionSets = generateDummyQuestionSets();
        }
        
        setQuestionSets(processedQuestionSets);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        console.log('Using dummy data due to error:', error.message);
        // Generate dummy submissions on error
        setQuestionSets(generateDummyQuestionSets());
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Function to generate dummy question sets data
  const generateDummyQuestionSets = () => {
    const testNames = [
      "Introduction to Algorithms",
      "Data Structures Fundamentals",
      "Advanced Programming Concepts",
      "Web Development Basics",
      "Database Management Systems"
    ];
    
    return Array.from({ length: 5 }, (_, i) => {
      const questionCount = 4 + Math.floor(Math.random() * 3); // 4-6 questions
      const questionsAttempted = 2 + Math.floor(Math.random() * (questionCount - 1)); // Some questions attempted
      const submissionDate = new Date();
      submissionDate.setDate(submissionDate.getDate() - Math.floor(Math.random() * 30)); // Within last 30 days
      
      // Create dummy questions for this question set
      const questions = Array.from({ length: questionsAttempted }, (_, qIndex) => {
        const totalMarks = 10;
        const obtainedMarks = Math.round(totalMarks * (0.5 + Math.random() * 0.5)); // 50-100%
        
        // Create dummy evaluation details for this question
        const rubricCount = 3 + Math.floor(Math.random() * 2); // 3-4 rubrics
        const evaluationDetails = Array.from({ length: rubricCount }, (_, rIndex) => {
          const rubricMark = 2 + Math.floor(Math.random() * 2); // 2-3 marks per rubric
          const obtainedRubricMark = Math.round(rubricMark * (0.5 + Math.random() * 0.5)); // 50-100%
          
          return {
            id: `rubric-${i}-${qIndex}-${rIndex}`,
            rubric_text: `Rubric ${rIndex + 1}: Understanding of ${['concept', 'application', 'analysis', 'implementation'][rIndex % 4]}`,
            obtained_marks: obtainedRubricMark,
            total_marks: rubricMark,
            serial_number: rIndex + 1,
            explanation: `You ${obtainedRubricMark >= rubricMark * 0.8 ? 'demonstrated excellent' : 
                           obtainedRubricMark >= rubricMark * 0.6 ? 'showed good' : 'need to improve'} 
                           understanding of this aspect. ${obtainedRubricMark < rubricMark ? 'Consider reviewing the material again.' : ''}`
          };
        });
        
        return {
          id: `eval-${i}-${qIndex}`,
          key: `eval-${i}-${qIndex}`,
          question_id: `q-${i}-${qIndex}`,
          question_text: `Question ${qIndex + 1}: Explain the concept of ${['sorting algorithms', 'data structures', 'recursion', 'complexity analysis', 'dynamic programming'][qIndex % 5]} in ${testNames[i]}`,
          status: Math.random() > 0.3 ? 'Evaluated' : 'Under Review',
          solution_pdf_url: 'https://example.com/dummy.pdf', // Dummy URL
          extracted_text: `This is my answer to question ${qIndex + 1}. I've covered all the main points including examples and practical applications.`,
          submitted_at: new Date(submissionDate.getTime() + qIndex * 86400000).toLocaleString(), // Different days
          result: obtainedMarks,
          total_marks: totalMarks,
          percentage: Math.round((obtainedMarks / totalMarks) * 100),
          evaluated: Math.random() > 0.3,
          recheck_requested: Math.random() > 0.8,
          evaluation_details: evaluationDetails
        };
      });
      
      // Calculate totals
      const totalMarks = questions.reduce((sum, q) => sum + q.total_marks, 0);
      const obtainedMarks = questions.reduce((sum, q) => sum + q.result, 0);
      
      return {
        id: `qset-${i}`,
        key: `qset-${i}`,
        name: testNames[i],
        description: `A comprehensive test on ${testNames[i]} concepts and applications`,
        questions_attempted: questionsAttempted,
        total_questions: questionCount,
        total_marks_obtained: obtainedMarks,
        total_possible_marks: totalMarks,
        completion_percentage: Math.round((questionsAttempted / questionCount) * 100),
        score_percentage: Math.round((obtainedMarks / totalMarks) * 100),
        submitted_at: submissionDate.toLocaleString(),
        first_attempt_date: submissionDate,
        questions: questions
      };
    });
  };

  const showQuestionDetails = (question) => {
    console.log('Showing question details:', question);
    setSelectedQuestion(question);
    setDrawerVisible(true);
  };

  const getStatusColor = (status) => {
    if (status === 'Evaluated') return 'green';
    if (status === 'Under Review') return 'blue';
    return 'gold';
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return '#52c41a';
    if (percentage >= 80) return '#1890ff';
    if (percentage >= 70) return '#722ed1';
    if (percentage >= 60) return '#faad14';
    if (percentage >= 50) return '#fa8c16';
    return '#f5222d';
  };

  const renderQuestionDrawer = () => {
    if (!selectedQuestion) return null;
    
    return (
      <Drawer
        title={`Question: ${selectedQuestion.question_text}`}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
        footer={
          <div className="drawer-footer">
            <div className="submission-score">
              <Text strong>Final Score: </Text>
              <Text>{selectedQuestion.result}/{selectedQuestion.total_marks} ({selectedQuestion.percentage}%)</Text>
            </div>
            <Button onClick={() => setDrawerVisible(false)} type="primary">
              Close
            </Button>
          </div>
        }
      >
        <div className="submission-details">
          <div className="submission-meta">
            <div className="meta-item">
              <ClockCircleOutlined className="meta-icon" />
              <Text>Submitted: {selectedQuestion.submitted_at}</Text>
            </div>
            <div className="meta-item">
              <CheckCircleOutlined className="meta-icon" />
              <Text>Status: {selectedQuestion.status}</Text>
            </div>
          </div>

          {selectedQuestion.solution_pdf_url && (
            <div className="pdf-link-container mb-4">
              <Space>
                <FilePdfOutlined />
                <Text strong>Answer PDF: </Text>
                <a 
                  href={selectedQuestion.solution_pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View PDF
                </a>
              </Space>
            </div>
          )}
          
          <Divider orientation="left">Your Answer</Divider>
          <div className="user-answer mb-4">
            <Paragraph className="p-3 bg-gray-50 border rounded">
              {selectedQuestion.extracted_text || 'No text extracted from PDF'}
            </Paragraph>
          </div>
          
          <Divider orientation="left">Evaluation</Divider>
          {selectedQuestion.evaluated || selectedQuestion.status === 'Evaluated' ? (
            <>
              <List
                itemLayout="vertical"
                dataSource={selectedQuestion.evaluation_details || []}
                renderItem={(detail, index) => (
                  <List.Item className="rubric-item">
                    <Card className="rubric-card">
                      <div className="rubric-header">
                        <Text strong>Rubric {index + 1}: {detail.rubric_text}</Text>
                        <Tag color={detail.obtained_marks >= detail.total_marks * 0.7 ? 'green' : 'orange'}>
                          {detail.obtained_marks}/{detail.total_marks} marks
                        </Tag>
                      </div>
                      <div className="rubric-explanation mt-2">
                        <Paragraph>{detail.explanation}</Paragraph>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
              {selectedQuestion.evaluation_details?.length === 0 && (
                <Empty description="No detailed evaluation data available" />
              )}
            </>
          ) : (
            <Empty description="This submission has not been evaluated yet" />
          )}
          
          {selectedQuestion.recheck_requested && (
            <div className="recheck-notice mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Text strong type="warning">Recheck Requested</Text>
              <Paragraph className="mt-1">You have requested a recheck for this submission. The teacher will review your answers again.</Paragraph>
            </div>
          )}
        </div>
      </Drawer>
    );
  };

  // Question set cards view
  const renderQuestionSetCards = () => {
    return (
      <Row gutter={[16, 16]} className="question-set-cards-container">
        {questionSets.map(questionSet => (
          <Col xs={24} md={12} key={questionSet.id}>
            <Card 
              hoverable
              className="question-set-card"
              title={
                <div className="question-set-card-header">
                  <Title level={4}>{questionSet.name}</Title>
                  <Text type="secondary">{questionSet.submitted_at}</Text>
                </div>
              }
            >
              <div className="question-set-stats mb-4">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="Completion" 
                      value={questionSet.completion_percentage || 0} 
                      suffix="%" 
                      valueStyle={{ color: getPerformanceColor(questionSet.completion_percentage || 0) }}
                    />
                    <Text type="secondary">
                      {questionSet.questions?.length || 0} questions attempted
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Score" 
                      value={questionSet.score_percentage || 0} 
                      suffix="%" 
                      valueStyle={{ color: getPerformanceColor(questionSet.score_percentage || 0) }}
                    />
                    <Text type="secondary">
                      {questionSet.total_marks_obtained || 0}/{questionSet.total_possible_marks || 0} marks
                    </Text>
                  </Col>
                </Row>
              </div>
              
              <Collapse ghost className="question-set-evaluations">
                <Panel header={<Text strong>View Questions ({questionSet.questions?.length || 0})</Text>} key="questions">
                  <List
                    dataSource={questionSet.questions || []}
                    renderItem={question => (
                      <List.Item 
                        key={question.id}
                        actions={[
                          <Badge 
                            color={getStatusColor(question.status)} 
                            text={question.status} 
                          />,
                          <Button 
                            type="link" 
                            onClick={() => showQuestionDetails(question)}
                          >
                            View Details
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={<Text ellipsis>{question.question_text}</Text>}
                          description={
                            <Space>
                              <span>{question.result}/{question.total_marks} marks</span>
                              <Progress 
                                percent={question.percentage} 
                                size="small" 
                                status={question.percentage >= 50 ? "success" : "exception"}
                                strokeColor={getPerformanceColor(question.percentage)}
                              />
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
              </Collapse>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="submissions-list-container">
      <div className="page-header">
        <div>
          <Title level={2}>My Submissions</Title>
          <Text type="secondary">View your test submissions and results</Text>
        </div>
        
        <div className="submission-stats-summary">
          <Card className="stats-summary-card">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic 
                  title="Total Tests" 
                  value={questionSets.length} 
                  prefix={<BookOutlined />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Avg Score" 
                  value={Math.round(questionSets.reduce((sum, qs) => sum + (qs.score_percentage || 0), 0) / (questionSets.length || 1))} 
                  suffix="%" 
                  prefix={<TrophyOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Questions Answered" 
                  value={questionSets.reduce((sum, qs) => sum + (qs.questions?.length || 0), 0)} 
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {questionSets.length === 0 ? (
            <Empty description="No submissions found" />
          ) : (
            <div className="submissions-view">
              <Tabs defaultActiveKey="cards">
                <TabPane tab="Question Sets" key="cards">
                  {renderQuestionSetCards()}
                </TabPane>
              </Tabs>
            </div>
          )}
        </>
      )}
      
      {renderQuestionDrawer()}
    </div>
  );
};

export default SubmissionsList;