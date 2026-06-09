/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Edit3, Check, Clock, AlertTriangle, Sparkles } from 'lucide-react';

interface CpaxCountdownProps {
  onTargetUpdate?: () => void;
  compact?: boolean;
}

export const CpaxCountdown: React.FC<CpaxCountdownProps> = ({ onTargetUpdate, compact = false }) => {
  const [targetDateStr, setTargetDateStr] = useState<string>('2026-12-13');
  const [targetTitle, setTargetTitle] = useState<string>('公認会計士試験');
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTitle, setEditTitle] = useState('');

  // Hydrate states on mount
  useEffect(() => {
    try {
      const cachedDate = localStorage.getItem('cpax_target_date');
      const cachedTitle = localStorage.getItem('cpax_target_title');

      if (cachedDate) {
        setTargetDateStr(JSON.parse(cachedDate));
      }
      if (cachedTitle) {
        setTargetTitle(JSON.parse(cachedTitle));
      }
    } catch (e) {
      console.error('Error reading cpax_target_date metadata:', e);
    }
  }, [isEditing]);

  const daysRemaining = (() => {
    const target = new Date(targetDateStr);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  })();

  const isNearingExam = daysRemaining > 0 && daysRemaining <= 30;
  const isOver = daysRemaining < 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDate || !editTitle.trim()) return;

    localStorage.setItem('cpax_target_date', JSON.stringify(editDate));
    localStorage.setItem('cpax_target_title', JSON.stringify(editTitle));

    setTargetDateStr(editDate);
    setTargetTitle(editTitle);
    setIsEditing(false);

    if (onTargetUpdate) {
      onTargetUpdate();
    }
  };

  const handleStartEditing = () => {
    setEditDate(targetDateStr);
    setEditTitle(targetTitle);
    setIsEditing(true);
  };

  if (compact) {
    // Mini visual display for menus or side cards
    return (
      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[10px] text-slate-500 font-bold">{targetTitle}まで:</span>
        </div>
        <span className={`text-xs font-black font-mono ${isNearingExam ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
          {isOver ? '終了' : `あと ${daysRemaining} 日`}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fafbfc]/30 border border-slate-100/50 rounded-2xl p-4 sm:p-5 text-left" id="cpax-target-countdown">
      {!isEditing ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-indigo-600" />
              <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase">
                {targetTitle} カウントダウン
              </h4>
              {isNearingExam && (
                <span className="animate-pulse inline-flex items-center gap-1 text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-2.5 h-2.5" /> 直前期 (30日以内)
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-bold">
              目標本試験日: <span className="font-mono text-slate-600 font-black">{targetDateStr}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Countdown visual box */}
            <div className={`px-5 py-2.5 rounded-2xl border flex items-baseline gap-1 shadow-sm leading-none ${
              isOver 
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : isNearingExam
                  ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                  : 'bg-indigo-50 border-indigo-100 text-indigo-950'
            }`}>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-1">残り</span>
              <span className="font-sans font-black text-2xl tracking-tighter">
                {isOver ? 0 : daysRemaining}
              </span>
              <span className="text-[10px] font-bold opacity-80">日</span>
            </div>

            <button
              onClick={handleStartEditing}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm"
              title="試験目標日の編集"
            >
              <Edit3 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3.5">
            <h4 className="font-sans font-black text-xs text-slate-900">本試験カウントダウン日の編集</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">
                  試験名称・目標タイトル
                </label>
                <input
                  type="text"
                  required
                  placeholder="例: 公認会計士短答式試験"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">
                  本試験の日程
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200/50">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold text-xs rounded-xl transition-all min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all min-h-[44px] flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-indigo-400" />
                目標を設定保存
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
