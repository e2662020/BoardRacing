import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { MainLayout } from './components/Layout';
import { useAuthStore } from './stores';
import { useThemeStore } from './stores/themeStore';
import ThemeProvider from './components/ThemeProvider';

// 懒加载页面组件
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Athletes = lazy(() => import('./pages/Athletes'));
const Events = lazy(() => import('./pages/Events'));
const Packages = lazy(() => import('./pages/Packages'));
const PackageEditor = lazy(() => import('./pages/PackageEditor'));
const DataTables = lazy(() => import('./pages/DataTables'));
const Resources = lazy(() => import('./pages/Resources'));
const Members = lazy(() => import('./pages/Members'));
const Bilibili = lazy(() => import('./pages/Bilibili'));

// 加载中组件
const PageLoading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

// 受保护路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode; permission?: string }> = ({
  children,
  permission,
}) => {
  const { isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// 公开路由组件
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const themeMode = useThemeStore((state) => state.theme);
  
  const darkTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#8b5cf6',
      colorBgBase: '#000000',
      colorBgContainer: '#111111',
      colorBgElevated: '#1a1a1a',
      colorBgSpotlight: '#222222',
      colorBorder: '#2a2a2a',
      colorText: '#ffffff',
      colorTextSecondary: '#a1a1aa',
      colorTextTertiary: '#71717a',
      colorTextQuaternary: '#52525b',
      colorFill: '#27272a',
      colorFillSecondary: '#3f3f46',
      colorFillTertiary: '#52525b',
      colorFillQuaternary: '#71717a',
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusSM: 4,
      borderRadiusXS: 2,
      borderRadiusOuter: 6,
    },
    components: {
      Button: {
        colorPrimary: '#8b5cf6',
        colorPrimaryHover: '#7c3aed',
        colorPrimaryActive: '#6d28d9',
        borderRadius: 6,
      },
      Card: {
        colorBgContainer: '#111111',
        colorBorder: '#2a2a2a',
      },
      Input: {
        colorBgContainer: '#1a1a1a',
        colorBorder: '#2a2a2a',
        borderRadius: 6,
      },
      Select: {
        colorBgContainer: '#1a1a1a',
        colorBorder: '#2a2a2a',
      },
      Menu: {
        colorBgContainer: '#111111',
        colorItemBgSelected: '#8b5cf6',
        colorItemTextSelected: '#ffffff',
      },
      Modal: {
        colorBgContainer: '#111111',
      },
      Table: {
        colorBgContainer: '#111111',
        colorBgContainerDisabled: '#1a1a1a',
        borderColor: '#2a2a2a',
      },
    },
  };

  const lightTheme = {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#8b5cf6',
      colorBgBase: '#ffffff',
      colorBgContainer: '#f4f4f5',
      colorBgElevated: '#ffffff',
      colorBgSpotlight: '#e4e4e7',
      colorBorder: '#e4e4e7',
      colorText: '#000000',
      colorTextSecondary: '#52525b',
      colorTextTertiary: '#71717a',
      colorTextQuaternary: '#a1a1aa',
      colorFill: '#f4f4f5',
      colorFillSecondary: '#e4e4e7',
      colorFillTertiary: '#d4d4d8',
      colorFillQuaternary: '#a1a1aa',
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusSM: 4,
      borderRadiusXS: 2,
      borderRadiusOuter: 6,
    },
    components: {
      Button: {
        colorPrimary: '#8b5cf6',
        colorPrimaryHover: '#7c3aed',
        colorPrimaryActive: '#6d28d9',
        borderRadius: 6,
      },
      Card: {
        colorBgContainer: '#f4f4f5',
        colorBorder: '#e4e4e7',
      },
      Input: {
        colorBgContainer: '#ffffff',
        colorBorder: '#e4e4e7',
        borderRadius: 6,
      },
      Select: {
        colorBgContainer: '#ffffff',
        colorBorder: '#e4e4e7',
      },
      Menu: {
        colorBgContainer: '#f4f4f5',
        colorItemBgSelected: '#8b5cf6',
        colorItemTextSelected: '#ffffff',
      },
      Modal: {
        colorBgContainer: '#ffffff',
      },
      Table: {
        colorBgContainer: '#ffffff',
        colorBgContainerDisabled: '#f4f4f5',
        borderColor: '#e4e4e7',
      },
    },
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={themeMode === 'dark' ? darkTheme : lightTheme}
    >
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/schedule"
                element={
                  <ProtectedRoute permission="events">
                    <MainLayout>
                      <Schedule />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/athletes"
                element={
                  <ProtectedRoute permission="athletes">
                    <MainLayout>
                      <Athletes />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/events"
                element={
                  <ProtectedRoute permission="events">
                    <MainLayout>
                      <Events />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/packages"
                element={
                  <ProtectedRoute permission="packages">
                    <MainLayout>
                      <Packages />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/packages/editor/:id"
                element={
                  <ProtectedRoute permission="packages">
                    <PackageEditor />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/packages/new"
                element={
                  <ProtectedRoute permission="packages">
                    <PackageEditor />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/datatables"
                element={
                  <ProtectedRoute permission="data">
                    <MainLayout>
                      <DataTables />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/resources"
                element={
                  <ProtectedRoute permission="resources">
                    <MainLayout>
                      <Resources />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/members"
                element={
                  <ProtectedRoute permission="members">
                    <MainLayout>
                      <Members />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bilibili"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Bilibili />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
