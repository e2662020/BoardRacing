import React, { useState } from 'react';
import {
  Card,
  Button,
  Upload,
  List,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Tree,
  Popconfirm,
  message,
  Row,
  Col,
  Breadcrumb,
} from 'antd';
import {
  UploadOutlined,
  FolderOutlined,
  FileImageOutlined,
  FileOutlined,
  DeleteOutlined,
  FolderAddOutlined,
  CustomerServiceOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { Resource, Folder } from '../types';

const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'root', name: '根目录', createdAt: new Date().toISOString() },
  ]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderForm] = Form.useForm();

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImageOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
      case 'video':
        return <VideoCameraOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
      case 'audio':
        return <CustomerServiceOutlined style={{ fontSize: 24, color: '#fa8c16' }} />;
      default:
        return <FileOutlined style={{ fontSize: 24, color: '#999' }} />;
    }
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) return 'video';
    if (['mp3', 'wav', 'aac', 'flac'].includes(ext || '')) return 'audio';
    return 'other';
  };

  const handleUpload = (file: File) => {
    const newResource: Resource = {
      id: Date.now().toString(),
      name: file.name,
      type: getFileType(file.name) as any,
      url: URL.createObjectURL(file),
      size: file.size,
      folderId: currentFolder,
      createdAt: new Date().toISOString(),
    };
    setResources([...resources, newResource]);
    message.success('文件上传成功');
    return false;
  };

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
    message.success('文件删除成功');
  };

  const handleAddFolder = (values: { name: string }) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: values.name,
      parentId: currentFolder,
      createdAt: new Date().toISOString(),
    };
    setFolders([...folders, newFolder]);
    message.success('文件夹创建成功');
    setIsFolderModalOpen(false);
    folderForm.resetFields();
  };

  const buildTreeData = () => {
    const buildNode = (parentId: string): any[] => {
      return folders
        .filter((f) => f.parentId === parentId)
        .map((f) => ({
          title: f.name,
          key: f.id,
          icon: <FolderOutlined />,
          children: buildNode(f.id),
        }));
    };
    return buildNode('root');
  };

  const currentResources = resources.filter((r) => r.folderId === currentFolder);
  const currentFolders = folders.filter((f) => f.parentId === currentFolder);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        flexDirection: 'column' as const,
        gap: 12,
      }}>
        <h1 style={{ margin: 0 }}>资源库</h1>
        <Space wrap>
          <Button icon={<FolderAddOutlined />} onClick={() => setIsFolderModalOpen(true)}>
            新建文件夹
          </Button>
          <Upload beforeUpload={handleUpload} showUploadList={false} multiple>
            <Button type="primary" icon={<UploadOutlined />}>
              上传文件
            </Button>
          </Upload>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card title="文件夹" size="small">
            <Tree
              treeData={buildTreeData()}
              defaultExpandedKeys={['root']}
              onSelect={(keys) => setCurrentFolder(keys[0] as string)}
              selectedKeys={[currentFolder]}
            />
          </Card>
        </Col>

        <Col xs={24} md={18}>
          <Card>
            <Breadcrumb style={{ marginBottom: 16 }}>
              <Breadcrumb.Item>
                <FolderOutlined /> 根目录
              </Breadcrumb.Item>
              {currentFolder !== 'root' && (
                <Breadcrumb.Item>
                  {folders.find((f) => f.id === currentFolder)?.name}
                </Breadcrumb.Item>
              )}
            </Breadcrumb>

            {currentFolders.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>文件夹</h4>
                <Row gutter={[8, 8]}>
                  {currentFolders.map((folder) => (
                    <Col span={6} key={folder.id}>
                      <Card
                        hoverable
                        size="small"
                        onClick={() => setCurrentFolder(folder.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <FolderOutlined style={{ fontSize: 24, color: '#faad14', marginRight: 8 }} />
                          <span>{folder.name}</span>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            <h4>文件</h4>
            <List
              grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 4 }}
              dataSource={currentResources}
              renderItem={(resource) => (
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      resource.type === 'image' ? (
                        <img
                          alt={resource.name}
                          src={resource.url}
                          style={{ height: 120, objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f5f5f5',
                          }}
                        >
                          {getFileIcon(resource.type)}
                        </div>
                      )
                    }
                    actions={[
                      <Popconfirm
                        title="确认删除"
                        onConfirm={() => handleDeleteResource(resource.id)}
                      >
                        <DeleteOutlined />
                      </Popconfirm>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {resource.name}
                        </div>
                      }
                      description={
                        <Space>
                          <Tag>{resource.type}</Tag>
                          <span style={{ fontSize: 12, color: '#999' }}>
                            {formatFileSize(resource.size)}
                          </span>
                        </Space>
                      }
                    />
                  </Card>
                </List.Item>
              )}
              locale={{ emptyText: '暂无文件' }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="新建文件夹"
        open={isFolderModalOpen}
        onCancel={() => setIsFolderModalOpen(false)}
        onOk={() => folderForm.submit()}
      >
        <Form form={folderForm} layout="vertical" onFinish={handleAddFolder}>
          <Form.Item
            name="name"
            label="文件夹名称"
            rules={[{ required: true, message: '请输入文件夹名称' }]}
          >
            <Input placeholder="文件夹名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResourcesPage;
