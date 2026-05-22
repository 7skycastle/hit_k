import express from "express";
import { readJsonFile } from "../services/store.js";
import type { ContentFile, ExamFile } from "../services/types.js";

const router = express.Router();

router.get("/company", async (_req, res) => {
  res.json(await readJsonFile<ContentFile[]>("companyContents.json", []));
});

router.get("/exams", async (_req, res) => {
  res.json(await readJsonFile<ExamFile[]>("examContents.json", []));
});

export default router;
