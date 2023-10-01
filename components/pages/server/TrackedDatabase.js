import { useState } from 'react';
import { data } from 'autoprefixer';

export default function TrackedDatabase ({ database, index, setUntracked, setTracked, untracked, tracked }) {
  const [editing, setEditing] = useState(false);
  const [retention, setRetention] = useState(database.retentionPeriod);
  const [retentionUnit, setRetentionUnit] = useState(database.retentionPeriodUnit);
  const [frequency, setFrequency] = useState(database.backupFrequency);
  const [frequencyUnit, setFrequencyUnit] = useState(database.backupFrequencyUnit);

  const unTrack = () => {
    fetch(`/api/servers/${database.serverId}`, {
      method: 'POST',
      body: JSON.stringify({
        op: 'track',
        data: {
          tracked: false,
          databaseName: database.name
        }
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setUntracked([...untracked, database]);
          setTracked(tracked.filter(db => db.name !== database.name));
        }
      });
  }

  return (
    <div className="flex flex-col w-full bg-white rounded-lg p-2 px-5 shadow-sm mt-2" key={index}>
      <h1 className="font-semibold text-xl">{database.name}</h1>
      <p className="text-sm text-gray-500"><span className="font-semibold">{database.tableCount}</span> tables</p>
      <p className="text-sm text-gray-500"><span className="font-semibold">7</span> backups</p>
      <p className="text-sm text-gray-500 flex flex-row gap-x-1 items-center">Retention Period: {editing
        ? (
          <div className="flex flex-row gap-x-2">
            <input type="number" className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-500 focus:outline-none focus:ring-[1px] focus:ring-blue-500 focus:border-transparent" value={retention} onChange={e => setRetention(e.target.value)}/>
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-500 focus:outline-none focus:ring-[1px] focus:ring-blue-500 focus:border-transparent" value={retentionUnit} onChange={e => setRetentionUnit(e.target.value)}>
              <option value="hour">Hour{retention != 1 && 's'}</option>
              <option value="day">Day{retention != 1 && 's'}</option>
              <option value="week">Week{retention != 1 && 's'}</option>
              <option value="month">Month{retention != 1 && 's'}</option>
            </select>
          </div>
        )
        : <span className="font-semibold">for {retention} {retentionUnit}{retention != 1 && 's'}</span>
      }</p>
      <p className="text-sm text-gray-500 flex flex-row gap-x-1 items-center">Backup Frequency: {editing
        ? (
          <div className="flex flex-row gap-x-2 mt-2">
            <input type="number" className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-500 focus:outline-none focus:ring-[1px] focus:ring-blue-500 focus:border-transparent" value={frequency} onChange={e => setFrequency(e.target.value)}/>
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-500 focus:outline-none focus:ring-[1px] focus:ring-blue-500 focus:border-transparent" value={frequencyUnit} onChange={e => setFrequencyUnit(e.target.value)}>
              <option value="hour">Hour{frequency != 1 && 's'}</option>
              <option value="day">Day{frequency != 1 && 's'}</option>
              <option value="week">Week{frequency != 1 && 's'}</option>
              <option value="month">Month{frequency != 1 && 's'}</option>
            </select>
          </div>
        )
        :
        <span className="font-semibold">every {frequency != 1 && frequency} {frequencyUnit}{frequency != 1 && 's'}</span>
      }</p>
      <p className="text-sm text-gray-500">Last backup: <span className="font-semibold">1 hour ago</span></p>
      <p className="text-sm text-gray-500">Current Status: <span className="font-semibold text-green-500">Backup Completed</span>
      </p>
      <p className="text-sm text-gray-500">Current Status: <span className="font-semibold text-yellow-600">Running backup</span>
      </p>
      <p className="text-sm text-gray-500">Current
        Status: <span className="font-semibold text-red-500">Backup Failed</span></p>
      <div className="h-px bg-gray-200 my-2"></div>
      <div className="flex flex-row items-center gap-x-2 mb-1">
        <p className="text-gray-500 hover:underline cursor-pointer">Backup Now</p>
        <p className="text-gray-200 select-none">|</p>
        <p className="text-gray-500 hover:underline cursor-pointer">View Backups</p>
        <p className="text-gray-200 select-none">|</p>
        <p className="text-gray-500 hover:underline cursor-pointer" onClick={() => setEditing(!editing)}>{editing ? 'Save' : 'Edit'}</p>
        <p className="text-gray-200 select-none">|</p>
        <p className="text-red-500 hover:underline cursor-pointer" onClick={unTrack}>Untrack</p>
      </div>
    </div>
  )
}