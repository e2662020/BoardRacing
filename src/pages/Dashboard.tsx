import React from 'react';
import { Row, Col, Card, Statistic, List, Tag, Button } from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  TableOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAthleteStore, useEventStore, usePackageStore, useDataTableStore } from '../stores';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { athletes } = useAthleteStore();
  const { schedules } = useEventStore();
  const { packages } = usePackageStore();
  const { tables } = useDataTableStore();

  const liveAthletes = athletes.filter((a) => a.isLive);
  const todaySchedules = schedules.filter((s) => {
    const today = new Date().toDateString();
    const scheduleDate = new Date(s.startTime).toDateString();
    return today === scheduleDate;
  });

  const stats = [
    {
      title: '运动员总数',
      value: athletes.length,
      icon: <TeamOutlined />,
      color: '#1890ff',
      path: '/athletes',
    },
    {
      title: '今日赛程',
      value: todaySchedules.length,
      icon: <CalendarOutlined />,
      color: '#52c41a',
      path: '/schedule',
    },
    {
      title: '直播包装',
      value: packages.length,
      icon: <VideoCameraOutlined />,
      color: '#722ed1',
      path: '/packages',
    },
    {
      title: '数据表',
      value: tables.length,
      icon: <TableOutlined />,
      color: '#fa8c16',
      path: '/data-tables',
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>控制台</h1>
      
      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card
              hoverable
              onClick={() => navigate(stat.path)}
              bodyStyle={{ padding: 20 }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: stat.color + '20',
                      color: stat.color,
                      marginRight: 12,
                    }}
                  >
                    {stat.icon}
                  </div>
                }
                valueStyle={{ fontSize: 32, fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="正在比赛的运动员"
            extra={
              <Button type="link" onClick={() => navigate('/athletes')}>
                查看全部 <ArrowRightOutlined />
              </Button>
            }
          >
            <List
              dataSource={liveAthletes.slice(0, 5)}
              renderItem={(athlete) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <span>
                        {athlete.name}
                        <Tag color="red" style={{ marginLeft: 8 }}>
                          LIVE
                        </Tag>
                      </span>
                    }
                    description={athlete.specialties.join(', ')}
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无正在比赛的运动员' }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="今日赛程"
            extra={
              <Button type="link" onClick={() => navigate('/schedule')}>
                查看全部 <ArrowRightOutlined />
              </Button>
            }
          >
            <List
              dataSource={todaySchedules.slice(0, 5)}
              renderItem={(schedule) => (
                <List.Item>
                  <List.Item.Meta
                    title={schedule.eventName}
                    description={
                      <span>
                        <Tag color={schedule.type === 'final' ? 'red' : 'blue'}>
                          {schedule.type === 'final' ? '决赛' : '初赛'}
                        </Tag>
                        {new Date(schedule.startTime).toLocaleTimeString()} - 
                        {new Date(schedule.endTime).toLocaleTimeString()}
                      </span>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: '今日暂无赛程' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
