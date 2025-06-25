import React, { createContext, useContext } from 'react';

type LoadingContextType = {
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

type LoadingProviderProps = {
  children: React.ReactNode;
  isGlobalLoading: boolean; 
  setGlobalLoading: (loading: boolean) => void; 
};

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  isGlobalLoading,
  setGlobalLoading,
}) => {
  return (
    <LoadingContext.Provider value={{ isGlobalLoading, setGlobalLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within a LoadingProvider');
  return context;
};
