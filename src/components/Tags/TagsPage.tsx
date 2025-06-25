import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Search } from 'lucide-react';
import { useForum } from '../../contexts/ForumContext';

const TagsPage: React.FC = () => {
  const { questions } = useForum();
  const [searchTerm, setSearchTerm] = React.useState('');

  const tagStats = questions.reduce((acc, question) => {
    question.tags.forEach(tag => {
      if (!acc[tag]) {
        acc[tag] = {
          name: tag,
          questionCount: 0,
          totalViews: 0,
          totalAnswers: 0,
          recentActivity: question.createdAt
        };
      }
      acc[tag].questionCount++;
      acc[tag].totalViews += question.views;
      acc[tag].totalAnswers += question.answers.length;
      
      if (new Date(question.createdAt) > new Date(acc[tag].recentActivity)) {
        acc[tag].recentActivity = question.createdAt;
      }
    });
    return acc;
  }, {} as Record<string, {
    name: string;
    questionCount: number;
    totalViews: number;
    totalAnswers: number;
    recentActivity: string;
  }>);

  const filteredTags = Object.values(tagStats)
    .filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.questionCount - a.questionCount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tags</h1>
        <p className="text-gray-600 mb-6">
          Browse questions by technology, programming language, or topic. 
          Click on any tag to see related questions.
        </p>

        {/* Search */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <Tag className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{filteredTags.length}</p>
          <p className="text-gray-600">Total Tags</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {filteredTags.reduce((sum, tag) => sum + tag.questionCount, 0)}
          </p>
          <p className="text-gray-600">Tagged Questions</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(filteredTags.reduce((sum, tag) => sum + tag.questionCount, 0) / filteredTags.length) || 0}
          </p>
          <p className="text-gray-600">Avg Questions/Tag</p>
        </div>
      </div>

      {/* Tags Grid */}
      {filteredTags.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag) => (
            <Link
              key={tag.name}
              to={`/tags/${tag.name}`}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {tag.name}
                </span>
                <Tag className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium text-gray-900">{tag.questionCount}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Answers:</span>
                  <span className="font-medium text-gray-900">{tag.totalAnswers}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium text-gray-900">{tag.totalViews.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last activity:</span>
                  <span className="font-medium text-gray-900">{formatDate(tag.recentActivity)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search term' : 'No tags available yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TagsPage;