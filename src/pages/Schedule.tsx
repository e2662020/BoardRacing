import React, { useState } from 'react';
import { Card, Calendar, Badge, Button, Modal, Form, Select, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEventStore } from '../stores';
import type { Schedule } from '../types';

const { RangePicker } = DatePicker;

const SchedulePage: React.FC = () => {
  const { events, schedules, addSchedule, updateSchedule, deleteSchedule } = useEventStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [form] = Form.useForm();

  const getSchedulesByDate = (date: dayjs.Dayjs) => {
    return schedules.filter((schedule) => {
      const scheduleDate = dayjs(schedule.startTime);
      return scheduleDate.isSame(date, 'day');
    });
  };

  const dateCellRender = (date: dayjs.Dayjs) => {
    const daySchedules = getSchedulesByDate(date);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {daySchedules.map((schedule) => (
          <li key={schedule.id}>
            <Badge
              status={schedule.type === 'final' ? 'error' : 'processing'}
              text={
                <span style={{ fontSize: 12 }}>
                  {schedule.eventName} ({schedule.type === 'final' ? '决赛' : '初赛'})
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    form.setFieldsValue({
      eventId: schedule.eventId,
      type: schedule.type,
      timeRange: [dayjs(schedule.startTime), dayjs(schedule.endTime)],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    const [startTime, endTime] = values.timeRange;
    const event = events.find((e) => e.id === values.eventId);
    
    if (!event) {
      message.error('请选择比赛项目');
      return;
    }

    const scheduleData = {
      eventId: values.eventId,
      eventName: event.name,
      type: values.type,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    if (editingSchedule) {
      updateSchedule(editingSchedule.id, scheduleData);
      message.success('赛程更新成功');
    } else {
      addSchedule(scheduleData);
      message.success('赛程添加成功');
    }

    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    deleteSchedule(id);
    message.success('赛程删除成功');
  };

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        flexDirection: 'column' as const,
        gap: 12,
      }}>
        <h1 style={{ margin: 0 }}>赛程管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加赛程
        </Button>
      </div>

      <Card>
        <Calendar dateCellRender={dateCellRender} />
      </Card>

      <Card title="赛程列表" style={{ marginTop: 16 }}>
        {schedules.map((schedule) => (
          <Card.Grid
            key={schedule.id}
            style={{ width: '100%', padding: 16 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>{schedule.eventName}</h4>
                <p style={{ margin: '8px 0', color: '#666' }}>
                  <Badge
                    status={schedule.type === 'final' ? 'error' : 'processing'}
                    text={schedule.type === 'final' ? '决赛' : '初赛'}
                  />
                  <span style={{ marginLeft: 16 }}>
                    {dayjs(schedule.startTime).format('YYYY-MM-DD HH:mm')} - 
                    {dayjs(schedule.endTime).format('HH:mm')}
                  </span>
                </p>
              </div>
              <div>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(schedule)}
                />
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这个赛程吗？"
                  onConfirm={() => handleDelete(schedule.id)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            </div>
          </Card.Grid>
        ))}
        {schedules.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无赛程，点击右上角添加
          </div>
        )}
      </Card>

      <Modal
        title={editingSchedule ? '编辑赛程' : '添加赛程'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="eventId"
            label="比赛项目"
            rules={[{ required: true, message: '请选择比赛项目' }]}
          >
            <Select placeholder="选择比赛项目">
              {events.map((event) => (
                <Select.Option key={event.id} value={event.id}>
                  {event.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="比赛类型"
            rules={[{ required: true, message: '请选择比赛类型' }]}
          >
            <Select placeholder="选择比赛类型">
              <Select.Option value="preliminary">初赛</Select.Option>
              <Select.Option value="final">决赛</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="比赛时间"
            rules={[{ required: true, message: '请选择比赛时间' }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SchedulePage;
