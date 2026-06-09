/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Search, CheckCircle, Calendar, Plus, Clock, 
  ChevronDown, ChevronRight, Trash, Edit, Save, X, 
  UploadCloud, Settings2, Trash2, HelpCircle 
} from 'lucide-react';
import { CpaxTopic, CpaxHistoryItem } from '../types';

interface CpaxContentTreeProps {
  topics: CpaxTopic[];
  history: CpaxHistoryItem[];
  currentMode: 'short' | 'essay';
  onAddHistory: (topicId: string, duration: number, evaluation: 'good' | 'average' | 'poor', note: string) => void;
  onDeleteHistory: (historyId: string) => void;
  onSelectTopicForTimer?: (topicId: string) => void;
  onUpdateTopics: (newTopics: CpaxTopic[]) => void; // Passed from App.tsx
}

export const CpaxContentTree: React.FC<CpaxContentTreeProps> = ({
  topics,
  history,
  currentMode,
  onAddHistory,
  onDeleteHistory,
  onSelectTopicForTimer,
  onUpdateTopics
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Accordion Expand/Collapse States
  // Level 1: Subjects (財務会計、監査 etc)
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  // Level 2: Chapters/Categories (章、基礎論点 etc)
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Active form for recording study logs
  const [activeFormTopicId, setActiveFormTopicId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(45);
  const [evaluation, setEvaluation] = useState<'good' | 'average' | 'poor'>('good');
  const [note, setNote] = useState('');

  // Bulk Import Manager States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importDefaultSubject, setImportDefaultSubject] = useState('財務会計論(計算)');

  // Individual Editing Mode states
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormCategory, setEditFormCategory] = useState('');
  const [editFormMinutes, setEditFormMinutes] = useState(45);

  // Manual New Topic / Chapter insertion form states
  const [activeAddTopicInChapter, setActiveAddTopicInChapter] = useState<{ subject: string, category: string } | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicMinutes, setNewTopicMinutes] = useState(45);

  const [activeAddChapterInSubject, setActiveAddChapterInSubject] = useState<string | null>(null);
  const [newChapterName, setNewChapterName] = useState('');

  // 1. FILTER & RENDER SYLLABUS DATA WITH LEVEL 1 + LEVEL 2 ACCORDIONS
  // Absolute short-mode filter strategy: complete elimination of "租税法" and "経営学"
  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      // 1. Core verification: if in dev short mode, hide Tax/Bus completely
      if (currentMode === 'short') {
        if (t.isEssayOnly || t.subject === '租税法' || t.subject === '経営学') {
          return false;
        }
      }
      
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchSubject = selectedSubject === 'all' || t.subject === selectedSubject;
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;

      return matchSearch && matchSubject && matchCategory;
    });
  }, [topics, currentMode, searchQuery, selectedSubject, selectedCategory]);

  // Available subjects directly derived
  const availableSubjects = useMemo(() => {
    const list = Array.from(new Set(topics.map(t => t.subject)));
    if (currentMode === 'short') {
      return list.filter(sub => sub !== '租税法' && sub !== '経営学');
    }
    return list;
  }, [topics, currentMode]);

  // Available categories (Chapters/論点) based on mode
  const availableCategories = useMemo(() => {
    const matched = topics.filter(t => {
      if (currentMode === 'short') {
        return !t.isEssayOnly && t.subject !== '租税法' && t.subject !== '経営学';
      }
      return true;
    });
    return Array.from(new Set(matched.map(t => t.category)));
  }, [topics, currentMode]);

  // Hierarchical Double Grouping: Subject -> Category (Chapter) -> Topic list
  const structuredData = useMemo(() => {
    const groupings: Record<string, Record<string, CpaxTopic[]>> = {};
    
    // Sort logic to preserve custom ordering
    filteredTopics.forEach(t => {
      if (!groupings[t.subject]) {
        groupings[t.subject] = {};
      }
      if (!groupings[t.subject][t.category]) {
        groupings[t.subject][t.category] = [];
      }
      groupings[t.subject][t.category].push(t);
    });

    return groupings;
  }, [filteredTopics]);

  // Toggles
  const toggleSubject = (sub: string) => {
    setExpandedSubjects(prev => ({ ...prev, [sub]: !prev[sub] }));
  };

  const toggleChapter = (sub: string, cat: string) => {
    const key = `${sub}::${cat}`;
    setExpandedChapters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper stats calculation
  const getTopicStats = (topicId: string) => {
    const topicHistory = history.filter(h => h.topicId === topicId);
    const repetitionsCount = topicHistory.length;
    const totalMinutes = topicHistory.reduce((sum, h) => sum + h.duration, 0);
    
    let lastEvaluation: 'good' | 'average' | 'poor' | null = null;
    if (repetitionsCount > 0) {
      const sorted = [...topicHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      lastEvaluation = sorted[0].evaluation;
    }

    return { repetitionsCount, totalMinutes, lastEvaluation, records: topicHistory };
  };

  // Submission handles
  const handleManualSubmit = (e: React.FormEvent, topicId: string) => {
    e.preventDefault();
    if (duration <= 0) return;
    onAddHistory(topicId, duration, evaluation, note);
    setActiveFormTopicId(null);
    setNote('');
  };

  // 2. TEXT PARSING (INJECT INTEGRITY TIMESTAMPS BASED ON UNMUTABLE ID CRITERIAS)
  const handleParseAndImport = () => {
    if (!importText.trim()) {
      alert('インポートするテキストを入力してください。');
      return;
    }

    const lines = importText.split('\n');
    let currentSubject = importDefaultSubject;
    let currentChapter = '基本論点';
    const parsedTopics: CpaxTopic[] = [];

    // Skip lists for short mode
    const skipSubjects = currentMode === 'short' ? ['租税法', '経営学'] : [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // 1. Identify Subject (■ or 【 or custom terms)
      if (trimmed.startsWith('■') || trimmed.startsWith('【') || trimmed.includes('会計論') || trimmed.includes('監査論') || trimmed.includes('企業法') || trimmed.includes('租税法') || trimmed.includes('経営学')) {
        const cleanSub = trimmed.replace(/[■★◆▲【】]/g, '').trim();
        if (cleanSub) {
          currentSubject = cleanSub;
        }
        return;
      }

      // 2. Identify Chapter/Category (第...章、Chapter ... or numeric prefix)
      if (trimmed.startsWith('第') && (trimmed.includes('章') || trimmed.includes('節') || trimmed.includes('講')) || /^\d+[\.、]\s*/.test(trimmed) || trimmed.startsWith('Chapter') || trimmed.startsWith('Ch.')) {
        currentChapter = trimmed.replace(/^[-・+\s]+/, '').trim();
        return;
      }

      // 3. Identify Topic Node
      const cleanName = trimmed.replace(/^[-・*•+\s\d\.、]+/g, '').trim();
      if (cleanName) {
        // Prevent importing disabled subjects under short-mode context
        if (skipSubjects.includes(currentSubject)) {
          return;
        }

        parsedTopics.push({
          id: `cpax-topic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          subject: currentSubject,
          category: currentChapter,
          name: cleanName,
          estimatedMinutes: 45,
          isEssayOnly: currentSubject === '租税法' || currentSubject === '経営学' ? true : undefined
        });
      }
    });

    if (parsedTopics.length === 0) {
      alert('有効な論点を検出できませんでした。フォーマット（■ 科目名、第1章 章名、- 論点名）を確認してください。');
      return;
    }

    // Replace vs Append logic
    let updatedTopics: CpaxTopic[] = [];
    if (importMode === 'replace') {
      if (currentMode === 'short') {
        // If in short mode during replace, we retain tax/bus data so we don't accidentally wipe essay mode records!
        const existingEssayOnly = topics.filter(t => t.subject === '租税法' || t.subject === '経営学');
        updatedTopics = [...existingEssayOnly, ...parsedTopics];
      } else {
        updatedTopics = parsedTopics;
      }
    } else {
      updatedTopics = [...topics, ...parsedTopics];
    }

    onUpdateTopics(updatedTopics);
    setImportText('');
    setShowImportModal(false);
    alert(`インポートに成功しました！新たに ${parsedTopics.length}件 の論点が目次の軸（CPAX Axis）へ安全に登録・連動されました。`);
  };

  // 3. MASTER LOGIC MAINTAINERS (ID UNMUTABILITY BOUNDARIES)
  const handleAddNewTopic = (subject: string, category: string) => {
    if (!newTopicName.trim()) return;

    const freshTopic: CpaxTopic = {
      id: `cpax-topic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subject,
      category,
      name: newTopicName.trim(),
      estimatedMinutes: newTopicMinutes
    };

    onUpdateTopics([...topics, freshTopic]);
    setNewTopicName('');
    setActiveAddTopicInChapter(null);
  };

  const handleAddNewChapter = (subject: string) => {
    if (!newChapterName.trim()) return;

    // To add a chapter, we insert a placeholder/starter topic within it first
    const freshTopic: CpaxTopic = {
      id: `cpax-topic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subject,
      category: newChapterName.trim(),
      name: '（初期論点）新規論点カードを追加してください',
      estimatedMinutes: 45
    };

    onUpdateTopics([...topics, freshTopic]);
    setNewChapterName('');
    setActiveAddChapterInSubject(null);
  };

  const handleStartEdit = (topic: CpaxTopic) => {
    setEditingTopicId(topic.id);
    setEditFormName(topic.name);
    setEditFormCategory(topic.category);
    setEditFormMinutes(topic.estimatedMinutes || 45);
  };

  const handleSaveInlineEdit = (id: string) => {
    if (!editFormName.trim() || !editFormCategory.trim()) return;

    // Mutates everything except the ID keeping references 100% resilient
    const updated = topics.map(t => {
      if (t.id === id) {
        return {
          ...t,
          name: editFormName.trim(),
          category: editFormCategory.trim(),
          estimatedMinutes: editFormMinutes
        };
      }
      return t;
    });

    onUpdateTopics(updated);
    setEditingTopicId(null);
  };

  const handleDeleteTopic = (id: string) => {
    const topicObj = topics.find(t => t.id === id);
    if (!topicObj) return;

    if (window.confirm(`「${topicObj.name}」を除外しますか？（※インポートや編集で戻せますが、この論点に紐づくカレンダー予定の自動参照は名前表示等に影響する場合が有ります）`)) {
      const updated = topics.filter(t => t.id !== id);
      onUpdateTopics(updated);
    }
  };

  const renderEvaluationBadge = (evalValue: 'good' | 'average' | 'poor') => {
    switch (evalValue) {
      case 'good':
        return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black font-sans">◯</span>;
      case 'average':
        return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black font-sans">△</span>;
      case 'poor':
        return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black font-sans">✕</span>;
    }
  };

  return (
    <div className="space-y-6 text-left font-sans" id="cpax-content-tree-view">
      {/* Search and Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Search components */}
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="論点、重要重要、章の名称などから高速検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl pl-10 pr-4 py-3 placeholder:text-slate-400 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600/30 transition-all font-sans"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-44 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl px-3.5 py-3 text-xs font-black text-slate-700 focus:outline-none transition-all"
            >
              <option value="all">科目: すべて</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-44 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl px-3.5 py-3 text-xs font-black text-slate-700 focus:outline-none transition-all"
            >
              <option value="all">章分類: すべて</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Admin controls */}
        <div className="flex items-center gap-2 shrink-0 md:border-l md:border-slate-100 md:pl-4">
          <button
            onClick={() => setIsEditingMode(!isEditingMode)}
            className={`flex items-center gap-1.5 px-4 py-3 cursor-pointer rounded-2xl text-xs font-extrabold transition-all border ${
              isEditingMode 
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-md scale-95' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            {isEditingMode ? '編集モード: ON' : '個別編集モード'}
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-4 border border-slate-900 bg-slate-950 hover:bg-slate-850 text-white rounded-2xl text-xs font-extrabold py-3 shadow-md shadow-slate-950/20 cursor-pointer active-scale"
          >
            <UploadCloud className="w-4 h-4" />
            一括インポート
          </button>
        </div>
      </div>

      {/* Bulk Copy-Paste Import Area overlay (Self-made pure popup code) */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-900/30">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="w-6 h-6 text-indigo-400" />
                <div className="text-left">
                  <h3 className="font-sans font-black text-base tracking-tight">CPAX 一括シラバス・目次インポート</h3>
                  <p className="text-[10px] text-indigo-200">予備校テキストやシラバスのコピーテキストを一発構造化</p>
                </div>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-indigo-200" />
              </button>
            </div>

            {/* Modal Inner Settings */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left text-xs">
              <div className="bg-indigo-50 border border-indigo-100/70 p-4 rounded-2xl text-indigo-900 space-y-1.5 font-semibold">
                <p className="font-extrabold flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  推奨インポートフォーマット
                </p>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  改行ごとにデータを認識します。以下のように指定すると科目、章（アコーディオン）が自動分割されます。<br />
                  <span className="font-mono bg-indigo-100/50 px-1 py-0.5 rounded text-[10px]">■ 財務会計論(計算)</span> （■で始まる行 ＝ 科目指定）<br />
                  <span className="font-mono bg-indigo-100/50 px-1 py-0.5 rounded text-[10px]">第1章 連結会計の基本</span> （第、Chapter、数字で始まる行 ＝ 章/Category）<br />
                  <span className="font-mono bg-indigo-100/50 px-1 py-0.5 rounded text-[10px]">- 支配獲得日の仕訳</span> （通常の行 ＝ 回転用論点名。IDは自動で不変生成されます）
                </p>
                {currentMode === 'short' && (
                  <p className="text-[11px] text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 mt-2 font-black">
                    ※現在「短答式モード」が稼働しているため、「租税法」「経営学」に該当する行は自動でスキップされます（保存構造は壊しません）。
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">デフォルト科目（文字中に科目指定がない場合）</label>
                  <select
                    value={importDefaultSubject}
                    onChange={(e) => setImportDefaultSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 font-bold text-slate-700 text-xs focus:outline-none"
                  >
                    {availableSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">インポート処理モード</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImportMode('append')}
                      className={`py-2 px-3.5 rounded-xl border font-bold text-slate-700 text-center cursor-pointer transition-all ${
                        importMode === 'append' ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      既存リストに追加
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportMode('replace')}
                      className={`py-2 px-3.5 rounded-xl border font-extrabold text-slate-700 text-center cursor-pointer transition-all ${
                        importMode === 'replace' ? 'bg-rose-600 text-white border-rose-600 shadow' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      完全に全上書き
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ここにテキストを貼り付け（コピペ）</label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="例:&#10;■ 財務会計論(計算)&#10;第1章 現金預金&#10;- 現金預金の基本設例&#10;- 銀行勘定調整表の作成&#10;第2章 有形固定資産&#10;- 取引記帳レベル1"
                  rows={10}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl p-4 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600/30 whitespace-pre"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all cursor-pointer font-semibold text-slate-500"
              >
                キャンセル
              </button>
              <button
                onClick={handleParseAndImport}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md active-scale cursor-pointer"
              >
                パースしてインポート実行
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Level-1 list layout */}
      <div className="space-y-4">
        {availableSubjects.map(subj => {
          const categoriesObj = structuredData[subj] || {};
          const categoriesList = Object.keys(categoriesObj);
          
          if (categoriesList.length === 0 && !isEditingMode) return null;

          const isSubExpanded = expandedSubjects[subj] !== false; // Default expanded
          const subjHistory = history.filter(h => {
            const matchTopObj = topics.find(t => t.id === h.topicId);
            return matchTopObj && matchTopObj.subject === subj;
          });
          const subjTotalHours = (subjHistory.reduce((s, h) => s + h.duration, 0) / 60).toFixed(1);

          return (
            <div key={subj} className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden hover:shadow-lg duration-300">
              {/* Level 1 Header Subject (e.g. 財務計、企業法) */}
              <div
                className="w-full p-5 bg-gradient-to-r from-slate-50 to-slate-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100"
              >
                <div 
                  onClick={() => toggleSubject(subj)}
                  className="flex items-center gap-3.5 cursor-pointer flex-1"
                >
                  <div className="p-3 bg-slate-950 text-indigo-400 rounded-2xl shadow">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans font-black text-slate-900 tracking-tight text-sm uppercase">{subj}</h3>
                      <span className="text-[9px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-lg">CPAX Axis</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      総章数: <span className="text-slate-700 font-extrabold">{categoriesList.length}章</span>
                      {' '}/ 前回までの実績: <span className="text-slate-700 font-extrabold">{subjTotalHours}時間</span>
                      {' '}(<span className="text-emerald-600 font-extrabold">{subjHistory.length}回転</span>)
                    </p>
                  </div>
                </div>

                {/* Level 1 Sidebar actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isEditingMode && (
                    <button
                      onClick={() => {
                        if (activeAddChapterInSubject === subj) {
                          setActiveAddChapterInSubject(null);
                        } else {
                          setActiveAddChapterInSubject(subj);
                          setNewChapterName('');
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      新しい章の新規追加
                    </button>
                  )}

                  <button
                    onClick={() => toggleSubject(subj)}
                    className="p-1.5 hover:bg-slate-200/50 rounded-xl cursor-pointer"
                  >
                    {isSubExpanded ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                  </button>
                </div>
              </div>

              {/* Add Chapter Form Box Inline */}
              {activeAddChapterInSubject === subj && (
                <div className="p-5 border-b border-dashed border-slate-100 bg-indigo-50/20 text-left space-y-2">
                  <div className="max-w-md">
                    <label className="block text-[8px] font-black text-indigo-900 mb-1">新規登録する章の名称 (例: 第10章 退職給付)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="第◯章 論点カテゴリ..."
                        value={newChapterName}
                        onChange={(e) => setNewChapterName(e.target.value)}
                        className="bg-white border border-slate-200 text-xs py-2 px-3.5 rounded-xl font-bold flex-1 focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        onClick={() => handleAddNewChapter(subj)}
                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-black rounded-xl cursor-pointer shadow active-scale"
                      >
                        章を追加
                      </button>
                      <button
                        onClick={() => setActiveAddChapterInSubject(null)}
                        className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Subject Children - Level 2 Categories (Chapters) accordion list */}
              {isSubExpanded && (
                <div className="divide-y divide-slate-100 bg-white">
                  {categoriesList.length === 0 ? (
                    <div className="p-10 text-center text-xs text-slate-400 select-none">
                      登録されている章はありません。右上のインポートからテキスト貼り付けするか、編集モードから作成してください。
                    </div>
                  ) : (
                    categoriesList.map(categoryName => {
                      const listTopics = categoriesObj[categoryName] || [];
                      const chKey = `${subj}::${categoryName}`;
                      const isChExpanded = expandedChapters[chKey] !== false; // Default expanded

                      return (
                        <div key={categoryName} className="space-y-1">
                          {/* Level 2 Sub-Header - Chapters */}
                          <div className="bg-slate-50/60 p-4 shrink-0 flex items-center justify-between">
                            <button
                              onClick={() => toggleChapter(subj, categoryName)}
                              className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                            >
                              {isChExpanded ? (
                                <ChevronDown className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-indigo-600" />
                              )}
                              <span className="font-sans font-black text-slate-800 text-xs tracking-tight uppercase">
                                {categoryName}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md ml-1">
                                {listTopics.length}件の論点
                              </span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              {isEditingMode && (
                                <button
                                  onClick={() => {
                                    if (activeAddTopicInChapter?.category === categoryName && activeAddTopicInChapter?.subject === subj) {
                                      setActiveAddTopicInChapter(null);
                                    } else {
                                      setActiveAddTopicInChapter({ subject: subj, category: categoryName });
                                      setNewTopicName('');
                                      setNewTopicMinutes(45);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 rounded-lg text-[9px] font-black cursor-pointer shadow-sm transition-all flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3 text-slate-500" />
                                  論点の追加
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Add Topic Inline Form inside Chapter */}
                          {activeAddTopicInChapter?.category === categoryName && activeAddTopicInChapter?.subject === subj && (
                            <div className="p-4 mx-4 border border-dashed border-slate-200 rounded-2xl bg-indigo-50/10 text-left space-y-3">
                              <h5 className="text-[10px] font-black text-slate-700">「{categoryName}」へ新規復習論点を手動追加</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">論点名称</label>
                                  <input
                                    type="text"
                                    placeholder="例: 取締役会決議責任と免除規定"
                                    value={newTopicName}
                                    onChange={(e) => setNewTopicName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 text-xs py-2 px-3 rounded-lg font-semibold focus:outline-none focus:border-indigo-600"
                                  />
                                </div>
                                <div className="flex items-end gap-2">
                                  <div className="flex-1">
                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">標準学習時間(分)</label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={newTopicMinutes}
                                      onChange={(e) => setNewTopicMinutes(parseInt(e.target.value) || 45)}
                                      className="w-full bg-white border border-slate-200 text-xs py-2 px-3 rounded-lg font-bold focus:outline-none focus:border-indigo-600"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleAddNewTopic(subj, categoryName)}
                                    className="px-4.5 py-2.5 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    登録する
                                  </button>
                                  <button
                                    onClick={() => setActiveAddTopicInChapter(null)}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Level 3 Checklist Topics Table list */}
                          {isChExpanded && (
                            <div className="divide-y divide-slate-50 px-4 pb-2 z-10">
                              {listTopics.length === 0 ? (
                                <div className="py-4 text-center text-[10px] text-slate-300 font-semibold select-none bg-slate-50/10 rounded-xl border border-dashed border-slate-100">
                                  章に属する論点が空です。
                                </div>
                              ) : (
                                listTopics.map(topic => {
                                  const stats = getTopicStats(topic.id);
                                  const isFormActive = activeFormTopicId === topic.id;
                                  const isEditingThisTopic = editingTopicId === topic.id;

                                  return (
                                    <div key={topic.id} className="py-3.5 hover:bg-slate-50/40 rounded-xl transition-all px-3">
                                      {isEditingThisTopic ? (
                                        /* In-line editing card - strict id immutable rules */
                                        <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl text-left space-y-3.5">
                                          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                                            <span className="text-[8px] font-black tracking-widest text-indigo-700 bg-white border border-indigo-100 rounded px-1.5 py-0.5">
                                              ID不変ポリシー継続中 : {topic.id}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold">目次カードの修正</span>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div>
                                              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">論点 / 項目名称</label>
                                              <input
                                                type="text"
                                                value={editFormName}
                                                onChange={(e) => setEditFormName(e.target.value)}
                                                className="w-full bg-white border border-slate-200 text-xs py-2 px-3 rounded-lg font-bold focus:outline-none"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">所属する章・分類</label>
                                              <input
                                                type="text"
                                                value={editFormCategory}
                                                onChange={(e) => setEditFormCategory(e.target.value)}
                                                className="w-full bg-white border border-slate-200 text-xs py-2 px-3 rounded-lg font-bold focus:outline-none"
                                              />
                                            </div>
                                          </div>

                                          <div className="flex items-center justify-between gap-3 text-xs">
                                            <div className="max-w-[150px]">
                                              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">想定勉強時間 (分)</label>
                                              <input
                                                type="number"
                                                min={1}
                                                value={editFormMinutes}
                                                onChange={(e) => setEditFormMinutes(parseInt(e.target.value) || 45)}
                                                className="w-full bg-white border border-slate-200 text-xs py-2 px-3 rounded-lg font-bold focus:outline-none"
                                              />
                                            </div>

                                            <div className="flex gap-1.5 pt-4">
                                              <button
                                                onClick={() => setEditingTopicId(null)}
                                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-lg font-black text-[10px] cursor-pointer"
                                              >
                                                キャンセル
                                              </button>
                                              <button
                                                onClick={() => handleSaveInlineEdit(topic.id)}
                                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-black text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow"
                                              >
                                                <Save className="w-3.5 h-3.5" />
                                                保存(ID不変)
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        /* Default display card */
                                        <div>
                                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            {/* Details left */}
                                            <div className="space-y-1 select-text">
                                              <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="font-mono text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold tracking-wider border border-slate-200/40 shrink-0">
                                                  ID: {topic.id}
                                                </span>
                                                {stats.repetitionsCount > 0 && (
                                                  <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100/50 px-2 py-0.5 rounded-full font-black flex items-center gap-0.5 tracking-tight shrink-0 animate-pulse">
                                                    {stats.repetitionsCount}回転
                                                  </span>
                                                )}
                                              </div>
                                              
                                              <h4 className="font-sans font-extrabold text-slate-800 text-xs tracking-tight text-left">
                                                {topic.name}
                                              </h4>

                                              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                                                <span className="flex items-center gap-1">
                                                  <Clock className="w-3 h-3 text-slate-300" />
                                                  標準: {topic.estimatedMinutes || 45}分
                                                </span>
                                                {stats.totalMinutes > 0 && (
                                                  <span className="text-slate-500">
                                                    累積: {stats.totalMinutes}分
                                                  </span>
                                                )}
                                                {stats.lastEvaluation && (
                                                  <span className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
                                                    自己理解: {renderEvaluationBadge(stats.lastEvaluation)}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            {/* Actions Right */}
                                            <div className="flex items-center gap-1.5 justify-end shrink-0 select-none">
                                              {isEditingMode ? (
                                                <div className="flex items-center gap-1 bg-amber-50 rounded-lg p-0.5 border border-amber-200/60 font-black">
                                                  <button
                                                    onClick={() => handleStartEdit(topic)}
                                                    className="p-2 cursor-pointer text-amber-700 hover:bg-white rounded-md transition-all font-bold"
                                                    title="論点テキストの編集修正"
                                                  >
                                                    <Edit className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteTopic(topic.id)}
                                                    className="p-2 cursor-pointer text-rose-600 hover:bg-white rounded-md transition-all font-bold"
                                                    title="この論点を除外"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              ) : (
                                                <>
                                                  {onSelectTopicForTimer && (
                                                    <button
                                                      onClick={() => onSelectTopicForTimer(topic.id)}
                                                      className="px-3 py-1.5 hover:bg-indigo-600 hover:text-white border border-slate-200 text-indigo-600 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 hover:border-indigo-600"
                                                      title="論点タイマーへ転送して開始"
                                                    >
                                                      <Clock className="w-3.5 h-3.5" />
                                                      タイマー
                                                    </button>
                                                  )}

                                                  <button
                                                    onClick={() => {
                                                      if (isFormActive) {
                                                        setActiveFormTopicId(null);
                                                      } else {
                                                        setActiveFormTopicId(topic.id);
                                                        setDuration(topic.estimatedMinutes || 45);
                                                      }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-0.5 ${
                                                      isFormActive 
                                                        ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                                                        : 'bg-slate-900 border border-slate-900 text-white hover:bg-slate-800'
                                                    }`}
                                                  >
                                                    手動記録
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </div>

                                          {/* In-line record form popup */}
                                          {isFormActive && (
                                            <form
                                              onSubmit={(e) => handleManualSubmit(e, topic.id)}
                                              className="mt-3.5 p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-4 max-w-lg shadow-inner text-[11px]"
                                            >
                                              <p className="font-extrabold text-slate-700 text-left">実勉強実績の直打ち保存: {topic.name}</p>
                                              
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">
                                                    実際の勉強時間 (分経過)
                                                  </label>
                                                  <input
                                                    type="number"
                                                    min="1"
                                                    value={duration}
                                                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                                    className="w-full rounded-lg bg-white border border-slate-200 py-1.5 px-3 focus:outline-indigo-600 font-bold"
                                                  />
                                                </div>

                                                <div>
                                                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">
                                                    自己理解度の三択（志・進に連動）
                                                  </label>
                                                  <div className="grid grid-cols-3 gap-1">
                                                    {(['good', 'average', 'poor'] as const).map(lev => (
                                                      <button
                                                        key={lev}
                                                        type="button"
                                                        onClick={() => setEvaluation(lev)}
                                                        className={`py-1.5 text-[9px] font-black rounded-lg border transition-all cursor-pointer ${
                                                          evaluation === lev
                                                            ? lev === 'good'
                                                              ? 'bg-emerald-500 text-white border-emerald-500'
                                                              : lev === 'average'
                                                              ? 'bg-amber-500 text-white border-amber-500'
                                                              : 'bg-rose-500 text-white border-rose-500'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                      >
                                                        {lev === 'good' ? '◯ 優良' : lev === 'average' ? '△ 微妙' : '✕ やばい'}
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>

                                              <div>
                                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">
                                                  間違いポイント・自己戒めメモ
                                                </label>
                                                <input
                                                  type="text"
                                                  placeholder="例: 有形固定資産買換え時の仕訳が弱い。部分時価評価に注意。"
                                                  value={note}
                                                  onChange={(e) => setNote(e.target.value)}
                                                  className="w-full rounded-lg bg-white border border-slate-200 py-2 px-3 focus:outline-indigo-600"
                                                />
                                              </div>

                                              <div className="flex justify-end gap-2 text-[10px] font-bold">
                                                <button
                                                  type="button"
                                                  onClick={() => setActiveFormTopicId(null)}
                                                  className="px-3 py-1 cursor-pointer text-slate-500 hover:bg-slate-100 rounded-lg"
                                                >
                                                  閉じる
                                                </button>
                                                <button
                                                  type="submit"
                                                  className="px-4 py-1.5 cursor-pointer bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg transition-all shadow"
                                                >
                                                  実績保存
                                                </button>
                                              </div>
                                            </form>
                                          )}

                                          {/* Mini history list timeline */}
                                          {stats.records.length > 0 && (
                                            <div className="mt-2 pl-3 border-l-2 border-indigo-100 space-y-1 text-left select-text">
                                              <span className="text-[8px] font-bold text-slate-405 uppercase tracking-wider block">最近のCPA回転実績:</span>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                                                {stats.records.slice().reverse().slice(0, 3).map(rec => (
                                                  <div 
                                                    key={rec.historyId} 
                                                    className="flex items-center justify-between bg-slate-50 py-1 px-2.5 rounded-md border border-slate-100 text-[9px] hover:bg-slate-100/50"
                                                  >
                                                    <div className="flex items-center gap-1.5 truncate flex-1">
                                                      {renderEvaluationBadge(rec.evaluation)}
                                                      <span className="font-bold text-slate-600">{rec.date}</span>
                                                      <span className="text-slate-400 font-bold shrink-0">{rec.duration}分</span>
                                                      {rec.note && (
                                                        <span className="text-slate-400 font-medium truncate italic shrink-0 max-w-[80px]" title={rec.note}>
                                                          - {rec.note}
                                                        </span>
                                                      )}
                                                    </div>
                                                    <button
                                                      onClick={() => {
                                                        if (window.confirm('この履歴を削除しますか？')) {
                                                          onDeleteHistory(rec.historyId);
                                                        }
                                                      }}
                                                      className="p-0.5 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer shrink-0 ml-1"
                                                    >
                                                      <Trash className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
