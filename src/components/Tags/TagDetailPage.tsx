import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Tag, Plus } from 'lucide-react';
import { useForum } from '../../contexts/ForumContext';
import { useAuth } from '../../contexts/AuthContext';
import QuestionCard from '../Questions/QuestionCard';

const TagDetailPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const { user } = useAuth();
  const { questions } = useForum();

  if (!tag) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tag not found</h2>
        <Link to="/tags" className="text-primary-600 hover:text-primary-700 font-medium">
          Back to tags
        </Link>
      </div>
    );
  }

  const taggedQuestions = questions.filter(question => 
    question.tags.includes(tag.toLowerCase())
  );

  const sortedQuestions = taggedQuestions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalAnswers = taggedQuestions.reduce((sum, q) => sum + q.answers.length, 0);
  const totalViews = taggedQuestions.reduce((sum, q) => sum + q.views, 0);
  const answeredQuestions = taggedQuestions.filter(q => q.answers.length > 0).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          to="/tags"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tags
        </Link>
      </div>

      {/* Tag Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
              <Tag className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">{tag}</h1>
              <p className="text-gray-600 mt-1">
                Questions tagged with "{tag}"
              </p>
            </div>
          </div>

          {user && (
            <Link
              to={`/ask?tag=${tag}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Link>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{taggedQuestions.length}</p>
            <p className="text-gray-600">Questions</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalAnswers}</p>
            <p className="text-gray-600">Answers</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
            <p className="text-gray-600">Views</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {taggedQuestions.length > 0 ? Math.round((answeredQuestions / taggedQuestions.length) * 100) : 0}%
            </p>
            <p className="text-gray-600">Answered</p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {taggedQuestions.length} Question{taggedQuestions.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {sortedQuestions.length > 0 ? (
          <div className="space-y-4">
            {sortedQuestions.map((question) => (
              <QuestionCard key={question._id} question={question} showActions />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-500 mb-4">
              Be the first to ask a question about {tag}!
            </p>
            {user && (
              <Link
                to={`/ask?tag=${tag}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ask Question
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagDetailPage;