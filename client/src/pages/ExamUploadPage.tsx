import { SearchCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import UploadBox from "../components/UploadBox";
import type { ExamFile, Report } from "../types";

export default function ExamUploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("2026학년도 6월 평가원 국어");
  const [examDate, setExamDate] = useState("2026-06-04");
  const [exam, setExam] = useState<ExamFile | null>(null);
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!files[0]) return;
    setLoading(true);
    const body = new FormData();
    body.append("file", files[0]);
    body.append("title", title);
    body.append("examDate", examDate);
    const res = await api.post<ExamFile>("/api/exam/upload", body);
    setExam(res.data);
    setLoading(false);
  }

  async function analyze() {
    if (!exam) return;
    setLoading(true);
    const res = await api.post<Report>(`/api/exam/${exam.id}/analyze`);
    setLoading(false);
    navigate(`/review/${res.data.id}`);
  }

  return (
    <div className="space-y-7">
      <section className="rounded-lg bg-white p-7 shadow-sm">
        <p className="text-sm font-bold text-brand">Exam Upload</p>
        <h1 className="mt-2 text-3xl font-black text-ink">평가원 PDF 업로드 및 분석</h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">평가원 PDF를 업로드하면 등록된 회사 콘텐츠와의 mock 매칭 후보를 생성합니다.</p>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <UploadBox onFiles={setFiles} />
          <button disabled={!files.length || loading} onClick={upload} className="w-full rounded-md bg-brand px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">
            {loading ? "처리 중..." : "평가원 PDF 저장"}
          </button>
          <button disabled={!exam || loading} onClick={analyze} className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">
            <SearchCheck className="h-4 w-4" /> 분석 시작
          </button>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-ink">시험 정보</h2>
          <label className="mt-5 block text-sm font-bold text-gray-700">시험명<input className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 font-normal" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className="mt-4 block text-sm font-bold text-gray-700">시행일<input type="date" className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 font-normal" value={examDate} onChange={(event) => setExamDate(event.target.value)} /></label>
          {exam && <div className="mt-5 rounded-md bg-blue-50 p-4 text-sm text-brand"><b>{exam.title}</b> 저장 완료 · 이미지 {exam.imagePaths.length}장 생성</div>}
        </div>
      </section>
    </div>
  );
}
