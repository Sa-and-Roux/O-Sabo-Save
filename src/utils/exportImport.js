import { db } from '../db/db';

export const exportData = async () => {
  const contacts = await db.contacts.toArray();
  const gift_records = await db.gift_records.toArray();
  const data = {
    contacts,
    gift_records,
    version: 1,
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `osabo_save_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.contacts || !data.gift_records) {
          throw new Error('バックアップファイルの形式が正しくありません');
        }
        
        await db.transaction('rw', db.contacts, db.gift_records, async () => {
          await db.contacts.clear();
          await db.gift_records.clear();
          
          if (data.contacts.length > 0) {
            await db.contacts.bulkAdd(data.contacts);
          }
          if (data.gift_records.length > 0) {
            await db.gift_records.bulkAdd(data.gift_records);
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

export const exportCSV = async () => {
  const contacts = await db.contacts.toArray();
  const gift_records = await db.gift_records.toArray();
  
  // CSV Header
  const headers = ['人物ID', '氏名', '郵便番号', '住所', '誕生日', '年賀状', 'メモ', '贈答日', 'もらった/あげた', '種類', '品物名', '金額', 'ステータス'];
  
  let csvContent = headers.join(',') + '\n';
  
  contacts.forEach(contact => {
    const records = gift_records.filter(g => g.contact_id === contact.id);
    
    const baseCols = [
      contact.id,
      `"${(contact.name || '').replace(/"/g, '""')}"`,
      `"${(contact.postal_code || '').replace(/"/g, '""')}"`,
      `"${(contact.address || '').replace(/"/g, '""')}"`,
      `"${(contact.birthday || '').replace(/"/g, '""')}"`,
      `"${(contact.nengajo_status || '').replace(/"/g, '""')}"`,
      `"${(contact.personal_memo || '').replace(/"/g, '""')}"`
    ];

    if (records.length === 0) {
      csvContent += baseCols.join(',') + ',,,,,,\n';
    } else {
      records.forEach(g => {
        const row = [
          ...baseCols,
          `"${g.event_date || ''}"`,
          g.direction === 'RECEIVED' ? 'もらった' : 'あげた',
          `"${(g.season_type || '').replace(/"/g, '""')}"`,
          `"${(g.item_name || '').replace(/"/g, '""')}"`,
          g.amount || 0,
          `"${g.status || ''}"`
        ];
        csvContent += row.join(',') + '\n';
      });
    }
  });
  
  // BOM to force Excel to open in UTF-8
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `osabosave_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
