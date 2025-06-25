export interface UserRef {
  user: string; // user ID
}

export interface Author {
  _id: string;
  username: string;
  reputation: number;
  avatar?: string;
}

export interface Answer {
  _id: string;
  content: string;
  question: string; // question ID
  author: Author; // author ID
  likeCount: number; // array of user refs
  dislikeCount: number;
  isActive: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  userVote: string | null;
}

export interface Question {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: Author;
  views: number;
  isActive: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  answers: Answer[];
  answerCount: number;
  userVote: string | null;
  likeCount: number;
  dislikeCount: number;
  score: number;
}
