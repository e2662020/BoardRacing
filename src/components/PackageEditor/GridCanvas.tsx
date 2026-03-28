import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { ComponentData } from '../../types';
import GridItem from './GridItem';
import { useThemeStore } from '../../stores';

interface GridCanvasProps {
  components: ComponentData[];
  selectedId?: string;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<ComponentData>) => void;
  onDelete: (id: string) => void;
  onDrop: (item: any, gridPosition: { x: number; y: number }) => void;
  dataBindings: Record<string, any>;
  gridSize?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
}

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const DEFAULT_SCALE = 0.5;

const GridCanvas: React.FC<GridCanvasProps> = ({
  components,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDrop,
  dataBindings,
  gridSize = 20,
  showGrid = true,
  snapToGrid = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [viewportPos, setViewportPos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { theme } = useThemeStore();

  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        
        if (rect.width > 0 && rect.height > 0) {
          const canvasDisplayWidth = CANVAS_WIDTH * scale;
          const canvasDisplayHeight = CANVAS_HEIGHT * scale;
          setViewportPos(prev => {
            if (prev.x === 0 && prev.y === 0) {
              return {
                x: (rect.width - canvasDisplayWidth) / 2,
                y: (rect.height - canvasDisplayHeight) / 2,
              };
            }
            return prev;
          });
        }
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    const timers = [
      setTimeout(updateContainerSize, 50),
      setTimeout(updateContainerSize, 100),
      setTimeout(updateContainerSize, 200),
      setTimeout(updateContainerSize, 500),
      setTimeout(updateContainerSize, 1000),
    ];
    
    return () => {
      window.removeEventListener('resize', updateContainerSize);
      timers.forEach(clearTimeout);
    };
  }, [scale]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.1, Math.min(2, prev * delta)));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewportPos.x, y: e.clientY - viewportPos.y });
    }
  }, [viewportPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      e.preventDefault();
      setViewportPos({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === containerRef.current) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    try {
      const jsonData = e.dataTransfer.getData('application/json');
      const textData = e.dataTransfer.getData('text/plain');
      
      let data = null;
      
      if (jsonData) {
        data = JSON.parse(jsonData);
      } else if (textData) {
        data = JSON.parse(textData);
      }
      
      if (data && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        
        let x: number, y: number;
        
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          x = (e.clientX - rect.left) / scale;
          y = (e.clientY - rect.top) / scale;
        } else {
          x = CANVAS_WIDTH / 2;
          y = CANVAS_HEIGHT / 2;
        }
        
        const snappedX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
        const snappedY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;
        
        onDrop(data, { x: snappedX, y: snappedY });
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  }, [onDrop, scale, gridSize, snapToGrid]);

  const handleItemDrag = useCallback((id: string, x: number, y: number) => {
    const snappedX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
    const snappedY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;
    onUpdate(id, { x: snappedX, y: snappedY });
  }, [onUpdate, gridSize, snapToGrid]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === canvasRef.current) {
      onSelect(null);
    }
  }, [onSelect]);

  const gridBackground = showGrid ? {
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
  } : {};

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: theme === 'oreui' ? '#313233' : '#f0f2f5',
        position: 'relative',
        cursor: isPanning ? 'grabbing' : 'default',
      }}
    >
      <div
        ref={canvasRef}
        style={{
          position: 'absolute',
          left: viewportPos.x,
          top: viewportPos.y,
          width: CANVAS_WIDTH * scale,
          height: CANVAS_HEIGHT * scale,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          transition: isPanning ? 'none' : 'left 0.05s, top 0.05s',
        }}
      >
        <div
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: '#fff',
            position: 'relative',
            boxShadow: '0 0 30px rgba(0,0,0,0.5)',
            border: isDraggingOver ? '4px dashed #1890ff' : '2px solid #ccc',
            transition: 'border-color 0.2s',
            ...gridBackground,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '5%',
              left: '5%',
              right: '5%',
              bottom: '5%',
              border: '1px dashed rgba(0,0,0,0.15)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: 'rgba(0,0,0,0.08)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: 'rgba(0,0,0,0.08)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: -30,
              left: 0,
              color: '#666',
              fontSize: '12px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
          >
            {CANVAS_WIDTH} x {CANVAS_HEIGHT} (16:9)
          </div>

          {components.map((component) => (
            <GridItem
              key={component.id}
              component={component}
              isSelected={selectedId === component.id}
              dataBinding={dataBindings[component.id]}
              onSelect={() => onSelect(component.id)}
              onUpdate={(updates) => onUpdate(component.id, updates)}
              onDelete={() => onDelete(component.id)}
              onDrag={(x, y) => handleItemDrag(component.id, x, y)}
              scale={scale}
              gridSize={gridSize}
              snapToGrid={snapToGrid}
            />
          ))}

          {components.length === 0 && !isDraggingOver && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'rgba(0,0,0,0.4)',
                fontSize: '24px',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ marginBottom: '16px', fontSize: '48px', opacity: 0.5 }}>📦</div>
              <div>拖拽组件到画布</div>
              <div style={{ fontSize: '14px', marginTop: '12px', color: 'rgba(0,0,0,0.3)' }}>
                或从底部数据表拖拽单元格进行数据绑定
              </div>
            </div>
          )}

          {isDraggingOver && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(24, 144, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'rgba(24, 144, 255, 0.9)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                释放以放置组件
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: theme === 'oreui' ? '#48494A' : 'rgba(0,0,0,0.7)',
          border: theme === 'oreui' ? '2px solid #58585A' : '1px solid rgba(255,255,255,0.2)',
          padding: '8px 12px',
          borderRadius: '4px',
          color: '#FFFFFF',
          fontSize: '12px',
          pointerEvents: 'none',
          display: 'flex',
          gap: '16px',
          fontFamily: theme === 'oreui' ? '"NotoSans Bold", sans-serif' : 'inherit',
        }}
      >
        <span>组件: {components.length}</span>
        <span>缩放: {Math.round(scale * 100)}%</span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setScale(prev => Math.max(0.1, prev - 0.1))}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            border: theme === 'oreui' ? '2px solid #58585A' : '1px solid #444',
            backgroundColor: theme === 'oreui' ? '#48494A' : '#222',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontFamily: theme === 'oreui' ? '"NotoSans Bold", sans-serif' : 'inherit',
            fontSize: '14px',
          }}
        >
          -
        </button>
        <button
          onClick={() => setScale(DEFAULT_SCALE)}
          style={{
            padding: '0 12px',
            height: '32px',
            borderRadius: '4px',
            border: theme === 'oreui' ? '2px solid #58585A' : '1px solid #444',
            backgroundColor: theme === 'oreui' ? '#48494A' : '#222',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: theme === 'oreui' ? '"NotoSans Bold", sans-serif' : 'inherit',
          }}
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            border: theme === 'oreui' ? '2px solid #58585A' : '1px solid #444',
            backgroundColor: theme === 'oreui' ? '#48494A' : '#222',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontFamily: theme === 'oreui' ? '"NotoSans Bold", sans-serif' : 'inherit',
            fontSize: '14px',
          }}
        >
          +
        </button>
        <button
          onClick={() => {
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              const canvasDisplayWidth = CANVAS_WIDTH * scale;
              const canvasDisplayHeight = CANVAS_HEIGHT * scale;
              setViewportPos({
                x: (rect.width - canvasDisplayWidth) / 2,
                y: (rect.height - canvasDisplayHeight) / 2,
              });
            }
          }}
          style={{
            padding: '0 12px',
            height: '32px',
            borderRadius: '4px',
            border: theme === 'oreui' ? '2px solid #58585A' : '1px solid #444',
            backgroundColor: theme === 'oreui' ? '#48494A' : '#222',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: theme === 'oreui' ? '"NotoSans Bold", sans-serif' : 'inherit',
          }}
        >
          居中
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: theme === 'oreui' ? '#48494A' : 'rgba(0,0,0,0.7)',
          border: theme === 'oreui' ? '2px solid #58585A' : '1px solid rgba(255,255,255,0.2)',
          padding: '8px 12px',
          borderRadius: '4px',
          color: theme === 'oreui' ? '#D0D1D4' : '#999',
          fontSize: '11px',
          pointerEvents: 'none',
        }}
      >
        Shift+拖拽 移动画布 | Ctrl+滚轮 缩放
      </div>
    </div>
  );
};

export default GridCanvas;
