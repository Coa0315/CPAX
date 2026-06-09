/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Upload, Trash2, Database, AlertCircle, CheckCircle, Flame } from 'lucide-react';
import { CpaxBackupFormat, initializeCpaxData } from '../types';

interface CpaxBackupProps {
  onDataRefresh: () => void;
}

export const CpaxBackup: React.FC<CpaxBackupProps> = ({ onDataRefresh }) => {
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const getStorageItem = <T,>(key: string, defaultValue: T): T => {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    try {
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  };

  const handleExport = () => {
    try {
      const backupData: CpaxBackupFormat = {
        cpax_study_mode: getStorageItem('cpax_study_mode', 'short'),
        cpax_master_contents: getStorageItem('cpax_master_contents', []),
        cpax_history: getStorageItem('cpax_history', []),
        cpax_schedules: getStorageItem('cpax_schedules', []),
        cpax_exam_reports: getStorageItem('cpax_exam_reports', []),
        cpax_framework: getStorageItem('cpax_framework', {
          soulMotivation: '',
          absolutePromise: '',
          milestones: { targetExamDate: '2026-12-13', targetExamTitle: '2026年12月 短答式試験', targetDailyStudyHours: 8, milestone6Months: '', milestone3Months: '' },
          priorityFocusList: []
        }),
        backupDate: new Date().toISOString(),
        appVersion: '1.0.0-CPAX'
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cpax_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({ text: 'バックアップの作成に成功しました。iPadのファイルApp等へ保存されました。', isError: false });
    } catch (e: any) {
      setStatusMessage({ text: `バックアップの作成に失敗しました: ${e.message}`, isError: true });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // Safety checks for base structure
        if (json.cpax_study_mode === undefined) {
          throw new Error('CPAXの有効なデータキーがみつかりません。');
        }

        localStorage.setItem('cpax_study_mode', JSON.stringify(json.cpax_study_mode));
        
        if (json.cpax_master_contents) {
          localStorage.setItem('cpax_master_contents', JSON.stringify(json.cpax_master_contents));
        }
        if (json.cpax_history) {
          localStorage.setItem('cpax_history', JSON.stringify(json.cpax_history));
        }
        if (json.cpax_schedules) {
          localStorage.setItem('cpax_schedules', JSON.stringify(json.cpax_schedules));
        }
        if (json.cpax_exam_reports) {
          localStorage.setItem('cpax_exam_reports', JSON.stringify(json.cpax_exam_reports));
        }
        if (json.cpax_framework) {
          localStorage.setItem('cpax_framework', JSON.stringify(json.cpax_framework));
        }

        setStatusMessage({ text: 'データのインポート・復元が完了しました！', isError: false });
        onDataRefresh();
      } catch (err: any) {
        setStatusMessage({ text: `復元に失敗しました。ファイルが破損しているか、CPAX形式ではありません。 (${err.message})`, isError: true });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('警告: すべての学習計画、タイマー実績履歴、答練復習反省シートが消去されます。本当によろしいですか？')) {
      localStorage.clear();
      initializeCpaxData();
      setStatusMessage({ text: 'データベースを完全初期化しました。', isError: false });
      onDataRefresh();
    }
  };

  const handleCompleteWipe = () => {
    if (window.confirm('【重要】警告: 初期設定されているすべての科目・目次リスト（財務、管理等）を含め、アプリ内のすべてのデータを完全にゼロ（白紙状態）にします。この操作は取り消せません。本当によろしいですか？')) {
      localStorage.clear();
      
      // Seed with strictly blank collections to ensure they don't auto-repopulate with defaults on next mount
      localStorage.setItem('cpax_study_mode', JSON.stringify('short'));
      localStorage.setItem('cpax_master_contents', JSON.stringify([]));
      localStorage.setItem('cpax_history', JSON.stringify([]));
      localStorage.setItem('cpax_schedules', JSON.stringify([]));
      localStorage.setItem('cpax_exam_reports', JSON.stringify([]));
      localStorage.setItem('cpax_subject_order', JSON.stringify([]));
      localStorage.setItem('cpax_target_date', JSON.stringify('2026-12-13'));
      localStorage.setItem('cpax_target_title', JSON.stringify(''));
      
      const freshFramework = {
        soulMotivation: '',
        absolutePromise: '',
        milestones: {
          targetExamDate: '2026-12-13',
          targetExamTitle: '',
          targetDailyStudyHours: 8,
          milestone6Months: '',
          milestone3Months: ''
        },
        priorityFocusList: []
      };
      localStorage.setItem('cpax_framework', JSON.stringify(freshFramework));

      setStatusMessage({ text: '初期論点目次も含め、すべてのアプリ内データを完全に消去し、真っ白な白紙状態（完全ゼロ）にリセットしました！', isError: false });
      onDataRefresh();
    }
  };

  const handleInjectMockData = () => {
    try {
      const sampleHistory = [
        {
          historyId: `hist-mock1`,
          topicId: 'far-c-001',
          date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
          duration: 45,
          evaluation: 'good',
          type: 'timer',
          note: '現金勘定と補助簿の差額原因を完璧に把握。'
        },
        {
          historyId: `hist-mock2`,
          topicId: 'far-c-005',
          date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
          duration: 75,
          evaluation: 'average',
          type: 'timer',
          note: '借手の第2法リース料支払い処理が遅い。要連動練習。'
        },
        {
          historyId: `hist-mock3`,
          topicId: 'ma-001',
          date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
          duration: 50,
          evaluation: 'good',
          type: 'manual',
          note: '賃率差異分析のボックス図を完全にマスター。'
        },
        {
          historyId: `hist-mock4`,
          topicId: 'aud-003',
          date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
          duration: 40,
          evaluation: 'poor',
          type: 'timer',
          note: '品質管理規定の監査役会への報告責任問題で失点。再確認必須。'
        },
        {
          historyId: `hist-mock5`,
          topicId: 'law-004',
          date: new Date().toISOString().split('T')[0],
          duration: 60,
          evaluation: 'good',
          type: 'timer',
          note: '取締役の利益相反取引。特別の利害関係についての決議要件暗記。'
        }
      ];

      const sampleSchedules = [
        {
          scheduleId: 'sched-mock1',
          topicId: 'far-c-006',
          title: '財務(計): 減損会計の解法見直し',
          date: new Date().toISOString().split('T')[0],
          category: 'study',
          completed: false,
          timeInput: '10:00'
        },
        {
          scheduleId: 'sched-mock2',
          topicId: 'ma-004',
          title: '管理(計): 総合原価計算仕損処理',
          date: new Date().toISOString().split('T')[0],
          category: 'study',
          completed: true,
          timeInput: '14:00'
        },
        {
          scheduleId: 'sched-mock3',
          title: '予備校の定期カウンセリング(自習室退出)',
          date: new Date().toISOString().split('T')[0],
          category: 'private',
          completed: false,
          timeInput: '18:00'
        },
        {
          scheduleId: 'sched-mock4',
          topicId: 'aud-006',
          title: '監査: 計画とリスクアプローチ確認',
          date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
          category: 'study',
          completed: false,
          timeInput: '09:00'
        }
      ];

      const sampleReports = [
        {
          reportId: 'rep-mock1',
          title: '第1回 短答式模擬答練',
          date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
          subject: '財務会計論',
          score: 124,
          maxScore: 200,
          evaluation: 'C',
          failurePatterns: ['問題文の但し書き読み飛ばし', '個別仕訳の貸借ミス', '時間配分オーバー'],
          analysis: '後半の個別仕訳で引っ掛け注意（決算日補正等）を見落とし。連結の税効果会計に時間をかけすぎた。',
          actionPlan: 'まずは基礎基準である、連結開始の取引を毎日1問スピード周回する。',
          isShortMode: true,
          scheduledReviewIds: []
        }
      ];

      const sampleFramework = {
        soulMotivation: '親や支援してくれている人に感謝を伝え、独立会計士として自立したキャリアの主導権を握る。30歳までに自分の事務所を持ってお金と時間の自由を得る！',
        absolutePromise: '毎日朝一番に電卓を叩き、自習室には一番のりする。直近の12月短答模試でA判定または290点以上を叩き出し、合格を現実にする！',
        milestones: {
          targetExamDate: '2026-12-13',
          targetExamTitle: '2026年12月 短答式試験',
          targetDailyStudyHours: 9,
          milestone6Months: '財務＆管理論点の個別論点周回(3回転終了。短答答練で正答率7割以上キープ。)',
          milestone3Months: '企業法・監査論の短答プロフェッショナルマスター答練にて全問暗記、模擬試験で安定的に総合280点を超える。'
        },
        priorityFocusList: [
          { id: 'f-1', topicId: 'far-c-012', taskDescription: '財務会計の収益認識基準をテキストの図と設例で完璧に解き切る', completed: true },
          { id: 'f-2', topicId: 'ma-007', taskDescription: '意思決定会計のNPV設備投資判定手順カードの作成と復習', completed: false },
          { id: 'f-3', topicId: 'law-004', taskDescription: '取締役の善管注意義務に関する論述フレーム暗記', completed: false }
        ]
      };

      localStorage.setItem('cpax_history', JSON.stringify(sampleHistory));
      localStorage.setItem('cpax_schedules', JSON.stringify(sampleSchedules));
      localStorage.setItem('cpax_exam_reports', JSON.stringify(sampleReports));
      localStorage.setItem('cpax_framework', JSON.stringify(sampleFramework));

      setStatusMessage({ text: '臨床テスト用の擬似実績データ（過去5日分の履歴、TODO、答練反省シート、志フレームワーク）を注入しました。即座にグラフ・実績履歴ツリーが反映されます！', isError: false });
      onDataRefresh();
    } catch (e: any) {
      setStatusMessage({ text: `データ注入に失敗しました: ${e.message}`, isError: true });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left" id="cpax-backup-panel">
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-black p-4 text-white flex items-center justify-between border-b border-indigo-950/40">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-indigo-400" />
          <div className="text-left">
            <h2 className="font-sans font-black text-sm sm:text-base tracking-tight leading-none">バックアップ ＆ データ管理</h2>
            <p className="text-[10px] text-indigo-200 mt-1 font-bold">iPad / PCローカル完結の信頼に足る絶対データセキュリティ</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {statusMessage && (
          <div className={`p-3 rounded-xl flex items-start gap-2.5 ${statusMessage.isError ? 'bg-rose-50 text-rose-800 border border-rose-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>
            {statusMessage.isError ? <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-600" /> : <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />}
            <span className="text-xs font-semibold">{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Export card */}
          <div className="border border-slate-100 rounded-xl p-4 hover:border-slate-300 transition-colors bg-slate-50/50 flex flex-col justify-between">
            <div>
              <span className="text-indigo-600 font-extrabold text-[8.5px] uppercase tracking-wider block mb-1">LOCAL EXPORT</span>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-1.5 font-sans tracking-tight">JSONバックアップの保存</h3>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed font-semibold">
                現在のすべての学習実績（タイマー履歴、計画、反省レポート、志）を単一のファイルにまとめてiPadに書き出します。端末の買い換えや、データの紛失対策に有効です。
              </p>
            </div>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs tracking-wider rounded-lg transition-all cursor-pointer shadow-sm active-scale"
            >
              <Download className="w-3.5 h-3.5" />
              iPadへJSONを保存する
            </button>
          </div>

          {/* Import card */}
          <div className="border border-slate-100 rounded-xl p-4 hover:border-slate-300 transition-colors bg-slate-50/50 flex flex-col justify-between">
            <div>
              <span className="text-blue-600 font-extrabold text-[8.5px] uppercase tracking-wider block mb-1">LOCAL LOAD & RESTORE</span>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-1.5 font-sans tracking-tight">バックアップの復元</h3>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed font-semibold">
                過去に保存した `.json` ファイルを読み込み、データを現在のCPAXに流し込みます。既存のデータは完全に上書きされますのでご注意ください。
              </p>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="cpax-file-import-input"
              />
              <label
                htmlFor="cpax-file-import-input"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wider rounded-lg transition-all cursor-pointer shadow-sm active-scale text-center block"
              >
                <Upload className="w-3.5 h-3.5 inline inline-block" />
                バックアップの復元を実行
              </label>
            </div>
          </div>
        </div>

        {/* Action Inject & Counter-Reversal Wipe */}
        <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row gap-4 items-stretch justify-between">
          <div className="flex items-start gap-2.5 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100 flex-1">
            <Flame className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-left">
              <h4 className="text-xs font-black text-indigo-900 leading-none">お試しデータ注入 vs 完全ゼロ白紙化</h4>
              <p className="text-[11px] text-indigo-700 leading-normal mt-1.5 font-semibold">
                お試し用擬似実績セット（履歴、答練復習反省シート、志フレームワークなど）を一発で注入するボタンと、その逆である<b>「最初から組み込まれている目次リストすらすべて完全に空・真っ白な白紙（ゼロクリア）」にするリセットボタン</b>の選択エリアです。本番運用に入りたい方は「完全にゼロ（白紙状態）にする」を実行してください。
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0 justify-center">
            <button
              onClick={handleInjectMockData}
              className="px-4 py-2.5 cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] rounded-lg shadow-sm active-scale text-center border border-slate-900 transition-all flex items-center justify-center gap-1.5"
            >
              🚀 お試しデータを注入する
            </button>
            <button
              onClick={handleCompleteWipe}
              className="px-4 py-2.5 cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[11px] rounded-lg shadow-sm active-scale text-center border border-rose-200 transition-all flex items-center justify-center gap-1.5"
            >
              🗑️ アプリのデータを完全にゼロ（白紙）にする
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <div className="text-left">
            <h4 className="text-xs font-extrabold text-slate-700 leading-none">データの部分初期化</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">学習データ、タイマー履歴等の入力情報のみをリセットし、デフォルトの論点目次アコーディオンは保持した状態に戻します。</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-extrabold text-amber-600 hover:text-amber-800 transition-colors py-1.5 px-3 hover:bg-amber-50 rounded-lg cursor-pointer active-scale shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            入力データのみ初期化
          </button>
        </div>
      </div>
    </div>
  );
};
