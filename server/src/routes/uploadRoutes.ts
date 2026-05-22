import fs from "node:fs/promises";
import path from "node:path";
import express from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { createMockReport } from "../services/reportService.js";
import { readJsonFile, serverRoot, writeJsonFile } from "../services/store.js";
import { createMockPageImages, renderPdfToImages, saveUploadedPdf } from "../services/pdfService.js";
import type { ContentFile, ExamFile } from "../services/types.js";

const router = express.Router();
const tempDir = path.join(serverRoot, "uploads", "tmp");
await fs.mkdir(tempDir, { recursive: true });
const upload = multer({ dest: tempDir });

router.post("/company/upload", upload.array("files"), async (req, res) => {
  const files = (req.files ?? []) as Express.Multer.File[];
  const existing = await readJsonFile<ContentFile[]>("companyContents.json", []);
  const created: ContentFile[] = [];

  for (const file of files) {
    const originalPdfPath = await saveUploadedPdf(file, "company");
    const imagePaths = await renderPdfToImages(originalPdfPath, "company").catch(() => createMockPageImages("company"));
    created.push({
      id: uuid(),
      title: String(req.body.title || file.originalname.replace(/\.pdf$/i, "")),
      type: req.body.type || "mock_exam",
      area: req.body.area || "common",
      round: req.body.round,
      publishMonth: req.body.publishMonth,
      description: req.body.description,
      fileName: file.originalname,
      originalPdfPath,
      imagePaths,
      createdAt: new Date().toISOString()
    });
  }

  await writeJsonFile("companyContents.json", [...created, ...existing]);
  res.json(files.length === 1 ? created[0] : created);
});

router.post("/exam/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "PDF file is required." });
  const existing = await readJsonFile<ExamFile[]>("examContents.json", []);
  const originalPdfPath = await saveUploadedPdf(req.file, "exam");
  const imagePaths = await renderPdfToImages(originalPdfPath, "exam").catch(() => createMockPageImages("exam"));
  const exam: ExamFile = {
    id: uuid(),
    title: String(req.body.title || "2026학년도 6월 평가원 국어"),
    examDate: String(req.body.examDate || new Date().toISOString().slice(0, 10)),
    fileName: req.file.originalname,
    originalPdfPath,
    imagePaths,
    createdAt: new Date().toISOString()
  };
  await writeJsonFile("examContents.json", [exam, ...existing]);
  res.json(exam);
});

router.post("/exam/:examId/analyze", async (req, res) => {
  const exams = await readJsonFile<ExamFile[]>("examContents.json", []);
  const exam = exams.find((item) => item.id === req.params.examId);
  if (!exam) return res.status(404).json({ message: "Exam not found." });
  const report = await createMockReport(exam.id, exam.title);
  res.json(report);
});

export default router;
