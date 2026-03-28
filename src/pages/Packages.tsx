import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { usePackageStore } from '../stores';
import { useNavigate } from 'react-router-dom';
import type { Package } from '../types';

const PackagesPage: React.FC = () => {
  const { packages, addPackage, deletePackage, setCurrentPackage } = usePackageStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleAdd = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    const newPackage = {
      name: values.name,
      tags: values.tags || [],
      components: [],
      nodes: [],
    };
    addPackage(newPackage);
    message.success('直播包装创建成功');
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    deletePackage(id);
    message.success('直播包装删除成功');
  };

  const handleEdit = (pkg: Package) => {
    setCurrentPackage(pkg);
    navigate(`/packages/editor/${pkg.id}`);
  };

  const handlePreview = (pkg: Package) => {
    setCurrentPackage(pkg);
    navigate(`/packages/preview/${pkg.id}`);
  };

  const columns = [
    {
      title: '包装名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <VideoCameraOutlined style={{ color: '#722ed1' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '组件数量',
      key: 'components',
      render: (_: any, record: Package) => record.components?.length || 0,
    },
    {
      title: '节点数量',
      key: 'nodes',
      render: (_: any, record: Package) => record.nodes.length,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Package) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个直播包装吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>直播包装管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建包装
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {packages.map((pkg) => (
          <Col xs={24} sm={12} lg={8} key={pkg.id}>
            <Card
              hoverable
              cover={
                <div
                  style={{
                    height: 120,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <VideoCameraOutlined style={{ fontSize: 48, color: '#fff' }} />
                </div>
              }
              actions={[
                <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(pkg)}>
                  编辑
                </Button>,
                <Button type="text" icon={<EyeOutlined />} onClick={() => handlePreview(pkg)}>
                  预览
                </Button>,
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这个直播包装吗？"
                  onConfirm={() => handleDelete(pkg.id)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={pkg.name}
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      {pkg.tags.map((tag) => (
                        <Tag key={tag}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      组件: {pkg.components?.length || 0} | 节点: {pkg.nodes?.length || 0}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {packages.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 60 }}>
          <VideoCameraOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16, color: '#999' }}>暂无直播包装，点击右上角创建</p>
        </Card>
      )}

      <Table
        style={{ marginTop: 24 }}
        columns={columns}
        dataSource={packages}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="新建直播包装"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="包装名称"
            rules={[{ required: true, message: '请输入包装名称' }]}
          >
            <Input placeholder="包装名称" />
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
        </Form>
      </Modal>
    </div>
  );
};

export default PackagesPage;
