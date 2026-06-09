/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { BookOpen, Calendar, Clock, ClipboardCheck, Sparkles, AlertCircle, Compass, Smile, HelpCircle, Frown, CheckSquare, ShieldAlert, Award, Database } from 'lucide-react';
import { CpaxTopic, CpaxHistoryItem, CpaxSchedule, CpaxExamReport, CpaxFramework, CpaxStudyMode, CpaxCondition } from '../types';

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
    <div className="space-y-6 text-left" id="cpax-dashboard-panel">
      {/* 1. Header Hero Panel with Exam Countdown & Study Mode selection */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-indigo-950/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        <div className="space-y-2 text-left relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[9px] bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 font-extrabold px-3 py-0.5 rounded-full tracking-widest uppercase">
              COGNITIVE CONTROL COCKPIT
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold tracking-tight">iPad OS / Pro Touch Optimized</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Compass className="w-8 h-8 text-indigo-400 shrink-0" />
            <h1 className="font-sans font-black text-3xl sm:text-4xl tracking-tight leading-none text-white">
              CPAX
            </h1>
          </div>
          <p className="text-xs text-slate-300 font-medium max-w-xl leading-relaxed">
            ようこそ、合格への絶対軸へ。すべての学習データ、タイマー記録、そして答練でのやらかし反省レポートが、一本の論点目次串（cpaxTopicId）でスマートに連動する、受験生専用の意志決定型コンソールです。
          </p>
        </div>

        {/* Setting Controller Toggle */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 min-w-[220px] text-left relative z-10 estimate-card">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">現在の作戦モード</span>
          <div className="grid grid-cols-2 bg-slate-950/80 p-1 rounded-xl border border-white/5">
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Physical wellbeing selector */}
        <div className="md:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-sans">今日のコンディション</h3>
            <p className="text-[10px] text-slate-400 font-semibold">電卓・記述スピード調整のトリガーに利用</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {(['excellent', 'normal', 'poor'] as const).map(cond => (
              <button
                key={cond}
                type="button"
                onClick={() => onSetCondition(cond)}
                className={`p-2.5 rounded-xl transition-all border flex flex-col items-center gap-1 cursor-pointer active-scale ${
                  currentCondition === cond
                    ? cond === 'excellent'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 scale-105 shadow-sm shadow-emerald-100'
                      : cond === 'normal'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-800 scale-105 shadow-sm shadow-indigo-100'
                      : 'bg-rose-50 border-rose-200 text-rose-800 scale-105 shadow-sm shadow-rose-100'
                    : 'bg-slate-50/50 border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
                title={cond === 'excellent' ? '絶好調' : cond === 'normal' ? '普通' : '疲労気味'}
              >
                {cond === 'excellent' && <Smile className="w-5 h-5 text-emerald-500" />}
                {cond === 'normal' && <HelpCircle className="w-5 h-5 text-indigo-500" />}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Syllabus Master */}
        <button
          onClick={() => onViewSelect('content_tree')}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex items-start gap-4.5 cursor-pointer group hover:-translate-y-0.5 active-scale duration-300"
        >
          <div className="p-3 bg-slate-950 text-white rounded-2xl group-hover:scale-105 transition-transform shrink-0 shadow-sm">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="space-y-1.5 overflow-hidden">
            <h3 className="font-sans font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
              目次マスター（科目論点）
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              科目別アコーディオンツリーを周回管理。現在の理解度ステータスを即座に集計。
            </p>
            <div className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg inline-block mt-1 font-mono">
              回転中: ◯({evaluationCounts.good}) / △({evaluationCounts.average}) / ✕({evaluationCounts.poor})
            </div>
          </div>
        </button>

        {/* Card 2: Planner Calendar */}
        <button
          onClick={() => onViewSelect('calendar')}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex items-start gap-4.5 cursor-pointer group hover:-translate-y-0.5 active-scale duration-300"
        >
          <div className="p-3 bg-emerald-600 text-white rounded-2xl group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-emerald-50">
            <Calendar className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="space-y-1.5 overflow-hidden">
            <h3 className="font-sans font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
              学習計画と逆引きカレンダー
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              非勉強予定を考慮した、現実的な可動時間を逆算。やらかしの自動召喚スケジュールも。
            </p>
            <div className={`text-[9px] font-bold px-2.5 py-1 rounded-lg inline-block mt-1 ${
              incompleteScheduleCount > 0 ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
            }`}>
              {incompleteScheduleCount > 0 ? `今日の未完了ToDo: ${incompleteScheduleCount}件` : '今日のToDo：完全達成済です'}
            </div>
          </div>
        </button>

        {/* Card 3: Specific Stopwatch */}
        <button
          onClick={() => onViewSelect('timer')}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex items-start gap-4.5 cursor-pointer group hover:-translate-y-0.5 active-scale duration-300"
        >
          <div className="p-3 bg-indigo-600 text-white rounded-2xl group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-indigo-100">
            <Clock className="w-5 h-5 text-indigo-100" />
          </div>
          <div className="space-y-1.5 overflow-hidden">
            <h3 className="font-sans font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
              論点連動タイマー
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              目安時間の比較を伴う集中ストップウォッチ。終わった実績はツリーに流し込まれます。
            </p>
            <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-lg inline-block mt-1 font-mono">
              目標目安との偏差を自動演算 →
            </div>
          </div>
        </button>

        {/* Card 4: Reflection Sheets */}
        <button
          onClick={() => onViewSelect('reports')}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex items-start gap-4.5 cursor-pointer group hover:-translate-y-0.5 active-scale duration-300"
        >
          <div className="p-3 bg-rose-600 text-white rounded-2xl group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-rose-100">
            <ClipboardCheck className="w-5 h-5 text-rose-100" />
          </div>
          <div className="space-y-1.5 overflow-hidden">
            <h3 className="font-sans font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
              答練反省・やらかしカルテ
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              失念パターンを脳内から自白し、風化をガード。3日後のToDoに強制召喚完了します。
            </p>
            <div className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg inline-block mt-1">
              カルテ分析: {reports.length}件登録 / A4-PDF対応
            </div>
          </div>
        </button>

        {/* Card 5: Core CPA methods (志・道・進) */}
        <button
          onClick={() => onViewSelect('framework')}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex items-start gap-4.5 cursor-pointer group hover:-translate-y-0.5 active-scale duration-300"
        >
          <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-slate-900/10">
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-1.5 overflow-hidden">
            <h3 className="font-sans font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
              志・道・進フレームワーク
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              公認会計士受験期における、合格精神の絶対基準軸。本番を見据えた里程標（道）の設定。
            </p>
            <div className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg inline-block mt-1">
              志（信念目標）＆里程標の登録
            </div>
          </div>
        </button>

        {/* Card 6: Database settings & files Local backup (Phase 1) */}
        <button
          onClick={() => onViewSelect('backup')}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all text-left flex items-start gap-4.5 cursor-pointer group hover:-translate-y-0.5 active-scale duration-300"
        >
          <div className="p-3 bg-amber-500 text-white rounded-2xl group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-amber-50">
            <Database className="w-5 h-5 text-amber-100" />
          </div>
          <div className="space-y-1.5 overflow-hidden">
            <h3 className="font-sans font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
              セキュリティ ＆ バックアップ
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              iPad内へJSONを保存・復旧。外部DBに依存しない完全なるオフラインファースト堅牢性。
            </p>
            <div className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg inline-block mt-1">
              ローカル保存・テストデータ注入対応
            </div>
          </div>
        </button>
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
