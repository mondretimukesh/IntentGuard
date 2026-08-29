import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ApiConfig } from '../services/api';
import { getStoredApiConfig, setStoredApiConfig, getHealthStatus } from '../services/api';
import type { HealthStatus } from '../types';

interface ApiContextType {
  config: ApiConfig;
  health: HealthStatus;
  isTestingConnection: boolean;
  updateConfig: (newConfig: Partial<ApiConfig>) => void;
  checkHealth: (customUrl?: string) => Promise<HealthStatus>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ApiConfig>(getStoredApiConfig());
  const [health, setHealth] = useState<HealthStatus>({
    status: 'ok',
    version: '1.4.0',
    timestamp: new Date().toISOString(),
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const checkHealth = useCallback(async (customUrl?: string) => {
    setIsTestingConnection(true);
    try {
      const status = await getHealthStatus(customUrl);
      if (!customUrl) {
        setHealth(status);
      }
      return status;
    } finally {
      setIsTestingConnection(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const timer = setInterval(() => {
      checkHealth();
    }, 15000);
    return () => clearInterval(timer);
  }, [checkHealth, config.baseUrl]);

  const updateConfig = (newConfig: Partial<ApiConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    setStoredApiConfig(updated);
    checkHealth();
  };

  return (
    <ApiContext.Provider
      value={{
        config,
        health,
        isTestingConnection,
        updateConfig,
        checkHealth,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export function useApi(): ApiContextType {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}
