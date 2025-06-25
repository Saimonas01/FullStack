import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, MessageSquare, Eye, Clock, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useForum } from '../../contexts/ForumContext';
import { useAuth } from '../../contexts/AuthContext';
import AnswerForm from '../Answers/AnswerForm';
import AnswerCard from '../Answers/AnswerCard';

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentQuestion, fetchQuestion, deleteQuestion, voteQuestion, isLoading } = useForum();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isVoting, setIsVoting] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetchQuestion(id);
    }
  }, [id]);

  const handleDelete = async () => {
    if (!currentQuestion || !confirm('Are you sure you want to delete this question?')) return;
    
    setIsDeleting(true);
    try {
      await deleteQuestion(currentQuestion._id);
      navigate('/questions');
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVote = async (vote: 'like' | 'dislike') => {
    if (!user || !currentQuestion) return;
    
    setIsVoting(true);
    try {
      await voteQuestion(currentQuestion._id, vote);
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Question not found</h2>
        <Link
          to="/questions"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Back to questions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/questions"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to questions
        </Link>

        {user && user._id === currentQuestion.author._id && (
          <div className="flex items-center space-x-2">
            <Link
              to={`/questions/${currentQuestion._id}/edit`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-error-600 border border-transparent rounded-lg hover:bg-error-700 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <div className="flex space-x-6">
          {/* Voting */}
          <div className="flex flex-col items-center space-y-4 min-w-[5rem]">
            <button
              onClick={() => handleVote('like')}
              disabled={!user || isVoting}
              // className={`p-3 rounded-full transition-colors ${
              //   currentQuestion.userVote === 'like'
              //     ? 'bg-accent-100 text-accent-600'
              //     : 'text-gray-400 hover:text-accent-600 hover:bg-accent-50'
              // } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ThumbsUp className="h-6 w-6" />
            </button>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-600">
                {/* {currentQuestion.likes} */}
              </div>
              <div className="text-sm text-gray-500">likes</div>
            </div>
            
            <button
              onClick={() => handleVote('dislike')}
              disabled={!user || isVoting}
              // className={`p-3 rounded-full transition-colors ${
              //   currentQuestion.userVote === 'dislike'
              //     ? 'bg-error-100 text-error-600'
              //     : 'text-gray-400 hover:text-error-600 hover:bg-error-50'
              // } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ThumbsDown className="h-6 w-6" />
            </button>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-error-600">
                {/* {currentQuestion.dislikes} */}
              </div>
              <div className="text-sm text-gray-500">dislikes</div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{currentQuestion.answers.length} answers</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{currentQuestion.views} views</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {currentQuestion.title}
              {currentQuestion.isEdited && (
                <span className="ml-3 text-base text-gray-500 font-normal">(edited)</span>
              )}
            </h1>

            {/* Content */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {currentQuestion.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/tags/${tag}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentQuestion.author.username}</p>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>asked {formatDate(currentQuestion.createdAt)}</span>
                    {currentQuestion.isEdited && currentQuestion.updatedAt && (
                      <span>• edited {formatDate(currentQuestion.updatedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Reputation: {currentQuestion.author.reputation}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {currentQuestion.answers.length} Answer{currentQuestion.answers.length !== 1 ? 's' : ''}
        </h2>

        {currentQuestion.answers.length > 0 ? (
          <div className="space-y-6">
            {currentQuestion.answers
              .sort((a, b) => b.likes.length - b.dislikes.length - (a.likes.length - a.dislikes.length))
              .map((answer) => (
                <AnswerCard key={answer._id} answer={answer} />
              ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No answers yet</h3>
            <p className="text-gray-500">Be the first to answer this question!</p>
          </div>
        )}
      </div>

      {/* Answer Form */}
      {user ? (
        <AnswerForm questionId={currentQuestion._id} />
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">Sign in to answer this question</p>
          <div className="space-x-3">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;