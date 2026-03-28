/**
 * MediaWiki 源代码解析工具
 * 用于解析从MOC Wiki获取的赛事和成绩数据
 */

export interface ParsedEvent {
  name: string;
  category: string;
  description?: string;
  tags: string[];
  olympicRecord?: {
    holder: string;
    score: string;
    date?: string;
  };
}

export interface ParsedAthleteRecord {
  name: string;
  ids: string[];
  nickname?: string;
  specialties: string[];
  personalBests: {
    event: string;
    score: string;
    date?: string;
    competition?: string;
  }[];
  penalties: {
    date: string;
    reason: string;
    event?: string;
  }[];
}

/**
 * 解析MediaWiki表格
 */
function parseWikiTable(wikiText: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const lines = wikiText.split('\n');
  
  let inTable = false;
  let headers: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 表格开始
    if (trimmed.startsWith('{|')) {
      inTable = true;
      headers = [];
      continue;
    }
    
    // 表格结束
    if (trimmed.startsWith('|}')) {
      inTable = false;
      continue;
    }
    
    if (!inTable) continue;
    
    // 表头行
    if (trimmed.startsWith('!')) {
      headers = trimmed
        .replace(/^!\s*/, '')
        .split('!!')
        .map(h => h.trim().replace(/\[\[|\]\]|'''/g, ''));
      continue;
    }
    
    // 数据行
    if (trimmed.startsWith('|-') || trimmed === '') {
      continue;
    }
    
    if (trimmed.startsWith('|') && !trimmed.startsWith('|-')) {
      const cells = trimmed
        .replace(/^\|\s*/, '')
        .split('||')
        .map(c => parseWikiText(c.trim()));
      
      if (headers.length > 0) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = cells[index] || '';
        });
        rows.push(row);
      } else {
        // 没有表头，使用索引
        const row: Record<string, string> = {};
        cells.forEach((cell, index) => {
          row[`col${index}`] = cell;
        });
        rows.push(row);
      }
    }
  }
  
  return rows;
}

/**
 * 解析Wiki文本（去除标记）
 */
function parseWikiText(text: string): string {
  if (!text) return '';
  
  return text
    // 去除链接 [[链接|显示文本]] -> 显示文本
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
    // 去除简单链接 [[文本]] -> 文本
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    // 去除粗体
    .replace(/'''([^']+)'''/g, '$1')
    // 去除斜体
    .replace(/''([^']+)''/g, '$1')
    // 去除HTML标签
    .replace(/<[^>]+>/g, '')
    // 去除模板
    .replace(/\{\{[^}]+\}\}/g, '')
    .trim();
}

/**
 * 解析赛事列表
 * 从 https://moc.miraheze.org/wiki/项目 获取
 */
export function parseEventsFromWiki(wikiText: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const lines = wikiText.split('\n');
  
  let currentCategory = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 检测分类标题（== 分类 ==）
    const categoryMatch = trimmed.match(/^==\s*(.+?)\s*==$/);
    if (categoryMatch) {
      currentCategory = parseWikiText(categoryMatch[1]);
      continue;
    }
    
    // 检测列表项
    if (trimmed.startsWith('*') || trimmed.startsWith('#')) {
      const eventText = trimmed.replace(/^[*#]\s*/, '');
      const eventName = parseWikiText(eventText);
      
      if (eventName) {
        events.push({
          name: eventName,
          category: currentCategory || '其他',
          tags: currentCategory ? [currentCategory] : [],
          description: '',
        });
      }
    }
  }
  
  // 如果没有解析到，尝试解析表格
  if (events.length === 0) {
    const tableData = parseWikiTable(wikiText);
    for (const row of tableData) {
      const name = row['项目'] || row['名称'] || row['name'] || row['col0'];
      const category = row['分类'] || row['类别'] || row['category'] || row['col1'] || '其他';
      
      if (name) {
        events.push({
          name: parseWikiText(name),
          category: parseWikiText(category),
          tags: [parseWikiText(category)],
          description: row['描述'] || row['简介'] || row['description'] || '',
        });
      }
    }
  }
  
  return events;
}

/**
 * 解析成绩记录
 * 从 https://moc.miraheze.org/wiki/成绩记录?action=edit 获取
 */
export function parseAthleteRecordsFromWiki(wikiText: string): ParsedAthleteRecord[] {
  const athletes: Map<string, ParsedAthleteRecord> = new Map();
  
  // 尝试解析表格
  const tableData = parseWikiTable(wikiText);
  
  for (const row of tableData) {
    const name = row['运动员'] || row['姓名'] || row['name'] || row['col0'];
    const event = row['项目'] || row['event'] || row['col1'];
    const score = row['成绩'] || row['分数'] || row['score'] || row['col2'];
    const date = row['日期'] || row['时间'] || row['date'] || row['col3'];
    const competition = row['赛事'] || row['比赛'] || row['competition'] || row['col4'];
    
    if (!name) continue;
    
    const athleteName = parseWikiText(name);
    
    if (!athletes.has(athleteName)) {
      athletes.set(athleteName, {
        name: athleteName,
        ids: [],
        specialties: [],
        personalBests: [],
        penalties: [],
      });
    }
    
    const athlete = athletes.get(athleteName)!;
    
    // 添加成绩
    if (score) {
      athlete.personalBests.push({
        event: parseWikiText(event) || '未知项目',
        score: parseWikiText(score),
        date: date ? parseWikiText(date) : undefined,
        competition: competition ? parseWikiText(competition) : undefined,
      });
    }
    
    // 添加擅长项目
    if (event && !athlete.specialties.includes(parseWikiText(event))) {
      athlete.specialties.push(parseWikiText(event));
    }
  }
  
  return Array.from(athletes.values());
}

/**
 * 从URL获取MediaWiki源代码
 */
export async function fetchWikiSource(_url: string): Promise<string> {
  // 由于跨域限制，这里返回一个提示
  // 实际使用时需要通过后端代理或CORS代理
  throw new Error('由于浏览器跨域限制，无法直接获取Wiki内容。请手动复制源代码粘贴到导入框中。');
}

/**
 * 解析奥运纪录
 */
export function parseOlympicRecord(wikiText: string): { holder: string; score: string; date?: string } | undefined {
  // 尝试匹配奥运纪录格式
  const patterns = [
    /奥运纪录[:：]\s*([^\n]+)/i,
    /OR[:：]\s*([^\n]+)/i,
    /Olympic Record[:：]\s*([^\n]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = wikiText.match(pattern);
    if (match) {
      const parts = match[1].split(/[,，]/);
      return {
        holder: parts[0]?.trim() || '',
        score: parts[1]?.trim() || '',
        date: parts[2]?.trim(),
      };
    }
  }
  
  return undefined;
}

/**
 * 解析处罚记录
 */
export function parsePenalties(wikiText: string): { date: string; reason: string; event?: string }[] {
  const penalties: { date: string; reason: string; event?: string }[] = [];
  
  const lines = wikiText.split('\n');
  for (const line of lines) {
    if (line.includes('处罚') || line.includes('penalty') || line.includes('DSQ')) {
      const parts = line.split(/[,，]/);
      if (parts.length >= 2) {
        penalties.push({
          date: parts[0]?.trim() || '',
          reason: parts[1]?.trim() || '',
          event: parts[2]?.trim(),
        });
      }
    }
  }
  
  return penalties;
}
