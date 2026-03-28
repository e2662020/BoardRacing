import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Event, Schedule } from '../types';

interface EventState {
  events: Event[];
  schedules: Schedule[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, data: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  importFromWiki: (data: any[]) => void;
  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt'>) => void;
  updateSchedule: (id: string, data: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  getSchedulesByDate: (date: string) => Schedule[];
  getActiveSchedules: () => Schedule[];
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      schedules: [],

      addEvent: (eventData) => {
        const newEvent: Event = {
          ...eventData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },

      updateEvent: (id, data) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...data } : event
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      importFromWiki: (data) => {
        const newEvents: Event[] = data.map((item) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: item.name || '未命名项目',
          category: item.category || '其他',
          tags: item.tags || [],
          description: item.description || '',
          olympicRecord: item.olympicRecord,
          createdAt: new Date().toISOString(),
        }));
        set((state) => ({
          events: [...state.events, ...newEvents],
        }));
      },

      addSchedule: (scheduleData) => {
        const newSchedule: Schedule = {
          ...scheduleData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          schedules: [...state.schedules, newSchedule],
        }));
      },

      updateSchedule: (id, data) => {
        set((state) => ({
          schedules: state.schedules.map((schedule) =>
            schedule.id === id ? { ...schedule, ...data } : schedule
          ),
        }));
      },

      deleteSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((schedule) => schedule.id !== id),
        }));
      },

      getSchedulesByDate: (date) => {
        const targetDate = new Date(date).toDateString();
        return get().schedules.filter((schedule) => {
          const scheduleDate = new Date(schedule.startTime).toDateString();
          return scheduleDate === targetDate;
        });
      },

      getActiveSchedules: () => {
        const now = new Date().toISOString();
        return get().schedules.filter(
          (schedule) => schedule.startTime <= now && schedule.endTime >= now
        );
      },
    }),
    {
      name: 'event-storage',
    }
  )
);
