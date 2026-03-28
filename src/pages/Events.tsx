import React, { useState } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Badge,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  TrophyOutlined,
  FireOutlined,
  TagsOutlined,
  ImportOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useEventStore } from '../stores';
import type { Event } from '../types';
import MediaWikiImportModal from '../components/MediaWikiImportModal';

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;

const EventsPage: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, importFromWiki } = useEventStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingEvent(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    form.setFieldsValue({
      name: event.name,
      category: event.category,
      tags: event.tags,
      description: event.description,
      olympicRecordHolder: event.olympicRecord?.holder,
      olympicRecordScore: event.olympicRecord?.score,
      olympicRecordDate: event.olympicRecord?.date,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    const eventData = {
      name: values.name,
      category: values.category,
      tags: values.tags || [],
      description: values.description,
      olympicRecord: values.olympicRecordHolder
        ? {
            holder: values.olympicRecordHolder,
            score: values.olympicRecordScore,
            date: values.olympicRecordDate,
          }
        : undefined,
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
      message.success('赛事项目更新成功');
    } else {
      addEvent(eventData);
      message.success('赛事项目添加成功');
    }

    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    message.success('赛事项目删除成功');
  };

  const handleImportFromWiki = (data: any[]) => {
    importFromWiki(data);
  };

  const handleFileImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // 尝试解析JSON
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          data.forEach((event: any) => addEvent(event));
          message.success(`成功导入 ${data.length} 个赛事项目`);
        } else {
          addEvent(data);
          message.success('成功导入赛事项目');
        }
      } catch (error) {
        // 如果不是JSON，可能是MediaWiki格式
        message.info('文件不是JSON格式，请使用MediaWiki导入功能');
      }
    };
    reader.readAsText(file);
    return false;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '田径': 'blue',
      '游泳': 'cyan',
      '体操': 'purple',
      '篮球': 'orange',
      '足球': 'green',
      '排球': 'red',
      '乒乓球': 'magenta',
      '羽毛球': 'gold',
    };
    return colors[category] || 'default';
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>赛事项目信息</h1>
        <div>
          <Button 
            icon={<ImportOutlined />} 
            onClick={() => setIsImportModalOpen(true)}
            style={{ marginRight: 8 }}
          >
            从Wiki导入
          </Button>
          <Upload
            beforeUpload={handleFileImport}
            showUploadList={false}
            accept=".json,.txt,.wiki"
          >
            <Button icon={<UploadOutlined />} style={{ marginRight: 8 }}>
              导入文件
            </Button>
          </Upload>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加赛事项目
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {events.map((event) => (
          <Col xs={24} sm={12} lg={8} key={event.id}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div
                  style={{
                    height: 100,
                    background: event.olympicRecord
                      ? 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)'
                      : 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {event.olympicRecord && (
                    <Badge
                      count="OR"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: '#fff',
                        color: '#faad14',
                        fontWeight: 'bold',
                        fontSize: 12,
                      }}
                    />
                  )}
                  <TrophyOutlined style={{ fontSize: 48, color: '#fff' }} />
                </div>
              }
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(event)}
                >
                  编辑
                </Button>,
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这个赛事项目吗？"
                  onConfirm={() => handleDelete(event.id)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {event.name}
                </Title>
                <Tag color={getCategoryColor(event.category)} style={{ marginTop: 8 }}>
                  {event.category}
                </Tag>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ fontSize: 13 }}>
                {event.description && (
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 12, color: '#666' }}
                  >
                    {event.description}
                  </Paragraph>
                )}

                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">
                    <TagsOutlined style={{ marginRight: 4 }} />
                    标签:
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    {event.tags.length > 0 ? (
                      event.tags.map((tag) => (
                        <Tag key={tag} style={{ marginBottom: 4, fontSize: 12 }}>
                          {tag}
                        </Tag>
                      ))
                    ) : (
                      <Text type="secondary" style={{ fontSize: 12 }}>暂无标签</Text>
                    )}
                  </div>
                </div>

                {event.olympicRecord && (
                  <div
                    style={{
                      background: '#fffbe6',
                      border: '1px solid #ffe58f',
                      borderRadius: 4,
                      padding: 8,
                      marginTop: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <FireOutlined style={{ color: '#faad14', marginRight: 4 }} />
                      <Text strong style={{ color: '#faad14' }}>奥运纪录</Text>
                    </div>
                    <Text style={{ fontSize: 12 }}>保持者: {event.olympicRecord.holder}</Text>
                    <br />
                    <Text strong style={{ fontSize: 14, color: '#faad14' }}>
                      {event.olympicRecord.score}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {event.olympicRecord.date}
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {events.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 60 }}>
          <TrophyOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16, color: '#999' }}>暂无赛事项目，点击右上角添加</p>
        </Card>
      )}

      <Modal
        title={editingEvent ? '编辑赛事项目' : '添加赛事项目'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="项目名称" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Input placeholder="例如：田径、游泳" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              placeholder="添加标签"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="赛事简介"
          >
            <TextArea rows={4} placeholder="赛事简介" />
          </Form.Item>

          <Card title="奥运纪录 (OR)" size="small" style={{ marginTop: 16 }}>
            <Form.Item
              name="olympicRecordHolder"
              label="纪录保持者"
            >
              <Input placeholder="纪录保持者姓名" />
            </Form.Item>

            <Form.Item
              name="olympicRecordScore"
              label="成绩"
            >
              <Input placeholder="纪录成绩" />
            </Form.Item>

            <Form.Item
              name="olympicRecordDate"
              label="日期"
            >
              <Input placeholder="纪录创造日期" />
            </Form.Item>
          </Card>
        </Form>
      </Modal>

      <MediaWikiImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type="events"
        onImport={handleImportFromWiki}
      />
    </div>
  );
};

export default EventsPage;
