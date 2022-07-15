import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import UploadPage from "./pages/upload";
import TranslationJobs from "./pages/translation-jobs";
import TranslationJob from "./pages/translation-job";
import LoginPage from "./pages/login";
import AuthPage from "./pages/auth";
import HomePage from "./pages/home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="result" >
            <Route index element={<TranslationJobs />} />
            <Route path=":jobId" element={<TranslationJob />} />
          </Route>
          <Route
              path="*"
              element={<Navigate to="/" replace />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
