import React from 'react';
import { Typography } from 'antd';
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
  const handleDragStart = (e: React.DragEvent) => {
    const dragData = {
      type: 'COMPONENT',
      componentType: type,
      defaultProps,
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        padding: '12px 8px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s',
        border: '1px solid #e8e8e8',
        minWidth: '60px',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#e6f7ff';
        e.currentTarget.style.borderColor = '#1890ff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fafafa';
        e.currentTarget.style.borderColor = '#e8e8e8';
      }}
    >
      <span style={{ fontSize: '22px', color: '#1890ff' }}>{icon}</span>
      <Text style={{ color: '#333', fontSize: '11px', textAlign: 'center' }}>{label}</Text>
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

interface DraggablePaletteProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const DraggablePalette: React.FC<DraggablePaletteProps> = ({ collapsed, onToggle }) => {
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
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRight: '1px solid #d9d9d9',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <Text style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
          组件库
        </Text>
        <div 
          onClick={onToggle} 
          style={{ 
            cursor: 'pointer', 
            padding: '4px 8px',
            color: '#999',
            fontSize: '12px',
          }}
        >
          ◀ 收起
        </div>
      </div>

      {componentGroups.map((group) => (
        <div key={group.title} style={{ marginBottom: '16px' }}>
          <Text
            style={{
              color: '#666',
              fontSize: '11px',
              display: 'block',
              marginBottom: '8px',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {group.title}
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {group.items.map((item) => (
              <PaletteItem
                key={item.type}
                type={item.type}
                label={item.label}
                icon={item.icon}
                defaultProps={item.defaultProps}
              />
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '10px', backgroundColor: '#e6f7ff', borderRadius: '8px', marginBottom: '8px' }}>
        <Text style={{ fontSize: '11px', color: '#1890ff' }}>
          💡 拖拽组件到画布上放置
        </Text>
      </div>
    </div>
  );
};

export default DraggablePalette;
