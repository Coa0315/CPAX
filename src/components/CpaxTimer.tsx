/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Award, Sparkles, Smile, HelpCircle, Frown, Plus, Minus, Info, Meh } from 'lucide-react';
import { CpaxTopic, CpaxSchedule } from '../types';

interface CpaxTimerProps {
  topics: CpaxTopic[];
  schedules: CpaxSchedule[];
  currentMode: 'short' | 'essay';
  selectedTopicId: string | null;
  onClearSelectedTopic: () => void;
  onAddHistory: (topicId: string, duration: number, evaluation: 'good' | 'average' | 'poor', note: string, type?: 'timer' | 'manual') => void;
  onViewSelect: (view: string) => void;
}

export const CpaxTimer: React.FC<CpaxTimerProps> = ({
  topics,
  schedules,
  currentMode,
  selectedTopicId,
  onClearSelectedTopic,
  onAddHistory,
  onViewSelect
}) => {
  const todayDateStr = new Date().toISOString().split('T')[0];

  // 1. Core target Topic Detection logic
  // First, check if there's an active selectedTopicId forwarded by other components
  // Otherwise, fallback to the current day's first incomplete study plan that links to a topic
  const defaultTopicId = useMemo(() => {
    if (selectedTopicId) return selectedTopicId;

    const todaysIncompleteStudyTask = schedules.find(
      s => s.date === todayDateStr && s.category === 'study' && !s.completed && s.topicId
    );
    if (todaysIncompleteStudyTask && todaysIncompleteStudyTask.topicId) {
      return todaysIncompleteStudyTask.topicId;
    }

    // Secondary fallback: first topic that matches currentMode restriction
    const acceptableTopics = topics.filter(t => {
      if (currentMode === 'short') {
        return !t.isEssayOnly && t.subject !== '租税法' && t.subject !== '経営学';
      }
      return true;
    });
    return acceptableTopics[0]?.id || '';
  }, [selectedTopicId, schedules, todayDateStr, topics, currentMode]);

  const [activeTopicId, setActiveTopicId] = useState<string>(defaultTopicId);

  // Sync when defaultTopicId changes
  useEffect(() => {
    setActiveTopicId(defaultTopicId);
  }, [defaultTopicId]);

  const currentTopic = useMemo(() => {
    return topics.find(t => t.id === activeTopicId);
  }, [topics, activeTopicId]);

  // 2. Goal Target minutes calculation
  // Find matching targetMinutes from today's plan, fallback to master database estimatedMinutes
  const prefilledTargetMinutes = useMemo(() => {
    const matchingSchedule = schedules.find(
      s => s.date === todayDateStr && s.category === 'study' && s.topicId === activeTopicId
    );
    if (matchingSchedule && matchingSchedule.targetMinutes) {
      return matchingSchedule.targetMinutes;
    }
    return currentTopic?.estimatedMinutes || 45;
  }, [schedules, todayDateStr, activeTopicId, currentTopic]);

  const [targetMinutes, setTargetMinutes] = useState<number>(prefilledTargetMinutes);

  useEffect(() => {
    setTargetMinutes(prefilledTargetMinutes);
  }, [prefilledTargetMinutes]);

  // Timer run tracking states
  const [isRunning, setIsRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showTimerHelp, setShowTimerHelp] = useState(false);

  // Background iOS / Sleep freeze proof architecture using high-precision UTC offsets
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);

  // Completion self-reflection states
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [evaluation, setEvaluation] = useState<'good' | 'average' | 'poor'>('good');
  const [notes, setNotes] = useState('');

  // Start precision stopwatch using Date.now()
  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    startTimeRef.current = Date.now();
    
    timerIntervalRef.current = setInterval(() => {
      if (startTimeRef.current !== null) {
        const delta = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setSecondsElapsed(accumulatedTimeRef.current + delta);
      }
    }, 100);
  };

  // Pause stopwatch safely freezing current elapsed balance
  const pauseTimer = () => {
    if (!isRunning) return;
    setIsRunning(false);
    if (startTimeRef.current !== null) {
      accumulatedTimeRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
    }
    setSecondsElapsed(accumulatedTimeRef.current);
    startTimeRef.current = null;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  // Reset all timing metrics
  const resetTimer = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = null;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Format stopwatch digits
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)} : ${pad(mins)} : ${pad(secs)}`;
  };

  const handleFinishStudy = () => {
    let totalSecs = secondsElapsed;
    if (isRunning && startTimeRef.current !== null) {
      totalSecs = accumulatedTimeRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);
    }
    // Set actual measured count
    setSecondsElapsed(totalSecs);
    pauseTimer();
    setShowCompletionForm(true);
  };

  // Submit and inject to cpax_history, triggers automatic react state update & dashboard refresh
  const submitStudyRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert to completed minutes, rounding up to nearest whole minute
    const minutesStudied = Math.max(1, Math.round(secondsElapsed / 60));

    // Send to central data layer
    onAddHistory(activeTopicId, minutesStudied, evaluation, notes, 'timer');
    
    // Reset timer
    resetTimer();
    setNotes('');
    setShowCompletionForm(false);
    onClearSelectedTopic();

    // Route cleanly back to Dashboard home cockpit
    onViewSelect('dashboard');
  };

  const currentMinutesCount = Math.round(secondsElapsed / 60);
  const targetPercentage = Math.min(100, Math.floor((currentMinutesCount / Math.max(1, targetMinutes)) * 100));

  // Time difference relative to set goals (± delta)
  const timeDifferenceDiff = currentMinutesCount - targetMinutes;

  const timerHrs = Math.floor(secondsElapsed / 3600);
  const timerMins = Math.floor((secondsElapsed % 3600) / 60);
  const timerSecs = secondsElapsed % 60;
  
  const padStr = (n: number) => n.toString().padStart(2, '0');
  const hrsStr = padStr(timerHrs);
  const minsStr = padStr(timerMins);
  const secsStr = padStr(timerSecs);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="cpax-interactive-timer">
      <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-violet-950 text-white p-5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-900/50 rounded-xl border border-violet-700/30">
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-sans font-black text-sm sm:text-base tracking-tight uppercase">論点連動デジタルタイマー</h2>
                <button
                  type="button"
                  onClick={() => setShowTimerHelp(!showTimerHelp)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-violet-200 cursor-pointer transition-all border border-white/5 active-scale flex items-center justify-center"
                  title="計測仕様について"
                >
                  <Info className="w-3.5 h-3.5 text-violet-300" />
                </button>
              </div>
              {showTimerHelp ? (
                <p className="text-[10px] text-slate-300 leading-relaxed mt-1 animate-scale-in max-w-xl bg-slate-950/40 p-2 rounded-lg border border-violet-500/20">
                  バックグラウンド計測・実時刻オフセット差分検知（Date.now()）を搭載。iPadが省電力スリープや画面ロックに入っても、内部クロックと同期してズレなく正確に学習時間を測定し、論点に紐付けて履歴(cpax_history)へ格納します。
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1 font-bold">iPadスリープ中も時間を狂わせず1秒単位で正確に時間測定</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6 text-left">
        {/* Selection zone for topic */}
        <div>
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
            計測対象の論点
          </label>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-8">
              <select
                value={activeTopicId}
                onChange={(e) => setActiveTopicId(e.target.value)}
                disabled={isRunning || secondsElapsed > 0}
                className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:border-violet-500 focus:bg-white px-4 py-3.5 text-xs font-bold text-slate-700 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none transition-all mr-2 min-h-[44px]"
              >
                {topics
                  .filter(t => {
                    if (currentMode === 'short') {
                      return !t.isEssayOnly && t.subject !== '租税法' && t.subject !== '経営学';
                    }
                    return true;
                  })
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.subject}] {t.name} (基準目安: {t.estimatedMinutes}分)
                    </option>
                  ))}
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              {selectedTopicId && !(isRunning || secondsElapsed > 0) && (
                <button
                  onClick={onClearSelectedTopic}
                  className="w-full text-center text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors cursor-pointer bg-white px-4 py-3 rounded-2xl border border-violet-100 shadow-sm min-h-[44px]"
                >
                  本日予定の固定を解除
                </button>
              )}
            </div>
          </div>
          
          {/* Daily study planner schedule matching message to guide the user */}
          {schedules.some(s => s.date === todayDateStr && s.category === 'study' && s.topicId === activeTopicId) ? (
            <span className="text-[10px] text-violet-600 font-bold block mt-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 今日の学習計画（TODO）への論点マッチに成功しました！
            </span>
          ) : (
            <span className="text-[9px] text-slate-400 font-bold block mt-2">
              ※ 今日のToDo計画に無い論点も、マスターリストから手動で自由に切り替えて計測可能です。
            </span>
          )}
        </div>

        {/* Goal Indicator adjust panel */}
        <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left space-y-0.5">
            <span className="text-[8px] font-extrabold tracking-widest text-slate-400 block uppercase font-sans">GOAL INTERVAL</span>
            <h4 className="text-xs font-black text-slate-800">問題目安（目標時間）の設定</h4>
            <p className="text-[10px] text-slate-400 font-semibold">当日のカレンダー目標、または論点仕様から自動反映されます</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setTargetMinutes(prev => Math.max(5, prev - 5))}
              disabled={isRunning || secondsElapsed > 0}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center font-bold"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center min-w-[80px]">
              <span className="font-sans text-xl font-bold text-slate-900 tabular-nums">{targetMinutes}</span>
              <span className="text-xs text-slate-400 font-extrabold ml-1">分</span>
            </div>
            <button
              onClick={() => setTargetMinutes(prev => Math.min(300, prev + 5))}
              disabled={isRunning || secondsElapsed > 0}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big digit stop watch display optimized for iPad study desks */}
        <div className="flex flex-col items-center justify-center py-6 space-y-5">
          <div className="relative flex items-center justify-center w-60 h-60 rounded-full border-[6px] border-slate-50 bg-slate-50/20 shadow-inner">
            {/* Elegant Circular progress visual tracker bar */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 240 240">
              <circle
                cx="120"
                cy="120"
                r="110"
                className="stroke-slate-100 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="120"
                cy="120"
                r="110"
                className="stroke-violet-600 fill-none transition-all duration-300"
                strokeWidth="6"
                strokeDasharray="691.15"
                strokeDashoffset={691.15 - (691.15 * targetPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>

            <div className="text-center z-10 flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-sans font-bold tracking-wide text-slate-850 tabular-nums">
                {hrsStr}:{minsStr}:{secsStr}
              </span>
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-violet-600 animate-pulse' : 'bg-slate-300'}`} />
                <span className={`text-[9px] font-bold tracking-widest ${isRunning ? 'text-violet-600' : 'text-slate-400'}`}>
                  {isRunning ? 'RUNNING' : 'PAUSED'}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm bg-slate-50/50 border border-slate-100 p-4 rounded-2xl shadow-sm text-center space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
              <span>目標: {targetMinutes}分</span>
              <span>実績経過: {currentMinutesCount}分 ({targetPercentage}%)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-300"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>
            {targetPercentage >= 100 && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1.5 mt-1 font-sans">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-bounce" /> 目標時間をクリア！回転が非常に順調です。
              </span>
            )}
          </div>
        </div>

        {/* Action Triggers with iPad 44px targets */}
        {!showCompletionForm ? (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={resetTimer}
              disabled={secondsElapsed === 0}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all cursor-pointer text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[50px] min-h-[50px] flex items-center justify-center"
              title="タイマーリセット"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {isRunning ? (
              <button
                onClick={pauseTimer}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-md cursor-pointer flex items-center gap-2 text-sm min-h-[50px]"
              >
                <Pause className="w-5 h-5 fill-current text-white/50" />
                計測を一時中断
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="px-8 py-3 bg-violet-950 hover:bg-violet-900 text-white font-bold rounded-2xl transition-all shadow-md cursor-pointer flex items-center gap-2 text-sm min-h-[50px]"
              >
                <Play className="w-5 h-5 fill-current text-violet-400" />
                集中を開始
              </button>
            )}

            <button
              onClick={handleFinishStudy}
              disabled={secondsElapsed < 10} // 10s minimum for debugging stability
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm min-h-[50px]"
            >
              <CheckCircle className="w-4.5 h-4.5 text-emerald-100" />
              セーブ終了
            </button>
          </div>
        ) : (
          /* Segment to enter reflection details about the finished block */
          <form onSubmit={submitStudyRecord} className="p-5 rounded-3xl border border-emerald-100 bg-emerald-50/30 space-y-4">
            <h3 className="font-sans font-black text-slate-900 text-sm flex items-center gap-2 text-left">
              <Award className="w-5 h-5 text-emerald-600" />
              集中勉強お疲れさまでした！反省と実績の登録
            </h3>

            {/* Target vs Actual Head-to-Head Comparison Output */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-2 gap-4 text-center">
              <div className="border-r border-slate-100">
                <span className="text-[10px] text-slate-400 font-extrabold block">GOAL TARGET</span>
                <p className="font-mono text-xl font-black text-slate-800">{targetMinutes}分</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold block">ACTUAL MEASURED</span>
                <p className="font-mono text-xl font-black text-indigo-600">{currentMinutesCount}分</p>
                <span className={`text-[9px] font-bold block mt-1 ${timeDifferenceDiff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {timeDifferenceDiff === 0 && '予定ピッタリ！'}
                  {timeDifferenceDiff > 0 && `(想定目標より＋${timeDifferenceDiff}分 超過)`}
                  {timeDifferenceDiff < 0 && `(想定目標より ${Math.abs(timeDifferenceDiff)}分 スピーディに突破！)`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">
                  自己評価による合格習得マーク (3段階)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['good', 'average', 'poor'] as const).map(lev => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setEvaluation(lev)}
                      className={`py-3 text-xs font-bold rounded-xl transition-all border cursor-pointer min-h-[44px] flex items-center justify-center gap-1 ${
                        evaluation === lev
                          ? lev === 'good'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                            : lev === 'average'
                            ? 'bg-amber-600 text-white border-amber-600 shadow'
                            : 'bg-rose-600 text-white border-rose-600 shadow'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lev === 'good' && <Smile className="w-4 h-4 shrink-0" />}
                      {lev === 'average' && <Meh className="w-4 h-4 shrink-0" />}
                      {lev === 'poor' && <Frown className="w-4 h-4 shrink-0" />}
                      <span>{lev === 'good' ? '◯ 良好' : lev === 'average' ? '△ 微妙' : '✕ やばい'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  引っ掛けのやらかしミス等の整理メモ (省略不可)
                </label>
                <textarea
                  placeholder="例：資本連結の株式相殺仕訳において非支配株主への按分計算で単純計算ミス。ケアレスを要マーク。"
                  value={notes}
                  required
                  rows={2}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white p-3 focus:outline-slate-900 leading-normal"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2.5 border-t border-emerald-100">
              <button
                type="button"
                onClick={() => setShowCompletionForm(false)}
                className="px-4 py-2 hover:bg-white text-slate-500 font-semibold text-xs rounded-xl transition-all min-h-[44px]"
              >
                タイマー計測に戻る
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow min-h-[44px] flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                目次に記録して終了
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
