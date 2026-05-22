import type { Grade, Report } from "../types";
import ScoreBadge from "./ScoreBadge";

const gradeOrder: Grade[] = ["S", "A", "B", "C", "D", "E"];

export default function MatchSummaryCard({ report }: { report: Report }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-7 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold text-brand">실사 근거 중심 적중 리포트</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{report.title}</h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-muted">
            이 리포트는 단순 키워드 일치가 아니라, 실제 시험장에서 체감 가능한 작품·제재·핵심 개념·문항 구조·선지 판단 기준의 연결성을 분석합니다.
          </p>
        </div>
        <div className="min-w-52 rounded-lg bg-[#111827] p-5 text-white">
          <p className="text-sm text-gray-300">전체 연계 체감도</p>
          <div className="mt-2 text-5xl font-black">{report.totalScore}</div>
          <p className="mt-2 text-sm text-gray-300">총 {report.totalCases}개 승인 케이스</p>
        </div>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {gradeOrder.map((grade) => (
          <div key={grade} className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <ScoreBadge grade={grade} />
            <div className="mt-3 text-2xl font-black text-ink">{report.gradeCounts[grade]}</div>
            <div className="text-sm text-muted">케이스</div>
          </div>
        ))}
      </div>
    </section>
  );
}
