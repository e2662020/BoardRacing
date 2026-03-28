import React, { useRef, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import type { ComponentData, NodeData } from '../../types';
import CanvasComponent from './CanvasComponent';

interface CanvasProps {
  components: ComponentData[];
  nodes: NodeData[];
  selectedId?: string;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<ComponentData>) => void;
  onDelete: (id: string) => void;
  onDrop: (item: any, position: { x: number; y: number }) => void;
  dataBindings: Record<string, any>;
}

// 16:9 画布尺寸 - 1920x1080 是标准16:9分辨率
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const SCALE = 0.5; // 缩放比例，使画布适合屏幕

const Canvas: React.FC<CanvasProps> = ({
  components,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDrop,
  dataBindings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportPos, setViewportPos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // 使用react-dnd的useDrop
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['COMPONENT', 'TABLE_CELL', 'TABLE_RANGE'],
    drop: (item: any, monitor) => {
      // 获取相对于画布的偏移量
      const offset = monitor.getClientOffset();
      if (offset && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // 计算在画布上的实际位置（考虑缩放和视口位置）
        const x = (offset.x - rect.left - viewportPos.x) / SCALE;
        const y = (offset.y - rect.top - viewportPos.y) / SCALE;
        onDrop(item, { x, y });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  // 将drop ref绑定到容器
  drop(containerRef);

  const handleComponentDrag = useCallback((id: string, x: number, y: number) => {
    onUpdate(id, { x, y });
  }, [onUpdate]);

  // 处理画布平移（鼠标中键或空格+拖拽）
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 中键点击或按住空格键时平移
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

  // 处理画布点击，取消选择
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // 只有点击画布背景时才取消选择
    if (e.target === containerRef.current || (e.target as HTMLElement).dataset?.canvas === 'true') {
      onSelect(null);
    }
  }, [onSelect]);

  const sortedComponents = [...components].sort((a, b) => {
    // 容器在后面渲染，确保子元素在容器上方
    if (a.type === 'container' && b.type !== 'container') return 1;
    if (a.type !== 'container' && b.type === 'container') return -1;
    return (a.zIndex || 0) - (b.zIndex || 0);
  });

  return (
    <div
      ref={containerRef}
      data-canvas="true"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        position: 'relative',
        cursor: isPanning ? 'grabbing' : canDrop ? 'copy' : 'default',
      }}
    >
      {/* 视口容器 - 可以移动 */}
      <div
        style={{
          position: 'absolute',
          left: viewportPos.x,
          top: viewportPos.y,
          width: CANVAS_WIDTH * SCALE,
          height: CANVAS_HEIGHT * SCALE,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {/* 16:9 固定比例画布 */}
        <div
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: '#000',
            position: 'relative',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            border: isOver ? '4px dashed #1890ff' : '4px solid #333',
          }}
        >
          {/* 网格背景 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              pointerEvents: 'none',
            }}
          />

          {/* 安全区域标记 */}
          <div
            style={{
              position: 'absolute',
              top: '5%',
              left: '5%',
              right: '5%',
              bottom: '5%',
              border: '2px dashed rgba(255,255,255,0.1)',
              pointerEvents: 'none',
            }}
          />

          {/* 中心十字线 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: 'rgba(255,255,255,0.05)',
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
              backgroundColor: 'rgba(255,255,255,0.05)',
              pointerEvents: 'none',
            }}
          />

          {/* 尺寸标注 */}
          <div
            style={{
              position: 'absolute',
              top: -25,
              left: 0,
              color: '#666',
              fontSize: '12px',
            }}
          >
            {CANVAS_WIDTH} x {CANVAS_HEIGHT} (16:9)
          </div>

          {/* 组件渲染 */}
          {sortedComponents.map((component) => (
            <CanvasComponent
              key={component.id}
              component={component}
              isSelected={selectedId === component.id}
              dataBinding={dataBindings[component.id]}
              onSelect={() => onSelect(component.id)}
              onUpdate={(updates) => onUpdate(component.id, updates)}
              onDelete={() => onDelete(component.id)}
              onDrag={(x, y) => handleComponentDrag(component.id, x, y)}
              scale={SCALE}
            />
          ))}

          {/* 空状态提示 */}
          {components.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '24px',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div>拖拽组件到画布</div>
              <div style={{ fontSize: '16px', marginTop: '16px' }}>
                或从数据表拖拽单元格进行绑定
              </div>
              <div style={{ fontSize: '14px', marginTop: '24px', color: 'rgba(255,255,255,0.2)' }}>
                Shift+拖拽 移动画布
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 画布控制提示 */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '8px 12px',
          borderRadius: '4px',
          color: '#999',
          fontSize: '12px',
          pointerEvents: 'none',
        }}
      >
        位置: ({Math.round(-viewportPos.x / SCALE)}, {Math.round(-viewportPos.y / SCALE)})
      </div>
    </div>
  );
};

export default Canvas;
