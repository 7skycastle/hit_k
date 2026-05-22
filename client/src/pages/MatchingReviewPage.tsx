import { CheckCircle2, Save, Square, Underline } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import PdfImageViewer from "../components/PdfImageViewer";
import ScoreBadge from "../components/ScoreBadge";
import type { Grade, Highlight, MatchCase, Report } from "../types";

const grades: Grade[] = ["S", "A", "B", "C", "D", "E"];

export default function MatchingReviewPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [tool, setTool] = useState<Highlight["type"]>("box");

  function load() {
    api.get(`/api/reports/${reportId}`).then((res) => {
      setReport(res.data);
      setSelectedId((current) => current || res.data.cases[0]?.id || "");
    });
  }

  useEffect(load, [reportId]);

  async function patch(matchId: string, body: Partial<MatchCase>) {
    await api.patch(`/api/matches/${matchId}`, body);
    load();
  }

  if (!report) return <div className="rounded-lg bg-white p-8 text-muted">검수 데이터를 불러오는 중입니다.</div>;

  const selected = report.cases.find((match) => match.id === selectedId) ?? report.cases[0];

  function addHighlight(side: "exam" | "company", highlight: Highlight) {
    if (!selected) return;
    const key = side === "exam" ? "examHighlights" : "companyHighlights";
    patch(selected.id, { [key]: [...selected[key], highlight] } as Partial<MatchCase>);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="no-print rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-black text-ink">매칭 후보 검수</h1>
        <p className="mt-2 text-sm leading-6 text-muted">등급과 공개 여부를 조정하고, 이미지 클릭으로 하이라이트를 추가합니다.</p>
        <div className="mt-5 space-y-2">
          {report.cases.map((match) => (
            <button key={match.id} onClick={() => setSelectedId(match.id)} className={`w-full rounded-md border p-3 text-left ${selected?.id === match.id ? "border-brand bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-ink">CASE {String(match.caseNo).padStart(2, "0")}</span>
                <ScoreBadge grade={match.grade} />
              </div>
              <p className="mt-2 text-sm font-bold text-gray-700">{match.title}</p>
              <p className="mt-1 text-xs text-muted">{match.approved ? "공개 승인" : "비공개"}</p>
            </button>
          ))}
        </div>
        <Link to={`/report/${report.id}`} className="mt-5 flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white">
          <CheckCircle2 className="h-4 w-4" /> 최종 리포트 보기
        </Link>
      </aside>

      {selected && (
        <section className="space-y-5">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-bold text-brand">CASE {String(selected.caseNo).padStart(2, "0")}</p>
                <h2 className="mt-1 text-2xl font-black text-ink">{selected.title}</h2>
                <p className="mt-2 text-sm text-muted">{selected.examQuestionNo} · {selected.companyQuestionNo} · 유사도 {selected.similarity}%</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={selected.grade} onChange={(event) => patch(selected.id, { grade: event.target.value as Grade })} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-bold">
                  {grades.map((grade) => <option key={grade} value={grade}>{grade}등급</option>)}
                </select>
                <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-bold">
                  <input type="checkbox" checked={selected.approved} onChange={(event) => patch(selected.id, { approved: event.target.checked })} />
                  공개 승인
                </label>
              </div>
            </div>
          </div>

          <div className="no-print rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-ink">하이라이트 도구</span>
              <button onClick={() => setTool("box")} className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-bold ${tool === "box" ? "bg-blue-50 text-brand" : "bg-gray-100 text-gray-700"}`}><Square className="h-4 w-4" /> 박스</button>
              <button onClick={() => setTool("underline")} className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-bold ${tool === "underline" ? "bg-blue-50 text-brand" : "bg-gray-100 text-gray-700"}`}><Underline className="h-4 w-4" /> 밑줄</button>
              <button onClick={() => setTool("check")} className={`rounded-md px-3 py-2 text-sm font-bold ${tool === "check" ? "bg-blue-50 text-brand" : "bg-gray-100 text-gray-700"}`}>체크</button>
              <button onClick={() => setTool("note")} className={`rounded-md px-3 py-2 text-sm font-bold ${tool === "note" ? "bg-blue-50 text-brand" : "bg-gray-100 text-gray-700"}`}>메모</button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-lg font-black text-ink">평가원 지문/문항</h3>
              <PdfImageViewer editable activeTool={tool} activeColor={tool === "underline" ? "yellow" : tool === "check" ? "green" : tool === "note" ? "gray" : "red"} imageUrl={selected.examImageUrl} highlights={selected.examHighlights} onAddHighlight={(highlight) => addHighlight("exam", highlight)} />
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-lg font-black text-ink">회사 콘텐츠</h3>
              <PdfImageViewer editable activeTool={tool} activeColor={tool === "underline" ? "yellow" : tool === "check" ? "green" : tool === "note" ? "gray" : "blue"} imageUrl={selected.companyImageUrl} highlights={selected.companyHighlights} onAddHighlight={(highlight) => addHighlight("company", highlight)} />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <label className="block text-sm font-black text-ink">AI 분석 요약<textarea className="mt-2 h-28 w-full rounded-md border border-gray-300 p-3 text-sm font-normal leading-6" value={selected.aiSummary} onChange={(event) => setReport({ ...report, cases: report.cases.map((item) => item.id === selected.id ? { ...item, aiSummary: event.target.value } : item) })} /></label>
            <label className="mt-4 block text-sm font-black text-ink">학생 체감 효과<textarea className="mt-2 h-24 w-full rounded-md border border-gray-300 p-3 text-sm font-normal leading-6" value={selected.studentBenefit} onChange={(event) => setReport({ ...report, cases: report.cases.map((item) => item.id === selected.id ? { ...item, studentBenefit: event.target.value } : item) })} /></label>
            <button onClick={() => patch(selected.id, { aiSummary: selected.aiSummary, studentBenefit: selected.studentBenefit })} className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-bold text-white">
              <Save className="h-4 w-4" /> 문구 저장
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
