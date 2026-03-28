import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  Input,
  Button,
  Upload,
  message,
  List,
  Checkbox,
  Typography,
  Space,
  Alert,
} from 'antd';
import {
  UploadOutlined,
  ImportOutlined,
  GlobalOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  parseEventsFromWiki,
  parseAthleteRecordsFromWiki,
  type ParsedEvent,
  type ParsedAthleteRecord,
} from '../utils/mediaWikiParser';

const { TextArea } = Input;
const { Text } = Typography;

interface MediaWikiImportModalProps {
  open: boolean;
  onClose: () => void;
  type: 'events' | 'athletes';
  onImport: (data: any[]) => void;
}

const MediaWikiImportModal: React.FC<MediaWikiImportModalProps> = ({
  open,
  onClose,
  type,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState('paste');
  const [wikiText, setWikiText] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleParse = () => {
    if (!wikiText.trim()) {
      message.warning('请输入MediaWiki源代码');
      return;
    }

    setLoading(true);
    try {
      let data: ParsedEvent[] | ParsedAthleteRecord[] = [];
      
      if (type === 'events') {
        data = parseEventsFromWiki(wikiText);
      } else {
        data = parseAthleteRecordsFromWiki(wikiText);
      }

      setParsedData(data);
      setSelectedItems(new Set(data.map((_, index) => index)));
      
      if (data.length === 0) {
        message.warning('未能解析到有效数据，请检查输入格式');
      } else {
        message.success(`成功解析 ${data.length} 条记录`);
      }
    } catch (error) {
      message.error('解析失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setWikiText(content);
      message.success('文件已加载，请点击解析按钮');
    };
    reader.readAsText(file);
    return false;
  };

  const handleImport = () => {
    const selectedData = parsedData.filter((_, index) => selectedItems.has(index));
    
    if (selectedData.length === 0) {
      message.warning('请选择要导入的数据');
      return;
    }

    onImport(selectedData);
    message.success(`成功导入 ${selectedData.length} 条记录`);
    
    // 重置状态
    setWikiText('');
    setParsedData([]);
    setSelectedItems(new Set());
    onClose();
  };

  const toggleItem = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    setSelectedItems(new Set(parsedData.map((_, index) => index)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const renderEventItem = (event: ParsedEvent, index: number) => (
    <List.Item
      style={{
        padding: '12px',
        backgroundColor: selectedItems.has(index) ? '#f6ffed' : '#fff',
        border: `1px solid ${selectedItems.has(index) ? '#b7eb8f' : '#f0f0f0'}`,
        borderRadius: '4px',
        marginBottom: '8px',
      }}
      onClick={() => toggleItem(index)}
    >
      <Checkbox checked={selectedItems.has(index)} style={{ marginRight: '12px' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold' }}>{event.name}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          分类: {event.category}
          {event.olympicRecord && (
            <span style={{ marginLeft: '12px', color: '#faad14' }}>
              奥运纪录: {event.olympicRecord.holder} - {event.olympicRecord.score}
            </span>
          )}
        </div>
        {event.description && (
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {event.description}
          </div>
        )}
      </div>
    </List.Item>
  );

  const renderAthleteItem = (athlete: ParsedAthleteRecord, index: number) => (
    <List.Item
      style={{
        padding: '12px',
        backgroundColor: selectedItems.has(index) ? '#f6ffed' : '#fff',
        border: `1px solid ${selectedItems.has(index) ? '#b7eb8f' : '#f0f0f0'}`,
        borderRadius: '4px',
        marginBottom: '8px',
      }}
      onClick={() => toggleItem(index)}
    >
      <Checkbox checked={selectedItems.has(index)} style={{ marginRight: '12px' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold' }}>{athlete.name}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          擅长: {athlete.specialties.join(', ') || '暂无'}
        </div>
        {athlete.personalBests.length > 0 && (
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            最好成绩: {athlete.personalBests.slice(0, 2).map(pb => 
              `${pb.event}: ${pb.score}`
            ).join(', ')}
            {athlete.personalBests.length > 2 && ` 等${athlete.personalBests.length}项`}
          </div>
        )}
      </div>
    </List.Item>
  );

  return (
    <Modal
      title={type === 'events' ? '从MediaWiki导入赛事信息' : '从MediaWiki导入运动员成绩'}
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        parsedData.length > 0 && (
          <Button key="import" type="primary" onClick={handleImport}>
            导入选中项 ({selectedItems.size})
          </Button>
        ),
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          tab={<span><FileTextOutlined /> 粘贴源代码</span>}
          key="paste"
        >
          <Alert
            message="使用说明"
            description={
              <div>
                <p>1. 访问 MOC Wiki 页面（如：https://moc.miraheze.org/wiki/项目）</p>
                <p>2. 在URL后添加 ?action=edit 进入编辑模式查看源代码</p>
                <p>3. 复制源代码并粘贴到下方文本框</p>
                <p>4. 点击"解析"按钮预览数据</p>
              </div>
            }
            type="info"
            style={{ marginBottom: '16px' }}
          />
          
          <TextArea
            value={wikiText}
            onChange={(e) => setWikiText(e.target.value)}
            placeholder={`请粘贴MediaWiki源代码...\n\n示例格式：\n== 田径 ==\n* 100米短跑\n* 跳远\n\n或表格格式：\n{| class="wikitable"\n! 项目 !! 分类\n|-\n| 100米短跑 || 田径\n|}`}
            rows={8}
            style={{ marginBottom: '16px' }}
          />
          
          <Button
            type="primary"
            icon={<ImportOutlined />}
            onClick={handleParse}
            loading={loading}
            block
          >
            解析数据
          </Button>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={<span><UploadOutlined /> 上传文件</span>}
          key="upload"
        >
          <Alert
            message="支持上传MediaWiki源代码文件"
            description="上传包含MediaWiki标记的.txt或.wiki文件"
            type="info"
            style={{ marginBottom: '16px' }}
          />
          
          <Upload.Dragger
            beforeUpload={handleFileUpload}
            accept=".txt,.wiki,.md"
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">支持 .txt, .wiki, .md 格式</p>
          </Upload.Dragger>
          
          {wikiText && (
            <Button
              type="primary"
              icon={<ImportOutlined />}
              onClick={handleParse}
              loading={loading}
              style={{ marginTop: '16px' }}
              block
            >
              解析已上传的文件
            </Button>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={<span><GlobalOutlined /> 从URL获取</span>}
          key="url"
        >
          <Alert
            message="暂不支持直接获取"
            description="由于浏览器跨域限制，无法直接从Wiki获取数据。请使用编辑模式查看源代码并粘贴到「粘贴源代码」标签页。"
            type="warning"
            showIcon
          />
          <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Text strong>推荐数据源：</Text>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>
                <Text code>https://moc.miraheze.org/wiki/项目?action=edit</Text>
                <br />
                <Text type="secondary">赛事项目列表</Text>
              </li>
              <li style={{ marginTop: '8px' }}>
                <Text code>https://moc.miraheze.org/wiki/成绩记录?action=edit</Text>
                <br />
                <Text type="secondary">运动员成绩记录</Text>
              </li>
            </ul>
          </div>
        </Tabs.TabPane>
      </Tabs>

      {parsedData.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>解析结果（共 {parsedData.length} 条）</Text>
            <Space>
              <Button size="small" onClick={selectAll}>全选</Button>
              <Button size="small" onClick={deselectAll}>全不选</Button>
            </Space>
          </div>
          
          <List
            style={{ maxHeight: '300px', overflow: 'auto' }}
            dataSource={parsedData}
            renderItem={(item: any, index: number) => 
              type === 'events' 
                ? renderEventItem(item as ParsedEvent, index)
                : renderAthleteItem(item as ParsedAthleteRecord, index)
            }
          />
        </div>
      )}
    </Modal>
  );
};

export default MediaWikiImportModal;
