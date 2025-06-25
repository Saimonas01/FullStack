import React, { createContext, useContext, useReducer } from "react";
import { ForumContextType } from "../types";
import { useAuth } from "./AuthContext";
import API from "../api";
import { Question, Answer } from "../types/questions";

interface ForumState {
  questions: Question[];
  currentQuestion: Question | null;
  filters: {
    search: string;
    tags: string[];
    status: "all" | "answered" | "unanswered" | string;
    sort: "date" | "answers" | string;
    order: "asc" | "desc" | string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
  };
  isLoading: boolean;
}

type ForumAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_QUESTIONS"; payload: Question[] }
  | { type: "SET_CURRENT_QUESTION"; payload: Question | null }
  | { type: "ADD_QUESTION"; payload: Question }
  | {
      type: "UPDATE_QUESTION";
      payload: { id: string; updates: Partial<Question> };
    }
  | { type: "DELETE_QUESTION"; payload: string }
  | { type: "ADD_ANSWER"; payload: { questionId: string; answer: Answer } }
  | {
      type: "UPDATE_ANSWER";
      payload: { questionId: string; answerId: string; content: string };
    }
  | { type: "DELETE_ANSWER"; payload: { questionId: string; answerId: string } }
  | { type: "VOTE_QUESTION"; payload: { id: string; vote: "like" | "dislike" } }
  | {
      type: "VOTE_ANSWER";
      payload: {
        questionId: string;
        answerId: string;
        vote: "like" | "dislike";
      };
    }
  | { type: "SET_FILTERS"; payload: Partial<ForumState["filters"]> }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_LIMIT"; payload: number }
  | { type: "SET_TOTAL_PAGES"; payload: number }
  | { type: "SET_TOTAL_ITEMS"; payload: number };

const forumReducer = (state: ForumState, action: ForumAction): ForumState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_QUESTIONS":
      return { ...state, questions: action.payload, isLoading: false };
    case "SET_CURRENT_QUESTION":
      return { ...state, currentQuestion: action.payload, isLoading: false };
    case "ADD_QUESTION":
      return {
        ...state,
        questions: [action.payload, ...state.questions],
        isLoading: false,
      };
    case "UPDATE_QUESTION":
      return {
        ...state,
        questions: state.questions.map((q) =>
          q._id === action.payload.id ? { ...q, ...action.payload.updates } : q
        ),
        currentQuestion:
          state.currentQuestion?._id === action.payload.id
            ? { ...state.currentQuestion, ...action.payload.updates }
            : state.currentQuestion,
        isLoading: false,
      };
    case "DELETE_QUESTION":
      return {
        ...state,
        questions: state.questions.filter((q) => q._id !== action.payload),
        currentQuestion:
          state.currentQuestion?._id === action.payload
            ? null
            : state.currentQuestion,
        isLoading: false,
      };
    case "ADD_ANSWER":
      return {
        ...state,
        questions: state.questions.map((q) =>
          q._id === action.payload.questionId
            ? { ...q, answers: [...q.answers, action.payload.answer] }
            : q
        ),
        currentQuestion:
          state.currentQuestion?._id === action.payload.questionId
            ? {
                ...state.currentQuestion,
                answers: [
                  ...state.currentQuestion.answers,
                  action.payload.answer,
                ],
              }
            : state.currentQuestion,
        isLoading: false,
      };
    case "UPDATE_ANSWER":
      return {
        ...state,
        questions: state.questions.map((q) =>
          q._id === action.payload.questionId
            ? {
                ...q,
                answers: q.answers.map((a) =>
                  a._id === action.payload.answerId
                    ? {
                        ...a,
                        content: action.payload.content,
                        isEdited: true,
                        updatedAt: new Date().toISOString(),
                      }
                    : a
                ),
              }
            : q
        ),
        currentQuestion:
          state.currentQuestion?._id === action.payload.questionId
            ? {
                ...state.currentQuestion,
                answers: state.currentQuestion.answers.map((a) =>
                  a._id === action.payload.answerId
                    ? {
                        ...a,
                        content: action.payload.content,
                        isEdited: true,
                        updatedAt: new Date().toISOString(),
                      }
                    : a
                ),
              }
            : state.currentQuestion,
        isLoading: false,
      };
    case "DELETE_ANSWER":
      return {
        ...state,
        questions: state.questions.map((q) =>
          q._id === action.payload.questionId
            ? {
                ...q,
                answers: q.answers.filter(
                  (a) => a._id !== action.payload.answerId
                ),
              }
            : q
        ),
        currentQuestion:
          state.currentQuestion?._id === action.payload.questionId
            ? {
                ...state.currentQuestion,
                answers: state.currentQuestion.answers.filter(
                  (a) => a._id !== action.payload.answerId
                ),
              }
            : state.currentQuestion,
        isLoading: false,
      };
    case "VOTE_QUESTION":
      return {
        ...state,
        questions: state.questions.map((q) => {
          if (q._id === action.payload.id) {
            const currentVote = q.userVote;
            const newVote = action.payload.vote;

            let likes = q.likeCount;
            let dislikes = q.dislikeCount;

            if (currentVote === "like") likes--;
            if (currentVote === "dislike") dislikes--;

            if (newVote !== currentVote) {
              if (newVote === "like") likes++;
              if (newVote === "dislike") dislikes++;
            }

            return {
              ...q,
              likes,
              dislikes,
              userVote: newVote === currentVote ? null : newVote,
            };
          }
          return q;
        }),
        currentQuestion:
          state.currentQuestion?._id === action.payload.id
            ? (() => {
                const q = state.currentQuestion;
                const currentVote = q.userVote;
                const newVote = action.payload.vote;

                let likes = q.likeCount;
                let dislikes = q.dislikeCount;

                if (currentVote === "like") likes--;
                if (currentVote === "dislike") dislikes--;

                if (newVote !== currentVote) {
                  if (newVote === "like") likes++;
                  if (newVote === "dislike") dislikes++;
                }

                return {
                  ...q,
                  likes,
                  dislikes,
                  userVote: newVote === currentVote ? null : newVote,
                };
              })()
            : state.currentQuestion,
        isLoading: false,
      };
    case "VOTE_ANSWER":
      return {
        ...state,
        questions: state.questions.map((q) =>
          q._id === action.payload.questionId
            ? {
                ...q,
                answers: q.answers.map((a) => {
                  if (a._id === action.payload.answerId) {
                    const currentVote = a.userVote;
                    const newVote = action.payload.vote;

                    let likes = a.likeCount;
                    let dislikes = a.dislikeCount;

                    if (currentVote === "like") likes--;
                    if (currentVote === "dislike") dislikes--;

                    if (newVote !== currentVote) {
                      if (newVote === "like") likes++;
                      if (newVote === "dislike") dislikes++;
                    }

                    return {
                      ...a,
                      likes,
                      dislikes,
                      userVote: newVote === currentVote ? null : newVote,
                    };
                  }
                  return a;
                }),
              }
            : q
        ),
        currentQuestion:
          state.currentQuestion?._id === action.payload.questionId
            ? {
                ...state.currentQuestion,
                answers: state.currentQuestion.answers.map((a) => {
                  if (a._id === action.payload.answerId) {
                    const currentVote = a.userVote;
                    const newVote = action.payload.vote;

                    let likes = a.likeCount;
                    let dislikes = a.dislikeCount;

                    if (currentVote === "like") likes--;
                    if (currentVote === "dislike") dislikes--;

                    if (newVote !== currentVote) {
                      if (newVote === "like") likes++;
                      if (newVote === "dislike") dislikes++;
                    }

                    return {
                      ...a,
                      likes,
                      dislikes,
                      userVote: newVote === currentVote ? null : newVote,
                    };
                  }
                  return a;
                }),
              }
            : state.currentQuestion,
        isLoading: false,
      };
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, currentPage: 1 },
      };
    case "SET_PAGE":
      return {
        ...state,
        pagination: { ...state.pagination, currentPage: action.payload },
      };
    case "SET_LIMIT":
      return {
        ...state,
        pagination: { ...state.pagination, itemsPerPage: action.payload },
      };
    case "SET_TOTAL_PAGES":
      return {
        ...state,
        pagination: { ...state.pagination, totalPages: action.payload },
      };
    case "SET_TOTAL_ITEMS":
      return {
        ...state,
        pagination: { ...state.pagination, totalItems: action.payload },
      };
    default:
      return state;
  }
};

const ForumContext = createContext<ForumContextType | undefined>(undefined);

export const useForum = () => {
  const context = useContext(ForumContext);
  if (context === undefined) {
    throw new Error("useForum must be used within a ForumProvider");
  }
  return context;
};

export const ForumProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(forumReducer, {
    questions: [],
    currentQuestion: null,
    filters: {
      search: "",
      tags: [],
      status: "all",
      sort: "date",
      order: "desc",
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      totalItems: 0,
    },
    isLoading: false,
  });

  const setFilters = (filters: Partial<ForumState["filters"]>): void => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  };

  const setPage = (page: number): void => {
    dispatch({ type: "SET_PAGE", payload: page });
  };

  const setLimit = (page: number): void => {
    dispatch({ type: "SET_LIMIT", payload: page });
  };

  const fetchQuestions = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    const { search, tags, status, sort, order } = state.filters;
    const params = {
      ...(search && { search }),
      ...(tags.length && { tags: tags.join(",") }),
      ...(status !== "all" && { status }),
      sort,
      order,
      page: state.pagination.currentPage,
      limit: state.pagination.itemsPerPage,
    };

    try {
      const res = await API.get("/questions", { params });

      dispatch({ type: "SET_QUESTIONS", payload: res.data.questions });

      if (res.data.totalPages) {
        dispatch({ type: "SET_TOTAL_PAGES", payload: res.data.totalPages });
      }

      if (res.data.total) {
        dispatch({ type: "SET_TOTAL_ITEMS", payload: res.data.total });
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      dispatch({ type: "SET_QUESTIONS", payload: [] });
    }
  };

  React.useEffect(() => {
    fetchQuestions();
  }, [state.filters, state.pagination.currentPage]);

  const createQuestion = async (
    title: string,
    content: string,
    tags: string[]
  ): Promise<void> => {
    if (!user) throw new Error("Must be logged in to create questions");

    dispatch({ type: "SET_LOADING", payload: true });

    const res = await API.post("/questions", { title, content, tags });

    dispatch({ type: "ADD_QUESTION", payload: res.data.question });
  };

  const updateQuestion = async (
    id: string,
    title: string,
    content: string,
    tags: string[]
  ): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    const res = await API.patch(`/questions/${id}`, { title, content, tags });

    dispatch({ type: "UPDATE_QUESTION", payload: { id, updates: res.data } });
  };

  const deleteQuestion = async (id: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    await API.delete(`/questions/${id}`);

    dispatch({ type: "DELETE_QUESTION", payload: id });
  };

  const createAnswer = async (
    questionId: string,
    content: string
  ): Promise<void> => {
    if (!user) throw new Error("Must be logged in to create answers");

    dispatch({ type: "SET_LOADING", payload: true });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // const newAnswer: Answer = {
    //   id: Date.now().toString(),
    //   content,
    //   questionId,
    //   authorId: user.id,
    //   author: user,
    //   createdAt: new Date().toISOString(),
    //   isEdited: false,
    //   likes: 0,
    //   dislikes: 0,
    //   userVote: null,
    // };

    // dispatch({
    //   type: "ADD_ANSWER",
    //   payload: { questionId, answer: newAnswer },
    // });
  };

  const updateAnswer = async (id: string, content: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find the question that contains this answer
    const question = state.questions.find((q) =>
      q.answers.some((a) => a._id === id)
    );
    if (question) {
      dispatch({
        type: "UPDATE_ANSWER",
        payload: { questionId: question._id, answerId: id, content },
      });
    }
  };

  const deleteAnswer = async (id: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    // await new Promise((resolve) => setTimeout(resolve, 500));

    // const question = state.questions.find((q) =>
    //   q.answers.some((a) => a._id === id)
    // );
    // if (question) {
    //   dispatch({
    //     type: "DELETE_ANSWER",
    //     payload: { questionId: question.id, answerId: id },
    //   });
    // }
  };

  const voteAnswer = async (
    id: string,
    vote: "like" | "dislike"
  ): Promise<void> => {
    if (!user) throw new Error("Must be logged in to vote");

    const question = state.questions.find((q) =>
      q.answers.some((a) => a._id === id)
    );
    if (question) {
      dispatch({
        type: "VOTE_ANSWER",
        payload: { questionId: question._id, answerId: id, vote },
      });
    }
  };

  const voteQuestion = async (
    id: string,
    vote: "like" | "dislike"
  ): Promise<void> => {
    if (!user) throw new Error("Must be logged in to vote");

    dispatch({ type: "VOTE_QUESTION", payload: { id, vote } });
  };

  const fetchQuestion = async (id: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const res = await API.get(`/questions/${id}`);
      dispatch({ type: "SET_CURRENT_QUESTION", payload: res.data.question });
    } catch {
      dispatch({ type: "SET_CURRENT_QUESTION", payload: null });
    }
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
    setLimit,
    isLoading: state.isLoading,
  };

  return (
    <ForumContext.Provider value={value}>{children}</ForumContext.Provider>
  );
};
