import React from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertCircle, Cake } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  const contacts = useLiveQuery(() => db.contacts.toArray());
  const giftRecords = useLiveQuery(() => db.gift_records.toArray());

  const visibleContacts = contacts?.filter(c => !c.is_hidden) || [];
  const contactsCount = visibleContacts.length;
  
  const visibleContactIds = new Set(visibleContacts.map(c => c.id));
  const visibleGifts = giftRecords?.filter(g => visibleContactIds.has(g.contact_id)) || [];

  const pendingGifts = visibleGifts.filter(g => g.status === 'PENDING');
  
  // Calculate totals across all visible contacts
  const receivedGifts = visibleGifts.filter(g => g.direction === 'RECEIVED');
  const sentGifts = visibleGifts.filter(g => g.direction === 'SENT');

  const totalReceivedAmount = receivedGifts.reduce((sum, g) => sum + (g.amount || 0), 0);
  const totalSentAmount = sentGifts.reduce((sum, g) => sum + (g.amount || 0), 0);
  
  const totalReceivedCount = receivedGifts.length;
  const totalSentCount = sentGifts.length;

  // Birthday reminders
  const currentMonthContacts = visibleContacts.filter(c => {
    if (!c.birthday) return false;
    const bday = new Date(c.birthday);
    const today = new Date();
    return bday.getMonth() === today.getMonth();
  });

  return (
    <div>
      <h2 className="mb-4" style={{color: 'var(--color-text-main)'}}>ダッシュボード 🎀</h2>
      
      <div className="flex gap-4 mb-4" style={{flexWrap: 'wrap'}}>
        <div 
          className="card flex-1 text-center" 
          style={{backgroundColor: 'var(--color-primary)', color: 'white', minWidth: '150px', cursor: 'pointer', transition: 'transform 0.2s'}}
          onClick={() => navigate('/contacts')}
        >
          <div style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{contactsCount}</div>
          <div style={{fontWeight: '500'}}>登録人数</div>
        </div>
        <div 
          className="card flex-1 text-center" 
          style={{backgroundColor: 'var(--color-accent)', color: 'white', minWidth: '150px'}}
        >
          <div style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{pendingGifts.length}</div>
          <div style={{fontWeight: '500'}}>未対応タスク</div>
        </div>
        <div 
          className="card flex-1" 
          style={{minWidth: '150px', padding: '16px', cursor: 'pointer', transition: 'transform 0.2s'}}
          onClick={() => navigate('/all-gifts', { state: { direction: 'RECEIVED' } })}
        >
          <h3 className="mb-2" style={{fontSize: '1rem', color: 'var(--color-text-muted)'}}>もらった総数・額</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>{totalReceivedCount}</span>
            <span style={{color: 'var(--color-text-muted)'}}>件</span>
          </div>
          <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)'}}>{totalReceivedAmount.toLocaleString()} 円</div>
        </div>
        <div 
          className="card flex-1" 
          style={{minWidth: '150px', padding: '16px', cursor: 'pointer', transition: 'transform 0.2s'}}
          onClick={() => navigate('/all-gifts', { state: { direction: 'SENT' } })}
        >
          <h3 className="mb-2" style={{fontSize: '1rem', color: 'var(--color-text-muted)'}}>あげた総数・額</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>{totalSentCount}</span>
            <span style={{color: 'var(--color-text-muted)'}}>件</span>
          </div>
          <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)'}}>{totalSentAmount.toLocaleString()} 円</div>
        </div>
      </div>

      {currentMonthContacts.length > 0 && (
        <div className="card mb-4" style={{border: '2px solid var(--color-primary)'}}>
          <h3 className="flex items-center gap-2 mb-4" style={{color: 'var(--color-primary)'}}>
            <Cake size={20} />
            今月お誕生日の人 🎂
          </h3>
          <ul style={{listStyle: 'none'}}>
            {currentMonthContacts.map(c => (
              <li key={c.id} className="flex justify-between items-center mb-2" style={{padding: '8px', borderBottom: '1px solid var(--color-border)'}}>
                <div>
                  <strong>{c.name}</strong> さん <span className="text-muted">({format(new Date(c.birthday), 'MM月dd日')})</span>
                </div>
                <Link to={`/contacts/${c.id}`} className="btn btn-outline" style={{padding: '4px 12px', fontSize: '0.9rem'}}>確認</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="card">
        <h3 className="flex items-center gap-2 mb-4">
          <AlertCircle color="var(--color-danger)" size={20} />
          未対応タスク (お返し待ちなど)
        </h3>
        {pendingGifts && pendingGifts.length > 0 ? (
          <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {pendingGifts.map(gift => {
              const contact = contacts?.find(c => c.id === gift.contact_id);
              return (
                <li key={gift.id} className="flex justify-between items-center" style={{padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${gift.direction === 'RECEIVED' ? 'var(--color-accent)' : 'var(--color-success)'}`, flexWrap: 'wrap', gap: '16px'}}>
                  <div className="flex-1" style={{minWidth: '200px'}}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="tag" style={{backgroundColor: gift.direction === 'RECEIVED' ? 'var(--color-accent)' : 'var(--color-success)', color: '#fff'}}>{gift.direction === 'RECEIVED' ? 'もらった' : 'あげる予定'}</span>
                      {gift.season_type && <span className="tag" style={{backgroundColor: 'var(--color-border)'}}>{gift.season_type}</span>}
                      <span style={{fontWeight: 'bold', color: 'var(--color-text-main)'}}>
                        📅 {format(new Date(gift.event_date), 'yyyy年MM月dd日')}
                      </span>
                    </div>
                    <div className="mb-1" style={{fontSize: '1.1rem'}}>
                      相手: <strong style={{color: 'var(--color-primary)'}}>{contact ? contact.name : '不明'}</strong> さん
                    </div>
                    <div className="mb-1">
                      品物: <strong>{gift.item_name}</strong>
                      {gift.amount > 0 && <span className="text-muted ml-2">({gift.amount.toLocaleString()}円)</span>}
                    </div>
                    {gift.memo && (
                      <div className="text-muted" style={{fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px'}}>
                        📝 {gift.memo}
                      </div>
                    )}
                  </div>
                  <Link to={`/contacts/${gift.contact_id}`} className="btn btn-outline" style={{padding: '6px 16px', fontSize: '0.9rem', flexShrink: 0, textDecoration: 'none'}}>詳細を見る</Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted text-center" style={{padding: '24px 0'}}>現在、未対応のタスクはありません🍀</p>
        )}
      </div>
    </div>
  );
}
