Proyecto Botton

Este proyecto es una API en Node.js con Express que permite subir imágenes, almacenarlas en el servidor y guardar sus metadatos en una base de datos PostgreSQL.

🚀 Funcionalidades principales

Subida de imágenes mediante multer.

Almacenamiento de archivos en la carpeta /uploads.

Registro en la base de datos (id, filename, url, uploaded_at).

Consulta de las imágenes subidas vía endpoint /images.

Uso de variables de entorno con dotenv para evitar credenciales hardcodeadas.

---------------------------------------------------------------------------------------------------------------------------------
🛠️ Tecnologías usadas

Node.js + Express

PostgreSQL

Multer (manejo de archivos)

pg (conexión a Postgres)

dotenv (variables de entorno)

cors (para permitir peticiones externas)

------------------------------------------------------------------------------------------------------------------------------------
proyecto-botton/
 ├── index.js          # API principal
 ├── package.json      # dependencias y scripts
 ├── .env.example      # ejemplo de configuración
 ├── /uploads          # carpeta donde se guardan imágenes (ignorada en git)
 └── /postgre          # scripts SQL para base de datos

--------------------------------------------------------------------------------------------------------------------------------------
CLONAR REPOSITORIO: 
git clone https://github.com/crisMdn/boton---para-web-.git
cd boton---para-web-

------------------------------------------------------------------------------------------------------------
Instalar dependencias: 
BASH: 
npm install 

-------------------------------------------------------------------------------------------------------------
Configuracion varibales de entorno: 

crea un archivo .env a partir de .env.example : 
BASH
cp .env.example .env

--------------------------------------------------------------------------------------------------------------------------------------------
Editar .env con las credenciales 

Solicitar personalmente. 

-------------------------------------------------------------------------------------
Prepara la BS, siguiendo los scrips de la carperta postgre
1. createdb
2. scheme
3. permisosUsser

-------------------------------------------------------------------------------------------------
Crear la carpeta uploads desde VSO o desde bash: 
Bash: 
mkdir uploads 

-----------------------------------------------------------------------------------
Ejecuta el proyeto: 
npm start

-------------------------------------------------------------------------------
NOTA: para ver los json subidos al momento de publicar una imagen, agregar a la url: /images
