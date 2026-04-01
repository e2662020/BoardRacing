import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Badge } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores';
import { useThemeStore } from '../../stores/themeStore';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      className="app-header"
      style={{
        background: theme === 'dark' ? '#111111' : '#f4f4f5',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        position: 'fixed',
        top: 0,
        right: 0,
        left: 220,
        zIndex: 100,
        borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e4e4e7'}`,
      }}
    >
      <Space size={16}>
        <Button
          type="text"
          icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
        />
        <Badge count={5} size="small">
          <Button type="text" icon={<BellOutlined />} style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }} />
        </Badge>
        <Dropdown menu={{ items }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                cursor: 'pointer',
                backgroundColor: '#8b5cf6',
              }}
            />
            <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{user?.username || '未登录'}</span>
            <span style={{ color: theme === 'dark' ? '#a1a1aa' : '#52525b', fontSize: 12 }}>
              ({user?.role === 'admin' ? '管理员' : user?.role === 'commentator' ? '解说' : user?.role === 'designer' ? '设计师' : user?.role === 'director' ? '导播' : '赛事'})
            </span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
