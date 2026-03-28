import React from 'react';
import { Typography, Space } from 'antd';
import { useDrag } from 'react-dnd';
import {
  FontSizeOutlined,
  PictureOutlined,
  BorderOutlined,
  AppstoreOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  MessageOutlined,
  UserOutlined,
  GiftOutlined,
  WarningOutlined,
  OrderedListOutlined,
  ProfileOutlined,
  GoldOutlined,
  DashboardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface PaletteItemProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  defaultProps?: any;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ type, label, icon, defaultProps }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { type, defaultProps },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      style={{
        padding: '12px',
        backgroundColor: isDragging ? '#1890ff' : '#f5f5f5',
        borderRadius: '8px',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s',
        border: '1px solid #d9d9d9',
        minWidth: '70px',
      }}
    >
      <span style={{ fontSize: '24px', color: '#333' }}>{icon}</span>
      <Text style={{ color: '#333', fontSize: '12px' }}>{label}</Text>
    </div>
  );
};

const componentGroups = [
  {
    title: '基础组件',
    items: [
      { type: 'text', label: '文本', icon: <FontSizeOutlined />, defaultProps: { content: '文本内容', width: 200, height: 40 } },
      { type: 'image', label: '图片', icon: <PictureOutlined />, defaultProps: { src: '', width: 200, height: 150 } },
      { type: 'container', label: '容器', icon: <AppstoreOutlined />, defaultProps: { width: 300, height: 200, children: [] } },
      { type: 'shape', label: '形状', icon: <BorderOutlined />, defaultProps: { width: 100, height: 100, shape: 'rect' } },
    ],
  },
  {
    title: '数据组件',
    items: [
      { type: 'scoreboard', label: '记分牌', icon: <BarChartOutlined />, defaultProps: { width: 400, height: 100 } },
      { type: 'timer', label: '计时器', icon: <ClockCircleOutlined />, defaultProps: { width: 200, height: 80 } },
      { type: 'ranking', label: '排名榜', icon: <TrophyOutlined />, defaultProps: { width: 300, height: 300 } },
    ],
  },
  {
    title: 'Bedwars风格',
    items: [
      { type: 'teamRect', label: '队伍块', icon: <TeamOutlined />, defaultProps: { content: '蓝队', width: 200, height: 120, style: { teamColor: '#0066CC' } } },
      { type: 'gameTimer', label: '游戏计时', icon: <ClockCircleOutlined />, defaultProps: { width: 180, height: 80 } },
      { type: 'refereeMessage', label: '裁判消息', icon: <MessageOutlined />, defaultProps: { width: 400, height: 100 } },
    ],
  },
  {
    title: 'PVP风格',
    items: [
      { type: 'playerScore', label: '玩家分数', icon: <UserOutlined />, defaultProps: { width: 200, height: 100 } },
      { type: 'itemCard', label: '物品卡', icon: <GiftOutlined />, defaultProps: { width: 100, height: 100 } },
      { type: 'refereeBar', label: '裁判条', icon: <WarningOutlined />, defaultProps: { width: 400, height: 50 } },
    ],
  },
  {
    title: '运动员组件',
    items: [
      { type: 'playerList', label: '运动员列表', icon: <OrderedListOutlined />, defaultProps: { width: 350, height: 250 } },
      { type: 'playerItem', label: '运动员项', icon: <ProfileOutlined />, defaultProps: { width: 300, height: 60 } },
    ],
  },
  {
    title: '状态组件',
    items: [
      { type: 'orDisplay', label: 'OR显示', icon: <GoldOutlined />, defaultProps: { width: 200, height: 150 } },
      { type: 'timerControl', label: '计时控制', icon: <DashboardOutlined />, defaultProps: { width: 220, height: 80 } },
      { type: 'statusIndicator', label: '状态指示', icon: <CheckCircleOutlined />, defaultProps: { width: 120, height: 40 } },
    ],
  },
  {
    title: '媒体组件',
    items: [
      { type: 'video', label: '视频', icon: <PlayCircleOutlined />, defaultProps: { width: 400, height: 225 } },
    ],
  },
];

interface ComponentPaletteProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ collapsed, onToggle }) => {
  if (collapsed) {
    return (
      <div
        style={{
          width: '40px',
          height: '100%',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #d9d9d9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '16px',
        }}
      >
        <div
          onClick={onToggle}
          style={{
            cursor: 'pointer',
            padding: '8px',
            transform: 'rotate(90deg)',
          }}
        >
          ▶
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '240px',
        height: '100%',
        backgroundColor: '#f5f5f5',
        borderRight: '1px solid #d9d9d9',
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Text style={{ color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
          组件库
        </Text>
        <div onClick={onToggle} style={{ cursor: 'pointer', padding: '4px' }}>
          ◀
        </div>
      </div>

      {componentGroups.map((group) => (
        <div key={group.title} style={{ marginBottom: '24px' }}>
          <Text
            style={{
              color: '#666',
              fontSize: '12px',
              display: 'block',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}
          >
            {group.title}
          </Text>
          <Space wrap size="small">
            {group.items.map((item) => (
              <PaletteItem
                key={item.type}
                type={item.type}
                label={item.label}
                icon={item.icon}
                defaultProps={item.defaultProps}
              />
            ))}
          </Space>
        </div>
      ))}
    </div>
  );
};

export default ComponentPalette;
