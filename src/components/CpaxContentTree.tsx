/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CPAX Accountant Study Suite - Master Syllabus Tree Component
 * Fully developed offline-first iPad Optimized React Module
 */

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Search, CheckCircle, Calendar, Plus, Clock, 
  ChevronDown, ChevronRight, Trash, Edit, Save, X, 
  UploadCloud, Settings2, Trash2, HelpCircle, Sliders, ArrowUp, ArrowDown
} from 'lucide-react';
import { CpaxTopic, CpaxHistoryItem } from '../types';

interface CpaxContentTreeProps {
  topics: CpaxTopic[];
  history: CpaxHistoryItem[];
  currentMode: 'short' | 'essay';
  onAddHistory: (topicId: string, duration: number, evaluation: 'good' | 'average' | 'poor', note: string) => void;
  onDeleteHistory: (historyId: string) => void;
  onSelectTopicForTimer?: (topicId: string) => void;
  onUpdateTopics: (newTopics: CpaxTopic[]) => void;
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
  // Search and Filter criteria
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Custom Subject order and addition
  const [subjectOrder, setSubjectOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cpax_subject_order');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading subjectOrder from LS:', e);
    }
    return [
      '財務会計論(計算)',
      '財務会計論(理論)',
      '管理会計論',
      '監査論',
      '企業法',
      '租税法',
      '経営学'
    ];
  });
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState('');

  // Accordion Expand/Collapse States
  // Level 1: Subjects (財務会計、監査 etc)
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  // Level 2: Textbooks (テキスト1、テキスト2 etc)
  const [expandedTextbooks, setExpandedTextbooks] = useState<Record<string, boolean>>({});
  // Level 3: Chapters/Categories (リース会計、第1章 etc)
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Active form for manually records
  const [activeFormTopicId, setActiveFormTopicId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(45);
  const [evaluation, setEvaluation] = useState<'good' | 'average' | 'poor'>('good');
  const [note, setNote] = useState('');

  // Bulk Import Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importDefaultSubject, setImportDefaultSubject] = useState('財務会計論(計算)');
  const [importDefaultTextbook, setImportDefaultTextbook] = useState('テキスト1');

  // Interactive Inline Edit States (Resilient to IDs)
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormTextbook, setEditFormTextbook] = useState('');
  const [editFormCategory, setEditFormCategory] = useState('');
  const [editFormMinutes, setEditFormMinutes] = useState(45);

  // Self-made safe inline deletion confirmation to bypass iPad browser iframe restrictions
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  // Manual New Item insertion form states
  const [activeAddTopicInChapter, setActiveAddTopicInChapter] = useState<{ subject: string, textbook: string, category: string } | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicMinutes, setNewTopicMinutes] = useState(45);

  // Manual Chapter / Textbook insertion form states
  const [activeAddChapterInTextbook, setActiveAddChapterInTextbook] = useState<string | null>(null); // subject::textbook
  const [newChapterName, setNewChapterName] = useState('');

  const [activeAddTextbookInSubject, setActiveAddTextbookInSubject] = useState<string | null>(null); // subject
  const [newTextbookName, setNewTextbookName] = useState('');

  // 1. DYNAMIC FILTER ENGINE WITH ABSOLUTE SHORT MODE EXCLUSION
  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      // Short mode core filter mask
      if (currentMode === 'short') {
        if (t.isEssayOnly || t.subject === '租税法' || t.subject === '経営学') {
          return false;
        }
      }
      
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.textbook || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchSubject = selectedSubject === 'all' || t.subject === selectedSubject;
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;

      return matchSearch && matchSubject && matchCategory;
    });
  }, [topics, currentMode, searchQuery, selectedSubject, selectedCategory]);

  // Custom Subject helper functions
  const saveSubjectOrder = (newOrder: string[]) => {
    setSubjectOrder(newOrder);
    localStorage.setItem('cpax_subject_order', JSON.stringify(newOrder));
  };

  const handleAddCustomSubject = () => {
    const trimmed = newSubjectInput.trim();
    if (!trimmed) return;
    if (subjectOrder.includes(trimmed)) {
      alert('その科目はすでにカスタム登録されています。');
      return;
    }
    const updated = [...subjectOrder, trimmed];
    saveSubjectOrder(updated);
    setNewSubjectInput('');
  };

  const handleMoveSubjectUp = (index: number) => {
    if (index === 0) return;
    const updated = [...subjectOrder];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    saveSubjectOrder(updated);
  };

  const handleMoveSubjectDown = (index: number) => {
    if (index === subjectOrder.length - 1) return;
    const updated = [...subjectOrder];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    saveSubjectOrder(updated);
  };

  const handleDeleteSubject = (sub: string) => {
    const topicsCount = topics.filter(t => t.subject === sub).length;
    if (topicsCount > 0) {
      if (!window.confirm(`「${sub}」科目には現在 ${topicsCount} 個の論点が登録されています。科目を削除すると、所属するすべての学習論点データが完全消去されます。よろしいですか？`)) {
        return;
      }
      const updatedTopics = topics.filter(t => t.subject !== sub);
      onUpdateTopics(updatedTopics);
    }
    const updatedOrder = subjectOrder.filter(s => s !== sub);
    saveSubjectOrder(updatedOrder);
  };

  // Derived available Subject tags sorted by custom subjectOrder
  const availableSubjects = useMemo(() => {
    // Collect all subjects that currently exist in topics
    const activeSubjectsInTopics = Array.from(new Set(topics.map(t => t.subject)));
    
    // Union both predefined order subjects and any newly added ones
    const allKnownSubjects = Array.from(new Set([...subjectOrder, ...activeSubjectsInTopics]));

    const activeAndPredefined = allKnownSubjects.filter(sub => 
      subjectOrder.includes(sub) || activeSubjectsInTopics.includes(sub)
    );

    // Sort based on the index in subjectOrder
    const sorted = [...activeAndPredefined].sort((a, b) => {
      const idxA = subjectOrder.indexOf(a);
      const idxB = subjectOrder.indexOf(b);
      const valA = idxA === -1 ? 999999 : idxA;
      const valB = idxB === -1 ? 999999 : idxB;
      return valA - valB;
    });

    if (currentMode === 'short') {
      return sorted.filter(sub => sub !== '租税法' && sub !== '経営学');
    }
    return sorted;
  }, [topics, currentMode, subjectOrder]);

  // Derived Chapter options based on current filter state
  const availableCategories = useMemo(() => {
    const matched = topics.filter(t => {
      if (currentMode === 'short') {
        return !t.isEssayOnly && t.subject !== '租税法' && t.subject !== '経営学';
      }
      return true;
    });
    return Array.from(new Set(matched.map(t => t.category)));
  }, [topics, currentMode]);

  // Derived unique Textbook names based on topics list
  const existingTextbooks = useMemo(() => {
    return Array.from(new Set(topics.map(t => t.textbook || 'テキスト1'))).filter(Boolean);
  }, [topics]);

  // 2. QUADRUPLE DATA HIERARCHY STRUCTURE GENERATOR
  // Groupings layout: Subject -> Textbook -> Chapter (Category) -> Topics Array
  const structuredData = useMemo(() => {
    const groupings: Record<string, Record<string, Record<string, CpaxTopic[]>>> = {};
    
    filteredTopics.forEach(t => {
      const subj = t.subject;
      const tbook = t.textbook?.trim() || 'テキスト1';
      const cat = t.category?.trim() || '基本目次';

      if (!groupings[subj]) {
        groupings[subj] = {};
      }
      if (!groupings[subj][tbook]) {
        groupings[subj][tbook] = {};
      }
      if (!groupings[subj][tbook][cat]) {
        groupings[subj][tbook][cat] = [];
      }
      groupings[subj][tbook][cat].push(t);
    });

    return groupings;
  }, [filteredTopics]);

  // Collapsible toggle handlers
  const toggleSubject = (sub: string) => {
    setExpandedSubjects(prev => ({ ...prev, [sub]: prev[sub] === false ? true : false }));
  };

  const toggleTextbook = (sub: string, tbook: string) => {
    const key = `${sub}::${tbook}`;
    setExpandedTextbooks(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));
  };

  const toggleChapter = (sub: string, tbook: string, cat: string) => {
    const key = `${sub}::${tbook}::${cat}`;
    setExpandedChapters(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));
  };

  // Rotation Statistics calculator for a given ID
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

  // Save manual review logs
  const handleManualSubmit = (e: React.FormEvent, topicId: string) => {
    e.preventDefault();
    if (duration <= 0) return;
    onAddHistory(topicId, duration, evaluation, note);
    setActiveFormTopicId(null);
    setNote('');
  };

  // 3. SECURE INDENTATION PARSER FOR USER SPECIFIED CPAX SCHEMAPackages
  const handleParseAndImport = () => {
    if (!importText.trim()) {
      alert('インポートする目次内容を入力してください。');
      return;
    }

    const rawLines = importText.split('\n');
    let currentSubject = importDefaultSubject;
    let currentTextbook = importDefaultTextbook.trim() || 'テキスト1';
    
    interface ParsedItem {
      indent: number;
      cleanLine: string;
    }
    
    const parsedLines: ParsedItem[] = [];
    rawLines.forEach(line => {
      let indentWeight = 0;
      let i = 0;
      while (i < line.length) {
        if (line[i] === '　') {
          indentWeight += 1;
          i++;
        } else if (line[i] === '\t') {
          indentWeight += 1;
          i++;
        } else if (line[i] === ' ' && line[i+1] === ' ') {
          indentWeight += 1;
          i += 2;
        } else if (line[i] === ' ') {
          indentWeight += 0.5;
          i++;
        } else {
          break;
        }
      }
      const indent = Math.floor(indentWeight);
      const cleanLine = line.substring(i).trim();
      if (cleanLine) {
        parsedLines.push({ indent, cleanLine });
      }
    });

    const parsedTopics: CpaxTopic[] = [];
    const skipSubjects = currentMode === 'short' ? ['租税法', '経営学'] : [];

    // Group lines by Chapters.
    // A Chapter starts at indent 0 (unless it's an explicit Subject or Textbook override).
    interface ChapterBlock {
      chapterName: string;
      lines: ParsedItem[];
    }

    const chapters: ChapterBlock[] = [];
    let currentChapterBlock: ChapterBlock | null = null;

    const knownSubjects = [
      '財務会計論(計算)', '財務会計論（計算）', '財務会計論(理論)', '財務会計論（理論）',
      '管理会計論', '監査論', '企業法', '租税法', '経営学'
    ];

    parsedLines.forEach(item => {
      const matchedSub = knownSubjects.find(s => 
        item.cleanLine === s || item.cleanLine.replace(/[（）]/g, '()') === s
      );

      if (item.indent === 0) {
        if (matchedSub) {
          currentSubject = matchedSub.replace('（', '(').replace('）', ')');
        } else if (item.cleanLine.startsWith('テキスト') || item.cleanLine.includes('講義')) {
          currentTextbook = item.cleanLine;
        } else {
          // Chapter
          currentChapterBlock = {
            chapterName: item.cleanLine,
            lines: []
          };
          chapters.push(currentChapterBlock);
        }
      } else {
        if (!currentChapterBlock) {
          currentChapterBlock = {
            chapterName: '基本目次',
            lines: []
          };
          chapters.push(currentChapterBlock);
        }
        currentChapterBlock.lines.push(item);
      }
    });

    chapters.forEach(block => {
      const chapterName = block.chapterName;
      // To satisfy user rule:
      // ・節（第1節など）※もし目次にあれば：全角スペース1個（1マス）
      // Check if there is a section in indent === 1
      const hasSectionInBlock = block.lines.some(item => 
        item.indent === 1 && 
        (item.cleanLine.startsWith('第') && (item.cleanLine.includes('節') || item.cleanLine.includes('講') || item.cleanLine.includes('項')))
      );

      let currentSection = '';

      block.lines.forEach(item => {
        if (hasSectionInBlock) {
          // If there is a section header:
          // indent === 1 and resembles section is a Section!
          const isSectionLine = item.indent === 1 && 
            (item.cleanLine.startsWith('第') && (item.cleanLine.includes('節') || item.cleanLine.includes('講') || item.cleanLine.includes('項')));
          
          if (isSectionLine) {
            currentSection = item.cleanLine;
          } else if (item.indent >= 1) {
            // Detailed problem (normally at 2 spaces, but process any non-section indent as sub-item)
            const finalCategory = currentSection ? `${chapterName} ${currentSection}` : chapterName;
            if (!skipSubjects.includes(currentSubject)) {
              parsedTopics.push({
                id: `cpt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                subject: currentSubject,
                textbook: currentTextbook,
                category: finalCategory,
                name: item.cleanLine,
                estimatedMinutes: 45,
                isEssayOnly: currentSubject === '租税法' || currentSubject === '経営学' ? true : undefined
              });
            }
          }
        } else {
          // If there are no sections:
          // any item with indent >= 1 is a detail/problem under the chapter!
          if (item.indent >= 1) {
            if (!skipSubjects.includes(currentSubject)) {
              parsedTopics.push({
                id: `cpt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                subject: currentSubject,
                textbook: currentTextbook,
                category: chapterName,
                name: item.cleanLine,
                estimatedMinutes: 45,
                isEssayOnly: currentSubject === '租税法' || currentSubject === '経営学' ? true : undefined
              });
            }
          }
        }
      });
    });

    if (parsedTopics.length === 0) {
      alert('パース成功件数は0件でした。スペースインデント構造（科目/テキスト/章/問題）をご確認ください。');
      return;
    }

    // Merge validation packages
    let updatedTopics: CpaxTopic[] = [];
    if (importMode === 'replace') {
      if (currentMode === 'short') {
        const otherSubjects = topics.filter(t => t.subject === '租税法' || t.subject === '経営学');
        updatedTopics = [...otherSubjects, ...parsedTopics];
      } else {
        updatedTopics = parsedTopics;
      }
    } else {
      updatedTopics = [...topics, ...parsedTopics];
    }

    onUpdateTopics(updatedTopics);
    setImportText('');
    setShowImportModal(false);
    alert(`${parsedTopics.length}件の論点をCPAXマスターとしてマージ＆同期しました！`);
  };

  // 4. MANUAL TOPIC MANIPULATORS
  const handleAddNewTopic = (subject: string, textbook: string, category: string) => {
    if (!newTopicName.trim()) return;

    const freshTopic: CpaxTopic = {
      id: `cpt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subject,
      textbook,
      category,
      name: newTopicName.trim(),
      estimatedMinutes: newTopicMinutes
    };

    onUpdateTopics([...topics, freshTopic]);
    setNewTopicName('');
    setActiveAddTopicInChapter(null);
  };

  const handleAddNewChapter = (subject: string, textbook: string) => {
    if (!newChapterName.trim()) return;

    // Create a default initial chapter starter
    const freshTopic: CpaxTopic = {
      id: `cpt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subject,
      textbook,
      category: newChapterName.trim(),
      name: '（初期登録論点）ここへ復習論点を追加してください',
      estimatedMinutes: 45
    };

    onUpdateTopics([...topics, freshTopic]);
    setNewChapterName('');
    setActiveAddChapterInTextbook(null);
  };

  const handleAddNewTextbook = (subject: string) => {
    if (!newTextbookName.trim()) return;

    // Create textbook with initial basic outline starter
    const freshTopic: CpaxTopic = {
      id: `cpt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subject,
      textbook: newTextbookName.trim(),
      category: '第1章 基本講義・論点一覧',
      name: '（初期登録論点）ここへ復習論点を追加してください',
      estimatedMinutes: 45
    };

    onUpdateTopics([...topics, freshTopic]);
    setNewTextbookName('');
    setActiveAddTextbookInSubject(null);
  };

  // 5. INLINE EDIT / DELETION SYNCHRONIZER
  const handleStartEdit = (topic: CpaxTopic) => {
    setEditingTopicId(topic.id);
    setEditFormName(topic.name);
    setEditFormTextbook(topic.textbook || 'テキスト1');
    setEditFormCategory(topic.category);
    setEditFormMinutes(topic.estimatedMinutes || 45);
  };

  const handleSaveInlineEdit = (id: string) => {
    if (!editFormName.trim() || !editFormCategory.trim() || !editFormTextbook.trim()) return;

    const updated = topics.map(t => {
      if (t.id === id) {
        return {
          ...t,
          name: editFormName.trim(),
          textbook: editFormTextbook.trim(),
          category: editFormCategory.trim(),
          estimatedMinutes: editFormMinutes
        };
      }
      return t;
    });

    onUpdateTopics(updated);
    setEditingTopicId(null);
  };

  // Safe inner delete action
  const handleDeleteConfirm = (id: string) => {
    const updated = topics.filter(t => t.id !== id);
    onUpdateTopics(updated);
    if (deletingTopicId === id) {
      setDeletingTopicId(null);
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
    <div className="space-y-6 text-left font-sans animate-fade-in" id="cpax-content-tree-view">
      
      {/* Search and Action Dashboard Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="論点名、テキスト名、各目次などから高速串刺し検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl pl-10 pr-4 py-3 placeholder:text-slate-400 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600/30 transition-all"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedCategory('all');
              }}
              className="w-full sm:w-44 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl px-3.5 py-3 text-xs font-black text-slate-700 focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">科目: すべて</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-44 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl px-3.5 py-3 text-xs font-black text-slate-700 focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">各目次: すべて</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Administration control switches */}
        <div className="flex items-center gap-2 shrink-0 md:border-l md:border-slate-100 md:pl-4">
          <button
            onClick={() => {
              setShowSubjectManager(!showSubjectManager);
              setIsEditingMode(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-3 cursor-pointer rounded-2xl text-xs font-extrabold transition-all border ${
              showSubjectManager 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-md scale-95' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            科目設定
          </button>

          <button
            onClick={() => {
              setIsEditingMode(!isEditingMode);
              setShowSubjectManager(false);
              setEditingTopicId(null);
              setDeletingTopicId(null);
            }}
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

      {/* SUBJECT MANAGER AREA */}
      {showSubjectManager && (
        <div className="bg-white border border-slate-205 rounded-3xl p-5 space-y-4 shadow-sm animate-scale-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-sans font-black text-slate-900 text-xs uppercase tracking-tight">CPAX 科目マスタ設定 ＆ 並び替え</h4>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">科目の新規追加や、矢印ボタン（▲ ▼）による目次表示順のカスタム並べ替えが可能です。</p>
            </div>
            <button 
              onClick={() => setShowSubjectManager(false)}
              className="text-slate-400 hover:text-slate-600 text-xs p-1 font-bold"
            >
              閉じる
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Subject Addition */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">新規科目の登録</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="例: 管理会計論(理論)、選択科目の追加..."
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  className="bg-white border border-slate-200 text-xs py-2 px-3.5 rounded-xl font-bold flex-1 focus:outline-none focus:border-indigo-600 text-slate-750"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCustomSubject();
                  }}
                />
                <button
                  onClick={handleAddCustomSubject}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-black rounded-xl cursor-pointer shadow active-scale"
                >
                  科目を登録
                </button>
              </div>
              <p className="text-[9px] text-slate-400 leading-normal">
                ※登録後、すぐに新しい科目に新しいテキスト・教材の章定義、問題を自由に追加することができます。
              </p>
            </div>

            {/* Subject Reordering */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">科目順序の変更 (全 {subjectOrder.length} 科目)</label>
              <div className="max-h-48 overflow-y-auto border border-slate-200 bg-white rounded-xl divide-y divide-slate-100">
                {subjectOrder.map((sub, idx) => {
                  const modeExcluded = currentMode === 'short' && (sub === '租税法' || sub === '経営学');
                  return (
                    <div key={sub} className="flex items-center justify-between p-2.5 hover:bg-slate-50/50">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 w-4 font-mono">{idx + 1}</span>
                        <span className={`text-xs font-black truncate ${modeExcluded ? 'text-slate-350 line-through' : 'text-slate-850'}`}>
                          {sub}
                        </span>
                        {modeExcluded && (
                          <span className="text-[8px] font-black bg-slate-150/50 text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-md shrink-0">
                            短答非表示
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-0.5 rounded-lg border border-slate-150">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveSubjectUp(idx)}
                          className="p-1 px-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-white disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:bg-transparent rounded-md cursor-pointer transition-colors"
                          title="上に移動"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === subjectOrder.length - 1}
                          onClick={() => handleMoveSubjectDown(idx)}
                          className="p-1 px-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-white disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:bg-transparent rounded-md cursor-pointer transition-colors"
                          title="下に移動"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer ml-1 transition-colors"
                          title="この科目をマスターから消去"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THREE LAYER STRUCTURED COMPREHENSIVE TEXTBOOK IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            {/* Modal Head */}
            <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-900/30">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="w-6 h-6 text-indigo-400" />
                <div className="text-left font-sans">
                  <h3 className="font-sans font-black text-base tracking-tight">CPAX 3階層 新一括目次インポート</h3>
                  <p className="text-[10px] text-indigo-200">科目選択・テキスト名指定 ＆ 目次テキストコピペを一列に連動</p>
                </div>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-indigo-200" />
              </button>
            </div>

            {/* Modal Inner Options */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left text-xs">
              
              {/* Form options block */}
              <div className="bg-slate-50 border border-slate-150/70 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">【1】科目選択、または直接入力（必須）</label>
                  <div className="space-y-1.5 font-bold">
                    <select
                      value={availableSubjects.includes(importDefaultSubject) ? importDefaultSubject : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          setImportDefaultSubject(e.target.value);
                        }
                      }}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-650 rounded-xl px-3 py-2 font-bold text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-650/20 cursor-pointer"
                    >
                      <option value="">（リストから科目を選択）</option>
                      {availableSubjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={importDefaultSubject}
                      onChange={(e) => setImportDefaultSubject(e.target.value)}
                      placeholder="あるいは、新規科目を直接手入力..."
                      className="w-full bg-white border border-slate-200 focus:border-indigo-650 rounded-xl px-3.5 py-2 font-bold text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-650/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">【2】テキスト・講義名選択、または直接入力（必須）</label>
                  <div className="space-y-1.5 font-bold">
                    <select
                      value={existingTextbooks.includes(importDefaultTextbook) ? importDefaultTextbook : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          setImportDefaultTextbook(e.target.value);
                        }
                      }}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-650 rounded-xl px-3 py-2 font-bold text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-650/20 cursor-pointer"
                    >
                      <option value="">（リストから既存テキストを選択）</option>
                      {existingTextbooks.map(tb => (
                        <option key={tb} value={tb}>{tb}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={importDefaultTextbook}
                      onChange={(e) => setImportDefaultTextbook(e.target.value)}
                      placeholder="あるいは、新規テキスト名を直接手入力..."
                      className="w-full bg-white border border-slate-200 focus:border-indigo-650 rounded-xl px-3.5 py-2 font-bold text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-650/20"
                    />
                  </div>
                </div>
              </div>

              {/* Guidelines block */}
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-indigo-900 space-y-1.5 font-semibold">
                <p className="font-extrabold flex items-center gap-1.5 text-xs text-indigo-950">
                  <HelpCircle className="w-4.5 h-4.5 shrink-0 text-indigo-600" />
                  推奨目次テキスト貼り付けルール（スペースインデント）
                </p>
                <div className="text-[10.5px] text-indigo-850 space-y-1.5 leading-relaxed">
                  <p>行頭の全角スペース数に基づいて、章、節、問題をスマートに分類して登録します：</p>
                  <ul className="list-disc pl-4 space-y-1 text-[10px]">
                    <li><strong className="text-slate-900">全角スペース0個（0マス）</strong>：章見出し（例: <code className="bg-indigo-150/50 px-1 rounded">第1章 リース会計</code>）</li>
                    <li><strong className="text-slate-900">全角スペース1個（1マス）</strong>：節（例: <code className="bg-indigo-150/50 px-1 rounded">　第1節 分配可能額計算</code>）※目次にある場合</li>
                    <li><strong className="text-slate-900">問題や細目のインデント判定</strong>：
                      <ul className="list-circle pl-4 mt-0.5 space-y-0.5 text-slate-700">
                        <li>節がある場合：<strong className="text-slate-900">全角スペース2個（2マス）</strong>（例: <code className="bg-indigo-150/50 px-1 rounded">　　問題1 ...</code>）</li>
                        <li>節がない場合：<strong className="text-slate-900">全角スペース1個（1マス）</strong>（例: <code className="bg-indigo-150/50 px-1 rounded">　問題1 ...</code>）</li>
                      </ul>
                    </li>
                  </ul>
                  <p className="text-[9.5px] text-indigo-700 mt-1">※ タブ、半角スペース2個も、全角スペース1個分（1マス）のインデントとして判定されます。講義や教材でもスペース数で自動判定します。</p>
                </div>
              </div>

              <div className="grid grid-cols-1 shrink-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">既存リストへの統合処理モード</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`py-2 px-3.5 rounded-xl border font-bold text-center cursor-pointer transition-all text-xs ${
                      importMode === 'append' ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    既存に上書きせず追加（推奨）
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`py-2 px-3.5 rounded-xl border font-extrabold text-center cursor-pointer transition-all text-xs ${
                      importMode === 'replace' ? 'bg-rose-600 text-white border-rose-600 shadow' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    完全に全クリア＆差替（注意）
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">【3】各目次テキスト貼り付けエリア</label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="第1章 リース会計&#10;　p.①-1-5 問題1 借手の会計処理&#10;　p.①-1-9 問題2 転リース取引の判定"
                  rows={8}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-650 focus:bg-white rounded-2xl p-4 text-xs font-mono focus:outline-none font-medium whitespace-pre focus:ring-1 focus:ring-indigo-650/20"
                />
              </div>
            </div>

            {/* Modal Bottom control */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-bold font-sans">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all cursor-pointer text-slate-500 font-semibold"
              >
                キャンセル
              </button>
              <button
                onClick={handleParseAndImport}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md active-scale cursor-pointer flex items-center gap-1"
              >
                パースしてインポート実行
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE SYLLABUS LIST DISPLAY WITH 3-TIER COLLAPSIBLE SYSTEM */}
      <div className="space-y-4">
        {availableSubjects.map(subj => {
          const textbooksObj = structuredData[subj] || {};
          const textbooksList = Object.keys(textbooksObj);
          
          if (textbooksList.length === 0 && !isEditingMode) return null;

          const isSubExpanded = expandedSubjects[subj] !== false; // Default expanded
          const subjHistory = history.filter(h => {
            const matchTopObj = topics.find(t => t.id === h.topicId);
            return matchTopObj && matchTopObj.subject === subj;
          });
          const subjTotalHours = (subjHistory.reduce((s, h) => s + h.duration, 0) / 60).toFixed(1);

          return (
            <div key={subj} className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
              
              {/* LEVEL 1 HEADER - SUBJECT */}
              <div className="w-full p-5 bg-gradient-to-r from-slate-55 to-slate-100/55 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                <div 
                  onClick={() => toggleSubject(subj)}
                  className="flex items-center gap-3.5 cursor-pointer flex-1"
                >
                  <div className="p-3 bg-slate-900 text-indigo-400 rounded-2xl shadow">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans font-black text-slate-900 tracking-tight text-sm uppercase">{subj}</h3>
                      <span className="text-[9px] font-black bg-indigo-150/50 text-indigo-850 px-2 py-0.5 rounded-lg border border-indigo-100">CPAX</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      テキスト数: <span className="text-slate-700 font-extrabold">{textbooksList.length}個</span>
                      {' '}/ 実績: <span className="text-slate-700 font-extrabold">{subjTotalHours}時間</span>
                      {' '}(<span className="text-emerald-600 font-extrabold">{subjHistory.length}回転</span>)
                    </p>
                  </div>
                </div>

                {/* Level 1 Right action controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {isEditingMode && (
                    <button
                      onClick={() => {
                        if (activeAddTextbookInSubject === subj) {
                          setActiveAddTextbookInSubject(null);
                        } else {
                          setActiveAddTextbookInSubject(subj);
                          setNewTextbookName('');
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      新テキスト・講義の追加
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

              {/* LEVEL 1 MANUAL TEXTBOOK CREATION FORM */}
              {activeAddTextbookInSubject === subj && (
                <div className="p-5 border-b border-dashed border-slate-150 bg-indigo-50/25 text-left space-y-2">
                  <div className="max-w-md">
                    <label className="block text-[8px] font-black text-indigo-900 mb-1 leading-relaxed">新規登録するテキスト・講義名 (例: テキスト 1、管理論・補足講義)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="例: テキスト2..."
                        value={newTextbookName}
                        onChange={(e) => setNewTextbookName(e.target.value)}
                        className="bg-white border border-slate-200 text-xs py-2 px-3.5 rounded-xl font-bold flex-1 focus:outline-none focus:border-indigo-600 text-slate-755"
                      />
                      <button
                        onClick={() => handleAddNewTextbook(subj)}
                        className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-black rounded-xl cursor-pointer shadow active-scale"
                      >
                        追加
                      </button>
                      <button
                        onClick={() => setActiveAddTextbookInSubject(null)}
                        className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LEVEL 2 CHILDREN - TEXTBOOKS FOLDER CONTAINER */}
              {isSubExpanded && (
                <div className="divide-y divide-slate-100 bg-white">
                  {textbooksList.length === 0 ? (
                    <div className="p-10 text-center text-xs text-slate-400 select-none bg-slate-50/30">
                      テキストが登録されていません。右上の一括インポートを利用するか、「新テキスト・講義の追加」ボタンより手動で追加してください。
                    </div>
                  ) : (
                    textbooksList.map(tbookName => {
                      const categoriesObj = textbooksObj[tbookName] || {};
                      const categoriesList = Object.keys(categoriesObj);
                      const tbKey = `${subj}::${tbookName}`;
                      const isTbExpanded = expandedTextbooks[tbKey] !== false; // Default expanded

                      return (
                        <div key={tbookName} className="bg-slate-50/15">
                          
                          {/* LEVEL 2 HEADER - TEXTBOOKS COLLAPSIBLE FOLDER */}
                          <div className="p-4 bg-slate-100/30 shrink-0 flex items-center justify-between border-b border-slate-100">
                            <button
                              onClick={() => toggleTextbook(subj, tbookName)}
                              className="flex items-center gap-2.5 flex-1 text-left cursor-pointer"
                            >
                              {isTbExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                              )}
                              <span className="font-sans font-black text-slate-850 text-xs tracking-tight">
                                📖 {tbookName}
                              </span>
                              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                                {categoriesList.length}章 / 講
                              </span>
                            </button>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isEditingMode && (
                                <button
                                  onClick={() => {
                                    if (activeAddChapterInTextbook === tbKey) {
                                      setActiveAddChapterInTextbook(null);
                                    } else {
                                      setActiveAddChapterInTextbook(tbKey);
                                      setNewChapterName('');
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 rounded-lg text-[9px] font-extrabold cursor-pointer shadow-sm transition-all flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3 text-indigo-600" />
                                  章の追加
                                </button>
                              )}
                            </div>
                          </div>

                          {/* LEVEL 2 CHAPTER MANUALLY CREATION FORM */}
                          {activeAddChapterInTextbook === tbKey && (
                            <div className="p-4 mx-4 my-2 border border-dashed border-slate-200 rounded-2xl bg-indigo-50/15 text-left space-y-2">
                              <div className="max-w-md space-y-2">
                                <label className="block text-[8px] font-black text-indigo-900 leading-none">「{tbookName}」へ新規復習章カテゴリを追加</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="例: 第1章 計算構造・リース会計..."
                                    value={newChapterName}
                                    onChange={(e) => setNewChapterName(e.target.value)}
                                    className="bg-white border border-slate-200 text-xs py-1.5 px-3 rounded-lg font-bold flex-1 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleAddNewChapter(subj, tbookName)}
                                    className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-850 text-[10px] font-black rounded-lg cursor-pointer transition-all"
                                  >
                                    追加する
                                  </button>
                                  <button
                                    onClick={() => setActiveAddChapterInTextbook(null)}
                                    className="p-1 px-2 text-slate-400 hover:text-slate-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* LEVEL 3 CHILDREN - CHAPTER CELL ACCORDION */}
                          {isTbExpanded && (
                            <div className="divide-y divide-slate-100/60 bg-white ml-2 border-l border-slate-200/55">
                              {categoriesList.length === 0 ? (
                                <div className="p-8 text-center text-[10px] text-slate-400 font-medium select-none bg-white">
                                  章が登録されていません。編集モードから「章の追加」より定義してください。
                                </div>
                              ) : (
                                categoriesList.map(categoryName => {
                                  const listTopics = categoriesObj[categoryName] || [];
                                  const chKey = `${subj}::${tbookName}::${categoryName}`;
                                  const isChExpanded = expandedChapters[chKey] !== false;

                                  return (
                                    <div key={categoryName} className="space-y-0.5">
                                      
                                      {/* LEVEL 3 HEADER - CHAPTERS OF MASTER PLAN */}
                                      <div className="bg-slate-50/65 p-3.5 flex items-center justify-between border-b border-slate-100/80">
                                        <button
                                          onClick={() => toggleChapter(subj, tbookName, categoryName)}
                                          className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                                        >
                                          {isChExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-indigo-650" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-indigo-650" />
                                          )}
                                          <span className="font-sans font-black text-slate-800 text-xs tracking-tight">
                                            {categoryName}
                                          </span>
                                          <span className="text-[8.5px] font-black text-slate-400 bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded-full ml-1">
                                            {listTopics.length}件の復習対象
                                          </span>
                                        </button>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {isEditingMode && (
                                            <button
                                              onClick={() => {
                                                if (activeAddTopicInChapter?.category === categoryName && activeAddTopicInChapter?.textbook === tbookName && activeAddTopicInChapter?.subject === subj) {
                                                  setActiveAddTopicInChapter(null);
                                                } else {
                                                  setActiveAddTopicInChapter({ subject: subj, textbook: tbookName, category: categoryName });
                                                  setNewTopicName('');
                                                  setNewTopicMinutes(45);
                                                }
                                              }}
                                              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 rounded-lg text-[9px] font-black cursor-pointer shadow-sm transition-all flex items-center gap-1"
                                            >
                                              <Plus className="w-3 h-3 text-slate-550" />
                                              個別問題カードの追加
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* LEVEL 3 MANUAL TOPIC CREATION FORM */}
                                      {activeAddTopicInChapter?.category === categoryName && activeAddTopicInChapter?.textbook === tbookName && activeAddTopicInChapter?.subject === subj && (
                                        <div className="p-4 mx-4 border border-dashed border-slate-200 rounded-3xl bg-indigo-50/15 text-left space-y-3">
                                          <h5 className="text-[10px] font-black text-slate-700">「{categoryName}」へ新規単体問題セルを追加登録</h5>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">【論点・問題名称】</label>
                                              <input
                                                type="text"
                                                placeholder="例: p.1-9 問題1 リース料未払仕訳"
                                                value={newTopicName}
                                                onChange={(e) => setNewTopicName(e.target.value)}
                                                className="w-full bg-white border border-slate-200 text-xs py-2 px-3 rounded-lg font-bold focus:outline-none"
                                              />
                                            </div>
                                            <div className="flex items-end gap-2 text-xs">
                                              <div className="flex-1">
                                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">【目安復習標準時間】(分)</label>
                                                <input
                                                  type="number"
                                                  min={1}
                                                  value={newTopicMinutes}
                                                  onChange={(e) => setNewTopicMinutes(parseInt(e.target.value) || 45)}
                                                  className="w-full bg-white border border-slate-200 text-xs py-2 px-3 rounded-lg font-black focus:outline-none"
                                                />
                                              </div>
                                              <button
                                                onClick={() => handleAddNewTopic(subj, tbookName, categoryName)}
                                                className="px-4.5 py-2.5 bg-slate-900 text-white text-[10px] hover:bg-slate-800 font-black rounded-lg cursor-pointer shadow"
                                              >
                                                登録
                                              </button>
                                              <button
                                                onClick={() => setActiveAddTopicInChapter(null)}
                                                className="p-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg"
                                              >
                                                <X className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* LEVEL 4 CHILDREN - INDIVIDUAL STUDY TOPICS CARD */}
                                      {isChExpanded && (
                                        <div className="divide-y divide-slate-100 px-4 pb-2">
                                          {listTopics.length === 0 ? (
                                            <div className="py-5 text-center text-[10px] text-slate-300 font-bold select-none bg-slate-50/10 rounded-xl border border-dashed border-slate-100 mt-1">
                                              この章に登録された問題項目はありません。
                                            </div>
                                          ) : (
                                            listTopics.map(topic => {
                                              const stats = getTopicStats(topic.id);
                                              const isFormActive = activeFormTopicId === topic.id;
                                              const isEditingThisTopic = editingTopicId === topic.id;
                                              const isDeletingThisTopic = deletingTopicId === topic.id;

                                              return (
                                                <div key={topic.id} className="py-3 md:py-3.5 hover:bg-slate-50/50 rounded-xl transition-all px-3">
                                                  
                                                  {isEditingThisTopic ? (
                                                    
                                                    /* LEVEL 4 - INLINE EDIT PANEL FORM CARD */
                                                    <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl text-left space-y-3.5">
                                                      <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                                                        <span className="text-[8px] font-black tracking-widest text-indigo-700 bg-white border border-indigo-100 rounded px-1.5 py-0.5">
                                                          ID不変ポリシー継続中: {topic.id}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold">復習カードの修正</span>
                                                      </div>
                                                      
                                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
                                                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">所属テキスト</label>
                                                          <input
                                                            type="text"
                                                            value={editFormTextbook}
                                                            onChange={(e) => setEditFormTextbook(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 text-xs py-2 px-3 rounded-lg font-bold focus:outline-none"
                                                          />
                                                        </div>
                                                        <div>
                                                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">所属カテゴリ・章</label>
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
                                                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">標準学習時間 (分)</label>
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
                                                            保存
                                                          </button>
                                                        </div>
                                                      </div>
                                                    </div>

                                                  ) : isDeletingThisTopic ? (

                                                    /* LEVEL 4 - INLINE ABSOLUTE SAFE DELETE Confirmation to bypass iPad bugs */
                                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                                                      <div className="text-left select-none">
                                                        <p className="text-xs font-black text-rose-900">本当にこの論点項目をCPAXデータベースより除外しますか？</p>
                                                        <p className="text-[10px] text-rose-600 font-medium">※ 「{topic.name}」に関連するこれまでの復習ログ記録(回転数や自己理解度)も全て消去されます。</p>
                                                      </div>
                                                      <div className="flex items-center gap-2 font-sans shrink-0">
                                                        <button
                                                          onClick={() => setDeletingTopicId(null)}
                                                          className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold cursor-pointer"
                                                        >
                                                          キャンセル
                                                        </button>
                                                        <button
                                                          onClick={() => handleDeleteConfirm(topic.id)}
                                                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-extrabold cursor-pointer transition-all shadow-sm flex items-center gap-1"
                                                        >
                                                          <Trash2 className="w-3.5 h-3.5" />
                                                          完全に削除
                                                        </button>
                                                      </div>
                                                    </div>

                                                  ) : (

                                                    /* LEVEL 4 - STANDARD PROBLEM NODE CARD VIEW */
                                                    <div>
                                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                                                              <Clock className="w-3 h-3 text-slate-300 shrink-0" />
                                                              <span>標準:</span>
                                                              <input
                                                                type="number"
                                                                min="1"
                                                                max="999"
                                                                value={topic.estimatedMinutes === 0 ? "" : (topic.estimatedMinutes ?? 45)}
                                                                onChange={(e) => {
                                                                  const val = e.target.value;
                                                                  const mins = val === "" ? 0 : parseInt(val);
                                                                  const updated = topics.map(t => t.id === topic.id ? { ...t, estimatedMinutes: isNaN(mins) ? 0 : mins } : t);
                                                                  onUpdateTopics(updated);
                                                                }}
                                                                onBlur={() => {
                                                                  if (!topic.estimatedMinutes || topic.estimatedMinutes === 0) {
                                                                    const updated = topics.map(t => t.id === topic.id ? { ...t, estimatedMinutes: 45 } : t);
                                                                    onUpdateTopics(updated);
                                                                  }
                                                                }}
                                                                className="w-11 bg-slate-50 border border-slate-200 hover:bg-white focus:bg-white rounded px-1 py-0.5 text-center font-extrabold text-slate-800 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-650/20 transition-all cursor-pointer shrink-0"
                                                                title="標準学習時間をその場で直接変更"
                                                              />
                                                              <span>分</span>
                                                              {(topic.estimatedMinutes || 45) !== 45 && (
                                                                <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded ml-0.5 font-bold">カスタム</span>
                                                              )}
                                                            </span>
                                                            {stats.totalMinutes > 0 && (
                                                              <span className="text-slate-500">
                                                                累積: {stats.totalMinutes}分
                                                              </span>
                                                            )}
                                                            {stats.lastEvaluation && (
                                                              <span className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
                                                                理解度: {renderEvaluationBadge(stats.lastEvaluation)}
                                                              </span>
                                                            )}
                                                          </div>
                                                        </div>

                                                        {/* Actions Panel Right */}
                                                        <div className="flex items-center gap-1.5 justify-end shrink-0 select-none">
                                                          {isEditingMode ? (
                                                            <div className="flex items-center gap-1 bg-amber-50 rounded-lg p-0.5 border border-amber-200/60 font-black">
                                                              <button
                                                                onClick={() => handleStartEdit(topic)}
                                                                className="p-2 cursor-pointer text-amber-700 hover:bg-white rounded-md transition-all font-bold"
                                                                title="定義テキストの編集修正"
                                                              >
                                                                <Edit className="w-3.5 h-3.5" />
                                                              </button>
                                                              <button
                                                                onClick={() => setDeletingTopicId(topic.id)}
                                                                className="p-2 cursor-pointer text-rose-600 hover:bg-white rounded-md transition-all font-bold"
                                                                title="この論点・問題を削除"
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
                                                                  title="タイマーパネルへ連携"
                                                                >
                                                                  <Clock className="w-3.5 h-3.5" />
                                                                  集中
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

                                                      {/* Review log form drawer */}
                                                      {isFormActive && (
                                                        <form
                                                          onSubmit={(e) => handleManualSubmit(e, topic.id)}
                                                          className="mt-3.5 p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-4 max-w-lg shadow-inner text-[11px]"
                                                        >
                                                          <p className="font-extrabold text-slate-700 text-left">学習実績（回転記録）の保存: {topic.name}</p>
                                                          
                                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div>
                                                              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">
                                                                勉強時間の実時間 (分)
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
                                                                自己評価（合格基準）
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
                                                                    {lev === 'good' ? '◯ 優良' : lev === 'average' ? '△ 微妙' : '✕ 不安'}
                                                                  </button>
                                                                ))}
                                                              </div>
                                                            </div>
                                                          </div>

                                                          <div>
                                                            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">
                                                              間違い・復習チェックポイントのメモ
                                                            </label>
                                                            <input
                                                              type="text"
                                                              placeholder="例: 退職給付の数理差異の繰延処理において、遅延認識の按分期間の計算ミスに注意。"
                                                              value={note}
                                                              onChange={(e) => setNote(e.target.value)}
                                                              className="w-full rounded-lg bg-white border border-slate-200 py-2 px-3 focus:outline-indigo-600 text-slate-700 font-semibold"
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
                                                              className="px-4 py-1.5 cursor-pointer bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg transition-all shadow"
                                                            >
                                                              実績保存
                                                            </button>
                                                          </div>
                                                        </form>
                                                      )}

                                                      {/* Accumulated detailed review logs */}
                                                      {stats.records.length > 0 && (
                                                        <div className="mt-2 pl-3 border-l-2 border-indigo-100 space-y-1 text-left select-text">
                                                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">回転実績履歴:</span>
                                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                                                            {stats.records.slice().reverse().slice(0, 3).map(rec => (
                                                              <div 
                                                                key={rec.historyId} 
                                                                className="flex items-center justify-between bg-slate-50 py-1 px-2.5 rounded-md border border-slate-100 text-[9px] hover:bg-slate-100/50"
                                                              >
                                                                <div className="flex items-center gap-1.5 truncate flex-1 font-semibold text-slate-600">
                                                                  {renderEvaluationBadge(rec.evaluation)}
                                                                  <span className="font-bold text-slate-800">{rec.date}</span>
                                                                  <span className="text-slate-400 font-bold shrink-0">{rec.duration}分</span>
                                                                  {rec.note && (
                                                                    <span className="text-slate-400 font-medium truncate italic shrink-0 max-w-[80px]" title={rec.note}>
                                                                      - {rec.note}
                                                                    </span>
                                                                  )}
                                                                </div>
                                                                <button
                                                                  onClick={() => {
                                                                    if (window.confirm('この回転履歴を削除しますか？')) {
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
