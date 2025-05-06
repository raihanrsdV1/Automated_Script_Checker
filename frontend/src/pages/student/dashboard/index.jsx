import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Spin, Empty, Progress, Typography } from 'antd';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';
import { API_URL } from '../../../config';
import './style.css';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [testHistory, setTestHistory] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchTestHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/submissions/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Process the data for visualization
        const history = response.data.submissions.map(submission => {
          // Calculate score as 70% of total possible marks (as specified in requirements)
          const totalMarks = submission.questions.reduce((acc, q) => acc + q.total_marks, 0);
          const score = Math.round(totalMarks * 0.7);
          
          return {
            ...submission,
            score,
            percentage: Math.round((score / totalMarks) * 100),
            submittedAt: new Date(submission.submitted_at).toLocaleString()
          };
        });
        
        setTestHistory(history);
        
        // Prepare performance data for the line chart
        const performanceByDate = history.map(test => ({
          name: new Date(test.submitted_at).toLocaleDateString(),
          score: test.percentage
        }));
        
        setPerformanceData(performanceByDate);
        
        // Prepare data for pie chart
        const scoreDistribution = [
          { name: 'Excellent (90-100%)', value: history.filter(t => t.percentage >= 90).length },
          { name: 'Good (80-89%)', value: history.filter(t => t.percentage >= 80 && t.percentage < 90).length },
          { name: 'Average (70-79%)', value: history.filter(t => t.percentage >= 70 && t.percentage < 80).length },
          { name: 'Below Average (60-69%)', value: history.filter(t => t.percentage >= 60 && t.percentage < 70).length },
          { name: 'Poor (Below 60%)', value: history.filter(t => t.percentage < 60).length }
        ];
        
        setPieData(scoreDistribution);
        
      } catch (error) {
        console.error('Error fetching test history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestHistory();
  }, []);

  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'test_name',
      key: 'test_name',
    },
    {
      title: 'Date',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score, record) => `${score}/${record.questions.reduce((acc, q) => acc + q.total_marks, 0)}`,
    },
    {
      title: 'Performance',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => (
        <Progress 
          percent={percentage} 
          status={percentage < 60 ? 'exception' : 'active'} 
          strokeColor={
            percentage >= 90 ? '#52c41a' :
            percentage >= 80 ? '#1890ff' :
            percentage >= 70 ? '#faad14' :
            percentage >= 60 ? '#fa8c16' : '#f5222d'
          }
        />
      ),
    },
  ];

  return (
    <div className="student-dashboard">
      <Title level={2}>Student Dashboard</Title>
      <Text type="secondary">Track your performance and view your test history</Text>
      
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {testHistory.length === 0 ? (
            <Empty description="No test history available" />
          ) : (
            <>
              <Row gutter={[16, 16]} className="stats-cards">
                <Col xs={24} sm={12} md={8} lg={8}>
                  <Card>
                    <div className="stat-card">
                      <div className="stat-value">{testHistory.length}</div>
                      <div className="stat-label">Tests Taken</div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8}>
                  <Card>
                    <div className="stat-card">
                      <div className="stat-value">
                        {testHistory.length > 0 ? 
                          `${Math.round(testHistory.reduce((acc, test) => acc + test.percentage, 0) / testHistory.length)}%` : 
                          'N/A'}
                      </div>
                      <div className="stat-label">Average Score</div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8}>
                  <Card>
                    <div className="stat-card">
                      <div className="stat-value">
                        {testHistory.length > 0 ? 
                          `${Math.max(...testHistory.map(test => test.percentage))}%` : 
                          'N/A'}
                      </div>
                      <div className="stat-label">Highest Score</div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="chart-section">
                <Col xs={24} lg={12}>
                  <Card title="Performance Over Time" className="chart-card">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={performanceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} name="Score (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Score Distribution" className="chart-card">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>

              <Card title="Test History" className="test-history-table">
                <Table
                  dataSource={testHistory}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StudentDashboard;