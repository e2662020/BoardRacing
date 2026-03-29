import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { MainLayout } from './components/Layout';
import { useAuthStore } from './stores';

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
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
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
    </ConfigProvider>
  );
}

export default App;
