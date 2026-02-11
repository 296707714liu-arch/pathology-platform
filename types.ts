
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SLIDE_ANALYSIS = 'SLIDE_ANALYSIS',
  QUANTIFICATION = 'QUANTIFICATION',
  RESEARCH_ASSISTANT = 'RESEARCH_ASSISTANT',
  EXAM_SYSTEM = 'EXAM_SYSTEM',
  ANATOMY = 'ANATOMY',
  IMMERSIVE_LAB = 'IMMERSIVE_LAB',
  COLLAB_LIBRARY = 'COLLAB_LIBRARY',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  USER_PROFILE = 'USER_PROFILE',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: Array<{ title: string; uri: string }>;
  isError?: boolean;
}

export interface CaseStudy {
  title: string;
  patientHistory: string;
  clinicalPresentation: string;
  microscopicFindings: string;
  diagnosis: string;
  discussionPoints: string[];
  quizQuestions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

export interface ExamQuestion {
  id: number;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | number | number[]; 
  explanation: string;
  knowledgePoint: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ExamPaper {
  title: string;
  totalScore: number;
  durationMinutes: number;
  questions: ExamQuestion[];
}

export interface ExamResult {
  score: number;
  totalScore: number;
  wrongQuestions: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    knowledgePoint: string;
  }[];
  summary: string;
  detailedAnalysis: string;
  studySuggestions: string[];
}

export interface SlideAnalysisResult {
  description: string;
  features: string[];
  differentialDiagnosis: string[];
  likelyDiagnosis: string;
  recommendations: string[];
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  label: string;
}

export interface QuantificationResult {
  composition: {
    tumorPercentage: number;
    stromaPercentage: number;
    lymphocytePercentage: number;
    otherPercentage: number;
  };
  counts: {
    estimatedTumorCells: number;
    estimatedLymphocytes: number;
    mitoticFigures: string;
  };
  morphometrics: {
    nuclearAtypia: string;
    nuclearCytoplasmicRatio: string;
    description: string;
  };
  detections: BoundingBox[];
  technicalReport: {
    architecture: string;
    lossFunction: string;
    evaluationMetrics: string;
    implementationSteps: string[];
  };
}

export interface LibraryItem {
  id: string;
  title: string;
  type: 'Slide' | 'Case' | 'Assignment';
  author: string;
  date: string;
  tags: string[];
  thumbnail?: string;
  status?: 'Open' | 'Resolved' | 'Graded';
}

// === 3D 解剖 - 程序化几何体配置（使用 GEMINI 生成布局，而不是依赖外部 GLB ===
export type AnatomyPrimitiveType = 'sphere' | 'box' | 'cylinder';

export interface AnatomyStructure {
  id: string;              // 唯一 ID
  name: string;            // 结构名称（中文）
  type: AnatomyPrimitiveType;
  position: [number, number, number]; // 三维坐标
  size: number;            // 半径或整体尺寸
  height?: number;         // 柱体高度（仅 cylinder 使用）
  color: string;           // 颜色（如 #ff0000）
}

export interface AnatomySceneConfig {
  title: string;           // 场景标题（中文）
  description: string;     // 简要描述（中文）
  structures: AnatomyStructure[];
}

// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'researcher' | 'admin';
  avatar_url?: string;
  institution?: string;
  password_hash?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher' | 'researcher';
  institution?: string;
}

// Activity tracking types
export interface UserActivity {
  id: number;
  user_id: string;
  activity_type: 'login' | 'logout' | 'slide_analysis' | 'quantification' | 'research_chat' | 'exam_attempt' | 'anatomy_view' | 'immersive_lab' | 'resource_download' | 'resource_upload';
  module_name?: string;
  details: any;
  duration_seconds: number;
  created_at: Date;
}

export interface UserStats {
  activities: Array<{
    activity_type: string;
    count: number;
    total_duration: number;
  }>;
  exams: {
    total_exams: number;
    avg_score: number;
    best_score: number;
    total_study_time: number;
  };
  downloads: {
    total_downloads: number;
  };
}

// Resource types
export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'slide' | 'case' | 'assignment' | 'document' | 'video' | 'other';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  uploader_id: string;
  uploader_name?: string;
  tags: string[];
  is_public: boolean;
  download_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateResourceData {
  title: string;
  description?: string;
  type: 'slide' | 'case' | 'assignment' | 'document' | 'video' | 'other';
  tags?: string[];
  is_public?: boolean;
}

// Exam record types
export interface ExamRecord {
  id: number;
  user_id: string;
  exam_title: string;
  score: number;
  total_score: number;
  duration_minutes: number;
  questions_data: any;
  answers_data: any;
  wrong_questions: any;
  created_at: Date;
}
