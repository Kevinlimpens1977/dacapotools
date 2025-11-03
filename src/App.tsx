import React from 'react'
import { useApps } from './lib/useApps.ts'

function App() {
  const { apps, loading, error } = useApps();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dacapo Apps</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => (
          <div key={app.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
            {app.image_url && (
              <img 
                src={app.image_url} 
                alt={app.title} 
                className="w-full h-48 object-cover rounded-t-lg mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{app.title}</h2>
            <p className="text-gray-600 mb-4">{app.description}</p>
            {app.link_url && (
              <a 
                href={app.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Open App
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;