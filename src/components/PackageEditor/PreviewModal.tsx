import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Modal, Button, Space, Tabs, Card, Select, Slider, Switch, Tooltip, Divider } from 'antd';
import { 
  CloseOutlined, 
  FullscreenOutlined, 
  FullscreenExitOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined,
  LeftOutlined,
  RightOutlined,
  ThunderboltOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import type { ComponentData, DataTable } from '../../types';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  components: ComponentData[];
  dataTables: DataTable[];
  dataBindings: Record<string, any>;
}

const RESOLUTIONS = [
  { value: '1920x1080', label: '1920×1080 (Full HD)' },
  { value: '3840x2160', label: '3840×2160 (4K)' },
  { value: '1280x720', label: '1280×720 (HD)' },
];

const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  components,
  dataTables,
  dataBindings,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [zoomLevel, setZoomLevel] = useState(0.5);
  const [showGrid, setShowGrid] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [resolution, setResolution] = useState('1920x1080');
  const [showAnimations, setShowAnimations] = useState(true);
  const [currentRowIndex, setCurrentRowIndex] = useState<Record<string, number>>({});
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(2000);

  const timerRef = useRef<number | null>(null);

  const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = useMemo(() => {
    const [w, h] = resolution.split('x').map(Number);
    return { width: w, height: h };
  }, [resolution]);

  useEffect(() => {
    if (autoPlay) {
      timerRef.current = window.setInterval(() => {
        setCurrentRowIndex(prev => {
          const next = { ...prev };
          dataTables.forEach(table => {
            if (table.rows.length > 0) {
              const current = prev[table.id] || 0;
              next[table.id] = (current + 1) % table.rows.length;
            }
          });
          return next;
        });
      }, autoPlaySpeed);
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [autoPlay, autoPlaySpeed, dataTables]);

  useEffect(() => {
    if (open) {
      const initial: Record<string, number> = {};
      dataTables.forEach(table => {
        initial[table.id] = 0;
      });
      setCurrentRowIndex(initial);
    }
  }, [open, dataTables]);

  const getDisplayContent = (componentId: string, defaultContent: string) => {
    const binding = dataBindings[componentId];
    if (binding) {
      const table = dataTables.find(t => t.id === binding.tableId);
      if (table && table.rows.length > 0) {
        const rowIndex = currentRowIndex[binding.tableId] || 0;
        const row = table.rows[rowIndex];
        if (row) {
          return String(row[binding.columnName] || binding.value || defaultContent);
        }
      }
      return binding.value || defaultContent;
    }
    return defaultContent;
  };

  const getAnimationStyle = (component: ComponentData) => {
    if (!showAnimations || !component.animation || component.animation.type === 'none') {
      return {};
    }

    const { type, duration, delay, easing } = component.animation;
    const animations: Record<string, string> = {
      fadeIn: 'fadeIn',
      slideInLeft: 'slideInLeft',
      slideInRight: 'slideInRight',
      slideInUp: 'slideInUp',
      slideInDown: 'slideInDown',
      bounce: 'bounce',
      pulse: 'pulse',
      shake: 'shake',
    };

    return {
      animation: `${animations[type] || 'fadeIn'} ${duration}ms ${easing} ${delay}ms both infinite`,
    };
  };

  const renderPreviewComponent = (component: ComponentData) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
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
      zIndex: component.zIndex || 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: component.style?.textAlign === 'center' ? 'center' : 
                    component.style?.textAlign === 'right' ? 'flex-end' : 'flex-start',
      ...getAnimationStyle(component),
    };

    switch (component.type) {
      case 'text':
        return (
          <div key={component.id} style={baseStyle}>
            {getDisplayContent(component.id, component.content || '')}
          </div>
        );

      case 'image':
        return (
          <img
            key={component.id}
            src={component.src || dataBindings[component.id]?.value || 'https://via.placeholder.com/200'}
            alt=""
            style={{
              ...baseStyle,
              objectFit: 'cover',
              padding: 0,
            }}
          />
        );

      case 'container':
        return (
          <div key={component.id} style={baseStyle}>
            {component.children?.map((childId) => {
              const child = components.find((c) => c.id === childId);
              return child ? renderPreviewComponent(child) : null;
            })}
          </div>
        );

      case 'shape':
        return (
          <div
            key={component.id}
            style={{
              ...baseStyle,
              backgroundColor: component.style?.backgroundColor || '#34AA2C',
              borderRadius: component.style?.shape === 'circle' ? '50%' : 0,
            }}
          />
        );

      default:
        return (
          <div key={component.id} style={baseStyle}>
            {getDisplayContent(component.id, component.content || '')}
          </div>
        );
    }
  };

  const handlePrevRow = (tableId: string) => {
    const table = dataTables.find(t => t.id === tableId);
    if (table && table.rows.length > 0) {
      setCurrentRowIndex(prev => ({
        ...prev,
        [tableId]: ((prev[tableId] || 0) - 1 + table.rows.length) % table.rows.length,
      }));
    }
  };

  const handleNextRow = (tableId: string) => {
    const table = dataTables.find(t => t.id === tableId);
    if (table && table.rows.length > 0) {
      setCurrentRowIndex(prev => ({
        ...prev,
        [tableId]: ((prev[tableId] || 0) + 1) % table.rows.length,
      }));
    }
  };

  const sortedComponents = [...components].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={isFullscreen ? '100vw' : 1400}
      style={{ top: isFullscreen ? 0 : 20 }}
      styles={{
        body: {
          height: isFullscreen ? '100vh' : '90vh',
          padding: 0,
          backgroundColor: '#0a0a0a',
        },
      }}
      footer={null}
      closable={false}
      mask={{ closable: false }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 工具栏 */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#1a1a1a',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'preview', label: '预览' },
              { key: 'data', label: '数据表' },
            ]}
            size="small"
          />
          
          {activeTab === 'preview' && (
            <Space size="small" wrap>
              <Select
                value={resolution}
                onChange={setResolution}
                options={RESOLUTIONS}
                style={{ width: 180 }}
                size="small"
                prefix={<DesktopOutlined />}
              />
              
              <Tooltip title="缩放">
                <Space>
                  <ZoomOutOutlined style={{ color: '#fff', cursor: 'pointer' }} onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))} />
                  <span style={{ color: '#fff', minWidth: 50, textAlign: 'center' }}>{Math.round(zoomLevel * 100)}%</span>
                  <ZoomInOutlined style={{ color: '#fff', cursor: 'pointer' }} onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))} />
                </Space>
              </Tooltip>
              
              <Switch
                checked={showGrid}
                onChange={setShowGrid}
                checkedChildren="网格"
                unCheckedChildren="网格"
                size="small"
              />
              
              <Switch
                checked={showSafeArea}
                onChange={setShowSafeArea}
                checkedChildren="安全区"
                unCheckedChildren="安全区"
                size="small"
              />
              
              <Switch
                checked={showAnimations}
                onChange={setShowAnimations}
                checkedChildren={<ThunderboltOutlined />}
                unCheckedChildren={<ThunderboltOutlined />}
                size="small"
              />
            </Space>
          )}
          
          {activeTab === 'data' && dataTables.length > 0 && (
            <Space size="small">
              <Switch
                checked={autoPlay}
                onChange={setAutoPlay}
                checkedChildren="自动播放"
                unCheckedChildren="自动播放"
                size="small"
              />
              {autoPlay && (
                <div style={{ width: 120 }}>
                  <Slider
                    min={500}
                    max={5000}
                    step={500}
                    value={autoPlaySpeed}
                    onChange={setAutoPlaySpeed}
                    tooltip={{ formatter: (v) => `${v}ms` }}
                  />
                </div>
              )}
            </Space>
          )}
          
          <Space>
            <Button
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => setIsFullscreen(!isFullscreen)}
              size="small"
            >
              {isFullscreen ? '退出全屏' : '全屏'}
            </Button>
            <Button icon={<CloseOutlined />} onClick={onClose} size="small" danger>
              关闭
            </Button>
          </Space>
        </div>

        {/* 内容区域 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {activeTab === 'preview' ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100%',
              }}
            >
              <div
                style={{
                  width: CANVAS_WIDTH * zoomLevel,
                  height: CANVAS_HEIGHT * zoomLevel,
                  backgroundColor: '#000',
                  position: 'relative',
                  boxShadow: '0 0 40px rgba(0,0,0,0.9)',
                  transformOrigin: 'center center',
                }}
              >
                {/* 网格背景 */}
                {showGrid && (
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
                      backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* 安全区域 */}
                {showSafeArea && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '5%',
                      left: '5%',
                      right: '5%',
                      bottom: '5%',
                      border: '1px dashed rgba(255,100,100,0.3)',
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: -20,
                        left: 0,
                        color: 'rgba(255,100,100,0.5)',
                        fontSize: 10,
                      }}
                    >
                      安全区域 (90%)
                    </div>
                  </div>
                )}

                {/* 渲染组件 */}
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                }}>
                  {sortedComponents.map((component) => renderPreviewComponent(component))}
                </div>

                {/* 分辨率标签 */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 12,
                    fontFamily: 'monospace',
                  }}
                >
                  {CANVAS_WIDTH} × {CANVAS_HEIGHT}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {dataTables.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                  暂无数据表
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
                  {dataTables.map((table) => (
                    <Card
                      key={table.id}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{table.name}</span>
                          {table.rows.length > 0 && (
                            <Space>
                              <Button 
                                icon={<LeftOutlined />} 
                                size="small" 
                                onClick={() => handlePrevRow(table.id)}
                                disabled={table.rows.length <= 1}
                              />
                              <span style={{ color: '#fff', minWidth: 60, textAlign: 'center' }}>
                                {(currentRowIndex[table.id] || 0) + 1} / {table.rows.length}
                              </span>
                              <Button 
                                icon={<RightOutlined />} 
                                size="small" 
                                onClick={() => handleNextRow(table.id)}
                                disabled={table.rows.length <= 1}
                              />
                            </Space>
                          )}
                        </div>
                      }
                      size="small"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      headStyle={{ color: '#fff', borderBottom: '1px solid #333' }}
                    >
                      {table.columns.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          暂无字段
                        </div>
                      ) : table.rows.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          暂无数据
                        </div>
                      ) : (
                        <>
                          <table style={{ width: '100%', color: '#fff' }}>
                            <thead>
                              <tr>
                                {table.columns.map((col) => (
                                  <th 
                                    key={col.key} 
                                    style={{ 
                                      padding: '10px', 
                                      borderBottom: '1px solid #333', 
                                      textAlign: 'left',
                                      backgroundColor: '#222',
                                      fontSize: 12,
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {col.title}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const rowIndex = currentRowIndex[table.id] || 0;
                                const row = table.rows[rowIndex];
                                if (!row) return null;
                                return (
                                  <tr key={rowIndex} style={{ backgroundColor: '#151515' }}>
                                    {table.columns.map((col) => (
                                      <td 
                                        key={col.key} 
                                        style={{ 
                                          padding: '12px', 
                                          borderBottom: '1px solid #222',
                                          fontSize: 14,
                                        }}
                                      >
                                        {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '-'}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })()}
                            </tbody>
                          </table>
                          <Divider style={{ margin: '12px 0', borderColor: '#333' }} />
                          <div style={{ color: '#666', fontSize: 12 }}>
                            共 {table.rows.length} 条数据，{table.columns.length} 个字段
                          </div>
                        </>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PreviewModal;
