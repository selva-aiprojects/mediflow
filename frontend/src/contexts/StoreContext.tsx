import React, { createContext, useContext, useState, useEffect } from 'react';
import { storesApi } from '@/lib/api';

interface Store {
  id: string;
  name: string;
  code: string;
  isHeadOffice: boolean;
  city?: string;
  state?: string;
  addressLine1?: string;
}

interface StoreContextType {
  stores: Store[];
  activeStore: Store | null;
  setActiveStoreId: (id: string) => void;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType>({
  stores: [],
  activeStore: null,
  setActiveStoreId: () => {},
  loading: true,
});

export const useStoreContext = () => useContext(StoreContext);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(localStorage.getItem('activeStoreId'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch stores if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    storesApi.getAll().then(({ data }) => {
      console.log('Stores API response:', data);
      setStores(data || []);
      if (data && data.length > 0) {
        // If no active store is set, default to the first one (or Head Office)
        const savedId = localStorage.getItem('activeStoreId');
        if (!savedId || !data.find((s: Store) => s.id === savedId)) {
          const defaultStore = data.find((s: Store) => s.isHeadOffice) || data[0];
          localStorage.setItem('activeStoreId', defaultStore.id);
          window.location.reload();
          return;
        }
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Stores API error:', err);
      setLoading(false);
    });
  }, []);

  const setActiveStoreId = (id: string) => {
    localStorage.setItem('activeStoreId', id);
    setActiveStoreIdState(id);
    // Reload page to re-fetch all data with new store context, or trigger a global event
    // A simple reload is safest to ensure all components remount with new X-Store-Id
    window.location.reload();
  };

  const activeStore = stores.find(s => s.id === activeStoreId) || null;

  return (
    <StoreContext.Provider value={{ stores, activeStore, setActiveStoreId, loading }}>
      {children}
    </StoreContext.Provider>
  );
};
