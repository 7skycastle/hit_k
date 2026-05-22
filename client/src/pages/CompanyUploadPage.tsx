import { useEffect, useState } from "react";
import { api } from "../api";
import UploadBox from "../components/UploadBox";
import type { ContentFile } from "../types";

export default function CompanyUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [contents, setContents] = useState<ContentFile[]>([]);
  const [form, setForm] = useState({ title: "", type: "mock_exam", area: "common", round: "", publishMonth: "", description: "" });
  const [loading, setLoading] = useState(false);

  function load() {
    api.get("/api/company").then((res) => setContents(res.data));
  }

  useEffect(load, []);

  async function submit() {
    if (!files.length) return;
    setLoading(true);
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    await api.post("/api/company/upload", body);
    setLoading(false);
    setFiles([]);
    load();
  }

  return (
    <div className="space-y-7">
      <section className="rounded-lg bg-white p-7 shadow-sm">
        <p className="text-sm font-bold text-brand">Company Content Upload</p>
        <h1 className="mt-2 text-3xl font-black text-ink">회사 콘텐츠 PDF 등록</h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">회사 콘텐츠는 사전에 등록해두고, 평가원 PDF만 업로드하면 자동으로 매칭 후보를 생성합니다.</p>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <UploadBox multiple onFiles={setFiles} />
          <button disabled={!files.length || loading} onClick={submit} className="w-full rounded-md bg-brand px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">
            {loading ? "업로드 중..." : "회사 콘텐츠 저장"}
          </button>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-ink">메타데이터</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input label="콘텐츠명" value={form.title} onChange={(title) => setForm({ ...form, title })} />
            <Input label="회차" value={form.round} onChange={(round) => setForm({ ...form, round })} />
            <Input label="발행월" value={form.publishMonth} onChange={(publishMonth) => setForm({ ...form, publishMonth })} placeholder="2026-05" />
            <Select label="콘텐츠 유형" value={form.type} onChange={(type) => setForm({ ...form, type })} options={[["mock_exam", "실전 모의고사"], ["ebs_variant", "EBS 변형 콘텐츠"], ["background", "독서 배경지식"], ["literature", "문학 작품 정리"], ["weekly", "주간지"], ["solution", "해설지"], ["etc", "기타"]]} />
            <Select label="영역" value={form.area} onChange={(area) => setForm({ ...form, area })} options={[["reading", "독서"], ["literature", "문학"], ["elective", "선택"], ["common", "공통"], ["etc", "기타"]]} />
            <Input label="설명" value={form.description} onChange={(description) => setForm({ ...form, description })} />
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-ink">업로드된 파일 목록</h2>
        <div className="mt-5 grid gap-3">
          {contents.map((content) => (
            <div key={content.id} className="rounded-md border border-gray-200 p-4">
              <p className="font-black text-ink">{content.title}</p>
              <p className="mt-1 text-sm text-muted">{content.fileName} · {content.round || "회차 미입력"} · 이미지 {content.imagePaths.length}장</p>
            </div>
          ))}
          {!contents.length && <p className="rounded-md bg-gray-50 p-5 text-sm text-muted">등록된 회사 콘텐츠가 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="text-sm font-bold text-gray-700">{label}<input className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 font-normal" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <label className="text-sm font-bold text-gray-700">{label}<select className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 font-normal" value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}
