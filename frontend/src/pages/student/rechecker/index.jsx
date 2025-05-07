import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Spin, 
  Empty, 
  Typography, 
  Tag, 
  Button, 
  message, 
  Modal, 
  Form, 
  Input,
  Alert,
  Space,
  Tabs,
  Badge,
  Collapse,
  Row,
  Col,
  Progress,
  Timeline,
  Statistic,
  Divider,
  Tooltip,
  List,
  Avatar,
  Descriptions
} from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  SyncOutlined, 
  FileTextOutlined,
  UserOutlined,
  HistoryOutlined,
  EditOutlined,
  InfoCircleOutlined,
  FilePdfOutlined,
  CommentOutlined,
  LikeOutlined,
  DislikeOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../../config';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const RecheckerModule = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [recheckModalVisible, setRecheckModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [recentlyRechecked, setRecentlyRechecked] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    accepted: 0,
    rejected: 0
  });
  const [activeTab, setActiveTab] = useState('ongoing');
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    // In a real implementation, this would fetch actual data from the backend
    // Here we're generating mock data instead
    loadMockData();
  }, []);

  const loadMockData = () => {
    try {
      setLoading(true);
      // Create mock subjects for test names
      const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
      
      // Generate random test submissions
      const mockSubmissions = Array.from({ length: 15 }, (_, i) => {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const testType = ['Midterm', 'Final', 'Quiz', 'Assignment'][Math.floor(Math.random() * 4)];
        const totalMarks = 25 + Math.floor(Math.random() * 75); // 25-100
        const score = Math.floor(totalMarks * (0.6 + Math.random() * 0.3)); // 60-90% of total
        
        // Determine recheck status
        let status = 'none';
        let reason = null;
        let response = null;
        let responseDate = null;
        let scoreAfterRecheck = null;
        let responseTeacher = null;
        
        // Create a mix of different statuses
        if (i < 3) {
          status = 'none'; // First 3 have no recheck
        } else if (i < 7) {
          status = 'pending'; // Next 4 are pending
          reason = [
            'I believe question 3 was incorrectly evaluated. My answer matched the expected solution pattern.',
            'The marks for the mathematical proof seem incorrectly assessed. I showed all required steps.',
            'I should have received partial credit for question 2 as I used the correct formula but made a minor calculation error.',
            "My explanation for the conceptual question was complete but wasnt given full marks."
          ][i % 4];
        } else if (i < 15) {
          // Remainder are completed
          status = 'completed';
          reason = [
            "The grading scheme wasn't properly applied to my solution for question 4.",
            'I believe I demonstrated sufficient understanding in question 2 but received minimal points.',
            'The proof in question 3 followed the textbook approach but was marked incorrect.',
            'My answer for the last question was marked wrong despite matching the solution pattern.'
          ][i % 4];
          
          const teacherNames = ['Dr. Smith', 'Prof. Johnson', 'Mrs. Williams', 'Mr. Taylor'];
          responseTeacher = teacherNames[Math.floor(Math.random() * teacherNames.length)];
          
          // Randomize whether recheck was successful
          const recheckAccepted = Math.random() > 0.5;
          
          response = recheckAccepted ? 
            [
              'Upon review, I agree that your solution deserves more credit. Marks have been adjusted accordingly.',
              "You're correct. The initial evaluation missed some aspects of your solution. Score updated.",
              'After careful review, I agree that your approach demonstrates understanding. Marks adjusted.'
            ][Math.floor(Math.random() * 3)] :
            [
              'After reviewing your solution, the original marks stand. Your approach missed key concepts required by the question.',
              'While your solution contains some correct elements, it didnt meet the criteria for additional marks.',
              'The marking scheme was correctly applied. Your solution didnt address the key requirements.'
            ][Math.floor(Math.random() * 3)];
            
          const recheckDate = new Date();
          recheckDate.setDate(recheckDate.getDate() - Math.floor(Math.random() * 14)); // Within last 2 weeks
          responseDate = recheckDate.toLocaleString();
          
          // If accepted, increase score
          if (recheckAccepted) {
            scoreAfterRecheck = score + Math.floor(Math.random() * 10) + 1; // 1-10 points more
            scoreAfterRecheck = Math.min(scoreAfterRecheck, totalMarks); // Don't exceed total
          } else {
            scoreAfterRecheck = score;
          }
        }
        
        // Generate a submission date (1-30 days ago)
        const submissionDate = new Date();
        submissionDate.setDate(submissionDate.getDate() - Math.floor(Math.random() * 30) - 1);
        
        return {
          id: `submission-${i + 1}`,
          key: `submission-${i + 1}`,
          test_name: `${subject} ${testType} ${Math.floor(Math.random() * 3) + 1}`,
          question_count: Math.floor(Math.random() * 5) + 3, // 3-7 questions
          total_marks: totalMarks,
          score: score,
          percentage: Math.round((score / totalMarks) * 100),
          submitted_at: submissionDate.toLocaleString(),
          recheck_status: status,
          recheck_reason: reason,
          recheck_response: response,
          response_date: responseDate,
          response_teacher: responseTeacher,
          score_after_recheck: scoreAfterRecheck,
          pdf_url: 'https://example.com/answer.pdf', // Mock URL
          subject: subject
        };
      });
      
      // Calculate stats based on mock data
      const stats = {
        total: mockSubmissions.length,
        pending: mockSubmissions.filter(s => s.recheck_status === 'pending').length,
        completed: mockSubmissions.filter(s => s.recheck_status === 'completed').length,
        accepted: mockSubmissions.filter(s => s.recheck_status === 'completed' && s.score_after_recheck > s.score).length,
        rejected: mockSubmissions.filter(s => s.recheck_status === 'completed' && s.score_after_recheck === s.score).length
      };
      
      // Set history data
      const historyItems = mockSubmissions
        .filter(s => s.recheck_status === 'completed')
        .map(s => ({
          date: s.response_date,
          test: s.test_name,
          initialScore: `${s.score}/${s.total_marks}`,
          finalScore: `${s.score_after_recheck}/${s.total_marks}`,
          teacher: s.response_teacher,
          wasAccepted: s.score_after_recheck > s.score
        }));
      
      // Store recently rechecked (completed in the last 3 days)
      const threeDAysAgo = new Date();
      threeDAysAgo.setDate(threeDAysAgo.getDate() - 3);
      
      const recent = mockSubmissions.filter(s => {
        if (s.recheck_status !== 'completed' || !s.response_date) return false;
        return new Date(s.response_date) > threeDAysAgo;
      });
      
      setSubmissions(mockSubmissions);
      setStats(stats);
      setHistoryData(historyItems);
      setRecentlyRechecked(recent);
    } catch (error) {
      console.error('Error generating mock data:', error);
      message.error('Failed to load submissions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const showRecheckConfirm = (submission) => {
    confirm({
      title: 'Do you want to request a recheck for this submission?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>You are about to request a reevaluation for:</p>
          <p><strong>{submission.test_name}</strong></p>
          <p>Current Score: <strong>{submission.score}/{submission.total_marks} ({submission.percentage}%)</strong></p>
          <p>Your request will be reviewed by a teacher or moderator.</p>
        </div>
      ),
      onOk() {
        setSelectedSubmission(submission);
        setRecheckModalVisible(true);
      },
    });
  };

  const showDetailView = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalVisible(true);
  };

  const handleRecheckSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // Mock API call since reevaluation is just for show
      // In a real implementation, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // simulate API delay
      
      // Update submission status locally
      const updatedSubmissions = submissions.map(sub => {
        if (sub.id === selectedSubmission.id) {
          return {
            ...sub,
            recheck_status: 'pending',
            recheck_reason: values.reason
          };
        }
        return sub;
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending + 1
      }));
      
      setSubmissions(updatedSubmissions);
      message.success('Recheck request submitted successfully!');
      setRecheckModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting recheck request:', error);
      message.error('Failed to submit recheck request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (status) => {
    let color = 'default';
    let text = 'Not Requested';
    let icon = null;
    
    if (status === 'pending') {
      color = 'processing';
      text = 'Pending';
      icon = <SyncOutlined spin />;
    } else if (status === 'completed') {
      color = 'success';
      text = 'Completed';
      icon = <CheckCircleOutlined />;
    }
    
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'test_name',
      key: 'test_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.subject}</Text>
        </Space>
      ),
      filters: [...new Set(submissions.map(s => s.subject))].map(subject => ({
        text: subject,
        value: subject,
      })),
      onFilter: (value, record) => record.subject === value,
    },
    {
      title: 'Current Score',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      render: (score, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{score}/{record.total_marks}</Text>
          <Progress 
            percent={record.percentage} 
            size="small" 
            status={record.percentage < 60 ? "exception" : "normal"}
            strokeColor={
              record.percentage >= 90 ? '#52c41a' :
              record.percentage >= 80 ? '#1890ff' :
              record.percentage >= 70 ? '#722ed1' :
              record.percentage >= 60 ? '#faad14' : '#f5222d'
            }
          />
        </Space>
      ),
      sorter: (a, b) => a.percentage - b.percentage,
    },
    {
      title: 'Submitted On',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: date => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {date}
        </span>
      ),
      sorter: (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at),
    },
    {
      title: 'Status',
      dataIndex: 'recheck_status',
      key: 'recheck_status',
      align: 'center',
      render: (status, record) => {
        if (status === 'completed') {
          const isImproved = record.score_after_recheck > record.score;
          return (
            <Space direction="vertical" size={0}>
              <Tag color="success" icon={<CheckCircleOutlined />}>Completed</Tag>
              {isImproved ? (
                <Tag color="green" style={{ marginTop: 4 }}>
                  <LikeOutlined /> Score Improved
                </Tag>
              ) : (
                <Tag color="orange" style={{ marginTop: 4 }}>
                  <DislikeOutlined /> No Change
                </Tag>
              )}
            </Space>
          );
        }
        return getStatusTag(status);
      },
      filters: [
        { text: 'Not Requested', value: 'none' },
        { text: 'Pending', value: 'pending' },
        { text: 'Completed', value: 'completed' },
      ],
      onFilter: (value, record) => record.recheck_status === value,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            onClick={() => showRecheckConfirm(record)}
            disabled={record.recheck_status !== 'none'}
          >
            Request Recheck
          </Button>
          <Button
            type="default"
            onClick={() => showDetailView(record)}
            icon={<InfoCircleOutlined />}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  const pendingColumns = [
    {
      title: 'Test Name',
      dataIndex: 'test_name',
      key: 'test_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.subject}</Text>
        </Space>
      ),
    },
    {
      title: 'Current Score',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      render: (score, record) => `${score}/${record.total_marks} (${record.percentage}%)`,
    },
    {
      title: 'Requested On',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: date => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {date}
        </span>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'recheck_reason',
      key: 'recheck_reason',
      render: reason => (
        <Tooltip title={reason}>
          <Text ellipsis style={{ maxWidth: 300 }}>{reason}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      render: () => (
        <Tag color="processing" icon={<SyncOutlined spin />}>In Progress</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          type="default"
          onClick={() => showDetailView(record)}
          icon={<InfoCircleOutlined />}
        >
          Details
        </Button>
      ),
    },
  ];

  const completedColumns = [
    {
      title: 'Test Name',
      dataIndex: 'test_name',
      key: 'test_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.subject}</Text>
        </Space>
      ),
    },
    {
      title: 'Score Change',
      key: 'score_change',
      align: 'center',
      render: (_, record) => {
        const initialScore = record.score;
        const finalScore = record.score_after_recheck;
        const initialPercentage = record.percentage;
        const finalPercentage = Math.round((finalScore / record.total_marks) * 100);
        const difference = finalScore - initialScore;
        
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Space>
              <Text delete={difference !== 0} type={difference !== 0 ? "secondary" : ""}>{initialScore}/{record.total_marks}</Text>
              {difference !== 0 && (
                <>
                  <Text type="success">→</Text>
                  <Text type="success" strong>{finalScore}/{record.total_marks}</Text>
                </>
              )}
            </Space>
            <Progress 
              percent={finalPercentage}
              size="small"
              status={difference > 0 ? "success" : "normal"}
              strokeColor={
                finalPercentage >= 90 ? '#52c41a' :
                finalPercentage >= 80 ? '#1890ff' :
                finalPercentage >= 70 ? '#722ed1' :
                finalPercentage >= 60 ? '#faad14' : '#f5222d'
              }
            />
            {difference > 0 && (
              <Text type="success" style={{ fontSize: '12px' }}>
                +{difference} points ({finalPercentage - initialPercentage}%)
              </Text>
            )}
          </Space>
        );
      },
      sorter: (a, b) => (a.score_after_recheck - a.score) - (b.score_after_recheck - b.score),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Reviewed By',
      dataIndex: 'response_teacher',
      key: 'response_teacher',
    },
    {
      title: 'Response Date',
      dataIndex: 'response_date',
      key: 'response_date',
      render: date => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {date}
        </span>
      ),
      sorter: (a, b) => new Date(a.response_date) - new Date(b.response_date),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Result',
      key: 'result',
      align: 'center',
      render: (_, record) => {
        const isImproved = record.score_after_recheck > record.score;
        return isImproved ? (
          <Tag color="green" icon={<LikeOutlined />}>Accepted</Tag>
        ) : (
          <Tag color="orange" icon={<DislikeOutlined />}>No Change</Tag>
        );
      },
      filters: [
        { text: 'Accepted', value: 'accepted' },
        { text: 'No Change', value: 'no-change' },
      ],
      onFilter: (value, record) => {
        if (value === 'accepted') return record.score_after_recheck > record.score;
        return record.score_after_recheck === record.score;
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          type="default"
          onClick={() => showDetailView(record)}
          icon={<InfoCircleOutlined />}
        >
          View Details
        </Button>
      ),
    },
  ];

  const renderStatistics = () => (
    <Row gutter={[16, 16]} className="recheck-stats">
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card className="stat-card">
          <Statistic
            title="Total Submissions"
            value={stats.total}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={5}>
        <Card className="stat-card">
          <Statistic
            title="Pending Rechecks"
            value={stats.pending}
            prefix={<SyncOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={5}>
        <Card className="stat-card">
          <Statistic
            title="Completed Rechecks"
            value={stats.completed}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={12} lg={10}>
        <Card className="stat-card">
          <Statistic
            title="Recheck Success Rate"
            value={stats.completed > 0 ? Math.round((stats.accepted / stats.completed) * 100) : 0}
            suffix="%"
            prefix={<LikeOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              {stats.accepted} accepted out of {stats.completed} completed rechecks
            </Text>
          </div>
        </Card>
      </Col>
    </Row>
  );

  const renderDetailModal = () => {
    if (!selectedSubmission) return null;
    
    const isCompleted = selectedSubmission.recheck_status === 'completed';
    const isPending = selectedSubmission.recheck_status === 'pending';
    const scoreImproved = isCompleted && selectedSubmission.score_after_recheck > selectedSubmission.score;
    
    return (
      <Modal
        title={`${selectedSubmission.test_name} - Details`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <div className="submission-detail-content">
          <Descriptions
            title="Submission Information"
            bordered
            column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
          >
            <Descriptions.Item label="Test Name" span={2}>
              {selectedSubmission.test_name}
            </Descriptions.Item>
            <Descriptions.Item label="Submission Date" span={2}>
              {selectedSubmission.submitted_at}
            </Descriptions.Item>
            
            <Descriptions.Item label="Subject">
              {selectedSubmission.subject}
            </Descriptions.Item>
            <Descriptions.Item label="Questions">
              {selectedSubmission.question_count}
            </Descriptions.Item>
            <Descriptions.Item label="Total Marks">
              {selectedSubmission.total_marks}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedSubmission.recheck_status)}
            </Descriptions.Item>
            
            <Descriptions.Item label="Initial Score" span={isCompleted ? 1 : 2}>
              {selectedSubmission.score}/{selectedSubmission.total_marks} ({selectedSubmission.percentage}%)
            </Descriptions.Item>
            
            {isCompleted && (
              <Descriptions.Item label="Final Score" span={1}>
                <Text type={scoreImproved ? "success" : ""} strong={scoreImproved}>
                  {selectedSubmission.score_after_recheck}/{selectedSubmission.total_marks} (
                  {Math.round((selectedSubmission.score_after_recheck / selectedSubmission.total_marks) * 100)}%)
                </Text>
              </Descriptions.Item>
            )}
            
            {isCompleted && (
              <Descriptions.Item label="Change">
                {scoreImproved ? (
                  <Text type="success">
                    +{selectedSubmission.score_after_recheck - selectedSubmission.score} points
                  </Text>
                ) : (
                  <Text type="secondary">No change</Text>
                )}
              </Descriptions.Item>
            )}
          </Descriptions>
          
          <Divider />
          
          <div className="submission-files">
            <Title level={5}>
              <FilePdfOutlined /> Answer Document
            </Title>
            <Button 
              type="primary" 
              icon={<FilePdfOutlined />}
              onClick={() => message.info('This is a mock PDF link in the demo')}
            >
              View Answer PDF
            </Button>
          </div>
          
          {(isPending || isCompleted) && (
            <>
              <Divider />
              
              <div className="recheck-request">
                <Title level={5}>
                  <EditOutlined /> Recheck Request
                </Title>
                <Card>
                  <div>
                    <Text type="secondary">Submitted on: {selectedSubmission.submitted_at}</Text>
                  </div>
                  <Paragraph style={{ marginTop: 8 }}>
                    <Text strong>Reason for recheck:</Text>
                  </Paragraph>
                  <Paragraph>
                    {selectedSubmission.recheck_reason}
                  </Paragraph>
                </Card>
              </div>
            </>
          )}
          
          {isCompleted && (
            <>
              <Divider />
              
              <div className="recheck-response">
                <Title level={5}>
                  <CommentOutlined /> Teacher Response
                </Title>
                <Card 
                  title={`Response from ${selectedSubmission.response_teacher}`}
                  extra={<Text type="secondary">{selectedSubmission.response_date}</Text>}
                  className={scoreImproved ? "success-response" : "neutral-response"}
                >
                  <Paragraph>
                    {selectedSubmission.recheck_response}
                  </Paragraph>
                  
                  <div className="response-result">
                    {scoreImproved ? (
                      <Alert
                        message="Score Adjusted"
                        description={`Your score has been increased by ${selectedSubmission.score_after_recheck - selectedSubmission.score} points.`}
                        type="success"
                        showIcon
                      />
                    ) : (
                      <Alert
                        message="No Score Change"
                        description="After review, your original score remains unchanged."
                        type="info"
                        showIcon
                      />
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </Modal>
    );
  };

  const renderRecheckHistory = () => {
    if (historyData.length === 0) {
      return <Empty description="No recheck history available" />;
    }
    
    return (
      <Timeline mode="left" className="recheck-timeline">
        {historyData.map((item, index) => (
          <Timeline.Item 
            key={index}
            color={item.wasAccepted ? 'green' : 'blue'}
            label={item.date}
          >
            <Card className="timeline-card">
              <div className="timeline-header">
                <Text strong>{item.test}</Text>
                {item.wasAccepted ? (
                  <Tag color="green" icon={<LikeOutlined />}>Accepted</Tag>
                ) : (
                  <Tag color="blue" icon={<InfoCircleOutlined />}>Reviewed</Tag>
                )}
              </div>
              <div className="timeline-content">
                <div className="score-change">
                  <Space>
                    <Text delete={item.wasAccepted}>{item.initialScore}</Text>
                    {item.wasAccepted && (
                      <>
                        <Text type="success">→</Text>
                        <Text type="success" strong>{item.finalScore}</Text>
                      </>
                    )}
                  </Space>
                </div>
                <div className="timeline-reviewer">
                  <UserOutlined /> {item.teacher}
                </div>
              </div>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  return (
    <div className="rechecker-module-container">
      <div className="module-header">
        <div className="header-title">
          <Title level={2}>Test Reevaluation</Title>
          <Text type="secondary">Request reevaluation for your test submissions</Text>
        </div>
      </div>
      
      {recentlyRechecked.length > 0 && (
        <Alert
          message={`Reevaluation Completed (${recentlyRechecked.length})`}
          description={
            <>
              <p>Reevaluation has been completed for {recentlyRechecked.length} of your tests.</p>
              <p>
                {recentlyRechecked.filter(s => s.score_after_recheck > s.score).length} tests had score improvements.
                Check the details for updated scores.
              </p>
            </>
          }
          type="success"
          showIcon
          className="recheck-alert"
          closable
        />
      )}
      
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Statistics Row */}
          {renderStatistics()}
          
          {/* Main Content Tabs */}
          <Tabs 
            defaultActiveKey="all" 
            className="rechecker-tabs"
            onChange={setActiveTab}
          >
            <TabPane 
              tab={
                <span>
                  <FileTextOutlined />
                  All Submissions
                </span>
              } 
              key="all"
            >
              {submissions.length === 0 ? (
                <Empty description="No submissions available for reevaluation" />
              ) : (
                <Card className="rechecker-table-card">
                  <Table
                    columns={columns}
                    dataSource={submissions}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    rowKey="id"
                  />
                </Card>
              )}
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <SyncOutlined />
                  Pending Rechecks {stats.pending > 0 && <Badge count={stats.pending} style={{ marginLeft: 5 }} />}
                </span>
              }
              key="pending"
            >
              {submissions.filter(s => s.recheck_status === 'pending').length === 0 ? (
                <Empty description="No pending recheck requests" />
              ) : (
                <Card className="rechecker-table-card">
                  <Table
                    columns={pendingColumns}
                    dataSource={submissions.filter(s => s.recheck_status === 'pending')}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                  />
                </Card>
              )}
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <CheckCircleOutlined />
                  Completed Rechecks
                </span>
              }
              key="completed"
            >
              {submissions.filter(s => s.recheck_status === 'completed').length === 0 ? (
                <Empty description="No completed recheck requests" />
              ) : (
                <Card className="rechecker-table-card">
                  <Table
                    columns={completedColumns}
                    dataSource={submissions.filter(s => s.recheck_status === 'completed')}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                  />
                </Card>
              )}
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <HistoryOutlined />
                  History
                </span>
              }
              key="history"
            >
              <Card className="rechecker-table-card">
                {renderRecheckHistory()}
              </Card>
            </TabPane>
          </Tabs>
        </>
      )}
      
      <Modal
        title="Request Reevaluation"
        open={recheckModalVisible}
        onCancel={() => {
          setRecheckModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <div className="recheck-modal-content">
          <Alert
            message="Tips for effective recheck requests"
            description={
              <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                <li>Be specific about which questions you're contesting</li>
                <li>Reference the marking scheme or solution where applicable</li>
                <li>Explain your reasoning clearly and professionally</li>
                <li>Focus on academic merit rather than simply requesting more marks</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleRecheckSubmit}
          >
            <Form.Item
              name="reason"
              label="Reason for reevaluation"
              rules={[
                { required: true, message: 'Please provide a reason for the reevaluation request' },
                { min: 20, message: 'Please provide a more detailed explanation (minimum 20 characters)' },
                { max: 500, message: 'Your explanation is too long (maximum 500 characters)' }
              ]}
            >
              <TextArea 
                rows={6} 
                placeholder="Please explain why you believe this test needs to be reevaluated. Be specific about which questions you believe were incorrectly evaluated and why." 
                showCount
                maxLength={500}
              />
            </Form.Item>
            
            <div className="recheck-form-footer">
              <Space>
                <Button 
                  onClick={() => {
                    setRecheckModalVisible(false);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Submit Request
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      </Modal>
      
      {renderDetailModal()}
    </div>
  );
};

export default RecheckerModule;