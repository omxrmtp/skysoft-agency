# 🚀 Guía Completa de Despliegue - SkySoft Agency
## Paso a Paso para Lanzar tu Sitio Web en Producción

### 🎯 ¿Qué vamos a hacer?
Vamos a transformar tu proyecto local en un sitio web profesional accesible para todo el mundo usando:
- **Vercel** para alojar tu frontend (la parte visual)
- **Supabase** para tu base de datos y backend (la parte funcional)

---

## 🗄️ PASO 1: Crear tu Base de Datos en Supabase

### 📝 1.1 Crear Cuenta y Proyecto
1. **Abre tu navegador** y ve a [https://supabase.com](https://supabase.com)
2. **Haz clic en "Sign Up"** si no tienes cuenta, o "Log In" si ya la tienes
3. **Una vez dentro**, haz clic en el botón grande que dice **"New Project"**
4. **Completa el formulario:**
   - **Organization:** Escribe el nombre de tu empresa (ej: "SkySoft Agency")
   - **Project Name:** Escribe `skysoft-agency` (exactamente así, en minúsculas y con guión)
   - **Database Password:** Crea una contraseña segura (¡guárdala en un lugar seguro!)
   - **Region:** Elige la que esté más cerca de tus clientes (recomiendo: "East US (North Virginia)")
5. **Haz clic en "Create new project"** y espera unos 2-3 minutos mientras se configura

### 🛠️ 1.2 Configurar la Base de Datos
1. **En el panel izquierdo**, haz clic en **"SQL Editor"** (ícono de base de datos)
2. **Haz clic en el botón "New query"** (arriba a la izquierda)
3. **Abre tu proyecto local** y ve al archivo `database/supabase-schema.sql`
4. **Selecciona todo el contenido** del archivo (Ctrl+A) y cópialo (Ctrl+C)
5. **Vuelve a Supabase** y pega todo el código en el editor (Ctrl+V)
6. **Haz clic en el botón "Run"** (►) para ejecutar el código
7. **Espera a que aparezca** "Success" en verde - ¡esto significa que tu base de datos está lista!

### 📁 1.3 Configurar Almacenamiento de Archivos
1. **En el panel izquierdo**, haz clic en **"Storage"** (ícono de carpeta)
2. **Haz clic en "Create a new bucket"**
3. **Configura el bucket:**
   - **Name:** Escribe `images` (exactamente así)
   - **Public bucket:** Marca esta casilla
4. **Haz clic en "Save"**
5. **Ahora configura los permisos:**
   - Haz clic en el bucket "images" que acabas de crear
   - Ve a la pestaña "Policies"
   - Haz clic en "New Policy"
   - Selecciona "For full custom access"
   - En "Policy name", escribe "Public images access"
   - En "Allowed operations", marca "SELECT" (lectura)
   - Haz clic en "Save"

### 🔑 1.4 Obtener tus Claves de Acceso
1. **En el panel izquierdo**, haz clic en el ícono de engranaje ⚙️ (**"Project Settings"**)
2. **Haz clic en "API"** en el menú de la izquierda
3. **Copia estas tres claves** (haz clic en el ícono de copiar 📋 al lado de cada una):
   
   **✅ Project URL:**
   ```
   https://xxxxx.supabase.co
   ```
   
   **✅ Anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   **✅ Service role key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Pega estas claves** en un bloc de notas temporal - las necesitaremos en el Paso 2

---

## � PASO 2: Configurar tu Proyecto Local

### 📦 2.1 Instalar la Dependencia de Supabase
1. **Abre tu terminal** o línea de comandos
2. **Navega a tu proyecto:**
   ```bash
   cd C:\Users\User\Desktop\skysoft
   ```
3. **Instala la librería de Supabase:**
   ```bash
   npm install @supabase/supabase-js
   ```
4. **Espera a que termine** de instalar (verás muchos paquetes descargándose)

### 🔐 2.2 Crear tu Archivo de Configuración
1. **En tu proyecto local**, busca el archivo `.env.local.example`
2. **Haz clic derecho** sobre él y selecciona "Copiar"
3. **Pega la copia** en la misma carpeta
4. **Renombra el archivo copiado** a `.env.local` (quítale el ".example")
5. **Abre el archivo `.env.local`** con tu editor de código

### 🔑 2.3 Configurar tus Claves en el Archivo
1. **Reemplaza el contenido** de `.env.local` con esto:
   ```env
   # Pegar aquí tus claves de Supabase
   VITE_SUPABASE_URL=https://TU-PROJECT-ID.supabase.co
   VITE_SUPABASE_ANON_KEY=TU-ANON-KEY-AQUI
   VITE_SUPABASE_SERVICE_ROLE_KEY=TU-SERVICE-KEY-AQUI
   
   # Configuración de la aplicación
   VITE_APP_NAME=SkySoft Agency
   VITE_APP_URL=https://tu-dominio.vercel.app
   ```
2. **Ahora reemplaza los valores:**
   - `https://TU-PROJECT-ID.supabase.co` → pega tu **Project URL** del paso 1.4
   - `TU-ANON-KEY-AQUI` → pega tu **Anon public key** del paso 1.4
   - `TU-SERVICE-KEY-AQUI` → pega tu **Service role key** del paso 1.4
3. **Guarda el archivo** (Ctrl+S)

### ✅ 2.4 Probar que Funciona Localmente
1. **En tu terminal**, asegúrate de estar en la carpeta del proyecto
2. **Inicia el servidor:**
   ```bash
   npm run dev
   ```
3. **Abre tu navegador** en `http://localhost:8080`
4. **Deberías ver tu sitio web** sin errores de consola
5. **Si todo funciona bien**, ¡continuemos al Paso 3!

---

## � PASO 3: Subir tu Código a GitHub

### 📁 3.1 Preparar tu Repositorio
1. **Abre tu terminal** en la carpeta del proyecto
2. **Verifica que tienes Git instalado:**
   ```bash
   git --version
   ```
3. **Si no lo tienes, descárgalo desde** [git-scm.com](https://git-scm.com)

### 🔄 3.2 Inicializar y Subir a GitHub
1. **Si aún no tienes un repositorio, inicializa Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SkySoft Agency ready for deployment"
   ```
2. **Ve a [github.com](https://github.com)** y crea una cuenta si no tienes
3. **Haz clic en "New repository"**
4. **Configura el repositorio:**
   - **Repository name:** `skysoft-agency`
   - **Description:** `SkySoft Agency - Elite Web Development Platform`
   - **Public:** Marca esta opción
   - **Add README:** No marcar (ya tenemos uno)
5. **Haz clic en "Create repository"**
6. **Copia los comandos** que te muestra GitHub y ejecútalos en tu terminal:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/skysoft-agency.git
   git branch -M main
   git push -u origin main
   ```
7. **Reemplaza TU-USUARIO** con tu nombre de usuario de GitHub

---

## 🌐 PASO 4: Desplegar en Vercel

### 🎯 4.1 Crear Cuenta en Vercel
1. **Ve a [vercel.com](https://vercel.com)**
2. **Haz clic en "Sign Up"**
3. **Elige "Continue with GitHub"** (la opción más fácil)
4. **Autoriza a Vercel** para acceder a tus repositorios de GitHub
5. **Completa tu perfil** si te lo pide

### 🚀 4.2 Importar tu Proyecto
1. **En el dashboard de Vercel**, haz clic en **"Add New..."** → **"Project"**
2. **Busca tu repositorio** `skysoft-agency` en la lista
3. **Haz clic en "Import"** al lado de tu repositorio
4. **Vercel analizará** tu proyecto automáticamente (detectará que es React + Vite)

### ⚙️ 4.3 Configurar Variables de Entorno en Vercel
1. **En la página de configuración del proyecto**, ve a **"Environment Variables"**
2. **Añade estas tres variables:**
   
   **Variable 1:**
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** Pega tu Project URL de Supabase
   
   **Variable 2:**
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** Pega tu Anon public key de Supabase
   
   **Variable 3:**
   - **Name:** `VITE_SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Pega tu Service role key de Supabase

3. **Haz clic en "Add"** para cada variable
4. **Haz clic en "Save"** para guardar todo

### 🎉 4.4 Lanzar tu Sitio Web
1. **En la parte inferior**, haz clic en **"Deploy"**
2. **Vercel construirá** tu proyecto (tarda 2-3 minutos)
3. **Verás el progreso** en tiempo real
4. **Cuando termine**, verás:**
   - ✅ **"Ready!"** en verde
   - 🌐 **Tu URL del sitio** (ej: `skysoft-agency.vercel.app`)

### 🎯 4.5 ¡Felicidades! Tu Sitio Está Online
1. **Haz clic en tu URL** para visitar tu sitio web
2. **Prueba el formulario de contacto** - debería funcionar con Supabase
3. **Guarda tu URL** - ¡este es tu nuevo sitio web profesional!

### 🎨 5.1 Dominio Personalizado (Opcional)
1. **En el dashboard de Vercel**, ve a **"Settings"** → **"Domains"**
2. **Añade tu dominio:**
   - Escribe: `tudominio.com`
   - Haz clic en "Add"
3. **Configura el DNS:**
   - Copia los registros DNS que te muestra Vercel
   - Ve a tu registrador de dominios (GoDaddy, Namecheap, etc.)
   - Añade los registros DNS
4. **Espera 24-48 horas** para que se propague el dominio

### 📊 5.2 Analytics y Monitoreo
1. **Vercel Analytics:**
   - En tu dashboard de Vercel, ve a "Analytics"
   - Activa el seguimiento (es gratuito)
   - Podrás ver visitas, rendimiento y errores

2. **Supabase Dashboard:**
   - Monitorea el uso de tu base de datos
   - Revisa los logs de errores
   - Controla el almacenamiento usado

### 🔍 5.3 Probar Todo Funciona
1. **Visita tu sitio web** en la URL de Vercel
2. **Prueba el formulario de contacto** - debería guardar en Supabase
3. **Revisa la consola** del navegador (F12) - no debería haber errores
4. **Verifica en Supabase:**
   - Ve a "Table Editor" → "leads"
   - Deberías ver los datos del formulario de contacto

---

## 🆘 PASO 6: Solución de Problemas Comunes

### ❌ Error: "Invalid JWT" o "API key is invalid"
**🔍 Causa:** Clave de Supabase incorrecta
**✅ Solución:**
1. Verifica que copiaste correctamente las claves del paso 1.4
2. Asegúrate de no tener espacios extra
3. Revisa las variables de entorno en Vercel

### ❌ Error: "Row level security violation"
**🔍 Causa:** Políticas de seguridad muy restrictivas
**✅ Solución:**
1. Ve a Supabase → "Authentication" → "Policies"
2. Revisa las políticas de cada tabla
3. Asegúrate de que permitan lecturas públicas

### ❌ Error: "CORS policy violation"
**🔍 Causa:** Dominio no autorizado en Supabase
**✅ Solución:**
1. Ve a Supabase → "Project Settings" → "API"
2. En "CORS", añade tu dominio de Vercel
3. Guarda los cambios

### ❌ Error: "Build failed" en Vercel
**🔍 Causa:** Problemas con las dependencias o código
**✅ Solución:**
1. Revisa los logs de error en Vercel
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate de que no haya errores de TypeScript

---

## ✅ CHECKLIST FINAL - ¡Revisa Todo Esto!

### 🗄️ Supabase ✅
- [ ] Proyecto creado en supabase.com
- [ ] Schema SQL ejecutado correctamente
- [ ] Bucket "images" creado y configurado
- [ ] Claves de API copiadas y guardadas

### 💻 Configuración Local ✅
- [ ] Dependencia `@supabase/supabase-js` instalada
- [ ] Archivo `.env.local` creado y configurado
- [ ] Servidor local funciona sin errores

### � GitHub ✅
- [ ] Repositorio creado en GitHub
- [ ] Código subido correctamente
- [ ] Commits descriptivos realizados

### 🌐 Vercel ✅
- [ ] Cuenta creada y conectada a GitHub
- [ ] Proyecto importado y configurado
- [ ] Variables de entorno configuradas en Vercel
- [ ] Despliegue completado exitosamente
- [ ] Sitio web accesible en tu URL

### 🧪 Pruebas ✅
- [ ] Sitio web carga correctamente
- [ ] Formulario de contacto funciona
- [ ] Datos se guardan en Supabase
- [ ] Sin errores en la consola del navegador

---

## � ¡FELICIDADES! 🎉

### 🌟 ¡Tu SkySoft Agency está ahora en producción!
- **Tu sitio web profesional** está online y accesible para todo el mundo
- **Tu base de datos** está funcionando y guardando datos reales
- **Tu formulario de contacto** está capturando leads potenciales
- **Todo está configurado** para escalar y crecer con tu negocio

### 📈 Próximos Pasos Recomendados:
1. **Monitorea tu sitio** regularmente con Vercel Analytics
2. **Responde a los leads** rápidamente desde Supabase
3. **Añade más proyectos** a tu portafolio
4. **Considera agregar un blog** para mejorar SEO
5. **Configura un dominio personalizado** para mayor profesionalismo

### 📞 Si Necesitas Ayuda:
- **Documentación Vercel:** [vercel.com/docs](https://vercel.com/docs)
- **Documentación Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Soporte SkySoft:** Revisa tu código o crea issues en GitHub

---

**¡Has completado con éxito el despliegue de SkySoft Agency! 🚀**
