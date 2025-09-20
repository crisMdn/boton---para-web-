# Proyecto Botton  

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-API-lightgrey?logo=express)
![Postgres](https://img.shields.io/badge/PostgreSQL-17-blue?logo=postgresql)
![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare%20R2-orange?logo=cloudflare)
![License](https://img.shields.io/badge/License-MIT-yellow)

API en **Node.js + Express** que permite subir imágenes, almacenarlas en **Cloudflare R2 (S3 compatible)** y registrar sus metadatos en **PostgreSQL**. Incluye un frontend sencillo para pruebas.

<p align="center">
  <!-- Reemplaza esta ruta cuando subas tu captura o GIF -->
  <!-- Imagen (recomendada): docs/demo.png -->
  <!-- GIF (opcional): docs/demo.gif -->
  <img src="docs/demo.png" alt="Demo del uploader" width="900">
</p>

---

## 🚀 Funcionalidades principales
- 📤 Subida de imágenes con **Multer** (memoria).
- ☁️ Almacenamiento en **R2 bucket**.
- 🗄️ Registro en la BD: `id`, `key`, `mime`, `size_bytes`, `created_at`.
- 🔎 Endpoints:
  - `POST /api/upload` → subir imágenes.
  - `GET /api/images` → listar con paginación (`limit`, `offset`).
  - `GET /api/images/by-ids?ids=uuid1,uuid2` → consultar específicas.
  - `GET /api/images/check-url?url=...` → verificar existencia de URL pública.
- 🌐 Frontend (`public/index.html`) para subir y ver imágenes.
- 🔐 Variables de entorno con **dotenv**.

---

## 🛠️ Tecnologías usadas
- Node.js + Express  
- PostgreSQL  
- Cloudflare R2 (S3 compatible con AWS SDK)  
- Multer  
- @aws-sdk/client-s3  
- pg  
- dotenv  
- cors  

---

## 📂 Estructura del proyecto
```
proyecto-botton/
├── src/
│   ├── app.js              # Configuración Express
│   ├── server.js           # Arranque de la API
│   ├── controllers/        # Lógica de endpoints
│   │   └── images.controller.js
│   ├── routes/             # Rutas Express
│   │   └── images.routes.js
│   ├── services/           # Conexión a R2
│   │   └── r2.service.js
│   ├── middleware/         # Configuración Multer
│   │   └── upload.js
│   └── db/                 # Conexión Postgres
│       └── index.js
├── public/                 # Frontend (index.html)
├── postgre/                # Scripts SQL
│   ├── createdb.sql
│   ├── scheme.sql
│   ├── permisosUsser.sql
│   └── diagnostico.sql
├── Dockerfile
├── .dockerignore
├── .gitignore
├── package.json
└── .env.example
```

---

## ⚙️ Instalación

Clonar repositorio:
```bash
git clone https://github.com/crisMdn/boton---para-web-.git
cd boton---para-web-
```

Instalar dependencias:
```bash
npm install
```

---

## 🔑 Variables de entorno
Crear un archivo `.env` desde el ejemplo:
```bash
cp .env.example .env
```

Configurar credenciales:
```ini
DATABASE_URL=postgres://canelito:1234@localhost:5432/botton
R2_ENDPOINT=https://xxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=imagenes-api
R2_PUBLIC_URL=https://pub-xxxxxx.r2.dev
PORT=3000
```

---

## 🗄️ Base de datos
Ejecutar los scripts en `postgre/` en este orden:
1. `createdb.sql`  
2. `scheme.sql`  
3. `permisosUsser.sql`  
4. (opcional) `diagnostico.sql`  

**Esquema recomendado (acorde al código):**
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  mime TEXT,
  size_bytes INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Índices útiles:**
```sql
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_key_prefix ON images (key text_pattern_ops);
```

---

## ▶️ Ejecutar el proyecto
Modo normal:
```bash
npm start
```

Modo desarrollo:
```bash
npm run dev
```

Acceso:
- API → http://localhost:3000/api/images  
- Frontend → http://localhost:3000  

---

## 🔍 Verificar imágenes en R2
- Verificar si existe:
  ```bash
  curl -I https://pub-xxxxxx.r2.dev/imagen.png
  ```
- Descargar y verificar:
  ```bash
  curl -o test.png https://pub-xxxxxx.r2.dev/imagen.png
  ```

---

## 🧹 Notas
- Ahora se usa **R2** en lugar de `/uploads` local.
- Tabla `images`: **key, mime, size_bytes, created_at**.
- Limpieza rápida:
  ```sql
  DELETE FROM images;
  TRUNCATE TABLE images RESTART IDENTITY;
  ```

---

## 📸 Cómo agregar el demo al README
- **Screenshot**: guarda una captura en `docs/demo.png` y no cambies la etiqueta `<img>` de arriba.
- **GIF** (opcional): guarda `docs/demo.gif` y cambia la etiqueta por:
  ```md
  <p align="center">
    <img src="docs/demo.gif" alt="Demo del uploader (GIF)" width="900">
  </p>
  ```

---

## 📜 Licencia
MIT
