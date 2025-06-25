import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Tag, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Questions', href: '/questions', icon: MessageSquare },
    { name: 'Top Questions', href: '/questions/top', icon: TrendingUp },
    { name: 'Tags', href: '/tags', icon: Tag },
  ];

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="px-2 mt-6">
              <Link
                to="/ask"
                className="group flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ask Question
              </Link>
            </div>
          )}

          <div className="px-2 mt-8">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Popular Tags
            </h3>
            <div className="mt-2 space-y-1">
              {['react', 'javascript', 'python', 'typescript', 'css', 'nodejs'].map((tag) => (
                <Link
                  key={tag}
                  to={`/tags/${tag}`}
                  className="group flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Tag className="mr-2 h-3 w-3 text-gray-400" />
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;