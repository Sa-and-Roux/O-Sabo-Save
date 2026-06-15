import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Gift as GiftIcon, Plus, ArrowLeft, Copy } from 'lucide-react';
import { format } from 'date-fns';
import GiftModal from '../components/GiftModal';
import ContactModal from '../components/ContactModal';

export default function ContactDetail() {
  const { id } = useParams();
  const contactId = Number(id);
  const navigate = useNavigate();
  
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState(null);

  const contact = useLiveQuery(() => db.contacts.get(contactId));
  const giftRecords = useLiveQuery(
    () => db.gift_records.where('contact_id').equals(contactId).reverse().sortBy('event_date')
  );

  useEffect(() => {
    if (contact === null) {
      navigate('/contacts', { replace: true });
    }
  }, [contact, navigate]);

  if (contact === undefined) return <div>読み込み中...</div>;
  if (contact === null) return null;

  const openGiftEdit = (gift) => {
    setEditingGift({ ...gift, isDuplicateMode: false });
    setIsGiftModalOpen(true);
  };

  const openGiftDuplicate = (e, gift) => {
    e.stopPropagation();
    setEditingGift({ ...gift, isDuplicateMode: true });
    setIsGiftModalOpen(true);
  };

  const closeGiftModal = () => {
    setEditingGift(null);
    setIsGiftModalOpen(false);
  };

  // Calculate totals
  const totalReceivedAmount = giftRecords?.filter(g => g.direction === 'RECEIVED').reduce((sum, g) => sum + (g.amount || 0), 0) || 0;
  const totalReceivedCount = giftRecords?.filter(g => g.direction === 'RECEIVED').length || 0;
  const totalSentAmount = giftRecords?.filter(g => g.direction === 'SENT').reduce((sum, g) => sum + (g.amount || 0), 0) || 0;
  const totalSentCount = giftRecords?.filter(g => g.direction === 'SENT').length || 0;

  return (
    <div>
      <div className="mb-4">
        <Link to="/contacts" className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.9rem', textDecoration: 'none'}}>
          <ArrowLeft size={16} /> 戻る
        </Link>
      </div>

      <div 
        className="card" 
        style={{backgroundColor: 'var(--color-secondary)', cursor: 'pointer', transition: 'transform 0.2s'}} 
        onClick={() => setIsContactModalOpen(true)}
        title="タップして編集"
      >
        <h2 style={{color: 'var(--color-primary)'}} className="mb-2">{contact.name} さん</h2>
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex gap-2 mb-2">
            {contact.tags.map(tag => <span key={tag} className="tag" style={{backgroundColor: '#fff'}}>{tag}</span>)}
          </div>
        )}
        {contact.postal_code || contact.address ? (
          <p className="mb-2">住所: 〒{contact.postal_code} {contact.address}</p>
        ) : null}
        {contact.birthday && <p className="mb-2">誕生日: {format(new Date(contact.birthday), 'MM月dd日')}</p>}
        {contact.nengajo_status && (
          <p className="mb-2 flex items-center gap-2">
            年賀状: <span className="tag" style={{backgroundColor: contact.nengajo_status.includes('喪中') ? '#e2e8f0' : 'var(--color-secondary)'}}>
              {contact.nengajo_year ? `${contact.nengajo_year}年: ` : ''}{contact.nengajo_status}
            </span>
          </p>
        )}
        {contact.is_hidden && (
          <div style={{backgroundColor: 'var(--color-danger)', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem'}}>
            ⚠️ この人物は現在「非表示」に設定されており、ダッシュボードや全体計算から除外されています。
          </div>
        )}
        {contact.personal_memo && (
          <div style={{backgroundColor: 'rgba(255,255,255,0.6)', padding: '8px', borderRadius: 'var(--radius-sm)', marginBottom: '8px'}}>
            📝 {contact.personal_memo}
          </div>
        )}
        <div className="flex gap-4 mt-4" style={{fontSize: '0.9rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '12px'}}>
          <div><strong>もらった:</strong> {totalReceivedCount}件 ({totalReceivedAmount.toLocaleString()}円)</div>
          <div><strong>あげた:</strong> {totalSentCount}件 ({totalSentAmount.toLocaleString()}円)</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 mt-4">
        <h3>贈答履歴 🎁</h3>
        <button className="btn" onClick={() => { setEditingGift(null); setIsGiftModalOpen(true); }}>
          <Plus size={20} /> 追加
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {giftRecords && giftRecords.length > 0 ? (
          giftRecords.map(gift => (
            <div 
              key={gift.id} 
              className="card" 
              style={{borderLeft: `4px solid ${gift.direction === 'RECEIVED' ? 'var(--color-accent)' : 'var(--color-success)'}`, cursor: 'pointer', position: 'relative'}}
              onClick={() => openGiftEdit(gift)}
            >
              <button 
                onClick={(e) => openGiftDuplicate(e, gift)}
                className="btn btn-outline"
                style={{position: 'absolute', top: '16px', right: '16px', padding: '4px 8px', fontSize: '0.8rem', zIndex: 10}}
                title="コピーして新規登録 (定番ギフト)"
              >
                <Copy size={14} /> 複製
              </button>
              
              <div className="flex justify-between items-center mb-4" style={{paddingRight: '80px'}}>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="tag" style={{backgroundColor: gift.direction === 'RECEIVED' ? 'var(--color-accent)' : 'var(--color-success)', color: '#fff'}}>
                    {gift.direction === 'RECEIVED' ? 'もらった' : 'あげた/予定'}
                  </span>
                  {gift.season_type && <span className="tag" style={{backgroundColor: 'var(--color-border)'}}>{gift.season_type}</span>}
                </div>
                <span style={{fontWeight: 'bold', color: 'var(--color-text-main)', fontSize: '1.1rem', whiteSpace: 'nowrap'}}>
                  📅 {format(new Date(gift.event_date), 'yyyy年MM月dd日')}
                </span>
              </div>
              
              <div className="flex gap-4">
                {gift.image_data && (
                  <img src={gift.image_data} alt={gift.item_name} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px'}} />
                )}
                <div className="flex-1">
                  <h4 className="mb-2" style={{fontSize: '1.2rem'}}>{gift.item_name}</h4>
                  {gift.amount > 0 && <p className="mb-2">金額・予算: {gift.amount.toLocaleString()} 円</p>}
                  {gift.status !== 'NONE' && (
                    <p className="mb-2 text-muted">
                      ステータス: {
                        gift.status === 'PENDING' ? '未対応' : 
                        gift.status === 'PROCESSING' ? '対応中' : '完了'
                      }
                    </p>
                  )}
                  {gift.memo && <p className="text-muted" style={{fontSize: '0.9rem'}}>{gift.memo}</p>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">贈答履歴がありません。追加してください！</p>
        )}
      </div>

      {isGiftModalOpen && <GiftModal contactId={contactId} initialData={editingGift} onClose={closeGiftModal} />}
      {isContactModalOpen && <ContactModal initialData={contact} onClose={() => setIsContactModalOpen(false)} />}
    </div>
  );
}
