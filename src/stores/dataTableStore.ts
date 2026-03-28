import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataTable, ColumnDef, RowData } from '../types';

interface DataTableState {
  tables: DataTable[];
  addTable: (table: Omit<DataTable, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTable: (id: string, data: Partial<DataTable>) => void;
  deleteTable: (id: string) => void;
  addColumn: (tableId: string, column: Omit<ColumnDef, 'id'>) => void;
  updateColumn: (tableId: string, columnId: string, data: Partial<ColumnDef>) => void;
  deleteColumn: (tableId: string, columnId: string) => void;
  addRow: (tableId: string, row: Omit<RowData, 'id'>) => void;
  updateRow: (tableId: string, rowId: string, data: Partial<RowData>) => void;
  deleteRow: (tableId: string, rowId: string) => void;
  getTableById: (id: string) => DataTable | undefined;
  setCellValue: (tableId: string, rowId: string, columnKey: string, value: any) => void;
}

export const useDataTableStore = create<DataTableState>()(
  persist(
    (set, get) => ({
      tables: [],

      addTable: (tableData) => {
        const newTable: DataTable = {
          ...tableData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          tables: [...state.tables, newTable],
        }));
      },

      updateTable: (id, data) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === id
              ? { ...table, ...data, updatedAt: new Date().toISOString() }
              : table
          ),
        }));
      },

      deleteTable: (id) => {
        set((state) => ({
          tables: state.tables.filter((table) => table.id !== id),
        }));
      },

      addColumn: (tableId, column) => {
        const newColumn: ColumnDef = {
          ...column,
          id: Date.now().toString(),
        };
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? {
                  ...table,
                  columns: [...table.columns, newColumn],
                  updatedAt: new Date().toISOString(),
                }
              : table
          ),
        }));
      },

      updateColumn: (tableId, columnId, data) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? {
                  ...table,
                  columns: table.columns.map((col) =>
                    col.id === columnId ? { ...col, ...data } : col
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : table
          ),
        }));
      },

      deleteColumn: (tableId, columnId) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? {
                  ...table,
                  columns: table.columns.filter((col) => col.id !== columnId),
                  updatedAt: new Date().toISOString(),
                }
              : table
          ),
        }));
      },

      addRow: (tableId, row) => {
        const newRow: RowData = {
          ...row,
          id: Date.now().toString(),
        };
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? {
                  ...table,
                  rows: [...table.rows, newRow],
                  updatedAt: new Date().toISOString(),
                }
              : table
          ),
        }));
      },

      updateRow: (tableId, rowId, data) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? {
                  ...table,
                  rows: table.rows.map((row) =>
                    row.id === rowId ? { ...row, ...data } : row
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : table
          ),
        }));
      },

      deleteRow: (tableId, rowId) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? {
                  ...table,
                  rows: table.rows.filter((row) => row.id !== rowId),
                  updatedAt: new Date().toISOString(),
                }
              : table
          ),
        }));
      },

      getTableById: (id) => {
        return get().tables.find((table) => table.id === id);
      },

      setCellValue: (tableId, rowId, columnKey, value) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? {
                  ...table,
                  rows: table.rows.map((row) =>
                    row.id === rowId ? { ...row, [columnKey]: value } : row
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : table
          ),
        }));
      },
    }),
    {
      name: 'datatable-storage',
    }
  )
);
