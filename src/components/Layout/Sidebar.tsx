import React from 'react';
import { Layout, Menu, Badge } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  VideoCameraOutlined,
  TableOutlined,
  FolderOutlined,
  UserOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores';

const { Sider } = Layout;

interface SidebarProps {
  onMenuItemClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onMenuItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuthStore();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '控制台',
      permission: '*',
    },
    {
      key: '/schedule',
      icon: <CalendarOutlined />,
      label: '赛程',
      permission: 'events',
    },
    {
      key: '/athletes',
      icon: <TeamOutlined />,
      label: '运动员信息 (CIS)',
      permission: 'athletes',
    },
    {
      key: '/events',
      icon: <TrophyOutlined />,
      label: '赛事项目信息',
      permission: 'events',
    },
    {
      key: '/packages',
      icon: <VideoCameraOutlined />,
      label: '直播包装',
      permission: 'packages',
    },
    {
      key: '/datatables',
      icon: <TableOutlined />,
      label: '数据表',
      permission: 'dataTables',
    },
    {
      key: '/resources',
      icon: <FolderOutlined />,
      label: '资源列表',
      permission: 'resources',
    },
    {
      key: '/members',
      icon: <UserOutlined />,
      label: '成员管理',
      permission: '*',
    },
    {
      key: '/bilibili',
      icon: <PlayCircleOutlined />,
      label: (
        <span>
          B站开播
          <Badge count="开发中" style={{ backgroundColor: '#f59e0b', marginLeft: 8, fontSize: 10 }} />
        </span>
      ),
      permission: '*',
      disabled: true,
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => hasPermission(item.permission) && !item.disabled
  );

  return (
    <Sider
      width={220}
      style={{
        background: '#111111',
        minHeight: '100vh',
        height: '100vh',
        overflow: 'auto',
        borderRight: '1px solid #2a2a2a',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 20,
          fontWeight: 'bold',
          borderBottom: '1px solid #2a2a2a',
          gap: 12,
        }}
      >
        一起赛事
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={filteredItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => {
            navigate(item.key);
            onMenuItemClick?.();
          },
        }))}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;
