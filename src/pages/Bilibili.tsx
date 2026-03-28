import React from 'react';
import { Card, Result, Button, Space, Tag } from 'antd';
import { PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const BilibiliPage: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>B站开播</h1>

      <Card>
        <Result
          icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          title="功能开发中"
          subTitle="B站直播开播功能正在开发中，敬请期待"
          extra={
            <Space>
              <Tag color="orange">即将推出</Tag>
              <Button type="primary" icon={<PlayCircleOutlined />} disabled>
                开始直播
              </Button>
            </Space>
          }
        />
      </Card>

      <Card title="功能预览" style={{ marginTop: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <h4>计划功能：</h4>
            <ul style={{ lineHeight: 2 }}>
              <li>一键推流到Bilibili直播间</li>
              <li>实时弹幕互动显示</li>
              <li>直播数据监控（观看人数、弹幕数等）</li>
              <li>直播录制与回放管理</li>
              <li>多平台同步直播</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default BilibiliPage;
