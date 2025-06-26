import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import Landing from "./pages/Landing.tsx";
import SignIn from "./pages/Public/SignIn.tsx";
import SignUp from "./pages/Public/SignUp.tsx";
import AppLayout from "./components/AppLayout.tsx";
import ChatPlaygroundPage from "./pages/App/Studio/ChatPlaygroundPage.tsx";

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
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/studio/chat" replace />} />
            <Route path="studio/chat" element={<ChatPlaygroundPage />} />
            <Route path="home" element={<div>Home Page - Coming Soon</div>} />
            <Route path="studio/stream" element={<div>Stream Playground - Coming Soon</div>} />
            <Route path="studio/generate/image" element={<div>Image Generation - Coming Soon</div>} />
            <Route path="studio/generate/speech" element={<div>Speech Generation - Coming Soon</div>} />
            <Route path="studio/generate/media" element={<div>Media Generation - Coming Soon</div>} />
            <Route path="studio/build" element={<div>Build Playground - Coming Soon</div>} />
            <Route path="studio/history" element={<div>History - Coming Soon</div>} />
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
