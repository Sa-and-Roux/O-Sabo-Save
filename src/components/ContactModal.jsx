import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../db/db';
import { X, Trash2 } from 'lucide-react';

export default function ContactModal({ onClose, initialData }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        postal_code: initialData.postal_code || '',
        address: initialData.address || '',
        tags: initialData.tags ? initialData.tags.join(', ') : '',
        personal_memo: initialData.personal_memo || '',
        birthday: initialData.birthday || '',
        nengajo_status: initialData.nengajo_status || '',
        nengajo_year: initialData.nengajo_year || new Date().getFullYear().toString(),
        is_hidden: initialData.is_hidden || false
      });
    } else {
      reset({
        nengajo_year: new Date().getFullYear().toString(),
        is_hidden: false
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data) => {
    try {
      const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      
      const payload = {
        name: data.name,
        postal_code: data.postal_code,
        address: data.address,
        tags: tagsArray,
        personal_memo: data.personal_memo,
        birthday: data.birthday,
        nengajo_status: data.nengajo_status,
        nengajo_year: data.nengajo_year,
        is_hidden: data.is_hidden
      };

      if (initialData) {
        await db.contacts.update(initialData.id, payload);
      } else {
        await db.contacts.add(payload);
      }
      onClose();
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('本当にこの人物を削除しますか？\n関連する贈答履歴もすべて削除されます。')) {
      try {
        await db.transaction('rw', db.contacts, db.gift_records, async () => {
          await db.gift_records.where('contact_id').equals(initialData.id).delete();
          await db.contacts.delete(initialData.id);
        });
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
          <h3>{initialData ? '人物を編集 ✏️' : '新しい人物を登録 ✨'}</h3>
          <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer'}}>
            <X size={24} color="var(--color-text-main)" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">お名前 *</label>
            <input className="form-input" {...register("name", { required: true })} placeholder="山田 太郎" />
            {errors.name && <p className="error-text">必須項目です</p>}
          </div>

          <div className="form-group">
            <label className="form-label">郵便番号</label>
            <input className="form-input" {...register("postal_code")} placeholder="123-4567" />
          </div>

          <div className="form-group">
            <label className="form-label">住所</label>
            <input className="form-input" {...register("address")} placeholder="東京都..." />
          </div>

          <div className="flex flex-responsive gap-4">
            <div className="form-group flex-1">
              <label className="form-label">誕生日 🎂</label>
              <input type="date" className="form-input" {...register("birthday")} />
            </div>
            <div className="form-group flex-2">
              <label className="form-label">年賀状 🎍</label>
              <div className="flex gap-2">
                <input type="number" className="form-input" style={{width: '80px'}} {...register("nengajo_year")} placeholder="2026" />
                <span style={{alignSelf: 'center'}}>年:</span>
                <select className="form-select flex-1" {...register("nengajo_status")}>
                  <option value="">未設定</option>
                  <option value="やり取りあり">やり取りあり</option>
                  <option value="こちらが喪中">こちらが喪中</option>
                  <option value="相手が喪中">相手が喪中</option>
                  <option value="辞退・終了">辞退・終了</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">タグ (カンマ区切り)</label>
            <input className="form-input" {...register("tags")} placeholder="親戚, 友人, 会社" />
          </div>

          <div className="form-group">
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
              <input type="checkbox" {...register("is_hidden")} style={{width: '18px', height: '18px'}} />
              <span style={{fontWeight: '500', color: 'var(--color-danger)'}}>この人物を非表示にする（ダッシュボードや全体計算から除外）</span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">メモ (好物・アレルギーなど)</label>
            <textarea className="form-textarea" {...register("personal_memo")} placeholder="ビールが好き、カニのアレルギーあり" />
          </div>

          <div className="flex justify-between items-center mt-4">
            {initialData ? (
              <button type="button" onClick={handleDelete} className="btn btn-outline" style={{color: 'var(--color-danger)', borderColor: 'var(--color-danger)'}}>
                <Trash2 size={20} /> 削除
              </button>
            ) : <div></div>}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn btn-secondary">キャンセル</button>
              <button type="submit" className="btn">{initialData ? '更新する' : '登録する'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
