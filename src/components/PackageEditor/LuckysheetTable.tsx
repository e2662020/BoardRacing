import React, { useEffect, useRef, useCallback } from 'react';
import { Button, Space, message, Select, Dropdown, Modal, Form, Input } from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExportOutlined,
  CopyOutlined,
  DatabaseOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { DataTable, RowData } from '../../types';
import { useDataTableStore } from '../../stores';

interface LuckysheetTableProps {
  tables: DataTable[];
  selectedTableId?: string;
  onSelectTable: (tableId: string) => void;
  onCreateTable: () => void;
}

declare global {
  interface Window {
    luckysheet: any;
    luckysheet_create: (options: any) => void;
    luckysheet_refresh: () => void;
    luckysheet_getcellvalue: (row: number, col: number) => any;
    luckysheet_setcellvalue: (row: number, col: number, value: any) => void;
    luckysheet_getsheet: () => any;
  }
}

const LuckysheetTable: React.FC<LuckysheetTableProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  onCreateTable,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editTableModalOpen, setEditTableModalOpen] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<DataTable | null>(null);
  const [editTableForm] = Form.useForm();

  const {
    updateTable,
    deleteTable,
    addTable,
  } = useDataTableStore();

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const convertToLuckysheetData = useCallback((table: DataTable | undefined) => {
    if (!table) return [];

    const sheetData: any[][] = [];
    
    const headerRow = table.columns.map(col => col.title);
    sheetData.push(headerRow);
    
    table.rows.forEach(row => {
      const dataRow = table.columns.map(col => row[col.key] ?? '');
      sheetData.push(dataRow);
    });
    
    for (let i = table.rows.length; i < 10; i++) {
      sheetData.push(table.columns.map(() => ''));
    }

    return sheetData;
  }, []);

  useEffect(() => {
    if (!selectedTable || !containerRef.current) return;

    const initLuckysheet = () => {
      if (typeof window.luckysheet === 'undefined') {
        console.warn('Luckysheet not loaded');
        return;
      }

      try {
        const sheetData = convertToLuckysheetData(selectedTable);
        
        window.luckysheet.create({
          container: 'luckysheet-container',
          title: selectedTable.name,
          lang: 'zh',
          showinfobar: false,
          showsheetbar: false,
          showstatisticBar: false,
          enableAddRow: true,
          enableAddBackTop: false,
          userInfo: false,
          showConfigWindowResize: false,
          forceCalculation: false,
          rowHeaderWidth: 46,
          columnHeaderHeight: 26,
          defaultColWidth: 120,
          defaultRowHeight: 28,
          data: [{
            name: selectedTable.name,
            color: '',
            index: 0,
            status: 1,
            order: 0,
            celldata: sheetData.map((row, rowIndex) => 
              row.map((value, colIndex) => ({
                r: rowIndex,
                c: colIndex,
                v: { v: value, m: value, ct: { fa: 'General', t: 'g' } }
              }))
            ).flat(),
            config: {
              columnlen: selectedTable.columns.reduce((acc, col, index) => {
                if (col.width) acc[index] = col.width;
                return acc;
              }, {} as Record<number, number>),
            },
          }],
          hook: {
            cellUpdated: (r: number, c: number, oldValue: any, newValue: any) => {
              console.log('Cell updated:', r, c, oldValue, newValue);
            },
          },
        });
      } catch (error) {
        console.error('Failed to initialize Luckysheet:', error);
      }
    };

    const timer = setTimeout(initLuckysheet, 100);
    
    return () => {
      clearTimeout(timer);
      if (typeof window.luckysheet !== 'undefined') {
        try {
          window.luckysheet.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [selectedTable, convertToLuckysheetData]);

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
    addTable({
      name: `${selectedTable.name} (副本)`,
      description: selectedTable.description,
      columns: selectedTable.columns,
      rows: selectedTable.rows,
      tags: selectedTable.tags,
    });
    message.success('复制成功');
  };

  const handleSaveData = () => {
    if (!selectedTable) return;

    try {
      // 获取 Luckysheet 的所有数据
      const sheetData = window.luckysheet.getSheetData();
      if (!sheetData || !sheetData[0] || !sheetData[0].data) {
        message.error('无法获取表格数据');
        return;
      }

      const data = sheetData[0].data;
      const columns = selectedTable.columns;
      
      // 转换数据为行格式（跳过第一行表头）
      const rows: RowData[] = [];
      for (let i = 1; i < data.length; i++) {
        const rowData: RowData = { id: Date.now().toString() + i };
        let hasData = false;
        
        for (let j = 0; j < columns.length; j++) {
          const cellValue = data[i][j];
          const value = cellValue ? (cellValue.v || cellValue.m || '') : '';
          if (value) hasData = true;
          rowData[columns[j].key] = value;
        }
        
        // 只保存有数据的行
        if (hasData) {
          rows.push(rowData);
        }
      }

      // 更新数据表
      updateTable(selectedTable.id, { rows });
      message.success('数据保存成功');
    } catch (error) {
      console.error('保存数据失败:', error);
      message.error('保存数据失败');
    }
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

  if (!selectedTable) {
    return (
      <div style={{ padding: '16px' }}>
        <Space style={{ width: '100%', marginBottom: '16px' }}>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateTable}>
            新建表
          </Button>
        </Space>
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            border: '2px dashed #d9d9d9',
            borderRadius: '8px',
          }}
        >
          <DatabaseOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '12px' }} />
          <div style={{ color: '#999' }}>选择一个数据表或创建新表</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
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
          <Space>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveData}>
              保存数据
            </Button>
            <Button icon={<PlusOutlined />} onClick={onCreateTable}>
              新建表
            </Button>
            <Dropdown menu={{ items: tableMenuItems }} trigger={['click']}>
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </Space>
      </div>
      
      <div 
        ref={containerRef}
        id="luckysheet-container" 
        style={{ flex: 1, minHeight: 300 }}
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
    </div>
  );
};

export default LuckysheetTable;
