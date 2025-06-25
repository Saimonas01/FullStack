import React from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, MapPin, Globe, Settings, MessageSquare, ThumbsUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useForum } from '../../contexts/ForumContext';
import QuestionCard from '../Questions/QuestionCard';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { questions } = useForum();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
        <Link
          to="/login"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const userQuestions = questions.filter(q => q.author._id === user._id);
  const totalAnswers = questions.reduce((total, question) => 
    total + question.answers.filter(a => a.author._id === user._id).length, 0
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-primary-600" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-lg text-gray-600 mt-1">Reputation: {user.reputation}</p>
              
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                </div>
                
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.website && (
                  <div className="flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
              
              {user.bio && (
                <p className="mt-4 text-gray-700">{user.bio}</p>
              )}
            </div>
          </div>

          <Link
            to="/settings"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <MessageSquare className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{userQuestions.length}</p>
          <p className="text-gray-600">Questions Asked</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <ThumbsUp className="h-8 w-8 text-accent-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalAnswers}</p>
          <p className="text-gray-600">Answers Given</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <User className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{user.reputation}</p>
          <p className="text-gray-600">Reputation</p>
        </div>
      </div>

      {/* Recent Questions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Questions</h2>
        
        {userQuestions.length > 0 ? (
          <div className="space-y-4">
            {userQuestions
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 10)
              .map((question) => (
                <QuestionCard key={question._id} question={question} showActions />
              ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-500 mb-4">You haven't asked any questions yet.</p>
            <Link
              to="/ask"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Ask Your First Question
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;