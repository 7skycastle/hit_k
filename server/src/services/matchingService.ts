import type { Report } from "./types.js";
import type { MatchCase } from "./types.js";

export const gradeScores = { S: 100, A: 85, B: 70, C: 55, D: 40, E: 20 } as const;
export const gradeWeights = { S: 1.4, A: 1.4, B: 1.2, C: 1, D: 1, E: 0.6 } as const;

export function generateMockMatches(examId: string): MatchCase[] {
  const samples = [
    ["문학 작품 직접 적중", "S", 94, "실전 체감 적중", "평가원 문학 지문과 회사 콘텐츠가 동일 작품을 다루고 있으며, 인물 관계와 갈등 구조를 사전에 학습할 수 있는 형태로 구성되어 있습니다.", "이 콘텐츠를 학습한 학생은 작품 이해 시간을 줄이고, 선지 판단에 더 많은 시간을 사용할 수 있었을 가능성이 높습니다."],
    ["독서 제재 확장 연계", "B", 78, "확장 연계 적중", "평가원 독서 지문은 특정 개념의 작동 원리와 조건 변화에 따른 결과를 묻고 있습니다. 회사 콘텐츠는 동일 키워드를 단순 소개한 것이 아니라 해당 개념의 구조와 적용 방식을 훈련하도록 설계되어 있습니다.", "학생은 낯선 지문을 처음부터 해석하기보다, 이미 학습한 개념 구조 위에 세부 정보를 얹는 방식으로 접근할 수 있습니다."],
    ["보기 적용형 문항 구조 적중", "C", 71, "문항 구조 적중", "평가원 문항과 회사 콘텐츠 문항 모두 보기의 조건을 지문 개념에 적용하여 결과를 판단하게 하는 구조입니다.", "보기 적용형 문제 풀이 절차를 사전에 훈련한 학생에게 유리합니다."],
    ["선지 함정 판단 기준 적중", "D", 66, "선지 판단 적중", "두 문항 모두 원인과 결과의 관계를 바꾸어 오답 선지를 구성하는 방식이 유사합니다.", "오답 선지의 왜곡 방식을 사전에 경험한 학생은 정답 판단의 확신을 높일 수 있습니다."],
    ["독서 배경지식 시간 단축 적중", "A", 86, "시간 단축 적중", "회사 콘텐츠는 평가원 지문을 이해하는 데 필요한 배경지식과 용어를 사전에 다루고 있습니다.", "지문을 읽는 초기 부담이 줄어들고, 독해 시간이 단축될 가능성이 높습니다."],
    ["현대시 정서·표현 방식 연계", "B", 75, "확장 연계 적중", "동일 작품은 아니지만 화자의 정서, 시적 상황, 표현 방식이 유사하여 문학 감상 기준을 사전에 훈련할 수 있습니다.", "학생은 작품을 완전히 낯설게 받아들이지 않고, 유사한 감상 틀을 적용할 수 있습니다."],
    ["고전소설 인물 관계 구조 연계", "A", 83, "시간 단축 적중", "평가원 지문과 회사 콘텐츠 모두 복잡한 인물 관계와 갈등 전개를 중심으로 구성되어 있습니다.", "고전소설에서 시간이 많이 걸리는 인물 관계 파악 부담을 줄일 수 있습니다."],
    ["동일 소재권 유사", "E", 49, "소재권 유사", "동일 분야의 소재를 다루고 있으나, 평가원이 요구한 핵심 개념과 문항 구조까지 직접 연결되지는 않습니다.", "배경지식 차원의 도움은 가능하지만 강한 적중으로 보기는 어렵습니다."]
  ] as const;

  return samples.map(([title, grade, similarity, hitType, aiSummary, studentBenefit], index) => {
    const caseNo = index + 1;
    const page = (index % 3) + 1;
    return {
      id: `match-${examId}-${caseNo}`,
      caseNo,
      title,
      examId,
      companyContentId: `content-${caseNo}`,
      examLabel: "6월 평가원 국어",
      companyLabel: caseNo % 2 === 0 ? "EBS 변형 콘텐츠" : "실전 모의고사",
      examImageUrl: `/generated/images/exam/mock-page-${page}.svg`,
      companyImageUrl: `/generated/images/company/mock-page-${page}.svg`,
      examQuestionNo: `${20 + caseNo}번`,
      companyQuestionNo: `${caseNo}회 ${page}쪽`,
      grade,
      score: gradeScores[grade],
      similarity,
      hitType,
      hitTypeDescription: getHitTypeDescription(grade),
      aiSummary,
      evidencePoints: getEvidencePoints(caseNo),
      studentBenefit,
      caution: "이 분석은 동일 문항 출제를 의미하지 않으며, 실제 시험에서 체감 가능한 연계 요소를 분석한 것입니다.",
      examHighlights: makeHighlights(caseNo, "exam"),
      companyHighlights: makeHighlights(caseNo, "company"),
      approved: caseNo <= 6
    };
  });
}

export function calculateReportScore(cases: MatchCase[]): number {
  const approved = cases.filter((match) => match.approved);
  if (approved.length === 0) return 0;
  const weighted = approved.reduce((sum, match) => sum + match.score * gradeWeights[match.grade], 0);
  const weightSum = approved.reduce((sum, match) => sum + gradeWeights[match.grade], 0);
  return Math.round(weighted / weightSum);
}

export function calculateGradeCounts(cases: MatchCase[]): Report["gradeCounts"] {
  return cases.filter((match) => match.approved).reduce<Report["gradeCounts"]>((counts, match) => {
    counts[match.grade] += 1;
    return counts;
  }, { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 });
}

function getHitTypeDescription(grade: MatchCase["grade"]): string {
  const map = {
    S: "동일 작품 또는 매우 유사한 지문·제재가 있어 시험장에서 강하게 체감되는 연계입니다.",
    A: "사전 학습으로 지문 이해 속도가 빨라질 가능성이 높은 연계입니다.",
    B: "핵심 개념, 논점, 구조가 사전에 훈련된 확장형 연계입니다.",
    C: "발문, 보기, 추론 방식, 비교 방식이 유사한 문항 구조 연계입니다.",
    D: "정답/오답 선지를 판단하는 기준이나 함정 구조가 유사한 연계입니다.",
    E: "같은 분야나 비슷한 소재이나 직접 도움은 제한적인 소재권 연계입니다."
  };
  return map[grade];
}

function getEvidencePoints(caseNo: number): string[] {
  const common = ["핵심 개념을 지문 안에서 적용하는 방식이 유사합니다.", "선지 판단에 필요한 근거 확인 절차가 겹칩니다.", "학생이 시험장에서 느끼는 낯섦을 줄이는 데 도움이 됩니다."];
  if (caseNo === 1) return ["동일 작품을 중심으로 인물 관계와 갈등 구조가 겹칩니다.", "작품의 핵심 장면을 사전에 읽어볼 수 있습니다.", "문항 선지에서 묻는 감상 기준을 미리 연습할 수 있습니다."];
  if (caseNo === 8) return ["소재 분야가 유사해 배경지식 차원의 도움은 가능합니다.", "문항 구조와 직접 판단 기준은 제한적으로 연결됩니다.", "강한 적중보다 참고 연계로 보는 것이 타당합니다."];
  return common;
}

function makeHighlights(caseNo: number, side: "exam" | "company"): MatchCase["examHighlights"] {
  const shift = side === "exam" ? 0 : 4;
  return [
    { id: `${side}-${caseNo}-box`, type: "box", color: caseNo === 1 ? "red" : "blue", x: 10 + shift, y: 18, width: 72, height: 16, label: caseNo === 1 ? "직접 연계" : "구조 유사" },
    { id: `${side}-${caseNo}-line`, type: "underline", color: "yellow", x: 13, y: 39 + shift, width: 62, height: 5, label: "핵심 개념" },
    { id: `${side}-${caseNo}-check`, type: "check", color: "green", x: 70, y: 72, width: 8, height: 8, label: "판단 기준" },
    { id: `${side}-${caseNo}-note`, type: "note", color: "gray", x: 15, y: 82, width: 45, height: 9, label: "배경지식 참고" }
  ];
}
