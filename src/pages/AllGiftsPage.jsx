import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useLocation } from 'react-router-dom';
import { FileText, ArrowDownUp, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function AllGiftsPage() {
  const location = useLocation();
  const contacts = useLiveQuery(() => db.contacts.toArray());
  const giftRecords = useLiveQuery(() => db.gift_records.toArray());

  const [directionFilter, setDirectionFilter] = useState(location.state?.direction || 'ALL');
  const [seasonFilter, setSeasonFilter] = useState('ALL');
  const [sortMode, setSortMode] = useState('DATE_DESC');

  useEffect(() => {
    if (location.state?.direction) {
      setDirectionFilter(location.state.direction);
    }
  }, [location.state]);

  const processedGifts = useMemo(() => {
    if (!giftRecords || !contacts) return [];

    const visibleContactIds = new Set(contacts.filter(c => !c.is_hidden).map(c => c.id));

    let filtered = giftRecords.filter(g => {
      if (!visibleContactIds.has(g.contact_id)) return false;
      if (directionFilter !== 'ALL' && g.direction !== directionFilter) return false;
      if (seasonFilter !== 'ALL' && g.season_type !== seasonFilter) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (sortMode === 'DATE_DESC') {
        return new Date(b.event_date || 0) - new Date(a.event_date || 0);
      }
      if (sortMode === 'DATE_ASC') {
        return new Date(a.event_date || 0) - new Date(b.event_date || 0);
      }
      if (sortMode === 'AMOUNT_DESC') {
        return (b.amount || 0) - (a.amount || 0);
      }
      if (sortMode === 'AMOUNT_ASC') {
        return (a.amount || 0) - (b.amount || 0);
      }
      return 0;
    });

    return filtered;
  }, [giftRecords, contacts, directionFilter, seasonFilter, sortMode]);

  const uniqueSeasons = useMemo(() => {
    if (!giftRecords) return [];
    const seasons = new Set(giftRecords.map(g => g.season_type).filter(Boolean));
    return Array.from(seasons);
  }, [giftRecords]);

  if (!giftRecords || !contacts) return <div className="text-center mt-8">読み込み中...</div>;

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2">
        <FileText size={24} color="var(--color-primary)" />
        全履歴リスト
      </h2>

      <div className="card" style={{padding: '16px'}}>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={18} color="var(--color-text-muted)" />
            <select className="form-select" style={{padding: '8px', minWidth: '120px'}} value={directionFilter} onChange={e => setDirectionFilter(e.target.value)}>
              <option value="ALL">すべて (もらった/あげた)</option>
              <option value="RECEIVED">もらったもの</option>
              <option value="SENT">あげたもの</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select className="form-select" style={{padding: '8px', minWidth: '120px'}} value={seasonFilter} onChange={e => setSeasonFilter(e.target.value)}>
              <option value="ALL">すべての種類</option>
              {uniqueSeasons.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2" style={{marginLeft: 'auto'}}>
            <ArrowDownUp size={18} color="var(--color-text-muted)" />
            <select className="form-select" style={{padding: '8px'}} value={sortMode} onChange={e => setSortMode(e.target.value)}>
              <option value="DATE_DESC">新しい順 (日付)</option>
              <option value="DATE_ASC">古い順 (日付)</option>
              <option value="AMOUNT_DESC">金額が高い順</option>
              <option value="AMOUNT_ASC">金額が低い順</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {processedGifts.length > 0 ? (
          processedGifts.map(gift => {
            const contact = contacts.find(c => c.id === gift.contact_id);
            return (
              <Link to={`/contacts/${gift.contact_id}`} key={gift.id} style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="card flex justify-between items-center" style={{padding: '16px', position: 'relative', flexWrap: 'wrap', gap: '16px', marginBottom: 0}}>
                  <div className="flex-1" style={{minWidth: '200px'}}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="tag" style={{backgroundColor: gift.direction === 'RECEIVED' ? 'var(--color-accent)' : 'var(--color-success)', color: '#fff'}}>
                        {gift.direction === 'RECEIVED' ? 'もらった' : 'あげた'}
                      </span>
                      {gift.season_type && <span className="tag" style={{backgroundColor: 'var(--color-border)'}}>{gift.season_type}</span>}
                      {gift.status === 'PENDING' && <span className="tag" style={{backgroundColor: 'var(--color-danger)', color: '#fff'}}>未対応</span>}
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
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-center text-muted mt-4">条件に一致する履歴はありません。</p>
        )}
      </div>
    </div>
  );
}
