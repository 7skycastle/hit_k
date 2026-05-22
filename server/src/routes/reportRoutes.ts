import express from "express";
import { getReport, getReports, patchMatch } from "../services/reportService.js";

const router = express.Router();

router.get("/reports", async (_req, res) => {
  res.json(await getReports());
});

router.get("/reports/:reportId", async (req, res) => {
  const report = await getReport(req.params.reportId);
  if (!report) return res.status(404).json({ message: "Report not found." });
  res.json(report);
});

router.patch("/matches/:matchId", async (req, res) => {
  const updated = await patchMatch(req.params.matchId, req.body);
  if (!updated) return res.status(404).json({ message: "Match not found." });
  res.json(updated);
});

export default router;
