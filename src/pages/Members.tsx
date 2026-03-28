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
  Tabs,
  List,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  UserOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useUserStore, useAuthStore } from '../stores';
import type { User, UserRole, InvitationCode } from '../types';

const { Text } = Typography;

const roleColors: Record<UserRole, string> = {
  admin: 'red',
  commentator: 'blue',
  designer: 'purple',
  director: 'orange',
  event_manager: 'green',
};

const roleLabels: Record<UserRole, string> = {
  admin: '管理员',
  commentator: '解说',
  designer: '设计师',
  director: '导播',
  event_manager: '赛事',
};

const MembersPage: React.FC = () => {
  const { users, invitationCodes, addUser, updateUser, deleteUser, generateInvitationCodes, revokeInvitationCode } = useUserStore();
  const { user: currentUser } = useAuthStore();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm] = Form.useForm();
  const [inviteForm] = Form.useForm();

  const handleAddUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    userForm.setFieldsValue({
      username: user.username,
      role: user.role,
    });
    setIsUserModalOpen(true);
  };

  const handleSubmitUser = (values: any) => {
    if (editingUser) {
      updateUser(editingUser.id, values);
      message.success('用户更新成功');
    } else {
      addUser({
        username: values.username,
        role: values.role,
      });
      message.success('用户添加成功');
    }
    setIsUserModalOpen(false);
    userForm.resetFields();
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      message.error('不能删除当前登录用户');
      return;
    }
    deleteUser(id);
    message.success('用户删除成功');
  };

  const handleGenerateInvites = (values: any) => {
    const codes = generateInvitationCodes(values.count, values.role);
    message.success(`成功生成 ${codes.length} 个邀请码`);
    setIsInviteModalOpen(false);
    inviteForm.resetFields();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          />
          <Popconfirm
            title="确认删除"
            description="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const unusedCodes = invitationCodes.filter((code) => !code.used);
  const usedCodes = invitationCodes.filter((code) => code.used);

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>成员管理</h1>

      <Tabs
        items={[
          {
            key: 'users',
            label: '用户列表',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                    添加用户
                  </Button>
                </div>
                <Table
                  columns={userColumns}
                  dataSource={users}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </>
            ),
          },
          {
            key: 'invitations',
            label: '邀请码管理',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<KeyOutlined />}
                    onClick={() => setIsInviteModalOpen(true)}
                  >
                    生成邀请码
                  </Button>
                </div>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card title={`未使用邀请码 (${unusedCodes.length})`} size="small">
                      <List
                        dataSource={unusedCodes}
                        renderItem={(code: InvitationCode) => (
                          <List.Item
                            actions={[
                              <Button
                                type="text"
                                icon={<CopyOutlined />}
                                onClick={() => copyToClipboard(code.code)}
                              >
                                复制
                              </Button>,
                              <Popconfirm
                                title="确认撤销"
                                onConfirm={() => {
                                  revokeInvitationCode(code.id);
                                  message.success('邀请码已撤销');
                                }}
                              >
                                <Button type="text" danger icon={<DeleteOutlined />}>
                                  撤销
                                </Button>
                              </Popconfirm>,
                            ]}
                          >
                            <Text code>{code.code}</Text>
                          </List.Item>
                        )}
                        locale={{ emptyText: '暂无未使用邀请码' }}
                      />
                    </Card>
                  </Col>

                  <Col span={12}>
                    <Card title={`已使用邀请码 (${usedCodes.length})`} size="small">
                      <List
                        dataSource={usedCodes}
                        renderItem={(code: InvitationCode) => (
                          <List.Item>
                            <div>
                              <Text code delete>{code.code}</Text>
                              <div style={{ fontSize: 12, color: '#999' }}>
                                使用者: {code.usedBy} | 
                                时间: {new Date(code.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </List.Item>
                        )}
                        locale={{ emptyText: '暂无已使用邀请码' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            ),
          },
        ]}
      />

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isUserModalOpen}
        onCancel={() => setIsUserModalOpen(false)}
        onOk={() => userForm.submit()}
      >
        <Form form={userForm} layout="vertical" onFinish={handleSubmitUser}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" disabled={!!editingUser} />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="密码" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="选择角色">
              <Select.Option value="admin">
                <Tag color="red">管理员</Tag>
              </Select.Option>
              <Select.Option value="commentator">
                <Tag color="blue">解说</Tag>
              </Select.Option>
              <Select.Option value="designer">
                <Tag color="purple">设计师</Tag>
              </Select.Option>
              <Select.Option value="director">
                <Tag color="orange">导播</Tag>
              </Select.Option>
              <Select.Option value="event_manager">
                <Tag color="green">赛事</Tag>
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="生成邀请码"
        open={isInviteModalOpen}
        onCancel={() => setIsInviteModalOpen(false)}
        onOk={() => inviteForm.submit()}
      >
        <Form form={inviteForm} layout="vertical" onFinish={handleGenerateInvites}>
          <Form.Item
            name="count"
            label="生成数量"
            rules={[{ required: true, message: '请输入生成数量' }]}
            initialValue={5}
          >
            <Input type="number" min={1} max={50} placeholder="生成数量" />
          </Form.Item>

          <Form.Item
            name="role"
            label="默认角色"
            rules={[{ required: true, message: '请选择默认角色' }]}
            initialValue="commentator"
          >
            <Select placeholder="选择默认角色">
              <Select.Option value="commentator">解说</Select.Option>
              <Select.Option value="designer">设计师</Select.Option>
              <Select.Option value="director">导播</Select.Option>
              <Select.Option value="event_manager">赛事</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MembersPage;
