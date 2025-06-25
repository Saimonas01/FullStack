import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ForumContextType, Question, Answer } from '../types';
import { useAuth } from './AuthContext';

interface ForumState {
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
  isLoading: boolean;
}

type ForumAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'SET_CURRENT_QUESTION'; payload: Question | null }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'UPDATE_QUESTION'; payload: { id: string; updates: Partial<Question> } }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'ADD_ANSWER'; payload: { questionId: string; answer: Answer } }
  | { type: 'UPDATE_ANSWER'; payload: { questionId: string; answerId: string; content: string } }
  | { type: 'DELETE_ANSWER'; payload: { questionId: string; answerId: string } }
  | { type: 'VOTE_QUESTION'; payload: { id: string; vote: 'like' | 'dislike' } }
  | { type: 'VOTE_ANSWER'; payload: { questionId: string; answerId: string; vote: 'like' | 'dislike' } }
  | { type: 'SET_FILTERS'; payload: Partial<ForumState['filters']> }
  | { type: 'SET_PAGE'; payload: number };

const forumReducer = (state: ForumState, action: ForumAction): ForumState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload, isLoading: false };
    case 'SET_CURRENT_QUESTION':
      return { ...state, currentQuestion: action.payload, isLoading: false };
    case 'ADD_QUESTION':
      return { 
        ...state, 
        questions: [action.payload, ...state.questions],
        isLoading: false 
      };
    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map(q => 
          q.id === action.payload.id ? { ...q, ...action.payload.updates } : q
        ),
        currentQuestion: state.currentQuestion?.id === action.payload.id 
          ? { ...state.currentQuestion, ...action.payload.updates }
          : state.currentQuestion,
        isLoading: false
      };
    case 'DELETE_QUESTION':
      return {
        ...state,
        questions: state.questions.filter(q => q.id !== action.payload),
        currentQuestion: state.currentQuestion?.id === action.payload ? null : state.currentQuestion,
        isLoading: false
      };
    case 'ADD_ANSWER':
      return {
        ...state,
        questions: state.questions.map(q => 
          q.id === action.payload.questionId 
            ? { ...q, answers: [...q.answers, action.payload.answer] }
            : q
        ),
        currentQuestion: state.currentQuestion?.id === action.payload.questionId
          ? { ...state.currentQuestion, answers: [...state.currentQuestion.answers, action.payload.answer] }
          : state.currentQuestion,
        isLoading: false
      };
    case 'UPDATE_ANSWER':
      return {
        ...state,
        questions: state.questions.map(q => 
          q.id === action.payload.questionId 
            ? {
                ...q,
                answers: q.answers.map(a => 
                  a.id === action.payload.answerId 
                    ? { ...a, content: action.payload.content, isEdited: true, updatedAt: new Date().toISOString() }
                    : a
                )
              }
            : q
        ),
        currentQuestion: state.currentQuestion?.id === action.payload.questionId
          ? {
              ...state.currentQuestion,
              answers: state.currentQuestion.answers.map(a => 
                a.id === action.payload.answerId 
                  ? { ...a, content: action.payload.content, isEdited: true, updatedAt: new Date().toISOString() }
                  : a
              )
            }
          : state.currentQuestion,
        isLoading: false
      };
    case 'DELETE_ANSWER':
      return {
        ...state,
        questions: state.questions.map(q => 
          q.id === action.payload.questionId 
            ? { ...q, answers: q.answers.filter(a => a.id !== action.payload.answerId) }
            : q
        ),
        currentQuestion: state.currentQuestion?.id === action.payload.questionId
          ? { ...state.currentQuestion, answers: state.currentQuestion.answers.filter(a => a.id !== action.payload.answerId) }
          : state.currentQuestion,
        isLoading: false
      };
    case 'VOTE_QUESTION':
      return {
        ...state,
        questions: state.questions.map(q => {
          if (q.id === action.payload.id) {
            const currentVote = q.userVote;
            const newVote = action.payload.vote;
            
            let likes = q.likes;
            let dislikes = q.dislikes;
            
            if (currentVote === 'like') likes--;
            if (currentVote === 'dislike') dislikes--;
            
            if (newVote !== currentVote) {
              if (newVote === 'like') likes++;
              if (newVote === 'dislike') dislikes++;
            }
            
            return {
              ...q,
              likes,
              dislikes,
              userVote: newVote === currentVote ? null : newVote
            };
          }
          return q;
        }),
        currentQuestion: state.currentQuestion?.id === action.payload.id
          ? (() => {
              const q = state.currentQuestion;
              const currentVote = q.userVote;
              const newVote = action.payload.vote;
              
              let likes = q.likes;
              let dislikes = q.dislikes;
              
              if (currentVote === 'like') likes--;
              if (currentVote === 'dislike') dislikes--;
              
              if (newVote !== currentVote) {
                if (newVote === 'like') likes++;
                if (newVote === 'dislike') dislikes++;
              }
              
              return {
                ...q,
                likes,
                dislikes,
                userVote: newVote === currentVote ? null : newVote
              };
            })()
          : state.currentQuestion,
        isLoading: false
      };
    case 'VOTE_ANSWER':
      return {
        ...state,
        questions: state.questions.map(q => 
          q.id === action.payload.questionId 
            ? {
                ...q,
                answers: q.answers.map(a => {
                  if (a.id === action.payload.answerId) {
                    const currentVote = a.userVote;
                    const newVote = action.payload.vote;
                    
                    let likes = a.likes;
                    let dislikes = a.dislikes;
                    
                    if (currentVote === 'like') likes--;
                    if (currentVote === 'dislike') dislikes--;
                    
                    if (newVote !== currentVote) {
                      if (newVote === 'like') likes++;
                      if (newVote === 'dislike') dislikes++;
                    }
                    
                    return {
                      ...a,
                      likes,
                      dislikes,
                      userVote: newVote === currentVote ? null : newVote
                    };
                  }
                  return a;
                })
              }
            : q
        ),
        currentQuestion: state.currentQuestion?.id === action.payload.questionId
          ? {
              ...state.currentQuestion,
              answers: state.currentQuestion.answers.map(a => {
                if (a.id === action.payload.answerId) {
                  const currentVote = a.userVote;
                  const newVote = action.payload.vote;
                  
                  let likes = a.likes;
                  let dislikes = a.dislikes;
                  
                  if (currentVote === 'like') likes--;
                  if (currentVote === 'dislike') dislikes--;
                  
                  if (newVote !== currentVote) {
                    if (newVote === 'like') likes++;
                    if (newVote === 'dislike') dislikes++;
                  }
                  
                  return {
                    ...a,
                    likes,
                    dislikes,
                    userVote: newVote === currentVote ? null : newVote
                  };
                }
                return a;
              })
            }
          : state.currentQuestion,
        isLoading: false
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, currentPage: 1 }
      };
    case 'SET_PAGE':
      return {
        ...state,
        pagination: { ...state.pagination, currentPage: action.payload }
      };
    default:
      return state;
  }
};

const ForumContext = createContext<ForumContextType | undefined>(undefined);

export const useForum = () => {
  const context = useContext(ForumContext);
  if (context === undefined) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
};

const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to implement React Context with TypeScript properly?',
    content: 'I\'m trying to implement a React Context with TypeScript but getting type errors. I want to create a context for user authentication that includes login, logout, and user state. What\'s the best way to type the context and provider?',
    tags: ['react', 'typescript', 'context'],
    authorId: '1',
    author: {
      id: '1',
      username: 'alex_coder',
      email: 'alex@example.com',
      reputation: 1250,
      joinDate: '2023-01-15'
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isEdited: false,
    answers: [
      {
        id: '1',
        content: 'Great question! Here\'s how I approach this problem...\n\nYou can create a strongly typed context like this:\n\n```typescript\ninterface AuthContextType {\n  user: User | null;\n  login: (email: string, password: string) => Promise<void>;\n  logout: () => void;\n}\n\nconst AuthContext = createContext<AuthContextType | undefined>(undefined);\n```',
        questionId: '1',
        authorId: '2',
        author: {
          id: '2',
          username: 'sarah_react',
          email: 'sarah@example.com',
          reputation: 890,
          joinDate: '2023-03-22'
        },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        isEdited: false,
        likes: 15,
        dislikes: 2,
        userVote: null
      }
    ],
    views: 245,
    likes: 23,
    dislikes: 1,
    userVote: null
  },
  {
    id: '2',
    title: 'Best practices for Node.js API design and error handling',
    content: 'What are the best practices when designing RESTful APIs with Node.js and Express? I\'m particularly interested in error handling, validation, and response formatting. Should I use middleware for everything?',
    tags: ['nodejs', 'express', 'api', 'best-practices'],
    authorId: '2',
    author: {
      id: '2',
      username: 'sarah_react',
      email: 'sarah@example.com',
      reputation: 890,
      joinDate: '2023-03-22'
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isEdited: false,
    answers: [],
    views: 189,
    likes: 18,
    dislikes: 0,
    userVote: null
  },
  {
    id: '3',
    title: 'Understanding MongoDB aggregation pipeline for complex queries',
    content: 'I need help understanding how MongoDB aggregation pipeline works for complex queries. I have a collection of orders and need to group by customer, calculate totals, and filter by date range. Can someone explain the stages?',
    tags: ['mongodb', 'database', 'aggregation'],
    authorId: '3',
    author: {
      id: '3',
      username: 'mike_backend',
      email: 'mike@example.com',
      reputation: 2100,
      joinDate: '2022-11-08'
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isEdited: false,
    answers: [],
    views: 156,
    likes: 12,
    dislikes: 1,
    userVote: null
  }
];

export const ForumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(forumReducer, {
    questions: mockQuestions,
    currentQuestion: null,
    filters: {
      search: '',
      tags: [],
      status: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10
    },
    isLoading: false
  });

  const createQuestion = async (title: string, content: string, tags: string[]): Promise<void> => {
    if (!user) throw new Error('Must be logged in to create questions');
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newQuestion: Question = {
      id: Date.now().toString(),
      title,
      content,
      tags,
      authorId: user.id,
      author: user,
      createdAt: new Date().toISOString(),
      isEdited: false,
      answers: [],
      views: 0,
      likes: 0,
      dislikes: 0,
      userVote: null
    };
    
    dispatch({ type: 'ADD_QUESTION', payload: newQuestion });
  };

  const updateQuestion = async (id: string, title: string, content: string, tags: string[]): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    dispatch({ 
      type: 'UPDATE_QUESTION', 
      payload: { 
        id, 
        updates: { 
          title, 
          content, 
          tags, 
          isEdited: true, 
          updatedAt: new Date().toISOString() 
        } 
      } 
    });
  };

  const deleteQuestion = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    dispatch({ type: 'DELETE_QUESTION', payload: id });
  };

  const createAnswer = async (questionId: string, content: string): Promise<void> => {
    if (!user) throw new Error('Must be logged in to create answers');
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newAnswer: Answer = {
      id: Date.now().toString(),
      content,
      questionId,
      authorId: user.id,
      author: user,
      createdAt: new Date().toISOString(),
      isEdited: false,
      likes: 0,
      dislikes: 0,
      userVote: null
    };
    
    dispatch({ type: 'ADD_ANSWER', payload: { questionId, answer: newAnswer } });
  };

  const updateAnswer = async (id: string, content: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the question that contains this answer
    const question = state.questions.find(q => q.answers.some(a => a.id === id));
    if (question) {
      dispatch({ 
        type: 'UPDATE_ANSWER', 
        payload: { questionId: question.id, answerId: id, content } 
      });
    }
  };

  const deleteAnswer = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const question = state.questions.find(q => q.answers.some(a => a.id === id));
    if (question) {
      dispatch({ 
        type: 'DELETE_ANSWER', 
        payload: { questionId: question.id, answerId: id } 
      });
    }
  };

  const voteAnswer = async (id: string, vote: 'like' | 'dislike'): Promise<void> => {
    if (!user) throw new Error('Must be logged in to vote');
    
    const question = state.questions.find(q => q.answers.some(a => a.id === id));
    if (question) {
      dispatch({ 
        type: 'VOTE_ANSWER', 
        payload: { questionId: question.id, answerId: id, vote } 
      });
    }
  };

  const voteQuestion = async (id: string, vote: 'like' | 'dislike'): Promise<void> => {
    if (!user) throw new Error('Must be logged in to vote');
    
    dispatch({ type: 'VOTE_QUESTION', payload: { id, vote } });
  };

  const fetchQuestion = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const question = state.questions.find(q => q.id === id);
    if (question) {
      dispatch({ 
        type: 'UPDATE_QUESTION', 
        payload: { id, updates: { views: question.views + 1 } } 
      });
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: { ...question, views: question.views + 1 } });
    } else {
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: null });
    }
  };

  const setFilters = (filters: Partial<ForumState['filters']>): void => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setPage = (page: number): void => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const value: ForumContextType = {
    questions: state.questions,
    currentQuestion: state.currentQuestion,
    filters: state.filters,
    pagination: state.pagination,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    voteAnswer,
    voteQuestion,
    fetchQuestion,
    setFilters,
    setPage,
    isLoading: state.isLoading
  };

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
};