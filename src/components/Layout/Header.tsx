import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Badge } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  SkinOutlined,
} from '@ant-design/icons';
import { useAuthStore, useThemeStore } from '../../stores';
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

  const handleAvatarClick = () => {
    toggleTheme();
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
      key: 'theme',
      icon: <SkinOutlined />,
      label: `切换主题 (${theme === 'modern' ? '现代' : 'OreUI'})`,
      onClick: toggleTheme,
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
        background: '#001529',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        position: 'fixed',
        top: 0,
        right: 0,
        left: 220,
        zIndex: 100,
      }}
    >
      <Space size={24}>
        <Badge count={5} size="small">
          <Button type="text" icon={<BellOutlined />} style={{ color: '#fff' }} />
        </Badge>
        <Dropdown menu={{ items }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar 
              icon={<UserOutlined />} 
              onClick={handleAvatarClick}
              style={{ 
                cursor: 'pointer',
                backgroundColor: theme === 'oreui' ? '#3C8527' : '#1890ff',
              }}
            />
            <span style={{ color: '#fff' }}>{user?.username || '未登录'}</span>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
              ({user?.role === 'admin' ? '管理员' : user?.role === 'commentator' ? '解说' : user?.role === 'designer' ? '设计师' : user?.role === 'director' ? '导播' : '赛事'})
            </span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
