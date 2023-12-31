import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import TrackedDatabase from '@/components/pages/server/TrackedDatabase';
import UntrackedDatabase from '@/components/pages/server/UntrackedDatabase';

export default function Server(props) {
  const [tracked, setTracked] = useState([]);
  const [untracked, setUntracked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [serverOnline, setServerOnline] = useState(null);
  const [raw, setRaw] = useState(null);

  useEffect(() => {
    return () => {
      fetch(`/api/servers/${props.serverId}`, {
        method: 'GET'
      }).then((res) => res.json()).then((data) => {
        if (data.error)
          setLoadingError(data.error);
        else {
          setTracked(data.databases.filter(db => db.tracked));
          setUntracked(data.databases.filter(db => !db.tracked));
          setServerOnline(data.active);
          setRaw(data);
        }
        setLoading(false);
      });
    };
  }, []);

  return (
    <Layout>
      <title>Server</title>
      <div className="flex flex-col pb-12 mx-auto md:max-w-[1000px] w-3/4">
        <div className="flex flex-col mb-4 w-full bg-white rounded-lg p-2 px-5 shadow-sm mt-2">
          <h1 className="font-semibold text-xl">Server Information</h1>
          <p className="text-gray-500 text-sm">Server Name: {raw?.server.name}</p>
          <p className="text-gray-500 text-sm">Server ID: {props.serverId}</p>
          <p className="text-gray-500 text-sm">Server IP: {raw?.server.ip}</p>
          <p className="text-gray-500 text-sm">Server Port: {raw?.server.port}</p>
        </div>

        {loading && <h1 className="text-2xl font-light select-none self-center">Loading...</h1>}

        {serverOnline === false && <h1
          className="text-red-500 text-2xl font-light select-none self-center w-full bg-red-100 text-center p-2 rounded-md my-2">Server
          is offline</h1>}

        {loadingError && <h1 className="text-red-500 text-2xl font-light select-none self-center">Error loading
          databases: {loadingError}</h1>}

        {tracked.length > 0 && (
          <>
            <h1 className="text-2xl font-light select-none">Tracked Databases</h1>

            {tracked.map((database, index) => (
              <TrackedDatabase database={database} index={index} key={index} setTracked={setTracked}
                               setUntracked={setUntracked} tracked={tracked} untracked={untracked}
                               serverOnline={serverOnline}/>
            ))}
          </>
        )}

        {untracked.length > 0 && (
          <>
            <h1 className="text-2xl font-light select-none mt-4">Untracked Databases</h1>

            {untracked.map((database, index) => (
              <UntrackedDatabase database={database} index={index} key={index} setTracked={setTracked}
                                 setUntracked={setUntracked} tracked={tracked} untracked={untracked}/>
            ))}
          </>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false
      }
    }
  }

  const { serverId } = context.query;

  if (!serverId)
    return {
      redirect: {
        destination: '/servers',
        permanent: false
      }
    }

  return {
    props: {
      serverId
    }
  }
}