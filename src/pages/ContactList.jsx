import React, { useState } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { UserPlus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ContactModal from '../components/ContactModal';

export default function ContactList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  
  const contacts = useLiveQuery(() => db.contacts.toArray());
  const giftRecords = useLiveQuery(() => db.gift_records.toArray());

  const filteredContacts = contacts?.filter(c => {
    if (!showHidden && c.is_hidden) return false;
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(searchLower) || 
           (c.tags && c.tags.some(t => t.toLowerCase().includes(searchLower)));
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>人物一覧 🧑‍🤝‍🧑</h2>
        <button className="btn" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={20} /> 追加
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div style={{position: 'relative'}}>
          <Search size={20} style={{position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-muted)'}} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="名前やタグで検索..." 
            style={{paddingLeft: '40px'}}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', alignSelf: 'flex-end'}}>
          <input 
            type="checkbox" 
            checked={showHidden} 
            onChange={(e) => setShowHidden(e.target.checked)} 
            style={{width: '16px', height: '16px'}}
          />
          <span style={{fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>非表示の人物も表示する</span>
        </label>
      </div>

      <div className="flex flex-col gap-4">
        {filteredContacts && filteredContacts.length > 0 ? (
          filteredContacts.map(contact => {
            const contactGifts = giftRecords?.filter(g => g.contact_id === contact.id) || [];
            const receivedCount = contactGifts.filter(g => g.direction === 'RECEIVED').length;
            const sentCount = contactGifts.filter(g => g.direction === 'SENT').length;
            const pendingCount = contactGifts.filter(g => g.status === 'PENDING').length;

            return (
              <Link to={`/contacts/${contact.id}`} key={contact.id} style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="card flex justify-between items-center" style={{padding: '16px', position: 'relative', flexWrap: 'wrap', gap: '16px'}}>
                  <div className="flex-1" style={{minWidth: '200px'}}>
                    {pendingCount > 0 && (
                      <div style={{position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--color-danger)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>
                        {pendingCount}
                      </div>
                    )}
                    <h3 className="mb-2" style={{color: 'var(--color-primary)'}}>{contact.name}</h3>
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {contact.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                      </div>
                    )}
                  <div className="flex flex-wrap gap-4 mb-3" style={{fontSize: '0.9rem', alignItems: 'center'}}>
                    {contact.birthday && <div>🎂 {format(new Date(contact.birthday), 'MM月dd日')}</div>}
                    {contact.nengajo_status && (
                      <div className="tag" style={{backgroundColor: contact.nengajo_status.includes('喪中') ? '#e2e8f0' : 'var(--color-secondary)'}}>
                        🎍 {contact.nengajo_year ? `${contact.nengajo_year}年: ` : ''}{contact.nengajo_status}
                      </div>
                    )}
                    <div style={{color: 'var(--color-text-muted)'}}>もらった: <strong>{receivedCount}</strong>回</div>
                    <div style={{color: 'var(--color-text-muted)'}}>あげた: <strong>{sentCount}</strong>回</div>
                  </div>
                  {contact.postal_code || contact.address ? (
                    <p className="text-muted mb-2" style={{fontSize: '0.9rem'}}>〒{contact.postal_code} {contact.address}</p>
                  ) : null}
                  {contact.personal_memo && (
                    <div style={{backgroundColor: 'var(--color-bg)', padding: '8px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '8px'}}>
                      📝 {contact.personal_memo}
                    </div>
                  )}
                  {contact.is_hidden && (
                    <div style={{fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 'bold'}}>
                      ※ この人物は全体計算・ダッシュボードから除外されています
                    </div>
                  )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-center text-muted mt-4">人物が見つかりません。右上の「追加」ボタンから登録してください！</p>
        )}
      </div>

      {isModalOpen && <ContactModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
