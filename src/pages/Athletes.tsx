import React, { useState } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  Upload,
  message,
  Tabs,
  Avatar,
  Badge,
  Row,
  Col,
  Typography,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  TrophyOutlined,
  WarningOutlined,
  UserOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import { useAthleteStore } from '../stores';
import type { Athlete } from '../types';
import MediaWikiImportModal from '../components/MediaWikiImportModal';

const { TextArea } = Input;
const { Text, Title } = Typography;

const AthletesPage: React.FC = () => {
  const { athletes, addAthlete, updateAthlete, deleteAthlete, importFromJSON, importFromWiki, setLiveStatus } = useAthleteStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingAthlete(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    form.setFieldsValue({
      name: athlete.name,
      nickname: athlete.nickname,
      ids: athlete.ids.join(', '),
      specialties: athlete.specialties,
      bio: athlete.bio,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    const athleteData = {
      name: values.name,
      nickname: values.nickname,
      ids: values.ids ? values.ids.split(',').map((id: string) => id.trim()) : [],
      specialties: values.specialties || [],
      penalties: editingAthlete?.penalties || [],
      personalBests: editingAthlete?.personalBests || [],
      bio: values.bio,
      isLive: editingAthlete?.isLive || false,
    };

    if (editingAthlete) {
      updateAthlete(editingAthlete.id, athleteData);
      message.success('运动员信息更新成功');
    } else {
      addAthlete(athleteData);
      message.success('运动员添加成功');
    }

    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    deleteAthlete(id);
    message.success('运动员删除成功');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importFromJSON(Array.isArray(data) ? data : [data]);
        message.success('数据导入成功');
      } catch (error) {
        message.error('JSON格式错误');
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleImportFromWiki = (data: any[]) => {
    importFromWiki(data);
  };

  const toggleLiveStatus = (athlete: Athlete) => {
    setLiveStatus(athlete.id, !athlete.isLive);
    message.success(`${athlete.name} ${!athlete.isLive ? '已标记为比赛中' : '已取消比赛状态'}`);
  };

  const filteredAthletes = activeTab === 'live' 
    ? athletes.filter(a => a.isLive)
    : athletes;

  const tabItems = [
    {
      key: 'all',
      label: `全部运动员 (${athletes.length})`,
    },
    {
      key: 'live',
      label: `正在比赛 (${athletes.filter(a => a.isLive).length})`,
    },
  ];

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        flexDirection: 'column' as const,
        gap: 12,
      }}>
        <h1 style={{ margin: 0 }}>运动员信息 (CIS)</h1>
        <Space wrap>
          <Button 
            icon={<ImportOutlined />} 
            onClick={() => setIsImportModalOpen(true)}
          >
            从Wiki导入
          </Button>
          <Upload beforeUpload={handleImport} showUploadList={false} accept=".json">
            <Button icon={<UploadOutlined />}>导入JSON</Button>
          </Upload>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加运动员
          </Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Row gutter={[16, 16]}>
        {filteredAthletes.map((athlete) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={athlete.id}>
            <Card
              hoverable
              style={{ position: 'relative' }}
              cover={
                <div
                  style={{
                    height: 120,
                    background: athlete.isLive 
                      ? 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' 
                      : 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {athlete.isLive && (
                    <Badge
                      count="LIVE"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: '#fff',
                        color: '#ff4d4f',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                  <Avatar
                    size={80}
                    src={athlete.avatar}
                    icon={!athlete.avatar && <UserOutlined />}
                    style={{ border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  />
                </div>
              }
              actions={[
                <Button
                  type={athlete.isLive ? 'primary' : 'text'}
                  size="small"
                  onClick={() => toggleLiveStatus(athlete)}
                >
                  {athlete.isLive ? '比赛中' : '标记比赛'}
                </Button>,
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(athlete)}
                />,
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这个运动员吗？"
                  onConfirm={() => handleDelete(athlete.id)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                  {athlete.name}
                </Title>
                {athlete.nickname && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {athlete.nickname}
                  </Text>
                )}
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ fontSize: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">擅长项目:</Text>
                  <div style={{ marginTop: 4 }}>
                    {athlete.specialties.length > 0 ? (
                      athlete.specialties.map((s) => (
                        <Tag key={s} style={{ marginBottom: 4, fontSize: 12 }}>
                          {s}
                        </Tag>
                      ))
                    ) : (
                      <Text type="secondary" style={{ fontSize: 12 }}>暂无</Text>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <Space size={16}>
                    <span>
                      <TrophyOutlined style={{ color: '#faad14', marginRight: 4 }} />
                      <Text>PB: {athlete.personalBests.length}</Text>
                    </span>
                    <span>
                      <WarningOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                      <Text>处罚: {athlete.penalties.length}</Text>
                    </span>
                  </Space>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ID: {athlete.ids.slice(0, 2).join(', ')}
                    {athlete.ids.length > 2 && ` +${athlete.ids.length - 2}`}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredAthletes.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 60 }}>
          <UserOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16, color: '#999' }}>暂无运动员，点击右上角添加</p>
        </Card>
      )}

      <Modal
        title={editingAthlete ? '编辑运动员' : '添加运动员'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="运动员姓名" />
          </Form.Item>

          <Form.Item
            name="nickname"
            label="称呼"
          >
            <Input placeholder="运动员称呼/昵称" />
          </Form.Item>

          <Form.Item
            name="ids"
            label="运动员ID"
            extra="多个ID用逗号分隔，用于合并成绩"
          >
            <Input placeholder="例如: ID001, ID002" />
          </Form.Item>

          <Form.Item
            name="specialties"
            label="擅长项目"
          >
            <Select
              mode="tags"
              placeholder="输入擅长项目"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="bio"
            label="介绍"
          >
            <TextArea rows={4} placeholder="运动员介绍" />
          </Form.Item>
        </Form>
      </Modal>

      <MediaWikiImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type="athletes"
        onImport={handleImportFromWiki}
      />
    </div>
  );
};

export default AthletesPage;
