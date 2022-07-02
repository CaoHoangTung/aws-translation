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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<UploadPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="jobs">
            <Route path=":jobId" element={<TranslationJob />} />
          </Route>
          {/* <Route
              path="*"
              element={<Navigate to="/" replace />}
          /> */}
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}
