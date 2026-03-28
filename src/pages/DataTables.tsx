import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Popconfirm,
  message,
  Tabs,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  ExportOutlined,
  TableOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useDataTableStore } from '../stores';
import type { DataTable, ColumnDef, RowData } from '../types';
import { v4 as uuidv4 } from 'uuid';

const { TabPane } = Tabs;

// Luckysheet iframe 编辑器组件
interface LuckysheetEditorProps {
  table: DataTable;
  onChange: (data: any) => void;
  readOnly?: boolean;
}

const LuckysheetEditor: React.FC<LuckysheetEditorProps> = ({ table, onChange, readOnly = false }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  // 转换数据为Luckysheet格式
  const transformDataToSheet = useCallback(() => {
    const celldata: any[] = [];
    
    // 添加表头
    table.columns.forEach((col, index) => {
      celldata.push({
        r: 0,
        c: index,
        v: {
          ct: { fa: 'General', t: 'g' },
          m: col.title,
          v: col.title,
          bl: 1,
          bg: '#E6E8EB',
          fc: '#000000',
        },
      });
    });

    // 添加数据
    table.rows.forEach((row, rowIndex) => {
      table.columns.forEach((col, colIndex) => {
        const value = row[col.key] !== undefined ? row[col.key] : '';
        celldata.push({
          r: rowIndex + 1,
          c: colIndex,
          v: {
            ct: { fa: 'General', t: typeof value === 'number' ? 'n' : 'g' },
            m: String(value),
            v: value,
          },
        });
      });
    });

    return celldata;
  }, [table]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = (e: MessageEvent) => {
      const { type, data: messageData } = e.data;

      if (type === 'ready') {
        setIsReady(true);
        // 发送初始化数据
        iframe.contentWindow?.postMessage({
          type: 'init',
          data: {
            title: table.name,
            readOnly,
            celldata: transformDataToSheet(),
          }
        }, '*');
      }

      if (type === 'dataChange') {
        onChange(messageData);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [table.id, readOnly, transformDataToSheet, onChange]);

  // 数据变化时更新iframe
  useEffect(() => {
    if (isReady && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'updateData',
        data: {
          celldata: transformDataToSheet(),
        }
      }, '*');
    }
  }, [table.rows, table.columns, isReady, transformDataToSheet]);

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      {!isReady && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
        }}>
          加载表格编辑器...
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/luckysheet-editor.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: isReady ? 'block' : 'none',
        }}
        title="Luckysheet Editor"
      />
    </div>
  );
};

const DataTablesPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState('list');
  const [editingTable, setEditingTable] = useState<DataTable | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<DataTable | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const { tables, addTable, updateTable, deleteTable } = useDataTableStore();

  // 过滤表格
  const filteredTables = tables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchText.toLowerCase()) ||
      table.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      table.tags?.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()))
  );

  // 打开编辑器
  const handleOpenEditor = (table: DataTable) => {
    setCurrentTable(table);
    setIsEditorOpen(true);
  };

  // 处理表格数据变化
  const handleTableChange = (sheetData: any) => {
    if (!currentTable) return;

    // 解析Luckysheet数据
    const sheet = sheetData[0];
    if (!sheet || !sheet.data) return;

    const data = sheet.data;
    const newRows: RowData[] = [];

    // 从第2行开始读取数据（第1行是表头）
    for (let i = 1; i < data.length; i++) {
      const row: RowData = {};
      data[i].forEach((cell: any, index: number) => {
        const colKey = currentTable.columns[index]?.key || `col${index}`;
        row[colKey] = cell ? cell.v : '';
      });
      newRows.push(row);
    }

    updateTable(currentTable.id, { ...currentTable, rows: newRows });
  };

  // 列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <TableOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '列数',
      dataIndex: 'columns',
      key: 'columnCount',
      width: 80,
      render: (columns: ColumnDef[]) => columns.length,
    },
    {
      title: '行数',
      dataIndex: 'rows',
      key: 'rowCount',
      width: 80,
      render: (rows: RowData[]) => rows.length,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags?.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: DataTable) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleOpenEditor(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            属性
          </Button>
          <Popconfirm
            title="确认删除"
            description="删除后无法恢复，是否继续？"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理新建
  const handleCreate = () => {
    setEditingTable(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 处理编辑
  const handleEdit = (table: DataTable) => {
    setEditingTable(table);
    form.setFieldsValue({
      name: table.name,
      description: table.description,
      tags: table.tags,
    });
    setIsModalOpen(true);
  };

  // 处理删除
  const handleDelete = (id: string) => {
    deleteTable(id);
    message.success('数据表已删除');
  };

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTable) {
        updateTable(editingTable.id, {
          ...editingTable,
          ...values,
          updatedAt: new Date().toISOString(),
        });
        message.success('数据表已更新');
      } else {
        const newTable: DataTable = {
          id: uuidv4(),
          name: values.name,
          description: values.description,
          columns: [
            { key: 'col1', title: '列1', type: 'text' },
            { key: 'col2', title: '列2', type: 'text' },
            { key: 'col3', title: '列3', type: 'text' },
          ],
          rows: [],
          tags: values.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addTable(newTable);
        message.success('数据表已创建');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // 处理导入
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const newTable: DataTable = {
          id: uuidv4(),
          name: data.name || '导入的数据表',
          description: data.description || '',
          columns: data.columns || [],
          rows: data.rows || [],
          tags: data.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addTable(newTable);
        message.success('数据表导入成功');
      } catch (error) {
        message.error('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    return false;
  };

  // 处理导出
  const handleExport = (table: DataTable) => {
    const dataStr = JSON.stringify(table, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${table.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('数据表已导出');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="数据表列表" key="list">
          <Card
            title="数据表管理"
            extra={
              <Space>
                <Input.Search
                  placeholder="搜索数据表"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                  allowClear
                />
                <Upload
                  accept=".json"
                  showUploadList={false}
                  beforeUpload={handleImport}
                >
                  <Button icon={<ImportOutlined />}>导入</Button>
                </Upload>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  新建数据表
                </Button>
              </Space>
            }
          >
            <Table
              dataSource={filteredTables}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingTable ? '编辑数据表' : '新建数据表'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入数据表名称' }]}
          >
            <Input placeholder="请输入数据表名称" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="输入标签"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Luckysheet编辑器弹窗 */}
      <Modal
        title={currentTable?.name}
        open={isEditorOpen}
        onCancel={() => setIsEditorOpen(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="export" icon={<ExportOutlined />} onClick={() => currentTable && handleExport(currentTable)}>
            导出
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsEditorOpen(false)}>
            关闭
          </Button>,
        ]}
      >
        {currentTable && (
          <LuckysheetEditor
            table={currentTable}
            onChange={handleTableChange}
          />
        )}
      </Modal>
    </div>
  );
};

export default DataTablesPage;
