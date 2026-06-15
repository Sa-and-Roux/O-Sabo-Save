import React, { useRef, useState } from 'react';
import { exportData, importData } from '../utils/exportImport';
import { Download, Upload, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    try {
      await exportData();
      setMessage('バックアップの保存が完了しました！');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('保存に失敗しました。');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const confirmImport = window.confirm('現在のデータは全て上書きされます。よろしいですか？');
    if (!confirmImport) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      await importData(file);
      setMessage('データの復元が完了しました！');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('復元に失敗しました。ファイル形式を確認してください。');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <h2 className="mb-4">設定 ⚙️</h2>
      
      <div className="card">
        <h3 className="mb-4">データのバックアップ・復元</h3>
        <p className="text-muted mb-4">
          データはブラウザ内に保存されています。端末を変更する場合や、念のためのバックアップとして、JSONファイルでの保存・復元が可能です。
        </p>

        {message && (
          <div className="mb-4" style={{padding: '12px', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', borderLeft: '4px solid var(--color-primary)'}}>
            {message}
          </div>
        )}

        <div className="flex gap-4 flex-col">
          <div className="flex gap-4 flex-wrap">
            <button onClick={handleExport} className="btn">
              <Download size={20} /> バックアップを保存 (JSON)
            </button>
            <button onClick={async () => {
              try {
                const { exportCSV } = await import('../utils/exportImport');
                await exportCSV();
                setMessage('CSVの出力が完了しました！');
                setTimeout(() => setMessage(''), 3000);
              } catch(e) {
                setMessage('CSVの出力に失敗しました。');
              }
            }} className="btn btn-secondary">
              <Download size={20} /> Excel用に出力 (CSV)
            </button>
          </div>
          
          <div style={{marginTop: '16px', borderTop: '2px dashed var(--color-border)', paddingTop: '16px'}}>
            <p className="text-muted mb-2 flex items-center gap-2">
              <AlertTriangle size={16} color="var(--color-danger)" />
              復元すると、現在のデータは全て上書きされます。
            </p>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              style={{display: 'none'}} 
              onChange={handleImport}
            />
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline" style={{borderColor: 'var(--color-danger)', color: 'var(--color-danger)'}}>
              <Upload size={20} /> データを復元する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
