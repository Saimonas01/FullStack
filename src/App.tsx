import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ForumProvider } from "./contexts/ForumContext";
import Layout from "./components/Layout/Layout";
import QuestionList from "./components/Questions/QuestionList";
import QuestionDetail from "./components/Questions/QuestionDetail";
import QuestionForm from "./components/Questions/QuestionForm";
import TopQuestionsPage from "./components/Questions/TopQuestionsPage";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import ProfilePage from "./components/Profile/ProfilePage";
import SettingsPage from "./components/Profile/SettingsPage";
import TagsPage from "./components/Tags/TagsPage";
import TagDetailPage from "./components/Tags/TagDetailPage";
import HomePage from "./components/Home/HomePage";
import { LoadingProvider } from "./contexts/GlobalLoadingContext";
import { Loader } from "lucide-react";

const App = () => {
  const [isGlobalLoading, setGlobalLoading] = React.useState(true);

  return (
    <LoadingProvider
      isGlobalLoading={isGlobalLoading}
      setGlobalLoading={setGlobalLoading}
    >
      <AuthProvider>
        <ForumProvider>
          {isGlobalLoading ? (
            <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <Loader className="animate-spin h-10 w-10 text-gray-700" />
            </div>
          ) : (
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="questions" element={<QuestionList />} />
                  <Route path="questions/top" element={<TopQuestionsPage />} />
                  <Route path="questions/:id" element={<QuestionDetail />} />
                  <Route
                    path="questions/:id/edit"
                    element={<QuestionForm isEdit />}
                  />
                  <Route path="ask" element={<QuestionForm />} />
                  <Route path="tags" element={<TagsPage />} />
                  <Route path="tags/:tag" element={<TagDetailPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Router>
          )}
        </ForumProvider>
      </AuthProvider>
    </LoadingProvider>
  );
};

export default App;
