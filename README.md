Proyecto Botton

Este proyecto es una API en Node.js con Express que permite subir imágenes, almacenarlas en Cloudflare R2 (S3 compatible) y registrar sus metadatos en PostgreSQL.

🚀 Funcionalidades principales

📤 Subida de imágenes mediante Multer (en memoria).

☁️ Almacenamiento en R2 bucket (no local).

🗄️ Registro en la base de datos:

id, key, mime, size_bytes, created_at.

🔎 Endpoints disponibles:

POST /api/upload → subir imágenes.

GET /api/images → listar con paginación (limit, offset).

GET /api/images/by-ids?ids=uuid1,uuid2 → consultar imágenes específicas.

GET /api/images/check-url?url=... → verificar existencia de una URL pública.

🌐 Frontend sencillo en public/index.html para subir y visualizar imágenes.

🔐 Variables de entorno con dotenv para mantener seguras las credenciales.

🛠️ Tecnologías usadas

Node.js + Express

PostgreSQL

Multer (manejo de archivos en memoria)

@aws-sdk/client-s3 (integración con R2)

pg (conexión a Postgres)

dotenv (variables de entorno)

cors (permitir peticiones externas)

proyecto-botton/
├── src/
│   ├── app.js              # configuración Express
│   ├── server.js           # arranque de la API
│   ├── controllers/        # lógica de endpoints
│   │   └── images.controller.js
│   ├── routes/             # rutas express
│   │   └── images.routes.js
│   ├── services/           # conexión a R2
│   │   └── r2.service.js
│   ├── middleware/         # configuración de multer
│   │   └── upload.js
│   └── db/                 # conexión a Postgres
│       └── index.js
├── public/                 # frontend sencillo (index.html)
├── postgre/                # scripts SQL para DB
│   ├── createdb.sql
│   ├── scheme.sql
│   ├── permisosUsser.sql
│   └── diagnostico.sql
├── Dockerfile
├── .dockerignore
├── .gitignore
├── package.json
└── .env.example


Instalacion: 
Clonar repo: 
git clone https://github.com/crisMdn/boton---para-web-.git
cd boton---para-web-

Instalar dependencias: 
npm install

Variables de entorno: 
Crear un archivo .env a partir de env.example: 
cp .env.example .env

Solicitar las credencias para el archivo .env


🗄️ Base de datos

Ejecutar los scripts en postgre/ en este orden:

createdb.sql → crear base y usuario.

scheme.sql → crear tabla images.

permisosUsser.sql → asignar permisos.

(opcional) diagnostico.sql → consultas útiles para verificar.

Ejecutar proyecto: 
nmp start 

En modo desarrollo (con nodemon): 
npm run dev 

Acceder a:
API: 👉 http://localhost:3000/api/images

Frontend: 👉 http://localhost:3000

🧹 Notas

Antes se usaba /uploads local, ahora todo va a R2.

La tabla images guarda key, mime, size_bytes, created_at.

Para limpiar datos:
DELETE FROM images;
-- o
TRUNCATE TABLE images RESTART IDENTITY;
