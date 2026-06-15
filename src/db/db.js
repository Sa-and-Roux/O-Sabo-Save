import Dexie from 'dexie';

export const db = new Dexie('OSaboSaveDB');

// id は AutoIncrement (++id)
db.version(1).stores({
  contacts: '++id, name, postal_code, address, *tags, personal_memo',
  gift_records: '++id, contact_id, direction, event_date, item_name, amount, image_url, status, linked_record_id, memo'
});

db.version(2).stores({
  contacts: '++id, name, postal_code, address, *tags, personal_memo, birthday',
  gift_records: '++id, contact_id, direction, event_date, item_name, amount, image_data, status, linked_record_id, memo, season_type'
});

db.version(3).stores({
  contacts: '++id, name, postal_code, address, *tags, personal_memo, birthday, nengajo_status',
  gift_records: '++id, contact_id, direction, event_date, item_name, amount, image_data, status, linked_record_id, memo, season_type'
});

db.version(4).stores({
  contacts: '++id, name, postal_code, address, *tags, personal_memo, birthday, nengajo_status, nengajo_year, is_hidden',
  gift_records: '++id, contact_id, direction, event_date, item_name, amount, image_data, status, linked_record_id, memo, season_type'
});
