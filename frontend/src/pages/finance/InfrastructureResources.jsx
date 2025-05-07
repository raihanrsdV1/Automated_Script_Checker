import React from 'react';
import { Card, Typography, Row, Col, Badge } from 'antd';
import { Server, Cloud, Database, Monitor, Cpu, HardDrive, Wifi, Lock } from 'lucide-react';

const { Title, Paragraph } = Typography;

const InfrastructureResources = () => {
  return (
    <Card title="Infrastructure Resources Diagram" style={{ marginBottom: '20px' }}>
      <Row gutter={[16, 16]} justify="center">
        <Col span={24}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Title level={4}>AI Grading System Infrastructure</Title>
            <Paragraph>Hardware and Network Components Required</Paragraph>
          </div>
        </Col>

        {/* Server Section */}
        <Col xs={24} md={8}>
          <Card 
            title={<div><Server size={16} style={{ marginRight: '8px' }} /> Server Hardware</div>} 
            bordered={true}
            style={{ height: '100%', background: '#f9f9f9' }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              padding: '10px',
              border: '1px dashed #d9d9d9',
              borderRadius: '5px'
            }}>
              <Badge.Ribbon text="Primary" color="green">
                <div style={{ 
                  padding: '10px', 
                  background: '#fff', 
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Cpu size={24} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>GPU Server</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>NVIDIA A100 (80GB)</div>
                  </div>
                </div>
              </Badge.Ribbon>

              <div style={{ 
                padding: '10px',
                background: '#fff', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <HardDrive size={24} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Storage</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>4TB NVMe SSD</div>
                </div>
              </div>

              <div style={{ 
                padding: '10px',
                background: '#fff', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Monitor size={24} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Management Station</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Remote Administration</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Network Section */}
        <Col xs={24} md={8}>
          <Card 
            title={<div><Wifi size={16} style={{ marginRight: '8px' }} /> Network Resources</div>} 
            bordered={true}
            style={{ height: '100%', background: '#f9f9f9' }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              padding: '10px',
              border: '1px dashed #d9d9d9',
              borderRadius: '5px'
            }}>
              <div style={{ 
                padding: '10px', 
                background: '#fff', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Wifi size={24} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>High-Speed Internet</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>100+ Mbps, Static IP</div>
                </div>
              </div>

              <div style={{ 
                padding: '10px',
                background: '#fff', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Lock size={24} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Security Appliance</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Firewall/IDS/IPS</div>
                </div>
              </div>

              <div style={{ 
                padding: '10px',
                background: '#fff', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Cloud size={24} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Content Delivery</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>SSL Certificates</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Database Section */}
        <Col xs={24} md={8}>
          <Card 
            title={<div><Database size={16} style={{ marginRight: '8px' }} /> Data Storage</div>} 
            bordered={true}
            style={{ height: '100%', background: '#f9f9f9' }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              padding: '10px',
              border: '1px dashed #d9d9d9',
              borderRadius: '5px'
            }}>
              <div style={{ 
                padding: '10px', 
                background: '#fff', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Database size={24} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>PostgreSQL Database</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>User Data & Results</div>
                </div>
              </div>

              <div style={{ 
                padding: '10px',
                background: '#fff', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <HardDrive size={24} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Backup System</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Daily Incremental</div>
                </div>
              </div>

              <div style={{ 
                padding: '10px',
                background: '#fff', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Cloud size={24} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Cloud Storage</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Off-site Backup</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Connection lines - visual representation of how components connect */}
        <Col span={24}>
          <div style={{ 
            padding: '20px', 
            border: '1px dashed #d9d9d9', 
            borderRadius: '5px',
            backgroundColor: '#fafafa',
            textAlign: 'center'
          }}>
            <Paragraph>
              <strong>Infrastructure Deployment Notes:</strong> All components are interconnected through secure, high-speed networking. 
              The primary GPU server handles model inference with redundant power and cooling systems. 
              Database instances are replicated for high availability.
            </Paragraph>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default InfrastructureResources;