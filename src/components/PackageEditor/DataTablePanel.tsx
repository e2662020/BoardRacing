import React, { useState } from 'react';
import {
  Select,
  Button,
  Space,
  Typography,
  Tabs,
  Tag,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Dropdown,
  Tooltip,
  InputNumber,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DatabaseOutlined,
  PlusOutlined,
  DragOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ColumnHeightOutlined,
  ExportOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { DataTable, ColumnDef, RowData } from '../../types';
import { useDataTableStore } from '../../stores';

const { Text } = Typography;

interface DataTablePanelProps {
  tables: DataTable[];
  selectedTableId?: string;
  onSelectTable: (tableId: string) => void;
  onCreateTable: () => void;
}

const DraggableCell: React.FC<{
  value: any;
  rowIndex: number;
  colIndex: number;
  columnName: string;
  tableId: string;
}> = ({ value, rowIndex, colIndex, columnName, tableId }) => {
  const handleDragStart = (e: React.DragEvent) => {
    const dragData = {
      type: 'TABLE_CELL',
      tableId,
      rowIndex,
      colIndex,
      columnName,
      value,
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        padding: '8px',
        cursor: 'grab',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
        minHeight: '24px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#e6f7ff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {value !== undefined && value !== null ? String(value) : ''}
    </div>
  );
};

const DataTablePanel: React.FC<DataTablePanelProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  onCreateTable,
}) => {
  const [activeTab, setActiveTab] = useState('tables');
  const [editTableModalOpen, setEditTableModalOpen] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [rowModalOpen, setRowModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<DataTable | null>(null);
  const [editingColumn, setEditingColumn] = useState<ColumnDef | null>(null);
  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [editTableForm] = Form.useForm();
  const [columnForm] = Form.useForm();
  const [rowForm] = Form.useForm();

  const {
    updateTable,
    deleteTable,
    addColumn,
    updateColumn,
    deleteColumn,
    addRow,
    updateRow,
    deleteRow,
  } = useDataTableStore();

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const handleEditTable = () => {
    if (!selectedTable) return;
    setEditingTable(selectedTable);
    editTableForm.setFieldsValue({
      name: selectedTable.name,
      description: selectedTable.description,
      tags: selectedTable.tags?.join(', '),
    });
    setEditTableModalOpen(true);
  };

  const handleSaveTable = (values: any) => {
    if (!editingTable) return;
    updateTable(editingTable.id, {
      name: values.name,
      description: values.description,
      tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    });
    message.success('数据表更新成功');
    setEditTableModalOpen(false);
    setEditingTable(null);
  };

  const handleDeleteTable = () => {
    if (!selectedTableId) return;
    deleteTable(selectedTableId);
    message.success('数据表删除成功');
    onSelectTable('');
  };

  const handleAddColumn = () => {
    setEditingColumn(null);
    columnForm.resetFields();
    setColumnModalOpen(true);
  };

  const handleEditColumn = (column: ColumnDef) => {
    setEditingColumn(column);
    columnForm.setFieldsValue({
      key: column.key,
      title: column.title,
      type: column.type,
      width: column.width,
    });
    setColumnModalOpen(true);
  };

  const handleSaveColumn = (values: any) => {
    if (!selectedTableId) return;
    
    const columnData: Omit<ColumnDef, 'id'> = {
      key: values.key,
      title: values.title,
      type: values.type || 'text',
      width: values.width,
    };

    if (editingColumn) {
      updateColumn(selectedTableId, editingColumn.id!, columnData);
      message.success('字段更新成功');
    } else {
      addColumn(selectedTableId, columnData);
      message.success('字段添加成功');
    }
    
    setColumnModalOpen(false);
    setEditingColumn(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!selectedTableId) return;
    deleteColumn(selectedTableId, columnId);
    message.success('字段删除成功');
  };

  const handleAddRow = () => {
    setEditingRow(null);
    rowForm.resetFields();
    if (selectedTable) {
      const initialValues: any = {};
      selectedTable.columns.forEach(col => {
        initialValues[col.key] = '';
      });
      rowForm.setFieldsValue(initialValues);
    }
    setRowModalOpen(true);
  };

  const handleEditRow = (row: RowData) => {
    setEditingRow(row);
    rowForm.setFieldsValue(row);
    setRowModalOpen(true);
  };

  const handleSaveRow = (values: any) => {
    if (!selectedTableId) return;
    
    if (editingRow) {
      updateRow(selectedTableId, editingRow.id!, values);
      message.success('数据更新成功');
    } else {
      addRow(selectedTableId, values);
      message.success('数据添加成功');
    }
    
    setRowModalOpen(false);
    setEditingRow(null);
  };

  const handleDeleteRow = (rowId: string) => {
    if (!selectedTableId) return;
    deleteRow(selectedTableId, rowId);
    message.success('数据删除成功');
  };

  const handleExportTable = () => {
    if (!selectedTable) return;
    
    const exportData = {
      name: selectedTable.name,
      columns: selectedTable.columns,
      rows: selectedTable.rows,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  const handleDuplicateTable = () => {
    if (!selectedTable) return;
    const { addTable } = useDataTableStore.getState();
    addTable({
      name: `${selectedTable.name} (副本)`,
      description: selectedTable.description,
      columns: selectedTable.columns,
      rows: selectedTable.rows,
      tags: selectedTable.tags,
    });
    message.success('复制成功');
  };

  const tableMenuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑表信息',
      onClick: handleEditTable,
    },
    {
      key: 'duplicate',
      icon: <CopyOutlined />,
      label: '复制数据表',
      onClick: handleDuplicateTable,
    },
    {
      key: 'export',
      icon: <ExportOutlined />,
      label: '导出JSON',
      onClick: handleExportTable,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除数据表',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除数据表 "${selectedTable?.name}" 吗？此操作不可恢复。`,
          onOk: handleDeleteTable,
        });
      },
    },
  ];

  const getColumnMenuItems = (column: ColumnDef): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑字段',
      onClick: () => handleEditColumn(column),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除字段',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除字段 "${column.title}" 吗？`,
          onOk: () => handleDeleteColumn(column.id!),
        });
      },
    },
  ];

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ padding: '0 16px' }}
        items={[
          {
            key: 'tables',
            label: '数据表',
            children: (
              <div style={{ padding: '8px 0' }}>
                <div style={{ marginBottom: '16px' }}>
                  <Space style={{ width: '100%' }} direction="vertical">
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Select
                        value={selectedTableId}
                        onChange={onSelectTable}
                        placeholder="选择数据表"
                        style={{ width: '180px' }}
                        options={tables.map((t) => ({
                          value: t.id,
                          label: t.name,
                        }))}
                      />
                      {selectedTable && (
                        <Dropdown menu={{ items: tableMenuItems }} trigger={['click']}>
                          <Button icon={<MoreOutlined />} />
                        </Dropdown>
                      )}
                    </Space>
                    <Space>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={onCreateTable}
                      >
                        新建表
                      </Button>
                      {selectedTable && (
                        <>
                          <Button
                            icon={<ColumnHeightOutlined />}
                            onClick={handleAddColumn}
                          >
                            添加字段
                          </Button>
                          <Button
                            icon={<PlusOutlined />}
                            onClick={handleAddRow}
                          >
                            添加数据
                          </Button>
                        </>
                      )}
                    </Space>
                  </Space>
                </div>

                {selectedTable ? (
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {selectedTable.name}
                      </Text>
                      {selectedTable.description && (
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                          {selectedTable.description}
                        </Text>
                      )}
                      <div style={{ marginTop: '4px' }}>
                        {selectedTable.tags?.map((tag) => (
                          <Tag key={tag} color="blue" style={{ marginRight: '4px', marginBottom: '4px' }}>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                      <DragOutlined style={{ marginRight: '4px' }} />
                      拖拽单元格到画布进行绑定
                    </Text>

                    <div style={{ 
                      height: 200, 
                      overflow: 'auto',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {selectedTable.columns.map((col) => (
                              <th
                                key={col.key}
                                style={{
                                  padding: '8px',
                                  border: '1px solid #d9d9d9',
                                  backgroundColor: '#f5f5f5',
                                  fontWeight: 'bold',
                                  textAlign: 'left',
                                  position: 'relative',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{col.title}</span>
                                  <Dropdown menu={{ items: getColumnMenuItems(col) }} trigger={['click']}>
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<MoreOutlined />}
                                      style={{ padding: '0 4px' }}
                                    />
                                  </Dropdown>
                                </div>
                              </th>
                            ))}
                            <th
                              style={{
                                width: '50px',
                                padding: '8px',
                                border: '1px solid #d9d9d9',
                                backgroundColor: '#f5f5f5',
                              }}
                            >
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTable.rows.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex}>
                              {selectedTable.columns.map((col, colIndex) => (
                                <td
                                  key={col.key}
                                  style={{
                                    padding: '0',
                                    border: '1px solid #d9d9d9',
                                  }}
                                >
                                  <DraggableCell
                                    value={row[col.key]}
                                    rowIndex={rowIndex}
                                    colIndex={colIndex}
                                    columnName={col.title}
                                    tableId={selectedTable.id}
                                  />
                                </td>
                              ))}
                              <td style={{ padding: '4px', border: '1px solid #d9d9d9', textAlign: 'center' }}>
                                <Space size={0}>
                                  <Tooltip title="编辑">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<EditOutlined />}
                                      onClick={() => handleEditRow(row)}
                                    />
                                  </Tooltip>
                                  <Popconfirm
                                    title="确认删除此行数据？"
                                    onConfirm={() => handleDeleteRow(row.id!)}
                                  >
                                    <Tooltip title="删除">
                                      <Button 
                                        type="text" 
                                        size="small" 
                                        danger
                                        icon={<DeleteOutlined />}
                                      />
                                    </Tooltip>
                                  </Popconfirm>
                                </Space>
                              </td>
                            </tr>
                          ))}
                          {[...Array(Math.max(0, 5 - selectedTable.rows.length))].map((_, emptyRowIndex) => (
                            <tr key={`empty-${emptyRowIndex}`} style={{ backgroundColor: '#fafafa' }}>
                              {selectedTable.columns.map((col, colIndex) => (
                                <td
                                  key={col.key}
                                  style={{
                                    padding: '0',
                                    border: '1px solid #d9d9d9',
                                  }}
                                >
                                  <DraggableCell
                                    value=""
                                    rowIndex={selectedTable.rows.length + emptyRowIndex}
                                    colIndex={colIndex}
                                    columnName={col.title}
                                    tableId={selectedTable.id}
                                  />
                                </td>
                              ))}
                              <td style={{ padding: '4px', border: '1px solid #d9d9d9', textAlign: 'center', color: '#ccc' }}>
                                空
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        共 {selectedTable.rows.length} 条数据，{selectedTable.columns.length} 个字段
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '40px',
                      textAlign: 'center',
                      border: '2px dashed #d9d9d9',
                      borderRadius: '8px',
                    }}
                  >
                    <DatabaseOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '12px' }} />
                    <Text type="secondary" style={{ display: 'block' }}>
                      选择一个数据表或创建新表
                    </Text>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'bindings',
            label: '绑定管理',
            children: (
              <div style={{ padding: '16px 0' }}>
                <Text type="secondary">
                  数据绑定功能将在画布中实现
                </Text>
              </div>
            ),
          },
        ]}
      />

      <Modal
        title="编辑数据表"
        open={editTableModalOpen}
        onCancel={() => setEditTableModalOpen(false)}
        onOk={() => editTableForm.submit()}
      >
        <Form form={editTableForm} layout="vertical" onFinish={handleSaveTable}>
          <Form.Item
            name="name"
            label="表名称"
            rules={[{ required: true, message: '请输入表名称' }]}
          >
            <Input placeholder="输入表名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={2} placeholder="输入描述（可选）" />
          </Form.Item>
          <Form.Item
            name="tags"
            label="标签"
            extra="多个标签用逗号分隔"
          >
            <Input placeholder="例如: 运动员, 成绩" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingColumn ? '编辑字段' : '添加字段'}
        open={columnModalOpen}
        onCancel={() => setColumnModalOpen(false)}
        onOk={() => columnForm.submit()}
      >
        <Form form={columnForm} layout="vertical" onFinish={handleSaveColumn}>
          <Form.Item
            name="key"
            label="字段键名"
            rules={[{ required: true, message: '请输入字段键名' }]}
            extra="用于数据存储的英文字段名"
          >
            <Input placeholder="例如: athlete_name" disabled={!!editingColumn} />
          </Form.Item>
          <Form.Item
            name="title"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="例如: 运动员姓名" />
          </Form.Item>
          <Form.Item
            name="type"
            label="数据类型"
            initialValue="text"
          >
            <Select
              options={[
                { value: 'text', label: '文本' },
                { value: 'number', label: '数字' },
                { value: 'date', label: '日期' },
                { value: 'image', label: '图片' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="width"
            label="列宽度"
          >
            <InputNumber min={50} max={500} placeholder="默认自动" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingRow ? '编辑数据' : '添加数据'}
        open={rowModalOpen}
        onCancel={() => setRowModalOpen(false)}
        onOk={() => rowForm.submit()}
        width={600}
      >
        <Form form={rowForm} layout="vertical" onFinish={handleSaveRow}>
          {selectedTable?.columns.map((col) => (
            <Form.Item
              key={col.key}
              name={col.key}
              label={col.title}
            >
              {col.type === 'number' ? (
                <InputNumber style={{ width: '100%' }} placeholder={`输入${col.title}`} />
              ) : col.type === 'date' ? (
                <Input type="date" style={{ width: '100%' }} />
              ) : col.type === 'image' ? (
                <Input placeholder="输入图片URL" />
              ) : (
                <Input placeholder={`输入${col.title}`} />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default DataTablePanel;
