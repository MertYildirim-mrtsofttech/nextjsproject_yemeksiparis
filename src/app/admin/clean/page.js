'use client';

import { useEffect, useState } from 'react';

export default function CleanPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    fetch('/api/clean')
      .then((res) => res.json())
      .then((data) => setTables(data.tables || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTable || !confirm) {
      setResult('Lütfen tablo seçin ve işlemi onaylayın.');
      return;
    }

    const res = await fetch('/api/clean', {
      method: 'POST',
      body: JSON.stringify({ tableName: selectedTable }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setResult(data.message || data.error);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tablo Temizle</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">-- Bir tablo seçin --</option>
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
          />
          <span>Verileri silmek istediğimi onaylıyorum.</span>
        </label>

        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!confirm}
        >
          Verileri Sil
        </button>
      </form>

      {result && <p className="mt-4 text-sm">{result}</p>}
    </div>
  );
}
