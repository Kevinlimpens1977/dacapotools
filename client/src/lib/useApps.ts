import { useState, useEffect } from 'react';
import axios from 'axios';

export interface App {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
}

export function useApps() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApps() {
      try {
        // We'll use axios instead of direct MySQL connection from frontend
        const response = await axios.get('/api/apps');
        setApps(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch apps');
        console.error('Error fetching apps:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchApps();
  }, []);

  return { apps, loading, error };
}