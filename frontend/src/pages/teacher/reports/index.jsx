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
  message
} from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  FilterOutlined,
  PrinterOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import axios from 'axios';
import { API_URL } from '../../../config';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './style.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ReportsModule = () => {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);
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
        
        // Fetch tests
        const testsResponse = await axios.get(`${API_URL}/questions/sets`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Process test data
        const testsData = testsResponse.data.question_sets.map(test => ({
          id: test.id,
          name: test.name || `Test ${test.id}`,
          description: test.description || 'No description available',
          questionCount: test.questions.length,
          createdAt: new Date(test.created_at).toLocaleString(),
          totalMarks: test.questions.reduce((acc, q) => acc + q.total_marks, 0),
          questions: test.questions
        }));
        
        setTests(testsData);
        
        // Mock student data
        const mockStudents = Array.from({ length: 20 }, (_, i) => ({
          id: `STU${1000 + i}`,
          name: `Student ${i + 1}`,
          email: `student${i + 1}@example.com`,
        }));
        
        setStudents(mockStudents);
        
        // Generate mock test results if any tests exist
        if (testsData.length > 0) {
          generateMockResults(testsData[0], mockStudents);
          setSelectedTest(testsData[0]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to load report data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const generateMockResults = (test, studentsList) => {
    // Generate random results for each student
    const questionCount = test.questions.length;
    const results = studentsList.map(student => {
      // Generate scores for each question
      const questionScores = test.questions.map(question => {
        const maxMarks = question.total_marks;
        // 70% of max as specified in requirements
        return Math.round(maxMarks * 0.7);
      });
      
      const totalScore = questionScores.reduce((acc, score) => acc + score, 0);
      const totalPossible = test.totalMarks;
      const percentage = Math.round((totalScore / totalPossible) * 100);
      
      return {
        student_id: student.id,
        student_name: student.name,
        question_scores: questionScores,
        total_score: totalScore,
        total_possible: totalPossible,
        percentage,
        submitted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString()
      };
    });
    
    // Sort by percentage (descending)
    results.sort((a, b) => b.percentage - a.percentage);
    
    setTestResults(results);
    
    // Generate mock statistics
    generateMockStatistics(results, test);
  };

  const generateMockStatistics = (results, test) => {
    // Score distribution data
    const scoreDistribution = [
      { name: 'Excellent (90-100%)', value: results.filter(r => r.percentage >= 90).length },
      { name: 'Good (80-89%)', value: results.filter(r => r.percentage >= 80 && r.percentage < 90).length },
      { name: 'Average (70-79%)', value: results.filter(r => r.percentage >= 70 && r.percentage < 80).length },
      { name: 'Below Average (60-69%)', value: results.filter(r => r.percentage >= 60 && r.percentage < 70).length },
      { name: 'Poor (Below 60%)', value: results.filter(r => r.percentage < 60).length }
    ];
    
    // Question performance data
    const questionPerformance = test.questions.map((question, index) => {
      const maxPossible = question.total_marks * results.length;
      const totalScored = results.reduce((acc, r) => acc + r.question_scores[index], 0);
      const avgPercentage = Math.round((totalScored / maxPossible) * 100);
      
      return {
        name: `Q${index + 1}`,
        avgScore: avgPercentage
      };
    });
    
    // Time analysis (mocked - would be based on actual submission times)
    const timeAnalysis = [
      { name: 'Day 1', submissions: 5 },
      { name: 'Day 2', submissions: 8 },
      { name: 'Day 3', submissions: 4 },
      { name: 'Day 4', submissions: 2 },
      { name: 'Day 5', submissions: 1 }
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
        ...Array.from({ length: selectedTest.questionCount }, (_, i) => `Q${i + 1}`),
        'Total',
        '%'
      ];
      
      // Create table rows
      const tableData = testResults.map(result => [
        result.student_id,
        result.student_name,
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
    ...selectedTest?.questions.map((_, index) => ({
      title: `Q${index + 1}`,
      dataIndex: ['question_scores', index],
      key: `q${index}`,
      align: 'center',
      render: score => score || 0,
    })) || [],
    {
      title: 'Total Score',
      dataIndex: 'total_score',
      key: 'total_score',
      align: 'center',
      render: (score, record) => `${score}/${record.total_possible}`,
      sorter: (a, b) => a.total_score - b.total_score,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'center',
      render: percent => `${percent}%`,
      sorter: (a, b) => a.percentage - b.percentage,
    },
    {
      title: 'Submitted On',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
    },
  ];

  return (
    <div className="reports-module-container">
      <Title level={2}>Test Reports</Title>
      <Text type="secondary">View and download detailed test reports</Text>
      
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
              <Card className="reports-controls-card">
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} md={12} lg={8}>
                    <Form.Item label="Select Test" style={{ marginBottom: 0 }}>
                      <Select
                        placeholder="Select a test"
                        style={{ width: '100%' }}
                        value={selectedTest?.id}
                        onChange={handleTestChange}
                      >
                        {tests.map(test => (
                          <Option key={test.id} value={test.id}>{test.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<DownloadOutlined />} 
                        onClick={generatePdfReport}
                        loading={generatingReport}
                      >
                        Download Report
                      </Button>
                      <Button icon={<PrinterOutlined />}>
                        Print Report
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
              
              <Tabs defaultActiveKey="results" className="reports-tabs">
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
                        <Col xs={24} sm={12} md={8} lg={6}>
                          <Form.Item name="score" label="Score Range">
                            <Radio.Group>
                              <Radio.Button value="all">All</Radio.Button>
                              <Radio.Button value="pass">Passing</Radio.Button>
                              <Radio.Button value="fail">Failing</Radio.Button>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                          <Form.Item name="dateRange" label="Submission Date">
                            <RangePicker style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                          <Form.Item name="sortBy" label="Sort By">
                            <Select placeholder="Sort results">
                              <Option value="score_desc">Score (High to Low)</Option>
                              <Option value="score_asc">Score (Low to High)</Option>
                              <Option value="date_desc">Date (Newest First)</Option>
                              <Option value="date_asc">Date (Oldest First)</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                          <Form.Item label=" " style={{ marginBottom: 0 }}>
                            <Button 
                              type="primary" 
                              htmlType="submit" 
                              icon={<FilterOutlined />}
                            >
                              Apply Filters
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </Card>
                  
                  <Table
                    columns={resultsColumns}
                    dataSource={testResults}
                    rowKey="student_id"
                    pagination={{ pageSize: 10 }}
                    className="results-table"
                    scroll={{ x: 'max-content' }}
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
                      <Card title="Score Distribution" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={detailedStats.scoreDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {detailedStats.scoreDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card title="Question Performance" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={detailedStats.questionPerformance}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="avgScore" name="Average Score (%)" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card title="Submission Timeline" className="chart-card">
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
                            />
                          </LineChart>
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