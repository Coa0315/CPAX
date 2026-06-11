/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core study modes
export type CpaxStudyMode = 'short' | 'essay'; // "short" (短答式) | "essay" (論文式)

// Condition / Mood tracker (3 stages)
export type CpaxCondition = 'excellent' | 'normal' | 'poor'; // 好調、普通、不調

// Topic/Syllabus Item definition
export interface CpaxTopic {
  id: string; // Unified cpaxTopicId (e.g. far-c-001)
  subject: string; // 財務会計論(計算), 企業法 etc.
  textbook?: string; // Textbook or Lecture series (e.g. "テキスト1", "管理論・特選講義")
  category: string; // "応用論点", "重要論点", "基礎講義" etc.
  name: string; // Topic name
  isEssayOnly?: boolean; // If true, only visible under論文式
  estimatedMinutes?: number; // Target reference study minutes
  resourceType?: 'material' | 'lecture'; // 教材 (material) vs 講義 (lecture)
}

// History item when user studies a topic
export interface CpaxHistoryItem {
  historyId: string; // hist-XXXXX
  topicId: string; // Unified cpaxTopicId
  date: string; // YYYY-MM-DD
  duration: number; // minutes elapsed
  evaluation: 'good' | 'average' | 'poor'; // "◯" | "△" | "✕"
  type: 'timer' | 'manual'; // Timer recorded or manual check
  note?: string; // Memo notes
  scheduleId?: string; // Schedule ID reference for dynamic calendar deletion synchronization
}

// Schedules & Calender TODOs
export interface CpaxSchedule {
  scheduleId: string; // sched-XXXX
  topicId?: string; // Optional links to unified syllabus (cpaxTopicId)
  title: string; // Event or Study task name
  date: string; // YYYY-MM-DD
  category: 'study' | 'private' | 'other'; // study, private, other
  completed: boolean;
  timeInput?: string; // e.g. "14:00"
  notes?: string;
  sourceExamReportId?: string; // If auto-scheduled from reflections (e.g. 3 days after)
  duration?: number; // Private task commitment minutes
  targetMinutes?: number; // Study task target minutes
  evaluation?: 'good' | 'average' | 'poor'; // "◯" | "△" | "✕"
}

// Exam Reflection and reports (答練・公開模試)
export interface CpaxExamReport {
  reportId: string; // rep-XXXX
  title: string; // e.g. "第1回 短答式答練"
  date: string; // YYYY-MM-DD
  subject: string; // 財務、管理 etc.
  score: number;
  maxScore: number;
  evaluation: 'A' | 'B' | 'C' | 'D' | 'E';
  failurePatterns: string[]; // やらかしミスリスト (e.g., "問題文の読み飛ばし", "計算単純ミス")
  analysis: string; // 原因徹底分析
  actionPlan: string; // 次回のアクション・復習TODO
  isShortMode: boolean; // boolean context (short vs essay)
  scheduledReviewIds: string[]; // Related generated scheduled IDs
  linkedTopicIds?: string[]; // Multiple target topics linked to this exam report [串]
  deviationValue?: number; // Optional deviation score
  examType?: 'short' | 'essay'; // Added for dynamic report types
}

// CPA Method Framework (志・道・進)
export interface CpaxFramework {
  // 志 (Soul / Ultimate Source Motivation)
  soulMotivation: string;
  absolutePromise: string; // 合格して何を実現するか
  
  // 道 (Strategy / Target date and milestones)
  milestones: {
    targetExamDate: string; // Exam date
    targetExamTitle: string; // e.g. "2026年12月 短答式試験"
    targetDailyStudyHours: number; // e.g. 8 hours
    milestone6Months: string;
    milestone3Months: string;
  };
  
  // 進 (Progress / Core Priority Tasks)
  priorityFocusList: {
    id: string;
    topicId?: string;
    taskDescription: string;
    completed: boolean;
  }[];
}

// All LocalStorage packages wrapped up for backup/load
export interface CpaxBackupFormat {
  cpax_study_mode: CpaxStudyMode;
  cpax_master_contents: CpaxTopic[];
  cpax_history: CpaxHistoryItem[];
  cpax_schedules: CpaxSchedule[];
  cpax_target_date?: string;
  cpax_exam_reports: CpaxExamReport[];
  cpax_framework: CpaxFramework;
  backupDate: string;
  appVersion: string;
}

// Default master dataset for CPAX Accountant topics syllabus
export const DEFAULT_CPAX_TOPICS: CpaxTopic[] = [
  // 財務会計論 (計算)
  { id: 'far-c-001', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '基礎論点', name: '現金預金・銀行勘定調整表', estimatedMinutes: 45 },
  { id: 'far-c-002', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '基礎論点', name: '手形取引・電子記録債権', estimatedMinutes: 45 },
  { id: 'far-c-003', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '応用論点', name: '有形固定資産・減価償却・買換', estimatedMinutes: 60 },
  { id: 'far-c-004', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '重要論点', name: '資産除去債務 (ARO)', estimatedMinutes: 50 },
  { id: 'far-c-005', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '重要論点', name: 'リース取引 (借手・貸手)', estimatedMinutes: 70 },
  { id: 'far-c-006', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '応用論点', name: '減損会計 (資産グループ・共用資産)', estimatedMinutes: 75 },
  { id: 'far-c-007', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '重要論点', name: '金融資産・有価証券(時価評価・書換)', estimatedMinutes: 65 },
  { id: 'far-c-008', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '応用論点', name: 'デリバティブ取引・ヘッジ会計', estimatedMinutes: 80 },
  { id: 'far-c-009', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '重要論点', name: '退職給付会計 (原則・簡便・数理差異)', estimatedMinutes: 75 },
  { id: 'far-c-010', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '応用論点', name: '社債・抽選償還・買入償還', estimatedMinutes: 50 },
  { id: 'far-c-011', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '重要論点', name: '純資産の部・株主資本等変動計算書', estimatedMinutes: 60 },
  { id: 'far-c-012', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '重要論点', name: '収益認識に関する会計基準 (契約資産)', estimatedMinutes: 90 },
  { id: 'far-c-013', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '重要論点', name: '税効果会計 (繰延税金資産の回収可能性)', estimatedMinutes: 80 },
  { id: 'far-c-014', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '本試験論点', name: '連結財務諸表 (資本連結・投資と資本相殺)', estimatedMinutes: 90 },
  { id: 'far-c-015', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '本試験論点', name: '連結財務諸表 (成果連結・未実現利益消去)', estimatedMinutes: 90 },
  { id: 'far-c-016', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '応用論点', name: '持分法会計・段階取得・株式売却', estimatedMinutes: 80 },
  { id: 'far-c-017', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '本試験論点', name: '企業結合・事業分離・ホールディングス', estimatedMinutes: 100 },
  { id: 'far-c-018', subject: '財務会計論(計算)', textbook: 'テキスト1', category: '応用論点', name: '外貨建取引・四半期財務諸表', estimatedMinutes: 60 },
  
  // 財務会計論 (理論)
  { id: 'far-t-001', subject: '財務会計論(理論)', textbook: 'テキスト1', category: '基本概念', name: '企業会計原則・一般原則・重要性', estimatedMinutes: 40 },
  { id: 'far-t-002', subject: '財務会計論(理論)', textbook: 'テキスト1', category: '基本概念', name: '財務会計の概念フレームワーク (意志決定有用性)', estimatedMinutes: 50 },
  { id: 'far-t-003', subject: '財務会計論(理論)', textbook: 'テキスト1', category: '応用理論', name: '資産評価基準(原価主義と時価主義基準)', estimatedMinutes: 45 },
  { id: 'far-t-004', subject: '財務会計論(理論)', textbook: 'テキスト1', category: '応用理論', name: '負債理論・引当金会計規定・債務性', estimatedMinutes: 45 },
  { id: 'far-t-005', subject: '財務会計論(理論)', textbook: 'テキスト1', category: '重要理論', name: '純資産の会計基準・自己株式と準備金減額', estimatedMinutes: 50 },
  { id: 'far-t-006', subject: '財務会計論(理論)', textbook: 'テキスト1', category: '重要理論', name: '収益認識・費用配分理論基準', estimatedMinutes: 60 },
  { id: 'far-t-007', subject: '財務会計論(理論)', textbook: 'テキスト1', category: '本試験理論', name: '連結財務諸表理論 (支配獲得日の会計方針)', estimatedMinutes: 60 },
  { id: 'far-t-008', subject: '財務会計論(理論)', textbook: 'テキスト1', category: '応用理論', name: '会計上の変更及び誤謬の訂正に関する検証', estimatedMinutes: 40 },

  // 管理会計論
  { id: 'ma-001', subject: '管理会計論', textbook: 'テキスト1', category: '費目別', name: '材料費・労務費・経費の計算と賃率差異', estimatedMinutes: 50 },
  { id: 'ma-002', subject: '管理会計論', textbook: 'テキスト1', category: '部門別', name: '部門別計算 (第1次配布・第2次配布単一・複数)', estimatedMinutes: 60 },
  { id: 'ma-003', subject: '管理会計論', textbook: 'テキスト1', category: '製品別', name: '個別原価計算・仕損・減損の処理基準', estimatedMinutes: 55 },
  { id: 'ma-004', subject: '管理会計論', textbook: 'テキスト1', category: '個別別', name: '総合原価計算 (単純・級別・組別・工程別)', estimatedMinutes: 70 },
  { id: 'ma-005', subject: '管理会計論', textbook: 'テキスト1', category: '応用別', name: '標準原価計算 (配合差異・歩留差異分析)', estimatedMinutes: 80 },
  { id: 'ma-006', subject: '管理会計論', textbook: 'テキスト1', category: '意思決定', name: '直接原価計算・CVP分析・安全余裕率調整', estimatedMinutes: 60 },
  { id: 'ma-007', subject: '管理会計論', textbook: 'テキスト1', category: '意思決定', name: '設備投資意思決定 (NPV・IRR・回収期間法)', estimatedMinutes: 90 },
  { id: 'ma-008', subject: '管理会計論', textbook: 'テキスト1', category: '現代管理', name: 'ABC会計 (活動基準原価計算)・BSC概念', estimatedMinutes: 50 },
  { id: 'ma-009', subject: '管理会計論', textbook: 'テキスト1', category: '理論体系', name: '管理会計総論・予算管理と業績評価理論', estimatedMinutes: 45 },

  // 監査論
  { id: 'aud-001', subject: '監査論', textbook: 'テキスト1', category: '総論', name: '監査の本質・目的 (社会的役割と二重責任)', estimatedMinutes: 40 },
  { id: 'aud-002', subject: '監査論', textbook: 'テキスト1', category: '総論', name: '金商法・会社法における法定監査制度比較', estimatedMinutes: 45 },
  { id: 'aud-003', subject: '監査論', textbook: 'テキスト1', category: '規範', name: '監査基準・品質管理基準・JICPA倫理規則', estimatedMinutes: 50 },
  { id: 'aud-004', subject: '監査論', textbook: 'テキスト1', category: '主体論', name: '監査人の適格性・独立性の要件(職業的倫理)', estimatedMinutes: 50 },
  { id: 'aud-005', subject: '監査論', textbook: 'テキスト1', category: 'プロセス', name: '監査計画 of 策定・監査調書・重要性の基準値', estimatedMinutes: 45 },
  { id: 'aud-006', subject: '監査論', textbook: 'テキスト1', category: 'プロセス', name: '監査リスクモデル・アサーションと評価', estimatedMinutes: 60 },
  { id: 'aud-007', subject: '監査論', textbook: 'テキスト1', category: '手続論', name: '試査・監査サンプリング (属性統計テスト)', estimatedMinutes: 55 },
  { id: 'aud-008', subject: '監査論', textbook: 'テキスト1', category: '報告論', name: '監査報告書基準・意見区分(無限定・除外事項)', estimatedMinutes: 60 },
  { id: 'aud-009', subject: '監査論', textbook: 'テキスト1', category: '報告論', name: 'KAM(監査上の主要な検討事項)の開示実例', estimatedMinutes: 50 },

  // 企業法
  { id: 'law-001', subject: '企業法', textbook: 'テキスト1', category: '会社設立', name: '会社の概念・設立手続一連・発起人の責任', estimatedMinutes: 40 },
  { id: 'law-002', subject: '企業法', textbook: 'テキスト1', category: '株式', name: '株式の共有・譲渡制限・特別支配株主の売渡請求', estimatedMinutes: 45 },
  { id: 'law-003', subject: '企業法', textbook: 'テキスト1', category: '機関', name: '株主総会の招集手続・決議瑕疵の訴え', estimatedMinutes: 55 },
  { id: 'law-004', subject: '企業法', textbook: 'テキスト1', category: '機関', name: '取締役の善管注意義務・忠実義務・自己取引', estimatedMinutes: 60 },
  { id: 'law-005', subject: '企業法', textbook: 'テキスト1', category: '機関', name: '監査役等・株主代表訴訟の実効的範囲', estimatedMinutes: 50 },
  { id: 'law-006', subject: '企業法', textbook: 'テキスト1', category: '資金調達', name: '新株予約権・社債管理者制度・自己株式譲渡', estimatedMinutes: 45 },
  { id: 'law-007', subject: '企業法', textbook: 'テキスト1', category: '組織編制', name: '組織再編成(合併、株式交換等)と債権者保護', estimatedMinutes: 65 },
  { id: 'law-008', subject: '企業法', textbook: 'テキスト1', category: '金商法', name: '金融商品取引法目的・開示制度・有価証券概念', estimatedMinutes: 45 },

  // 租税法 (論文期のみ)
  { id: 'tax-001', subject: '租税法', textbook: 'テキスト1', category: '法人税法', name: '受取配当等の益金不算入計算・所得課税', estimatedMinutes: 80, isEssayOnly: true },
  { id: 'tax-002', subject: '租税法', textbook: 'テキスト1', category: '法人税法', name: '有価証券の譲渡損益・評価損益', estimatedMinutes: 70, isEssayOnly: true },
  { id: 'tax-003', subject: '租税法', textbook: 'テキスト1', category: '法人税法', name: '減価償却・超過額の認容', estimatedMinutes: 75, isEssayOnly: true },
  { id: 'tax-004', subject: '租税法', textbook: 'テキスト1', category: '法人税法', name: '同族会社の役員給与に関する判定と損金算入', estimatedMinutes: 60, isEssayOnly: true },
  { id: 'tax-005', subject: '租税法', textbook: 'テキスト1', category: '所得税法', name: '各種所得の計算(事業・一時・配当)・所得控除', estimatedMinutes: 80, isEssayOnly: true },
  { id: 'tax-006', subject: '租税法', textbook: 'テキスト1', category: '消費税法', name: '課税の対象・非課税仕入・仕入勘定控除簡易課税', estimatedMinutes: 85, isEssayOnly: true },

  // 選択科目: 経営学 (論文期のみ)
  { id: 'bus-001', subject: '経営学', textbook: 'テキスト1', category: '財務管理', name: 'ファイナンス (ポートフォリオ理論・CAPM予測モデル)', estimatedMinutes: 90, isEssayOnly: true },
  { id: 'bus-002', subject: '経営学', textbook: 'テキスト1', category: '財務管理', name: '企業価値評価 (WACC・MM理論・デリバティブ)', estimatedMinutes: 90, isEssayOnly: true },
  { id: 'bus-003', subject: '経営学', textbook: 'テキスト1', category: '経営管理', name: '経営戦略論 (競争優位・製品ライフサイクル論点)', estimatedMinutes: 60, isEssayOnly: true },
  { id: 'bus-004', subject: '経営学', textbook: 'テキスト1', category: '経営管理', name: '組織構造・モチベーション理論・コーポレートガバナンス', estimatedMinutes: 60, isEssayOnly: true }
];

// Helper to initialize database if empty
export const initializeCpaxData = () => {
  if (typeof window === 'undefined') return;

  // Let's ensure default keys are present
  if (!localStorage.getItem('cpax_study_mode')) {
    localStorage.setItem('cpax_study_mode', JSON.stringify('short' as CpaxStudyMode));
  }
  if (!localStorage.getItem('cpax_master_contents')) {
    localStorage.setItem('cpax_master_contents', JSON.stringify(DEFAULT_CPAX_TOPICS));
  }
  if (!localStorage.getItem('cpax_subject_order')) {
    const defaultOrder = [
      '財務会計論(計算)',
      '財務会計論(理論)',
      '管理会計論',
      '監査論',
      '企業法',
      '租税法',
      '経営学'
    ];
    localStorage.setItem('cpax_subject_order', JSON.stringify(defaultOrder));
  }
  if (!localStorage.getItem('cpax_history')) {
    localStorage.setItem('cpax_history', JSON.stringify([]));
  }
  if (!localStorage.getItem('cpax_schedules')) {
    localStorage.setItem('cpax_schedules', JSON.stringify([]));
  }
  if (!localStorage.getItem('cpax_target_date')) {
    localStorage.setItem('cpax_target_date', JSON.stringify('2026-12-13'));
  }
  if (!localStorage.getItem('cpax_target_title')) {
    localStorage.setItem('cpax_target_title', JSON.stringify('公認会計士短答式試験'));
  }
  if (!localStorage.getItem('cpax_exam_reports')) {
    localStorage.setItem('cpax_exam_reports', JSON.stringify([]));
  }
  if (!localStorage.getItem('cpax_framework')) {
    const freshFramework: CpaxFramework = {
      soulMotivation: '',
      absolutePromise: '',
      milestones: {
        targetExamDate: '2026-12-13', // Sunday in December 2026 as standard
        targetExamTitle: '2026年12月 短答式本試験',
        targetDailyStudyHours: 8,
        milestone6Months: '',
        milestone3Months: ''
      },
      priorityFocusList: []
    };
    localStorage.setItem('cpax_framework', JSON.stringify(freshFramework));
  }
};
