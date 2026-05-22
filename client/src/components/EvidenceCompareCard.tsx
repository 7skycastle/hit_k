import type { MatchCase } from "../types";
import PdfImageViewer from "./PdfImageViewer";
import ScoreBadge from "./ScoreBadge";

export default function EvidenceCompareCard({ match }: { match: MatchCase }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-7 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-extrabold text-brand">CASE {String(match.caseNo).padStart(2, "0")}</p>
          <h2 className="mt-2 text-2xl font-black text-ink">{match.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{match.hitTypeDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ScoreBadge grade={match.grade} score={match.score} />
          <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-brand">{match.hitType}</span>
          <span className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-700">유사도 {match.similarity}%</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-muted">평가원 실제 PDF 캡처</p>
              <h3 className="text-lg font-black text-ink">{match.examLabel}</h3>
            </div>
            <span className="rounded bg-gray-100 px-2 py-1 text-sm font-bold text-gray-600">{match.examQuestionNo}</span>
          </div>
          <PdfImageViewer imageUrl={match.examImageUrl} highlights={match.examHighlights} />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-muted">회사 콘텐츠 실제 PDF 캡처</p>
              <h3 className="text-lg font-black text-ink">{match.companyLabel}</h3>
            </div>
            <span className="rounded bg-gray-100 px-2 py-1 text-sm font-bold text-gray-600">{match.companyQuestionNo}</span>
          </div>
          <PdfImageViewer imageUrl={match.companyImageUrl} highlights={match.companyHighlights} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md bg-gray-50 p-5">
          <h4 className="font-black text-ink">AI 분석 요약</h4>
          <p className="mt-3 leading-7 text-gray-700">{match.aiSummary}</p>
          <h4 className="mt-5 font-black text-ink">왜 적중으로 볼 수 있는가</h4>
          <ul className="mt-3 space-y-2">
            {match.evidencePoints.map((point) => (
              <li key={point} className="flex gap-2 text-sm leading-6 text-gray-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-blue-100 bg-blue-50 p-5">
          <h4 className="font-black text-brand">학생 체감 효과</h4>
          <p className="mt-3 leading-7 text-gray-800">{match.studentBenefit}</p>
          <p className="mt-5 border-t border-blue-100 pt-4 text-xs leading-5 text-muted">{match.caution}</p>
        </div>
      </div>
    </article>
  );
}
