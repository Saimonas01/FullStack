import React, { createContext, useContext, useReducer, useEffect } from "react";
import { AuthContextType, User } from "../types";
import API from "../api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "LOGOUT" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload, isLoading: false };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case "LOGOUT":
      return { ...state, user: null, isLoading: false };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
  });

  useEffect(() => {

    API.get("auth/me")
      .then((res: any) => {
        dispatch({ type: "SET_USER", payload: res.data.user });
      })
      .catch((e:any) => {
        dispatch({ type: "SET_LOADING", payload: false });
        throw new Error(e.message);
      });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    API.post("auth/login", { email, password })
      .then((res: any) => {
        dispatch({ type: "SET_USER", payload: res.data.user });
      })
      .catch((e:any) => {
        dispatch({ type: "SET_LOADING", payload: false });
        throw new Error(e.message);
      });

  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    API.post("auth/register", { email,username, password })
      .then((res: any) => {
        dispatch({ type: "SET_USER", payload: res.data.user });
      })
      .catch((e:any) => {
        dispatch({ type: "SET_LOADING", payload: false });
        throw new Error(e.message);
      });
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    dispatch({ type: "LOGOUT" });
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!state.user) throw new Error("No authenticated user");

    dispatch({ type: "SET_LOADING", payload: true });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedUser = { ...state.user, ...data };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    dispatch({ type: "UPDATE_USER", payload: data });
    dispatch({ type: "SET_LOADING", payload: false });
  };

  const value: AuthContextType = {
    user: state.user,
    login,
    register,
    logout,
    updateProfile,
    isLoading: state.isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
