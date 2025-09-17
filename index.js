// 1) Cargar variables desde .env
import 'dotenv/config';

// 2) Imports
import express from "express";
import multer from "multer";
import { Pool } from "pg";
import path from "path";
import crypto from "crypto";
import cors from "cors";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

// 5) R2 (S3 compatible) + Multer en memoria
const allowed = new Set(["image/jpeg","image/png","image/webp","image/gif"]);

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,            // ej: https://<id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(new Error("Tipo no permitido"));
    cb(null, true);
  }
});

// 6) Endpoints
app.post("/upload", upload.array("images", 20), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: "sin archivos" });

  const client = await pool.connect();
  try {
    const out = [];
    for (const f of req.files) {
      const ext = path.extname(f.originalname || "");
      const key = crypto.randomBytes(16).toString("hex") + ext;

      // subir a R2
      await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,         // ej: imagenes-api
        Key: key,
        Body: f.buffer,
        ContentType: f.mimetype,
      }));

      // URL pública (usa tu Public Development URL .r2.dev)
      const url = `${process.env.R2_PUBLIC_URL}/${key}`;

      const r = await client.query(
        "INSERT INTO images(filename, url) VALUES($1,$2) RETURNING id, url, uploaded_at",
        [key, url]
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

// Página simple de prueba (TU HTML)
app.get("/", (_req, res) => {
  res.type("html").send(`
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Uploader</title>
<style>
  :root{
    --bg:#0f172a; --card:#111827; --muted:#94a3b8; --accent:#2563eb; --accent-2:#1d4ed8; --ok:#22c55e;
    --radius:14px;
  }
  *{box-sizing:border-box}
  body{margin:0;background:#0b1020;color:#e5e7eb;font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Inter,Arial}
  /* Contenedor portable */
  #uploader-widget{
    max-width:980px;margin:32px auto;padding:20px;border:1px solid #1f2937;border-radius:var(--radius);
    background:linear-gradient(180deg,#0f172a 0%, #0b1226 100%); box-shadow:0 10px 30px rgba(0,0,0,.35)
  }
  .head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
  .head h1{font-size:18px;margin:0;font-weight:600}
  .muted{color:var(--muted);font-size:13px}

  /* Zona de carga */
  .drop{
    border:2px dashed #334155;border-radius:12px;padding:18px;text-align:center;transition:.2s;
    background:#0b1326;
  }
  .drop.drag{border-color:var(--accent);background:#0c1a35}
  .inputs{display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:10px}
  .btn{
    appearance:none;border:0;border-radius:10px; padding:10px 16px;font-weight:600;cursor:pointer;
    background:linear-gradient(180deg,var(--accent),var(--accent-2)); color:#fff; transition:transform .08s ease, box-shadow .2s;
    box-shadow:0 6px 14px rgba(37,99,235,.35)
  }
  .btn:active{transform:translateY(1px)}
  .btn.secondary{background:#111827;color:#e5e7eb;border:1px solid #1f2937;box-shadow:none}

  /* Previsualización previa a subir */
  #preview{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin:14px 0 6px}
  .thumb{
    position:relative;border-radius:10px;overflow:hidden;border:1px solid #1f2937;background:#0b1326;
  }
  .thumb img{display:block;width:100%;height:100%;object-fit:cover}
  .thumb .badge{position:absolute;left:6px;top:6px;background:rgba(2,6,23,.75);backdrop-filter:blur(3px);
    color:#e5e7eb;font-size:11px;padding:2px 6px;border-radius:999px;border:1px solid #1f2937}

  /* Galería */
  #gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-top:16px}
  .item{border-radius:12px;overflow:hidden;border:1px solid #1f2937;background:#0b1326;cursor:pointer}
  .item img{width:100%;height:140px;object-fit:cover;display:block}

  /* Barra de estado */
  .status{display:flex;align-items:center;gap:10px;margin-top:8px;min-height:20px}
  .progress{height:8px;background:#0b1326;border-radius:999px;border:1px solid #1f2937;overflow:hidden;flex:1}
  .progress>i{display:block;height:100%;width:0%;background:linear-gradient(90deg,#22c55e,#16a34a)}

  /* Modal */
  #lightbox{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;padding:20px}
  #lightbox.open{display:flex}
  .modal{
    max-width:min(96vw,1100px);max-height:90vh;background:#0b1326;border:1px solid #1f2937;border-radius:16px;
    box-shadow:0 20px 60px rgba(0,0,0,.6); position:relative; padding:12px;
  }
  .modal img{display:block;max-width:calc(90vw - 40px);max-height:78vh;border-radius:12px}
  .close{
    position:absolute;top:8px;right:8px; background:#111827;border:1px solid #1f2937;color:#e5e7eb;
    border-radius:10px;padding:6px 10px;font-weight:600;cursor:pointer
  }
</style>
</head>
<body>
  <div id="uploader-widget">
    <div class="head">
      <h1>Subir imágenes</h1>
      <div class="muted">Arrastra y suelta o usa el botón</div>
    </div>

    <form id="f" enctype="multipart/form-data" class="drop" aria-label="Zona de carga">
      <div>Arrastra tus imágenes aquí</div>
      <div class="inputs">
        <input id="file" type="file" name="images" multiple accept="image/*" hidden>
        <button type="button" class="btn" id="pick">Elegir archivos</button>
        <button type="submit" class="btn secondary" id="send">Subir</button>
      </div>
      <div id="preview"></div>
      <div class="status">
        <div class="progress"><i id="bar"></i></div>
        <span id="msg" class="muted"></span>
      </div>
    </form>

    <div class="head" style="margin-top:18px">
      <h1>Galería</h1>
      <div class="muted">Últimas 100</div>
    </div>
    <div id="gal"></div>
  </div>

  <!-- Modal (lightbox) -->
  <div id="lightbox" role="dialog" aria-modal="true">
    <div class="modal">
      <button class="close" id="close">Cerrar</button>
      <img id="big" alt="Vista ampliada"/>
    </div>
  </div>

<script>
  const f = document.getElementById('f');
  const file = document.getElementById('file');
  const pick = document.getElementById('pick');
  const preview = document.getElementById('preview');
  const bar = document.getElementById('bar');
  const msg = document.getElementById('msg');
  const gal = document.getElementById('gal');

  const lightbox = document.getElementById('lightbox');
  const big = document.getElementById('big');
  const closeBtn = document.getElementById('close');

  // Abrir selector
  pick.onclick = () => file.click();

  // Drag & drop
  f.addEventListener('dragover', e => { e.preventDefault(); f.classList.add('drag'); });
  f.addEventListener('dragleave', () => f.classList.remove('drag'));
  f.addEventListener('drop', e => {
    e.preventDefault(); f.classList.remove('drag');
    if (e.dataTransfer.files?.length) {
      file.files = e.dataTransfer.files;
      renderPreview();
    }
  });

  // Preview de seleccionados
  file.addEventListener('change', renderPreview);
  function renderPreview(){
    preview.innerHTML = '';
    const files = Array.from(file.files || []);
    if (!files.length) return;
    const allowed = new Set(["image/jpeg","image/png","image/webp","image/gif"]);
    files.forEach(fx => {
      if (!allowed.has(fx.type)) return;
      const url = URL.createObjectURL(fx);
      const div = document.createElement('div'); div.className = 'thumb';
      div.innerHTML = \`<span class="badge">\${(fx.size/1024/1024).toFixed(1)} MB</span>\`;
      const img = new Image(); img.src = url; img.loading = "lazy";
      img.onload = () => URL.revokeObjectURL(url);
      div.appendChild(img);
      preview.appendChild(div);
    });
  }

  // Subir con barra (progresiva aproximada por lotes)
  f.onsubmit = async (e) => {
    e.preventDefault();
    msg.textContent = '';
    bar.style.width = '0%';

    const data = new FormData();
    const files = Array.from(file.files || []);
    if (!files.length) { msg.textContent = 'Selecciona archivos.'; return; }
    files.forEach(x => data.append('images', x));

    // Progreso “fake” suave mientras espera respuesta
    let p = 0; const tick = setInterval(()=>{ p=Math.min(p+3,90); bar.style.width=p+'%'; }, 120);

    try{
      const r = await fetch('/upload', { method:'POST', body:data });
      const j = await r.json();
      clearInterval(tick); bar.style.width = '100%';
      if(!r.ok) throw new Error(j?.error || 'Error subiendo');
      msg.textContent = 'Subida completa.';
      (j.files||[]).forEach(x=>{
        const el = makeItem(x.url);
        gal.prepend(el);
      });
      // limpiar selección
      file.value = ''; preview.innerHTML='';
      // reset barra
      setTimeout(()=>{ bar.style.width='0%'; msg.textContent=''; }, 1200);
    }catch(err){
      clearInterval(tick);
      msg.textContent = err.message || 'Error';
      bar.style.width = '0%';
    }
  };

  // Cargar galería existente
  fetch('/images').then(r=>r.json()).then(arr=>{
    arr.forEach(x => gal.appendChild(makeItem(x.url)));
  });

  // Crear tarjeta de imagen y evento para modal
  function makeItem(url){
    const d = document.createElement('div'); d.className='item';
    const img = new Image(); img.src=url; img.loading='lazy'; img.alt='Imagen';
    img.onclick = ()=>openModal(url);
    d.appendChild(img);
    return d;
  }

  // Modal
  function openModal(url){
    big.src = url;
    lightbox.classList.add('open');
  }
  function closeModal(){
    lightbox.classList.remove('open');
    big.src = '';
  }
  lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) closeModal(); });
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });
</script>
</body>
</html>
  `);
});

// Healthcheck opcional
app.get("/health", (_req, res) => res.send("OK"));

// 8) Start
app.listen(PORT, () => console.log(`API ${PUBLIC_HOST} (port ${PORT})`));

