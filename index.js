import express from "express";
import multer from "multer";
import { Pool } from "pg";
import path from "path";
import crypto from "crypto";
import cors from "cors";

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://appuser:1234@localhost:5432/appdb"
});

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, crypto.randomBytes(16).toString("hex") + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024, files: 20 } });

app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.array("images", 20), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: "sin archivos" });
  const base = process.env.PUBLIC_HOST || "http://localhost:3000";
  const client = await pool.connect();
  try {
    const out = [];
    for (const f of req.files) {
      const url = `${base}/uploads/${f.filename}`;
      await client.query("INSERT INTO images(filename, url) VALUES($1,$2)", [f.filename, url]);
      out.push({ url });
    }
    res.json({ ok: true, files: out });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

app.get("/images", async (_req, res) => {
  const r = await pool.query("SELECT id,url,uploaded_at FROM images ORDER BY uploaded_at DESC LIMIT 100");
  res.json(r.rows);
});

app.get("/", (_req, res) => {
  res.type("html").send(`
  <form id="f" enctype="multipart/form-data">
    <input type="file" name="images" multiple accept="image/*"><button>Subir</button>
  </form><div id="gal"></div>
  <script>
    f.onsubmit = async e => {
      e.preventDefault();
      const r = await fetch('/upload',{method:'POST',body:new FormData(f)});
      const j = await r.json();
      (j.files||[]).forEach(x=>{const i=new Image(); i.src=x.url; i.width=160; gal.prepend(i);});
    };
    fetch('/images').then(r=>r.json()).then(a=>a.forEach(x=>{const i=new Image(); i.src=x.url; i.width=160; gal.appendChild(i);}));
  </script>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API http://localhost:"+PORT));
