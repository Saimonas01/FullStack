import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Tag, TrendingUp, Plus, Code, Lightbulb, BookOpen } from 'lucide-react';
import { useForum } from '../../contexts/ForumContext';
import { useAuth } from '../../contexts/AuthContext';
import QuestionCard from '../Questions/QuestionCard';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { questions } = useForum();

  const recentQuestions = questions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const tagCounts = questions.reduce((acc, question) => {
    question.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const popularTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to DevForum
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A community-driven platform where developers help each other solve coding challenges, 
          share knowledge, and grow together. Ask questions, provide answers, and learn from 
          experienced developers worldwide.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link
              to="/ask"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ask Your First Question
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Join the Community
              </Link>
              <Link
                to="/questions"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Browse Questions
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Code className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask & Answer</h3>
          <p className="text-gray-600">
            Get help with your coding problems and help others by sharing your knowledge and experience.
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-6 w-6 text-accent-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn & Grow</h3>
          <p className="text-gray-600">
            Discover new technologies, best practices, and solutions to common programming challenges.
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6 text-secondary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Reputation</h3>
          <p className="text-gray-600">
            Earn reputation points by providing helpful answers and contributing to the community.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <MessageSquare className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
          <p className="text-gray-600">Questions</p>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <Users className="h-8 w-8 text-accent-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {questions.reduce((total, q) => total + q.answers.length, 0)}
          </p>
          <p className="text-gray-600">Answers</p>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <Tag className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{Object.keys(tagCounts).length}</p>
          <p className="text-gray-600">Tags</p>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <TrendingUp className="h-8 w-8 text-warning-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {questions.reduce((total, q) => total + q.views, 0)}
          </p>
          <p className="text-gray-600">Views</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Questions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Questions</h2>
            <Link
              to="/questions"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link
                to="/questions/top"
                className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <TrendingUp className="h-5 w-5 text-primary-600 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Top Questions</div>
                  <div className="text-xs text-gray-500">Most popular discussions</div>
                </div>
              </Link>
              
              <Link
                to="/tags"
                className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <Tag className="h-5 w-5 text-secondary-600 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Browse Tags</div>
                  <div className="text-xs text-gray-500">Find topics of interest</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Popular Tags */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Popular Tags</h3>
              <Link
                to="/tags"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(({ tag, count }) => (
                <Link
                  key={tag}
                  to={`/tags/${tag}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                >
                  {tag}
                  <span className="ml-1 text-xs text-primary-600">({count})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;