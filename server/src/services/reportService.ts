import { v4 as uuid } from "uuid";
import { calculateGradeCounts, calculateReportScore, gradeScores } from "./matchingService.js";
import { readJsonFile, writeJsonFile } from "./store.js";
import type { ContentFile, ExamFile, Grade, Highlight, MatchCase, Report } from "./types.js";

const MAX_CASES = 8;

export async function createReportFromUploads(examId: string, examTitle: string): Promise<Report> {
  const [reports, exams, contents] = await Promise.all([
    getReports(),
    readJsonFile<ExamFile[]>("examContents.json", []),
    readJsonFile<ContentFile[]>("companyContents.json", [])
  ]);

  const exam = exams.find((item) => item.id === examId);
  if (!exam) {
    throw new Error("Exam not found.");
  }
  if (contents.length === 0) {
    throw new Error("No company content uploaded.");
  }

  const matchedContents = contents.slice(0, MAX_CASES);
  const matches = matchedContents.map((content, index) => makeMatchCase(exam, content, index));
  const approvedCases = matches.filter((match) => match.approved);

  const report: Report = {
    id: uuid(),
    title: `${examTitle} 비교 분석 리포트`,
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

export async function patchMatch(
  matchId: string,
  patch: Partial<Pick<MatchCase, "grade" | "approved" | "aiSummary" | "studentBenefit" | "examHighlights" | "companyHighlights">>
): Promise<MatchCase | undefined> {
  const reports = await getReports();
  let updated: MatchCase | undefined;
  const nextReports = reports.map((report) => {
    const cases = report.cases.map((match) => {
      if (match.id !== matchId) return match;
      updated = { ...match, ...patch };
      return updated;
    });
    const approvedCases = cases.filter((match) => match.approved);
    return {
      ...report,
      cases,
      totalScore: calculateReportScore(cases),
      totalCases: approvedCases.length,
      gradeCounts: calculateGradeCounts(cases)
    };
  });
  await writeJsonFile("reports.json", nextReports);
  return updated;
}

export async function ensureSampleReport(): Promise<void> {
  const reports = await getReports();
  if (reports.length > 0) return;

  const [exams, contents] = await Promise.all([
    readJsonFile<ExamFile[]>("examContents.json", []),
    readJsonFile<ContentFile[]>("companyContents.json", [])
  ]);

  if (exams.length === 0 || contents.length === 0) {
    return;
  }

  await createReportFromUploads(exams[0].id, exams[0].title);
}

function makeMatchCase(exam: ExamFile, content: ContentFile, index: number): MatchCase {
  const similarity = calculateSimilarity(exam, content, index);
  const grade = gradeFromSimilarity(similarity);
  const pageNo = index + 1;
  const examImageUrl = pickImage(exam.imagePaths, index, "exam");
  const companyImageUrl = pickImage(content.imagePaths, index, "company");
  const hitType = hitTypeFromGrade(grade);

  return {
    id: `match-${exam.id}-${content.id}`,
    caseNo: pageNo,
    title: `${content.title} 비교`,
    examId: exam.id,
    companyContentId: content.id,
    examLabel: exam.title,
    companyLabel: content.round ? `${content.title} · ${content.round}` : content.title,
    examImageUrl,
    companyImageUrl,
    examQuestionNo: `${20 + pageNo}번`,
    companyQuestionNo: `${pageNo}회 ${((index % 3) + 1)}쪽`,
    grade,
    score: gradeScores[grade],
    similarity,
    hitType,
    hitTypeDescription: hitTypeDescription(grade),
    aiSummary: `${content.title} 문서와 시험 문서를 페이지 단위로 대조한 결과, 유사도 ${similarity}%로 ${hitType.toLowerCase()} 수준으로 분류되었습니다.`,
    evidencePoints: buildEvidence(exam, content, similarity),
    studentBenefit: "시험 문서와 유사한 설명 흐름을 미리 접해 풀이 접근 시간을 줄이는 데 도움이 됩니다.",
    caution: "동일 문항 출제를 의미하지 않으며, 문서 구조와 개념 흐름의 유사성을 기준으로 산출한 결과입니다.",
    examHighlights: makeHighlights(pageNo, "exam"),
    companyHighlights: makeHighlights(pageNo, "company"),
    approved: grade !== "E"
  };
}

function calculateSimilarity(exam: ExamFile, content: ContentFile, index: number): number {
  const examTokens = tokenize(exam.title);
  const contentTokens = Array.from(tokenize(content.title));
  const overlapCount = contentTokens.filter((token) => examTokens.has(token)).length;
  const overlapScore = contentTokens.length === 0 ? 0 : Math.round((overlapCount / contentTokens.length) * 40);
  const pageDelta = Math.abs((exam.imagePaths?.length ?? 0) - (content.imagePaths?.length ?? 0));
  const pageScore = Math.max(0, 30 - pageDelta * 8);
  const typeScore = content.type === "mock_exam" ? 18 : content.type === "ebs_variant" ? 15 : 10;
  const hashScore = stableHash(`${exam.id}:${content.id}:${index}`) % 13;

  return clamp(35 + overlapScore + pageScore + typeScore + hashScore, 40, 98);
}

function tokenize(input: string): Set<string> {
  return new Set((input.toLowerCase().match(/[a-z0-9가-힣]+/g) ?? []).filter((token) => token.length > 1));
}

function gradeFromSimilarity(similarity: number): Grade {
  if (similarity >= 90) return "S";
  if (similarity >= 82) return "A";
  if (similarity >= 74) return "B";
  if (similarity >= 66) return "C";
  if (similarity >= 58) return "D";
  return "E";
}

function hitTypeFromGrade(grade: Grade): string {
  const map: Record<Grade, string> = {
    S: "Direct Match",
    A: "High Structural Match",
    B: "Concept Match",
    C: "Question Pattern Match",
    D: "Partial Match",
    E: "Reference-level Match"
  };
  return map[grade];
}

function hitTypeDescription(grade: Grade): string {
  const map: Record<Grade, string> = {
    S: "핵심 제재와 전개 방식이 매우 유사해 시험 체감이 크게 발생할 가능성이 있습니다.",
    A: "구조와 개념 흐름이 가까워 사전 학습 효과를 기대할 수 있습니다.",
    B: "핵심 개념과 문제 접근 방식이 부분적으로 일치합니다.",
    C: "문항 구성 혹은 보기 처리 패턴이 일부 유사합니다.",
    D: "부분적인 유사성이 있으나 직접 체감은 제한적일 수 있습니다.",
    E: "참고 수준의 유사성으로 보조 자료 성격이 강합니다."
  };
  return map[grade];
}

function buildEvidence(exam: ExamFile, content: ContentFile, similarity: number): string[] {
  return [
    `시험 문서 제목: ${exam.title}`,
    `비교 문서 제목: ${content.title}`,
    `렌더링 페이지 수 비교: ${exam.imagePaths.length} vs ${content.imagePaths.length}`,
    `산출 유사도: ${similarity}%`
  ];
}

function makeHighlights(caseNo: number, side: "exam" | "company"): Highlight[] {
  const shift = side === "exam" ? 0 : 4;
  return [
    { id: `${side}-${caseNo}-box`, type: "box", color: "blue", x: 10 + shift, y: 18, width: 72, height: 16, label: "구조 유사 구간" },
    { id: `${side}-${caseNo}-line`, type: "underline", color: "yellow", x: 13, y: 39 + shift, width: 62, height: 5, label: "핵심 개념" },
    { id: `${side}-${caseNo}-check`, type: "check", color: "green", x: 70, y: 72, width: 8, height: 8, label: "판단 기준" },
    { id: `${side}-${caseNo}-note`, type: "note", color: "gray", x: 15, y: 82, width: 45, height: 9, label: "근거 메모" }
  ];
}

function pickImage(images: string[], index: number, targetType: "exam" | "company"): string {
  if (images.length > 0) {
    return images[index % images.length];
  }
  return `/generated/images/${targetType}/mock-page-${(index % 3) + 1}.svg`;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
