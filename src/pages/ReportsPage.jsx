import React, { useMemo } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { BarChart2 } from 'lucide-react';

export default function ReportsPage() {
  const contacts = useLiveQuery(() => db.contacts.toArray());
  const giftRecords = useLiveQuery(() => db.gift_records.toArray());

  const COLORS = ['#ffb6b9', '#f8b195', '#f67280', '#c06c84', '#6c5b7b', '#a8e6cf', '#dcedc1', '#ffd3b6', '#ffaaa5'];

  const { seasonData, yearlyData } = useMemo(() => {
    if (!giftRecords || !contacts) return { seasonData: [], yearlyData: [] };

    const visibleContactIds = new Set(contacts.filter(c => !c.is_hidden).map(c => c.id));
    const visibleGifts = giftRecords.filter(g => visibleContactIds.has(g.contact_id));

    // Season Data (Count and Amount)
    const seasonMap = {};
    const yearMap = {};

    visibleGifts.forEach(g => {
      const type = g.season_type || 'その他';
      if (!seasonMap[type]) {
        seasonMap[type] = { name: type, count: 0, amount: 0 };
      }
      seasonMap[type].count += 1;
      seasonMap[type].amount += (g.amount || 0);

      // Yearly Data
      if (g.event_date) {
        const year = g.event_date.split('-')[0];
        if (!yearMap[year]) {
          yearMap[year] = { name: year, receivedAmount: 0, sentAmount: 0 };
        }
        if (g.direction === 'RECEIVED') {
          yearMap[year].receivedAmount += (g.amount || 0);
        } else {
          yearMap[year].sentAmount += (g.amount || 0);
        }
      }
    });

    const sData = Object.values(seasonMap).sort((a, b) => b.count - a.count);
    const yData = Object.values(yearMap).sort((a, b) => a.name.localeCompare(b.name));

    return { seasonData: sData, yearlyData: yData };
  }, [giftRecords, contacts]);

  if (!giftRecords) return <div>読み込み中...</div>;

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2">
        <BarChart2 size={24} color="var(--color-primary)" />
        レポート・分析
      </h2>

      {giftRecords.length === 0 ? (
        <p className="text-muted text-center mt-8">データがまだありません。</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 className="mb-4">年度別の贈答金額</h3>
            <div style={{width: '100%', height: '300px'}}>
              <ResponsiveContainer>
                <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} 円`} />
                  <Legend />
                  <Bar dataKey="receivedAmount" name="もらった総額" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sentAmount" name="あげた総額" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="card flex-1" style={{minWidth: '300px'}}>
              <h3 className="mb-4 text-center">ギフト種類別の件数</h3>
              <div style={{width: '100%', height: '250px'}}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={seasonData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {seasonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} 件`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card flex-1" style={{minWidth: '300px'}}>
              <h3 className="mb-4 text-center">ギフト種類別の金額割合</h3>
              <div style={{width: '100%', height: '250px'}}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={seasonData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {seasonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} 円`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
