import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { ComponentData } from '../../types';

interface CanvasComponentProps {
  component: ComponentData;
  isSelected: boolean;
  dataBinding?: any;
  onSelect: () => void;
  onUpdate: (updates: Partial<ComponentData>) => void;
  onDelete: () => void;
  onDrag: (x: number, y: number) => void;
  scale: number;
}

const CanvasComponent: React.FC<CanvasComponentProps> = ({
  component,
  isSelected,
  dataBinding,
  onSelect,
  onUpdate: _onUpdate,
  onDelete: _onDelete,
  onDrag,
  scale,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX / scale - component.x,
      y: e.clientY / scale - component.y,
    });
  }, [component.x, component.y, onSelect, scale]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const newX = e.clientX / scale - dragStart.x;
      const newY = e.clientY / scale - dragStart.y;
      onDrag(Math.max(0, newX), Math.max(0, newY));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, onDrag, scale]);

  const getDisplayContent = () => {
    if (dataBinding) {
      if (dataBinding.type === 'list' && Array.isArray(dataBinding.value)) {
        return dataBinding.value.map((item: any, index: number) => (
          <div key={index}>{item}</div>
        ));
      }
      return dataBinding.value || component.content;
    }
    return component.content;
  };

  const renderComponent = () => {
    const baseStyle: React.CSSProperties = {
      width: component.width || 100,
      height: component.height || 50,
      fontSize: component.style?.fontSize || 16,
      color: component.style?.color || '#fff',
      backgroundColor: component.style?.backgroundColor || 'transparent',
      border: component.style?.border || 'none',
      borderRadius: component.style?.borderRadius || 0,
      padding: component.style?.padding || 10,
      textAlign: component.style?.textAlign || 'left',
      fontWeight: component.style?.fontWeight || 'normal',
      opacity: component.style?.opacity ?? 1,
      transform: `rotate(${component.style?.rotation || 0}deg)`,
      overflow: 'hidden',
      wordWrap: 'break-word',
    };

    switch (component.type) {
      case 'text':
        return (
          <div style={baseStyle}>
            {getDisplayContent()}
          </div>
        );
      
      case 'image':
        return (
          <img
            src={component.src || dataBinding?.value || 'https://via.placeholder.com/200'}
            alt=""
            style={{
              ...baseStyle,
              objectFit: 'cover',
            }}
            draggable={false}
          />
        );
      
      case 'container':
        return (
          <div
            style={{
              ...baseStyle,
              border: component.style?.border || '1px dashed rgba(255,255,255,0.3)',
              minHeight: 100,
            }}
          >
            {component.children?.map((childId) => (
              <div key={childId} data-child-id={childId} />
            ))}
          </div>
        );
      
      case 'shape':
        return (
          <div
            style={{
              ...baseStyle,
              backgroundColor: component.style?.backgroundColor || '#1890ff',
              borderRadius: component.style?.shape === 'circle' ? '50%' : 0,
            }}
          />
        );
      
      case 'scoreboard':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#1a1a1a', border: '2px solid #1890ff' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
              0 : 0
            </div>
          </div>
        );
      
      case 'timer':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#1a1a1a', border: '2px solid #1890ff' }}>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', fontFamily: 'monospace' }}>
              00:00:00
            </div>
          </div>
        );
      
      case 'ranking':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#1a1a1a', border: '2px solid #1890ff' }}>
            <div style={{ fontSize: 14, color: '#fff', textAlign: 'center' }}>
              🏆 排名榜
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#fff', fontSize: 24 }}>▶</div>
          </div>
        );

      // Bedwars风格组件
      case 'teamRect':
        return (
          <div style={{ 
            ...baseStyle, 
            backgroundColor: component.style?.teamColor || '#0066CC',
            border: '3px solid rgba(255,255,255,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
              {component.content || '队伍名称'}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
              床: ✓ | 玩家: 4
            </div>
          </div>
        );

      case 'gameTimer':
        return (
          <div style={{ 
            ...baseStyle, 
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.2)',
          }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#fff', fontFamily: 'monospace' }}>
              15:00
            </div>
          </div>
        );

      case 'refereeMessage':
        return (
          <div style={{ 
            ...baseStyle, 
            backgroundColor: 'rgba(0,0,0,0.9)',
            borderRadius: 12,
            border: '2px solid #ffcc00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}>
            <div style={{ fontSize: 18, color: '#ffcc00', textAlign: 'center' }}>
              ⚠️ 裁判消息
            </div>
          </div>
        );

      // PVP风格组件
      case 'playerScore':
        return (
          <div style={{ 
            ...baseStyle, 
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: 8,
            border: '2px solid #fff',
            padding: '16px',
          }}>
            <div style={{ fontSize: 16, color: '#fff', marginBottom: 8 }}>玩家名称</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ffcc00' }}>2</div>
              <div style={{ fontSize: 14, color: '#ff4d4f' }}>❤ 13/20</div>
            </div>
          </div>
        );

      case 'itemCard':
        return (
          <div style={{ 
            ...baseStyle, 
            backgroundColor: 'rgba(139,69,19,0.9)',
            borderRadius: 8,
            border: '3px solid #8B4513',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: 24, color: '#fff' }}>🗡️ 剑</div>
          </div>
        );

      case 'refereeBar':
        return (
          <div style={{ 
            ...baseStyle, 
            backgroundColor: 'rgba(0,0,0,0.85)',
            borderRadius: 20,
            border: '2px solid #ffcc00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: 16, color: '#ffcc00', fontWeight: 'bold' }}>
              裁判消息
            </div>
          </div>
        );

      // 运动员列表组件
      case 'playerList':
        return (
          <div style={{ 
            ...baseStyle, 
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 8,
            padding: '12px',
            overflow: 'auto',
          }}>
            <div style={{ fontSize: 14, color: '#fff', marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 4 }}>
              🏃 运动员列表
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                <span style={{ color: '#fff' }}>运动员 {i}</span>
                <span style={{ color: '#52c41a' }}>进行中</span>
              </div>
            ))}
          </div>
        );

      case 'playerItem':
        return (
          <div style={{ 
            ...baseStyle, 
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            gap: 12,
          }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>1</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: '#fff' }}>运动员名称</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Level 5 | 时间: 45s</div>
            </div>
          </div>
        );

      // OR显示组件
      case 'orDisplay':
        return (
          <div style={{ 
            ...baseStyle, 
            backgroundColor: 'rgba(255,215,0,0.9)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid #FFD700',
            boxShadow: '0 0 20px rgba(255,215,0,0.5)',
          }}>
            <div style={{ fontSize: 14, color: '#000', fontWeight: 'bold' }}>OR</div>
            <div style={{ fontSize: 28, color: '#000', fontWeight: 'bold' }}>奥运纪录</div>
            <div style={{ fontSize: 16, color: '#000' }}>9.58s</div>
          </div>
        );

      case 'timerControl':
        return (
          <div style={{ 
            ...baseStyle, 
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', fontFamily: 'monospace' }}>
              00:45.23
            </div>
            <div style={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: '#52c41a',
              animation: 'pulse 1s infinite',
            }} />
          </div>
        );

      case 'statusIndicator':
        return (
          <div style={{ 
            ...baseStyle, 
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
          }}>
            <div style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: '#52c41a',
            }} />
            <span style={{ color: '#fff', fontSize: 14 }}>已连接</span>
          </div>
        );

      default:
        return (
          <div style={baseStyle}>
            {getDisplayContent()}
          </div>
        );
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: component.x,
        top: component.y,
        cursor: isDragging ? 'grabbing' : 'move',
        zIndex: component.zIndex || 1,
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            border: '2px solid #1890ff',
            pointerEvents: 'none',
          }}
        >
          {['nw', 'ne', 'sw', 'se'].map((pos) => (
            <div
              key={pos}
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                backgroundColor: '#1890ff',
                ...(pos.includes('n') ? { top: -4 } : { bottom: -4 }),
                ...(pos.includes('w') ? { left: -4 } : { right: -4 }),
              }}
            />
          ))}
        </div>
      )}

      {dataBinding && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: 0,
            backgroundColor: '#1890ff',
            color: '#fff',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '3px',
          }}
        >
          {dataBinding.variableName}
        </div>
      )}

      {renderComponent()}
    </div>
  );
};

export default CanvasComponent;
