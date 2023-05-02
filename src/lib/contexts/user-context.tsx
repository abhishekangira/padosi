import { createContext, useContext } from "react";
import { UserType, useUser } from "../hooks/useUser";

export type UserContextType = {
  user: UserType;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  setUserLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  setUserLoading: () => {},
});

export const useUserContext = () => useContext(UserContext);

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, setUser, setUserLoading } = useUser();

  return (
    <UserContext.Provider value={{ user, loading, setUser, setUserLoading }}>
      {children}
    </UserContext.Provider>
  );
}
