import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Clock, User, Edit3, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Question } from '../../types/questions';
import { useAuth } from '../../contexts/AuthContext';
import { useForum } from '../../contexts/ForumContext';

interface QuestionCardProps {
  question: Question;
  showActions?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, showActions = false }) => {
  const { user } = useAuth();
  const { deleteQuestion, voteQuestion } = useForum();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isVoting, setIsVoting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    setIsDeleting(true);
    try {
      await deleteQuestion(question._id);
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVote = async (vote: 'like' | 'dislike') => {
    if (!user) return;
    
    setIsVoting(true);
    try {
      await voteQuestion(question._id, vote);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return date.toLocaleDateString();
  };

  console.log(question, "DEBUIG")

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex space-x-4 flex-1">
            {/* Voting */}
            {user && (
              <div className="flex flex-col items-center space-y-2 min-w-[3rem]">
                <button
                  onClick={() => handleVote('like')}
                  disabled={isVoting}
                  // className={`p-1 rounded-full transition-colors ${
                  //   question.userVote === 'like'
                  //     ? 'bg-accent-100 text-accent-600'
                  //     : 'text-gray-400 hover:text-accent-600 hover:bg-accent-50'
                  // } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ThumbsUp className="h-4 w-4" />
                </button>
                
                {/* <div className="text-center">
                  <div className="text-sm font-semibold text-accent-600">
                    {question.likes}
                  </div>
                  <div className="text-xs text-gray-500">likes</div>
                </div> */}
                
                <button
                  onClick={() => handleVote('dislike')}
                  disabled={isVoting}
                  // className={`p-1 rounded-full transition-colors ${
                  //   question.userVote === 'dislike'
                  //     ? 'bg-error-100 text-error-600'
                  //     : 'text-gray-400 hover:text-error-600 hover:bg-error-50'
                  // } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ThumbsDown className="h-4 w-4" />
                </button>
                
                <div className="text-center">
                  <div className="text-sm font-semibold text-error-600">
                    {/* {question.dislikes} */}
                  </div>
                  <div className="text-xs text-gray-500">dislikes</div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1">
              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{question.answers.length} answers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{question.views} views</span>
                </div>
              </div>

              {/* Title - Make it clickable */}
              <Link
                to={`/questions/${question._id}`}
                className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 block mb-2"
              >
                {question.title}
                {question.isEdited && (
                  <span className="ml-2 text-xs text-gray-500 font-normal">(edited)</span>
                )}
              </Link>

              {/* Content Preview */}
              <p className="mt-2 text-gray-600 line-clamp-2">
                {question.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {question.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tags/${tag}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Author and Date */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{question.author.username}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>asked {formatDate(question.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {showActions && user && user._id === question.author._id && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/questions/${question._id}/edit`}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="p-2 text-gray-400 hover:text-error-600 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;