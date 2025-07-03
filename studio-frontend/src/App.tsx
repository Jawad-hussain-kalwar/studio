import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import Landing from "./pages/Landing.tsx";
import SignIn from "./pages/Public/SignIn.tsx";
import SignUp from "./pages/Public/SignUp.tsx";
import AppLayout from "./components/AppLayout.tsx";
import ChatPlaygroundPage from "./pages/App/Studio/ChatPlaygroundPage.tsx";
import GenerateImagePage from "./pages/App/Studio/GenerateImagePage.tsx";
import ComingSoon from "./components/ComingSoon.tsx";
import DashboardPage from "./pages/App/DashboardPage.tsx";
import OAuthCallback from "./components/OAuthCallback.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

const AppWithOAuthCheck = () => {
  const [searchParams] = useSearchParams();
  const hasToken = searchParams.has('token');
  const hasError = searchParams.has('error');
  
  // If we have OAuth parameters, show the callback component
  if (hasToken || hasError) {
    return <OAuthCallback />;
  }
  
  // Otherwise, show the protected app layout
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Authenticated App Routes */}
          <Route path="/app" element={<AppWithOAuthCheck />}>
            <Route index element={<Navigate to="/app/studio/chat" replace />} />
            <Route path="studio/chat" element={<ChatPlaygroundPage />} />
            <Route path="home" element={<ComingSoon message="Home Page - Coming Soon" />} />
            <Route path="studio/stream" element={<ComingSoon message="Stream Playground - Coming Soon" />} />
            <Route path="studio/generate/image" element={<GenerateImagePage />} />
            <Route path="studio/generate/speech" element={<ComingSoon message="Speech Generation - Coming Soon" />} />
            <Route path="studio/generate/media" element={<ComingSoon message="Media Generation - Coming Soon" />} />
            <Route path="studio/build" element={<ComingSoon message="Build Playground - Coming Soon" />} />
            <Route path="studio/history" element={<ComingSoon message="History - Coming Soon" />} />
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
          
          {/* Alias route for chat */}
          <Route path="/chat" element={<Navigate to="/app/studio/chat" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
