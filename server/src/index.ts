import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import contentRoutes from "./routes/contentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { ensureMockPageImages } from "./services/pdfService.js";
import { ensureSampleReport } from "./services/reportService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/generated", express.static(path.resolve(__dirname, "../generated")));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "국어 콘텐츠 적중 맵" });
});

app.use("/api", uploadRoutes);
app.use("/api", contentRoutes);
app.use("/api", reportRoutes);

await ensureMockPageImages();
await ensureSampleReport();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
