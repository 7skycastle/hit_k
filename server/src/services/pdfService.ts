import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { serverRoot } from "./store.js";

export type TargetType = "company" | "exam";

const uploadRoot = path.join(serverRoot, "uploads");
const imageRoot = path.join(serverRoot, "generated", "images");

export async function saveUploadedPdf(file: Express.Multer.File, targetType: TargetType): Promise<string> {
  const targetDir = path.join(uploadRoot, targetType);
  await fs.mkdir(targetDir, { recursive: true });
  const safeName = `${Date.now()}-${file.originalname.replace(/[^\w.\-가-힣]/g, "_")}`;
  const targetPath = path.join(targetDir, safeName);
  await fs.rename(file.path, targetPath);
  return targetPath;
}

export async function renderPdfToImages(pdfPath: string, targetType: TargetType): Promise<string[]> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const canvas = await import("@napi-rs/canvas");
    const data = await fs.readFile(pdfPath);
    const document = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
    const outputDir = path.join(imageRoot, targetType, path.basename(pdfPath, path.extname(pdfPath)));
    await fs.mkdir(outputDir, { recursive: true });
    const pageCount = Math.min(document.numPages, 3);
    const imagePaths: string[] = [];

    for (let pageNo = 1; pageNo <= pageCount; pageNo += 1) {
      const page = await document.getPage(pageNo);
      const viewport = page.getViewport({ scale: 1.5 });
      const pageCanvas = canvas.createCanvas(viewport.width, viewport.height);
      const context = pageCanvas.getContext("2d");
      await page.render({ canvasContext: context as never, viewport }).promise;
      const filePath = path.join(outputDir, `page-${pageNo}.png`);
      await fs.writeFile(filePath, pageCanvas.toBuffer("image/png"));
      imagePaths.push(toPublicPath(filePath));
    }

    return imagePaths.length > 0 ? imagePaths : createMockPageImages(targetType);
  } catch {
    return createMockPageImages(targetType);
  }
}

export function createMockPageImages(targetType: TargetType): string[] {
  return [1, 2, 3].map((pageNo) => `/generated/images/${targetType}/mock-page-${pageNo}.svg`);
}

export async function ensureMockPageImages(): Promise<void> {
  await Promise.all((["company", "exam"] as TargetType[]).flatMap((targetType) =>
    [1, 2, 3].map(async (pageNo) => {
      const dir = path.join(imageRoot, targetType);
      await fs.mkdir(dir, { recursive: true });
      const label = targetType === "exam" ? "6월 평가원 국어" : "회사 콘텐츠";
      const filePath = path.join(dir, `mock-page-${pageNo}.svg`);
      await fs.writeFile(filePath, makeMockSvg(label, pageNo, targetType), "utf-8");
    })
  ));
}

function toPublicPath(filePath: string): string {
  return `/${path.relative(serverRoot, filePath).replace(/\\/g, "/")}`;
}

function makeMockSvg(label: string, pageNo: number, targetType: TargetType): string {
  const id = uuid().slice(0, 8);
  const title = targetType === "exam" ? "평가원 지문" : "사전 학습 콘텐츠";
  const left = targetType === "exam" ? "문항 21~24" : "회차 3 · 독서";
  const accent = targetType === "exam" ? "#2563EB" : "#111827";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1180" viewBox="0 0 900 1180">
  <rect width="900" height="1180" fill="#ffffff"/>
  <rect x="42" y="36" width="816" height="1088" fill="#fff" stroke="#d1d5db" stroke-width="2"/>
  <text x="72" y="92" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="${accent}">${label}</text>
  <text x="72" y="136" font-family="Arial, sans-serif" font-size="22" fill="#374151">${title} · ${left} · p.${pageNo}</text>
  <line x1="72" y1="166" x2="828" y2="166" stroke="#111827" stroke-width="2"/>
  ${Array.from({ length: 16 }).map((_, index) => {
    const y = 220 + index * 42;
    const width = 640 + ((index * 37 + pageNo * 19) % 130);
    return `<rect x="72" y="${y}" width="${width}" height="14" rx="3" fill="#111827" opacity="${index % 5 === 0 ? 0.42 : 0.24}"/>`;
  }).join("")}
  <rect x="72" y="850" width="756" height="112" rx="10" fill="#f9fafb" stroke="#d1d5db"/>
  <text x="98" y="897" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#111827">보기 / 선지 판단 기준</text>
  <text x="98" y="934" font-family="Arial, sans-serif" font-size="19" fill="#4b5563">핵심 개념, 조건 변화, 판단 근거가 표시되는 샘플 PDF 캡처입니다.</text>
  <text x="72" y="1080" font-family="Arial, sans-serif" font-size="15" fill="#9ca3af">mock image ${id}</text>
</svg>`;
}
