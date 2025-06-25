import React from 'react';
import { Edit3, Trash2, ThumbsUp, ThumbsDown, Clock, User } from 'lucide-react';
import { Answer } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useForum } from '../../contexts/ForumContext';
import AnswerEditForm from './AnswerEditForm';

interface AnswerCardProps {
  answer: Answer;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ answer }) => {
  const { user } = useAuth();
  const { deleteAnswer, voteAnswer } = useForum();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isVoting, setIsVoting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this answer?')) return;
    
    setIsDeleting(true);
    try {
      await deleteAnswer(answer.id);
    } catch (error) {
      console.error('Error deleting answer:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVote = async (vote: 'like' | 'dislike') => {
    if (!user) return;
    
    setIsVoting(true);
    try {
      await voteAnswer(answer.id, vote);
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

  if (isEditing) {
    return (
      <AnswerEditForm
        answer={answer}
        onCancel={() => setIsEditing(false)}
        onSave={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex space-x-4">
        {/* Voting */}
        <div className="flex flex-col items-center space-y-3 min-w-[4rem]">
          <button
            onClick={() => handleVote('like')}
            disabled={!user || isVoting}
            className={`p-2 rounded-full transition-colors ${
              answer.userVote === 'like'
                ? 'bg-accent-100 text-accent-600'
                : 'text-gray-400 hover:text-accent-600 hover:bg-accent-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsUp className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-accent-600">
              {answer.likes}
            </div>
            <div className="text-xs text-gray-500">likes</div>
          </div>
          
          <button
            onClick={() => handleVote('dislike')}
            disabled={!user || isVoting}
            className={`p-2 rounded-full transition-colors ${
              answer.userVote === 'dislike'
                ? 'bg-error-100 text-error-600'
                : 'text-gray-400 hover:text-error-600 hover:bg-error-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsDown className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-error-600">
              {answer.dislikes}
            </div>
            <div className="text-xs text-gray-500">dislikes</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="prose max-w-none mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {answer.content}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{answer.author.username}</p>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>answered {formatDate(answer.createdAt)}</span>
                  {answer.isEdited && <span>• edited</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            {user && user.id === answer.authorId && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
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
  );
};

export default AnswerCard;