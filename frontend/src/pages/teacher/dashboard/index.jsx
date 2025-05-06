import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Spin, 
  Empty, 
  Typography, 
  Button, 
  message,
  Statistic,
  Tabs,
  Progress,
  Tag,
  Badge,
  Divider,
  Radio
} from 'antd';
import { 
  FileTextOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  BarChartOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  PieChartOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';
import { API_URL } from '../../../config';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './style.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [testStatistics, setTestStatistics] = useState([]);
  const [overallStatistics, setOverallStatistics] = useState({
    totalTests: 0,
    totalSubmissions: 0,
    totalStudents: 0,
    averageScore: 0,
    recentActivity: 0,
    pendingEvaluations: 0
  });
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [questionPerformance, setQuestionPerformance] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [timeView, setTimeView] = useState('week');
  
  useEffect(() => {
    const fetchTestsAndStatistics = async () => {
      try {
        setLoading(true);
        // Fetch all tests created by the teacher
        const testsResponse = await axios.get(`${API_URL}/questions/sets`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Fetch all submissions for statistics (mocked data structure)
        const submissionsResponse = await axios.get(`${API_URL}/submissions/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Process test data or generate dummy data if none exists
        let testsData = [];
        if (testsResponse.data.question_sets && testsResponse.data.question_sets.length > 0) {
          testsData = testsResponse.data.question_sets.map(test => ({
            id: test.id,
            name: test.name || `Test ${test.id}`,
            description: test.description || 'No description available',
            questionCount: test.questions.length,
            createdAt: new Date(test.created_at).toLocaleString(),
            totalMarks: test.questions.reduce((acc, q) => acc + q.total_marks, 0),
            submissionCount: Math.floor(Math.random() * 30) + 5, // Mock data
            avgScore: Math.floor(Math.random() * 30) + 60, // Mock average score (60-90%)
          }));
        } else {
          // Generate dummy test data
          testsData = generateDummyTests();
        }
        
        // Calculate test statistics for charts
        const statsData = testsData.map(test => ({
          name: test.name,
          avgScore: test.avgScore,
          submissions: test.submissionCount,
          passRate: Math.floor(Math.random() * 30) + 70, // Mock pass rate (70-100%)
        }));
        
        setTests(testsData);
        setTestStatistics(statsData);
        
        // Generate additional mock data for enhanced charts
        generateMockPerformanceData();
        
        // Set overall statistics
        setOverallStatistics({
          totalTests: testsData.length,
          totalSubmissions: testsData.reduce((acc, test) => acc + test.submissionCount, 0),
          totalStudents: Math.floor(Math.random() * 50) + 30, // Mock data
          averageScore: Math.floor(
            testsData.reduce((acc, test) => acc + test.avgScore * test.submissionCount, 0) / 
            testsData.reduce((acc, test) => acc + test.submissionCount, 0) || 0
          ),
          recentActivity: Math.floor(Math.random() * 15) + 5, // Mock recent activity
          pendingEvaluations: Math.floor(Math.random() * 10) // Mock pending evaluations
        });
      } catch (error) {
        console.error('Error fetching tests and statistics:', error);
        // Generate dummy data on error
        const testsData = generateDummyTests();
        setTests(testsData);
        
        // Calculate test statistics for charts
        const statsData = testsData.map(test => ({
          name: test.name,
          avgScore: test.avgScore,
          submissions: test.submissionCount,
          passRate: Math.floor(Math.random() * 30) + 70, // Mock pass rate (70-100%)
        }));
        
        setTestStatistics(statsData);
        
        // Generate additional mock data for enhanced charts
        generateMockPerformanceData();
        
        // Set overall statistics with dummy data
        setOverallStatistics({
          totalTests: testsData.length,
          totalSubmissions: testsData.reduce((acc, test) => acc + test.submissionCount, 0),
          totalStudents: Math.floor(Math.random() * 50) + 30, // Mock data
          averageScore: Math.floor(
            testsData.reduce((acc, test) => acc + test.avgScore * test.submissionCount, 0) / 
            testsData.reduce((acc, test) => acc + test.submissionCount, 0) || 0
          ),
          recentActivity: Math.floor(Math.random() * 15) + 5, // Mock recent activity
          pendingEvaluations: Math.floor(Math.random() * 10) // Mock pending evaluations
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTestsAndStatistics();
  }, []);

  const generateDummyTests = () => {
    const testNames = [
      "Introduction to Algorithms",
      "Data Structures Fundamentals",
      "Advanced Programming Concepts",
      "Web Development Basics",
      "Database Management Systems",
      "Object-Oriented Programming",
      "Machine Learning Fundamentals"
    ];
    
    return testNames.map((name, index) => {
      const questionCount = 4 + Math.floor(Math.random() * 4); // 4-7 questions
      const totalMarks = questionCount * 10; // 10 marks per question
      const submissionCount = Math.floor(Math.random() * 30) + 5;
      const avgScore = Math.floor(Math.random() * 30) + 60; // 60-90%
      
      // Create a date within last 60 days
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 60));
      
      return {
        id: `test-${index}`,
        name: name,
        description: `A comprehensive test covering ${name.toLowerCase()} concepts.`,
        questionCount: questionCount,
        createdAt: createdDate.toLocaleString(),
        totalMarks: totalMarks,
        submissionCount: submissionCount,
        avgScore: avgScore
      };
    });
  };

  const generateMockPerformanceData = () => {
    // Generate performance trend data (last 7 days/4 weeks/6 months)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    const dailyData = days.map(day => ({
      name: day,
      submissions: Math.floor(Math.random() * 10) + 1,
      avgScore: Math.floor(Math.random() * 20) + 70
    }));
    
    const weeklyData = weeks.map(week => ({
      name: week,
      submissions: Math.floor(Math.random() * 30) + 10,
      avgScore: Math.floor(Math.random() * 15) + 75
    }));
    
    const monthlyData = months.map(month => ({
      name: month,
      submissions: Math.floor(Math.random() * 100) + 50,
      avgScore: Math.floor(Math.random() * 10) + 70
    }));
    
    setPerformanceTrend({
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData
    });
    
    // Generate score distribution data
    const distribution = [
      { name: 'Excellent (90-100%)', value: Math.floor(Math.random() * 20) + 10 },
      { name: 'Very Good (80-89%)', value: Math.floor(Math.random() * 30) + 20 },
      { name: 'Good (70-79%)', value: Math.floor(Math.random() * 20) + 15 },
      { name: 'Average (60-69%)', value: Math.floor(Math.random() * 15) + 10 },
      { name: 'Below Average (50-59%)', value: Math.floor(Math.random() * 10) + 5 },
      { name: 'Poor (Below 50%)', value: Math.floor(Math.random() * 5) + 1 }
    ];
    
    setScoreDistribution(distribution);
    
    // Generate question performance data (radar chart)
    const questionData = [
      { aspect: 'Understanding', A: Math.floor(Math.random() * 20) + 70, fullMark: 100 },
      { aspect: 'Accuracy', A: Math.floor(Math.random() * 20) + 70, fullMark: 100 },
      { aspect: 'Completeness', A: Math.floor(Math.random() * 20) + 70, fullMark: 100 },
      { aspect: 'Approach', A: Math.floor(Math.random() * 20) + 70, fullMark: 100 },
      { aspect: 'Presentation', A: Math.floor(Math.random() * 20) + 70, fullMark: 100 }
    ];
    
    setQuestionPerformance(questionData);
    
    // Generate top students data
    const students = [
      { id: 'STU1001', name: 'Alex Johnson', avgScore: 94, testsCompleted: 7 },
      { id: 'STU1002', name: 'Samantha Lee', avgScore: 92, testsCompleted: 6 },
      { id: 'STU1003', name: 'Miguel Rodriguez', avgScore: 89, testsCompleted: 7 },
      { id: 'STU1004', name: 'Emma Chen', avgScore: 88, testsCompleted: 7 },
      { id: 'STU1005', name: 'Jacob Wilson', avgScore: 86, testsCompleted: 6 }
    ];
    
    setTopStudents(students);
  };

  const handleTimeViewChange = e => {
    setTimeView(e.target.value);
  };

  const generateReport = async (testId, testName) => {
    try {
      setDownloadingReport(true);
      
      // In a real application, we would fetch actual submission data for the test
      // Here we'll generate mock data for demonstration purposes
      
      // Mock student data
      const students = Array.from({ length: 15 }, (_, i) => ({
        id: `STU${1000 + i}`,
        name: `Student ${i + 1}`,
        email: `student${i + 1}@example.com`,
      }));
      
      // Mock test structure - assume 4 questions
      const questionCount = 4;
      const maxMarksPerQuestion = [10, 15, 10, 15]; // Mock max marks for each question
      
      // Generate random scores for each student
      const studentScores = students.map(student => {
        const questionScores = Array.from({ length: questionCount }, (_, i) => {
          const max = maxMarksPerQuestion[i];
          return Math.floor(Math.random() * (max * 0.4)) + Math.floor(max * 0.5); // 50-90% of max score
        });
        
        const totalScore = questionScores.reduce((acc, score) => acc + score, 0);
        const totalMaxScore = maxMarksPerQuestion.reduce((acc, max) => acc + max, 0);
        
        return {
          ...student,
          questionScores,
          totalScore,
          totalMaxScore,
          percentage: Math.round((totalScore / totalMaxScore) * 100),
        };
      });
      
      // Sort by total score (descending)
      studentScores.sort((a, b) => b.totalScore - a.totalScore);
      
      // Create PDF
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`Test Report: ${testName}`, 14, 22);
      
      // Add subtitle
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      // Add summary
      doc.setFontSize(14);
      doc.text('Summary', 14, 40);
      
      doc.setFontSize(10);
      doc.text(`Total Students: ${students.length}`, 14, 48);
      doc.text(`Average Score: ${Math.round(studentScores.reduce((acc, s) => acc + s.percentage, 0) / studentScores.length)}%`, 14, 54);
      doc.text(`Highest Score: ${Math.max(...studentScores.map(s => s.percentage))}%`, 14, 60);
      doc.text(`Lowest Score: ${Math.min(...studentScores.map(s => s.percentage))}%`, 14, 66);
      
      // Create table header with student data and question scores
      const tableHeaders = [
        'Student ID', 
        'Student Name',
        ...Array.from({ length: questionCount }, (_, i) => `Q${i + 1} (${maxMarksPerQuestion[i]})`),
        'Total',
        '%'
      ];
      
      // Create table rows
      const tableData = studentScores.map(student => [
        student.id,
        student.name,
        ...student.questionScores.map(score => score.toString()),
        `${student.totalScore}/${student.totalMaxScore}`,
        `${student.percentage}%`
      ]);
      
      // Add table to PDF
      doc.autoTable({
        startY: 75,
        head: [tableHeaders],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });
      
      // Save the PDF
      doc.save(`Test_Report_${testName.replace(/\s+/g, '_')}.pdf`);
      
      message.success('Report generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report. Please try again.');
    } finally {
      setDownloadingReport(false);
    }
  };

  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Questions',
      dataIndex: 'questionCount',
      key: 'questionCount',
      align: 'center',
    },
    {
      title: 'Total Marks',
      dataIndex: 'totalMarks',
      key: 'totalMarks',
      align: 'center',
    },
    {
      title: 'Submissions',
      dataIndex: 'submissionCount',
      key: 'submissionCount',
      align: 'center',
    },
    {
      title: 'Avg. Score',
      dataIndex: 'avgScore',
      key: 'avgScore',
      align: 'center',
      render: (score) => {
        let color = score >= 80 ? 'success' : score >= 70 ? 'processing' : score >= 60 ? 'warning' : 'error';
        return <Tag color={color}>{score}%</Tag>;
      },
    },
    {
      title: 'Created On',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => generateReport(record.id, record.name)}
          loading={downloadingReport}
        >
          Report
        </Button>
      ),
    },
  ];

  const getPerformanceTrendData = () => {
    switch(timeView) {
      case 'week': return performanceTrend.daily;
      case 'month': return performanceTrend.weekly;
      case 'halfYear': return performanceTrend.monthly;
      default: return performanceTrend.daily;
    }
  };

  const renderScoreChange = () => {
    const trend = Math.random() > 0.5 ? 2.3 : -1.5;
    const color = trend >= 0 ? '#52c41a' : '#f5222d';
    const icon = trend >= 0 ? <RiseOutlined /> : <FallOutlined />;
    
    return (
      <div className="score-trend">
        <Text style={{ color, marginRight: '8px' }}>
          {icon} {Math.abs(trend).toFixed(1)}%
        </Text>
        <Text type="secondary">vs. previous period</Text>
      </div>
    );
  };

  const getStatusBadge = (count, type) => {
    const status = type === 'activity' ? 'success' : 'processing';
    return (
      <Badge 
        count={count} 
        style={{ backgroundColor: status === 'success' ? '#52c41a' : '#1890ff' }}
      />
    );
  };

  const studentColumns = [
    {
      title: 'Student ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Avg. Score',
      dataIndex: 'avgScore',
      key: 'avgScore',
      align: 'center',
      render: (score) => {
        let color = score >= 90 ? '#52c41a' : score >= 80 ? '#1890ff' : score >= 70 ? '#722ed1' : '#faad14';
        return (
          <Progress 
            percent={score} 
            size="small" 
            strokeColor={color}
            format={(percent) => `${percent}%`}
          />
        );
      },
    },
    {
      title: 'Tests Completed',
      dataIndex: 'testsCompleted',
      key: 'testsCompleted',
      align: 'center',
    },
  ];

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div>
          <Title level={2}>Teacher Dashboard</Title>
          <Text type="secondary">Manage your tests and view student performance</Text>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="stats-cards">
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="Total Tests"
                  value={overallStatistics.totalTests}
                  prefix={<FileTextOutlined className="stat-icon" />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div className="stat-footer">
                  <Tag color="blue">Active Resource</Tag>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="Total Students"
                  value={overallStatistics.totalStudents}
                  prefix={<TeamOutlined className="stat-icon" />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <div className="stat-footer">
                  <div className="status-with-badge">
                    {getStatusBadge(overallStatistics.recentActivity, 'activity')}
                    <Text type="secondary" style={{ marginLeft: '8px' }}>New this week</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="Total Submissions"
                  value={overallStatistics.totalSubmissions}
                  prefix={<CheckCircleOutlined className="stat-icon" />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <div className="stat-footer">
                  <div className="status-with-badge">
                    {getStatusBadge(overallStatistics.pendingEvaluations, 'pending')}
                    <Text type="secondary" style={{ marginLeft: '8px' }}>Pending evaluations</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="Average Score"
                  value={overallStatistics.averageScore}
                  suffix="%"
                  prefix={<TrophyOutlined className="stat-icon" />}
                  valueStyle={{ color: '#fa8c16' }}
                />
                <div className="stat-footer">
                  {renderScoreChange()}
                </div>
              </Card>
            </Col>
          </Row>

          {tests.length === 0 ? (
            <Empty 
              description="No tests created yet" 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
          ) : (
            <>
              <Tabs defaultActiveKey="overview" className="dashboard-tabs">
                <TabPane tab="Overview" key="overview">
                  <Row gutter={[16, 16]} className="dashboard-charts">
                    <Col xs={24} lg={16}>
                      <Card 
                        title="Performance Trend" 
                        className="chart-card"
                        extra={
                          <Radio.Group value={timeView} onChange={handleTimeViewChange} size="small">
                            <Radio.Button value="week">Week</Radio.Button>
                            <Radio.Button value="month">Month</Radio.Button>
                            <Radio.Button value="halfYear">6 Months</Radio.Button>
                          </Radio.Group>
                        }
                      >
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart
                            data={getPerformanceTrendData()}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Area 
                              yAxisId="left"
                              type="monotone" 
                              dataKey="submissions" 
                              name="Submissions" 
                              stroke="#82ca9d" 
                              fill="#82ca9d" 
                              fillOpacity={0.3}
                            />
                            <Area 
                              yAxisId="right"
                              type="monotone" 
                              dataKey="avgScore" 
                              name="Average Score (%)" 
                              stroke="#8884d8" 
                              fill="#8884d8"
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                      <Card title="Score Distribution" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={scoreDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => 
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {scoreDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card title="Question Performance Analysis" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={questionPerformance}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="aspect" />
                            <PolarRadiusAxis domain={[0, 100]} />
                            <Radar name="Average Performance" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <Tooltip />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card title="Top Performing Students" className="chart-card">
                        <Table
                          dataSource={topStudents}
                          columns={studentColumns}
                          pagination={false}
                          size="small"
                          rowKey="id"
                        />
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="Tests" key="tests">
                  <Card title="All Tests" className="tests-table-card">
                    <Table
                      columns={columns}
                      dataSource={tests}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                </TabPane>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;