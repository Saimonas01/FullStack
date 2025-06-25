import React from 'react';
import { Save, X } from 'lucide-react';
import { Answer } from '../../types';
import { useForum } from '../../contexts/ForumContext';

interface AnswerEditFormProps {
  answer: Answer;
  onCancel: () => void;
  onSave: () => void;
}

const AnswerEditForm: React.FC<AnswerEditFormProps> = ({ answer, onCancel, onSave }) => {
  const { updateAnswer } = useForum();
  const [content, setContent] = React.useState(answer.content);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Answer content is required');
      return;
    }
    
    if (content.length < 30) {
      setError('Answer must be at least 30 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await updateAnswer(answer.id, content.trim());
      onSave();
    } catch (error) {
      console.error('Error updating answer:', error);
      setError('Failed to update answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Answer</h3>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-error-700 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your answer here..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {content.length} characters (minimum 30)
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || content.length < 30}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnswerEditForm;