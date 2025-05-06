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
  Alert
} from 'antd';
import { ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../../config';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

const RecheckerModule = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [recheckModalVisible, setRecheckModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [recentlyRechecked, setRecentlyRechecked] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/submissions/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Process submissions for better display
        const processedSubmissions = response.data.submissions.map(submission => {
          // Calculate score (70% of total as per requirements)
          const totalMarks = submission.questions.reduce((acc, q) => acc + q.total_marks, 0);
          const score = Math.round(totalMarks * 0.7);
          
          return {
            ...submission,
            key: submission.id,
            test_name: submission.test_name || `Test ${submission.question_set_id}`,
            question_count: submission.questions ? submission.questions.length : 0,
            total_marks: totalMarks,
            score: score,
            percentage: Math.round((score / totalMarks) * 100),
            submitted_at: new Date(submission.submitted_at).toLocaleString(),
            recheck_status: submission.recheck_status || 'none', // none, pending, completed
            rechecked: Boolean(submission.rechecked)
          };
        });
        
        // Store rechecked submissions for the notice
        setRecentlyRechecked(processedSubmissions.filter(s => s.recheck_status === 'completed'));
        
        // Set all submissions
        setSubmissions(processedSubmissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        //message.error('Failed to load submissions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const showRecheckConfirm = (submission) => {
    confirm({
      title: 'Do you want to request a recheck for this submission?',
      icon: <ExclamationCircleOutlined />,
      content: 'You can provide reasons for recheck in the next step.',
      onOk() {
        setSelectedSubmission(submission);
        setRecheckModalVisible(true);
      },
    });
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

  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'test_name',
      key: 'test_name',
    },
    {
      title: 'Current Score',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      render: (score, record) => `${score}/${record.total_marks} (${record.percentage}%)`,
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
    },
    {
      title: 'Status',
      dataIndex: 'recheck_status',
      key: 'recheck_status',
      align: 'center',
      render: (status) => {
        let color = 'default';
        let text = 'Not Requested';
        
        if (status === 'pending') {
          color = 'processing';
          text = 'Pending';
        } else if (status === 'completed') {
          color = 'success';
          text = 'Completed';
        }
        
        return <Tag color={color}>{text}</Tag>;
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
        <Button 
          type="primary" 
          onClick={() => showRecheckConfirm(record)}
          disabled={record.recheck_status !== 'none'}
        >
          Request Recheck
        </Button>
      ),
    },
  ];

  return (
    <div className="rechecker-module-container">
      <Title level={2}>Test Reevaluation</Title>
      <Text type="secondary">Request reevaluation for your test submissions</Text>
      
      {recentlyRechecked.length > 0 && (
        <Alert
          message="Reevaluation Completed"
          description={`Reevaluation has been completed for ${recentlyRechecked.length} of your tests. Check the details for updated scores.`}
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
          {submissions.length === 0 ? (
            <Empty description="No submissions available for reevaluation" />
          ) : (
            <Card className="rechecker-table-card">
              <Table
                columns={columns}
                dataSource={submissions}
                pagination={{ pageSize: 10 }}
                rowKey="id"
              />
            </Card>
          )}
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
          <Paragraph>
            Please provide the reason why you're requesting a reevaluation for this test.
            Be specific about which questions you believe were incorrectly evaluated.
          </Paragraph>
          
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
                { min: 20, message: 'Please provide a more detailed explanation (minimum 20 characters)' }
              ]}
            >
              <TextArea rows={4} placeholder="Please explain why you believe this test needs to be reevaluated..." />
            </Form.Item>
            
            <div className="recheck-form-footer">
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
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default RecheckerModule;