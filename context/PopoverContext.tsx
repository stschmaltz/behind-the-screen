import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  ReactNode,
} from 'react';

interface PopoverContextType {
  isScrollLockActive: boolean;
  setIsScrollLockActive: (isActive: boolean) => void;
}

const PopoverContext = createContext<PopoverContextType | null>(null);

interface PopoverProviderProps {
  children: ReactNode;
}

export const PopoverProvider: React.FC<PopoverProviderProps> = ({
  children,
}) => {
  const [isScrollLockActive, setIsScrollLockActive] = useState(false);

  const value = useMemo(
    () => ({
      isScrollLockActive,
      setIsScrollLockActive,
    }),
    [isScrollLockActive],
  );

  return (
    <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
  );
};

export const usePopoverContext = (): PopoverContextType => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopoverContext must be used within a PopoverProvider');
  }
  return context;
};
