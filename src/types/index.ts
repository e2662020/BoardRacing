// 用户角色
export type UserRole = 'admin' | 'commentator' | 'designer' | 'director' | 'event_manager';

// 用户
export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

// 邀请码
export interface InvitationCode {
  id: string;
  code: string;
  used: boolean;
  usedBy?: string;
  createdAt: string;
  expiresAt?: string;
}

// 运动员
export interface Athlete {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string;
  ids: string[];
  specialties: string[];
  penalties: PenaltyRecord[];
  personalBests: PersonalBest[];
  bio?: string;
  isLive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 处罚记录
export interface PenaltyRecord {
  id: string;
  eventId: string;
  eventName: string;
  reason: string;
  date: string;
}

// 个人最好成绩
export interface PersonalBest {
  eventId: string;
  eventName: string;
  score: string;
  date: string;
}

// 比赛成绩记录
export interface CompetitionRecord {
  id: string;
  athleteId: string;
  eventId: string;
  competitionName: string;
  score: string;
  rank?: number;
  date: string;
}

// 赛事项目
export interface Event {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description?: string;
  olympicRecord?: {
    holder: string;
    score: string;
    date: string;
  };
  createdAt: string;
}

// 赛程
export interface Schedule {
  id: string;
  eventId: string;
  eventName: string;
  type: 'preliminary' | 'final';
  startTime: string;
  endTime: string;
  packageId?: string;
  createdAt: string;
}

// 组件样式
export interface ComponentStyle {
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  rotation?: number;
  borderRadius?: number;
  border?: string;
  padding?: number;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: string | number;
  flipAnimation?: boolean;
  shape?: 'rect' | 'circle';
  teamColor?: string;
}

// 动画数据
export interface AnimationData {
  type: string;
  duration: number;
  delay: number;
  easing: string;
}

// 组件数据
export interface ComponentData {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  style?: ComponentStyle;
  animation?: AnimationData;
  visible?: boolean;
  locked?: boolean;
  zIndex?: number;
  parentId?: string | null;
  children?: string[];
}

// 节点数据
export interface NodeData {
  id: string;
  type: string;
  x: number;
  y: number;
  inputs: string[];
  outputs: string[];
  config?: Record<string, any>;
  data?: Record<string, any>;
  position?: { x: number; y: number };
  connections?: string[];
}

// 数据绑定
export interface DataBinding {
  id?: string;
  variableName?: string;
  sourceId?: string;
  sourceType?: string;
  column?: string;
  rowIndex?: number;
  dataTableId?: string;
  cellRange?: string;
  isList?: boolean;
  type?: 'single' | 'list';
  tableId?: string;
  colIndex?: number;
  columnName?: string;
  value?: any;
}

// 画布数据
export interface CanvasData {
  width: number;
  height: number;
  components: ComponentData[];
}

// 直播包装
export interface Package {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  components: ComponentData[];
  nodes: NodeData[];
  canvas?: CanvasData;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isTemplate?: boolean;
}

// 动画配置
export interface AnimationConfig {
  type: 'flip' | 'fade' | 'slide' | 'none';
  duration: number;
  easing: string;
}

// 数据表
export interface DataTable {
  id: string;
  name: string;
  description?: string;
  columns: ColumnDef[];
  rows: RowData[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// 列定义
export interface ColumnDef {
  id?: string;
  key: string;
  title: string;
  type: 'text' | 'number' | 'date' | 'image';
  width?: number;
}

// 行数据
export interface RowData {
  id?: string;
  [key: string]: any;
}

// 资源文件
export interface Resource {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'font' | 'other';
  url: string;
  size: number;
  folderId?: string;
  createdAt: string;
}

// 文件夹
export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
}
