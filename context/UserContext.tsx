import { createContext, ReactElement, useContext, useState } from 'react';
import type { User } from '../generated/graphql';

const CurrentUserContext = createContext<{
  currentUser?: User;
  setCurrentUser?: (currentUser: User | undefined) => void;
}>({
  currentUser: undefined,
  setCurrentUser: () => undefined,
});

const useCurrentUserContext = () => useContext(CurrentUserContext);
const CurrentUserProvider = (input: { children: ReactElement | null }) => {
  const { children } = input;
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export { CurrentUserProvider, CurrentUserContext, useCurrentUserContext };
