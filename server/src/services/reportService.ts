import { v4 as uuid } from "uuid";
import { calculateGradeCounts, calculateReportScore, generateMockMatches } from "./matchingService.js";
import { readJsonFile, writeJsonFile } from "./store.js";
import type { ContentFile, ExamFile, MatchCase, Report } from "./types.js";

export async function createMockReport(examId: string, examTitle: string): Promise<Report> {
  const reports = await getReports();
  const matches = await hydrateMatchImages(generateMockMatches(examId), examId);
  const approvedCases = matches.filter((match) => match.approved);
  const report: Report = {
    id: uuid(),
    title: `${examTitle} 적중 분석 리포트`,
    examId,
    createdAt: new Date().toISOString(),
    totalScore: calculateReportScore(matches),
    totalCases: approvedCases.length,
    gradeCounts: calculateGradeCounts(matches),
    cases: matches
  };
  await writeJsonFile("reports.json", [report, ...reports]);
  return report;
}

export async function getReports(): Promise<Report[]> {
  return readJsonFile<Report[]>("reports.json", []);
}

export async function getReport(reportId: string): Promise<Report | undefined> {
  return (await getReports()).find((report) => report.id === reportId);
}

export async function patchMatch(matchId: string, patch: Partial<Pick<MatchCase, "grade" | "approved" | "aiSummary" | "studentBenefit" | "examHighlights" | "companyHighlights">>): Promise<MatchCase | undefined> {
  const reports = await getReports();
  let updated: MatchCase | undefined;
  const nextReports = reports.map((report) => {
    const cases = report.cases.map((match) => {
      if (match.id !== matchId) return match;
      updated = { ...match, ...patch };
      return updated;
    });
    const approvedCases = cases.filter((match) => match.approved);
    return { ...report, cases, totalScore: calculateReportScore(cases), totalCases: approvedCases.length, gradeCounts: calculateGradeCounts(cases) };
  });
  await writeJsonFile("reports.json", nextReports);
  return updated;
}

export async function ensureSampleReport(): Promise<void> {
  const [reports, exams, contents] = await Promise.all([
    getReports(),
    readJsonFile<ExamFile[]>("examContents.json", []),
    readJsonFile<ContentFile[]>("companyContents.json", [])
  ]);
  if (reports.length > 0) return;

  const exam: ExamFile = exams[0] ?? {
    id: "sample-exam",
    title: "2026학년도 6월 평가원 국어",
    examDate: "2026-06-04",
    fileName: "sample-exam.pdf",
    originalPdfPath: "mock",
    imagePaths: ["/generated/images/exam/mock-page-1.svg", "/generated/images/exam/mock-page-2.svg", "/generated/images/exam/mock-page-3.svg"],
    createdAt: new Date().toISOString()
  };
  const content: ContentFile = contents[0] ?? {
    id: "sample-company",
    title: "상상국어 실전 모의고사",
    type: "mock_exam",
    area: "common",
    round: "3회",
    publishMonth: "2026-05",
    description: "mock 샘플 회사 콘텐츠",
    fileName: "sample-company.pdf",
    originalPdfPath: "mock",
    imagePaths: ["/generated/images/company/mock-page-1.svg", "/generated/images/company/mock-page-2.svg", "/generated/images/company/mock-page-3.svg"],
    createdAt: new Date().toISOString()
  };

  if (exams.length === 0) await writeJsonFile("examContents.json", [exam]);
  if (contents.length === 0) await writeJsonFile("companyContents.json", [content]);

  const matches = await hydrateMatchImages(generateMockMatches(exam.id), exam.id);
  const approvedCases = matches.filter((match) => match.approved);
  const report: Report = {
    id: "sample-report",
    title: `${exam.title} 적중 분석 리포트`,
    examId: exam.id,
    createdAt: new Date().toISOString(),
    totalScore: calculateReportScore(matches),
    totalCases: approvedCases.length,
    gradeCounts: calculateGradeCounts(matches),
    cases: matches
  };
  await writeJsonFile("reports.json", [report]);
}

async function hydrateMatchImages(matches: MatchCase[], examId: string): Promise<MatchCase[]> {
  const [exams, contents] = await Promise.all([
    readJsonFile<ExamFile[]>("examContents.json", []),
    readJsonFile<ContentFile[]>("companyContents.json", [])
  ]);
  const exam = exams.find((item) => item.id === examId);
  return matches.map((match, index) => {
    const company = contents[index % Math.max(contents.length, 1)];
    const pageIndex = index % 3;
    return {
      ...match,
      companyContentId: company?.id ?? match.companyContentId,
      companyLabel: company ? `${company.title}${company.round ? ` · ${company.round}` : ""}` : match.companyLabel,
      examImageUrl: exam?.imagePaths[pageIndex] ?? match.examImageUrl,
      companyImageUrl: company?.imagePaths[pageIndex] ?? match.companyImageUrl
    };
  });
}
