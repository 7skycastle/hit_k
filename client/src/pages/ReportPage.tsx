import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import EvidenceCompareCard from "../components/EvidenceCompareCard";
import MatchSummaryCard from "../components/MatchSummaryCard";
import type { Report } from "../types";

export default function ReportPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    api.get(`/api/reports/${reportId}`).then((res) => setReport(res.data));
  }, [reportId]);

  if (!report) return <div className="rounded-lg bg-white p-8 text-muted">리포트를 불러오는 중입니다.</div>;

  const approvedCases = report.cases.filter((match) => match.approved);

  return (
    <div className="space-y-8">
      <div className="no-print flex justify-end">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-gray-700">
          <Printer className="h-4 w-4" /> PDF 캡처/인쇄
        </button>
      </div>
      <MatchSummaryCard report={report} />
      <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm leading-6 text-muted shadow-sm">
        본 분석은 동일 문항 출제를 의미하지 않습니다. 학생이 시험장에서 체감할 수 있는 연계 요소와 학습 효과를 분석한 자료입니다.
      </div>
      <div className="space-y-8">
        {approvedCases.map((match) => <EvidenceCompareCard key={match.id} match={match} />)}
      </div>
    </div>
  );
}
