# PoliCV
Plataforma web inteligente basado en IA para la generación de currículums vitae y recomendación de ofertas laborales mediante un asistente conversacional para estudiantes de la ESFOT. 

# Instalación del proyecto 

## 1. Programas necesarios 
Antes de ejecutar el proyecto se debe verificar que este instalado:
- Git 
- Node.js
- MySQL Workbench
- Visual Studio Code
- Postman 

## 2. Descargar el proyecto 
Clonar el repositorio y entrar al proyecto cd PoliCV 

## 3. Instalar las dependencias del backend 
Entrar a la carpeta backend e instalar:
- npm install 

## 4. Configurar las variables de entorno 
Dentro de la carpeta backend crear la carpeta 
- .env 
Tomar como referencia el archivo .env.example 
(La configuración actual es:)
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=(Colocar la contraseña de MySQL correspondiente a la computadora)
DB_NAME=policv

## 5. Crear la base de datos 
Se encuentran en la carpeta database la estructura real de la base de datos
- También se puede ejecutar desde el terminal con el comando 
mysql -u root -p < database/policv.sql

## 6. Ejecutar el backend 
npm run dev 

