import React, { createContext, useContext, useReducer, useEffect } from "react";
import { AuthContextType, User } from "../types";
import API from "../api";
import { useLoading } from "./GlobalLoadingContext";

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
  const { setGlobalLoading } = useLoading();

  useEffect(() => {
    API.get("auth/me")
      .then((res: any) => {
        dispatch({ type: "SET_USER", payload: res.data.user });
      })
      .catch((e: any) => {
        throw new Error(e.message);
      })
      .finally(() => {
        dispatch({ type: "SET_LOADING", payload: false });
        setGlobalLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    API.post("auth/login", { email, password })
      .then((res: any) => {
        dispatch({ type: "SET_USER", payload: res.data.user });
      })
      .catch((e: any) => {
        throw new Error(e.message);
      })
      .finally(() => dispatch({ type: "SET_LOADING", payload: false }));
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    API.post("auth/register", { email, username, password })
      .then((res: any) => {
        dispatch({ type: "SET_USER", payload: res.data.user });
      })
      .catch((e: any) => {
        throw new Error(e.message);
      })
      .finally(() => dispatch({ type: "SET_LOADING", payload: false }));
  };

  const logout = () => {
    API.get("auth/logout")
      .then(() => {
        dispatch({ type: "LOGOUT" });
      })
      .catch((e: any) => {
        throw new Error(e.message);
      })
      .finally(() => dispatch({ type: "SET_LOADING", payload: false }));
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!state.user) throw new Error("No authenticated user");

    dispatch({ type: "SET_LOADING", payload: true });

    const updatedUser = { ...state.user, ...data };

    const res = await API.put("auth/profile", updatedUser).finally(() =>
      dispatch({ type: "SET_LOADING", payload: false })
    );

    dispatch({ type: "UPDATE_USER", payload: res.data.user });
  };

  const updateProfileState = (data: Partial<User>) => {
    dispatch({ type: "UPDATE_USER", payload: { ...state.user, ...data } });
  };

  const value: AuthContextType = {
    user: state.user,
    login,
    register,
    logout,
    updateProfile,
    updateProfileState,
    isLoading: state.isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
