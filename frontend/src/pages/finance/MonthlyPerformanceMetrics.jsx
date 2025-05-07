import React from 'react';
import { Card, Typography, Row, Col, Table, Tag, Tooltip } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Zap } from 'lucide-react';

const { Title, Paragraph } = Typography;

// Dummy data for performance metrics
const performanceData = [
  { month: 'Jan', throughput: 12000, avgResponseTime: 8.2, costPerEval: 0.07 },
  { month: 'Feb', throughput: 15000, avgResponseTime: 7.8, costPerEval: 0.068 },
  { month: 'Mar', throughput: 18000, avgResponseTime: 7.5, costPerEval: 0.065 },
  { month: 'Apr', throughput: 22000, avgResponseTime: 7.2, costPerEval: 0.062 },
  { month: 'May', throughput: 25000, avgResponseTime: 6.9, costPerEval: 0.06 },
  { month: 'Jun', throughput: 30000, avgResponseTime: 6.6, costPerEval: 0.058 },
];

// Table data for performance details
const tableData = [
  {
    key: '1',
    metric: 'Maximum Daily Throughput',
    value: '10,000 scripts',
    impact: 'High',
    notes: 'Based on NVIDIA A100 processing capacity with batched inference',
  },
  {
    key: '2',
    metric: 'Average Evaluation Time',
    value: '6.6 seconds',
    impact: 'Medium',
    notes: 'Depends on script length; highly optimized for standard exam formats',
  },
  {
    key: '3',
    metric: 'Concurrent Users',
    value: '500+',
    impact: 'Medium',
    notes: 'Limited by web server capacity, not GPU processing',
  },
  {
    key: '4',
    metric: 'Operational Cost Per Script',
    value: '$0.058',
    impact: 'High',
    notes: 'Decreases with higher volume due to fixed infrastructure costs',
  },
  {
    key: '5',
    metric: 'Model Loading Time',
    value: '12 seconds',
    impact: 'Low',
    notes: 'Only impacts cold starts; models remain loaded in memory',
  },
];

// Column definitions for the performance metrics table
const columns = [
  {
    title: 'Performance Metric',
    dataIndex: 'metric',
    key: 'metric',
  },
  {
    title: 'Current Value',
    dataIndex: 'value',
    key: 'value',
  },
  {
    title: 'Financial Impact',
    dataIndex: 'impact',
    key: 'impact',
    render: (impact) => {
      let color = 'green';
      if (impact === 'High') {
        color = 'red';
      } else if (impact === 'Medium') {
        color = 'orange';
      }
      return <Tag color={color}>{impact}</Tag>;
    },
  },
  {
    title: 'Notes',
    dataIndex: 'notes',
    key: 'notes',
  },
];

const MonthlyPerformanceMetrics = () => {
  return (
    <Card title={<div><TrendingUp size={16} style={{ marginRight: '8px' }} />System Performance Metrics</div>} style={{ marginBottom: '20px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Paragraph>
            Performance metrics showing processing capacity and efficiency trends over time. 
            These metrics directly impact the financial viability of the on-premises infrastructure.
          </Paragraph>
        </Col>
        
        <Col span={24}>
          <Card title="Monthly Throughput Capacity" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`${value.toLocaleString()} scripts`, 'Monthly Throughput']} />
                <Legend />
                <Bar dataKey="throughput" fill="#8884d8" name="Script Evaluations" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            title={<div><Clock size={16} style={{ marginRight: '8px' }} />Avg Response Time (seconds)</div>} 
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 10]} />
                <RechartsTooltip formatter={(value) => [`${value} sec`, 'Avg Response Time']} />
                <Bar dataKey="avgResponseTime" fill="#82ca9d" name="Response Time" />
              </BarChart>
            </ResponsiveContainer>
            <Tooltip title="Response time decreases as system optimizations are implemented">
              <Paragraph style={{ textAlign: 'center', cursor: 'help', marginTop: '10px' }}>
                <Tag color="green">Improving Trend</Tag> Response time decreased by 19.5% over 6 months
              </Paragraph>
            </Tooltip>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            title={<div><Zap size={16} style={{ marginRight: '8px' }} />Cost Per Evaluation (USD)</div>} 
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 0.1]} />
                <RechartsTooltip formatter={(value) => [`$${value}`, 'Cost Per Eval']} />
                <Bar dataKey="costPerEval" fill="#ffc658" name="Cost Per Evaluation" />
              </BarChart>
            </ResponsiveContainer>
            <Tooltip title="Cost per evaluation decreases as volume increases due to economies of scale">
              <Paragraph style={{ textAlign: 'center', cursor: 'help', marginTop: '10px' }}>
                <Tag color="green">Improving Trend</Tag> Cost reduced by 17.1% over 6 months
              </Paragraph>
            </Tooltip>
          </Card>
        </Col>
        
        <Col span={24}>
          <Table 
            columns={columns} 
            dataSource={tableData} 
            pagination={false}
            style={{ marginTop: '20px' }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default MonthlyPerformanceMetrics;