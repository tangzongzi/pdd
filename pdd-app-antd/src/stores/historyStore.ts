import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HistoryRecord } from '@/types/history';
import { nanoid } from 'nanoid';

interface HistoryState {
  records: HistoryRecord[];
  addRecord: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
  clearRecords: () => void;
  deleteRecord: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      records: [],
      
      // 添加记录
      addRecord: (record) => {
        set((state) => ({
          records: [
            {
              ...record,
              id: nanoid(),
              timestamp: Date.now(),
            },
            ...state.records,
          ],
        }));
      },
      
      // 清空记录
      clearRecords: () => {
        set({ records: [] });
      },
      
      // 删除指定记录
      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((record) => record.id !== id),
        }));
      },
    }),
    {
      name: 'calculation-history',
    }
  )
); 