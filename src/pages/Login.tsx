import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string }) => {
    const success = await login(values.username, values.password);
    if (success) {
      message.success('登录成功');
      navigate('/');
    } else {
      message.error('用户名或密码错误');
    }
  };

  const handleRegister = async (values: {
    username: string;
    password: string;
    invitationCode: string;
  }) => {
    const success = await register(values.username, values.password, values.invitationCode);
    if (success) {
      message.success('注册成功');
      navigate('/');
    } else {
      message.error('邀请码无效');
    }
  };

  const loginItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form onFinish={handleLogin}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', color: '#999' }}>
            测试账号: admin / 123456
          </div>
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form onFinish={handleRegister}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="invitationCode"
            rules={[{ required: true, message: '请输入邀请码' }]}
          >
            <Input
              prefix={<KeyOutlined />}
              placeholder="邀请码"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{ width: 400, borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 24,
            fontSize: 28,
            fontWeight: 'bold',
            color: '#1890ff',
          }}
        >
          MOB导播系统
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={loginItems}
          centered
        />
      </Card>
    </div>
  );
};

export default Login;
