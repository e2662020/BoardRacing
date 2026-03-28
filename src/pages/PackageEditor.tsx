import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Layout,
  Button,
  Space,
  Input,
  message,
  Tooltip,
  Modal,
  Tag,
  Form,
  Select,
} from 'antd';
import {
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { usePackageStore, useDataTableStore } from '../stores';
import type { ComponentData, NodeData, Package, DataTable, ColumnDef } from '../types';
import { v4 as uuidv4 } from 'uuid';

import DraggablePalette from '../components/PackageEditor/DraggablePalette';
import ComponentProperties from '../components/PackageEditor/ComponentProperties';
import NodeEditor from '../components/PackageEditor/NodeEditor';
import DataTablePanel from '../components/PackageEditor/DataTablePanel';
import LuckysheetTable from '../components/PackageEditor/LuckysheetTable';
import GridCanvas from '../components/PackageEditor/GridCanvas';
import PreviewModal from '../components/PackageEditor/PreviewModal';
import FloatingWindow from '../components/PackageEditor/FloatingWindow';

const { Header } = Layout;

const generateId = () => uuidv4();

const PackageEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dataBindings, setDataBindings] = useState<Record<string, any>>({});
  const [showDataTableModal, setShowDataTableModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [newTableForm] = Form.useForm();

  const [isWindowMode, setIsWindowMode] = useState(false);
  
  const [showPalette, setShowPalette] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showDataTable, setShowDataTable] = useState(true);
  const [showNodeEditor, setShowNodeEditor] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const { packages, addPackage, updatePackage } = usePackageStore();
  const { tables, addTable } = useDataTableStore();

  const [currentPackage, setCurrentPackage] = useState<Package>({
    id: id || generateId(),
    name: '新建包装',
    description: '',
    tags: [],
    components: [],
    nodes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'current-user',
    isTemplate: false,
  });

  useEffect(() => {
    if (id) {
      const existingPackage = packages.find((p) => p.id === id);
      if (existingPackage) {
        setCurrentPackage(existingPackage);
      }
    }
  }, [id, packages]);

  useEffect(() => {
    if (tables.length > 0 && !selectedTableId) {
      setSelectedTableId(tables[0].id);
    }
  }, [tables, selectedTableId]);

  // 自动保存已禁用，仅显示保存状态
  const [lastSaved, setLastSaved] = useState<string>('');

  useEffect(() => {
    if (packages.find((p) => p.id === currentPackage.id)) {
      setLastSaved(new Date().toLocaleTimeString());
    }
  }, [currentPackage.id, packages]);

  const handleSave = useCallback(() => {
    const updatedPackage = {
      ...currentPackage,
      updatedAt: new Date().toISOString(),
    };

    if (packages.find((p) => p.id === currentPackage.id)) {
      updatePackage(currentPackage.id, updatedPackage);
    } else {
      addPackage(updatedPackage);
    }

    message.success('已保存');
  }, [currentPackage, packages, addPackage, updatePackage]);

  const handleDrop = useCallback((item: any, position: { x: number; y: number }) => {
    if (item.type === 'COMPONENT') {
      const newComponent: ComponentData = {
        id: generateId(),
        type: item.componentType || item.defaultProps?.type || 'text',
        name: `${item.componentType || item.defaultProps?.type || 'text'}_${currentPackage.components.length + 1}`,
        x: position.x,
        y: position.y,
        width: item.defaultProps?.width || 200,
        height: item.defaultProps?.height || 100,
        content: item.defaultProps?.content || '',
        src: item.defaultProps?.src,
        style: {
          fontSize: 16,
          color: '#ffffff',
          backgroundColor: 'transparent',
          opacity: 1,
          rotation: 0,
          borderRadius: 0,
          ...item.defaultProps?.style,
        },
        animation: {
          type: 'none',
          duration: 500,
          delay: 0,
          easing: 'easeOut',
        },
        visible: true,
        locked: false,
        parentId: null,
        children: [],
      };

      setCurrentPackage((prev) => ({
        ...prev,
        components: [...prev.components, newComponent],
      }));

      setSelectedComponentId(newComponent.id);
      message.success('组件已添加');
    } else if (item.type === 'TABLE_CELL') {
      const newComponent: ComponentData = {
        id: generateId(),
        type: 'text',
        name: `data_${item.columnName}_${item.rowIndex + 1}`,
        x: position.x,
        y: position.y,
        width: 200,
        height: 40,
        content: String(item.value || ''),
        style: {
          fontSize: 16,
          color: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.7)',
          opacity: 1,
          rotation: 0,
          borderRadius: 4,
          padding: 8,
        },
        animation: {
          type: 'none',
          duration: 500,
          delay: 0,
          easing: 'easeOut',
        },
        visible: true,
        locked: false,
        parentId: null,
        children: [],
      };

      setCurrentPackage((prev) => ({
        ...prev,
        components: [...prev.components, newComponent],
      }));

      const bindingVariable = `${item.columnName}_${item.rowIndex + 1}`;
      setDataBindings((prev) => ({
        ...prev,
        [newComponent.id]: {
          variableName: bindingVariable,
          type: 'single',
          tableId: item.tableId,
          rowIndex: item.rowIndex,
          colIndex: item.colIndex,
          columnName: item.columnName,
          value: item.value,
        },
      }));

      setSelectedComponentId(newComponent.id);
      message.success(`已绑定数据: ${bindingVariable}`);
    }
  }, [currentPackage.components.length]);

  const handleUpdateComponent = useCallback((id: string, updates: Partial<ComponentData>) => {
    setCurrentPackage((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  }, []);

  const handleDeleteComponent = useCallback((id: string) => {
    setCurrentPackage((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
    }));
    setSelectedComponentId(null);

    setDataBindings((prev) => {
      const newBindings = { ...prev };
      delete newBindings[id];
      return newBindings;
    });

    message.success('组件已删除');
  }, []);

  const handleDuplicateComponent = useCallback(() => {
    if (!selectedComponentId) return;

    const component = currentPackage.components.find((c) => c.id === selectedComponentId);
    if (!component) return;

    const newComponent: ComponentData = {
      ...component,
      id: generateId(),
      name: `${component.name}_copy`,
      x: component.x + 20,
      y: component.y + 20,
    };

    setCurrentPackage((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));

    setSelectedComponentId(newComponent.id);
    message.success('组件已复制');
  }, [selectedComponentId, currentPackage.components]);

  const handleAddNode = useCallback((type: string, x: number, y: number) => {
    const newNode: NodeData = {
      id: generateId(),
      type,
      x,
      y,
      inputs: [],
      outputs: [],
      config: {},
    };

    setCurrentPackage((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
  }, []);

  const handleUpdateNode = useCallback((id: string, updates: Partial<NodeData>) => {
    setCurrentPackage((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setCurrentPackage((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== id),
    }));
  }, []);

  const handleConnectNodes = useCallback((fromNodeId: string, fromPort: string, toNodeId: string, toPort: string) => {
    console.log('连接节点:', fromNodeId, fromPort, '->', toNodeId, toPort);
  }, []);

  const handleRemoveBinding = useCallback(() => {
    if (selectedComponentId) {
      setDataBindings((prev) => {
        const newBindings = { ...prev };
        delete newBindings[selectedComponentId];
        return newBindings;
      });
      message.success('绑定已解除');
    }
  }, [selectedComponentId]);

  const handleCreateTable = (values: any) => {
    const templatePresets: Record<string, { columns: ColumnDef[]; rows: any[] }> = {
      empty: {
        columns: [
          { key: 'col1', title: '列1', type: 'text' as const },
        ],
        rows: [],
      },
      athletes: {
        columns: [
          { key: 'name', title: '姓名', type: 'text' as const },
          { key: 'country', title: '国家/地区', type: 'text' as const },
          { key: 'event', title: '项目', type: 'text' as const },
          { key: 'score', title: '成绩', type: 'text' as const },
          { key: 'rank', title: '排名', type: 'number' as const },
        ],
        rows: [
          { name: '示例运动员1', country: '中国', event: '100米', score: '10.00', rank: 1 },
          { name: '示例运动员2', country: '美国', event: '100米', score: '10.05', rank: 2 },
        ],
      },
      scores: {
        columns: [
          { key: 'rank', title: '排名', type: 'number' as const },
          { key: 'lane', title: '道次', type: 'number' as const },
          { key: 'name', title: '姓名', type: 'text' as const },
          { key: 'country', title: '国家', type: 'text' as const },
          { key: 'score', title: '成绩', type: 'text' as const },
          { key: 'remark', title: '备注', type: 'text' as const },
        ],
        rows: [
          { rank: 1, lane: 4, name: '运动员A', country: 'CHN', score: '9.83', remark: 'PB' },
          { rank: 2, lane: 5, name: '运动员B', country: 'USA', score: '9.88', remark: '' },
          { rank: 3, lane: 3, name: '运动员C', country: 'JPN', score: '9.95', remark: 'SB' },
        ],
      },
      schedule: {
        columns: [
          { key: 'time', title: '时间', type: 'text' as const },
          { key: 'event', title: '项目', type: 'text' as const },
          { key: 'round', title: '轮次', type: 'text' as const },
          { key: 'status', title: '状态', type: 'text' as const },
        ],
        rows: [
          { time: '09:00', event: '男子100米', round: '预赛', status: '进行中' },
          { time: '10:30', event: '女子跳远', round: '决赛', status: '待开始' },
        ],
      },
    };

    const preset = templatePresets[values.template] || templatePresets.empty;

    const newTable: DataTable = {
      id: generateId(),
      name: values.name,
      description: values.description,
      columns: preset.columns,
      rows: preset.rows,
      tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTable(newTable);
    setSelectedTableId(newTable.id);
    setShowDataTableModal(false);
    newTableForm.resetFields();
    message.success('数据表创建成功');
  };

  const selectedComponent = currentPackage.components.find(
    (c) => c.id === selectedComponentId
  ) || null;

  return (
    <Layout style={{ height: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #d9d9d9',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/packages')}
          >
            返回
          </Button>
          <Input
            value={currentPackage.name}
            onChange={(e) =>
              setCurrentPackage((prev) => ({ ...prev, name: e.target.value }))
            }
            style={{ width: '200px' }}
            placeholder="包装名称"
          />
          <Tag color="blue">{currentPackage.tags?.join(', ') || '无标签'}</Tag>
        </Space>

        <Space>
          {lastSaved && (
            <span style={{ color: '#52c41a', fontSize: '12px' }}>
              已保存 {lastSaved}
            </span>
          )}
          <Tooltip title="撤销">
            <Button icon={<UndoOutlined />} />
          </Tooltip>
          <Tooltip title="重做">
            <Button icon={<RedoOutlined />} />
          </Tooltip>
          <Button
            icon={<EyeOutlined />}
            onClick={() => setPreviewOpen(true)}
          >
            预览
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
          >
            保存
          </Button>
        </Space>
      </Header>

      {!isWindowMode && (
        <>
          {showPalette && (
            <div
              style={{
                position: 'fixed',
                left: 0,
                top: 56,
                bottom: 0,
                width: 260,
                backgroundColor: '#fff',
                borderRight: '1px solid #d9d9d9',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div 
                className="panel-header"
                onMouseDown={() => setIsWindowMode(true)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #d9d9d9',
                  backgroundColor: '#fafafa',
                  cursor: 'move',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontWeight: 'bold' }}>组件库</span>
                <span style={{ fontSize: '12px', color: '#999' }}>拖拽以窗口化</span>
              </div>
              <div style={{ height: 'calc(100% - 45px)', overflow: 'auto' }}>
                <DraggablePalette collapsed={false} onToggle={() => setShowPalette(false)} />
              </div>
            </div>
          )}

          {showProperties && (
            <div
              style={{
                position: 'fixed',
                right: 0,
                top: 56,
                bottom: 0,
                width: 300,
                backgroundColor: '#fff',
                borderLeft: '1px solid #d9d9d9',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div 
                className="panel-header"
                onMouseDown={() => setIsWindowMode(true)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #d9d9d9',
                  backgroundColor: '#fafafa',
                  cursor: 'move',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontWeight: 'bold' }}>属性面板</span>
                <span style={{ fontSize: '12px', color: '#999' }}>拖拽以窗口化</span>
              </div>
              <div style={{ height: 'calc(100% - 45px)', overflow: 'auto', padding: '16px' }}>
                <ComponentProperties
                  component={selectedComponent}
                  dataBinding={selectedComponentId ? dataBindings[selectedComponentId] : undefined}
                  onUpdate={(updates) =>
                    selectedComponentId && handleUpdateComponent(selectedComponentId, updates)
                  }
                  onDelete={() => selectedComponentId && handleDeleteComponent(selectedComponentId)}
                  onDuplicate={handleDuplicateComponent}
                  onRemoveBinding={handleRemoveBinding}
                />
              </div>
            </div>
          )}

          {showDataTable && (
            <div
              style={{
                position: 'fixed',
                left: showPalette ? 260 : 0,
                right: showProperties ? 300 : 0,
                bottom: 0,
                height: 250,
                backgroundColor: '#fff',
                borderTop: '1px solid #d9d9d9',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div 
                className="panel-header"
                onMouseDown={() => setIsWindowMode(true)}
                style={{
                  padding: '8px 16px',
                  borderBottom: '1px solid #d9d9d9',
                  backgroundColor: '#fafafa',
                  cursor: 'move',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontWeight: 'bold' }}>数据表</span>
                <span style={{ fontSize: '12px', color: '#999' }}>拖拽以窗口化</span>
              </div>
              <div style={{ height: 'calc(100% - 37px)', overflow: 'auto' }}>
                <DataTablePanel
                  tables={tables}
                  selectedTableId={selectedTableId}
                  onSelectTable={setSelectedTableId}
                  onCreateTable={() => setShowDataTableModal(true)}
                />
              </div>
            </div>
          )}
        </>
      )}

      {isWindowMode && (
        <>
          {showPalette && (
            <FloatingWindow
              id="palette-window"
              title="组件库"
              defaultPosition={{ x: 236, y: 64 }}
              defaultSize={{ width: 260, height: 500 }}
              minSize={{ width: 200, height: 200 }}
              maxSize={{ width: 400, height: 800 }}
              onClose={() => setShowPalette(false)}
            >
              <DraggablePalette collapsed={false} onToggle={() => setShowPalette(false)} />
            </FloatingWindow>
          )}

          {showProperties && (
            <FloatingWindow
              id="properties-window"
              title="属性面板"
              defaultPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 320 : 1000, y: 64 }}
              defaultSize={{ width: 300, height: 500 }}
              minSize={{ width: 250, height: 300 }}
              maxSize={{ width: 500, height: 800 }}
              onClose={() => setShowProperties(false)}
            >
              <ComponentProperties
                component={selectedComponent}
                dataBinding={selectedComponentId ? dataBindings[selectedComponentId] : undefined}
                onUpdate={(updates) =>
                  selectedComponentId && handleUpdateComponent(selectedComponentId, updates)
                }
                onDelete={() => selectedComponentId && handleDeleteComponent(selectedComponentId)}
                onDuplicate={handleDuplicateComponent}
                onRemoveBinding={handleRemoveBinding}
              />
            </FloatingWindow>
          )}

          {showDataTable && (
            <FloatingWindow
              id="datatable-window"
              title="数据表"
              defaultPosition={{ x: 236, y: typeof window !== 'undefined' ? window.innerHeight - 400 : 500 }}
              defaultSize={{ width: 700, height: 350 }}
              minSize={{ width: 500, height: 250 }}
              maxSize={{ width: 1200, height: 600 }}
              onClose={() => setShowDataTable(false)}
            >
              <LuckysheetTable
                tables={tables}
                selectedTableId={selectedTableId}
                onSelectTable={setSelectedTableId}
                onCreateTable={() => setShowDataTableModal(true)}
              />
            </FloatingWindow>
          )}

          {showNodeEditor && (
            <FloatingWindow
              id="nodeeditor-window"
              title="节点编辑器"
              defaultPosition={{ x: 500, y: 150 }}
              defaultSize={{ width: 600, height: 400 }}
              minSize={{ width: 400, height: 300 }}
              maxSize={{ width: 1000, height: 700 }}
              onClose={() => setShowNodeEditor(false)}
            >
              <NodeEditor
                nodes={currentPackage.nodes}
                onAddNode={handleAddNode}
                onUpdateNode={handleUpdateNode}
                onDeleteNode={handleDeleteNode}
                onConnect={handleConnectNodes}
              />
            </FloatingWindow>
          )}
        </>
      )}

      <Layout 
        ref={containerRef}
        style={{ 
          flex: 1, 
          overflow: 'hidden', 
          position: 'relative',
          marginLeft: !isWindowMode && showPalette ? 260 : 0,
          marginRight: !isWindowMode && showProperties ? 300 : 0,
          marginBottom: !isWindowMode && showDataTable ? 250 : 0,
        }}
      >
        <GridCanvas
          components={currentPackage.components}
          selectedId={selectedComponentId || undefined}
          onSelect={setSelectedComponentId}
          onUpdate={handleUpdateComponent}
          onDelete={handleDeleteComponent}
          onDrop={handleDrop}
          dataBindings={dataBindings}
          gridSize={20}
          showGrid={true}
          snapToGrid={true}
        />
      </Layout>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        components={currentPackage.components}
        dataTables={tables}
        dataBindings={dataBindings}
      />

      <Modal
        title="新建数据表"
        open={showDataTableModal}
        onCancel={() => {
          setShowDataTableModal(false);
          newTableForm.resetFields();
        }}
        onOk={() => newTableForm.submit()}
        width={500}
      >
        <Form
          form={newTableForm}
          layout="vertical"
          onFinish={handleCreateTable}
          initialValues={{ template: 'empty' }}
        >
          <Form.Item
            name="name"
            label="表名称"
            rules={[{ required: true, message: '请输入表名称' }]}
          >
            <Input placeholder="例如: 男子100米决赛成绩" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={2} placeholder="数据表描述（可选）" />
          </Form.Item>

          <Form.Item
            name="template"
            label="模板"
            extra="选择预设模板快速创建数据表"
          >
            <Select
              options={[
                { value: 'empty', label: '空白表格' },
                { value: 'athletes', label: '运动员信息表' },
                { value: 'scores', label: '成绩排名表' },
                { value: 'schedule', label: '赛程时间表' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
            extra="多个标签用逗号分隔"
          >
            <Input placeholder="例如: 田径, 决赛" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default PackageEditor;
