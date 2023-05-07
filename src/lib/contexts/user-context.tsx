import { createContext, useContext } from "react";
import { UserType, useUser } from "../hooks/useUser";

export type UserContextType = {
  user: UserType;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  setGlobalLoading: () => {},
});

export const useUserContext = () => useContext(UserContext);

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, setUser, setGlobalLoading } = useUser();

  return (
    <UserContext.Provider value={{ user, loading, setUser, setGlobalLoading }}>
      {children}
    </UserContext.Provider>
  );
}
