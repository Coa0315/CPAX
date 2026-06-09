/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { BookOpen, Calendar, Clock, ClipboardCheck, Sparkles, AlertCircle, Compass, Smile, HelpCircle, Frown, CheckSquare, ShieldAlert, Award, Database, Meh, Info } from 'lucide-react';
import { CpaxTopic, CpaxHistoryItem, CpaxSchedule, CpaxExamReport, CpaxFramework, CpaxStudyMode, CpaxCondition } from '../types';
import { CpaxLogo } from './CpaxLogo';

interface CpaxDashboardProps {
  currentMode: CpaxStudyMode;
  onModeToggle: (mode: CpaxStudyMode) => void;
  history: CpaxHistoryItem[];
  schedules: CpaxSchedule[];
  reports: CpaxExamReport[];
  framework: CpaxFramework;
  onViewSelect: (view: string) => void;
  onSetCondition: (condition: CpaxCondition) => void;
  currentCondition: CpaxCondition;
  targetDateStr?: string;
  targetTitle?: string;
}

export const CpaxDashboard: React.FC<CpaxDashboardProps> = ({
  currentMode,
  onModeToggle,
  history,
  schedules,
  reports,
  framework,
  onViewSelect,
  onSetCondition,
  currentCondition,
  targetDateStr,
  targetTitle
}) => {
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Helper disclosure states for interactive explanations
  const [showHeroInfo, setShowHeroInfo] = useState(false);
  const [showConditionInfo, setShowConditionInfo] = useState(false);
  const [activeCardInfo, setActiveCardInfo] = useState<string | null>(null);

  // 1. Dynamic Metric: Today's study minutes
  const todayMinutes = useMemo(() => {
    return history
      .filter(h => h.date === todayDateStr)
      .reduce((sum, h) => sum + h.duration, 0);
  }, [history, todayDateStr]);

  const todayHours = (todayMinutes / 60).toFixed(1);

  // 2. Dynamic Metric: Total completed rotations in our history list
  const totalRotations = history.length;

  // 3. Dynamic Metric: Current days incomplete schedule tasks count
  const incompleteScheduleCount = useMemo(() => {
    return schedules.filter(s => s.date === todayDateStr && !s.completed).length;
  }, [schedules, todayDateStr]);

  // 4. Countdown to the Exam from integrated targetDateStr
  const daysRemaining = useMemo(() => {
    const dateToUse = targetDateStr || framework.milestones.targetExamDate || '2026-12-13';
    const target = new Date(dateToUse);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [targetDateStr, framework.milestones.targetExamDate]);

  // Available high-priority focused elements
  const incompletePriorities = useMemo(() => {
    return framework.priorityFocusList.filter(task => !task.completed).slice(0, 2);
  }, [framework.priorityFocusList]);

  // Average evaluation summary helper
  const evaluationCounts = useMemo(() => {
    const counts = { good: 0, average: 0, poor: 0 };
    history.forEach(h => {
      if (h.evaluation === 'good') counts.good++;
      else if (h.evaluation === 'average') counts.average++;
      else if (h.evaluation === 'poor') counts.poor++;
    });
    return counts;
  }, [history]);

  return (
    <div className="space-y-4 text-left" id="cpax-dashboard-panel">
      {/* 1. Header Hero Panel with Exam Countdown & Study Mode selection */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-4 sm:p-5 rounded-2xl text-white shadow-lg border border-indigo-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        <div className="space-y-1.5 text-left relative z-10 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-black text-2xl sm:text-3xl tracking-tight leading-none text-white">
              CPAX
            </h1>
            <button
              onClick={() => setShowHeroInfo(!showHeroInfo)}
              className="p-1 px-2.5 rounded-full bg-white/10 hover:bg-white/20 text-indigo-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-white/10 active-scale"
              title="システム概要"
            >
              <Info className="w-3.5 h-3.5 text-indigo-300" />
              <span>CPAXとは?</span>
            </button>
          </div>
          {showHeroInfo ? (
            <div className="animate-scale-in bg-indigo-950/80 border border-indigo-500/30 text-[11px] text-slate-200 p-3 rounded-xl max-w-xl leading-relaxed shadow-md">
              ようこそ、合格への絶対軸へ。すべての学習データ、タイマー記録、そして答練でのやらかし反省レポートが、一本の論点目次串（cpaxTopicId）でスマートに連動する、受験生専用の意志決定型コンソールです。
            </div>
          ) : (
            <p className="text-[11px] text-slate-300 max-w-xl leading-relaxed">
              合格への絶対軸。すべてが論点目次串（cpaxTopicId）で裏側自動連携。
            </p>
          )}
        </div>

        {/* Setting Controller Toggle */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-1.5 min-w-[200px] text-left relative z-10 estimate-card">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">現在の作戦モード</span>
          <div className="grid grid-cols-2 bg-slate-950/80 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => onModeToggle('short')}
              className={`py-2 text-[11px] font-bold rounded-lg cursor-pointer transition-all active-scale ${
                currentMode === 'short'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              短答式対策
            </button>
            <button
              onClick={() => onModeToggle('essay')}
              className={`py-2 text-[11px] font-bold rounded-lg cursor-pointer transition-all active-scale ${
                currentMode === 'essay'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              論文式対策
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's Physical Wellbeing / Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Physical wellbeing selector */}
        <div className="md:col-span-5 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-sans">今日のコンディション</h3>
              <button
                type="button"
                onClick={() => setShowConditionInfo(!showConditionInfo)}
                className="p-1 rounded-full text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                title="コンディションについて"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            {showConditionInfo ? (
              <p className="text-[10px] text-amber-700 bg-amber-50/70 border border-amber-150 p-1.5 rounded-lg font-bold leading-normal animate-scale-in">
                その日の脳と体の好不調に応じて学習負荷、電卓・記述スピード、復習強度等のアジャスト判断を下す指標です。
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-semibold">電卓・記述スピード調整のトリガーに利用</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {(['excellent', 'normal', 'poor'] as const).map(cond => (
              <button
                key={cond}
                type="button"
                onClick={() => onSetCondition(cond)}
                className={`p-2 rounded-xl transition-all border flex flex-col items-center gap-1 cursor-pointer active-scale ${
                  currentCondition === cond
                    ? cond === 'excellent'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 scale-105 shadow-sm shadow-emerald-100'
                      : cond === 'normal'
                      ? 'bg-amber-50 border-amber-200 text-amber-800 scale-105 shadow-sm shadow-amber-100'
                      : 'bg-rose-50 border-rose-200 text-rose-800 scale-105 shadow-sm shadow-rose-100'
                    : 'bg-slate-50/50 border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
                title={cond === 'excellent' ? '絶好調' : cond === 'normal' ? '普通' : '疲労気味'}
              >
                {cond === 'excellent' && <Smile className="w-5 h-5 text-emerald-500" />}
                {cond === 'normal' && <Meh className="w-5 h-5 text-amber-500" />}
                {cond === 'poor' && <Frown className="w-5 h-5 text-rose-500" />}
                <span className="text-[9px] font-bold tracking-tight">
                  {cond === 'excellent' ? '絶好調' : cond === 'normal' ? '普通' : '低迷気味'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic primary dashboard counters */}
        <div className="md:col-span-7 grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-left relative overflow-hidden">
            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">TODAY学習</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="font-sans font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight">{todayHours}</span>
              <span className="text-[10px] font-bold text-slate-400">h</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 block mt-1 leading-none">手動 ✕ タイマー実績合計</span>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-left relative overflow-hidden">
            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">ROTATE CO-EFFICIENT</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="font-sans font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight">{totalRotations}</span>
              <span className="text-[10px] font-bold text-slate-400">回</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 block mt-1 leading-none">全講義論点 累計周回数</span>
          </div>

          {(() => {
            const isNearing = daysRemaining > 0 && daysRemaining <= 30;
            const isOver = daysRemaining < 0;
            const colorClass = isOver 
              ? 'from-slate-100/60 to-slate-50/40 text-slate-400 border-slate-200' 
              : isNearing
                ? 'from-rose-50/70 via-rose-50/10 to-white text-rose-600 border-rose-200 animate-pulse bg-rose-50/30'
                : 'from-indigo-50/40 to-white text-indigo-600 border-indigo-100/50';
            
            const textNumClass = isOver
              ? 'text-slate-400'
              : isNearing
                ? 'text-rose-600'
                : 'text-indigo-950';

            return (
              <div className={`border rounded-2xl p-4 shadow-sm text-left bg-gradient-to-br relative overflow-hidden transition-all duration-300 ${colorClass}`}>
                <span className={`block text-[8px] font-bold uppercase tracking-widest leading-none ${isNearing ? 'text-rose-700' : 'text-indigo-600'}`}>
                  DECISIVE COUNTDOWN
                </span>
                <div className="flex items-baseline gap-1 mt-1.5 leading-none">
                  <span className={`font-sans font-bold text-2xl sm:text-3xl tracking-tight ${textNumClass}`}>
                    {isOver ? 0 : daysRemaining}
                  </span>
                  <span className="text-[10px] font-bold opacity-80">日</span>
                </div>
                <span className={`text-[9px] font-bold block mt-1 leading-none font-sans truncate ${isNearing ? 'text-rose-500' : 'text-indigo-500'}`}>
                  {targetTitle || '本試験'}までの逆算
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 3. Action cards bento box grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Syllabus Master */}
        <div
          onClick={() => onViewSelect('content_tree')}
          className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 active-scale duration-300 relative overflow-hidden"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-slate-950 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0 shadow-sm">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-1 overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
                  目次マスター（科目論点）
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCardInfo(activeCardInfo === 'content_tree' ? null : 'content_tree');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                  title="説明を見る"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              {activeCardInfo === 'content_tree' && (
                <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10px] text-slate-600 font-medium leading-normal animate-scale-in">
                  科目別アコーディオンツリーを周回管理。現在の理解度ステータスを即座に集計。
                </div>
              )}
            </div>
          </div>
          <div className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg w-fit mt-3.5 font-mono">
            回転中: ◯({evaluationCounts.good}) / △({evaluationCounts.average}) / ✕({evaluationCounts.poor})
          </div>
        </div>

        {/* Card 2: Planner Calendar */}
        <div
          onClick={() => onViewSelect('calendar')}
          className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 active-scale duration-300 relative overflow-hidden"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-emerald-50">
              <Calendar className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="space-y-1 overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
                  学習計画とカレンダー
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCardInfo(activeCardInfo === 'calendar' ? null : 'calendar');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                  title="説明を見る"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              {activeCardInfo === 'calendar' && (
                <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10px] text-slate-600 font-medium leading-normal animate-scale-in">
                  非勉強予定を考慮した、現実的な可動時間を逆算。やらかしの自動召喚スケジュールも。
                </div>
              )}
            </div>
          </div>
          <div className={`text-[9px] font-bold px-2.5 py-1 rounded-lg w-fit mt-3.5 ${
            incompleteScheduleCount > 0 ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
          }`}>
            {incompleteScheduleCount > 0 ? `今日の未完了ToDo: ${incompleteScheduleCount}件` : '今日のToDo：完全達成済です'}
          </div>
        </div>

        {/* Card 3: Specific Stopwatch */}
        <div
          onClick={() => onViewSelect('timer')}
          className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 active-scale duration-300 relative overflow-hidden"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-indigo-100">
              <Clock className="w-5 h-5 text-indigo-100" />
            </div>
            <div className="space-y-1 overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
                  論点連動タイマー
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCardInfo(activeCardInfo === 'timer' ? null : 'timer');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                  title="説明を見る"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              {activeCardInfo === 'timer' && (
                <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10px] text-slate-600 font-medium leading-normal animate-scale-in">
                  目安時間の比較を伴う集中ストップウォッチ。終わった実績はツリーに流し込まれます。
                </div>
              )}
            </div>
          </div>
          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-lg w-fit mt-3.5 font-mono">
            目標目安との偏差を自動演算 →
          </div>
        </div>

        {/* Card 4: Reflection Sheets */}
        <div
          onClick={() => onViewSelect('reports')}
          className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 active-scale duration-300 relative overflow-hidden"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-rose-100">
              <ClipboardCheck className="w-5 h-5 text-rose-100" />
            </div>
            <div className="space-y-1 overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
                  答練反省・やらかしカルテ
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCardInfo(activeCardInfo === 'reports' ? null : 'reports');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                  title="説明を見る"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              {activeCardInfo === 'reports' && (
                <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10px] text-slate-600 font-medium leading-normal animate-scale-in">
                  失念パターンを脳内から自白し、風化をガード。3日後のToDoに強制召喚完了します。
                </div>
              )}
            </div>
          </div>
          <div className="text-[9px] font-bold text-rose-705 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg w-fit mt-3.5 font-mono">
            カルテ分析: {reports.length}件登録 / A4-PDF対応
          </div>
        </div>

        {/* Card 5: Core CPA methods (志・道・進) */}
        <div
          onClick={() => onViewSelect('framework')}
          className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 active-scale duration-300 relative overflow-hidden"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-slate-900/10">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1 overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
                  志・道・進フレームワーク
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCardInfo(activeCardInfo === 'framework' ? null : 'framework');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                  title="説明を見る"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              {activeCardInfo === 'framework' && (
                <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10px] text-slate-600 font-medium leading-normal animate-scale-in">
                  公認会計士受験期における、合格精神の絶対基準軸。本番を見据えた里程標（道）の設定。
                </div>
              )}
            </div>
          </div>
          <div className="text-[9px] font-bold text-emerald-850 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg w-fit mt-3.5">
            志（信念目標）＆里程標の登録
          </div>
        </div>

        {/* Card 6: Database settings & files Local backup (Phase 1) */}
        <div
          onClick={() => onViewSelect('backup')}
          className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 active-scale duration-300 relative overflow-hidden"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-amber-50">
              <Database className="w-5 h-5 text-amber-100" />
            </div>
            <div className="space-y-1 overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
                  セキュリティ ＆ バックアップ
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCardInfo(activeCardInfo === 'backup' ? null : 'backup');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                  title="説明を見る"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              {activeCardInfo === 'backup' && (
                <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10px] text-slate-600 font-medium leading-normal animate-scale-in">
                  iPad内へJSONを保存・復旧。外部DBに依存しない完全なるオフラインファースト堅牢性。
                </div>
              )}
            </div>
          </div>
          <div className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg w-fit mt-3.5">
            ローカル保存・データ復旧
          </div>
        </div>
      </div>

      {/* 4. Strategic "Shi" motivation card summary (The axis itself) */}
      {framework.soulMotivation && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left flex items-start gap-4.5">
          <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shrink-0">
            <Award className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[9px] font-extrabold text-rose-700 tracking-wider block mb-0.5">合格への本気の宣誓（志）</span>
            <h4 className="font-bold text-slate-800 text-xs">
              「{framework.soulMotivation}」
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mt-1.5">
              <span className="font-black text-rose-600">絶対の行動原則: </span>
              <span>{framework.absolutePromise || '未設定'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Incompleted High-Priority task alerts (進 - shin) */}
      {incompletePriorities.length > 0 && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-indigo-700" />
            <h4 className="text-xs font-bold text-indigo-950">
              【進】重点ピン留め：現在補強すべき核心論点
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incompletePriorities.map(task => (
              <div key={task.id} className="bg-white p-3.5 rounded-xl border border-indigo-100 flex items-center justify-between shadow-sm">
                <div className="overflow-hidden">
                  {task.topicId && (
                    <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded uppercase block w-max">
                      論点: {task.topicId}
                    </span>
                  )}
                  <p className="text-xs font-bold text-slate-800 truncate mt-1">{task.taskDescription}</p>
                </div>
                <button
                  onClick={() => onViewSelect('framework')}
                  className="text-[10px] font-bold text-indigo-600 hover:underline shrink-0"
                >
                  確認
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
