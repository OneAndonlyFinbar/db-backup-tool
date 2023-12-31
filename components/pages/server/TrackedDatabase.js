import { useState } from "react";
import Link from "next/link";

export default function TrackedDatabase({ database, index, setUntracked, setTracked, untracked, tracked, serverOnline }) {
  const [editing, setEditing] = useState(false);
  const [retention, setRetention] = useState(database.retentionPeriod);
  const [retentionUnit, setRetentionUnit] = useState(database.retentionPeriodUnit);
  const [frequency, setFrequency] = useState(database.backupFrequency);
  const [frequencyUnit, setFrequencyUnit] = useState(database.backupFrequencyUnit);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const lastBackup = database.backups.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  const unTrack = () => {
    fetch(`/api/servers/${database.serverId}`, {
      method: "POST",
      body: JSON.stringify({
        op: "track",
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
        } else
          setError(data.error);
      });
  };

  const save = () => {
    fetch(`/api/servers/${database.serverId}`, {
      method: "POST",
      body: JSON.stringify({
        op: "patch",
        data: {
          retentionPeriod: retention,
          retentionPeriodUnit: retentionUnit,
          backupFrequency: frequency,
          backupFrequencyUnit: frequencyUnit,
          databaseName: database.name
        }
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setTracked(tracked.map(db => {
            if (db.name === database.name) {
              return {
                ...db,
                retentionPeriod: retention,
                retentionPeriodUnit: retentionUnit,
                backupFrequency: frequency,
                backupFrequencyUnit: frequencyUnit
              };
            }
            return db;
          }));
          setEditing(false);
        } else
          setError(data.error);
      });
  };

  const backupNow = () => {
    fetch(`/api/backups/create`, {
      method: "POST",
      body: JSON.stringify({
        serverId: database.serverId,
        databaseName: database.name
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setError(null);
          setMessage("Backup Success!");
        } else {
          setError(data.error.toString());
          setMessage(null)
        }
      });
  }

  return (
    <div className="flex flex-col w-full bg-white rounded-lg p-2 px-5 shadow-sm mt-2" key={index}>
      <h1 className="font-semibold text-xl">{database.name}</h1>
      <p className="text-sm text-gray-500"><span className="font-semibold">{database.tableCount}</span> tables</p>
      <p className="text-sm text-gray-500"><span className="font-semibold">{database.backups.length}</span> backups</p>
      <p className="text-sm text-gray-500 flex flex-row gap-x-1 items-center">Retention Period: {editing
        ? (
          <div className="flex flex-row gap-x-2">
            <input type="number" className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-500 focus:outline-none focus:ring-[1px] focus:ring-blue-500 focus:border-transparent" value={retention} onChange={e => setRetention(parseInt(e.target.value))} />
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-500 focus:outline-none focus:ring-[1px] focus:ring-blue-500 focus:border-transparent" value={retentionUnit} onChange={e => setRetentionUnit(e.target.value)}>
              <option value="hour">Hour{retention != 1 && "s"}</option>
              <option value="day">Day{retention != 1 && "s"}</option>
              <option value="week">Week{retention != 1 && "s"}</option>
              <option value="month">Month{retention != 1 && "s"}</option>
            </select>
          </div>
        )
        : <span className="font-semibold">for {retention} {retentionUnit}{retention != 1 && "s"}</span>
      }</p>
      <p className="text-sm text-gray-500 flex flex-row gap-x-1 items-center">Backup Frequency: {editing
        ? (
          <div className="flex flex-row gap-x-2 mt-2">
            <input type="number" className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-500 focus:outline-none focus:ring-[1px] focus:ring-blue-500 focus:border-transparent" value={frequency} onChange={e => setFrequency(parseInt(e.target.value))} />
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-500 focus:outline-none focus:ring-[1px] focus:ring-blue-500 focus:border-transparent" value={frequencyUnit} onChange={e => setFrequencyUnit(e.target.value)}>
              <option value="hour">Hour{frequency != 1 && "s"}</option>
              <option value="day">Day{frequency != 1 && "s"}</option>
              <option value="week">Week{frequency != 1 && "s"}</option>
              <option value="month">Month{frequency != 1 && "s"}</option>
            </select>
          </div>
        )
        :
        <span className="font-semibold">every {frequency != 1 && frequency} {frequencyUnit}{frequency != 1 && "s"}</span>
      }</p>
      <p className="text-sm text-gray-500">Last backup: <span className="font-semibold">{lastBackup?.date ? `${new Date(lastBackup.date).toLocaleDateString()} at ${new Date(lastBackup.date).toLocaleTimeString()}` : "None"}</span></p>
      <p className="text-sm text-gray-500">Last Backup Status: <span className={`font-semibold ${lastBackup?.status ? "text-green-500" : lastBackup?.status === 0 && "text-red-500"}`}>{lastBackup?.status ? "Success" : lastBackup?.status === 0 ? "Failed" : "None"}</span></p>
      <div className="h-px bg-gray-200 my-2"></div>
      <div className="flex flex-col md:flex-row items-center gap-x-2 mb-1">
        <button className="text-gray-500 hover:underline cursor-pointer disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:no-underline" onClick={backupNow} disabled={!serverOnline}>Backup Now</button>
        <p className="text-gray-200 select-none hidden md:block">|</p>
        <Link className="text-gray-500 hover:underline cursor-pointer" href={`/server/${database.serverId}/${database.name}`}>View Backups</Link>
        <p className="text-gray-200 select-none hidden md:block">|</p>
        <p className="text-gray-500 hover:underline cursor-pointer" onClick={() => editing ? save() : setEditing(!editing)}>{editing ? "Save" : "Edit"}</p>
        <p className="text-gray-200 select-none hidden md:block">|</p>
        <p className="text-red-500 hover:underline cursor-pointer" onClick={unTrack}>Untrack</p>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {message && <p className="text-green-500 text-sm">{message}</p>}
    </div>
  );
}