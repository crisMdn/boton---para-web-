// 1) Cargar variables desde .env
import 'dotenv/config';

// 2) Imports
import express from "express";
import multer from "multer";
import { Pool } from "pg";
import path from "path";
import crypto from "crypto";
import cors from "cors";

// 3) App y config base
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const PUBLIC_HOST = process.env.PUBLIC_HOST || `http://localhost:${PORT}`;

// 4) DB (usa .env; fallback solo para dev local)
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://canelito:1234@localhost:5432/botton"
});

// 5) Multer (destino y validación)
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, crypto.randomBytes(16).toString("hex") + ext);
  }
});
const allowed = new Set(["image/jpeg","image/png","image/webp","image/gif"]);
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(new Error("Tipo no permitido"));
    cb(null, true);
  }
});

// 6) Estáticos
app.use("/uploads", express.static("uploads"));

// 7) Endpoints
app.post("/upload", upload.array("images", 20), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: "sin archivos" });

  const client = await pool.connect();
  try {
    const out = [];
    for (const f of req.files) {
      const url = `${PUBLIC_HOST}/uploads/${f.filename}`;
      const r = await client.query(
        "INSERT INTO images(filename, url) VALUES($1,$2) RETURNING id, url, uploaded_at",
        [f.filename, url]
      );
      out.push(r.rows[0]);
    }
    res.json({ ok: true, files: out });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

app.get("/images", async (_req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, url, uploaded_at FROM images ORDER BY uploaded_at DESC LIMIT 100"
    );
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Página simple de prueba
app.get("/", (_req, res) => {
  res.type("html").send(`
  <form id="f" enctype="multipart/form-data">
    <input type="file" name="images" multiple accept="image/*"><button>Subir</button>
  </form>
  <div id="gal"></div>
  <script>
    f.onsubmit = async e => {
      e.preventDefault();
      const r = await fetch('/upload',{method:'POST',body:new FormData(f)});
      const j = await r.json();
      (j.files||[]).forEach(x=>{
        const i=new Image(); i.src=x.url; i.width=160; gal.prepend(i);
      });
    };
    fetch('/images').then(r=>r.json()).then(a=>{
      a.forEach(x=>{ const i=new Image(); i.src=x.url; i.width=160; gal.appendChild(i); });
    });
  </script>`);
});

// 8) Start
app.listen(PORT, () => console.log(`API ${PUBLIC_HOST}`));
