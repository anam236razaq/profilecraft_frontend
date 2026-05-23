import { useState, useEffect } from 'react';
import websitesAPI from '../api/websites';

const useWebsite = (websiteId = null) => {
  const [website, setWebsite] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (websiteId) {
      fetchWebsite(websiteId);
    }
  }, [websiteId]);

  const fetchWebsite = async (id) => {
    setLoading(true);
    try {
      const response = await websitesAPI.getById(id);
      setWebsite(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch website');
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await websitesAPI.getAll();
      setWebsites(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch websites');
    } finally {
      setLoading(false);
    }
  };

  const create = async (data) => {
    setLoading(true);
    try {
      const response = await websitesAPI.create(data);
      const newWebsite = response.data.data;
      setWebsites(prev => [newWebsite, ...prev]);
      return { success: true, website: newWebsite };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create website');
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    setLoading(true);
    try {
      const response = await websitesAPI.update(id, data);
      const updated = response.data.data;
      setWebsite(updated);
      setWebsites(prev => prev.map(w => w.id === id ? updated : w));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update website');
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await websitesAPI.delete(id);
      setWebsites(prev => prev.filter(w => w.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete website');
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const publish = async (id) => {
    try {
      const response = await websitesAPI.publish(id);
      const updated = response.data.data;
      setWebsite(updated);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  return {
    website,
    websites,
    loading,
    error,
    fetchWebsite,
    fetchAll,
    create,
    update,
    remove,
    publish,
  };
};

export default useWebsite;
