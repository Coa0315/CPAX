/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Heart, 
  Footprints, 
  Flame, 
  Plus, 
  Trash, 
  CheckSquare, 
  Square, 
  Save, 
  Compass, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb, 
  Dumbbell,
  ShieldAlert,
  Clock,
  LayoutGrid,
  Info
} from 'lucide-react';
import { CpaxTopic, CpaxHistoryItem, CpaxExamReport, CpaxStudyMode } from '../types';

// -------------------------------------------------------------
// TYPE DEFINITIONS FOR CPAX FRAMEWORK V2 (As requested in specifications)
// -------------------------------------------------------------
export interface Motive {
  id: number;
  text: string;
  background: string;
}

export interface SkillSelection {
  name: string;
  action: string;
}

export interface SubjectTask {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  hours: number;
}

export interface SubjectData {
  theme: string;
  tasks: SubjectTask[];
}

export interface CpaxFrameworkV2 {
  part1_shishi: {
    exam_dates: {
      short: string; // YYYY-MM-DD
      essay: string; // YYYY-MM-DD
    };
    motives: Motive[];
    skills: SkillSelection[];
    future: string;
  };
  part2_michi: {
    period: string; // '1month' | '2months' | '3months' | 'target' | 'other'
    basic_actions: {
      lecture: { reason: string; mind: string };
      review: { reason: string; mind: string };
      exam: { reason: string; mind: string };
      reflection: { reason: string; mind: string };
      qna: { reason: string; mind: string };
      other: { reason: string; mind: string };
    };
    subjects: {
      financial_calc: SubjectData;
      financial_theory: SubjectData;
      management_accounting: SubjectData;
      corporate_law: SubjectData;
      audit_theory: SubjectData;
      tax_law: SubjectData;
      business_concept: SubjectData;
    };
  };
}

// -------------------------------------------------------------
// DEFAULT DATA DESIGN (CPA Method Blueprint)
// -------------------------------------------------------------
const DEFAULT_FRAMEWORK_V2: CpaxFrameworkV2 = {
  part1_shishi: {
    exam_dates: {
      short: '2026-12-13',
      essay: '2027-08-22'
    },
    motives: [
      { id: 1, text: '公認会計士として、高い社会的実力を獲得したい', background: '無資格のままでキャリアを過ごすことや市場価値が上がらないことへの本音の恐怖心' },
      { id: 2, text: '圧倒的な高収入と経済的自由を手に入れる', background: '人生の選択肢、生活水準、家族へのサポートにおいて将来絶対妥協したくないため' },
      { id: 3, text: '監査やコンサルティングの実務で、最高峰の経営パートナーになる', background: '他者に対する貢献価値を高め、誰も代えのきかない「強固な専門職」として生きていく決意' }
    ],
    skills: [],
    future: 'あらゆる学習限界と制限から完全に解放され、グローバルに活躍できるエリートファームの一員として誇りと高待遇、充実した自由時間を満喫している未来。'
  },
  part2_michi: {
    period: '2months',
    basic_actions: {
      lecture: { reason: '基礎インプットなくして自習や過去問のロジックは理解できないため', mind: '講義は倍速で溜めずに一気に全講義消化。その日のうちに論点整理する。' },
      review: { reason: 'エビングハウスの忘却曲線に抗い、短期記憶から長期記憶へ移行させるため', mind: '翌朝＋3日後＋1週間後のスリーステップによる超高速例題周回。' },
      exam: { reason: '本試験基準の制限時間配分とプレッシャーに解法を順応させるため', mind: '実力が仕上がっていなくても絶対に逃げずに受験し、弱点を炙り出す。' },
      reflection: { reason: '同じミス（やらかしパターン）を2度と繰り返さないようにするため', mind: 'ミスの「心理的・物理的真因」まで掘り下げ、反省カルテに即起票。' },
      qna: { reason: '解けない疑問点に無駄な思考時間を消費して進捗を濁らせないため', mind: '自力での悩み込みは15分とし、CPAの講師陣や質問広場をフル活用して即解決。' },
      other: { reason: '意志の力ではなく、物理的な環境設計で行動を自動化するため', mind: '朝起きたらスマホをロック箱に入れ、1分以内に必ず電卓とテキストを開く。' }
    },
    subjects: {
      financial_calc: { theme: '基礎から応用論点を正確に仕分け、スピード処理できる状態へ', tasks: [] },
      financial_theory: { theme: '概念フレームワークと言葉の対比・基準フレーズの暗記', tasks: [] },
      management_accounting: { theme: '苦手論点を素早く回避し、誰もが取るイージー箇所を絶対死守する', tasks: [] },
      corporate_law: { theme: '設立、株式、機関の条文趣旨フレーズとアサーション素読', tasks: [] },
      audit_theory: { theme: 'アサーション、各手続、リスクモデルの論理的一貫性を説明できるレベルへ', tasks: [] },
      tax_law: { theme: '典型計算パターンにおける加算・減算処理パーツのスピード習得', tasks: [] },
      business_concept: { theme: 'ポートフォリオ理論およびファイナンス公式の完全血肉化', tasks: [] }
    }
  }
};

const SKILLS_LIST = [
  "目標設定力", "注意力", "状況把握力", "集中力", "自己分析力",
  "実行力・継続力", "目標達成力", "タイムマネジメント力", "優先順位付け能力",
  "精神力・忍耐力", "論理的思考力", "モチベーション維持力", "構造把握力",
  "問題解決能力", "計画立案力", "情報処理能力"
];

const SUBJECT_LABELS: Record<string, { label: string; bg: string; textClass: string }> = {
  financial_calc: { label: '財務会計論（計算）', bg: 'bg-indigo-550/10', textClass: 'text-indigo-700' },
  financial_theory: { label: '財務会計論（理論）', bg: 'bg-blue-550/10', textClass: 'text-blue-700' },
  management_accounting: { label: '管理会計論', bg: 'bg-emerald-550/10', textClass: 'text-emerald-700' },
  corporate_law: { label: '企業法', bg: 'bg-amber-550/10', textClass: 'text-amber-700' },
  audit_theory: { label: '監査論', bg: 'bg-purple-550/10', textClass: 'text-purple-700' },
  tax_law: { label: '租税法', bg: 'bg-rose-550/10', textClass: 'text-rose-700' },
  business_concept: { label: '経営学', bg: 'bg-teal-550/10', textClass: 'text-teal-700' }
};

interface CpaxFrameworkProps {
  currentMode: CpaxStudyMode;
  onModeToggle: (mode: CpaxStudyMode) => void;
  topics: CpaxTopic[];
  onTargetUpdate: () => void;
}

export const CpaxFrameworkComponent: React.FC<CpaxFrameworkProps> = ({
  currentMode,
  onModeToggle,
  topics,
  onTargetUpdate
}) => {
  // Tabs: 'shi' (志) | 'michi' (道) | 'shin' (進)
  const [activeTab, setActiveTab] = useState<'shi' | 'michi' | 'shin'>('shi');

  // Load Framework from LocalStorage
  const [frameworkData, setFrameworkData] = useState<CpaxFrameworkV2>(() => {
    try {
      const stored = localStorage.getItem('cpax_framework_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading cpax_framework_v2:', e);
    }
    return DEFAULT_FRAMEWORK_V2;
  });

  // State for motivating/future input changes
  const [futureText, setFutureText] = useState(frameworkData.part1_shishi.future);
  const [motives, setMotives] = useState<Motive[]>(frameworkData.part1_shishi.motives);
  const [selectedSkills, setSelectedSkills] = useState<SkillSelection[]>(frameworkData.part1_shishi.skills);

  // States for target dates and times
  const [shortExamDate, setShortExamDate] = useState(frameworkData.part1_shishi.exam_dates.short);
  const [essayExamDate, setEssayExamDate] = useState(frameworkData.part1_shishi.exam_dates.essay);

  // Michi (path) Period and Actions
  const [selectedPeriod, setSelectedPeriod] = useState(frameworkData.part2_michi.period);
  const [basicActions, setBasicActions] = useState(frameworkData.part2_michi.basic_actions);
  const [subjectsConfig, setSubjectsConfig] = useState(frameworkData.part2_michi.subjects);

  // Subject details Task input states
  const [activeSubjectKey, setActiveSubjectKey] = useState<keyof typeof SUBJECT_LABELS>('financial_calc');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newTaskHours, setNewTaskHours] = useState<number>(30);

  // Notification success
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDesc, setShowDesc] = useState(false);

  // -------------------------------------------------------------
  // MUTATION PERSIST LOGIC
  // -------------------------------------------------------------
  const saveFrameworkData = (newData: CpaxFrameworkV2, message = "CPAXフレームワークを保存しました") => {
    setFrameworkData(newData);
    localStorage.setItem('cpax_framework_v2', JSON.stringify(newData));
    
    // Inject Target Dates automatically to Countdown/Calendar
    const activeExamDate = currentMode === 'short' ? newData.part1_shishi.exam_dates.short : newData.part1_shishi.exam_dates.essay;
    const activeExamTitle = currentMode === 'short' ? '公認会計士 短答式試験' : '公認会計士 論文式試験';
    
    localStorage.setItem('cpax_target_date', JSON.stringify(activeExamDate));
    localStorage.setItem('cpax_target_title', JSON.stringify(activeExamTitle));

    // Notify any parent updates
    onTargetUpdate();

    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Synchronize dynamic mode change in framework with countdown
  useEffect(() => {
    const activeExamDate = currentMode === 'short' ? frameworkData.part1_shishi.exam_dates.short : frameworkData.part1_shishi.exam_dates.essay;
    const activeExamTitle = currentMode === 'short' ? '公認会計士 短答式試験' : '公認会計士 論文式試験';
    
    localStorage.setItem('cpax_target_date', JSON.stringify(activeExamDate));
    localStorage.setItem('cpax_target_title', JSON.stringify(activeExamTitle));
    onTargetUpdate();
  }, [currentMode, frameworkData.part1_shishi.exam_dates]);


  // -------------------------------------------------------------
  // SHISHI (Part 1) HANDLERS
  // -------------------------------------------------------------
  const handleMotiveChange = (id: number, field: 'text' | 'background', val: string) => {
    const nextMotives = motives.map(m => m.id === id ? { ...m, [field]: val } : m);
    setMotives(nextMotives);

    const nextFramework = {
      ...frameworkData,
      part1_shishi: {
        ...frameworkData.part1_shishi,
        motives: nextMotives
      }
    };
    saveFrameworkData(nextFramework, "モチベーション動機マップを変更しました");
  };

  const handleToggleSkill = (skillName: string) => {
    const exists = selectedSkills.find(s => s.name === skillName);
    let nextSkills: SkillSelection[] = [];

    if (exists) {
      nextSkills = selectedSkills.filter(s => s.name !== skillName);
    } else {
      if (selectedSkills.length >= 3) {
        alert("ソフトスキルは同時に最大3つまで選択可能です。意識を集中させるため制限しています。");
        return;
      }
      nextSkills = [...selectedSkills, { name: skillName, action: '' }];
    }

    setSelectedSkills(nextSkills);
    const nextFramework = {
      ...frameworkData,
      part1_shishi: {
        ...frameworkData.part1_shishi,
        skills: nextSkills
      }
    };
    saveFrameworkData(nextFramework, "意識すべきソフトスキルを登録しました");
  };

  const handleSkillActionChange = (name: string, val: string) => {
    const nextSkills = selectedSkills.map(s => s.name === name ? { ...s, action: val } : s);
    setSelectedSkills(nextSkills);

    const nextFramework = {
      ...frameworkData,
      part1_shishi: {
        ...frameworkData.part1_shishi,
        skills: nextSkills
      }
    };
    saveFrameworkData(nextFramework, "ソフトスキルの意識行動を更新しました (自動保存)");
  };

  const handleSaveFutureAndDates = () => {
    const nextFramework: CpaxFrameworkV2 = {
      ...frameworkData,
      part1_shishi: {
        exam_dates: { short: shortExamDate, essay: essayExamDate },
        motives,
        skills: selectedSkills,
        future: futureText.trim()
      }
    };
    saveFrameworkData(nextFramework, "【志】コミットメントと未来像を保存しました");
  };


  // -------------------------------------------------------------
  // MICHI (Part 2) HANDLERS
  // -------------------------------------------------------------
  const handleActionChange = (actionKey: keyof typeof frameworkData.part2_michi.basic_actions, field: 'reason' | 'mind', val: string) => {
    const nextActions = {
      ...basicActions,
      [actionKey]: {
        ...basicActions[actionKey],
        [field]: val
      }
    };
    setBasicActions(nextActions);

    const nextFramework = {
      ...frameworkData,
      part2_michi: {
        ...frameworkData.part2_michi,
        basic_actions: nextActions
      }
    };
    saveFrameworkData(nextFramework, "基本行動の誓約を更新しました (自動保存)");
  };

  const handleThemeChange = (subjKey: keyof typeof SUBJECT_LABELS, val: string) => {
    const nextSubjects = {
      ...subjectsConfig,
      [subjKey]: {
        ...subjectsConfig[subjKey],
        theme: val
      }
    };
    setSubjectsConfig(nextSubjects);

    const nextFramework = {
      ...frameworkData,
      part2_michi: {
        ...frameworkData.part2_michi,
        subjects: nextSubjects
      }
    };
    saveFrameworkData(nextFramework, "科目の戦略テーマを更新しました");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const taskItem: SubjectTask = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: newTaskText.trim(),
      priority: newTaskPriority,
      hours: newTaskHours
    };

    const targetSubj = subjectsConfig[activeSubjectKey] || { theme: '', tasks: [] };
    const nextSubjectData = {
      ...targetSubj,
      tasks: [...(targetSubj.tasks || []), taskItem]
    };

    const nextSubjects = {
      ...subjectsConfig,
      [activeSubjectKey]: nextSubjectData
    };
    setSubjectsConfig(nextSubjects);

    const nextFramework = {
      ...frameworkData,
      part2_michi: {
        ...frameworkData.part2_michi,
        subjects: nextSubjects
      }
    };
    saveFrameworkData(nextFramework, `[${SUBJECT_LABELS[activeSubjectKey].label}]にタスクを追加しました`);
    setNewTaskText('');
  };

  const handleDeleteTask = (subjKey: keyof typeof SUBJECT_LABELS, taskId: string) => {
    const targetSubj = subjectsConfig[subjKey];
    const nextTasks = targetSubj.tasks.filter(t => t.id !== taskId);

    const nextSubjects = {
      ...subjectsConfig,
      [subjKey]: {
        ...targetSubj,
        tasks: nextTasks
      }
    };
    setSubjectsConfig(nextSubjects);

    const nextFramework = {
      ...frameworkData,
      part2_michi: {
        ...frameworkData.part2_michi,
        subjects: nextSubjects
      }
    };
    saveFrameworkData(nextFramework, "戦略タスクを削除しました");
  };

  const handlePeriodChange = (periodVal: string) => {
    setSelectedPeriod(periodVal);
    const nextFramework = {
      ...frameworkData,
      part2_michi: {
        ...frameworkData.part2_michi,
        period: periodVal
      }
    };
    saveFrameworkData(nextFramework, "計画スパンを更新しました");
  };


  // -------------------------------------------------------------
  // SHIN (Part 3) CALCULATOR LOGICS
  // -------------------------------------------------------------
  const progressStats = useMemo(() => {
    // 1. Gather master topics to map topicId -> subject
    const subjectMapping: Record<string, string> = {};
    topics.forEach(t => {
      subjectMapping[t.id] = t.subject;
    });

    // 2. Map CPA Topic Japanese subject labels to Framework Subject Keys
    const reverseSubjMapping: Record<string, keyof typeof SUBJECT_LABELS> = {
      '財務会計論(計算)': 'financial_calc',
      '財務会計論(理論)': 'financial_theory',
      '管理会計論': 'management_accounting',
      '企業法': 'corporate_law',
      '監査論': 'audit_theory',
      '租税法': 'tax_law',
      '経営学': 'bus-001' // topics lists are matched differently, let's treat properly
    };

    // More bulletproof matching mapping
    const detectFrameworkKey = (subjName: string): keyof typeof SUBJECT_LABELS | null => {
      if (subjName.includes('財務会計論(計算)') || subjName.includes('財務') && subjName.includes('計算')) return 'financial_calc';
      if (subjName.includes('財務会計論(理論)') || subjName.includes('財務') && subjName.includes('理論')) return 'financial_theory';
      if (subjName.includes('管理会計論') || subjName.includes('管理')) return 'management_accounting';
      if (subjName.includes('企業法') || subjName.includes('企業')) return 'corporate_law';
      if (subjName.includes('監査論') || subjName.includes('監査')) return 'audit_theory';
      if (subjName.includes('租税法') || subjName.includes('租税')) return 'tax_law';
      if (subjName.includes('経営学') || subjName.includes('経営')) return 'business_concept';
      return null;
    };

    // 3. Collect real history minutes
    const historyList: CpaxHistoryItem[] = (() => {
      try {
        return JSON.parse(localStorage.getItem('cpax_history') || '[]');
      } catch {
        return [];
      }
    })();

    const minutesByFrameworkKey: Record<keyof typeof SUBJECT_LABELS, number> = {
      financial_calc: 0,
      financial_theory: 0,
      management_accounting: 0,
      corporate_law: 0,
      audit_theory: 0,
      tax_law: 0,
      business_concept: 0
    };

    historyList.forEach(item => {
      const subjName = subjectMapping[item.topicId];
      if (subjName) {
        const key = detectFrameworkKey(subjName);
        if (key) {
          minutesByFrameworkKey[key] += item.duration;
        }
      } else {
        // Fallback checks for topic IDs directly parsed
        if (item.topicId.startsWith('far-c')) minutesByFrameworkKey.financial_calc += item.duration;
        if (item.topicId.startsWith('far-t')) minutesByFrameworkKey.financial_theory += item.duration;
        if (item.topicId.startsWith('ma')) minutesByFrameworkKey.management_accounting += item.duration;
        if (item.topicId.startsWith('law')) minutesByFrameworkKey.corporate_law += item.duration;
        if (item.topicId.startsWith('aud')) minutesByFrameworkKey.audit_theory += item.duration;
        if (item.topicId.startsWith('tax')) minutesByFrameworkKey.tax_law += item.duration;
        if (item.topicId.startsWith('bus')) minutesByFrameworkKey.business_concept += item.duration;
      }
    });

    // 4. Summarize target hours configured in Part 2 Michi
    const targetHoursByKey: Record<keyof typeof SUBJECT_LABELS, number> = {
      financial_calc: 0,
      financial_theory: 0,
      management_accounting: 0,
      corporate_law: 0,
      audit_theory: 0,
      tax_law: 0,
      business_concept: 0
    };

    Object.entries(subjectsConfig).forEach(([key, subjObj]: [string, any]) => {
      const k = key as keyof typeof SUBJECT_LABELS;
      if (subjObj && subjObj.tasks) {
        subjObj.tasks.forEach((t: any) => {
          targetHoursByKey[k] += Number(t.hours) || 0;
        });
      }
    });

    // 5. Generate complete dynamic statistics details
    const subjectStats = Object.keys(SUBJECT_LABELS).map(key => {
      const k = key as keyof typeof SUBJECT_LABELS;
      const targetHours = targetHoursByKey[k];
      const actualHours = Number((minutesByFrameworkKey[k] / 60).toFixed(1));
      const percentage = targetHours > 0 ? Math.min(100, Math.round((actualHours / targetHours) * 100)) : 0;
      
      return {
        key: k,
        label: SUBJECT_LABELS[k].label,
        bg: SUBJECT_LABELS[k].bg,
        textClass: SUBJECT_LABELS[k].textClass,
        targetHours,
        actualHours,
        percentage
      };
    });

    // Remove tax_law and business_concept during 'short' mode for proper progress aggregate
    const activeSubjectStats = subjectStats.filter(s => {
      if (currentMode === 'short' && (s.key === 'tax_law' || s.key === 'business_concept')) {
        return false;
      }
      return true;
    });

    const totalTargetHours = activeSubjectStats.reduce((sum, s) => sum + s.targetHours, 0);
    const totalActualHours = activeSubjectStats.reduce((sum, s) => sum + s.actualHours, 0);
    const totalPercentage = totalTargetHours > 0 ? Math.min(100, Math.round((totalActualHours / totalTargetHours) * 100)) : 0;

    return {
      totalTargetHours,
      totalActualHours,
      totalPercentage,
      activeSubjectStats
    };
  }, [subjectsConfig, topics, currentMode]);


  // -------------------------------------------------------------
  // SHIN (Part 3): COUNTER LOSS EXAM REPORT FAIL PATTERNS
  // -------------------------------------------------------------
  const failPatternAnalysis = useMemo(() => {
    const examReports: CpaxExamReport[] = (() => {
      try {
        return JSON.parse(localStorage.getItem('cpax_exam_reports') || '[]');
      } catch {
        return [];
      }
    })();

    let knowledgeLoss = 0;   // 知識不足
    let retentionLoss = 0;   // 定着・理解不足
    let carelessLoss = 0;     // ケアレスミス
    let timeLoss = 0;         // 時間配分ミス

    examReports.forEach(report => {
      const textToScan = [
        ...(report.failurePatterns || []),
        report.analysis || '',
        report.actionPlan || '',
        report.title || ''
      ].join(' ').toLowerCase();

      // Knowledge keywords
      if (/知識|テキスト|基本|インプット|趣旨|論点|定義|覚え直|基準|説/.test(textToScan)) knowledgeLoss++;
      // Output Retention keywords
      if (/定着|解法|理解|連鎖|パター|演習|間違文|忘|スピード|復習不足/.test(textToScan)) retentionLoss++;
      // Careless mistakes keywords
      if (/ケアレス|読み飛ば|飛ばし|ひっかけ|不注意|転記|勘違い|ケア|マーク/.test(textToScan)) carelessLoss++;
      // Time limit keywords
      if (/時間|配分|タイム|撤退|勘|塗り|埋没|損切|時間切|解ききれ|遅/.test(textToScan)) timeLoss++;
    });

    const totalLossCount = knowledgeLoss + retentionLoss + carelessLoss + timeLoss;

    return {
      knowledgeLoss,
      retentionLoss,
      carelessLoss,
      timeLoss,
      totalLossCount
    };
  }, []);


  // -------------------------------------------------------------
  // SHIN (Part 3): GAP ANALYSIS (LocalStorage persistence)
  // -------------------------------------------------------------
  const [selectedGapTags, setSelectedGapTags] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('cpax_gap_tags');
      return stored ? JSON.parse(stored) : ['スマホの誘惑', '睡眠不足'];
    } catch {
      return ['スマホの誘惑', '睡眠不足'];
    }
  });

  const [gapResolution, setGapResolution] = useState(() => {
    return localStorage.getItem('cpax_gap_resolution') || 'スマホは朝起きてすぐ自習室に預け、勉強席にはタブレットだけ持ち込む習慣を徹底する！';
  });

  const handleToggleGapTag = (tag: string) => {
    const nextTags = selectedGapTags.includes(tag)
      ? selectedGapTags.filter(t => t !== tag)
      : [...selectedGapTags, tag];
    setSelectedGapTags(nextTags);
    localStorage.setItem('cpax_gap_tags', JSON.stringify(nextTags));
  };

  const handleSaveResolution = () => {
    localStorage.setItem('cpax_gap_resolution', gapResolution);
    setToastMessage("PCDA決意表明を保存しました");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };


  return (
    <div className="space-y-6" id="cpax-soul-michi-shin">
      {/* Dynamic Toast feedback */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-750 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 max-w-sm font-sans animate-fade-in no-print">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Elegant UI Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white text-left shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-500/5 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow shrink-0" />
            <span className="font-mono text-[9px] bg-indigo-900/40 border border-indigo-800 text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              CPA METHOD FRAMEWORK
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-sans font-black text-2xl md:text-3xl tracking-tight leading-none">
              CPAX メンタル サポート
            </h2>
            <button
              type="button"
              onClick={() => setShowDesc(!showDesc)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 select-none text-white/90 cursor-pointer transition-all border border-white/10 text-[10px] font-bold flex items-center gap-1 active:scale-95"
              title="システム説明の表示切り替え"
            >
              <Info className="w-3 h-3 text-indigo-300 shrink-0" />
              <span>{showDesc ? '説明を隠す' : '説明を表示'}</span>
            </button>
          </div>
          {showDesc && (
            <p className="text-xs text-indigo-200/90 max-w-2xl leading-relaxed bg-slate-950/40 p-3.5 rounded-2xl border border-white/5 animate-scale-in">
              志（譲れない動機）を一本の軸（Axis）にマッピングし、道（戦略タスク）をスケジューラーに流し込み、進（PDCA検証）で成長を科学的に把握する、究極の一元管理システム。
            </p>
          )}
        </div>

        {/* Global Study Mode Toggle & Synchronization Area */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 no-print">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300">現在の学習ターゲット:</span>
            <div className="p-0.5 bg-slate-800/80 rounded-xl border border-white/5 inline-flex">
              <button
                type="button"
                onClick={() => onModeToggle('short')}
                className={`py-1.5 px-4 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  currentMode === 'short'
                    ? 'bg-indigo-650 text-white shadow-md font-blackScale'
                    : 'text-slate-400 hover:text-slate-200 bg-transparent'
                }`}
              >
                短答式試験
              </button>
              <button
                type="button"
                onClick={() => onModeToggle('essay')}
                className={`py-1.5 px-4 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  currentMode === 'essay'
                    ? 'bg-indigo-650 text-white shadow-md font-blackScale'
                    : 'text-slate-400 hover:text-slate-200 bg-transparent'
                }`}
              >
                論文式試験
              </button>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono font-bold text-indigo-300 bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-750">
            {currentMode === 'short' ? '短答5科目 (実質租税・経営マスク状態)' : '論文7科目完全開放モード'}
          </div>
        </div>
      </div>

      {/* Tabs segment */}
      <div className="flex border-b border-slate-100 p-0.5 bg-slate-100 rounded-2xl w-max max-w-full overflow-x-auto no-print">
        <button
          onClick={() => setActiveTab('shi')}
          className={`flex items-center gap-2 py-2.5 px-5 sm:px-8 font-black text-xs rounded-xl cursor-pointer transition-all ${
            activeTab === 'shi'
              ? 'bg-white text-indigo-950 shadow-sm border border-slate-100/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className={`w-4.5 h-4.5 ${activeTab === 'shi' ? 'text-rose-600 fill-rose-500' : 'text-slate-400'}`} />
          【志 - SHI】マインド・志望動機
        </button>
        <button
          onClick={() => setActiveTab('michi')}
          className={`flex items-center gap-2 py-2.5 px-5 sm:px-8 font-black text-xs rounded-xl cursor-pointer transition-all ${
            activeTab === 'michi'
              ? 'bg-white text-indigo-950 shadow-sm border border-slate-100/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Footprints className={`w-4.5 h-4.5 ${activeTab === 'michi' ? 'text-indigo-600' : 'text-slate-400'}`} />
          【道 - MICHI】科目別戦略 ＆ 里程標TODO
        </button>
        <button
          onClick={() => setActiveTab('shin')}
          className={`flex items-center gap-2 py-2.5 px-5 sm:px-8 font-black text-xs rounded-xl cursor-pointer transition-all ${
            activeTab === 'shin'
              ? 'bg-white text-indigo-950 shadow-sm border border-slate-100/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className={`w-4.5 h-4.5 ${activeTab === 'shin' ? 'text-emerald-600' : 'text-slate-400'}`} />
          【進 - SHIN】シビアなPDCA・傾向分析
        </button>
      </div>

      {/* ------------------------------------------------------------------------------------------------ */}
      {/* TAB 1: SHISHI (志) VIEW */}
      {/* ------------------------------------------------------------------------------------------------ */}
      {activeTab === 'shi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left animate-fade-in">
          {/* Left panel: Dates committing & motives (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Countdown Committing Card */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="font-sans font-bold text-slate-900 text-sm">
                  Q1: 目標本試験時期の絶対コミット
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                あなたが照準を合わせて勉強を行っている「真の決戦日」をここで指定します。この日付は、カレンダー（🏆マーク表示）およびダッシュボードのカウントダウンへリアルタイムに連動注入されます。
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-400 font-mono">SHORT-TERM TARGET</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold rounded">短答式希望</span>
                  </div>
                  <label className="block text-xs font-bold text-slate-700">目標受験日（短答式）</label>
                  <input
                    type="date"
                    value={shortExamDate}
                    onChange={(e) => setShortExamDate(e.target.value)}
                    className="w-full max-w-[180px] bg-white border border-slate-200 text-xs font-bold rounded-lg py-1 px-2.5 h-9 mt-1 focus:outline-none focus:border-indigo-650 transition-all cursor-pointer"
                  />
                  <div className="flex gap-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setShortExamDate('2026-12-13')}
                      className="text-[9px] font-black bg-white hover:bg-slate-150 border border-slate-200 px-2 py-1 rounded text-slate-600 transition-colors"
                    >
                      2026年12月 (12-13)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShortExamDate('2027-05-16')}
                      className="text-[9px] font-black bg-white hover:bg-slate-150 border border-slate-200 px-2 py-1 rounded text-slate-600 transition-colors"
                    >
                      2027年5月 (05-16)
                    </button>
                  </div>
                </div>

                <div className={`bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 transition-all ${currentMode === 'short' ? 'opacity-50 hover:opacity-80' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-400 font-mono">ESSAY-TERM TARGET</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-teal-50 border border-teal-100 text-teal-600 font-extrabold rounded">論文式希望</span>
                  </div>
                  <label className="block text-xs font-bold text-slate-700">目標受験日（論文式）</label>
                  <input
                    type="date"
                    value={essayExamDate}
                    onChange={(e) => setEssayExamDate(e.target.value)}
                    className="w-full max-w-[180px] bg-white border border-slate-200 text-xs font-bold rounded-lg py-1 px-2.5 h-9 mt-1 focus:outline-none focus:border-indigo-650 transition-all cursor-pointer"
                  />
                  <div className="flex gap-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setEssayExamDate('2026-08-23')}
                      className="text-[9px] font-black bg-white hover:bg-slate-105 border border-slate-200 px-2 py-1 rounded text-slate-600 transition-colors"
                    >
                      2026年8月 (08-23)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEssayExamDate('2027-08-22')}
                      className="text-[9px] font-black bg-white hover:bg-slate-105 border border-slate-200 px-2 py-1 rounded text-slate-600 transition-colors"
                    >
                      2027年8月 (08-22)
                    </button>
                  </div>
                </div>
              </div>

              {currentMode === 'short' && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100/30 rounded-xl text-[10px] text-indigo-700 leading-relaxed font-bold">
                  💡現在は「短答式モード」のため、カウントダウン・カレンダーは短答目標受験日（{shortExamDate}）を設定しています。
                </div>
              )}
              {currentMode === 'essay' && (
                <div className="p-3 bg-teal-50/50 border border-teal-100/30 rounded-xl text-[10px] text-teal-700 leading-relaxed font-bold">
                  💡現在は「論文式モード」のため、カウントダウン・カレンダーは論文目標受験日（{essayExamDate}）をターゲットにしています。
                </div>
              )}
            </div>

            {/* Motives mapping (1対1アコーディオン連動構造) */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
                <h3 className="font-sans font-bold text-slate-900 text-sm">
                  Q2 ＆ Q3: 戦略的動機と背景の徹底的な記述
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                過酷な10時間を毎日乗り越えるためには、表面的な綺麗事ではなく「本音の理由・背景」が必要です。動機と、その裏にある自身の過去の経験に対する本音のギャップを鮮明に記録してください。
              </p>

              <div className="space-y-4">
                {motives.map((motive, idx) => (
                  <div key={motive.id} className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl space-y-3 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-indigo-600 text-white w-6 h-6 rounded-lg flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-black text-slate-800">コア動機</span>
                    </div>

                    <input
                      type="text"
                      value={motive.text}
                      onChange={(e) => handleMotiveChange(motive.id, 'text', e.target.value)}
                      placeholder="例: 会計士資格を得て市場価値を最大化させ、一生経済的な心配から解放される"
                      className="w-full bg-white border border-slate-200 text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-indigo-650"
                    />

                    {/* Background explanation (Accordion-like Nesting) */}
                    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-3">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                        その動機に至った「本当に自分らしい、過去の失敗体験や本音の背景に照らした理由」
                      </label>
                      <textarea
                        value={motive.background}
                        onChange={(e) => handleMotiveChange(motive.id, 'background', e.target.value)}
                        placeholder="例: 会社の評価や周囲の学歴フィルターに対して、客観的な実績（Axis）を持たないまま理不尽さに悔しさを覚えた経験から、絶対にブレない自己の自信の軸が不可欠だと感じた。"
                        rows={2}
                        className="w-full bg-slate-50 text-[11px] font-semibold text-slate-700 focus:bg-white rounded-lg p-2.5 focus:outline-none border-0 focus:ring-1 focus:ring-indigo-350"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Soft skills list selection with custom actions inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-100" />
                <h3 className="font-sans font-bold text-indigo-950 text-sm">
                  Q4: 伸ばしたい3つのソフトスキル
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                受験勉強はただの知識暗記ではなく、「究極のポテンシャル養成ギミック」です。16項目から今もっとも意識強化したいソフトスキルを最大3つ選んでください。
              </p>

              {/* 16 skills layout grid */}
              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50">
                {SKILLS_LIST.map((skill) => {
                  const isChecked = selectedSkills.some(s => s.name === skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`text-[10px] font-bold py-2 px-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-indigo-650 border-indigo-700 text-white shadow-sm'
                          : 'bg-white border-slate-150 text-slate-600 hover:bg-indigo-50/30'
                      }`}
                    >
                      <span className="truncate">{skill}</span>
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 shrink-0 ml-1" />
                      ) : (
                        <span className="w-2 h-2 rounded-full border border-slate-350 bg-slate-100 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Action Plan Editor appeared of chosen 3 skills */}
              <div className="space-y-4.5 pt-2">
                <span className="text-[10px] font-extrabold text-slate-400 block border-b border-dashed border-slate-100 pb-1.5 uppercase font-sans tracking-wider">
                  選択したスキルの具体的意識エディタ（最大3）
                </span>

                {selectedSkills.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-150 rounded-2xl text-slate-400 font-bold text-[11px] select-none bg-slate-50/40">
                    上のスキルリストからチェックを入れてください。<br />毎日実行するための具体的意識行動欄が出現します。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSkills.map((skillItem) => (
                      <div key={skillItem.name} className="p-3 bg-indigo-50/20 border border-indigo-150/40 rounded-2xl space-y-1.5 text-left transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                            <Dumbbell className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            {skillItem.name}
                          </span>
                          <span className="text-[9px] font-mono text-indigo-500 font-extrabold">ACTIONS REQUIRED</span>
                        </div>
                        <input
                          type="text"
                          value={skillItem.action}
                          onChange={(e) => handleSkillActionChange(skillItem.name, e.target.value)}
                          placeholder={`例: ${skillItem.name}を発揮するため、朝のスケジュールを秒単位で決定して開始する`}
                          className="w-full bg-white text-[11px] font-semibold text-slate-800 rounded-lg p-2.5 border border-slate-200 outline-none focus:border-indigo-600"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Q5: Future text zone */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-100" />
                <h3 className="font-sans font-bold text-slate-900 text-sm">
                  Q5: ワクワクする無制限の未来ノート
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                試験合格後に広がる、制限のない最高の人生を妄想してください。どこに住み、誰と、どんな仕事や年収、休日を送っていますか？
              </p>
              <textarea
                value={futureText}
                onChange={(e) => setFutureText(e.target.value)}
                rows={4}
                className="w-full text-[11px] font-bold p-3 bg-amber-50/10 border border-amber-200/50 focus:border-amber-400 focus:outline-none rounded-2xl leading-relaxed text-slate-800"
                placeholder="例: 年収1200万以上を若くして手掛け、ハイクラスホテルや海外出張、自律した素晴らしい同僚と最高なディナーを愉しむ。平日の午後からはカフェで自分の裁量で仕事をする快適なビジネスピープル。"
              />
            </div>

            {/* Save Button for Part 1 */}
            <button
              type="button"
              onClick={handleSaveFutureAndDates}
              className="w-full pointer-events px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[12px] tracking-widest rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all active:scale-95 border border-slate-900"
            >
              <Save className="w-4 h-5 text-indigo-400 fill-indigo-400 shrink-0" />
              【志】全ての意思決定をセーブする
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------------------------ */}
      {/* TAB 2: MICHI (道) VIEW */}
      {/* ------------------------------------------------------------------------------------------------ */}
      {activeTab === 'michi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left animate-fade-in">
          {/* Left Panel: Period & Basic Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-650" />
                計画のスパン期間を宣言
              </h3>

              <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-slate-100 rounded-xl">
                {['1month', '2months', '3months', 'target', 'other'].map((opt) => {
                  const label = opt === '1month' ? '1ヶ月' : opt === '2months' ? '2ヶ月' : opt === '3months' ? '3ヶ月' : opt === 'target' ? '本試験日' : 'その他';
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handlePeriodChange(opt)}
                      className={`text-[10px] font-bold py-1.5 px-2.5 rounded-lg text-center cursor-pointer transition-all ${
                        selectedPeriod === opt
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q1: 5 Core Actions Map (入れ子テキストリスト) */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-indigo-600" />
                <h3 className="font-sans font-bold text-slate-900 text-sm">
                  Q1: 実践基本行動 6箇条の独自定義（誓約）
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                講義受講や答練、Q&Aを「やるべきタスク」に留めず「なぜそれを自発的に選び、どうやるか」の行動定義を言語化します。
              </p>

              <div className="space-y-4 max-h-[38rem] overflow-y-auto pr-1">
                {[
                  { key: 'lecture', title: '① 講義の受講' },
                  { key: 'review', title: '② 定期的な復習' },
                  { key: 'exam', title: '③ 答練の受験' },
                  { key: 'reflection', title: '④ 答練の振り返り' },
                  { key: 'qna', title: '⑤ わからない箇所の解決' },
                  { key: 'other', title: '⑥ その他、絶対守るルール' }
                ].map((act) => {
                  const actKey = act.key as keyof typeof frameworkData.part2_michi.basic_actions;
                  const item = basicActions[actKey] || { reason: '', mind: '' };
                  return (
                    <div key={act.key} className="p-3.5 bg-slate-50/40 border border-slate-100 rounded-2xl space-y-2.5">
                      <h4 className="text-xs font-black text-slate-800">{act.title}</h4>
                      
                      <div className="space-y-1 bg-white p-2.5 rounded-xl border border-dashed border-slate-200">
                        <label className="text-[9px] font-black text-slate-450 block uppercase tracking-wider">必要な理由・やる目的</label>
                        <input
                          type="text"
                          value={item.reason}
                          onChange={(e) => handleActionChange(actKey, 'reason', e.target.value)}
                          placeholder="例: 理解不足の論点を放置して応用問題を解いても意味がないため"
                          className="w-full text-[10px] font-semibold text-slate-700 bg-transparent outline-none focus:text-indigo-950 mt-0.5"
                        />
                      </div>

                      <div className="space-y-1 bg-white p-2.5 rounded-xl border border-dashed border-slate-200">
                        <label className="text-[9px] font-black text-slate-450 block uppercase tracking-wider">意識すべき最高のやり方・マインド</label>
                        <input
                          type="text"
                          value={item.mind}
                          onChange={(e) => handleActionChange(actKey, 'mind', e.target.value)}
                          placeholder="例: 1.5倍速で消化。わからない点はその日中に講師に質問し未解決にしない"
                          className="w-full text-[10px] font-semibold text-slate-700 bg-transparent outline-none focus:text-indigo-950 mt-0.5"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Subject Specific theme config & Checklist Forms (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-650" />
                <h3 className="font-sans font-bold text-slate-900 text-sm">
                  Q2: 科目別アクションテーマ ＆ 里程標（最優先TODO）設定
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                各科目ごとの『学習指導テーマ』とタスクを決めます。
                ここで<span className="font-extrabold text-indigo-600">「優先順位：高」</span>にした戦略タスクは、<span className="font-extrabold text-indigo-600 font-black">【学習計画】コックピットに “今期の最優先TODO” として自動で同期</span>され、ワンタップでカレンダー予定に日付マッピングできます！
              </p>

              {/* Subject key switcher. Auto masks tax_law and business_concept during 'short' mode */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3 no-print">
                {Object.keys(SUBJECT_LABELS).map((key) => {
                  const k = key as keyof typeof SUBJECT_LABELS;
                  // Auto hide Tax Law and Management under Short mode (短答式)
                  if (currentMode === 'short' && (k === 'tax_law' || k === 'business_concept')) {
                    return null;
                  }
                  const active = activeSubjectKey === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setActiveSubjectKey(k)}
                      className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                        active
                          ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                          : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {SUBJECT_LABELS[k].label}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic chosen Active Subject Cockpit card */}
              <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-4 text-left shadow-sm">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${SUBJECT_LABELS[activeSubjectKey].bg} ${SUBJECT_LABELS[activeSubjectKey].textClass}`}>
                    {SUBJECT_LABELS[activeSubjectKey].label}
                  </span>
                  <span className="text-[9px] font-mono font-black text-slate-400">ACTIVE COCKPIT</span>
                </div>

                {/* Subj Strategic overall Theme input */}
                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">この科目の「今期絶対にブレさせない軸・戦略テーマ」</label>
                  <input
                    type="text"
                    value={subjectsConfig[activeSubjectKey]?.theme || ''}
                    onChange={(e) => handleThemeChange(activeSubjectKey, e.target.value)}
                    placeholder="例: 個別例題の計算パターン暗記とスピードを上げ、時間オーバーの脅威を退ける"
                    className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none border-b border-slate-150 pb-1 mt-1 focus:border-indigo-650"
                  />
                </div>

                {/* Task Form inside active Subject card */}
                <form onSubmit={handleAddTask} className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-3.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">新しい戦略タスクの追加</span>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-450 block">1. 徹底タスク内容</label>
                    <input
                      type="text"
                      required
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="例: テキスト1〜3の応用例題を全問すらすら回せるまで2回転"
                      className="w-full text-xs font-bold bg-slate-50 hover:bg-slate-100/50 p-2.5 rounded-lg border-0 focus:ring-1 focus:ring-indigo-300 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-1">
                    <div>
                      <label className="text-[9px] font-black text-slate-450 block mb-1">2. 最優先TODO 候補 (度合い)</label>
                      <div className="flex gap-1.5">
                        {['high', 'medium', 'low'].map((p) => {
                          const isSel = newTaskPriority === p;
                          const labels = p === 'high' ? '高' : p === 'medium' ? '中' : '低';
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setNewTaskPriority(p as 'high' | 'medium' | 'low')}
                              className={`flex-1 text-[10px] font-black py-1 px-1.5 text-center border rounded cursor-pointer ${
                                isSel
                                  ? 'bg-rose-600 border-rose-750 text-white font-extrabold'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {labels}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-450 block mb-1">3. 目標所要時間 (時間h)</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={newTaskHours}
                        onChange={(e) => setNewTaskHours(parseInt(e.target.value) || 10)}
                        className="w-full text-xs font-bold bg-slate-50 hover:bg-slate-100/50 p-1.5 rounded-lg border-0 focus:ring-1 focus:ring-indigo-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4 text-indigo-400 shrink-0" />
                    この戦略タスクをロックイン
                  </button>
                </form>

                {/* Subj Task listed cards */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {SUBJECT_LABELS[activeSubjectKey].label} の現在ロック済タスク (全{(subjectsConfig[activeSubjectKey]?.tasks || []).length}件)
                  </span>

                  {(subjectsConfig[activeSubjectKey]?.tasks || []).length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-white text-slate-400 text-[10px] font-bold select-none">
                      登録されているタスクがありません。上のフォームから登録すると、学習計画・里程標 Cockpit と同期します。
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {(subjectsConfig[activeSubjectKey]?.tasks || []).map((task) => (
                        <div key={task.id} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-left shadow-sm">
                          <div className="overflow-hidden space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                task.priority === 'high' 
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                  : task.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-700'
                              }`}>
                                {task.priority === 'high' ? '🔥高優先(学習計画連携)' : task.priority === 'medium' ? '中' : '低'}
                              </span>
                              <span className="text-[9px] font-mono font-black text-slate-400">
                                目標: {task.hours}時間
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 truncate pr-2">{task.text}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(activeSubjectKey, task.id)}
                            className="text-slate-300 hover:text-rose-600 transition-colors p-2 cursor-pointer shrink-0"
                            title="この戦略タスクを削除"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------------------------ */}
      {/* TAB 3: SHIN (進) VIEW */}
      {/* ------------------------------------------------------------------------------------------------ */}
      {activeTab === 'shin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left animate-fade-in">
          {/* Left panel: Hours actual vs targets progress meters (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="font-mono text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-600 px-2.5 py-0.5 rounded-lg font-black tracking-widest uppercase">
                REAL-TIME AUDIT MONITOR
              </span>
              <h3 className="font-sans font-bold text-slate-900 text-base mt-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Q1: 科目別 目標時間 ✕ 実績時間 自動対比（計画消化率）
              </h3>
              <p className="text-[11px] text-slate-400">
                Part 2で設定した全タスクの目標合計時間と、<span className="font-extrabold text-slate-800 font-sans">【タイマー/論点回転履歴】</span>で蓄積された実際の学習実績時間を自動集計して対比・計算します。
              </p>
            </div>

            {/* Core General Aggregation Big circular style visual */}
            <div className="bg-gradient-to-br from-emerald-50/30 to-white border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-[8px] font-mono tracking-widest text-slate-400 font-extrabold block uppercase">CUMULATIVE METRIC</span>
                <h4 className="text-sm font-black text-slate-800">全体計画消化率（累計時間ベース）</h4>
                <div className="flex items-baseline gap-1 mt-1 justify-center sm:justify-start">
                  <span className="text-xl font-bold text-emerald-600 font-sans">
                    {progressStats.totalActualHours}
                  </span>
                  <span className="text-xs text-slate-400"> / {progressStats.totalTargetHours} 時間</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">※設定モードに合わせ租税及び経営は除いて算出されています。</p>
              </div>

              {/* Progress circle CSS-based beautiful design */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" className="stroke-slate-100 fill-none" strokeWidth="8" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    className="stroke-emerald-550 fill-none transition-all duration-500 ease-out" 
                    strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - progressStats.totalPercentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-mono text-lg font-black text-slate-800 leading-none">{progressStats.totalPercentage}%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">COMPLETE</span>
                </div>
              </div>
            </div>

            {/* Subject Breakdown list meters */}
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block font-sans">科目別タスク消化ゲージ</span>
              
              {progressStats.activeSubjectStats.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-[11px] font-bold">
                  科目のアクションが登録されていません。上の【道】タブから科目の目標時間を設定してください。
                </div>
              ) : (
                <div className="space-y-3.5">
                  {progressStats.activeSubjectStats.map((subj) => (
                    <div key={subj.key} className="space-y-1 bg-slate-50/30 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="text-slate-800 font-black">{subj.label}</span>
                        <div className="font-mono text-[10px] flex gap-2">
                          <span className="text-slate-400">目標: {subj.targetHours}h</span>
                          <span className="text-indigo-600">実績: {subj.actualHours}h</span>
                          <span className="text-emerald-600 font-semibold">{subj.percentage}%</span>
                        </div>
                      </div>

                      {/* Custom percentage bar */}
                      <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-650 rounded-full transition-all duration-300"
                          style={{ width: `${subj.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Failure statistics & Resolution action plans (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Fail-patterns statistical report mapped from reflections */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500 fill-rose-100" />
                <h3 className="font-sans font-bold text-slate-900 text-sm">
                  Q3: 答練反省連動「心理・物理失点傾向」
                </h3>
              </div>
              <p className="text-[11px] text-slate-450 leading-relaxed">
                <span className="font-extrabold text-slate-750">【答練・模試の反省シート】</span>に入力された「やらかしミス」や徹底分析を裏側で自動常時スキャンし、あなたの苦手パターンと原因をAI的に分類集計しています。
              </p>

              {failPatternAnalysis.totalLossCount === 0 ? (
                <div className="text-center py-7 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-bold select-none bg-slate-50/40">
                  現在、反省シートに登録されたレポートがありません。反省シート上で「やらかし項目」を選択していくと、ここに統計データが出現します。
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-2 gap-3 pb-2 text-center">
                    <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100/40">
                      <span className="text-[8px] font-mono tracking-widest text-slate-400 font-extrabold block">WORST FREQUENCY</span>
                      <span className="text-xs font-black text-rose-700">やらかし総検出数</span>
                      <p className="font-sans text-xl font-black text-rose-600 mt-1">{failPatternAnalysis.totalLossCount} <span className="text-[10px] font-extrabold">回</span></p>
                    </div>

                    <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/40">
                      <span className="text-[8px] font-mono tracking-widest text-slate-400 font-extrabold block">ATTENTION SCORE</span>
                      <span className="text-xs font-black text-amber-700">傾向判定</span>
                      <p className="text-xs font-extrabold text-amber-600 mt-2.5 leading-none">
                        {failPatternAnalysis.carelessLoss >= failPatternAnalysis.knowledgeLoss ? '注意散漫(ケアレス)' : 'インプット不足'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Knowledge */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-705">
                        <span>知識不足（基本インプット不足）</span>
                        <span>{failPatternAnalysis.knowledgeLoss} 件</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-550 rounded-full" 
                          style={{ width: `${failPatternAnalysis.totalLossCount > 0 ? (failPatternAnalysis.knowledgeLoss / failPatternAnalysis.totalLossCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Retention and Output */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-705">
                        <span>定着不足（計算量・演習アウトプットの不足）</span>
                        <span>{failPatternAnalysis.retentionLoss} 件</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-550 rounded-full" 
                          style={{ width: `${failPatternAnalysis.totalLossCount > 0 ? (failPatternAnalysis.retentionLoss / failPatternAnalysis.totalLossCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Careless */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-705">
                        <span>ケアレスミス（不注意、おっちょこちょい）</span>
                        <span>{failPatternAnalysis.carelessLoss} 件</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-550 rounded-full" 
                          style={{ width: `${failPatternAnalysis.totalLossCount > 0 ? (failPatternAnalysis.carelessLoss / failPatternAnalysis.totalLossCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Time issues */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-705">
                        <span>時間配分ミス（損切り・判断スピードの遅れ）</span>
                        <span>{failPatternAnalysis.timeLoss} 件</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-550 rounded-full" 
                          style={{ width: `${failPatternAnalysis.totalLossCount > 0 ? (failPatternAnalysis.timeLoss / failPatternAnalysis.totalLossCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Q2: Gap Analysis & Resolution and decisive Habits checklist input */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                <h3 className="font-sans font-bold text-slate-900 text-sm">
                  Q2: PDCA：計画ギャップ真因分析
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                計画が未達だった場合、その本当の邪魔者の要因（真因タグ）をチェックし、次期から確実に「やめること」「始める習慣」を1行で決意します。
              </p>

              {/* Tag choice buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['睡眠不足', 'スマホの誘惑', '計画の過密さ', 'モチベーション低下', '教材難易度の誤算', '体調不良'].map((tag) => {
                  const active = selectedGapTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleGapTag(tag)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                        active
                          ? 'bg-rose-50/50 border-rose-200 text-rose-700 shadow-inner ring-1 ring-rose-200/20'
                          : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Resolution Form input text area */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    次から「やめる物理的行動」＆「新しく自動化する習慣」
                  </label>
                  <textarea
                    value={gapResolution}
                    onChange={(e) => setGapResolution(e.target.value)}
                    rows={3}
                    className="w-full text-[11px] font-bold rounded-2xl bg-slate-50/40 border border-slate-200 p-3 leading-relaxed focus:bg-white focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-600/20"
                    placeholder="例: スマホをカバンの奥に封印し、朝8時のタイマー開始を義務付ける。寝る2時間前は電子端末の光を一切浴びない。"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveResolution}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer active:scale-95"
                >
                  <Save className="w-3.5 h-3.5 shrink-0" />
                  ギャップ改善の決意を保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
