import { useState } from 'react';
import { Row, Col, Card, Tabs, Typography, Statistic, Divider, Progress, Badge, Space, Alert, Table, Tag } from 'antd';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, TrendingUp, Server, AlertCircle, BarChart2, PieChart as PieChartIcon, Activity, Coins, CreditCard } from 'lucide-react';
import InfrastructureResources from './InfrastructureResources';
import MonthlyPerformanceMetrics from './MonthlyPerformanceMetrics';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// Dummy data for charts
const revenueData = [
  { month: 'Jan', revenue: 2500, expenses: 2200, profit: 300 },
  { month: 'Feb', revenue: 3200, expenses: 2300, profit: 900 },
  { month: 'Mar', revenue: 3800, expenses: 2400, profit: 1400 },
  { month: 'Apr', revenue: 4100, expenses: 2500, profit: 1600 },
  { month: 'May', revenue: 4600, expenses: 2600, profit: 2000 },
  { month: 'Jun', revenue: 5200, expenses: 2700, profit: 2500 },
  { month: 'Jul', revenue: 5800, expenses: 2800, profit: 3000 },
  { month: 'Aug', revenue: 6100, expenses: 2900, profit: 3200 },
  { month: 'Sep', revenue: 6500, expenses: 3000, profit: 3500 },
  { month: 'Oct', revenue: 7000, expenses: 3100, profit: 3900 },
  { month: 'Nov', revenue: 7500, expenses: 3200, profit: 4300 },
  { month: 'Dec', revenue: 8000, expenses: 3300, profit: 4700 },
];

const hardwareCostData = [
  { name: 'GPU (NVIDIA A100)', value: 12000 },
  { name: 'CPU (AMD Threadripper)', value: 1000 },
  { name: 'RAM (128GB ECC)', value: 800 },
  { name: 'SSD (2-4TB NVMe)', value: 400 },
  { name: 'Other Components', value: 900 },
];

const operationalCostData = [
  { name: 'Internet', value: 400 },
  { name: 'UPS/Cooling', value: 650 },
  { name: 'Electricity', value: 1250 },
  { name: 'Hosting/Domain', value: 75 },
  { name: 'Security Tools', value: 150 },
];

const evaluationVolumeData = [
  { month: 'Jan', scripts: 12000 },
  { month: 'Feb', scripts: 15000 },
  { month: 'Mar', scripts: 18000 },
  { month: 'Apr', scripts: 22000 },
  { month: 'May', scripts: 25000 },
  { month: 'Jun', scripts: 30000 },
  { month: 'Jul', scripts: 35000 },
  { month: 'Aug', scripts: 38000 },
  { month: 'Sep', scripts: 42000 },
  { month: 'Oct', scripts: 48000 },
  { month: 'Nov', scripts: 52000 },
  { month: 'Dec', scripts: 55000 },
];

const breakEvenData = [
  { month: 1, accumRevenue: 3000, initialCost: 15000 },
  { month: 2, accumRevenue: 6200, initialCost: 15000 },
  { month: 3, accumRevenue: 10000, initialCost: 15000 },
  { month: 4, accumRevenue: 14100, initialCost: 15000 },
  { month: 5, accumRevenue: 18700, initialCost: 15000 },
  { month: 6, accumRevenue: 23900, initialCost: 15000 },
  { month: 7, accumRevenue: 29700, initialCost: 15000 },
  { month: 8, accumRevenue: 35800, initialCost: 15000 },
  { month: 9, accumRevenue: 42300, initialCost: 15000 },
  { month: 10, accumRevenue: 49300, initialCost: 15000 },
  { month: 11, accumRevenue: 56800, initialCost: 15000 },
  { month: 12, accumRevenue: 64800, initialCost: 15000 },
];

const pricingScenariosData = [
  { name: 'Conservative (৳5)', value: 250000 },
  { name: 'Moderate (৳7.5)', value: 375000 },
  { name: 'Aggressive (৳10)', value: 500000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const FinanceEvaluation = () => {
  const [activeTab, setActiveTab] = useState('1');
  
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const formatCurrency = (value) => {
    return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ৳`;
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={24}>
          <Card>
            <Title level={2}>Financial Evaluation Dashboard</Title>
            <Paragraph>
              Comprehensive financial analysis for the AI-based script evaluation system with GPU infrastructure.
              Last updated: May 7, 2025
            </Paragraph>
            <Alert
              message="Investment Summary"
              description="Initial hardware investment can be recovered within 6-12 months based on current projections."
              type="info"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
        <TabPane tab={<span><BarChart2 size={16} style={{ marginRight: '8px' }} />Financial Overview</span>} key="1">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Initial Investment"
                  value={2000000}
                  precision={0}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<DollarSign size={16} />}
                  suffix=""
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Annual Revenue (Projected)"
                  value={7500000}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<DollarSign size={16} />}
                  suffix=""
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Operational Expenses"
                  value={252500}
                  precision={0}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<DollarSign size={16} />}
                  suffix="৳/yr"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="ROI (Year 1)"
                  value={180}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<TrendingUp size={16} />}
                  suffix="%"
                />
              </Card>
            </Col>

            <Col span={24}>
              <Card title="Revenue vs. Expenses (2025)">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} ৳`, '']} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" name="Revenue" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Expenses" />
                    <Area type="monotone" dataKey="profit" stackId="3" stroke="#ffc658" fill="#ffc658" name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><Server size={16} style={{ marginRight: '8px' }} />Hardware Costs</span>} key="2">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="One-time Hardware Costs Breakdown">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={hardwareCostData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {hardwareCostData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Annual Operational Costs">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={operationalCostData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" fill="#00C49F" name="Annual Cost (USD)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="Hardware Specifications & Cost Analysis">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Card type="inner" title="GPU Options">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Badge.Ribbon text="Recommended" color="green">
                          <Card size="small">
                            <Statistic title="NVIDIA A100 (80GB)" value="1500000 ৳" />
                            <Paragraph>Processing capacity: ≈10,000 scripts/day</Paragraph>
                            <Progress percent={100} status="active" />
                          </Card>
                        </Badge.Ribbon>
                        <Card size="small">
                          <Statistic title="RTX 4090 (24GB)" value="250000 ৳" />
                          <Paragraph>Processing capacity: ≈3,000 scripts/day</Paragraph>
                          <Progress percent={30} status="active" />
                        </Card>
                      </Space>
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card type="inner" title="Server Components">
                        <ul style={{ paddingLeft: '20px' }}>
                          <li>CPU: AMD Threadripper (৳120000)</li>
                          <li>RAM: 128GB ECC (৳100000)</li>
                          <li>SSD: 4TB NVMe (৳50000)</li>
                          <li>Motherboard: (৳50000)</li>
                          <li>PSU, Cooling, Chassis: (৳50000)</li>
                        </ul>
                        <Divider />
                        <Statistic title="Total (excluding GPU)" value="37,00,000 ৳" />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card type="inner" title="Scaling Considerations">
                        <Paragraph>
                          <ul>
                            <li>Each A100 increases capacity by ~10,000 scripts/day</li>
                            <li>Power draw: ~500W (GPU) + 300W (system)</li>
                            <li>Cooling requirements: 3000 BTU/hr</li>
                            <li>Redundancy: Consider N+1 for high availability</li>
                          </ul>
                        </Paragraph>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><PieChartIcon size={16} style={{ marginRight: '8px' }} />ROI Analysis</span>} key="3">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Projected Script Evaluation Volume">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={evaluationVolumeData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} scripts`} />
                      <Legend />
                      <Line type="monotone" dataKey="scripts" stroke="#8884d8" activeDot={{ r: 8 }} name="Scripts Evaluated" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Break-even Analysis">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={breakEvenData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="initialCost" stroke="#ff8042" strokeDasharray="5 5" name="Initial Investment" />
                      <Line type="monotone" dataKey="accumRevenue" stroke="#82ca9d" activeDot={{ r: 8 }} name="Accumulated Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <Alert message="Break-even point projected at month 6" type="success" showIcon />
                  </div>
                </Card>
              </Col>

              <Col xs={24}>
                <Card title="Annual Revenue by Pricing Strategy (Based on 50,000 scripts/month)">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={pricingScenariosData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Annual Revenue (USD)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Financial Highlights">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Card type="inner" title="Investment">
                        <Statistic title="High-End Setup (w/ A100)" value="1250000 ৳" />
                        <Divider />
                        <Statistic title="Mid-Range Setup (w/ RTX 4090)" value="600000 ৳" />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card type="inner" title="Annual Operating Expenses">
                        <Progress percent={16} status="active" strokeColor="#faad14" format={() => '50000৳'} />
                        <div>Internet (high-speed, static IP)</div>
                        <Progress percent={26} status="active" strokeColor="#faad14" format={() => '75000৳'} />
                        <div>UPS / Cooling / Maintenance</div>
                        <Progress percent={50} status="active" strokeColor="#faad14" format={() => '150000৳'} />
                        <div>Electricity (GPU workload)</div>
                        <Progress percent={8} status="active" strokeColor="#faad14" format={() => '30000 ৳'} />
                        <div>Domain / Hosting / Security</div>
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card type="inner" title="Revenue Potential">
                        <Paragraph>
                          <ul>
                            <li>Charge per evaluation: ৳5-10 BDT ($0.05-$0.10)</li>
                            <li>Monthly volume: 50,000 scripts</li>
                            <li>Monthly revenue: 2,500,00 ৳ - 5,00,000 ৳</li>
                            <li>Annual revenue: 30,00,000 ৳ - 60,00,000 ৳</li>
                            <li>Net profit (Year 1): 10,00,000 ৳- 25,00,000</li>
                            <li>ROI (Year 1): 83%-180%</li>
                          </ul>
                        </Paragraph>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
        
        <TabPane tab={<span><Activity size={16} style={{ marginRight: '8px' }} />Infrastructure & Performance</span>} key="4">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <InfrastructureResources />
              <MonthlyPerformanceMetrics />
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab={<span><Coins size={16} style={{ marginRight: '8px' }} />Unit Economics</span>} key="5">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Card title="Cost Breakdown Per Script Evaluation" bordered={true}>
                <div style={{ marginBottom: '20px' }}>
                  <Alert
                    message="Optimized for Cost Efficiency"
                    description="Our unit economics are carefully optimized to keep per-script costs as low as possible while maintaining high evaluation quality."
                    type="success"
                    showIcon
                  />
                </div>
                
                <Table 
                  dataSource={[
                    {
                      key: '1',
                      component: 'GPU Processing',
                      cost: 0.024,
                      percentage: 40,
                      notes: 'Based on A100 GPU amortized over 3 years with batch processing',
                      category: 'infrastructure'
                    },
                    {
                      key: '2',
                      component: 'CPU + Memory Resources',
                      cost: 0.006,
                      percentage: 10,
                      notes: 'Pre/post-processing operations, handling metadata',
                      category: 'infrastructure'
                    },
                    {
                      key: '3',
                      component: 'Electricity',
                      cost: 0.005,
                      percentage: 8.3,
                      notes: '800W total system load during processing',
                      category: 'infrastructure'
                    },
                    {
                      key: '4',
                      component: 'Storage (SSD/NVMe)',
                      cost: 0.002,
                      percentage: 3.3,
                      notes: 'Temporary and long-term storage of script data',
                      category: 'infrastructure'
                    },
                    {
                      key: '5',
                      component: 'Network Bandwidth',
                      cost: 0.001,
                      percentage: 1.7,
                      notes: 'Data transfer for script upload/download',
                      category: 'infrastructure'
                    },
                    {
                      key: '6',
                      component: 'OCR Processing',
                      cost: 0.005,
                      percentage: 8.3,
                      notes: 'Using optimized local OCR models',
                      category: 'processing'
                    },
                    {
                      key: '7',
                      component: 'Model Inference',
                      cost: 0.010,
                      percentage: 16.7,
                      notes: 'LLM evaluation against rubric',
                      category: 'processing'
                    },
                    {
                      key: '8',
                      component: 'System Maintenance',
                      cost: 0.003,
                      percentage: 5,
                      notes: 'Software updates, database management',
                      category: 'operations'
                    },
                    {
                      key: '9',
                      component: 'Monitoring & Quality Control',
                      cost: 0.004,
                      percentage: 6.7,
                      notes: 'Automated verification systems',
                      category: 'operations'
                    },
                  ]} 
                  columns={[
                    { 
                      title: 'Cost Component', 
                      dataIndex: 'component', 
                      key: 'component',
                      render: (text, record) => (
                        <div>
                          <span style={{ marginRight: '8px' }}>{text}</span>
                          {record.category === 'infrastructure' && <Tag color="blue">Infrastructure</Tag>}
                          {record.category === 'processing' && <Tag color="green">Processing</Tag>}
                          {record.category === 'operations' && <Tag color="orange">Operations</Tag>}
                        </div>
                      )
                    },
                    { 
                      title: 'Cost Per Script (৳)', 
                      dataIndex: 'cost', 
                      key: 'cost',
                      render: (value) => `${value.toFixed(3)}৳`,
                      sorter: (a, b) => a.cost - b.cost,
                    },
                    { 
                      title: 'Percentage of Total', 
                      dataIndex: 'percentage', 
                      key: 'percentage',
                      render: (value) => (
                        <div>
                          <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: '10px', marginBottom: '5px' }}>
                            <div 
                              style={{ 
                                width: `${value}%`, 
                                backgroundColor: value > 30 ? '#ff4d4f' : value > 15 ? '#faad14' : '#52c41a', 
                                height: '8px', 
                                borderRadius: '10px' 
                              }} 
                            />
                          </div>
                          <span>{value}%</span>
                        </div>
                      ),
                      sorter: (a, b) => a.percentage - b.percentage,
                    },
                    { 
                      title: 'Notes', 
                      dataIndex: 'notes', 
                      key: 'notes',
                      ellipsis: true,
                    },
                  ]}
                  pagination={false}
                  summary={pageData => {
                    let totalCost = 0;
                    pageData.forEach(({ cost }) => {
                      totalCost += cost;
                    });
                
                    return (
                      <>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0}><strong>Total Cost Per Script</strong></Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            <div style={{ color: '#1890ff', fontWeight: 'bold', fontSize: '16px' }}>
                              ${totalCost.toFixed(3)}
                            </div>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2}>100%</Table.Summary.Cell>
                          <Table.Summary.Cell index={3}>
                            <div>
                              <Tag color="green">Cost-optimized</Tag>
                              <Tag color="blue">Scalable</Tag>
                            </div>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </>
                    );
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card title="Unit Economics Analysis" bordered={true}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card type="inner" title="Cost Comparison" style={{ marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <Statistic
                        title="AI Evaluation Cost"
                        value={6}
                        precision={3}
                        valueStyle={{ color: '#3f8600' }}
                        prefix=""
                        suffix="৳/script"
                      />
                      <div style={{ marginTop: '10px' }}>
                        <Tag color="green">94% savings</Tag>
                        <Tag color="green">8.3× faster</Tag>
                      </div>
                    </div>
                    <Divider style={{ margin: '10px 0' }}><Text type="secondary">vs</Text></Divider>
                    <div style={{ textAlign: 'center' }}>
                      <Statistic
                        title="Manual Evaluation Cost"
                        value={12}
                        precision={2}
                        valueStyle={{ color: '#cf1322' }}
                        prefix=""
                        suffix="৳/script"
                      />
                      <Paragraph style={{ marginTop: '10px' }}>
                        Based on teacher compensation for script evaluation
                      </Paragraph>
                    </div>
                  </Card>
                  
                  <Card type="inner" title="Cost Structure" style={{ marginBottom: '20px' }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Infrastructure', value: 0.038, color: '#0088FE' },
                            { name: 'Processing', value: 0.015, color: '#00C49F' },
                            { name: 'Operations', value: 0.007, color: '#FFBB28' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: 'Infrastructure', value: 0.038, color: '#0088FE' },
                            { name: 'Processing', value: 0.015, color: '#00C49F' },
                            { name: 'Operations', value: 0.007, color: '#FFBB28' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(3)}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                  
                  <Card type="inner" title="Cost Optimization">
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><strong>Batch Processing:</strong> 65% cost reduction through optimized batch inference</li>
                      <li><strong>Model Quantization:</strong> 30% efficiency improvement with 8-bit model loading</li>
                      <li><strong>Scale Advantages:</strong> Unit cost decreases 15% with every 10K increase in monthly volume</li>
                      <li><strong>Local Deployment:</strong> Eliminates cloud API costs which would be 3-5× higher</li>
                    </ul>
                    <Divider />
                    <Alert
                      message="Pricing Recommendation"
                      description="With a unit cost of $0.06, a price point of ৳5 BDT (≈$0.05) is feasible at scale with high volumes, while ৳7-10 BDT provides comfortable margins for investment and growth."
                      type="info"
                      showIcon
                    />
                  </Card>
                </Space>
              </Card>
            </Col>
            
            <Col span={24}>
              <Card title="Volume-Based Unit Economics Projection" bordered={true}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { volume: 10000, unitCost: 0.095, revenue: 0.05, profit: -0.045 },
                      { volume: 20000, unitCost: 0.082, revenue: 0.05, profit: -0.032 },
                      { volume: 30000, unitCost: 0.073, revenue: 0.05, profit: -0.023 },
                      { volume: 40000, unitCost: 0.068, revenue: 0.05, profit: -0.018 },
                      { volume: 50000, unitCost: 0.06, revenue: 0.05, profit: -0.01 },
                      { volume: 60000, unitCost: 0.053, revenue: 0.05, profit: -0.003 },
                      { volume: 70000, unitCost: 0.048, revenue: 0.05, profit: 0.002 },
                      { volume: 80000, unitCost: 0.045, revenue: 0.05, profit: 0.005 },
                      { volume: 90000, unitCost: 0.042, revenue: 0.05, profit: 0.008 },
                      { volume: 100000, unitCost: 0.04, revenue: 0.05, profit: 0.01 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="volume"
                      label={{ value: 'Monthly Evaluation Volume (Scripts)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                      label={{ value: 'USD Per Script', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip formatter={(value) => `$${value.toFixed(3)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="unitCost" stroke="#ff8042" name="Cost Per Script" strokeWidth={2} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue Per Script" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit Per Script" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <Alert
                    message="Scale Economics"
                    description="As volume increases, unit costs decrease significantly due to better hardware utilization. Break-even at approximately 70,000 scripts per month at ৳5 BDT pricing."
                    type="info"
                    showIcon
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab={<span><CreditCard size={16} style={{ marginRight: '8px' }} />Revenue Streams</span>} key="6">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                <Alert
                  message="Payment Model Comparison"
                  description="Analysis of different revenue models for the AI-based script evaluation system, showing annual revenue, time to recoup investment, and profit margins."
                  type="info"
                  showIcon
                  style={{ marginBottom: '20px' }}
                />
                
                <Tabs defaultActiveKey="comparison" type="card">
                  <TabPane tab="Model Comparison" key="comparison">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Table
                          dataSource={[
                            {
                              key: '1',
                              model: 'Pay-Per-Script',
                              description: 'Charge per individual script evaluation (৳7 BDT ≈ $0.07 per script)',
                              yearlyRevenue: 42000,
                              breakEven: 4.3,
                              profitMargin: 68,
                              bestFor: 'Educational institutions with variable volume; exam seasons',
                              risk: 'low',
                            },
                            {
                              key: '2',
                              model: 'Monthly Subscription',
                              description: 'Fixed monthly fee with tiered usage limits (৳10,000 BDT ≈ $100/month for up to 2,000 scripts)',
                              yearlyRevenue: 36000,
                              breakEven: 5.0,
                              profitMargin: 62,
                              bestFor: 'Schools and coaching centers with consistent evaluation needs',
                              risk: 'medium',
                            },
                            {
                              key: '3',
                              model: 'Annual Contract',
                              description: 'Yearly contract with volume commitment (৳100,000 BDT ≈ $1,000/year for 20,000 scripts)',
                              yearlyRevenue: 30000,
                              breakEven: 6.0,
                              profitMargin: 58,
                              bestFor: 'Large educational institutions with predictable yearly needs',
                              risk: 'medium',
                            },
                            {
                              key: '4',
                              model: 'Freemium + Premium',
                              description: 'Basic free service with limited features; premium paid upgrades',
                              yearlyRevenue: 27000,
                              breakEven: 6.7,
                              profitMargin: 55,
                              bestFor: 'Market penetration; converting free users to paid',
                              risk: 'high',
                            },
                            {
                              key: '5',
                              model: 'Hybrid (Pay-Per-Script + Subscription)',
                              description: 'Low base subscription fee + reduced per-script charges',
                              yearlyRevenue: 48000,
                              breakEven: 3.8,
                              profitMargin: 72,
                              bestFor: 'Best of both worlds; predictable base revenue with volume scaling',
                              risk: 'low',
                            },
                          ]}
                          columns={[
                            {
                              title: 'Payment Model',
                              dataIndex: 'model',
                              key: 'model',
                              render: (text, record) => (
                                <div>
                                  <span style={{ fontWeight: 'bold' }}>{text}</span>
                                  <div>
                                    <Tag color={
                                      record.risk === 'low' ? 'green' : 
                                      record.risk === 'medium' ? 'orange' : 'red'
                                    }>
                                      {record.risk.charAt(0).toUpperCase() + record.risk.slice(1)} Risk
                                    </Tag>
                                  </div>
                                </div>
                              ),
                            },
                            {
                              title: 'Description',
                              dataIndex: 'description',
                              key: 'description',
                            },
                            {
                              title: 'Annual Revenue (USD)',
                              dataIndex: 'yearlyRevenue',
                              key: 'yearlyRevenue',
                              render: (value) => `$${value.toLocaleString()}`,
                              sorter: (a, b) => a.yearlyRevenue - b.yearlyRevenue,
                            },
                            {
                              title: 'Break-Even (Months)',
                              dataIndex: 'breakEven',
                              key: 'breakEven',
                              render: (value) => (
                                <div>
                                  <Progress 
                                    percent={Math.min(100, (value/12)*100)} 
                                    size="small"
                                    format={() => `${value} months`}
                                    strokeColor={{
                                      '0%': '#108ee9',
                                      '100%': '#87d068',
                                    }}
                                  />
                                </div>
                              ),
                              sorter: (a, b) => a.breakEven - b.breakEven,
                            },
                            {
                              title: 'Profit Margin (%)',
                              dataIndex: 'profitMargin',
                              key: 'profitMargin',
                              render: (value) => (
                                <div>
                                  <Progress 
                                    percent={value}
                                    size="small"
                                    format={() => `${value}%`}
                                    strokeColor={value > 70 ? '#52c41a' : value > 60 ? '#1890ff' : '#faad14'}
                                  />
                                </div>
                              ),
                              sorter: (a, b) => a.profitMargin - b.profitMargin,
                            },
                            {
                              title: 'Best For',
                              dataIndex: 'bestFor',
                              key: 'bestFor',
                            },
                          ]}
                          pagination={false}
                        />
                      </Col>
                    </Row>
                  </TabPane>
                  
                  <TabPane tab="Annual Revenue Projection" key="revenue">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={[
                              { year: '2025', payPerScript: 42000, subscription: 36000, annual: 30000, freemium: 27000, hybrid: 48000 },
                              { year: '2026', payPerScript: 63000, subscription: 54000, annual: 48000, freemium: 45000, hybrid: 72000 },
                              { year: '2027', payPerScript: 84000, subscription: 72000, annual: 66000, freemium: 72000, hybrid: 96000 },
                              { year: '2028', payPerScript: 105000, subscription: 90000, annual: 84000, freemium: 108000, hybrid: 120000 },
                              { year: '2029', payPerScript: 126000, subscription: 108000, annual: 102000, freemium: 135000, hybrid: 144000 },
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="payPerScript" name="Pay-Per-Script" fill="#8884d8" />
                            <Bar dataKey="subscription" name="Monthly Subscription" fill="#82ca9d" />
                            <Bar dataKey="annual" name="Annual Contract" fill="#ffc658" />
                            <Bar dataKey="freemium" name="Freemium + Premium" fill="#ff8042" />
                            <Bar dataKey="hybrid" name="Hybrid Model" fill="#0088FE" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Col>
                    </Row>
                  </TabPane>
                  
                  <TabPane tab="Break-Even Timeline" key="breakeven">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart
                            data={[
                              { month: 1, payPerScript: 3500, subscription: 3000, annual: 2500, freemium: 2250, hybrid: 4000, initialCost: 15100 },
                              { month: 2, payPerScript: 7000, subscription: 6000, annual: 5000, freemium: 4500, hybrid: 8000, initialCost: 15100 },
                              { month: 3, payPerScript: 10500, subscription: 9000, annual: 7500, freemium: 6750, hybrid: 12000, initialCost: 15100 },
                              { month: 4, payPerScript: 14000, subscription: 12000, annual: 10000, freemium: 9000, hybrid: 16000, initialCost: 15100 },
                              { month: 5, payPerScript: 17500, subscription: 15000, annual: 12500, freemium: 11250, hybrid: 20000, initialCost: 15100 },
                              { month: 6, payPerScript: 21000, subscription: 18000, annual: 15000, freemium: 13500, hybrid: 24000, initialCost: 15100 },
                              { month: 7, payPerScript: 24500, subscription: 21000, annual: 17500, freemium: 15750, hybrid: 28000, initialCost: 15100 },
                              { month: 8, payPerScript: 28000, subscription: 24000, annual: 20000, freemium: 18000, hybrid: 32000, initialCost: 15100 },
                              { month: 9, payPerScript: 31500, subscription: 27000, annual: 22500, freemium: 20250, hybrid: 36000, initialCost: 15100 },
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                            <YAxis />
                            <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'initialCost' ? 'Initial Investment' : name]} />
                            <Legend />
                            <Line type="monotone" dataKey="initialCost" name="Initial Investment" stroke="#ff0000" strokeWidth={2} strokeDasharray="5 5" />
                            <Line type="monotone" dataKey="payPerScript" name="Pay-Per-Script" stroke="#8884d8" strokeWidth={2} />
                            <Line type="monotone" dataKey="subscription" name="Monthly Subscription" stroke="#82ca9d" strokeWidth={2} />
                            <Line type="monotone" dataKey="annual" name="Annual Contract" stroke="#ffc658" strokeWidth={2} />
                            <Line type="monotone" dataKey="freemium" name="Freemium + Premium" stroke="#ff8042" strokeWidth={2} />
                            <Line type="monotone" dataKey="hybrid" name="Hybrid Model" stroke="#0088FE" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                          <Alert 
                            message="Break-Even Analysis" 
                            description="The Hybrid model reaches break-even fastest at 3.8 months, followed by Pay-Per-Script at 4.3 months. The Freemium model takes longest at 6.7 months." 
                            type="info" 
                            showIcon 
                          />
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  
                  <TabPane tab="Profit Margin Analysis" key="profit">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Card title="Yearly Profit Margin by Model (%)">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={[
                                { year: '2025', payPerScript: 68, subscription: 62, annual: 58, freemium: 55, hybrid: 72 },
                                { year: '2026', payPerScript: 72, subscription: 66, annual: 62, freemium: 60, hybrid: 75 },
                                { year: '2027', payPerScript: 75, subscription: 69, annual: 65, freemium: 65, hybrid: 78 },
                                { year: '2028', payPerScript: 77, subscription: 72, annual: 68, freemium: 70, hybrid: 80 },
                                { year: '2029', payPerScript: 79, subscription: 74, annual: 70, freemium: 72, hybrid: 82 },
                              ]}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis domain={[50, 85]} />
                              <Tooltip formatter={(value) => `${value}%`} />
                              <Legend />
                              <Line type="monotone" dataKey="payPerScript" name="Pay-Per-Script" stroke="#8884d8" activeDot={{ r: 8 }} />
                              <Line type="monotone" dataKey="subscription" name="Monthly Subscription" stroke="#82ca9d" activeDot={{ r: 8 }} />
                              <Line type="monotone" dataKey="annual" name="Annual Contract" stroke="#ffc658" activeDot={{ r: 8 }} />
                              <Line type="monotone" dataKey="freemium" name="Freemium + Premium" stroke="#ff8042" activeDot={{ r: 8 }} />
                              <Line type="monotone" dataKey="hybrid" name="Hybrid Model" stroke="#0088FE" activeDot={{ r: 8 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </Card>
                      </Col>
                      
                      <Col xs={24} md={12}>
                        <Card title="Year 1 Revenue vs. Cost Breakdown">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={[
                                { model: 'Pay-Per-Script', revenue: 42000, fixedCosts: 2525, variableCosts: 10915, profit: 28560 },
                                { model: 'Subscription', revenue: 36000, fixedCosts: 2525, variableCosts: 11155, profit: 22320 },
                                { model: 'Annual', revenue: 30000, fixedCosts: 2525, variableCosts: 10075, profit: 17400 },
                                { model: 'Freemium', revenue: 27000, fixedCosts: 2525, variableCosts: 9625, profit: 14850 },
                                { model: 'Hybrid', revenue: 48000, fixedCosts: 2525, variableCosts: 10915, profit: 34560 },
                              ]}
                              layout="vertical"
                              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="model" />
                              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                              <Legend />
                              <Bar dataKey="profit" stackId="a" fill="#82ca9d" name="Profit" />
                              <Bar dataKey="fixedCosts" stackId="a" fill="#8884d8" name="Fixed Costs" />
                              <Bar dataKey="variableCosts" stackId="a" fill="#ffc658" name="Variable Costs" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Card>
                      </Col>
                      
                      <Col span={24}>
                        <Card title="Payment Model Details">
                          <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                              <Badge.Ribbon text="Recommended" color="green">
                                <Card type="inner" title="Hybrid Model">
                                  <Paragraph>
                                    <strong>Structure:</strong> ৳1,000 BDT monthly base fee + ৳5 BDT per script
                                  </Paragraph>
                                  <Paragraph>
                                    <strong>Benefits:</strong>
                                    <ul>
                                      <li>Predictable base revenue</li>
                                      <li>Scales with usage volume</li>
                                      <li>Highest profit margin (72%)</li>
                                      <li>Fastest break-even (3.8 months)</li>
                                    </ul>
                                  </Paragraph>
                                  <Paragraph>
                                    <strong>Target:</strong> Schools and coaching centers of all sizes
                                  </Paragraph>
                                </Card>
                              </Badge.Ribbon>
                            </Col>
                            
                            <Col xs={24} md={8}>
                              <Card type="inner" title="Pay-Per-Script Model">
                                <Paragraph>
                                  <strong>Structure:</strong> ৳7 BDT per script evaluated
                                </Paragraph>
                                <Paragraph>
                                  <strong>Benefits:</strong>
                                  <ul>
                                    <li>No commitment required</li>
                                    <li>Pay only for what you use</li>
                                    <li>Strong profit margin (68%)</li>
                                    <li>Quick break-even (4.3 months)</li>
                                  </ul>
                                </Paragraph>
                                <Paragraph>
                                  <strong>Target:</strong> Institutions with variable or seasonal needs
                                </Paragraph>
                              </Card>
                            </Col>
                            
                            <Col xs={24} md={8}>
                              <Card type="inner" title="Volume Discounts">
                                <Paragraph>
                                  <strong>Structure:</strong> Tiered pricing based on volume
                                </Paragraph>
                                <Table
                                  size="small"
                                  pagination={false}
                                  dataSource={[
                                    { tier: '1-5,000 scripts', price: '৳7.0 BDT' },
                                    { tier: '5,001-15,000 scripts', price: '৳6.5 BDT' },
                                    { tier: '15,001-30,000 scripts', price: '৳6.0 BDT' },
                                    { tier: '30,001-50,000 scripts', price: '৳5.5 BDT' },
                                    { tier: '50,001+ scripts', price: '৳5.0 BDT' },
                                  ]}
                                  columns={[
                                    { title: 'Monthly Volume', dataIndex: 'tier', key: 'tier' },
                                    { title: 'Price Per Script', dataIndex: 'price', key: 'price' },
                                  ]}
                                />
                                <div style={{ marginTop: '10px' }}>
                                  <Text type="secondary">Applicable to both Pay-Per-Script and Hybrid models</Text>
                                </div>
                              </Card>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                    </Row>
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default FinanceEvaluation;