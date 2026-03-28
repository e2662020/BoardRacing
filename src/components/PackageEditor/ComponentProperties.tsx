import React, { useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Slider,
  Collapse,
  Button,
  Typography,
  Tabs,
  Tag,
  Space,
} from 'antd';
import {
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { ComponentData } from '../../types';

const { Text } = Typography;
const { Panel } = Collapse;

interface ComponentPropertiesProps {
  component: ComponentData | null;
  dataBinding?: any;
  onUpdate: (updates: Partial<ComponentData>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRemoveBinding: () => void;
}

const ComponentProperties: React.FC<ComponentPropertiesProps> = ({
  component,
  dataBinding,
  onUpdate,
  onDelete,
  onDuplicate,
  onRemoveBinding,
}) => {
  const [activeTab, setActiveTab] = useState('style');

  if (!component) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📋</div>
        <Text type="secondary" style={{ textAlign: 'center' }}>
          选择一个组件以编辑属性
        </Text>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 10,
        }}
      >
        <div>
          <Text style={{ fontWeight: 'bold', display: 'block', fontSize: '13px' }}>
            {component.name || '未命名组件'}
          </Text>
          <Tag color="blue" style={{ marginTop: '4px', fontSize: '11px' }}>
            {component.type}
          </Tag>
        </div>
        <Space>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={onDuplicate}
            title="复制"
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={onDelete}
            title="删除"
          />
        </Space>
      </div>

      {dataBinding && (
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#f6ffed',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text style={{ color: '#52c41a', fontSize: '11px', display: 'block' }}>
                数据绑定
              </Text>
              <Tag color="green" style={{ marginTop: '4px', fontSize: '11px' }}>
                {dataBinding.variableName}
              </Tag>
            </div>
            <Button size="small" onClick={onRemoveBinding}>
              解除
            </Button>
          </div>
        </div>
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ padding: '0 12px' }}
        size="small"
        items={[
          {
            key: 'style',
            label: '样式',
            children: (
              <Form layout="vertical" style={{ marginTop: '8px' }} size="small">
                <Collapse
                  defaultActiveKey={['basic', 'appearance']}
                  ghost
                  expandIconPosition="end"
                >
                  <Panel header="基础" key="basic">
                    <Form.Item label="内容">
                      <Input
                        value={component.content}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder="文本内容"
                      />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Form.Item label="X" style={{ flex: 1 }}>
                        <InputNumber
                          value={component.x}
                          onChange={(v) => onUpdate({ x: v || 0 })}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Form.Item label="Y" style={{ flex: 1 }}>
                        <InputNumber
                          value={component.y}
                          onChange={(v) => onUpdate({ y: v || 0 })}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Form.Item label="宽度" style={{ flex: 1 }}>
                        <InputNumber
                          value={component.width}
                          onChange={(v) => onUpdate({ width: v || 100 })}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Form.Item label="高度" style={{ flex: 1 }}>
                        <InputNumber
                          value={component.height}
                          onChange={(v) => onUpdate({ height: v || 100 })}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item label="层级">
                      <InputNumber
                        value={component.zIndex || 1}
                        onChange={(v) => onUpdate({ zIndex: v || 1 })}
                        style={{ width: '100%' }}
                        min={1}
                        max={999}
                      />
                    </Form.Item>
                  </Panel>

                  <Panel header="外观" key="appearance">
                    <Form.Item label="字体大小">
                      <InputNumber
                        value={component.style?.fontSize || 16}
                        onChange={(v) =>
                          onUpdate({
                            style: { ...component.style, fontSize: v || 16 },
                          })
                        }
                        style={{ width: '100%' }}
                        min={8}
                        max={200}
                      />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Form.Item label="文字颜色" style={{ flex: 1 }}>
                        <Input
                          type="color"
                          value={component.style?.color || '#ffffff'}
                          onChange={(e) =>
                            onUpdate({
                              style: { ...component.style, color: e.target.value },
                            })
                          }
                          style={{ width: '100%', height: '32px', padding: '2px' }}
                        />
                      </Form.Item>
                      <Form.Item label="背景颜色" style={{ flex: 1 }}>
                        <Input
                          type="color"
                          value={component.style?.backgroundColor || '#000000'}
                          onChange={(e) =>
                            onUpdate({
                              style: { ...component.style, backgroundColor: e.target.value },
                            })
                          }
                          style={{ width: '100%', height: '32px', padding: '2px' }}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item label="透明度">
                      <Slider
                        value={(component.style?.opacity ?? 1) * 100}
                        onChange={(v) =>
                          onUpdate({
                            style: { ...component.style, opacity: v / 100 },
                          })
                        }
                      />
                    </Form.Item>

                    <Form.Item label="旋转角度">
                      <InputNumber
                        value={component.style?.rotation || 0}
                        onChange={(v) =>
                          onUpdate({
                            style: { ...component.style, rotation: v || 0 },
                          })
                        }
                        style={{ width: '100%' }}
                        min={-360}
                        max={360}
                      />
                    </Form.Item>

                    <Form.Item label="圆角">
                      <InputNumber
                        value={component.style?.borderRadius || 0}
                        onChange={(v) =>
                          onUpdate({
                            style: { ...component.style, borderRadius: v || 0 },
                          })
                        }
                        style={{ width: '100%' }}
                        min={0}
                      />
                    </Form.Item>

                    <Form.Item label="边框">
                      <Input
                        value={component.style?.border || 'none'}
                        onChange={(e) =>
                          onUpdate({
                            style: { ...component.style, border: e.target.value },
                          })
                        }
                        placeholder="1px solid #fff"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Panel>
                </Collapse>
              </Form>
            ),
          },

          {
            key: 'data',
            label: '数据',
            children: (
              <div style={{ padding: '16px 0' }}>
                {dataBinding ? (
                  <div>
                    <Text style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                      已绑定变量: <Tag color="green">{dataBinding.variableName}</Tag>
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                      类型: {dataBinding.type === 'list' ? '列表' : '单个值'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                      来源表: {dataBinding.tableId}
                    </Text>
                    <Button
                      style={{ marginTop: '16px' }}
                      onClick={onRemoveBinding}
                      block
                      size="small"
                      danger
                    >
                      解除绑定
                    </Button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.3 }}>🔗</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      从数据表拖拽单元格到组件以创建绑定
                    </Text>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ComponentProperties;
