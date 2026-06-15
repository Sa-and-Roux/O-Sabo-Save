import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../db/db';
import { X, Calculator, Trash2, Camera } from 'lucide-react';

export default function GiftModal({ contactId, initialData, onClose }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      direction: 'RECEIVED',
      status: 'NONE',
      event_date: new Date().toISOString().split('T')[0],
      season_type: 'その他'
    }
  });

  const [imageBase64, setImageBase64] = useState('');

  useEffect(() => {
    if (initialData) {
      reset({
        direction: initialData.direction,
        event_date: initialData.isDuplicateMode ? new Date().toISOString().split('T')[0] : initialData.event_date,
        item_name: initialData.item_name,
        amount: initialData.amount || '',
        status: initialData.isDuplicateMode ? 'NONE' : initialData.status,
        memo: initialData.memo || '',
        season_type: initialData.season_type || 'その他'
      });
      if (!initialData.isDuplicateMode) {
        setImageBase64(initialData.image_data || '');
      }
    }
  }, [initialData, reset]);

  const direction = watch('direction');
  const amount = watch('amount');

  const handleHalfReturnCalc = () => {
    if (amount) {
      const parsedAmount = parseInt(amount, 10);
      if (!isNaN(parsedAmount)) {
        alert(`【半返し目安】\n半額: ${(parsedAmount / 2).toLocaleString()} 円\n三分の一: ${Math.floor(parsedAmount / 3).toLocaleString()} 円`);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        contact_id: contactId,
        direction: data.direction,
        event_date: data.event_date,
        item_name: data.item_name,
        amount: data.amount ? parseInt(data.amount, 10) : 0,
        status: data.status,
        memo: data.memo,
        season_type: data.season_type,
        image_data: imageBase64
      };

      if (initialData && !initialData.isDuplicateMode) {
        await db.gift_records.update(initialData.id, payload);
      } else {
        await db.gift_records.add(payload);
      }
      onClose();
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (initialData && initialData.isDuplicateMode) return;
    if (window.confirm('本当にこの贈答履歴を削除しますか？')) {
      try {
        await db.gift_records.delete(initialData.id);
        onClose();
      } catch (e) {
        alert('削除に失敗しました');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(108, 91, 123, 0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '16px'
    }}>
      <div className="card" style={{width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'}}>
        <div className="flex justify-between items-center mb-4">
          <h3>
            {initialData 
              ? (initialData.isDuplicateMode ? '定番ギフトを登録 🎁' : '贈答履歴を編集 ✏️') 
              : '贈答履歴を登録 🎁'}
          </h3>
          <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer'}}>
            <X size={24} color="var(--color-text-main)" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group flex gap-4">
            <label style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <input type="radio" value="RECEIVED" {...register("direction")} /> もらった
            </label>
            <label style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <input type="radio" value="SENT" {...register("direction")} /> あげた（予定）
            </label>
          </div>

          <div className="flex flex-responsive gap-4">
            <div className="form-group flex-1">
              <label className="form-label">日付 *</label>
              <input type="date" className="form-input" {...register("event_date", { required: true })} />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">種類</label>
              <select className="form-select" {...register("season_type")}>
                <option value="お中元">お中元</option>
                <option value="お歳暮">お歳暮</option>
                <option value="クリスマス">クリスマス</option>
                <option value="誕生日">誕生日</option>
                <option value="お祝い">お祝い</option>
                <option value="お返し">お返し</option>
                <option value="手土産">手土産</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">品物名 *</label>
            <input className="form-input" {...register("item_name", { required: true })} placeholder="お中元 (メロン)" />
            {errors.item_name && <p className="error-text">必須項目です</p>}
          </div>

          <div className="form-group relative">
            <label className="form-label">金額・予算 (円)</label>
            <div className="flex gap-2">
              <input type="number" className="form-input" {...register("amount")} placeholder="5000" />
              {direction === 'RECEIVED' && (
                <button type="button" onClick={handleHalfReturnCalc} className="btn btn-secondary" style={{padding: '8px', flexShrink: 0}} title="半返しを計算">
                  <Calculator size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">お返しのステータス</label>
            <select className="form-select" {...register("status")}>
              <option value="NONE">お返し不要 / 完了</option>
              <option value="PENDING">未対応 (お返しが必要)</option>
              <option value="PROCESSING">対応中 (手配済み)</option>
              <option value="COMPLETED">完了</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">写真</label>
            <div className="flex gap-4 items-center">
              <label className="btn btn-outline" style={{cursor: 'pointer', padding: '8px 16px', fontSize: '0.9rem'}}>
                <Camera size={18} /> 写真を選択
                <input type="file" accept="image/*" style={{display: 'none'}} onChange={handleImageChange} />
              </label>
              {imageBase64 && (
                <img src={imageBase64} alt="Gift" style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}} />
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">メモ・配送業者など</label>
            <textarea className="form-textarea" {...register("memo")} placeholder="ヤマト運輸で到着" />
          </div>

          <div className="flex justify-between items-center mt-4">
            {(initialData && !initialData.isDuplicateMode) ? (
              <button type="button" onClick={handleDelete} className="btn btn-outline" style={{color: 'var(--color-danger)', borderColor: 'var(--color-danger)'}}>
                <Trash2 size={20} /> 削除
              </button>
            ) : <div></div>}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn btn-secondary">キャンセル</button>
              <button type="submit" className="btn">{(initialData && !initialData.isDuplicateMode) ? '更新する' : '登録する'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
