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
          <Badge count="开发中" style={{ backgroundColor: '#faad14', marginLeft: 8, fontSize: 10 }} />
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
        background: '#001529',
        minHeight: '100vh',
        height: '100vh',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 20,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
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
