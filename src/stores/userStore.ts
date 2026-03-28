import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, InvitationCode, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UserState {
  users: User[];
  invitationCodes: InvitationCode[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  generateInvitationCodes: (count: number, role: UserRole) => InvitationCode[];
  revokeInvitationCode: (codeId: string) => void;
  validateInvitationCode: (code: string) => boolean;
  useInvitationCode: (code: string, userId: string) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: '1',
          username: 'admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
      ],
      invitationCodes: [],

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          users: [...state.users, newUser],
        }));
      },

      updateUser: (id, data) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...data } : user
          ),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }));
      },

      generateInvitationCodes: (count, _role) => {
        const newCodes: InvitationCode[] = Array.from({ length: count }, () => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          code: `INVITE_${uuidv4().replace(/-/g, '').toUpperCase().substr(0, 16)}`,
          used: false,
          createdAt: new Date().toISOString(),
        }));
        set((state) => ({
          invitationCodes: [...state.invitationCodes, ...newCodes],
        }));
        return newCodes;
      },

      revokeInvitationCode: (codeId) => {
        set((state) => ({
          invitationCodes: state.invitationCodes.filter((code) => code.id !== codeId),
        }));
      },

      validateInvitationCode: (code) => {
        const invitationCode = get().invitationCodes.find((ic) => ic.code === code);
        return !!invitationCode && !invitationCode.used;
      },

      useInvitationCode: (code, userId) => {
        const invitationCode = get().invitationCodes.find((ic) => ic.code === code);
        if (invitationCode && !invitationCode.used) {
          set((state) => ({
            invitationCodes: state.invitationCodes.map((ic) =>
              ic.code === code
                ? { ...ic, used: true, usedBy: userId }
                : ic
            ),
          }));
          return true;
        }
        return false;
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
