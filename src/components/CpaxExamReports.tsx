/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AlertTriangle, Printer, ClipboardCheck, Plus, CheckCircle, Flame, Target, Trash, Calendar, Award } from 'lucide-react';
import { CpaxExamReport, CpaxTopic } from '../types';

interface CpaxExamReportsProps {
  reports: CpaxExamReport[];
  topics: CpaxTopic[];
  currentMode: 'short' | 'essay';
  onAddReport: (report: Omit<CpaxExamReport, 'reportId' | 'scheduledReviewIds'> & { linkedTopicIds?: string[]; examType?: 'short' | 'essay'; deviationValue?: number }) => void;
  onDeleteReport: (reportId: string) => void;
}

// Checklists under different modes
const SHORT_CHECKLIST_LABELS = {
  abRank: "A・Bランク判定問題を確実に死守できたか",
  trapCheck: "ひっかけの肢（但し書きや前提基準）に引っかからなかったか",
  timeOver: "時間配分を誤り、後半の問題を塗り潰し（勘）にしなかったか"
};

const ESSAY_CHECKLIST_LABELS = {
  chainLoss: "第1問・問1の間違いが以降の計算全体に連鎖失点していないか",
  theoryGap: "問いとズレた理論展開・論証パーツの貼り付けをしていないか",
  wordLack: "法令基準集から転記したキーワード・要件充足性が抜けていないか",
  buryCut: "難解な埋没Cランク問題を早めに割り切って損切りできたか"
};

export const CpaxExamReports: React.FC<CpaxExamReportsProps> = ({
  reports,
  topics,
  currentMode,
  onAddReport,
  onDeleteReport
}) => {
  // Input form states
  const [examType, setExamType] = useState<'short' | 'essay'>(currentMode);

  // Synchronize Tab automatically whenever the active view's mode changes globally
  React.useEffect(() => {
    setExamType(currentMode);
  }, [currentMode]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('財務会計論(計算)');
  const [score, setScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [deviationValue, setDeviationValue] = useState<number>(50);
  const [evaluation, setEvaluation] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('C');
  const [actionPlan, setActionPlan] = useState(''); // やること/やめることの弾丸的な1行宣言
  const [analysis, setAnalysis] = useState(''); // 振り返り記述

  // Checkboxes specific to evaluation types
  const [shortAbRankChecked, setShortAbRankChecked] = useState(false);
  const [shortTrapCheckChecked, setShortTrapCheckChecked] = useState(false);
  const [shortTimeOverChecked, setShortTimeOverChecked] = useState(false);
  const [criticalFailureNum, setCriticalFailureNum] = useState(''); // 戦犯問題番号

  const [essayChainLossChecked, setEssayChainLossChecked] = useState(false);
  const [essayTheoryGapChecked, setEssayTheoryGapChecked] = useState(false);
  const [essayWordLackChecked, setEssayWordLackChecked] = useState(false);
  const [essayBuryCutChecked, setEssayBuryCutChecked] = useState(false);

  // Selected multiple topic links! (ワンタップで複数タグ付け)
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  // List of active categories for selected subject
  const filteredTopics = useMemo(() => {
    return topics.filter(t => t.subject === subject);
  }, [topics, subject]);

  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopicIds(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  // View detail card selector
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const activeReport = useMemo(() => {
    return reports.find(r => r.reportId === activeReportId);
  }, [reports, activeReportId]);

  // Form submit -> Core integrated auto-sync routing
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Compile dynamic checklist to standard failure patterns array
    const compiledFailures: string[] = [];
    if (examType === 'short') {
      if (!shortAbRankChecked) compiledFailures.push(`【判定NG】${SHORT_CHECKLIST_LABELS.abRank}`);
      if (!shortTrapCheckChecked) compiledFailures.push(`【判定NG】${SHORT_CHECKLIST_LABELS.trapCheck}`);
      if (!shortTimeOverChecked) compiledFailures.push(`【判定NG】${SHORT_CHECKLIST_LABELS.timeOver}`);
      if (criticalFailureNum.trim()) {
        compiledFailures.push(`戦犯問題（泥沼脱落）: 問${criticalFailureNum.trim()}`);
      }
    } else {
      if (essayChainLossChecked) compiledFailures.push(`【戦犯失点】${ESSAY_CHECKLIST_LABELS.chainLoss}`);
      if (essayTheoryGapChecked) compiledFailures.push(`【戦犯失点】${ESSAY_CHECKLIST_LABELS.theoryGap}`);
      if (essayWordLackChecked) compiledFailures.push(`【戦犯失点】${ESSAY_CHECKLIST_LABELS.wordLack}`);
      if (!essayBuryCutChecked) compiledFailures.push(`【戦犯失点】埋没Cランク問題の撤退の決断遅れ`);
    }

    // Call upstream master synchronizer
    onAddReport({
      title: title.trim(),
      date: new Date().toISOString().split('T')[0],
      subject,
      score,
      maxScore,
      evaluation,
      failurePatterns: compiledFailures,
      analysis: analysis.trim() || '特記事項なし',
      actionPlan: actionPlan.trim(),
      isShortMode: examType === 'short',
      linkedTopicIds: selectedTopicIds,
      deviationValue,
      examType
    });

    // Reset all form inputs safely
    setTitle('');
    setScore(0);
    setDeviationValue(50);
    setEvaluation('C');
    setActionPlan('');
    setAnalysis('');
    setCriticalFailureNum('');
    setShortAbRankChecked(false);
    setShortTrapCheckChecked(false);
    setShortTimeOverChecked(false);
    setEssayChainLossChecked(false);
    setEssayTheoryGapChecked(false);
    setEssayWordLackChecked(false);
    setEssayBuryCutChecked(false);
    setSelectedTopicIds([]);
  };

  const triggerWindowPrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left" id="cpax-exam-reports-view">
      {/* Dynamic inline print style specifically targeting A4 portrait fits */}
      <style>{`
        @media print {
          /* General page margins normalization */
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          
          /* Hide non-printable app items completely */
          aside,
          header,
          .no-print,
          nav,
          input,
          select,
          textarea,
          button,
          form {
            display: none !important;
            visibility: hidden !important;
          }

          /* Ensure body background becomes flat white for laser-jets */
          body, html, main, #root {
            background: white !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* Fullscreen printing print area container */
          #print-area-container {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* LEFT FORM/LIST VIEW - 7 COLS */}
      <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 no-print">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5 select-none">
            <ClipboardCheck className="w-5 h-5 text-indigo-650 shrink-0" />
            <span className="font-sans font-black text-[10px] text-slate-500 uppercase tracking-widest leading-none">
              答練分析カルテ
            </span>
          </div>
          <h2 className="font-sans font-black text-slate-900 text-base sm:text-lg tracking-tight">
            答練・公開模試の自己分析ツール
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            解いた直後の記憶がフレッシュな10分で自白し、弱点を3日後に即時召喚する自動復習学習環
          </p>
        </div>

        {/* Short-Essay Switch Tab */}
        <div className="bg-slate-50 border border-slate-100 p-1 rounded-2xl grid grid-cols-2">
          <button
            type="button"
            onClick={() => setExamType('short')}
            className={`py-3 text-xs font-black rounded-xl transition-all cursor-pointer min-h-[44px] ${
              examType === 'short'
                ? 'bg-indigo-950 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            短答式試験用 反省
          </button>
          <button
            type="button"
            onClick={() => setExamType('essay')}
            className={`py-3 text-xs font-black rounded-xl transition-all cursor-pointer min-h-[44px] ${
              examType === 'essay'
                ? 'bg-indigo-950 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            論文式試験用 反省
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5 border-b border-slate-100 pb-5">
          {/* Metadata entry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">
                答練・公開模試名称 (極めて重要)
              </label>
              <input
                type="text"
                required
                placeholder="例: 第1回短答全答練 (公開模試)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 text-xs font-bold focus:bg-white focus:border-indigo-500 focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">
                受験対象科目
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setSelectedTopicIds([]); // Reset links on change
                }}
                className="w-full bg-slate-50 rounded-xl px-2 py-2.5 border border-slate-100 text-xs font-bold focus:bg-white focus:outline-none min-h-[44px]"
              >
                <option value="財務会計論(計算)">財務会計論 (計算)</option>
                <option value="財務会計論(理論)">財務会計論 (理論)</option>
                <option value="管理会計論">管理会計論</option>
                <option value="監査論">監査論</option>
                <option value="企業法">企業法</option>
                {examType === 'essay' && (
                  <>
                    <option value="租税法">租税法</option>
                    <option value="経営学">経営学</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">
                自己素点
              </label>
              <input
                type="number"
                min="0"
                required
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 text-xs font-mono font-black focus:bg-white focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">
                満点基準
              </label>
              <input
                type="number"
                min="10"
                required
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 text-xs font-mono font-black focus:bg-white focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">
                判定偏差値 / ランク
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="20"
                  max="90"
                  step="0.1"
                  required
                  value={deviationValue}
                  onChange={(e) => setDeviationValue(parseFloat(e.target.value) || 50)}
                  className="w-16 bg-slate-50 rounded-xl px-2.5 py-2 text-xs font-mono font-black text-center border border-slate-100 focus:bg-white focus:outline-none min-h-[44px]"
                  title="判定偏差値"
                />
                <select
                  value={evaluation}
                  onChange={(e) => setEvaluation(e.target.value as any)}
                  className="flex-1 bg-slate-50 rounded-xl px-1.5 py-2 border border-slate-100 text-[11px] font-black focus:bg-white focus:outline-none min-h-[44px]"
                >
                  <option value="A">A判定 (安全)</option>
                  <option value="B">B判定 (良好)</option>
                  <option value="C">C判定 (危ない)</option>
                  <option value="D">D判定 (要対策)</option>
                  <option value="E">E判定 (惨敗)</option>
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC VIEW FOR REFLEX CHECKS */}
          {examType === 'short' ? (
            <div className="bg-slate-50/50 rounded-2xl p-4.5 border border-slate-100 space-y-3">
              <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase block font-sans">
                短答合格のための死守・トラップ検証
              </span>

              <div className="space-y-2.5">
                <label className="flex items-center gap-3 bg-white p-3 border border-slate-100 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shortAbRankChecked}
                    onChange={(e) => setShortAbRankChecked(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800">{SHORT_CHECKLIST_LABELS.abRank}</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-white p-3 border border-slate-100 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shortTrapCheckChecked}
                    onChange={(e) => setShortTrapCheckChecked(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800">{SHORT_CHECKLIST_LABELS.trapCheck}</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-white p-3 border border-slate-100 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shortTimeOverChecked}
                    onChange={(e) => setShortTimeOverChecked(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800">{SHORT_CHECKLIST_LABELS.timeOver}</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                  泥沼にハマった「戦犯問題」の番号
                </label>
                <input
                  type="text"
                  placeholder="問5、問13の解説を見落とし3分以上彷徨った、など"
                  value={criticalFailureNum}
                  onChange={(e) => setCriticalFailureNum(e.target.value)}
                  className="w-full bg-white rounded-xl px-3 py-2 border border-slate-100 text-xs font-bold focus:outline-none min-h-[40px]"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-2xl p-4.5 border border-slate-100 space-y-3">
              <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase block font-sans">
                論文記述に向けた論旨・加点・割り切りチェック
              </span>

              <div className="space-y-2.5">
                <label className="flex items-center gap-3 bg-white p-3 border border-slate-100 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={essayChainLossChecked}
                    onChange={(e) => setEssayChainLossChecked(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800">{ESSAY_CHECKLIST_LABELS.chainLoss}</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-white p-3 border border-slate-100 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={essayTheoryGapChecked}
                    onChange={(e) => setEssayTheoryGapChecked(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800">{ESSAY_CHECKLIST_LABELS.theoryGap}</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-white p-3 border border-slate-100 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={essayWordLackChecked}
                    onChange={(e) => setEssayWordLackChecked(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800">{ESSAY_CHECKLIST_LABELS.wordLack}</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-white p-3 border border-slate-100 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={essayBuryCutChecked}
                    onChange={(e) => setEssayBuryCutChecked(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800">{ESSAY_CHECKLIST_LABELS.buryCut}</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ONE-TAP MULTI-TOPIC LINK SELECTOR [串の複数タグ付け] */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest font-sans">
                【核心連携】戻るべき復習論点を選択 (タップで複数指定可・3日後自動配置されます)
              </label>
              <span className="text-[9px] font-extrabold text-indigo-600">選択中: {selectedTopicIds.length}論点</span>
            </div>
            
            {filteredTopics.length === 0 ? (
              <div className="text-[10px] text-slate-400 border border-dashed border-slate-200 rounded-xl p-4 text-center">
                ※ 指定した科目の論点目次が存在しません。
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto bg-slate-50 border border-slate-100 rounded-xl p-3 scrollbar-thin">
                {filteredTopics.map(t => {
                  const isSelected = selectedTopicIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTopicSelection(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 min-h-[36px] ${
                        isSelected
                          ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-sm font-extrabold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{isSelected ? '🔥' : '＋'}</span>
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reflexive essay blocks */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">
                失点の真因分析・精神と状況の振り返り
              </label>
              <textarea
                required
                rows={2}
                placeholder="例: 有形固定資産の買換で、新資産の取得価額算定時に圧縮控除に関する但し書きを無視。時間的な焦りから解く順序を焦った。"
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[8px] font-extrabold text-indigo-900/60 uppercase tracking-widest mb-1 font-sans">
                次回絶対に「やるべきこと」 or 「やめるべきこと」 (一言に絞る)
              </label>
              <input
                type="text"
                required
                placeholder="例: 解法シートで資本連結の構造図を真っ先に端に30秒で書き切り、脳内の連結関係を一度固定する！"
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-extrabold focus:bg-white focus:outline-none focus:border-indigo-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-[10px] text-slate-400 font-bold leading-normal block">
              ※ 「目次・計画へ連動」を押すと、指定された複数論点の目次ログが自動登録され、さらに3日後のカレンダーにタスクが自動強制配置されます。
            </span>
            <button
              type="submit"
              className="w-full sm:w-auto py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] shrink-0"
            >
              <CheckCircle className="w-4 h-4 text-indigo-100" />
              分析を完了して目次・計画へ連動
            </button>
          </div>
        </form>

        {/* Existing reports lists bottom */}
        <div className="space-y-3.5">
          <h3 className="font-extrabold text-slate-800 text-xs text-left">登録済みの答練分析カルテ（{reports.length}件）</h3>
          {reports.length === 0 ? (
            <div className="py-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
              カルテ履歴はありません。答練のやりっぱなし防止のため、記述を追加してください。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {reports.map(rep => {
                const percent = Math.round((rep.score / rep.maxScore) * 100);
                return (
                  <button
                    key={rep.reportId}
                    type="button"
                    onClick={() => setActiveReportId(rep.reportId)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer min-h-[110px] ${
                      activeReportId === rep.reportId
                        ? 'border-indigo-600 bg-indigo-50/25 shadow-sm'
                        : 'border-slate-100 bg-slate-50/30 hover:border-slate-200/80 hover:bg-white'
                    }`}
                  >
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                        <span>{rep.date}</span>
                        <span className={`px-2 py-0.5 rounded-md ${
                          rep.evaluation === 'A' || rep.evaluation === 'B' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {rep.examType === 'essay' ? '論文' : '短答'}: {rep.evaluation}判定
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {rep.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold font-sans truncate">
                        {rep.subject} | 得点率: {rep.score}/{rep.maxScore} ({percent}%)  偏差値: {rep.deviationValue || 50}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT REPORT BOARD (A4 PRINT OPTIMIZED BOX) - 5 COLS */}
      <div className="xl:col-span-5 space-y-4">
        {activeReport ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-md" id="print-area-container">
            {/* Real Report Header */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b-2 border-indigo-950 pb-4 text-left">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono font-extrabold tracking-[0.25em] text-indigo-700 block uppercase">
                    CPAX PROFESSIONAL EXAM ANALYSIS PROTOCOL
                  </span>
                  <h3 className="font-sans font-black text-slate-900 text-base sm:text-lg tracking-tight">
                    CPAX 答練弱点徹底自己分析シート
                  </h3>
                </div>
                <div className="text-right">
                  <div className="w-11 h-11 bg-indigo-950 text-white rounded-xl flex flex-col items-center justify-center shadow font-mono">
                    <span className="text-[9px] font-bold font-sans text-indigo-300">RANK</span>
                    <span className="text-xs font-black leading-none">{activeReport.evaluation}</span>
                  </div>
                </div>
              </div>

              {/* Grid indices */}
              <div className="grid grid-cols-2 gap-4 border-b border-dashed border-slate-100 pb-4 text-left font-sans text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">模試答練情報 / 日程</span>
                  <p className="font-extrabold text-slate-950 truncate">{activeReport.title}</p>
                  <p className="text-[10px] text-slate-400 font-semibold font-mono">{activeReport.date} 受験</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">科目 / 得点率割合</span>
                  <p className="font-extrabold text-slate-950 truncate">{activeReport.subject}</p>
                  <p className="text-[11px] font-black text-indigo-600 font-mono mt-0.5">
                    {activeReport.score} / {activeReport.maxScore}点 ({Math.round((activeReport.score / activeReport.maxScore) * 100)}%) | 偏差値: {activeReport.deviationValue || 50}
                  </p>
                </div>
              </div>

              {/* Tag links */}
              {activeReport.linkedTopicIds && activeReport.linkedTopicIds.length > 0 && (
                <div className="space-y-1.5 text-left">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">戻るべき指定連動論点</span>
                  <div className="flex flex-wrap gap-1">
                    {activeReport.linkedTopicIds.map(tid => {
                      const topicObj = topics.find(t => t.id === tid);
                      return (
                        <span key={tid} className="text-[10px] bg-indigo-50 border border-indigo-100/60 text-indigo-900 font-bold px-2 py-0.5 rounded-lg inline-flex items-center gap-0.5">
                          🔥 {topicObj?.name || tid}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Checklists or Failures */}
              {activeReport.failurePatterns.length > 0 && (
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    抽出された「やらかし / ミスの因果」
                  </span>
                  <div className="space-y-1.5">
                    {activeReport.failurePatterns.map((pt, idx) => (
                      <div key={idx} className="bg-rose-50 border border-rose-100/40 text-rose-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Describe causes analysis */}
              <div className="space-y-1.5 text-left">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">脳内ミスの徹底自白（本質的原因）</span>
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                  <p className="text-xs font-bold leading-relaxed whitespace-pre-line text-slate-800">
                    {activeReport.analysis}
                  </p>
                </div>
              </div>

              {/* Next bullet action */}
              <div className="space-y-1.5 text-left">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-600" /> 次回絶対に「やること / やめること」
                </span>
                <div className="bg-indigo-950 text-indigo-50 p-4 rounded-2xl shadow-sm">
                  <p className="text-xs font-black leading-relaxed whitespace-pre-line text-white">
                    {activeReport.actionPlan}
                  </p>
                </div>
              </div>

              {/* Auto scheduling indicator */}
              <div className="bg-emerald-50/40 border border-emerald-150 p-4 rounded-2xl flex items-start gap-2.5 text-left">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-900">3日後復習TODO自動召喚完了</p>
                  <p className="text-[10px] text-emerald-800 leading-relaxed font-bold">
                    反省の風化を防ぐために、この受験から3日後の学習計画（カレンダー）に、リンクされた各エラー論点が「優先マーク🔥」付きで自動強制スケジュールされています。
                  </p>
                </div>
              </div>
            </div>

            {/* Print trigger footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between no-print">
              <span className="text-[9px] text-slate-300 font-mono font-extrabold tracking-tight">
                A4 portrait/1枚 印刷最適化CSS適用中
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDeleteReport(activeReport.reportId)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all min-h-[44px]"
                  title="レポートを削除"
                >
                  <Trash className="w-4 h-4" />
                  削除
                </button>
                <button
                  type="button"
                  onClick={triggerWindowPrint}
                  className="px-5 py-2 bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all min-h-[44px]"
                >
                  <Printer className="w-4.5 h-4.5 text-indigo-400" />
                  PDF / A4印刷出力
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[420px] bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <ClipboardCheck className="w-12 h-12 text-slate-300 block mb-3 stroke-1" />
            <span className="text-xs font-black text-slate-500">反省レポート未選択</span>
            <p className="text-[10px] hover:text-slate-500 max-w-[240px] mt-2 leading-relaxed font-semibold">
              左の「登録済みの答練分析カルテ」からレポートを選択すると、印刷・PDF保存に準拠した美しいA4サイズ1枚プレビューが映し出されます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
