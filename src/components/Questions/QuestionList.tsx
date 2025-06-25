import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Filter, SortAsc, SortDesc, Calendar, MessageSquare, Search, X } from 'lucide-react';
import QuestionCard from './QuestionCard';
import { useForum } from '../../contexts/ForumContext';
import { useAuth } from '../../contexts/AuthContext';

const QuestionList: React.FC = () => {
  const { user } = useAuth();
  const { questions, isLoading } = useForum();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'date';
  const sortOrder = searchParams.get('order') || 'desc';
  const statusFilter = searchParams.get('status') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = React.useState(searchQuery);
  const [showFilters, setShowFilters] = React.useState(false);
  const [searchSuggestions, setSearchSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const itemsPerPage = 10;

  const searchInContent = (question: any, searchTerm: string): boolean => {
    const term = searchTerm.toLowerCase();
    
    if (question.title.toLowerCase().includes(term)) return true;
    
    if (question.content.toLowerCase().includes(term)) return true;
    
    if (question.tags.some((tag: string) => tag.toLowerCase().includes(term))) return true;
    
    if (question.author.username.toLowerCase().includes(term)) return true;
    
    if (question.answers.some((answer: any) => 
      answer.content.toLowerCase().includes(term) ||
      answer.author.username.toLowerCase().includes(term)
    )) return true;
    
    const programmingLanguages = [
      'javascript', 'js', 'typescript', 'ts', 'python', 'py', 'java', 'c++', 'cpp', 'c#', 'csharp',
      'php', 'ruby', 'go', 'golang', 'rust', 'swift', 'kotlin', 'dart', 'scala', 'r', 'matlab',
      'html', 'css', 'sql', 'bash', 'shell', 'powershell', 'perl', 'lua', 'haskell', 'clojure',
      'react', 'vue', 'angular', 'nodejs', 'node', 'express', 'django', 'flask', 'spring',
      'laravel', 'rails', 'nextjs', 'nuxt', 'svelte', 'ember', 'backbone', 'jquery',
      'mongodb', 'mysql', 'postgresql', 'sqlite', 'redis', 'elasticsearch', 'firebase',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'github', 'gitlab', 'jenkins',
      'webpack', 'vite', 'babel', 'eslint', 'prettier', 'jest', 'cypress', 'selenium'
    ];
    
    if (programmingLanguages.some(lang => 
      lang.includes(term) || term.includes(lang)
    )) {
      const fullText = `${question.title} ${question.content} ${question.tags.join(' ')} ${question.answers.map((a: any) => a.content).join(' ')}`.toLowerCase();
      return fullText.includes(term);
    }
    
    return false;
  };

  const generateSuggestions = (input: string) => {
    if (input.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = new Set<string>();
    const term = input.toLowerCase();

    questions.forEach(question => {
      question.tags.forEach(tag => {
        if (tag.toLowerCase().includes(term) && suggestions.size < 8) {
          suggestions.add(tag);
        }
      });
    });

    const techKeywords = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'react', 'vue', 'angular', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel', 'nextjs',
      'mongodb', 'mysql', 'postgresql', 'sqlite', 'redis', 'firebase', 'aws', 'docker', 'kubernetes',
      'html', 'css', 'sass', 'tailwind', 'bootstrap', 'webpack', 'vite', 'git', 'github'
    ];

    techKeywords.forEach(keyword => {
      if (keyword.includes(term) && suggestions.size < 8) {
        suggestions.add(keyword);
      }
    });

    questions.forEach(question => {
      const titleWords = question.title.toLowerCase().split(' ');
      titleWords.forEach((word, index) => {
        if (word.includes(term) && word.length > 2 && suggestions.size < 8) {
          const suggestion = titleWords.slice(index, Math.min(index + 3, titleWords.length)).join(' ');
          if (suggestion.length > term.length) {
            suggestions.add(suggestion);
          }
        }
      });
    });

    setSearchSuggestions(Array.from(suggestions));
  };

  React.useEffect(() => {
    generateSuggestions(searchInput);
    
    const delayedSearch = setTimeout(() => {
      if (searchInput !== searchQuery) {
        const newParams = new URLSearchParams(searchParams);
        if (searchInput) {
          newParams.set('search', searchInput);
        } else {
          newParams.delete('search');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchInput, searchQuery, searchParams, setSearchParams]);

  const getFilteredAndSortedQuestions = () => {
    let filtered = questions;

    if (searchQuery) {
      filtered = filtered.filter(question => searchInContent(question, searchQuery));
    }

    if (statusFilter === 'answered') {
      filtered = filtered.filter(q => q.answers.length > 0);
    } else if (statusFilter === 'unanswered') {
      filtered = filtered.filter(q => q.answers.length === 0);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'answers') {
        comparison = a.answers.length - b.answers.length;
      } else if (sortBy === 'views') {
        comparison = a.views - b.views;
      } else if (sortBy === 'relevance' && searchQuery) {
        const scoreA = getRelevanceScore(a, searchQuery);
        const scoreB = getRelevanceScore(b, searchQuery);
        comparison = scoreA - scoreB;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  };

  const getRelevanceScore = (question: any, searchTerm: string): number => {
    const term = searchTerm.toLowerCase();
    let score = 0;

    if (question.title.toLowerCase().includes(term)) score += 10;
    
    if (question.tags.some((tag: string) => tag.toLowerCase().includes(term))) score += 8;
    
    if (question.content.toLowerCase().includes(term)) score += 5;
    
    if (question.answers.some((answer: any) => answer.content.toLowerCase().includes(term))) score += 3;
    
    if (question.author.username.toLowerCase().includes(term)) score += 1;

    score += question.answers.length * 0.5;
    score += question.views * 0.001;

    return score;
  };

  const filteredQuestions = getFilteredAndSortedQuestions();
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    updateFilter('order', newOrder);
  };

  const clearSearch = () => {
    setSearchInput('');
    setShowSuggestions(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setShowSuggestions(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('search', suggestion);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="mt-2 text-gray-600">
            {filteredQuestions.length} questions found
            {searchQuery && (
              <span className="ml-2">
                for '<span className="font-medium text-gray-900">{searchQuery}</span>'
              </span>
            )}
          </p>
        </div>
        
        {user && (
          <Link
            to="/ask"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ask Question
          </Link>
        )}
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Enhanced Search */}
          <div className="flex-1 relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search questions, answers, tags, programming languages..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <Search className="h-4 w-4 inline mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Search Tips */}
        {!searchQuery && (
          <div className="mt-3 text-xs text-gray-500">
            <p><strong>Search tips:</strong> Try searching for programming languages (e.g., "javascript", "python"), 
            technologies (e.g., "react", "django"), or specific topics. You can also search within answers and comments.</p>
          </div>
        )}

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-down">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="all">All Questions</option>
                  <option value="answered">Answered</option>
                  <option value="unanswered">Unanswered</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="date">Date</option>
                  <option value="answers">Answer Count</option>
                  <option value="views">View Count</option>
                  {searchQuery && <option value="relevance">Relevance</option>}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <button
                  onClick={toggleSortOrder}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'desc' ? (
                    <>
                      <SortDesc className="h-4 w-4 mr-2" />
                      {sortBy === 'date' ? 'Newest First' : 
                       sortBy === 'answers' ? 'Most Answers' :
                       sortBy === 'views' ? 'Most Views' : 'Most Relevant'}
                    </>
                  ) : (
                    <>
                      <SortAsc className="h-4 w-4 mr-2" />
                      {sortBy === 'date' ? 'Oldest First' : 
                       sortBy === 'answers' ? 'Least Answers' :
                       sortBy === 'views' ? 'Least Views' : 'Least Relevant'}
                    </>
                  )}
                </button>
              </div>

              {/* Clear Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actions
                </label>
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams(new URLSearchParams());
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sort Info */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          {sortBy === 'date' ? (
            <Calendar className="h-4 w-4" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          <span>
            Sorted by {sortBy === 'date' ? 'date' : sortBy === 'answers' ? 'answer count' : sortBy === 'views' ? 'view count' : 'relevance'} 
            ({sortOrder === 'desc' ? 'descending' : 'ascending'})
          </span>
        </div>
        
        {currentPage > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Questions */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : paginatedQuestions.length > 0 ? (
        <>
          <div className="space-y-4 mb-8">
            {paginatedQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} showActions />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? 'text-white bg-primary-600'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search terms or filters'
              : 'Be the first to ask a question!'
            }
          </p>
          {searchQuery && (
            <div className="mb-4">
              <button
                onClick={clearSearch}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
          {user && (
            <Link
              to="/ask"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionList;