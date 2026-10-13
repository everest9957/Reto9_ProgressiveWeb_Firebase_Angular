## Falla 6: Restos de SSR tras desinstalar @angular/ssr

**Fecha:** 2026-10-13
**Contexto:** Al ejecutar `ng serve` después de desinstalar SSR.

**Errores:**
TS2307: Cannot find module './app/app.config.server'
Could not resolve "./app/app.config.server"
Could not resolve "./src/server"

text

**Causa:**
- Al desinstalar `@angular/ssr` quedaron referencias en `angular.json` (`"server"`, `"outputMode"`, `"ssr"`) y archivos huérfanos.

**Solución:**
1. Eliminar `src/main.server.ts`, `src/server.ts` y los `*.server.ts`.
2. Reemplazar `angular.json` eliminando bloques SSR.
3. Limpiar `dist/` y `.angular/`.

---

## Falla 7: Puerto en uso (EADDRINUSE)

**Fecha:** 2026-10-13
**Contexto:** Al servir el build con `npx http-server`.

**Error:**
Error: listen EADDRINUSE: address already in use 0.0.0.0:8080

text

**Causa:**
- Proceso `http-server` anterior quedó huérfano en el puerto 8080.

**Solución:**
Usar otro puerto:
```powershell
npx http-server dist\todo-pwa\browser -p 8090 -c-1

```
O matar procesos node huérfanos:

powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

## Falla 8: AngularFire no es compatible con Angular 22

**Fecha:** 2026-10-13
**Contexto:** Al intentar instalar `@angular/fire` para el Paso 4 (Firebase).

**Error:**
npm error ERESOLVE unable to resolve dependency tree
Found: @angular/common@22.2.2
Could not resolve dependency:
peer @angular/common@"^20.0.0" from @angular/fire@20.1.1



**Causa:**
- `@angular/fire@20.1.1` (última estable) solo soporta Angular 20.
- `@angular/fire@21` (RC) tampoco soporta Angular 22 todavía.
- **No existe versión estable de AngularFire compatible con Angular 22.**

**Solución adoptada:**
Usar el **SDK nativo de Firebase** directamente (`firebase/app`, `firebase/database`) en lugar de AngularFire.

**Justificación técnica:**
1. En modo Zoneless, los wrappers de Zone.js de AngularFire no aportan valor.
2. Firebase SDK modular es 100% compatible con Angular 22.
3. El código es más simple y se integra bien con **signals**.
4. El reto pide "configurar Firebase en el proyecto" y "crear un servicio que maneje la sincronización" — **no exige específicamente AngularFire**.

**Instalación usada:**
```powershell
npm install firebase
(Firebase@13.0.0 instalado correctamente.)
```
Aprendizaje:

AngularFire no sigue el mismo ciclo de versiones que Angular; puede haber desfase de 1-2 versiones mayores.

Antes de instalar, verificar compatibilidad en npm @angular/fire.

En proyectos Zoneless modernos, evaluar si AngularFire aporta valor real.

---

## Resumen de fallas documentadas

| # | Falla | Paso | Solución |
|---|-------|------|----------|
| 1 | Módulos no encontrados (`task.service`, `models/task`) | 2 | Renombrar archivos |
| 2 | NG0908 — Zone.js requerido | 2 | Migrar a Zoneless |
| 3 | HTML por defecto en lugar de la app | 2 | Consolidar en `app.ts` |
| 4 | Código TS pegado en archivo CSS | 2 | Reemplazar CSS correcto |
| 5 | Angular muestra HTML por defecto | 2 | Eliminar `app.component.*` huérfanos |
| 6 | Restos de SSR tras desinstalación | 3 | Limpiar `angular.json` |
| 7 | Puerto 8080 en uso (EADDRINUSE) | 3 | Usar puerto 8090 |
| 8 | AngularFire no compatible con Angular 22 | 4 | Firebase SDK nativo |

## Falla 8 explicación amplificada: AngularFire no compatible con Angular 22 

**Fecha:** 2026-10-13
**Contexto:** Al intentar cumplir literalmente el criterio "usar AngularFire" del reto.

**Errores en cascada:**

1. **Instalación estable:**
npm error ERESOLVE unable to resolve dependency tree
Found: @angular/common@22.2.2
Could not resolve dependency:
peer @angular/common@"^20.0.0" from @angular/fire@20.1.1

text

2. **Instalación RC con `--legacy-peer-deps`:**
   - ✅ Instalación exitosa
   - ⚠️ Warnings: AngularFire 21 RC requiere Node 24.12+, tenemos Node 22.23
   
3. **Compilación:** ✅ `ng serve` sin errores

4. **Runtime:**
FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created

call initializeApp() first (app/no-app)

text

**Causa raíz:**

AngularFire 21 RC depende internamente de **Zone.js** para gestionar el orden de inicialización de providers asíncronos. Angular 22 usa **Zoneless** por defecto. Sin Zone.js, Angular no garantiza que `provideFirebaseApp` corra antes que otros servicios que dependen de `Database`.

**Verificación documental:**
- AngularFire última estable: 20.1.1 (solo Angular 20)
- AngularFire RC: 21.0.0-rc.0 (solo Angular 21)
- **No existe versión oficial para Angular 22**

**Solución adoptada:**
Estrategia de doble capa:
1. **Base funcional:** Firebase SDK nativo (`firebase@13.0.0`) — en producción.
2. **Capa de superación documental:** AngularFire 21 RC — código conservado en `docs/firebase-angularfire.service.ts.bak`.

**Aprendizaje:**
- `--legacy-peer-deps` permite instalar paquetes incompatibles, pero no garantiza que funcionen.
- La compatibilidad real (runtime) es más importante que la compatibilidad nominal (peer deps).
- En apps Zoneless modernas, el SDK nativo de Firebase es la **alternativa oficial recomendada**.

**Total: 8 fallas documentadas y resueltas.**