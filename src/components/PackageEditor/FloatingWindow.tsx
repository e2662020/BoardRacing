import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from 'antd';
import { CloseOutlined, MinusOutlined } from '@ant-design/icons';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface FloatingWindowProps {
  id: string;
  title: string;
  defaultPosition: Position;
  defaultSize: Size;
  minSize?: Size;
  maxSize?: Size;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  id,
  title,
  defaultPosition,
  defaultSize,
  minSize = { width: 200, height: 150 },
  maxSize = { width: 800, height: 600 },
  children,
  onClose,
  onMinimize,
  className = '',
  style = {},
}) => {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [size, setSize] = useState<Size>(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState(false);
  
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const resizeStartPos = useRef<Position>({ x: 0, y: 0 });
  const resizeStartSize = useRef<Size>({ width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // 拖拽开始
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls') || 
        (e.target as HTMLElement).closest('.resize-handle')) {
      return;
    }
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  }, [position]);

  // 调整大小开始
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    setIsResizing(true);
    setResizeDirection(direction);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { width: size.width, height: size.height };
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

  // 鼠标移动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;
        
        // 限制在视口内
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - 40; // 保留标题栏可见
        
        setPosition({
          x: Math.max(0, Math.min(maxX, newX)),
          y: Math.max(0, Math.min(maxY, newY)),
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStartPos.current.x;
        const deltaY = e.clientY - resizeStartPos.current.y;
        
        let newWidth = resizeStartSize.current.width;
        let newHeight = resizeStartSize.current.height;
        let newX = position.x;
        let newY = position.y;

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStartSize.current.width + deltaX));
        }
        if (resizeDirection.includes('w')) {
          const proposedWidth = resizeStartSize.current.width - deltaX;
          if (proposedWidth >= minSize.width && proposedWidth <= maxSize.width) {
            newWidth = proposedWidth;
            newX = position.x + deltaX;
          }
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStartSize.current.height + deltaY));
        }
        if (resizeDirection.includes('n')) {
          const proposedHeight = resizeStartSize.current.height - deltaY;
          if (proposedHeight >= minSize.height && proposedHeight <= maxSize.height) {
            newHeight = proposedHeight;
            newY = position.y + deltaY;
          }
        }

        setSize({ width: newWidth, height: newHeight });
        if (newX !== position.x || newY !== position.y) {
          setPosition({ x: newX, y: newY });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection('');
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizing ? getResizeCursor(resizeDirection) : 'move';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing, resizeDirection, position, size, minSize, maxSize]);

  const getResizeCursor = (direction: string): string => {
    if (direction === 'n' || direction === 's') return 'ns-resize';
    if (direction === 'e' || direction === 'w') return 'ew-resize';
    if (direction === 'ne' || direction === 'sw') return 'nesw-resize';
    if (direction === 'nw' || direction === 'se') return 'nwse-resize';
    return 'default';
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize?.();
  };

  if (isMinimized) {
    return (
      <div
        ref={windowRef}
        className={`floating-window minimized ${className}`}
        style={{
          position: 'fixed',
          left: position.x,
          bottom: 0,
          width: 200,
          height: 32,
          backgroundColor: '#fff',
          border: '1px solid #d9d9d9',
          borderRadius: '4px 4px 0 0',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          cursor: 'pointer',
          ...style,
        }}
        onClick={() => setIsMinimized(false)}
      >
        <span style={{ flex: 1, fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={windowRef}
      id={id}
      className={`floating-window ${className}`}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        backgroundColor: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: isDragging || isResizing ? 1001 : 1000,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* 标题栏 */}
      <div
        className="window-titlebar"
        onMouseDown={handleDragStart}
        style={{
          height: 32,
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #d9d9d9',
          borderRadius: '4px 4px 0 0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
        <div className="window-controls" style={{ display: 'flex', gap: 4 }}>
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={handleMinimize}
          />
          {onClose && (
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={onClose}
            />
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div
        className="window-content"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 0,
        }}
      >
        {children}
      </div>

      {/* 调整大小手柄 */}
      {/* 东 */}
      <div
        className="resize-handle resize-e"
        onMouseDown={(e) => handleResizeStart(e, 'e')}
        style={{
          position: 'absolute',
          right: 0,
          top: 32,
          bottom: 0,
          width: 6,
          cursor: 'ew-resize',
        }}
      />
      {/* 南 */}
      <div
        className="resize-handle resize-s"
        onMouseDown={(e) => handleResizeStart(e, 's')}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 6,
          cursor: 'ns-resize',
        }}
      />
      {/* 西 */}
      <div
        className="resize-handle resize-w"
        onMouseDown={(e) => handleResizeStart(e, 'w')}
        style={{
          position: 'absolute',
          left: 0,
          top: 32,
          bottom: 0,
          width: 6,
          cursor: 'ew-resize',
        }}
      />
      {/* 北 */}
      <div
        className="resize-handle resize-n"
        onMouseDown={(e) => handleResizeStart(e, 'n')}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 32,
          height: 6,
          cursor: 'ns-resize',
        }}
      />
      {/* 东南 */}
      <div
        className="resize-handle resize-se"
        onMouseDown={(e) => handleResizeStart(e, 'se')}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 12,
          height: 12,
          cursor: 'nwse-resize',
        }}
      />
      {/* 西南 */}
      <div
        className="resize-handle resize-sw"
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: 12,
          height: 12,
          cursor: 'nesw-resize',
        }}
      />
      {/* 东北 */}
      <div
        className="resize-handle resize-ne"
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
        style={{
          position: 'absolute',
          right: 0,
          top: 32,
          width: 12,
          height: 12,
          cursor: 'nesw-resize',
        }}
      />
      {/* 西北 */}
      <div
        className="resize-handle resize-nw"
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
        style={{
          position: 'absolute',
          left: 0,
          top: 32,
          width: 12,
          height: 12,
          cursor: 'nwse-resize',
        }}
      />
    </div>
  );
};

export default FloatingWindow;
