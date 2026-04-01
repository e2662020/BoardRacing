import React, { useState, useEffect } from 'react';
import { Layout, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile && (
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setSidebarVisible(!sidebarVisible)}
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            zIndex: 1001,
          }}
        />
      )}
      
      {!isMobile && (
        <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, margin: 0, padding: 0 }}>
          <Sidebar onMenuItemClick={() => setSidebarVisible(false)} />
        </div>
      )}
      
      {sidebarVisible && isMobile && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              zIndex: 999,
            }}
            onClick={() => setSidebarVisible(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 220,
              zIndex: 1000,
            }}
          >
            <Sidebar onMenuItemClick={() => setSidebarVisible(false)} />
          </div>
        </>
      )}
      
      <Layout style={{ marginLeft: isMobile ? 0 : 220 }}>
        <Header />
        <Content
          style={{
            marginTop: 64,
            padding: isMobile ? 16 : 24,
            minHeight: 'calc(100vh - 64px)',
            background: '#000000',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
