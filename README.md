# 국어 콘텐츠 적중 맵

평가원 국어 PDF와 회사 콘텐츠 PDF를 비교하여 실제 지문, 문항, 선지 단위의 연계 체감도를 분석하는 React + Node.js 프로토타입입니다.

핵심 메시지: 단순 키워드 유사가 아니라, 실제 지문·작품·문항 구조·선지 판단 기준을 비교합니다.

## 설치

```bash
npm install
```

## 실행

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://127.0.0.1:4000

## 주요 기능

- 회사 콘텐츠 PDF 업로드 및 메타데이터 저장
- 평가원 PDF 업로드 및 mock 분석 실행
- 8개 mock MatchCase 기반 리포트 생성
- 평가원 PDF 이미지와 회사 콘텐츠 PDF 이미지를 좌우 비교
- 박스, 밑줄, 체크, 메모 하이라이트 오버레이
- 관리자 검수 화면에서 등급, 공개 여부, 분석 문구 수정
- JSON 파일 기반 로컬 저장소
- PDF 렌더링 서비스 계층 분리 및 mock 이미지 fallback

## 프로젝트 구조

```text
root/
  package.json
  README.md
  server/
    src/
      index.ts
      routes/
      services/
      data/
      uploads/
      generated/
  client/
    src/
      pages/
      components/
      types/
      mock/
```

## 향후 확장 계획

- OCR 연동
- PDF 문항 자동 분리
- 문항 단위 crop 자동 생성
- 임베딩 기반 유사도 검색
- LLM 기반 적중 근거 생성
- 관리자 수동 하이라이트 편집 기능 고도화
- 공개용 리포트 PDF 다운로드
