import React, { useRef, useState, useCallback } from 'react';
import type { NodeData } from '../../types';

interface NodeEditorProps {
  nodes: NodeData[];
  onAddNode: (type: string, x: number, y: number) => void;
  onUpdateNode: (id: string, updates: Partial<NodeData>) => void;
  onDeleteNode: (id: string) => void;
  onConnect: (fromNodeId: string, fromPort: string, toNodeId: string, toPort: string) => void;
}

// 节点定义
interface NodeDefinition {
  type: string;
  label: string;
  category: string;
  color: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
}

interface PortDefinition {
  id: string;
  label: string;
  type: 'flow' | 'value';
}

// 节点类型定义
const nodeDefinitions: NodeDefinition[] = [
  // 事件节点
  { type: 'event_start', label: '开始', category: 'event', color: '#4CAF50', inputs: [], outputs: [{ id: 'out', label: '执行', type: 'flow' }] },
  { type: 'event_tick', label: '每帧更新', category: 'event', color: '#4CAF50', inputs: [], outputs: [{ id: 'out', label: '执行', type: 'flow' }] },
  
  // 逻辑节点
  { type: 'if', label: '如果', category: 'logic', color: '#FF9800', inputs: [{ id: 'in', label: '执行', type: 'flow' }, { id: 'condition', label: '条件', type: 'value' }], outputs: [{ id: 'true', label: '真', type: 'flow' }, { id: 'false', label: '假', type: 'flow' }] },
  { type: 'and', label: '与', category: 'logic', color: '#FF9800', inputs: [{ id: 'a', label: 'A', type: 'value' }, { id: 'b', label: 'B', type: 'value' }], outputs: [{ id: 'out', label: '结果', type: 'value' }] },
  { type: 'or', label: '或', category: 'logic', color: '#FF9800', inputs: [{ id: 'a', label: 'A', type: 'value' }, { id: 'b', label: 'B', type: 'value' }], outputs: [{ id: 'out', label: '结果', type: 'value' }] },
  
  // 数据节点
  { type: 'get_variable', label: '获取变量', category: 'data', color: '#2196F3', inputs: [], outputs: [{ id: 'value', label: '值', type: 'value' }] },
  { type: 'set_variable', label: '设置变量', category: 'data', color: '#2196F3', inputs: [{ id: 'in', label: '执行', type: 'flow' }, { id: 'value', label: '值', type: 'value' }], outputs: [{ id: 'out', label: '执行', type: 'flow' }] },
  
  // UI节点
  { type: 'show_component', label: '显示组件', category: 'ui', color: '#9C27B0', inputs: [{ id: 'in', label: '执行', type: 'flow' }], outputs: [{ id: 'out', label: '执行', type: 'flow' }] },
  { type: 'hide_component', label: '隐藏组件', category: 'ui', color: '#9C27B0', inputs: [{ id: 'in', label: '执行', type: 'flow' }], outputs: [{ id: 'out', label: '执行', type: 'flow' }] },
  { type: 'set_text', label: '设置文本', category: 'ui', color: '#9C27B0', inputs: [{ id: 'in', label: '执行', type: 'flow' }, { id: 'text', label: '文本', type: 'value' }], outputs: [{ id: 'out', label: '执行', type: 'flow' }] },
  
  // 时间节点
  { type: 'delay', label: '延迟', category: 'time', color: '#607D8B', inputs: [{ id: 'in', label: '执行', type: 'flow' }, { id: 'seconds', label: '秒', type: 'value' }], outputs: [{ id: 'out', label: '执行', type: 'flow' }] },
  
  // 常量节点
  { type: 'string', label: '字符串', category: 'constant', color: '#795548', inputs: [], outputs: [{ id: 'value', label: '值', type: 'value' }] },
  { type: 'number', label: '数字', category: 'constant', color: '#795548', inputs: [], outputs: [{ id: 'value', label: '值', type: 'value' }] },
  { type: 'boolean', label: '布尔', category: 'constant', color: '#795548', inputs: [], outputs: [{ id: 'value', label: '值', type: 'value' }] },
];

// 分类
const categories = [
  { id: 'event', label: '事件', color: '#4CAF50' },
  { id: 'logic', label: '逻辑', color: '#FF9800' },
  { id: 'data', label: '数据', color: '#2196F3' },
  { id: 'ui', label: 'UI', color: '#9C27B0' },
  { id: 'time', label: '时间', color: '#607D8B' },
  { id: 'constant', label: '常量', color: '#795548' },
];

interface Connection {
  fromNodeId: string;
  fromPort: string;
  toNodeId: string;
  toPort: string;
}

const NodeEditor: React.FC<NodeEditorProps> = ({
  nodes,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onConnect,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ nodeId: string; portId: string; isInput: boolean } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [connections, setConnections] = useState<Connection[]>([]);

  // 画布平移
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === canvasRef.current)) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  }, [offset]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: (e.clientX - rect.left - offset.x) / scale,
        y: (e.clientY - rect.top - offset.y) / scale,
      });
    }

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (draggingNodeId) {
      const node = nodes.find(n => n.id === draggingNodeId);
      if (node && rect) {
        const newX = (e.clientX - rect.left - offset.x) / scale - nodeDragStart.x;
        const newY = (e.clientY - rect.top - offset.y) / scale - nodeDragStart.y;
        onUpdateNode(draggingNodeId, { x: newX, y: newY });
      }
    }
  }, [isDragging, draggingNodeId, dragStart, nodeDragStart, offset, scale, nodes, onUpdateNode]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggingNodeId(null);
    
    // 完成连接
    if (connecting) {
      setConnecting(null);
    }
  }, [connecting]);

  // 缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.3, Math.min(2, prev * delta)));
    }
  }, []);

  // 节点拖拽
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    const node = nodes.find(n => n.id === nodeId);
    if (rect && node) {
      setDraggingNodeId(nodeId);
      setNodeDragStart({
        x: (e.clientX - rect.left - offset.x) / scale - node.x,
        y: (e.clientY - rect.top - offset.y) / scale - node.y,
      });
    }
  }, [nodes, offset, scale]);

  // 端口连接
  const handlePortMouseDown = useCallback((e: React.MouseEvent, nodeId: string, portId: string, isInput: boolean) => {
    e.stopPropagation();
    setConnecting({ nodeId, portId, isInput });
  }, []);

  const handlePortMouseUp = useCallback((e: React.MouseEvent, nodeId: string, portId: string, isInput: boolean) => {
    e.stopPropagation();
    if (connecting && connecting.isInput !== isInput) {
      const from = connecting.isInput ? { nodeId, portId } : { nodeId: connecting.nodeId, portId: connecting.portId };
      const to = connecting.isInput ? { nodeId: connecting.nodeId, portId: connecting.portId } : { nodeId, portId };
      
      const newConnection: Connection = {
        fromNodeId: from.nodeId,
        fromPort: from.portId,
        toNodeId: to.nodeId,
        toPort: to.portId,
      };
      
      setConnections(prev => [...prev, newConnection]);
      onConnect(from.nodeId, from.portId, to.nodeId, to.portId);
    }
    setConnecting(null);
  }, [connecting, onConnect]);

  // 从左侧拖拽添加节点
  const handlePaletteDragStart = useCallback((e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('nodeType', nodeType);
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    if (nodeType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;
      onAddNode(nodeType, x, y);
    }
  }, [offset, scale, onAddNode]);

  // 获取端口位置
  const getPortPosition = (nodeId: string, portId: string, isInput: boolean) => {
    const node = nodes.find(n => n.id === nodeId);
    const nodeDef = nodeDefinitions.find(d => d.type === node?.type);
    if (!node || !nodeDef) return { x: 0, y: 0 };

    const ports = isInput ? nodeDef.inputs : nodeDef.outputs;
    const portIndex = ports.findIndex(p => p.id === portId);
    const portHeight = 30;
    const headerHeight = 40;
    
    return {
      x: node.x + (isInput ? 0 : 200),
      y: node.y + headerHeight + portIndex * portHeight + 15,
    };
  };

  // 渲染连接线
  const renderConnections = () => {
    return connections.map((conn, index) => {
      const from = getPortPosition(conn.fromNodeId, conn.fromPort, false);
      const to = getPortPosition(conn.toNodeId, conn.toPort, true);
      
      const midX = (from.x + to.x) / 2;
      const path = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
      
      return (
        <path
          key={index}
          d={path}
          fill="none"
          stroke="#fff"
          strokeWidth="2"
        />
      );
    });
  };

  // 渲染正在拖拽的连接线
  const renderDraggingConnection = () => {
    if (!connecting) return null;
    
    const from = getPortPosition(connecting.nodeId, connecting.portId, connecting.isInput);
    const path = `M ${from.x} ${from.y} L ${mousePos.x} ${mousePos.y}`;
    
    return (
      <path
        d={path}
        fill="none"
        stroke="#1890ff"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    );
  };

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#1a1a1a' }}>
      {/* 左侧节点库 */}
      <div style={{ width: '220px', borderRight: '1px solid #333', overflowY: 'auto', padding: '12px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 16px 0', fontSize: '14px' }}>节点库</h3>
        {categories.map(cat => (
          <div key={cat.id} style={{ marginBottom: '16px' }}>
            <div style={{ color: cat.color, fontSize: '12px', marginBottom: '8px', fontWeight: 'bold' }}>
              {cat.label}
            </div>
            {nodeDefinitions
              .filter(n => n.category === cat.id)
              .map(nodeDef => (
                <div
                  key={nodeDef.type}
                  draggable
                  onDragStart={(e) => handlePaletteDragStart(e, nodeDef.type)}
                  style={{
                    padding: '8px 12px',
                    marginBottom: '6px',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '4px',
                    cursor: 'grab',
                    color: '#fff',
                    fontSize: '13px',
                    borderLeft: `3px solid ${nodeDef.color}`,
                  }}
                >
                  {nodeDef.label}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* 画布区域 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* 工具栏 */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 100, display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setScale(prev => Math.min(2, prev * 1.2))}
            style={{ padding: '6px 12px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            放大
          </button>
          <button
            onClick={() => setScale(prev => Math.max(0.3, prev / 1.2))}
            style={{ padding: '6px 12px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            缩小
          </button>
          <button
            onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
            style={{ padding: '6px 12px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            重置
          </button>
          <span style={{ color: '#888', padding: '6px 12px' }}>缩放: {Math.round(scale * 100)}%</span>
        </div>

        {/* 画布 */}
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleWheel}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#0d0d0d',
            backgroundImage: `
              linear-gradient(#1a1a1a 1px, transparent 1px),
              linear-gradient(90deg, #1a1a1a 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            cursor: isDragging ? 'grabbing' : 'default',
          }}
        >
          {/* SVG 连接线层 */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: '0 0',
            }}
          >
            {renderConnections()}
            {renderDraggingConnection()}
          </svg>

          {/* 节点层 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: '0 0',
            }}
          >
            {nodes.map(node => {
              const nodeDef = nodeDefinitions.find(d => d.type === node.type);
              if (!nodeDef) return null;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  style={{
                    position: 'absolute',
                    left: node.x,
                    top: node.y,
                    width: '200px',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    border: selectedNodeId === node.id ? `2px solid ${nodeDef.color}` : '2px solid transparent',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    cursor: draggingNodeId === node.id ? 'grabbing' : 'grab',
                  }}
                >
                  {/* 节点头部 */}
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: nodeDef.color,
                      borderRadius: '6px 6px 0 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>{nodeDef.label}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        lineHeight: '18px',
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* 输入端口 */}
                  {nodeDef.inputs.map(input => (
                    <div
                      key={input.id}
                      style={{
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        onMouseDown={(e) => handlePortMouseDown(e, node.id, input.id, true)}
                        onMouseUp={(e) => handlePortMouseUp(e, node.id, input.id, true)}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: input.type === 'flow' ? '#4CAF50' : '#2196F3',
                          border: '2px solid #fff',
                          cursor: 'crosshair',
                        }}
                      />
                      <span style={{ color: '#aaa', fontSize: '12px' }}>{input.label}</span>
                    </div>
                  ))}

                  {/* 输出端口 */}
                  {nodeDef.outputs.map(output => (
                    <div
                      key={output.id}
                      style={{
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px',
                      }}
                    >
                      <span style={{ color: '#aaa', fontSize: '12px' }}>{output.label}</span>
                      <div
                        onMouseDown={(e) => handlePortMouseDown(e, node.id, output.id, false)}
                        onMouseUp={(e) => handlePortMouseUp(e, node.id, output.id, false)}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: output.type === 'flow' ? '#4CAF50' : '#2196F3',
                          border: '2px solid #fff',
                          cursor: 'crosshair',
                        }}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;
