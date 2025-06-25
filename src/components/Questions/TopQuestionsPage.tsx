import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  MessageSquare,
  Eye,
  ThumbsUp,
  Plus,
  Crown,
  Medal,
  Award,
} from "lucide-react";
import { useForum } from "../../contexts/ForumContext";
import { useAuth } from "../../contexts/AuthContext";
import QuestionCard from "./QuestionCard";

const TopQuestionsPage: React.FC = () => {
  const { user } = useAuth();
  const { questions,setFilters,setPage,setLimit } = useForum();

  React.useEffect(() => {
    setFilters({
      search: "",
      sort: "score",
      order: "desc",
      status: "all",
    });
    setPage(1);
    setLimit(10);
  }, []);

  const featuredQuestions = questions.slice(0, 3);

  const remainingQuestions = questions.slice(3);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 1:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 2:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-primary-100 text-primary-600";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Top 10 Questions</h1>
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Discover the 10 most popular and engaging questions in our community.
          These questions have generated the most discussion, views, and
          positive feedback.
        </p>

        {user && (
          <Link
            to="/ask"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ask Your Question
          </Link>
        )}
      </div>

      {/* Popularity Algorithm Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          How we rank questions
        </h2>
        <div className="text-blue-800 space-y-2">
          <p>
            • <strong>Answers:</strong> Each answer adds 10 points (shows
            engagement)
          </p>
          <p>
            • <strong>Likes:</strong> Each like adds 5 points (community
            approval)
          </p>
          <p>
            • <strong>Views:</strong> Every 10 views adds 1 point (broad
            interest)
          </p>
          <p>
            • <strong>Dislikes:</strong> Each dislike subtracts 2 points
            (quality control)
          </p>
        </div>
      </div>

      {/* Featured Top 3 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🏆 Hall of Fame - Top 3
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredQuestions.map((question, index) => (
            <div
              key={question._id}
              className={`relative bg-white rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                index === 0
                  ? "border-yellow-300 shadow-lg transform scale-105"
                  : index === 1
                  ? "border-gray-300"
                  : "border-amber-300"
              }`}
            >
              {/* Rank Badge */}
              <div className="absolute -top-3 -left-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeStyle(
                    index
                  )} shadow-lg`}
                >
                  <span className="text-lg font-bold">#{index + 1}</span>
                </div>
              </div>

              {/* Rank Icon */}
              <div className="flex justify-center mb-4">
                {getRankIcon(index)}
              </div>

              {/* Question Content */}
              <div className="text-center">
                <Link
                  to={`/questions/${question._id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-primary-600 line-clamp-3 block mb-4"
                >
                  {question.title}
                </Link>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {question.answers.length}
                    </div>
                    <div className="text-xs text-gray-500">Answers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-600">
                      {question.views}
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {question.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {question.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{question.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Popularity Score */}
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    Popularity Score:{" "}
                    <span className="font-semibold text-primary-600">
                      {Math.round(question.score)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Overview for Top 10 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <MessageSquare className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {questions.reduce((sum, q) => sum + q.answers.length, 0)}
          </p>
          <p className="text-gray-600">Total Answers</p>
        </div>

        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <Eye className="h-8 w-8 text-accent-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {questions.reduce((sum, q) => sum + q.views, 0).toLocaleString()}
          </p>
          <p className="text-gray-600">Total Views</p>
        </div>

        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <ThumbsUp className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {questions.reduce((sum, q) => sum + q.likeCount, 0)}
          </p>
          <p className="text-gray-600">Total Likes</p>
        </div>

        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <TrendingUp className="h-8 w-8 text-warning-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(
              questions.reduce((sum, q) => sum + q.score, 0)
            )}
          </p>
          <p className="text-gray-600">Combined Score</p>
        </div>
      </div>

      {/* Complete Top 10 List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Complete Top 10 Rankings
          </h2>
          <div className="text-sm text-gray-500">
            Ranked by popularity score
          </div>
        </div>

        {/* Compact List View - All 10 Questions */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          {questions.map((question, index) => (
            <div
              key={question._id}
              className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
                index !== questions.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 mr-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankBadgeStyle(
                    index
                  )}`}
                >
                  <span className="text-sm font-bold">#{index + 1}</span>
                </div>
              </div>

              {/* Question Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/questions/${question._id}`}
                  className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-1 block mb-1"
                >
                  {question.title}
                </Link>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {question.answers.length} answers
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {question.views} views
                  </span>
                  <span className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {question.likeCount} likes
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="hidden md:flex flex-wrap gap-1 mx-4">
                {question.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Popularity Score */}
              <div className="flex-shrink-0 text-right">
                <div className="text-lg font-bold text-primary-600">
                  {Math.round(question.score)}
                </div>
                <div className="text-xs text-gray-500">score</div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Cards View - Questions 4-10 */}
        {remainingQuestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Questions 4-10 (Detailed View)
            </h3>
            {remainingQuestions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                showActions
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopQuestionsPage;
