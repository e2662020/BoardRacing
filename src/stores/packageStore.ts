import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Package, ComponentData, NodeData } from '../types';

interface PackageState {
  packages: Package[];
  currentPackage: Package | null;
  addPackage: (pkg: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePackage: (id: string, data: Partial<Package>) => void;
  deletePackage: (id: string) => void;
  setCurrentPackage: (pkg: Package | null) => void;
  addComponent: (packageId: string, component: Omit<ComponentData, 'id'>) => void;
  updateComponent: (packageId: string, componentId: string, data: Partial<ComponentData>) => void;
  deleteComponent: (packageId: string, componentId: string) => void;
  addNode: (packageId: string, node: Omit<NodeData, 'id'>) => void;
  updateNode: (packageId: string, nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (packageId: string, nodeId: string) => void;
}

export const usePackageStore = create<PackageState>()(
  persist(
    (set) => ({
      packages: [],
      currentPackage: null,

      addPackage: (pkgData) => {
        const newPackage: Package = {
          ...pkgData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          packages: [...state.packages, newPackage],
        }));
      },

      updatePackage: (id, data) => {
        set((state) => ({
          packages: state.packages.map((pkg) =>
            pkg.id === id
              ? { ...pkg, ...data, updatedAt: new Date().toISOString() }
              : pkg
          ),
        }));
      },

      deletePackage: (id) => {
        set((state) => ({
          packages: state.packages.filter((pkg) => pkg.id !== id),
        }));
      },

      setCurrentPackage: (pkg) => {
        set({ currentPackage: pkg });
      },

      addComponent: (packageId, component) => {
        const newComponent: ComponentData = {
          ...component,
          id: Date.now().toString(),
        };
        set((state) => ({
          packages: state.packages.map((pkg) =>
            pkg.id === packageId
              ? {
                  ...pkg,
                  components: [...(pkg.components || []), newComponent],
                  updatedAt: new Date().toISOString(),
                }
              : pkg
          ),
        }));
      },

      updateComponent: (packageId, componentId, data) => {
        set((state) => ({
          packages: state.packages.map((pkg) =>
            pkg.id === packageId
              ? {
                  ...pkg,
                  components: (pkg.components || []).map((comp) =>
                    comp.id === componentId ? { ...comp, ...data } : comp
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : pkg
          ),
        }));
      },

      deleteComponent: (packageId, componentId) => {
        set((state) => ({
          packages: state.packages.map((pkg) =>
            pkg.id === packageId
              ? {
                  ...pkg,
                  components: (pkg.components || []).filter(
                    (comp) => comp.id !== componentId
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : pkg
          ),
        }));
      },

      addNode: (packageId, node) => {
        const newNode: NodeData = {
          ...node,
          id: Date.now().toString(),
        };
        set((state) => ({
          packages: state.packages.map((pkg) =>
            pkg.id === packageId
              ? {
                  ...pkg,
                  nodes: [...(pkg.nodes || []), newNode],
                  updatedAt: new Date().toISOString(),
                }
              : pkg
          ),
        }));
      },

      updateNode: (packageId, nodeId, data) => {
        set((state) => ({
          packages: state.packages.map((pkg) =>
            pkg.id === packageId
              ? {
                  ...pkg,
                  nodes: (pkg.nodes || []).map((node) =>
                    node.id === nodeId ? { ...node, ...data } : node
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : pkg
          ),
        }));
      },

      deleteNode: (packageId, nodeId) => {
        set((state) => ({
          packages: state.packages.map((pkg) =>
            pkg.id === packageId
              ? {
                  ...pkg,
                  nodes: (pkg.nodes || []).filter((node) => node.id !== nodeId),
                  updatedAt: new Date().toISOString(),
                }
              : pkg
          ),
        }));
      },
    }),
    {
      name: 'package-storage',
    }
  )
);
