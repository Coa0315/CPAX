/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calendar as IconCalendar, ChevronLeft, ChevronRight, CheckSquare, Square, Plus, Trash, AlertTriangle, Clock, ShieldCheck, Heart } from 'lucide-react';
import { CpaxTopic, CpaxSchedule } from '../types';

interface CpaxCalendarProps {
  topics: CpaxTopic[];
  schedules: CpaxSchedule[];
  currentMode: 'short' | 'essay';
  onAddSchedule: (
    title: string,
    date: string,
    category: 'study' | 'private',
    topicId?: string,
    timeInput?: string,
    targetMinutes?: number,
    duration?: number
  ) => void;
  onToggleSchedule: (scheduleId: string) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  targetDateStr?: string;
  targetTitle?: string;
}

export const CpaxCalendar: React.FC<CpaxCalendarProps> = ({
  topics,
  schedules,
  currentMode,
  onAddSchedule,
  onToggleSchedule,
  onDeleteSchedule,
  targetDateStr,
  targetTitle
}) => {
  // Calendar Navigation date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form states to create plans
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'study' | 'private'>('study');
  const [associatedTopicId, setAssociatedTopicId] = useState<string>('');
  const [timeInput, setTimeInput] = useState('09:00');
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [minutesInput, setMinutesInput] = useState<number>(60); // 用事の目安時間(分), 勉強目標(分)

  // CPAX マスター連携検索用の状態
  const [searchSubject, setSearchSubject] = useState<string>('all');
  const [searchTextbook, setSearchTextbook] = useState<string>('all');
  const [searchChapter, setSearchChapter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 検索・フィルタリング用の選択可能リスト
  const availableSubjectsForSearch = useMemo(() => {
    const list = Array.from(new Set(topics.map(t => t.subject)));
    if (currentMode === 'short') {
      return list.filter(s => s !== '租税法' && s !== '経営学');
    }
    return list;
  }, [topics, currentMode]);

  const availableTextbooksForSearch = useMemo(() => {
    const filtered = topics.filter(t => {
      if (currentMode === 'short') {
        if (t.isEssayOnly || t.subject === '租税法' || t.subject === '経営学') return false;
      }
      if (searchSubject !== 'all' && t.subject !== searchSubject) return false;
      return true;
    });
    return Array.from(new Set(filtered.map(t => t.textbook || 'テキスト1'))).filter(Boolean);
  }, [topics, searchSubject, currentMode]);

  const availableChaptersForSearch = useMemo(() => {
    const filtered = topics.filter(t => {
      if (currentMode === 'short') {
        if (t.isEssayOnly || t.subject === '租税法' || t.subject === '経営学') return false;
      }
      if (searchSubject !== 'all' && t.subject !== searchSubject) return false;
      if (searchTextbook !== 'all' && (t.textbook || 'テキスト1') !== searchTextbook) return false;
      return true;
    });
    return Array.from(new Set(filtered.map(t => t.category))).filter(Boolean);
  }, [topics, searchSubject, searchTextbook, currentMode]);

  // 絞り込まれた論点のリスト
  const filteredTopicsForSelect = useMemo(() => {
    return topics.filter(t => {
      // 短答マスク
      if (currentMode === 'short') {
        if (t.isEssayOnly || t.subject === '租税法' || t.subject === '経営学') return false;
      }
      // 科目一致
      if (searchSubject !== 'all' && t.subject !== searchSubject) return false;
      // テキスト一致
      if (searchTextbook !== 'all' && (t.textbook || 'テキスト1') !== searchTextbook) return false;
      // 章（カテゴリ）一致
      if (searchChapter !== 'all' && t.category !== searchChapter) return false;
      // キーワード一致
      if (searchKeyword.trim() !== '') {
        const word = searchKeyword.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(word);
        const matchesCategory = t.category.toLowerCase().includes(word);
        return matchesName || matchesCategory;
      }
      return true;
    });
  }, [topics, searchSubject, searchTextbook, searchChapter, searchKeyword, currentMode]);

  // -------------------------------------------------------------
  // Load CPA Method Framework V2 priority Tasks dynamically
  // -------------------------------------------------------------
  const frameworkPriorityTasks = useMemo(() => {
    try {
      const stored = localStorage.getItem('cpax_framework_v2');
      if (!stored) return [];
      const frameworkObj = JSON.parse(stored);
      if (!frameworkObj || !frameworkObj.part2_michi || !frameworkObj.part2_michi.subjects) {
        return [];
      }

      const list: { id: string; subjectName: string; text: string; hours: number }[] = [];
      const subjects = frameworkObj.part2_michi.subjects;

      const mapping: Record<string, string> = {
        financial_calc: '財務計算',
        financial_theory: '財務理論',
        management_accounting: '管理会計',
        corporate_law: '企業法',
        audit_theory: '監査論',
        tax_law: '租税法',
        business_concept: '経営学'
      };

      Object.entries(subjects).forEach(([key, subjObj]: [string, any]) => {
        // 短答式モードなら、租税・経営をマスク
        if (currentMode === 'short' && (key === 'tax_law' || key === 'business_concept')) {
          return;
        }
        if (subjObj && subjObj.tasks) {
          subjObj.tasks.forEach((t: any) => {
            if (t.priority === 'high') {
              list.push({
                id: t.id || `f-pt-${Math.random()}`,
                subjectName: mapping[key] || key,
                text: t.text,
                hours: Number(t.hours) || 2
              });
            }
          });
        }
      });
      return list;
    } catch (e) {
      console.error('Error reading framework priority tasks for calendar:', e);
      return [];
    }
  }, [currentMode, schedules]);

  const handleApplyPriorityTask = (taskText: string, subjectName: string, targetHours: number) => {
    setTitle(`🔥【最優先】[${subjectName}] ${taskText}`);
    setCategory('study');
    setMinutesInput(targetHours * 60); // 時間を分に変換して自動インジェクション
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1...
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Fill previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i;
      const prevMonthDate = new Date(year, month - 1, dayNum);
      days.push({
        dateStr: prevMonthDate.toISOString().split('T')[0],
        dayNum,
        isCurrentMonth: false
      });
    }

    // Fill current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const currentMonthDate = new Date(year, month, i);
      days.push({
        dateStr: currentMonthDate.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: true
      });
    }

    // Fill next month leading days
    const totalFilled = days.length;
    const remainingDays = 42 - totalFilled; // standard 6 rows multiplier
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      days.push({
        dateStr: nextMonthDate.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: false
      });
    }

    return days;
  }, [year, month]);

  // ヘルパー: タイトルを「[科目] テキスト・講義 ➜ 論点名」に統一する
  const getDisplayTitle = (sched: CpaxSchedule) => {
    if (sched.topicId) {
      const topicObj = topics.find(t => t.id === sched.topicId);
      if (topicObj) {
        return `[${topicObj.subject}] ${topicObj.textbook || 'テキスト'} ➜ ${topicObj.name}`;
      }
    }
    return sched.title;
  };

  // 行動チェックリスト用: 全てのインデントを表示する（[科目] テキスト・講義 ➜ 章・節 ➜ 論点名）
  const getChecklistDisplayTitle = (sched: CpaxSchedule) => {
    if (sched.topicId) {
      const topicObj = topics.find(t => t.id === sched.topicId);
      if (topicObj) {
        return `[${topicObj.subject}] ${topicObj.textbook || 'テキスト'} ➜ ${topicObj.category} ➜ ${topicObj.name}`;
      }
    }
    return sched.title;
  };

  // Daily statistics
  const getSchedulesForDate = (dateStr: string) => {
    return schedules.filter(s => s.date === dateStr);
  };

  // Format month title
  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  // Handle plan create submission
  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalTitle = title;
    let targetMin: number | undefined = undefined;
    let durMin: number | undefined = undefined;

    if (category === 'study') {
      targetMin = minutesInput;
      if (associatedTopicId) {
        const topicObj = topics.find(t => t.id === associatedTopicId);
        if (topicObj) {
          finalTitle = `[${topicObj.subject}] ${topicObj.textbook || 'テキスト'} ➜ ${topicObj.name}`;
        }
      }
    } else {
      durMin = minutesInput;
    }

    onAddSchedule(
      finalTitle,
      selectedDateStr,
      category,
      category === 'study' && associatedTopicId ? associatedTopicId : undefined,
      isAllDay ? '全日' : timeInput,
      targetMin,
      durMin
    );
    
    // Reset form states
    setTitle('');
    setAssociatedTopicId('');
    setMinutesInput(60);
    setIsAllDay(false);
  };

  // Selected day's computed plans
  const selectedDaySchedules = useMemo(() => {
    return schedules
      .filter(s => s.date === selectedDateStr)
      .sort((a, b) => {
        const timeA = a.timeInput === '全日' ? '00:00' : (a.timeInput || '99:99');
        const timeB = b.timeInput === '全日' ? '00:00' : (b.timeInput || '99:99');
        return timeA.localeCompare(timeB);
      });
  }, [schedules, selectedDateStr]);

  // Total private duration & study headroom calculator
  const { totalPrivateMinutes, availableStudyHours, totalPlannedStudyMinutes, isOverloaded } = useMemo(() => {
    // Sum private duration (minutes)
    const privateMinutesSum = selectedDaySchedules
      .filter(s => s.category === 'private')
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    // Physical balance from 24h
    const balanceHours = Math.max(0, 24 - (privateMinutesSum / 60));

    // Scheduled study minutes total
    const studyMinutesSum = selectedDaySchedules
      .filter(s => s.category === 'study')
      .reduce((sum, s) => sum + (s.targetMinutes || 0), 0);

    const overloaded = (studyMinutesSum / 60) > balanceHours;

    return {
      totalPrivateMinutes: privateMinutesSum,
      availableStudyHours: Number((24 - (privateMinutesSum / 60)).toFixed(1)),
      totalPlannedStudyMinutes: studyMinutesSum,
      isOverloaded: overloaded
    };
  }, [selectedDaySchedules]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left" id="cpax-planner-grid">
      {/* 8-col Calendar View */}
      <div className="xl:col-span-8 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
        {/* Navigator Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <IconCalendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-sans font-black text-slate-900 tracking-tight text-base sm:text-lg">
              {year}年 {monthNames[month]}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer border border-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => {
                setCurrentDate(new Date());
                setSelectedDateStr(new Date().toISOString().split('T')[0]);
              }}
              className="px-3.5 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors"
            >
              今日
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer border border-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Selected Date Upper Detail Row */}
        <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
          <div className="space-y-0.5 shrink-0 text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span className="text-[9px] font-black tracking-widest text-indigo-500 uppercase font-mono">SELECTED DATE PLAN SUMMARY</span>
            </div>
            <h4 className="text-xs font-black text-slate-800">
              {selectedDateStr.replace(/-/g, ' / ')} の予定詳細
            </h4>
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            {selectedDaySchedules.length === 0 ? (
              <p className="text-xs text-slate-450 font-bold italic py-1 text-left">💡 この日の予定は未登録です（自習可能時間: 24h）</p>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none scrollbar-thin">
                {selectedDaySchedules.map((sched) => {
                  const isStudy = sched.category === 'study';
                  const isCompleted = sched.completed;
                  return (
                    <button
                      key={sched.scheduleId}
                      type="button"
                      onClick={() => onToggleSchedule(sched.scheduleId)}
                      className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all hover:scale-102 cursor-pointer active:scale-95 ${
                        isCompleted
                          ? 'bg-slate-150/40 border-slate-200 text-slate-400 line-through'
                          : isStudy
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/80'
                            : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100/80'
                      }`}
                      title="クリックで完了/未完了を切替"
                    >
                      <span className="text-[11px] leading-none shrink-0">{isStudy ? '🎓' : '☕'}</span>
                      {sched.timeInput && (
                        <span className="font-mono text-[10px] bg-white px-1 py-0.2 rounded border border-slate-200/50 leading-none">
                          {sched.timeInput}
                        </span>
                      )}
                      <span className="max-w-[280px] truncate text-left">{getDisplayTitle(sched)}</span>
                      <span className={`text-[10px] font-black shrink-0 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {isCompleted ? '✓' : '○'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Days of the week header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-extrabold text-slate-400 py-1 uppercase tracking-widest">
          <div className="text-rose-500">SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div className="text-indigo-600">SAT</div>
        </div>

        {/* Calendar core days grid */}
        <div className="grid grid-cols-7 grid-rows-6 gap-2">
          {calendarDays.map((day, idx) => {
            const hasSchedules = getSchedulesForDate(day.dateStr);
            const isSelected = selectedDateStr === day.dateStr;
            const isToday = new Date().toISOString().split('T')[0] === day.dateStr;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`min-h-[110px] text-left p-2 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-950 text-white shadow-md'
                    : isToday
                      ? 'border-indigo-200 bg-indigo-50/40 text-slate-900 hover:bg-indigo-50/70'
                      : day.isCurrentMonth
                        ? 'border-slate-100 hover:bg-slate-50/50 text-slate-800'
                        : 'border-slate-100 opacity-40 hover:bg-slate-50 text-slate-400'
                }`}
              >
                {/* Day Digit */}
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] sm:text-xs font-black ${isToday && !isSelected ? 'text-indigo-600 font-extrabold' : ''}`}>
                    {day.dayNum}
                  </span>
                  {day.dateStr === targetDateStr && (
                    <span className="text-xs" title={targetTitle || "本試験日（🏆）"}>🏆</span>
                  )}
                </div>

                {/* Exam target date badge mapping (Block 5) */}
                {day.dateStr === targetDateStr && (
                  <div className={`text-[9px] w-full font-black px-1.5 py-0.5 rounded leading-tight text-center mt-1 select-none animate-pulse ${
                    isSelected ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-rose-600 text-white border border-rose-500'
                  }`}>
                    🏆本試験当日
                  </div>
                )}

                {/* Substantially detailed schedule title maps (up to 3 items) */}
                {hasSchedules.length > 0 && (
                  <div className="space-y-0.5 block w-full mt-1.5 overflow-hidden flex-1">
                    {hasSchedules.slice(0, 3).map((sched) => {
                      const isStudy = sched.category === 'study';
                      const isCompleted = sched.completed;
                      return (
                        <div
                          key={sched.scheduleId}
                          className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded leading-tight truncate border flex items-center gap-1 ${
                            isSelected
                              ? isStudy
                                ? 'bg-indigo-900 border-indigo-800 text-indigo-100'
                                : 'bg-slate-800 border-slate-700 text-slate-200 font-medium'
                              : isStudy
                                ? `${isCompleted ? 'bg-emerald-50/50 text-emerald-700/60 border-emerald-100/30 line-through' : 'bg-emerald-50 text-emerald-800 border-emerald-100/60'}`
                                : `${isCompleted ? 'bg-rose-50/50 text-rose-700/60 border-rose-100/30 line-through' : 'bg-rose-50 text-rose-800 border-rose-100/60'}`
                          }`}
                          title={`${isStudy ? '🎓' : '☕'} ${sched.timeInput || ''} ${getDisplayTitle(sched)}`}
                        >
                          <span className="shrink-0">{isStudy ? '🎓' : '☕'}</span>
                          <span className="truncate flex-1 text-left">
                            {getDisplayTitle(sched)}
                          </span>
                        </div>
                      );
                    })}
                    {hasSchedules.length > 3 && (
                      <div className={`text-[7.5px] sm:text-[8px] text-center font-black py-0.5 rounded leading-none select-none ${
                        isSelected ? 'text-indigo-300' : 'text-slate-400 bg-slate-100'
                      }`}>
                        他 {hasSchedules.length - 3} 件
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-col Sidebar Planner details */}
      <div className="xl:col-span-4 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
        <div>
          <span className="font-mono text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-lg font-black tracking-widest uppercase">
            PLANNER COCKPIT
          </span>
          <h3 className="font-sans font-black text-slate-900 text-base mt-2 tracking-tight">
            1日の行動表
          </h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">指定日: {selectedDateStr}</p>
        </div>

        {/* available physical balance hours display */}
        <div className="bg-gradient-to-br from-indigo-50/40 via-white to-indigo-50/20 border border-indigo-100/50 rounded-2xl p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] font-extrabold tracking-widest text-indigo-500 block">REALISTIC HEADROOM</span>
              <h4 className="text-xs font-bold text-slate-800">今日の勉強可能時間</h4>
              <p className="text-[9px] text-slate-400 font-bold">24時間 － 他の非勉強拘束時間</p>
            </div>
            <div className="text-right">
              <span className="font-sans font-black text-2xl sm:text-3xl text-indigo-950">{availableStudyHours}</span>
              <span className="text-xs font-bold text-slate-500 ml-1">h</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-bold">
            <span>予定勉強目標: {(totalPlannedStudyMinutes / 60).toFixed(1)}h</span>
            <span>私用拘束: {(totalPrivateMinutes / 60).toFixed(1)}h</span>
          </div>

          {/* Overload Alert Warning */}
          {isOverloaded && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-xl p-2.5 flex items-start gap-2 text-[10px] leading-relaxed font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span>【計画詰め込み警告】</span>
                <p className="font-normal mt-0.5 text-rose-600">
                  学習の目標時間が、差し引いた勉強可能時間（可動時間）を上回っています。詰め込みすぎは挫折の元になるため、私用を見直すか学習量を調整してください。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CPA Framework high-priority task injection area */}
        <div className="bg-gradient-to-br from-indigo-50/35 to-white border border-indigo-150/40 rounded-2xl p-4 space-y-2 text-left">
          <div className="flex items-center gap-1.5 justify-between">
            <span className="text-[8px] font-extrabold tracking-widest text-indigo-600 block uppercase font-mono">🏆今期の最優先TODO（フレームワーク連動）</span>
            <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-md scale-95 leading-none">Aランク</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold tracking-tight leading-normal">
            【志・道・進】フレームワークの「優先順位：高」の戦略タスクが自動連動しています。タップして一撃で予定時間と内容をフォームに自動注入します。
          </p>

          {frameworkPriorityTasks.length === 0 ? (
            <div className="text-center py-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-[10px] font-bold select-none leading-normal">
              現在、高優先度の戦略タスクはありません。<br />
              コントロール部の【道】タブから科目の高優先タスクを追加してください。
            </div>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {frameworkPriorityTasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleApplyPriorityTask(t.text, t.subjectName, t.hours)}
                  className="w-full text-left p-2.5 bg-white hover:bg-indigo-50/40 hover:border-indigo-200 active:scale-98 transition-all border border-slate-150 rounded-xl flex items-start gap-1.5 group select-none cursor-pointer"
                  title="このToDoをフォームに自動充填する"
                >
                  <span className="text-[8px] font-black bg-rose-50 border border-rose-100 text-rose-700 rounded px-1.5 py-0.2 shrink-0 mt-0.5">
                    {t.subjectName}
                  </span>
                  <div className="overflow-hidden flex-1 leading-tight">
                    <p className="text-[10px] font-bold text-slate-700 truncate group-hover:text-indigo-600">
                      {t.text}
                    </p>
                    <span className="text-[8px] font-mono font-bold text-indigo-400">推奨: {t.hours}時間予定 (タップで自動充填)</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current day TODO Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-xs">行動チェックリスト（{selectedDaySchedules.length}件）</h4>
          </div>
          
          {selectedDaySchedules.length === 0 ? (
            <div className="text-center py-7 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs select-none">
              予定はまだ登録されていません。下の追加フォームからカレンダーへ配置が可能です。
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDaySchedules.map(sched => (
                <div
                  key={sched.scheduleId}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    sched.completed
                      ? 'bg-slate-50/70 border-slate-100 text-slate-400 line-through'
                      : sched.category === 'private'
                        ? 'bg-rose-50/30 border-rose-100/40 text-slate-800'
                        : 'bg-white border-slate-100 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 text-left">
                    <button
                      type="button"
                      onClick={() => onToggleSchedule(sched.scheduleId)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="完了トグル"
                    >
                      {sched.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div className="overflow-hidden flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {sched.timeInput && (
                          <span className="text-[9px] font-mono font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 leading-none">
                            {sched.timeInput}
                          </span>
                        )}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
                          sched.category === 'private' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {sched.category === 'private' ? `私用: ${sched.duration || 0}分` : `目標: ${sched.targetMinutes || 0}分`}
                        </span>
                      </div>
                      <p className="text-xs font-bold truncate text-slate-900">{getChecklistDisplayTitle(sched)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteSchedule(sched.scheduleId)}
                    className="p-2.5 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer shrink-0 ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="計画を削除"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Standard create panel card */}
        <form onSubmit={handleSubmitPlan} className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 shadow-inner space-y-4 text-left">
          <h4 className="font-bold text-slate-900 text-xs text-left">予定の新規追加</h4>

          <div className="flex items-center gap-3.5 w-full">
            <div className="w-36 shrink-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">開始時刻</label>
                <label className="flex items-center gap-1 cursor-pointer select-none leading-none">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className="text-[9px] font-black text-slate-500 leading-none">全日</span>
                </label>
              </div>
              <input
                type="time"
                value={isAllDay ? "00:00" : timeInput}
                disabled={isAllDay}
                onChange={(e) => setTimeInput(e.target.value)}
                className={`w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-2 py-2 text-xs font-bold focus:outline-none min-h-[44px] text-center ${
                  isAllDay ? 'opacity-40 bg-slate-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[8px] font-extrabold text-indigo-900/60 uppercase tracking-widest mb-1">計画タイプ</label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value as 'study' | 'private';
                  setCategory(val);
                  if (val === 'private') {
                    setTitle('');
                    setMinutesInput(120); // 私用の初期値 120分
                  } else {
                    setMinutesInput(60); // 勉強初期値 60分
                  }
                }}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-black focus:outline-none min-h-[44px]"
              >
                <option value="study">🎓 学習計画</option>
                <option value="private">☕ プライベート用事</option>
              </select>
            </div>
          </div>

          {category === 'study' ? (
            <div className="space-y-4">
              <div className="bg-slate-100/60 border border-slate-200/50 p-3 rounded-2xl space-y-2.5">
                <span className="text-[9px] font-black tracking-widest text-indigo-600 block">🔍 連携データの検索 & 絞り込み</span>
                
                {/* 検索コントロール群 */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 mb-0.5">科目</label>
                    <select
                      value={searchSubject}
                      onChange={(e) => {
                        setSearchSubject(e.target.value);
                        setSearchTextbook('all'); // 科目が変わったらテキストを初期化
                        setSearchChapter('all'); // 章も初期化
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="all">すべて</option>
                      {availableSubjectsForSearch.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 mb-0.5">テキスト・教材</label>
                    <select
                      value={searchTextbook}
                      onChange={(e) => {
                        setSearchTextbook(e.target.value);
                        setSearchChapter('all'); // 章も初期化
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="all">すべて</option>
                      {availableTextbooksForSearch.map(tb => (
                        <option key={tb} value={tb}>{tb}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 mb-0.5">章・節</label>
                    <select
                      value={searchChapter}
                      onChange={(e) => setSearchChapter(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="all">すべて</option>
                      {availableChaptersForSearch.map(chap => (
                        <option key={chap} value={chap}>{chap}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-bold text-slate-400 mb-0.5">キーワード検索 (論点名、目次など)</label>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="例: リース、連結、問題番号..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* 最終セレクトボックス */}
                <div className="pt-1.5 border-t border-dashed border-slate-200">
                  <label className="block text-[8px] font-extrabold text-slate-400 mb-1">CPAX 目次マスター連携（候補: {filteredTopicsForSelect.length}件）</label>
                  <select
                    value={associatedTopicId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setAssociatedTopicId(id);
                      const topicObj = topics.find(t => t.id === id);
                      if (topicObj) {
                        setTitle(`[${topicObj.subject}] ${topicObj.textbook || 'テキスト'} ➜ ${topicObj.name}`);
                        setMinutesInput(topicObj.estimatedMinutes || 45); // 指標目安時間を自動インジェクション
                      } else {
                        setTitle('');
                      }
                    }}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg p-2 text-xs font-bold focus:outline-none truncate"
                  >
                    <option value="">-- 自習（目次に紐付けないフリー勉強） --</option>
                    {filteredTopicsForSelect.map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.subject}] {t.textbook || 'テキスト'} ➜ {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">目標自習時間 (分)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={minutesInput}
                    onChange={(e) => setMinutesInput(Number(e.target.value))}
                    className="w-24 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-2 text-xs font-bold focus:outline-none min-h-[44px]"
                  />
                  <span className="text-xs text-slate-400 font-bold">分間を予定</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">拘束・想定時間 (分)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={minutesInput}
                  onChange={(e) => setMinutesInput(Number(e.target.value))}
                  className="w-24 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-2 text-xs font-bold focus:outline-none min-h-[44px]"
                />
                <span className="text-xs text-slate-400 font-bold">分間 (可動時間から自動減算)</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">予定名／メモ</label>
            <input
              type="text"
              required
              placeholder={category === 'private' ? '睡眠、移動、バイト、食事など' : '自習、仕訳問題集A、答練やり直し'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-2.5 text-xs font-bold focus:outline-none min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer py-3 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <Plus className="w-4.5 h-4.5" />
            計画を行動表に登録する
          </button>
        </form>
      </div>
    </div>
  );
};
