import { ArrowRight, FileText, Gauge, Layers, PieChart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ScoreBadge from "../components/ScoreBadge";
import type { ContentFile, ExamFile, Grade, Report } from "../types";

const gradeOrder: Grade[] = ["S", "A", "B", "C", "D", "E"];

export default function DashboardPage() {
  const [contents, setContents] = useState<ContentFile[]>([]);
  const [exams, setExams] = useState<ExamFile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    Promise.all([api.get("/api/company"), api.get("/api/exams"), api.get("/api/reports")]).then(([companyRes, examRes, reportRes]) => {
      setContents(companyRes.data);
      setExams(examRes.data);
      setReports(reportRes.data);
    });
  }, []);

  const averageScore = useMemo(() => {
    if (!reports.length) return 0;
    return Math.round(reports.reduce((sum, report) => sum + report.totalScore, 0) / reports.length);
  }, [reports]);

  const gradeCounts = reports.reduce<Record<Grade, number>>((counts, report) => {
    gradeOrder.forEach((grade) => {
      counts[grade] += report.gradeCounts[grade] ?? 0;
    });
    return counts;
  }, { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 });

  const metrics = [
    { label: "등록 회사 콘텐츠", value: contents.length, icon: Layers },
    { label: "평가원 PDF", value: exams.length, icon: FileText },
    { label: "분석 리포트", value: reports.length, icon: PieChart },
    { label: "평균 연계 체감도", value: averageScore, icon: Gauge }
  ];

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 rounded-lg bg-white p-7 shadow-sm lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold text-brand">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-ink">국어 콘텐츠 적중 분석 현황</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted">평가원 국어 PDF와 회사 콘텐츠 PDF를 비교하여, 실제 지문·문항·선지 단위의 연계 체감도를 분석합니다.</p>
        </div>
        <Link to="/exam-upload" className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
          새 평가원 PDF 업로드 <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <Icon className="h-5 w-5 text-brand" />
            <p className="mt-4 text-sm font-bold text-muted">{label}</p>
            <div className="mt-1 text-3xl font-black text-ink">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-ink">등급별 건수</h2>
          <div className="mt-5 space-y-3">
            {gradeOrder.map((grade) => (
              <div key={grade} className="flex items-center justify-between rounded-md bg-gray-50 p-3">
                <ScoreBadge grade={grade} />
                <span className="text-lg font-black text-ink">{gradeCounts[grade]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-ink">최근 분석 결과</h2>
          <div className="mt-5 space-y-3">
            {reports.length === 0 && <p className="rounded-md bg-gray-50 p-5 text-sm text-muted">아직 생성된 리포트가 없습니다. 평가원 PDF를 업로드하면 mock 분석 리포트가 생성됩니다.</p>}
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between rounded-md border border-gray-200 p-4">
                <div>
                  <p className="font-black text-ink">{report.title}</p>
                  <p className="mt-1 text-sm text-muted">{new Date(report.createdAt).toLocaleString()} · {report.totalCases}개 케이스</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link className="rounded-md border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50" to={`/review/${report.id}`}>검수</Link>
                  <Link className="rounded-md bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-gray-700" to={`/report/${report.id}`}>리포트</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
