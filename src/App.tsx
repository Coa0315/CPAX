/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Home, BookOpen, Clock, Calendar, ClipboardCheck, Compass, Database, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import {
  CpaxStudyMode,
  CpaxCondition,
  CpaxTopic,
  CpaxHistoryItem,
  CpaxSchedule,
  CpaxExamReport,
  CpaxFramework,
  initializeCpaxData
} from './types';

// Functional components imports
import { CpaxDashboard } from './components/CpaxDashboard';
import { CpaxContentTree } from './components/CpaxContentTree';
import { CpaxTimer } from './components/CpaxTimer';
import { CpaxCalendar } from './components/CpaxCalendar';
import { CpaxExamReports } from './components/CpaxExamReports';
import { CpaxFrameworkComponent } from './components/CpaxFramework';
import { CpaxBackup } from './components/CpaxBackup';
import { CpaxCountdown } from './components/CpaxCountdown';
import { CpaxLogo } from './components/CpaxLogo';

export default function App() {
  // Navigation state: dashboard, content_tree, timer, calendar, reports, framework, backup
  const [currentView, setCurrentView] = useState<string>('dashboard');
  
  // App core DB states
  const [currentMode, setCurrentMode] = useState<CpaxStudyMode>('short');
  const [topics, setTopics] = useState<CpaxTopic[]>([]);
  const [history, setHistory] = useState<CpaxHistoryItem[]>([]);
  const [schedules, setSchedules] = useState<CpaxSchedule[]>([]);
  const [reports, setReports] = useState<CpaxExamReport[]>([]);
  const [framework, setFramework] = useState<CpaxFramework>({
    soulMotivation: '',
    absolutePromise: '',
    milestones: { targetExamDate: '2026-12-13', targetExamTitle: '2026年12月 短答式試験', targetDailyStudyHours: 8, milestone6Months: '', milestone3Months: '' },
    priorityFocusList: []
  });
  
  const [currentCondition, setCurrentCondition] = useState<CpaxCondition>('normal');
  const [selectedTimerTopicId, setSelectedTimerTopicId] = useState<string | null>(null);
  const [targetDateStr, setTargetDateStr] = useState<string>('2026-12-13');
  const [targetTitle, setTargetTitle] = useState<string>('公認会計士試験');

  // Initialize and load all storage contents
  const reloadLocalStorageData = () => {
    initializeCpaxData();

    try {
      const mode = JSON.parse(localStorage.getItem('cpax_study_mode') || '"short"') as CpaxStudyMode;
      const cachedTopics = JSON.parse(localStorage.getItem('cpax_master_contents') || '[]') as CpaxTopic[];
      const cachedHistory = JSON.parse(localStorage.getItem('cpax_history') || '[]') as CpaxHistoryItem[];
      const cachedSchedules = JSON.parse(localStorage.getItem('cpax_schedules') || '[]') as CpaxSchedule[];
      const cachedReports = JSON.parse(localStorage.getItem('cpax_exam_reports') || '[]') as CpaxExamReport[];
      const cachedFramework = JSON.parse(localStorage.getItem('cpax_framework') || 'null') as CpaxFramework | null;

      setCurrentMode(mode);
      setTopics(cachedTopics);
      setHistory(cachedHistory);
      setSchedules(cachedSchedules);
      setReports(cachedReports);
      if (cachedFramework) {
        setFramework(cachedFramework);
      }
      const cachedTargetDate = localStorage.getItem('cpax_target_date');
      const cachedTargetTitle = localStorage.getItem('cpax_target_title');
      if (cachedTargetDate) setTargetDateStr(JSON.parse(cachedTargetDate));
      if (cachedTargetTitle) setTargetTitle(JSON.parse(cachedTargetTitle));
    } catch (e) {
      console.error('Error reloading LocalStorage CPAX datasets:', e);
    }
  };

  useEffect(() => {
    reloadLocalStorageData();
  }, []);

  // Update Study mode (短答 vs 論文)
  const handleModeToggle = (mode: CpaxStudyMode) => {
    setCurrentMode(mode);
    localStorage.setItem('cpax_study_mode', JSON.stringify(mode));
  };

  // Add study history item (回転実績の蓄積)
  const handleAddHistory = (
    topicId: string,
    duration: number,
    evaluation: 'good' | 'average' | 'poor',
    note: string,
    type: 'timer' | 'manual' = 'manual'
  ) => {
    const freshItem: CpaxHistoryItem = {
      historyId: `hist-${Date.now()}`,
      topicId,
      date: new Date().toISOString().split('T')[0],
      duration,
      evaluation,
      type,
      note: note ? note.trim() : undefined
    };

    const nextHistory = [...history, freshItem];
    setHistory(nextHistory);
    localStorage.setItem('cpax_history', JSON.stringify(nextHistory));
  };

  // Delete history item
  const handleDeleteHistory = (historyId: string) => {
    const nextHistory = history.filter(h => h.historyId !== historyId);
    setHistory(nextHistory);
    localStorage.setItem('cpax_history', JSON.stringify(nextHistory));
  };

  // Add schedule TODO event
  const handleAddSchedule = (
    title: string,
    date: string,
    category: 'study' | 'private',
    topicId?: string,
    timeInput?: string,
    targetMinutes?: number,
    duration?: number
  ) => {
    const freshSchedule: CpaxSchedule = {
      scheduleId: `sched-${Date.now()}`,
      topicId,
      title,
      date,
      category,
      completed: false,
      timeInput,
      targetMinutes,
      duration
    };

    const nextSchedules = [...schedules, freshSchedule];
    setSchedules(nextSchedules);
    localStorage.setItem('cpax_schedules', JSON.stringify(nextSchedules));
  };

  // Toggle todo item
  const handleToggleSchedule = (scheduleId: string) => {
    let freshSavedHistoryItem: CpaxHistoryItem | null = null;
    let autoAddedToHistory = false;
    let shouldRemoveFromHistory = false;

    const nextSchedules = schedules.map(s => {
      if (s.scheduleId === scheduleId) {
        const nextCompleted = !s.completed;
        
        // 完了チェック時に勉強予定で論点IDが紐づいている場合、目次履歴(cpax_history)へ自動送信
        if (nextCompleted && s.category === 'study' && s.topicId) {
          const topicObj = topics.find(t => t.id === s.topicId);
          const minutes = s.targetMinutes || topicObj?.estimatedMinutes || 45;
          
          freshSavedHistoryItem = {
            historyId: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            topicId: s.topicId,
            date: s.date,
            duration: minutes,
            evaluation: 'good', // デフォルト自己評価 ◯ (good)
            type: 'manual',
            note: 'カレンダー行動表の完了チェックによる自動実績同期。',
            scheduleId: s.scheduleId // Link schedule ID
          };
          autoAddedToHistory = true;
        } else if (!nextCompleted && s.category === 'study' && s.topicId) {
          // If untoggled back, flag to clean up database
          shouldRemoveFromHistory = true;
        }

        return { ...s, completed: nextCompleted };
      }
      return s;
    });

    setSchedules(nextSchedules);
    localStorage.setItem('cpax_schedules', JSON.stringify(nextSchedules));

    if (autoAddedToHistory && freshSavedHistoryItem) {
      const nextHistory = [...history, freshSavedHistoryItem];
      setHistory(nextHistory);
      localStorage.setItem('cpax_history', JSON.stringify(nextHistory));
    } else if (shouldRemoveFromHistory) {
      const nextHistory = history.filter(h => h.scheduleId !== scheduleId);
      setHistory(nextHistory);
      localStorage.setItem('cpax_history', JSON.stringify(nextHistory));
    }
  };

  // Delete plan
  const handleDeleteSchedule = (scheduleId: string) => {
    const nextSchedules = schedules.filter(s => s.scheduleId !== scheduleId);
    setSchedules(nextSchedules);
    localStorage.setItem('cpax_schedules', JSON.stringify(nextSchedules));

    // Cleanup study validation logs tied to this deleted plan
    const nextHistory = history.filter(h => h.scheduleId !== scheduleId);
    setHistory(nextHistory);
    localStorage.setItem('cpax_history', JSON.stringify(nextHistory));
  };

  // Add reflection exam report (答練・模試のやらかしシート、3日後自動強制カレンダー召喚 & 目次履歴流し込み)
  const handleAddReport = (
    newReport: Omit<CpaxExamReport, 'reportId' | 'scheduledReviewIds'> & {
      linkedTopicIds?: string[];
      examType?: 'short' | 'essay';
      deviationValue?: number;
    }
  ) => {
    const reportId = `rep-${Date.now()}`;
    const linkedTopicIds = newReport.linkedTopicIds || [];

    // Target reviews exactly three days in the future to solidify long-term memory recall
    const reviewDate = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    const reviewDateStr = reviewDate.toISOString().split('T')[0];

    const autoScheduleIds: string[] = [];
    const newSchedules: CpaxSchedule[] = [];

    // 1. Create a primary overarching reflex review task to check overall strategy shifts
    const generalScheduleId = `sched-auto-gen-${Date.now()}`;
    autoScheduleIds.push(generalScheduleId);
    newSchedules.push({
      scheduleId: generalScheduleId,
      title: `🔥【答練復習・やらかし見直し】${newReport.subject}／${newReport.title}`,
      date: reviewDateStr,
      category: 'study',
      completed: false,
      timeInput: '10:00',
      notes: `反省カルテアクション: ${newReport.actionPlan}`
    });

    // 2. Create topic-locked review slots dynamically for EACH tagged syllabus node [逆引き強制召喚!!]
    linkedTopicIds.forEach((topicId, idx) => {
      const topicObj = topics.find(t => t.id === topicId);
      if (topicObj) {
        const topicScheduleId = `sched-auto-top-${topicId}-${Date.now()}-${idx}`;
        autoScheduleIds.push(topicScheduleId);
        newSchedules.push({
          scheduleId: topicScheduleId,
          topicId,
          title: `🔥【弱点論点復習】[${topicObj.subject}] ${topicObj.name} (答練ハゲ補強)`,
          date: reviewDateStr,
          category: 'study',
          completed: false,
          timeInput: '11:00',
          targetMinutes: topicObj.estimatedMinutes || 45
        });
      }
    });

    // 3. Inject negative-conditioned review indicators ("poor" / ✕) directly into cpax_history [目次履歴への裏側自動送信]
    const historyInjections: CpaxHistoryItem[] = [];
    linkedTopicIds.forEach((topicId, idx) => {
      const topicObj = topics.find(t => t.id === topicId);
      if (topicObj) {
        historyInjections.push({
          historyId: `hist-auto-rep-${topicId}-${Date.now()}-${idx}`,
          topicId,
          date: new Date().toISOString().split('T')[0],
          duration: 30, // Default baseline time of 30 mins allocation for deep reflex
          evaluation: 'poor', // Flagged as poor (✕) to trigger red colors in content tree
          type: 'manual',
          note: `【答練カルテ自動連携】${newReport.title}。得点: ${newReport.score}/${newReport.maxScore} (偏差値: ${newReport.deviationValue || 50}, 判定: ${newReport.evaluation})。やらかし真因: ${newReport.analysis}`
        });
      }
    });

    // Save outputs
    const nextReports: CpaxExamReport[] = [
      ...reports,
      {
        ...newReport,
        reportId,
        scheduledReviewIds: autoScheduleIds
      }
    ];

    const nextSchedules = [...schedules, ...newSchedules];
    const nextHistory = [...history, ...historyInjections];

    setReports(nextReports);
    setSchedules(nextSchedules);
    setHistory(nextHistory);

    localStorage.setItem('cpax_exam_reports', JSON.stringify(nextReports));
    localStorage.setItem('cpax_schedules', JSON.stringify(nextSchedules));
    localStorage.setItem('cpax_history', JSON.stringify(nextHistory));
  };

  // Delete report
  const handleDeleteReport = (reportId: string) => {
    const foundReport = reports.find(r => r.reportId === reportId);
    let nextSchedules = [...schedules];
    
    // Also cleanup scheduled auto-reviews linked to this report to maintain integrity
    if (foundReport && foundReport.scheduledReviewIds) {
      nextSchedules = schedules.filter(s => !foundReport.scheduledReviewIds.includes(s.scheduleId));
    }

    const nextReports = reports.filter(r => r.reportId !== reportId);
    setReports(nextReports);
    setSchedules(nextSchedules);

    localStorage.setItem('cpax_exam_reports', JSON.stringify(nextReports));
    localStorage.setItem('cpax_schedules', JSON.stringify(nextSchedules));
  };

  // Update CPA frameworks (志・道・進)
  const handleUpdateFramework = (updated: CpaxFramework) => {
    setFramework(updated);
    localStorage.setItem('cpax_framework', JSON.stringify(updated));
  };

  // Update Syllabus Master Topics from Editor/Parsers (目次マスターの更新)
  const handleUpdateTopics = (newTopics: CpaxTopic[]) => {
    setTopics(newTopics);
    localStorage.setItem('cpax_master_contents', JSON.stringify(newTopics));
  };

  // Custom action to quickly bind topic to timer view and start
  const handleSelectTopicForTimer = (topicId: string) => {
    setSelectedTimerTopicId(topicId);
    setCurrentView('timer');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased select-none">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 text-white shrink-0 shadow-xl md:min-h-screen flex flex-col justify-between no-print border-r border-slate-900">
        <div className="p-5 space-y-6">
          {/* Logo Brand Zone */}
          <div className="flex items-center">
            <CpaxLogo variant="full" size={38} />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 text-left">
            <button
              id="nav-btn-dashboard"
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#274a78] text-white shadow-md shadow-slate-950/50 font-extrabold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              ダッシュボード
            </button>

            <button
              id="nav-btn-content_tree"
              onClick={() => setCurrentView('content_tree')}
              className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'content_tree'
                  ? 'bg-[#274a78] text-white shadow-md shadow-slate-950/50 font-extrabold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              目次管理
            </button>

            <button
              id="nav-btn-timer"
              onClick={() => setCurrentView('timer')}
              className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'timer'
                  ? 'bg-[#274a78] text-white shadow-md shadow-slate-950/50 font-extrabold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              勉強タイマー
            </button>

            <button
              id="nav-btn-calendar"
              onClick={() => setCurrentView('calendar')}
              className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'calendar'
                  ? 'bg-[#274a78] text-white shadow-md shadow-slate-950/50 font-extrabold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              学習計画とカレンダー
            </button>

            <button
              id="nav-btn-reports"
              onClick={() => setCurrentView('reports')}
              className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'reports'
                  ? 'bg-[#274a78] text-white shadow-md shadow-slate-950/50 font-extrabold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              答練分析カルテ
            </button>

            <button
              id="nav-btn-framework"
              onClick={() => setCurrentView('framework')}
              className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'framework'
                  ? 'bg-[#274a78] text-white shadow-md shadow-slate-950/50 font-extrabold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              メソッドフレーム
            </button>

            <button
              id="nav-btn-backup"
              onClick={() => setCurrentView('backup')}
              className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'backup'
                  ? 'bg-[#274a78] text-white shadow-md shadow-slate-950/50 font-extrabold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              設定
            </button>
          </nav>
        </div>

        {/* Footer info showing mode */}
        <div className="p-4 bg-slate-950 border-t border-slate-900 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-300">
              {currentMode === 'short' ? '短答式基準 動作中' : '論文式基準 動作中'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="grow p-4 sm:p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto w-full transition-all">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <span className="no-print">
              <CpaxCountdown onTargetUpdate={reloadLocalStorageData} />
            </span>
            <CpaxDashboard
              currentMode={currentMode}
              onModeToggle={handleModeToggle}
              history={history}
              schedules={schedules}
              reports={reports}
              framework={framework}
              onViewSelect={setCurrentView}
              currentCondition={currentCondition}
              onSetCondition={setCurrentCondition}
              targetDateStr={targetDateStr}
              targetTitle={targetTitle}
            />
          </div>
        )}

        {currentView === 'content_tree' && (
          <CpaxContentTree
            topics={topics}
            history={history}
            currentMode={currentMode}
            onAddHistory={handleAddHistory}
            onDeleteHistory={handleDeleteHistory}
            onSelectTopicForTimer={handleSelectTopicForTimer}
            onUpdateTopics={handleUpdateTopics}
          />
        )}

        {currentView === 'timer' && (
          <CpaxTimer
            topics={topics}
            schedules={schedules}
            currentMode={currentMode}
            selectedTopicId={selectedTimerTopicId}
            onClearSelectedTopic={() => setSelectedTimerTopicId(null)}
            onAddHistory={handleAddHistory}
            onViewSelect={setCurrentView}
          />
        )}

        {currentView === 'calendar' && (
          <CpaxCalendar
            topics={topics}
            schedules={schedules}
            currentMode={currentMode}
            onAddSchedule={handleAddSchedule}
            onToggleSchedule={handleToggleSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            targetDateStr={targetDateStr}
            targetTitle={targetTitle}
          />
        )}

        {currentView === 'reports' && (
          <CpaxExamReports
            reports={reports}
            topics={topics}
            currentMode={currentMode}
            onAddReport={handleAddReport}
            onDeleteReport={handleDeleteReport}
          />
        )}

        {currentView === 'framework' && (
          <CpaxFrameworkComponent
            currentMode={currentMode}
            onModeToggle={handleModeToggle}
            topics={topics}
            onTargetUpdate={reloadLocalStorageData}
          />
        )}

        {currentView === 'backup' && (
          <CpaxBackup
            onDataRefresh={reloadLocalStorageData}
          />
        )}
      </main>
    </div>
  );
}
