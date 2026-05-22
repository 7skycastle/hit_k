import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CompanyUploadPage from "./pages/CompanyUploadPage";
import DashboardPage from "./pages/DashboardPage";
import ExamUploadPage from "./pages/ExamUploadPage";
import MatchingReviewPage from "./pages/MatchingReviewPage";
import ReportPage from "./pages/ReportPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/company-upload" element={<CompanyUploadPage />} />
        <Route path="/exam-upload" element={<ExamUploadPage />} />
        <Route path="/review/:reportId" element={<MatchingReviewPage />} />
        <Route path="/report/:reportId" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
