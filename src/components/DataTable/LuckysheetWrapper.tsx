import React, { useEffect, useRef, useCallback, useState } from 'react';

interface LuckysheetWrapperProps {
  data?: any[];
  columns?: string[];
  onChange?: (data: any) => void;
  onCellSelect?: (row: number, col: number, value: any) => void;
  onRangeSelect?: (range: any, data: any[]) => void;
  readOnly?: boolean;
}

const LuckysheetWrapper: React.FC<LuckysheetWrapperProps> = ({
  data = [],
  columns = [],
  onChange,
  onCellSelect,
  onRangeSelect,
  readOnly = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  // 转换数据为Luckysheet格式
  const transformDataToSheet = useCallback(() => {
    const celldata: any[] = [];
    
    // 添加表头
    columns.forEach((col, index) => {
      celldata.push({
        r: 0,
        c: index,
        v: {
          ct: { fa: 'General', t: 'g' },
          m: col,
          v: col,
          bl: 1,
          bg: '#E6E8EB',
          fc: '#000000',
        },
      });
    });

    // 添加数据
    data.forEach((row, rowIndex) => {
      columns.forEach((col, colIndex) => {
        const value = row[col] !== undefined ? row[col] : '';
        celldata.push({
          r: rowIndex + 1,
          c: colIndex,
          v: {
            ct: { fa: 'General', t: 'g' },
            m: String(value),
            v: value,
          },
        });
      });
    });

    return celldata;
  }, [data, columns]);

  // 初始化iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = (e: MessageEvent) => {
      const { type, data: messageData } = e.data;

      if (type === 'ready') {
        setIsReady(true);
        // 发送初始化数据
        iframe.contentWindow?.postMessage({
          type: 'init',
          data: {
            title: '数据表',
            readOnly,
            celldata: transformDataToSheet(),
          }
        }, '*');
      }

      if (type === 'dataChange') {
        onChange?.(messageData);
      }

      if (type === 'cellSelect') {
        onCellSelect?.(messageData.row, messageData.col, messageData.value);
      }

      if (type === 'rangeSelect') {
        // 获取选中区域的数据
        const range = messageData;
        const selectedData: any[] = [];
        for (let r = range.row[0]; r <= range.row[1]; r++) {
          const rowData: any = {};
          for (let c = range.column[0]; c <= range.column[1]; c++) {
            const cellValue = data[r - 1]?.[columns[c]];
            rowData[columns[c] || `col_${c}`] = cellValue;
          }
          selectedData.push(rowData);
        }
        onRangeSelect?.(range, selectedData);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [readOnly, transformDataToSheet, onChange, onCellSelect, onRangeSelect, data, columns]);

  // 数据变化时更新iframe
  useEffect(() => {
    if (isReady && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'updateData',
        data: {
          celldata: transformDataToSheet(),
        }
      }, '*');
    }
  }, [data, columns, isReady, transformDataToSheet]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!isReady && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
        }}>
          加载中...
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/luckysheet-editor.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: isReady ? 'block' : 'none',
        }}
        title="Luckysheet Editor"
      />
    </div>
  );
};

export default LuckysheetWrapper;
