import { Question } from "./questions";

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  reputation: number;
  joinDate: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

export interface ForumContextType {
  questions: Question[];
  currentQuestion: Question | null;
  filters: {
    search: string;
    tags: string[];
    status: 'all' | 'answered' | 'unanswered' | string;
    sort: 'date' | 'answers'| string;
    order: 'asc' | 'desc'| string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems:number;
  };
  createQuestion: (title: string, content: string, tags: string[]) => Promise<void>;
  updateQuestion: (id: string, title: string, content: string, tags: string[]) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  createAnswer: (questionId: string, content: string) => Promise<void>;
  updateAnswer: (id: string, content: string) => Promise<void>;
  deleteAnswer: (id: string) => Promise<void>;
  voteAnswer: (id: string, vote: 'like' | 'dislike') => Promise<void>;
  voteQuestion: (id: string, vote: 'like' | 'dislike') => Promise<void>;
  fetchQuestion: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ForumContextType['filters']>) => void;
  setPage: (page: number) => void;
  setLimit: (page: number) => void;
  isLoading: boolean;
}