import { useState, useEffect } from 'react';
import {
  type SavedEndpoint,
  getSavedEndpoints,
  saveEndpoints,
} from '../utils/storage';

export function useSavedEndpoints() {
  const [savedEndpoints, setSavedEndpoints] = useState<SavedEndpoint[]>(() => {
    return getSavedEndpoints();
  });

  useEffect(() => {
    saveEndpoints(savedEndpoints);
  }, [savedEndpoints]);

  function saveEndpoint(endpoint: SavedEndpoint): void {
    setSavedEndpoints((prev) => {
      // Avoid duplicates if same ID (though usually we generate new)
      const filtered = prev.filter((e) => e.id !== endpoint.id);
      return [endpoint, ...filtered];
    });
  }

  function deleteSavedEndpoint(id: string): void {
    setSavedEndpoints((prev) => prev.filter((e) => e.id !== id));
  }

  function updateSavedEndpoint(id: string, changes: Partial<SavedEndpoint>): void {
    setSavedEndpoints((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    );
  }

  return {
    savedEndpoints,
    saveEndpoint,
    deleteSavedEndpoint,
    updateSavedEndpoint,
  };
}
