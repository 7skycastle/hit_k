import type { Report } from "../types";

export const sampleReport: Report = {
  id: "sample",
  title: "2026학년도 6월 평가원 국어 적중 분석 리포트",
  examId: "sample-exam",
  createdAt: new Date().toISOString(),
  totalScore: 82,
  totalCases: 6,
  gradeCounts: { S: 1, A: 2, B: 2, C: 1, D: 0, E: 0 },
  cases: []
};
