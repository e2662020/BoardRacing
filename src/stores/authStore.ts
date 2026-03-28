import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, invitationCode: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

// 模拟用户数据
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (username: string, password: string) => {
        // 模拟登录验证
        const user = MOCK_USERS.find(u => u.username === username);
        if (user && password === '123456') {
          set({
            user,
            isAuthenticated: true,
            token: 'mock_token_' + Date.now(),
          });
          return true;
        }
        return false;
      },

      register: async (username: string, _password: string, invitationCode: string) => {
        // 模拟注册验证
        if (invitationCode.startsWith('INVITE_')) {
          const newUser: User = {
            id: Date.now().toString(),
            username,
            role: 'commentator',
            createdAt: new Date().toISOString(),
          };
          MOCK_USERS.push(newUser);
          set({
            user: newUser,
            isAuthenticated: true,
            token: 'mock_token_' + Date.now(),
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
        });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'admin') return true;
        
        const permissions: Record<UserRole, string[]> = {
          admin: ['*'],
          commentator: ['athletes', 'events', 'dataTables'],
          designer: ['athletes', 'events', 'packages', 'dataTables'],
          director: ['packages', 'dataTables', 'resources'],
          event_manager: ['athletes', 'events', 'dataTables'],
        };
        
        return permissions[user.role]?.includes(permission) || false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
