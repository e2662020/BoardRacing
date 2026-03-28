import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { ComponentData } from '../../types';

interface GridItemProps {
  component: ComponentData;
  isSelected: boolean;
  dataBinding?: any;
  onSelect: () => void;
  onUpdate: (updates: Partial<ComponentData>) => void;
  onDelete: () => void;
  onDrag: (x: number, y: number) => void;
  scale: number;
  gridSize: number;
  snapToGrid: boolean;
}

const GridItem: React.FC<GridItemProps> = ({
  component,
  isSelected,
  dataBinding,
  onSelect,
  onUpdate,
  onDelete,
  onDrag,
  scale,
  gridSize,
  snapToGrid,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // 处理拖拽开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 如果点击的是调整大小手柄，不处理拖拽
    if ((e.target as HTMLElement).dataset.resizeHandle) return;
    
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX / scale - component.x,
      y: e.clientY / scale - component.y,
    });
  }, [component.x, component.y, onSelect, scale]);

  // 处理调整大小开始
  const handleResizeStart = useCallback((e: React.MouseEvent, _handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: component.width || 100,
      h: component.height || 50,
    });
  }, [component.width, component.height]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        const newX = e.clientX / scale - dragStart.x;
        const newY = e.clientY / scale - dragStart.y;
        onDrag(Math.max(0, newX), Math.max(0, newY));
      }
      
      if (isResizing) {
        e.preventDefault();
        const deltaX = (e.clientX - resizeStart.x) / scale;
        const deltaY = (e.clientY - resizeStart.y) / scale;
        
        let newW = resizeStart.w + deltaX;
        let newH = resizeStart.h + deltaY;
        
        // 吸附到网格
        if (snapToGrid) {
          newW = Math.round(newW / gridSize) * gridSize;
          newH = Math.round(newH / gridSize) * gridSize;
        }
        
        // 最小尺寸限制
        newW = Math.max(gridSize, newW);
        newH = Math.max(gridSize, newH);
        
        onUpdate({ width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, onDrag, onUpdate, scale, gridSize, snapToGrid]);

  // 根据数据绑定获取显示内容
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

  // 渲染不同类型的组件
  const renderComponent = () => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
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
      pointerEvents: 'none', // 防止内部元素拦截鼠标事件
    };

    switch (component.type) {
      case 'text':
        return <div style={baseStyle}>{getDisplayContent()}</div>;

      case 'image':
        return (
          <img
            src={component.src || dataBinding?.value || 'https://via.placeholder.com/200'}
            alt=""
            style={{ ...baseStyle, objectFit: 'cover' }}
            draggable={false}
          />
        );

      case 'container':
        return (
          <div
            style={{
              ...baseStyle,
              border: component.style?.border || '1px dashed rgba(255,255,255,0.3)',
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
          <div style={{ ...baseStyle, backgroundColor: '#1a1a1a', border: '2px solid #1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>0 : 0</div>
          </div>
        );

      case 'timer':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#1a1a1a', border: '2px solid #1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', fontFamily: 'monospace' }}>00:00:00</div>
          </div>
        );

      case 'ranking':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#1a1a1a', border: '2px solid #1890ff', padding: '12px' }}>
            <div style={{ fontSize: 14, color: '#fff', textAlign: 'center', marginBottom: 8 }}>🏆 排名榜</div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: '#fff' }}>#{i} 玩家</span>
                <span style={{ color: '#ffcc00' }}>{100 - i * 10}分</span>
              </div>
            ))}
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
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>{component.content || '队伍名称'}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>床: ✓ | 玩家: 4</div>
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
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#fff', fontFamily: 'monospace' }}>15:00</div>
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
          }}>
            <div style={{ fontSize: 18, color: '#ffcc00', textAlign: 'center' }}>⚠️ 裁判消息</div>
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
            <div style={{ fontSize: 16, color: '#ffcc00', fontWeight: 'bold' }}>裁判消息</div>
          </div>
        );

      // 运动员列表组件
      case 'playerList':
        return (
          <div style={{
            ...baseStyle,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 8,
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
        return <div style={baseStyle}>{getDisplayContent()}</div>;
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: component.x,
        top: component.y,
        width: component.width || 100,
        height: component.height || 50,
        cursor: isDragging ? 'grabbing' : 'move',
        zIndex: isSelected ? 100 : (component.zIndex || 1),
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 选中框和调整大小手柄 */}
      {isSelected && (
        <>
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
          />
          {/* 四角调整手柄 */}
          {['nw', 'ne', 'sw', 'se'].map((pos) => (
            <div
              key={pos}
              data-resize-handle={pos}
              onMouseDown={(e) => handleResizeStart(e, pos)}
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                backgroundColor: '#1890ff',
                border: '2px solid #fff',
                borderRadius: '50%',
                cursor: pos === 'nw' || pos === 'se' ? 'nwse-resize' : 'nesw-resize',
                ...(pos.includes('n') ? { top: -5 } : { bottom: -5 }),
                ...(pos.includes('w') ? { left: -5 } : { right: -5 }),
                zIndex: 101,
              }}
            />
          ))}
        </>
      )}

      {/* 数据绑定指示器 */}
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
            pointerEvents: 'none',
          }}
        >
          {dataBinding.variableName}
        </div>
      )}

      {/* 删除按钮 */}
      {isSelected && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            position: 'absolute',
            top: -25,
            left: -2,
            width: 20,
            height: 20,
            backgroundColor: '#ff4d4f',
            color: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            cursor: 'pointer',
            zIndex: 102,
            border: '2px solid #fff',
          }}
          title="删除组件"
        >
          ×
        </div>
      )}

      {/* 组件内容 */}
      {renderComponent()}
    </div>
  );
};

export default GridItem;
