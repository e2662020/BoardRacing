import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Athlete, CompetitionRecord } from '../types';

interface AthleteState {
  athletes: Athlete[];
  records: CompetitionRecord[];
  addAthlete: (athlete: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAthlete: (id: string, data: Partial<Athlete>) => void;
  deleteAthlete: (id: string) => void;
  importFromJSON: (jsonData: any[]) => void;
  importFromWiki: (data: any[]) => void;
  getAthleteById: (id: string) => Athlete | undefined;
  mergeAthleteIds: (targetId: string, sourceId: string) => void;
  setLiveStatus: (athleteId: string, isLive: boolean) => void;
  getLiveAthletes: () => Athlete[];
}

export const useAthleteStore = create<AthleteState>()(
  persist(
    (set, get) => ({
      athletes: [],
      records: [],

      addAthlete: (athleteData) => {
        const newAthlete: Athlete = {
          ...athleteData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          athletes: [...state.athletes, newAthlete],
        }));
      },

      updateAthlete: (id, data) => {
        set((state) => ({
          athletes: state.athletes.map((athlete) =>
            athlete.id === id
              ? { ...athlete, ...data, updatedAt: new Date().toISOString() }
              : athlete
          ),
        }));
      },

      deleteAthlete: (id) => {
        set((state) => ({
          athletes: state.athletes.filter((athlete) => athlete.id !== id),
        }));
      },

      importFromJSON: (jsonData) => {
        const importedAthletes: Athlete[] = jsonData.map((data) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: data.name || '',
          ids: data.ids || [data.id || ''],
          specialties: data.specialties || [],
          penalties: data.penalties || [],
          personalBests: data.personalBests || [],
          bio: data.bio || '',
          isLive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        set((state) => ({
          athletes: [...state.athletes, ...importedAthletes],
        }));
      },

      importFromWiki: (data) => {
        const importedAthletes: Athlete[] = data.map((item) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: item.name || '未知运动员',
          ids: item.ids || [],
          nickname: item.nickname || '',
          specialties: item.specialties || [],
          penalties: item.penalties || [],
          personalBests: item.personalBests || [],
          bio: '',
          isLive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        set((state) => ({
          athletes: [...state.athletes, ...importedAthletes],
        }));
      },

      getAthleteById: (id) => {
        return get().athletes.find(
          (athlete) => athlete.id === id || athlete.ids.includes(id)
        );
      },

      mergeAthleteIds: (targetId, sourceId) => {
        const { athletes } = get();
        const targetAthlete = athletes.find((a) => a.id === targetId);
        const sourceAthlete = athletes.find((a) => a.id === sourceId);

        if (targetAthlete && sourceAthlete) {
          const mergedIds = [...new Set([...targetAthlete.ids, ...sourceAthlete.ids, sourceId])];
          const mergedSpecialties = [...new Set([...targetAthlete.specialties, ...sourceAthlete.specialties])];
          const mergedPenalties = [...targetAthlete.penalties, ...sourceAthlete.penalties];
          const mergedPBs = [...targetAthlete.personalBests, ...sourceAthlete.personalBests];

          set((state) => ({
            athletes: state.athletes
              .map((athlete) =>
                athlete.id === targetId
                  ? {
                      ...athlete,
                      ids: mergedIds,
                      specialties: mergedSpecialties,
                      penalties: mergedPenalties,
                      personalBests: mergedPBs,
                      updatedAt: new Date().toISOString(),
                    }
                  : athlete
              )
              .filter((athlete) => athlete.id !== sourceId),
          }));
        }
      },

      setLiveStatus: (athleteId, isLive) => {
        set((state) => ({
          athletes: state.athletes.map((athlete) =>
            athlete.id === athleteId ? { ...athlete, isLive } : athlete
          ),
        }));
      },

      getLiveAthletes: () => {
        return get().athletes.filter((athlete) => athlete.isLive);
      },
    }),
    {
      name: 'athlete-storage',
    }
  )
);
