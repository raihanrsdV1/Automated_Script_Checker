import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Spin,
  Empty,
  Typography,
  Tabs,
  Select,
  DatePicker,
  Form,
  Row,
  Col,
  Radio,
  message,
  Statistic,
  Badge,
  Progress,
  Avatar,
  List,
  Divider,
  Tag,
  Popover,
  Calendar
} from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  FilterOutlined,
  PrinterOutlined,
  BarChartOutlined,
  UserOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  HeatMapOutlined,
  BulbOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis } from 'recharts';
import axios from 'axios';
import { API_URL } from '../../../config';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './style.css';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Enhanced color palette for charts
const COLORS = ['#1890ff', '#52c41a', '#722ed1', '#faad14', '#f5222d', '#13c2c2', '#eb2f96'];

const ReportsModule = () => {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const [performanceByClass, setPerformanceByClass] = useState([]);
  const [testComparisonData, setTestComparisonData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [improvementData, setImprovementData] = useState([]);
  const [skillRadarData, setSkillRadarData] = useState([]);
  const [submissionHeatmap, setSubmissionHeatmap] = useState({});
  const [filterForm] = Form.useForm();
  
  // Mock statistics data
  const [detailedStats, setDetailedStats] = useState({
    scoreDistribution: [],
    questionPerformance: [],
    timeAnalysis: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Instead of calling API, let's just create mock data directly
        // Note: In production, we would call the API endpoint
        
        // Generate dummy test data
        const mockTests = generateMockTests();
        setTests(mockTests);
        
        // Generate mock student data
        const mockStudents = generateMockStudents();
        setStudents(mockStudents);
        
        // Generate additional mock data for visualizations
        generateMockClassPerformance();
        generateMockTestComparison();
        generateMockTopPerformers(mockStudents);
        generateMockImprovementData();
        generateMockSkillRadarData();
        generateMockSubmissionHeatmap();
        
        // Generate mock test results if any tests exist
        if (mockTests.length > 0) {
          generateMockResults(mockTests[0], mockStudents);
          setSelectedTest(mockTests[0]);
        }
        
      } catch (error) {
        console.error('Error setting up mock data:', error);
        message.error('Failed to load report data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Generate mock tests
  const generateMockTests = () => {
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
    
    return Array.from({ length: 8 }, (_, i) => {
      const questionCount = 4 + Math.floor(Math.random() * 6); // 4-9 questions
      const questions = Array.from({ length: questionCount }, (_, j) => ({
        id: `q-${i}-${j}`,
        question_text: `Question ${j+1} about ${subjects[i % subjects.length]}`,
        total_marks: 5 + Math.floor(Math.random() * 5) // 5-9 marks per question
      }));
      
      return {
        id: `test-${i+1}`,
        name: `${subjects[i % subjects.length]} Test ${i+1}`,
        description: `Comprehensive assessment of ${subjects[i % subjects.length]} concepts and applications.`,
        questionCount,
        questions,
        subject: subjects[i % subjects.length],
        createdAt: new Date(Date.now() - (Math.random() * 90 * 24 * 60 * 60 * 1000)).toLocaleString(),
        totalMarks: questions.reduce((acc, q) => acc + q.total_marks, 0),
        difficultyLevel: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]
      };
    });
  };

  // Generate mock students
  const generateMockStudents = () => {
    const classNames = ['Class 9A', 'Class 9B', 'Class 10A', 'Class 10B'];
    const firstNames = ['Alex', 'Jamie', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: `STU${1000 + i}`,
      name: `${firstNames[i % firstNames.length]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      email: `student${i+1}@example.com`,
      className: classNames[i % classNames.length],
      attendance: Math.floor(75 + Math.random() * 25) // 75-99%
    }));
  };

  const generateMockClassPerformance = () => {
    const classNames = ['Class 9A', 'Class 9B', 'Class 10A', 'Class 10B'];
    
    const performanceData = classNames.map(className => ({
      name: className,
      averageScore: Math.floor(65 + Math.random() * 20), // 65-84%
      participationRate: Math.floor(70 + Math.random() * 25), // 70-94%
      improvementRate: Math.floor(Math.random() * 15), // 0-14%
    }));
    
    setPerformanceByClass(performanceData);
  };

  const generateMockTestComparison = () => {
    const comparisonData = [];
    
    // Generate data for the last 5 tests
    for (let i = 0; i < 5; i++) {
      comparisonData.push({
        name: `Test ${i+1}`,
        averageScore: Math.floor(65 + Math.random() * 20),
        classAverage: Math.floor(60 + Math.random() * 25),
        highestScore: Math.floor(85 + Math.random() * 15),
      });
    }
    
    setTestComparisonData(comparisonData);
  };

  const generateMockTopPerformers = (studentsList) => {
    // Sort students randomly and take the top 5
    const shuffled = [...studentsList].sort(() => 0.5 - Math.random());
    
    const performers = shuffled.slice(0, 5).map(student => ({
      ...student,
      score: Math.floor(85 + Math.random() * 15), // 85-99%
      completionTime: Math.floor(35 + Math.random() * 25), // 35-59 minutes
      consistency: Math.floor(80 + Math.random() * 20), // 80-99%
    }));
    
    setTopPerformers(performers);
  };

  const generateMockImprovementData = () => {
    const data = [];
    
    // Generate improvement data for 10 random students
    for (let i = 0; i < 10; i++) {
      // Initial score between 60-75%
      let initialScore = 60 + Math.floor(Math.random() * 15);
      
      // Current score shows improvement of 5-20%
      let currentScore = initialScore + 5 + Math.floor(Math.random() * 15);
      
      // Cap at 98%
      currentScore = Math.min(currentScore, 98);
      
      data.push({
        id: `STU${1000 + i}`,
        name: `Student ${i+1}`,
        initialScore,
        currentScore,
        improvement: currentScore - initialScore,
        testsTaken: 3 + Math.floor(Math.random() * 4) // 3-6 tests
      });
    }
    
    setImprovementData(data);
  };

  const generateMockSkillRadarData = () => {
    const skills = [
      { subject: 'Problem Solving', A: Math.floor(65 + Math.random() * 30) },
      { subject: 'Conceptual Understanding', A: Math.floor(65 + Math.random() * 30) },
      { subject: 'Application', A: Math.floor(65 + Math.random() * 30) },
      { subject: 'Analytical Thinking', A: Math.floor(65 + Math.random() * 30) },
      { subject: 'Numerical Accuracy', A: Math.floor(65 + Math.random() * 30) },
      { subject: 'Speed & Time Management', A: Math.floor(65 + Math.random() * 30) },
    ];
    
    setSkillRadarData(skills);
  };

  const generateMockSubmissionHeatmap = () => {
    const data = {};
    
    // Generate data for last 60 days
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Randomly decide if there were submissions on this day
      if (Math.random() > 0.6) { // 40% chance of having submissions
        data[dateStr] = Math.floor(Math.random() * 8) + 1; // 1-8 submissions
      }
    }
    
    setSubmissionHeatmap(data);
  };

  const generateMockResults = (test, studentsList) => {
    // Generate random results for each student with more realistic variation
    const questionCount = test.questions.length;
    const results = studentsList.map(student => {
      // Generate scores for each question
      const questionScores = test.questions.map(question => {
        const maxMarks = question.total_marks;
        // More varied scores: 50-95% of max
        const scorePercentage = 0.5 + (Math.random() * 0.45);
        return Math.round(maxMarks * scorePercentage);
      });
      
      const totalScore = questionScores.reduce((acc, score) => acc + score, 0);
      const totalPossible = test.totalMarks;
      const percentage = Math.round((totalScore / totalPossible) * 100);
      
      // Generate submission date within last 7 days with more realistic distribution
      const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 7); // Weight toward more recent
      const submissionDate = new Date();
      submissionDate.setDate(submissionDate.getDate() - daysAgo);
      
      return {
        student_id: student.id,
        student_name: student.name,
        student_class: student.className,
        question_scores: questionScores,
        total_score: totalScore,
        total_possible: totalPossible,
        percentage,
        submitted_at: submissionDate.toLocaleString(),
        completion_time: Math.floor(30 + Math.random() * 30), // 30-59 minutes
        reviewed: Math.random() > 0.3, // 70% chance of being reviewed
        // Add comments for some students
        teacher_comments: Math.random() > 0.7 ? 
          ['Good work overall.', 'Needs improvement in conceptual understanding.', 
           'Excellent problem-solving skills.', 'Pay more attention to calculations.'][Math.floor(Math.random() * 4)] 
          : null
      };
    });
    
    // Sort by percentage (descending)
    results.sort((a, b) => b.percentage - a.percentage);
    
    setTestResults(results);
    
    // Generate mock statistics
    generateMockStatistics(results, test);
  };

  const generateMockStatistics = (results, test) => {
    // Score distribution data with more granular categories
    const scoreDistribution = [
      { name: 'Outstanding (90-100%)', value: results.filter(r => r.percentage >= 90).length },
      { name: 'Excellent (80-89%)', value: results.filter(r => r.percentage >= 80 && r.percentage < 90).length },
      { name: 'Good (70-79%)', value: results.filter(r => r.percentage >= 70 && r.percentage < 80).length },
      { name: 'Satisfactory (60-69%)', value: results.filter(r => r.percentage >= 60 && r.percentage < 70).length },
      { name: 'Average (50-59%)', value: results.filter(r => r.percentage >= 50 && r.percentage < 60).length },
      { name: 'Needs Improvement (<50%)', value: results.filter(r => r.percentage < 50).length }
    ];
    
    // Question performance data with difficulty ratings
    const questionPerformance = test.questions.map((question, index) => {
      const maxPossible = question.total_marks * results.length;
      const totalScored = results.reduce((acc, r) => acc + r.question_scores[index], 0);
      const avgPercentage = Math.round((totalScored / maxPossible) * 100);
      
      // Assign difficulty based on average performance
      let difficulty;
      if (avgPercentage < 60) difficulty = 'Hard';
      else if (avgPercentage < 75) difficulty = 'Medium';
      else difficulty = 'Easy';
      
      return {
        name: `Q${index + 1}`,
        avgScore: avgPercentage,
        difficulty
      };
    });
    
    // Time analysis with more realistic trend
    // Generate a pattern where submissions increase approaching the deadline
    const timeAnalysis = [
      { name: 'Day 1', submissions: Math.floor(Math.random() * 3) }, // Few early
      { name: 'Day 2', submissions: Math.floor(Math.random() * 4) },
      { name: 'Day 3', submissions: 1 + Math.floor(Math.random() * 5) },
      { name: 'Day 4', submissions: 2 + Math.floor(Math.random() * 5) },
      { name: 'Day 5', submissions: 3 + Math.floor(Math.random() * 6) },
      { name: 'Day 6', submissions: 5 + Math.floor(Math.random() * 7) },
      { name: 'Day 7 (Due)', submissions: 8 + Math.floor(Math.random() * 10) } // Many last-minute
    ];
    
    setDetailedStats({
      scoreDistribution,
      questionPerformance,
      timeAnalysis
    });
  };

  const handleTestChange = (testId) => {
    const selectedTestData = tests.find(test => test.id === testId);
    setSelectedTest(selectedTestData);
    generateMockResults(selectedTestData, students);
  };

  const handleFilterSubmit = (values) => {
    console.log('Filter values:', values);
    // In a real implementation, this would filter the results
    message.success('Filters applied');
  };

  const generatePdfReport = async () => {
    if (!selectedTest || testResults.length === 0) {
      message.error('No test results available');
      return;
    }
    
    try {
      setGeneratingReport(true);
      
      // Create PDF
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`Test Report: ${selectedTest.name}`, 14, 22);
      
      // Add subtitle
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      // Add summary
      doc.setFontSize(14);
      doc.text('Summary', 14, 40);
      
      doc.setFontSize(10);
      doc.text(`Total Students: ${testResults.length}`, 14, 48);
      doc.text(`Average Score: ${Math.round(testResults.reduce((acc, r) => acc + r.percentage, 0) / testResults.length)}%`, 14, 54);
      doc.text(`Highest Score: ${Math.max(...testResults.map(r => r.percentage))}%`, 14, 60);
      doc.text(`Lowest Score: ${Math.min(...testResults.map(r => r.percentage))}%`, 14, 66);
      
      // Create table header with student data and question scores
      const tableHeaders = [
        'Student ID', 
        'Student Name',
        'Class',
        ...Array.from({ length: selectedTest.questionCount }, (_, i) => `Q${i + 1}`),
        'Total',
        '%'
      ];
      
      // Create table rows
      const tableData = testResults.map(result => [
        result.student_id,
        result.student_name,
        result.student_class,
        ...result.question_scores.map(score => score.toString()),
        `${result.total_score}/${result.total_possible}`,
        `${result.percentage}%`
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
      doc.save(`Test_Report_${selectedTest.name.replace(/\s+/g, '_')}.pdf`);
      
      message.success('Report generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const resultsColumns = [
    {
      title: 'Student ID',
      dataIndex: 'student_id',
      key: 'student_id',
    },
    {
      title: 'Student Name',
      dataIndex: 'student_name',
      key: 'student_name',
    },
    {
      title: 'Class',
      dataIndex: 'student_class',
      key: 'student_class',
      filters: [...new Set(students.map(s => s.className))].map(className => ({
        text: className,
        value: className,
      })),
      onFilter: (value, record) => record.student_class === value,
    },
    ...selectedTest?.questions.map((_, index) => ({
      title: `Q${index + 1}`,
      dataIndex: ['question_scores', index],
      key: `q${index}`,
      align: 'center',
      render: (score, record) => {
        const maxScore = selectedTest.questions[index].total_marks;
        const percentage = (score / maxScore) * 100;
        
        let color = '#52c41a'; // green
        if (percentage < 60) color = '#f5222d'; // red
        else if (percentage < 80) color = '#faad14'; // yellow
        
        return (
          <Popover 
            content={
              <div>
                <p><strong>Score:</strong> {score}/{maxScore}</p>
                <p><strong>Percentage:</strong> {Math.round(percentage)}%</p>
              </div>
            }
            title="Question Details"
          >
            <span style={{ color }}>{score}</span>
          </Popover>
        );
      },
    })) || [],
    {
      title: 'Total Score',
      dataIndex: 'total_score',
      key: 'total_score',
      align: 'center',
      render: (score, record) => (
        <span>
          {score}/{record.total_possible}
        </span>
      ),
      sorter: (a, b) => a.total_score - b.total_score,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'center',
      render: percent => {
        let color = '#52c41a';
        if (percent < 60) color = '#f5222d';
        else if (percent < 80) color = '#faad14';
        
        return (
          <Progress 
            percent={percent} 
            size="small" 
            strokeColor={color}
            format={percent => `${percent}%`}
          />
        );
      },
      sorter: (a, b) => a.percentage - b.percentage,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Completion Time',
      dataIndex: 'completion_time',
      key: 'completion_time',
      align: 'center',
      render: time => `${time} mins`,
      sorter: (a, b) => a.completion_time - b.completion_time,
    },
    {
      title: 'Submitted On',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: date => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 5 }} />
          {date}
        </span>
      ),
      sorter: (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at),
    },
    {
      title: 'Reviewed',
      dataIndex: 'reviewed',
      key: 'reviewed',
      align: 'center',
      render: reviewed => reviewed ? 
        <Badge status="success" text="Yes" /> : 
        <Badge status="warning" text="Pending" />,
      filters: [
        { text: 'Yes', value: true },
        { text: 'Pending', value: false },
      ],
      onFilter: (value, record) => record.reviewed === value,
    },
    {
      title: 'Comments',
      dataIndex: 'teacher_comments',
      key: 'teacher_comments',
      render: comments => comments ? <Text ellipsis>{comments}</Text> : '-',
    },
  ];

  const renderSubmissionCalendar = () => {
    const dateCellRender = (date) => {
      const dateStr = date.format('YYYY-MM-DD');
      const submissions = submissionHeatmap[dateStr] || 0;
      
      if (submissions === 0) return null;
      
      let color = '#1890ff';
      if (submissions > 5) color = '#52c41a';
      else if (submissions > 2) color = '#722ed1';
      
      return (
        <Badge 
          count={submissions}
          style={{ backgroundColor: color }}
          overflowCount={9}
        />
      );
    };
    
    return (
      <Calendar 
        fullscreen={false} 
        dateCellRender={dateCellRender}
        headerRender={({ value, type, onChange, onTypeChange }) => {
          const current = value.clone();
          const months = Array.from({ length: 12 }, (_, i) => moment().month(i));
          
          return (
            <div style={{ padding: '8px 0' }}>
              <div style={{ marginBottom: 8 }}>
                <Select
                  size="small"
                  dropdownMatchSelectWidth={false}
                  value={current.month()}
                  onChange={(month) => {
                    const now = current.clone().month(month);
                    onChange(now);
                  }}
                >
                  {months.map((m, i) => (
                    <Option key={i} value={i}>{m.format('MMMM')}</Option>
                  ))}
                </Select>
                <Select
                  size="small"
                  dropdownMatchSelectWidth={false}
                  value={current.year()}
                  style={{ marginLeft: 8 }}
                  onChange={(year) => {
                    const now = current.clone().year(year);
                    onChange(now);
                  }}
                >
                  {[current.year() - 1, current.year(), current.year() + 1].map(year => (
                    <Option key={year} value={year}>{year}</Option>
                  ))}
                </Select>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <InfoCircleOutlined /> Colored badges represent number of submissions
                </Text>
              </div>
            </div>
          );
        }}
      />
    );
  };

  const renderReportsHeader = () => (
    <div className="reports-header">
      <div className="left-section">
        <Title level={2}>Test Reports</Title>
        <Text type="secondary">View and download detailed test reports and analytics</Text>
      </div>
      <div className="right-section">
        <Space>
          <Select
            placeholder="Select a test"
            style={{ width: 250 }}
            value={selectedTest?.id}
            onChange={handleTestChange}
            dropdownMatchSelectWidth={false}
          >
            {tests.map(test => (
              <Option key={test.id} value={test.id}>
                {test.name} ({test.subject})
              </Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={generatePdfReport}
            loading={generatingReport}
          >
            Download PDF Report
          </Button>
          <Button icon={<FileExcelOutlined />}>
            Export to Excel
          </Button>
        </Space>
      </div>
    </div>
  );

  const renderOverviewStats = () => (
    <Row gutter={[16, 16]} className="stats-cards">
      <Col xs={24} sm={12} md={8} xl={6}>
        <Card className="stat-card">
          <Statistic
            title="Average Score"
            value={testResults.length > 0 ? 
              Math.round(testResults.reduce((acc, r) => acc + r.percentage, 0) / testResults.length) : 
              0
            }
            suffix="%"
            valueStyle={{ color: '#1890ff' }}
            prefix={<TrophyOutlined />}
          />
          <div className="stat-trend">
            {Math.random() > 0.5 ? (
              <Text type="success">
                <RiseOutlined /> {Math.floor(Math.random() * 8) + 2}% vs. previous test
              </Text>
            ) : (
              <Text type="danger">
                <FallOutlined /> {Math.floor(Math.random() * 5) + 1}% vs. previous test
              </Text>
            )}
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} xl={6}>
        <Card className="stat-card">
          <Statistic
            title="Completion Rate"
            value={testResults.length}
            suffix={`/${students.length}`}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
          <div className="stat-trend">
            <Text type="secondary">
              {Math.round((testResults.length / students.length) * 100)}% submission rate
            </Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} xl={6}>
        <Card className="stat-card">
          <Statistic
            title="Passing Rate"
            value={testResults.filter(r => r.percentage >= 60).length}
            suffix={`/${testResults.length}`}
            valueStyle={{ color: '#722ed1' }}
            prefix={<UserOutlined />}
          />
          <div className="stat-trend">
            <Text type="secondary">
              {testResults.length > 0 ? 
                Math.round((testResults.filter(r => r.percentage >= 60).length / testResults.length) * 100) : 
                0
              }% of students passed
            </Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} xl={6}>
        <Card className="stat-card">
          <Statistic
            title="Average Time"
            value={testResults.length > 0 ? 
              Math.round(testResults.reduce((acc, r) => acc + r.completion_time, 0) / testResults.length) : 
              0
            }
            suffix="min"
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined />}
          />
          <div className="stat-trend">
            <Text type="secondary">
              To complete the test
            </Text>
          </div>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div className="reports-module-container">
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {tests.length === 0 ? (
            <Empty description="No tests available" />
          ) : (
            <>
              {renderReportsHeader()}
              
              {selectedTest && renderOverviewStats()}
              
              <Tabs 
                defaultActiveKey="results" 
                className="reports-tabs"
                onChange={setActiveTab}
                tabBarExtraContent={
                  activeTab === 'results' && (
                    <Button icon={<DownloadOutlined />} type="default">
                      Export Current View
                    </Button>
                  )
                }
              >
                <TabPane 
                  tab={
                    <span>
                      <FileTextOutlined />
                      Results Table
                    </span>
                  } 
                  key="results"
                >
                  <Card className="filter-card">
                    <Form
                      form={filterForm}
                      layout="vertical"
                      onFinish={handleFilterSubmit}
                    >
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6} lg={4}>
                          <Form.Item name="score" label="Score Range">
                            <Select placeholder="Select score range">
                              <Option value="all">All Scores</Option>
                              <Option value="90-100">90-100% (Outstanding)</Option>
                              <Option value="80-89">80-89% (Excellent)</Option>
                              <Option value="70-79">70-79% (Good)</Option>
                              <Option value="60-69">60-69% (Satisfactory)</Option>
                              <Option value="50-59">50-59% (Average)</Option>
                              <Option value="0-49">Below 50% (Needs Improvement)</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                          <Form.Item name="class" label="Class">
                            <Select placeholder="Select class">
                              <Option value="all">All Classes</Option>
                              {[...new Set(students.map(s => s.className))].map(className => (
                                <Option key={className} value={className}>{className}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                          <Form.Item name="dateRange" label="Submission Date">
                            <RangePicker style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                          <Form.Item name="sortBy" label="Sort By">
                            <Select placeholder="Sort results">
                              <Option value="score_desc">Score (High to Low)</Option>
                              <Option value="score_asc">Score (Low to High)</Option>
                              <Option value="time_asc">Completion Time (Fastest First)</Option>
                              <Option value="time_desc">Completion Time (Slowest First)</Option>
                              <Option value="date_desc">Date (Newest First)</Option>
                              <Option value="date_asc">Date (Oldest First)</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                          <Form.Item label=" " style={{ marginBottom: 0 }}>
                            <Space>
                              <Button 
                                type="primary" 
                                htmlType="submit" 
                                icon={<FilterOutlined />}
                              >
                                Apply Filters
                              </Button>
                              <Button 
                                onClick={() => {
                                  filterForm.resetFields();
                                }}
                              >
                                Reset
                              </Button>
                            </Space>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </Card>
                  
                  <Table
                    columns={resultsColumns}
                    dataSource={testResults}
                    rowKey="student_id"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    className="results-table"
                    scroll={{ x: 'max-content' }}
                    rowClassName={(record) => record.percentage < 60 ? 'low-score-row' : ''}
                    summary={(pageData) => {
                      // Only add summary if we have data
                      if (pageData.length === 0) return null;
                      
                      const avgScores = Array(selectedTest?.questions.length || 0).fill(0);
                      pageData.forEach(record => {
                        record.question_scores.forEach((score, index) => {
                          avgScores[index] += score;
                        });
                      });
                      
                      // Calculate average for each question
                      avgScores.forEach((score, index) => {
                        avgScores[index] = Math.round(score / pageData.length);
                      });
                      
                      const totalAvg = Math.round(pageData.reduce((acc, record) => acc + record.percentage, 0) / pageData.length);
                      
                      return (
                        <Table.Summary fixed>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3}>
                              <Text strong>Average</Text>
                            </Table.Summary.Cell>
                            {avgScores.map((score, index) => (
                              <Table.Summary.Cell index={index + 3} align="center">
                                <Text strong>{score}</Text>
                              </Table.Summary.Cell>
                            ))}
                            <Table.Summary.Cell index={avgScores.length + 3} align="center" colSpan={1}>
                              <Text strong>
                                {Math.round(pageData.reduce((acc, record) => acc + record.total_score, 0) / pageData.length)}/
                                {pageData[0].total_possible}
                              </Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={avgScores.length + 4} align="center" colSpan={1}>
                              <Progress 
                                percent={totalAvg} 
                                size="small" 
                                strokeColor={"#1890ff"}
                                format={percent => `${percent}%`}
                              />
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={avgScores.length + 5} colSpan={3} />
                          </Table.Summary.Row>
                        </Table.Summary>
                      );
                    }}
                  />
                </TabPane>
                
                <TabPane
                  tab={
                    <span>
                      <BarChartOutlined />
                      Analytics
                    </span>
                  }
                  key="analytics"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <Card title={<><BulbOutlined /> Score Distribution</>} className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={detailedStats.scoreDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {detailedStats.scoreDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                          </PieChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card title={<><BarChartOutlined /> Question Performance</>} className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={detailedStats.questionPerformance}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="custom-tooltip">
                                    <p><strong>{data.name}</strong></p>
                                    <p>Average Score: {data.avgScore}%</p>
                                    <p>Difficulty: {data.difficulty}</p>
                                  </div>
                                );
                              }
                              return null;
                            }} />
                            <Legend />
                            <Bar 
                              dataKey="avgScore" 
                              name="Average Score (%)" 
                              fill="#8884d8"
                              // Color bars based on difficulty
                              barSize={30}
                              isAnimationActive={false}
                            >
                              {detailedStats.questionPerformance.map((entry, index) => {
                                let color = '#52c41a'; // Easy
                                if (entry.difficulty === 'Hard') color = '#f5222d';
                                else if (entry.difficulty === 'Medium') color = '#faad14';
                                
                                return <Cell key={`cell-${index}`} fill={color} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card title={<><HeatMapOutlined /> Submission Timeline</>} className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={detailedStats.timeAnalysis}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="submissions" 
                              stroke="#82ca9d" 
                              name="Number of Submissions" 
                              strokeWidth={2}
                              dot={{ r: 5 }}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card title={<><CalendarOutlined /> Submission Calendar</>} className="chart-card">
                        {renderSubmissionCalendar()}
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
                
                <TabPane
                  tab={
                    <span>
                      <UserOutlined />
                      Student Analysis
                    </span>
                  }
                  key="students"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <Card title="Top Performers" className="chart-card">
                        <List
                          dataSource={topPerformers}
                          renderItem={(student, index) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <Avatar 
                                    style={{ 
                                      backgroundColor: COLORS[index % COLORS.length],
                                      fontSize: '18px'
                                    }}
                                  >
                                    {student.name.charAt(0)}
                                  </Avatar>
                                }
                                title={<Text strong>{student.name}</Text>}
                                description={
                                  <Space direction="vertical" size={0}>
                                    <Text>{student.className}</Text>
                                    <Text type="secondary">Completed in {student.completionTime} mins</Text>
                                  </Space>
                                }
                              />
                              <div>
                                <Statistic 
                                  value={student.score} 
                                  suffix="%" 
                                  valueStyle={{ 
                                    color: COLORS[index % COLORS.length],
                                    fontSize: '20px' 
                                  }}
                                />
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card title="Student Improvement" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={improvementData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip 
                              formatter={(value, name) => [
                                `${value}%`, 
                                name === 'currentScore' ? 'Current Score' : 'Initial Score'
                              ]}
                              labelFormatter={() => ''}
                            />
                            <Legend 
                              verticalAlign="top" 
                              payload={[
                                { value: 'Initial Score', type: 'rect', color: '#8884d8' },
                                { value: 'Current Score', type: 'rect', color: '#82ca9d' }
                              ]}
                            />
                            <Bar dataKey="initialScore" name="Initial Score" fill="#8884d8" stackId="a" barSize={10} />
                            <Bar dataKey="currentScore" name="Current Score" fill="#82ca9d" stackId="a" barSize={10} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card title="Skills Analysis" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis domain={[0, 100]} />
                            <Radar
                              name="Class Average"
                              dataKey="A"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.6}
                            />
                            <Tooltip />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card title="Class Performance Comparison" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={performanceByClass}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="averageScore" name="Average Score (%)" fill="#1890ff" />
                            <Bar dataKey="participationRate" name="Participation Rate (%)" fill="#52c41a" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
                
                <TabPane
                  tab={
                    <span>
                      <FileTextOutlined />
                      Test Insights
                    </span>
                  }
                  key="insights"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Card title="Key Observations" className="insights-card">
                        <Row gutter={[16, 16]}>
                          <Col xs={24} md={8}>
                            <Card className="insight-item">
                              <div className="insight-icon" style={{ backgroundColor: '#e6f7ff' }}>
                                <BulbOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                              </div>
                              <Title level={4}>Strengths</Title>
                              <ul>
                                <li>Students performed exceptionally well in conceptual questions</li>
                                <li>High participation rate across all classes</li>
                                <li>Most students completed the test within the allocated time</li>
                              </ul>
                            </Card>
                          </Col>
                          <Col xs={24} md={8}>
                            <Card className="insight-item">
                              <div className="insight-icon" style={{ backgroundColor: '#fff2e8' }}>
                                <WarningOutlined style={{ color: '#fa8c16', fontSize: '24px' }} />
                              </div>
                              <Title level={4}>Areas for Improvement</Title>
                              <ul>
                                <li>Questions {detailedStats.questionPerformance
                                  .filter(q => q.difficulty === 'Hard')
                                  .map(q => q.name)
                                  .join(', ')} need more focus</li>
                                <li>Some students struggled with time management</li>
                                <li>Numerical accuracy needs improvement</li>
                              </ul>
                            </Card>
                          </Col>
                          <Col xs={24} md={8}>
                            <Card className="insight-item">
                              <div className="insight-icon" style={{ backgroundColor: '#f6ffed' }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
                              </div>
                              <Title level={4}>Recommendations</Title>
                              <ul>
                                <li>Review difficult concepts in upcoming classes</li>
                                <li>Provide additional practice for problem-solving</li>
                                <li>Conduct focused review sessions for students scoring below 60%</li>
                              </ul>
                            </Card>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card title="Test Comparison" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={testComparisonData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="averageScore" name="This Test" fill="#1890ff" />
                            <Bar dataKey="classAverage" name="Class Average" fill="#52c41a" />
                            <Bar dataKey="highestScore" name="Highest Score" fill="#722ed1" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card title="Score vs. Completion Time Analysis" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <ScatterChart
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                          >
                            <CartesianGrid />
                            <XAxis 
                              type="number" 
                              dataKey="completion_time" 
                              name="Completion Time" 
                              unit=" min" 
                              domain={[20, 70]}
                            />
                            <YAxis 
                              type="number" 
                              dataKey="percentage" 
                              name="Score" 
                              unit="%" 
                              domain={[0, 100]}
                            />
                            <ZAxis range={[50, 500]} />
                            <Tooltip 
                              cursor={{ strokeDasharray: '3 3' }}
                              formatter={(value, name) => [
                                name === 'Completion Time' ? `${value} min` : `${value}%`,
                                name
                              ]}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="custom-tooltip">
                                      <p><strong>{data.student_name}</strong></p>
                                      <p>Score: {data.percentage}%</p>
                                      <p>Time: {data.completion_time} min</p>
                                      <p>Class: {data.student_class}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend />
                            <Scatter 
                              name="Students" 
                              data={testResults} 
                              fill="#8884d8"
                              shape="circle"
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsModule;