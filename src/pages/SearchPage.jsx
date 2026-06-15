import React, { useState } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Search, Gift, User } from 'lucide-react';
import { format } from 'date-fns';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const contacts = useLiveQuery(() => db.contacts.toArray());
  const giftRecords = useLiveQuery(() => db.gift_records.toArray());

  const searchLower = searchTerm.toLowerCase();

  const matchedContacts = contacts?.filter(c => 
    !c.is_hidden && searchLower && (
      (c.name && c.name.toLowerCase().includes(searchLower)) ||
      (c.personal_memo && c.personal_memo.toLowerCase().includes(searchLower)) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(searchLower)))
    )
  ) || [];

  const visibleContactIds = new Set(contacts?.filter(c => !c.is_hidden).map(c => c.id) || []);

  const matchedGifts = giftRecords?.filter(g => 
    visibleContactIds.has(g.contact_id) && searchLower && (
      (g.item_name && g.item_name.toLowerCase().includes(searchLower)) ||
      (g.memo && g.memo.toLowerCase().includes(searchLower)) ||
      (g.season_type && g.season_type.toLowerCase().includes(searchLower))
    )
  ) || [];

  return (
    <div>
      <h2 className="mb-4">全体検索 🔍</h2>
      
      <div className="mb-6" style={{position: 'relative'}}>
        <Search size={20} style={{position: 'absolute', left: '16px', top: '16px', color: 'var(--color-text-muted)'}} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="人物名、品物名、メモなどで検索..." 
          style={{paddingLeft: '48px', fontSize: '1.1rem', padding: '16px 16px 16px 48px', borderRadius: 'var(--radius-lg)'}}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      {searchLower.length > 0 && (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-3 flex items-center gap-2" style={{color: 'var(--color-primary)'}}>
              <User size={20} /> 人物の検索結果 ({matchedContacts.length}件)
            </h3>
            {matchedContacts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {matchedContacts.map(c => (
                  <Link to={`/contacts/${c.id}`} key={c.id} style={{textDecoration: 'none'}}>
                    <div className="card" style={{padding: '12px 16px', marginBottom: '0'}}>
                      <strong>{c.name}</strong> 
                      {c.personal_memo && <span className="text-muted ml-2"> - {c.personal_memo}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted">一致する人物はいません。</p>
            )}
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2" style={{color: 'var(--color-accent)'}}>
              <Gift size={20} /> 贈答履歴の検索結果 ({matchedGifts.length}件)
            </h3>
            {matchedGifts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {matchedGifts.map(g => {
                  const contact = contacts?.find(c => c.id === g.contact_id);
                  return (
                    <Link to={`/contacts/${g.contact_id}`} key={g.id} style={{textDecoration: 'none'}}>
                      <div className="card" style={{padding: '12px 16px', marginBottom: '0'}}>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div>
                            <span className="tag" style={{backgroundColor: g.direction === 'RECEIVED' ? 'var(--color-accent)' : 'var(--color-success)', color: '#fff', marginRight: '8px'}}>
                              {g.direction === 'RECEIVED' ? 'もらった' : 'あげた'}
                            </span>
                            <strong>{g.item_name}</strong>
                            <span className="text-muted" style={{marginLeft: '8px'}}>({contact ? contact.name : '不明'}さん)</span>
                          </div>
                          <span className="text-muted">{format(new Date(g.event_date), 'yyyy/MM/dd')}</span>
                        </div>
                        {g.memo && <div className="text-muted mt-1" style={{fontSize: '0.9rem'}}>{g.memo}</div>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted">一致する贈答履歴はありません。</p>
            )}
          </div>
        </div>
      )}
      
      {searchLower.length === 0 && (
        <div className="text-center text-muted mt-8" style={{padding: '24px'}}>
          <Search size={48} color="var(--color-border)" style={{margin: '0 auto 16px auto'}} />
          <p>キーワードを入力すると、人物や品物名からすぐに探し出せます。</p>
        </div>
      )}
    </div>
  );
}
