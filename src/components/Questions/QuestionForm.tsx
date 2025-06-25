import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useForum } from '../../contexts/ForumContext';
import { useAuth } from '../../contexts/AuthContext';

interface QuestionFormProps {
  isEdit?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { createQuestion, updateQuestion, currentQuestion, fetchQuestion, isLoading } = useForum();

  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [tagInput, setTagInput] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{[key: string]: string}>({});

  React.useEffect(() => {
    if (isEdit && id) {
      fetchQuestion(id);
    }
  }, [isEdit, id]);

  React.useEffect(() => {
    if (isEdit && currentQuestion) {
      setTitle(currentQuestion.title);
      setContent(currentQuestion.content);
      setTags(currentQuestion.tags);
      setTagInput(currentQuestion.tags.join(', '));
    }
  }, [isEdit, currentQuestion]);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (title.length < 10) newErrors.title = 'Title must be at least 10 characters';
    if (!content.trim()) newErrors.content = 'Content is required';
    if (content.length < 30) newErrors.content = 'Content must be at least 30 characters';
    if (tags.length === 0) newErrors.tags = 'At least one tag is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTagInput = (value: string) => {
    setTagInput(value);
    const tagList = value
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .slice(0, 5); // Max 5 tags
    setTags(tagList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && id) {
        await updateQuestion(id, title.trim(), content.trim(), tags);
        navigate(`/questions/${id}`);
      } else {
        await createQuestion(title.trim(), content.trim(), tags);
        navigate('/');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      setErrors({ submit: 'Failed to save question. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isEdit && currentQuestion && user?._id !== currentQuestion.author._id) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-4">You can only edit your own questions.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Question' : 'Ask a Question'}
        </h1>
      </div>

      {/* Guidelines */}
      {!isEdit && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Writing a good question</h2>
          <div className="text-blue-800 space-y-2">
            <p>• Be specific and clear in your title</p>
            <p>• Provide detailed context and what you've tried</p>
            <p>• Include relevant code examples if applicable</p>
            <p>• Use appropriate tags to help others find your question</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8">
        {errors.submit && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-error-700">{errors.submit}</p>
          </div>
        )}

        {/* Title */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your programming question? Be specific."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.title ? 'border-error-300' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-error-600">{errors.title}</p>}
          <p className="mt-1 text-xs text-gray-500">
            {title.length}/150 characters
          </p>
        </div>

        {/* Content */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide more details about your question. Include what you've tried and any error messages."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.content ? 'border-error-300' : 'border-gray-300'
            }`}
          />
          {errors.content && <p className="mt-1 text-sm text-error-600">{errors.content}</p>}
          <p className="mt-1 text-xs text-gray-500">
            {content.length} characters (minimum 30)
          </p>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags *
          </label>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => handleTagInput(e.target.value)}
            placeholder="javascript, react, nodejs (separate with commas)"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.tags ? 'border-error-300' : 'border-gray-300'
            }`}
          />
          {errors.tags && <p className="mt-1 text-sm text-error-600">{errors.tags}</p>}
          
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <p className="mt-1 text-xs text-gray-500">
            Add up to 5 tags (separated by commas)
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? 'Updating...' : 'Publishing...'}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {isEdit ? 'Update Question' : 'Post Question'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;