export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  reputation: number;
  joinDate: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
  answers: Answer[];
  views: number;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
}

export interface Answer {
  id: string;
  content: string;
  questionId: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
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
    status: 'all' | 'answered' | 'unanswered';
    sortBy: 'date' | 'answers';
    sortOrder: 'asc' | 'desc';
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
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
  isLoading: boolean;
}