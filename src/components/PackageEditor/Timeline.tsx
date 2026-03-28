import React from 'react';
import { Button, Space, Slider, Typography } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  RetweetOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface TimelineProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onLoop: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const Timeline: React.FC<TimelineProps> = ({
  currentTime,
  duration,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  onLoop,
}) => {
  return (
    <div
      style={{
        height: '60px',
        backgroundColor: '#1a1a1a',
        borderTop: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '16px',
      }}
    >
      {/* 播放控制 */}
      <Space>
        <Button
          type="text"
          icon={<StepBackwardOutlined />}
          style={{ color: '#fff' }}
          onClick={() => onSeek(0)}
        />
        {isPlaying ? (
          <Button
            type="text"
            icon={<PauseCircleOutlined style={{ fontSize: '24px' }} />}
            style={{ color: '#34AA2C' }}
            onClick={onPause}
          />
        ) : (
          <Button
            type="text"
            icon={<PlayCircleOutlined style={{ fontSize: '24px' }} />}
            style={{ color: '#34AA2C' }}
            onClick={onPlay}
          />
        )}
        <Button
          type="text"
          icon={<StepForwardOutlined />}
          style={{ color: '#fff' }}
          onClick={() => onSeek(duration)}
        />
        <Button
          type="text"
          icon={<RetweetOutlined />}
          style={{ color: '#fff' }}
          onClick={onLoop}
        />
      </Space>

      {/* 时间显示 */}
      <Text style={{ color: '#fff', fontFamily: 'monospace', minWidth: '100px' }}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>

      {/* 进度条 */}
      <Slider
        value={currentTime}
        max={duration}
        onChange={onSeek}
        style={{ flex: 1 }}
        tooltip={{ formatter: (value) => formatTime(value || 0) }}
      />
    </div>
  );
};

export default Timeline;
