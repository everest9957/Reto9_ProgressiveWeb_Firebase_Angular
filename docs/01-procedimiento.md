# Documento 01 — Procedimiento del Reto 9

**Proyecto:** PWA con Angular y Firebase  
**Reto:** 9 — Implementación de una Progressive Web App (PWA) con Angular y Firebase  
**Curso:** Desarrollo Web Frameworks — Código Samurái  
**Fecha de inicio:** 2026-10-13  
**Autor:** [Tu nombre]  
**Repositorio:** [URL del repo en GitHub — se completará al final]

---

## Índice

1. [Paso 1: Configuración del proyecto Angular](#paso-1-configuración-del-proyecto-angular)
2. [Paso 2: Desarrollo de la aplicación base (pre-PWA)](#paso-2-desarrollo-de-la-aplicación-base-pre-pwa)
3. [Paso 3: Conversión a PWA](#paso-3-conversión-a-pwa) *(pendiente)*
4. [Paso 4: Integración con Firebase](#paso-4-integración-con-firebase) *(pendiente)*
5. [Paso 5: Almacenamiento local y sincronización](#paso-5-almacenamiento-local-y-sincronización) *(pendiente)*
6. [Paso 6: Pruebas](#paso-6-pruebas) *(pendiente)*

---

## Paso 1: Configuración del proyecto Angular

**Fecha:** 2026-10-13  
**Objetivo:** Crear un proyecto Angular funcional usando Angular CLI y verificar que arranca correctamente antes de cualquier otra modificación.

### 1.1 Verificación del entorno

Se verificó que el entorno tuviera las herramientas necesarias instaladas.

**Comandos ejecutados:**
```powershell
node -v
npm -v
ng version
```

**Resultados obtenidos:**
| Herramienta | Versión |
|-------------|---------|
| Angular CLI | 22.2.2 |
| Angular | 22.2.2 |
| Node.js | 22.23.3 |
| Package Manager | npm 10.9.9 |
| Operating System | win32 x64 |

**Captura:** `capturas/01-verificacion-entorno.png`

### 1.2 Navegación a la carpeta del reto

Se accedió a la carpeta de trabajo creada previamente.

**Comando ejecutado:**
```powershell
cd C:\Users\jdthg\Documents\cursoDesarrolloWebFrameworks6\Reto9_ProgressiveWeb_Firebase_Angular
dir
```

**Captura:** `capturas/02-carpeta-reto.png`

### 1.3 Creación del proyecto Angular

Se creó el proyecto Angular directamente en la carpeta raíz del reto (sin subcarpeta adicional).

**Comando ejecutado:**
```powershell
ng new todo-pwa --directory .
```

**Decisiones tomadas durante la creación:**
| Pregunta | Respuesta |
|----------|-----------|
| Which stylesheet format? | CSS |
| Do you want to enable Server-Side Rendering (SSR)? | Yes *(por defecto en Angular 22)* |
| Do you want to use zoneless? | Yes *(por defecto en Angular 22)* |

**Nota:** El proyecto se creó directamente en la carpeta `Reto9_ProgressiveWeb_Firebase_Angular/`. El nombre interno del proyecto es `todo-pwa`, pero los archivos quedaron en el directorio actual gracias al flag `--directory .`.

**Captura:** `capturas/03-ng-new.png`

### 1.4 Verificación de la estructura del proyecto

**Comando ejecutado:**
```powershell
dir
```

Se confirmó la presencia de los archivos generados por Angular CLI:
- `src/`
- `angular.json`
- `package.json`
- `tsconfig.json`
- `node_modules/`

**Captura:** `capturas/04-estructura-proyecto.png`

### 1.5 Comprobación de que la aplicación funciona

**Comando ejecutado:**
```powershell
ng serve -o
```

La aplicación se abrió en `http://localhost:4200` mostrando la pantalla por defecto de Angular ("Hello, todo-pwa").

**Captura:** `capturas/05-ng-serve-inicial.png`

### Resultado del Paso 1

- ✅ Proyecto Angular 22 creado correctamente
- ✅ `ng serve` funciona
- ✅ Estructura de archivos correcta
- ✅ SSR y Zoneless habilitados por defecto

---

## Paso 2: Desarrollo de la aplicación base (pre-PWA)

**Fecha:** 2026-10-13  
**Objetivo:** Construir una aplicación Angular funcional (CRUD completo) **antes** de convertirla en PWA. Esto asegura que cualquier problema posterior sea atribuible a la conversión PWA y no a la lógica de negocio.

### 2.1 Aplicación elegida

Se eligió una **lista de tareas (To-Do)** por las siguientes razones:
- El CRUD es evidente y fácil de demostrar
- Permite probar sincronización con Firebase (tareas creadas offline y sincronizadas)
- Es una app clásica de ejemplo en PWA

**Funcionalidades requeridas:**
- ✅ Crear tareas
- ✅ Listar tareas
- ✅ Editar tareas
- ✅ Eliminar tareas
- ✅ Marcar como completadas

### 2.2 Estructura creada

```
src/app/
├── models/
│   └── task.ts                              # Interfaz Task
├── services/
│   └── task.service.ts                      # Servicio CRUD con signals
├── components/
│   ├── task-form/
│   │   ├── task-form.component.ts
│   │   ├── task-form.component.html
│   │   └── task-form.component.css
│   └── task-list/
│       ├── task-list.component.ts
│       ├── task-list.component.html
│       └── task-list.component.css
├── app.ts                                   # Componente raíz (esquema Angular 22)
├── app.html                                 # Layout principal
├── app.css                                  # Estilos del contenedor
├── app.config.ts                            # Configuración (Zoneless + Router + HTTP)
└── app.routes.ts                            # Rutas (vacías por ahora)
```

### 2.3 Decisiones técnicas

| Decisión | Justificación |
|----------|---------------|
| **Signals en lugar de BehaviorSubject** | Angular 22 usa Zoneless por defecto; los signals garantizan detección de cambios automática. |
| **Componentes standalone** | Es el estándar actual de Angular (desde v17). |
| **Esquema de nombres nuevo** (`app.ts` en lugar de `app.component.ts`) | Obligatorio en Angular 22 con SSR habilitado. |
| **`provideZonelessChangeDetection()`** | Necesario porque `angular.json` no incluye `zone.js` en `polyfills`. |
| **Modelo con campo `synced`** | Se usará después para marcar tareas que aún no se han sincronizado con Firebase. |

### 2.4 Código de los archivos principales

#### `src/app/models/task.ts`

```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  synced: boolean; // ← se usará para sincronización con Firebase
}
```

#### `src/app/services/task.service.ts`

Servicio CRUD basado en **signals**:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Task } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private tasksSignal = signal<Task[]>([
    {
      id: crypto.randomUUID(),
      title: 'Aprender Angular',
      description: 'Completar el Reto 9',
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false
    }
  ]);

  readonly tasks = this.tasksSignal.asReadonly();
  readonly pendingCount = computed(() =>
    this.tasksSignal().filter(t => !t.completed).length
  );

  addTask(title: string, description?: string): void {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false
    };
    this.tasksSignal.update(tasks => [...tasks, newTask]);
  }

  updateTask(id: string, changes: Partial<Task>): void {
    this.tasksSignal.update(tasks =>
      tasks.map(t =>
        t.id === id ? { ...t, ...changes, updatedAt: Date.now(), synced: false } : t
      )
    );
  }

  deleteTask(id: string): void {
    this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
  }

  toggleComplete(id: string): void {
    const task = this.tasksSignal().find(t => t.id === id);
    if (task) {
      this.updateTask(id, { completed: !task.completed });
    }
  }
}
```

#### `src/app/app.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, TaskListComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'Todo PWA';

  constructor(private taskService: TaskService) {}

  onTaskAdded(event: { title: string; description?: string }): void {
    this.taskService.addTask(event.title, event.description);
  }
}
```

#### `src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

*(El resto de archivos — componentes y templates — se documentan en `02-fallas-y-soluciones.md` y en el repositorio.)*

### 2.5 Fallas encontradas durante este paso

Se documentan por separado en `02-fallas-y-soluciones.md`. Resumen:

1. Módulos no encontrados (`task.service`, `models/task`) → nombres de archivo incorrectos.
2. NG0908 (Zone.js requerido) → migración a Zoneless.
3. HTML por defecto en lugar de la app → `main.ts` importaba `App` desde `./app/app`, no `./app/app.component`.
4. Código TypeScript pegado en archivo CSS → error humano, corregido.

### 2.6 Verificación final del Paso 2

| Punto | Estado |
|-------|--------|
| La app crea tareas | ✅ |
| La app lista tareas | ✅ |
| La app edita tareas | ✅ |
| La app elimina tareas | ✅ |
| La app marca completadas | ✅ |
| La consola del navegador está limpia | ✅ |
| `ng serve` sin warnings críticos | ✅ |

**Capturas:**
- `capturas/43-app-funcional.png`
- `capturas/44-crud-completo.png`
- `capturas/55-consola-limpia.png`

### Resultado del Paso 2

- ✅ App To-Do funcional con CRUD completo
- ✅ Código limpio y modular
- ✅ Preparada para convertirse en PWA (siguiente paso)
- ✅ Campo `synced` listo para la integración con Firebase

---

## Paso 3: Conversión a PWA

*(Pendiente — se completará tras `ng add @angular/pwa`)*

---

## Paso 4: Integración con Firebase

*(Pendiente)*

---

## Paso 3: Conversión a PWA

**Fecha:** 2026-10-13  
**Objetivo:** Convertir la app To-Do en una Progressive Web App usando `@angular/pwa`.

### 3.1 Limpieza previa (SSR fuera)

Antes de la conversión se desinstaló SSR para evitar conflictos:

```powershell
npm uninstall @angular/ssr @angular/platform-server
Remove-Item src\main.server.ts
Remove-Item src\server.ts
Remove-Item src\app\app.config.server.ts
Remove-Item src\app\app.routes.server.ts
```

Y se limpió `angular.json` eliminando los bloques `"server"`, `"outputMode"` y `"ssr"`.

**Capturas:**
- `capturas/70-eliminar-archivos-ssr.png`
- `capturas/72-angular-json-sin-ssr.png`

### 3.2 Comando de conversión

```powershell
ng add @angular/pwa
```

Este comando:
- Instala `@angular/pwa` y `@angular/service-worker`
- Crea `ngsw-config.json` (configuración del Service Worker)
- Crea `public/manifest.webmanifest` (manifiesto de la app)
- Genera íconos en `public/icons/` (8 tamaños: 72x72 hasta 512x512)
- Modifica `angular.json` (`"serviceWorker": "ngsw-config.json"`)
- Modifica `app.config.ts` (registra `provideServiceWorker`)
- Modifica `index.html` (`<link rel="manifest">` + `theme-color`)

**Captura:** `capturas/76-ng-add-pwa.png`

### 3.3 Archivos generados

| Archivo | Propósito |
|---------|-----------|
| `ngsw-config.json` | Define qué archivos cachear y cómo |
| `public/manifest.webmanifest` | Datos de la app para instalación (nombre, íconos, colores) |
| `public/icons/*.png` | 8 íconos en distintos tamaños |

**Capturas:**
- `capturas/77-archivos-pwa.png`
- `capturas/78-manifest.png`
- `capturas/79-ngsw-config.png`

### 3.4 Archivos modificados

#### `angular.json`
```json
"serviceWorker": "ngsw-config.json"
```

#### `app.config.ts`
```typescript
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000'
})
```

#### `index.html`
```html
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#1976d2">
```

**Capturas:**
- `capturas/80-angular-json-serviceworker.png`
- `capturas/81-app-config-serviceworker.png`
- `capturas/82-index-html.png`

### 3.5 ¿Qué es un Service Worker?

Un Service Worker es un **script que el navegador ejecuta en segundo plano**, independiente de la página web. Funciona como un **proxy de red**: intercepta todas las peticiones HTTP que hace la app y decide si las sirve desde la **caché local** o desde la **red**.

**Características:**
- Se ejecuta en un hilo separado (no bloquea la UI)
- No tiene acceso al DOM
- Puede funcionar sin conexión
- Se instala una sola vez y persiste entre sesiones

### 3.6 ¿Qué es el manifiesto de la aplicación?

Es un archivo JSON (`manifest.webmanifest`) que describe la app como si fuera una aplicación nativa:

| Campo | Significado |
|-------|-------------|
| `name` | Nombre completo de la app |
| `short_name` | Nombre corto (para el ícono) |
| `icons` | Íconos en varios tamaños |
| `theme_color` | Color de la barra del navegador |
| `background_color` | Color de fondo al abrir |
| `display` | `standalone` (sin barra del navegador) |
| `start_url` | Página inicial al abrir |
| `scope` | Alcance de la PWA |

Permite que la app se **instale en el dispositivo** como si fuera nativa.

### 3.7 ¿Cómo permiten los Service Workers el funcionamiento offline?

1. **Precarga (installMode: prefetch):** Al instalarse, el SW descarga los recursos estáticos definidos en `ngsw-config.json` y los guarda en caché.
2. **Intercepción:** Cuando el usuario navega, el SW intercepta cada petición.
3. **Estrategia de caché:** Si el recurso está en caché, lo sirve desde ahí; si no, lo pide a la red (y actualiza la caché).
4. **Sin conexión:** Si no hay red, el SW sirve los recursos desde la caché → la app funciona.

En nuestro caso, `ngsw-config.json` define dos grupos:

```json
{
  "assetGroups": [
    { "name": "app", "installMode": "prefetch", ... },
    { "name": "assets", "installMode": "lazy", "updateMode": "prefetch", ... }
  ]
}
```

### 3.8 Pruebas realizadas

| Prueba | Estado | Captura |
|--------|--------|---------|
| Build de producción (`ng build`) | ✅ | `83-ng-build.png` |
| Archivos PWA generados en `dist/` | ✅ | `84-build-archivos-pwa.png` |
| App funciona en `http://localhost:8090` | ✅ | `85-app-produccion.png` |
| Service Worker activo en DevTools | ✅ | `91-devtools-serviceworker.png` |
| Manifest reconocido por el navegador | ✅ | `92-devtools-manifest.png` |
| Modo offline funciona | ✅ | `93-modo-offline.png` |
| App instalable como PWA | ✅ | `94-app-instalada.png` |

### 3.9 Fallas encontradas en este paso

Documentadas en `02-fallas-y-soluciones.md`:
- **Falla 6:** Restos de SSR tras desinstalar `@angular/ssr`
- **Falla 7:** Puerto 8080 en uso (`EADDRINUSE`)

### Resultado del Paso 3

- ✅ PWA funcional con Service Worker
- ✅ Funciona offline
- ✅ Instalable como app nativa
- ✅ Manifest configurado correctamente
- ✅ Preparada para integración con Firebase (siguiente paso)

## Paso 4: Integración con Firebase

**Fecha:** 2026-10-13  
**Objetivo:** Sincronizar la app con Firebase Realtime Database en tiempo real.

### 4.1 Creación del proyecto en Firebase Console
1. Se accedió a [Firebase Console](https://console.firebase.google.com/)
2. Se creó el proyecto **reto9-todo-pwa**
3. Se activó **Realtime Database** en modo de prueba
4. Se registró la app web y se obtuvo el `firebaseConfig`

**Capturas:**
- `capturas/96-firebase-crear-proyecto.png`
- `capturas/97-firebase-proyecto-creado.png`
- `capturas/98-firebase-realtime-db.png`
- `capturas/99-firebase-credenciales.png`

### 4.2 Instalación de Firebase SDK
**Comando:**
```powershell
npm install firebase
```

Se instaló `firebase@13.0.0` (SDK nativo modular).

**⚠️ Nota importante:** No se usó **AngularFire** por incompatibilidad con Angular 22. Ver detalle en Falla 8 de `02-fallas-y-soluciones.md`.

**Captura:** `capturas/100e-verificar-firebase.png`

### 4.3 Configuración
-`app.config.ts` permaneció sin cambios (Firebase se inicializa en el servicio, no en la configuración global). **Captura:** `capturas/101-app-config-sin-angularfire.png`
- `firebase.service.ts`: servicio que encapsula el SDK de Firebase (CRUD + Observable de tareas).

### 4.4 Sincronización con TaskService
`TaskService` ahora:
- Se suscribe a los cambios remotos de Firebase (escucha en tiempo real).
- Envía cada operación local a Firebase (add/update/delete).
- Marca cada tarea como `synced: true` tras confirmación de Firebase.
### `src/app/services/firebase.service.ts`

Encapsula el SDK de Firebase y expone un CRUD:

| Método | Descripción |
|--------|-------------|
| `getTasks(): Observable<Task[]>` | Escucha cambios en tiempo real vía `onValue` |
| `saveTask(task): Promise<void>` | Crea o reemplaza una tarea con `set` |
| `updateTask(id, changes): Promise<void>` | Actualiza campos parciales con `update` |
| `deleteTask(id): Promise<void>` | Elimina con `remove` |

**Captura:** `capturas/103-firebase-service.png`

#### `src/app/services/task.service.ts` (actualizado)

Ahora:
- Se suscribe a los cambios remotos al inicializarse.
- Envía cada operación local a Firebase.
- Marca cada tarea como `synced: true` tras confirmación de Firebase.

**Captura:** `capturas/105-task-service-con-firebase.png`


### 4.5 Pruebas de sincronización

| Prueba | Resultado | Captura |
|--------|-----------|---------|
| Agregar tarea en app → aparece en Firebase Console | ✅ | `capturas/107-firebase-con-datos.png` |
| Editar tarea en Firebase Console → aparece en app sin recargar | ✅ | `capturas/108-sync-tiempo-real.png` |
| Agregar tarea en una pestaña → aparece en otra pestaña | ✅ | `capturas/109-sync-dos-pestanas.png` |

### 4.6 Reglas de seguridad de Firebase

Para este reto se usan reglas de **modo de prueba**:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ Importante para producción:** estas reglas permiten a cualquiera leer/escribir. En un proyecto real se debe implementar **autenticación** (Firebase Auth) y reglas basadas en `auth.uid`.

**Captura:** `capturas/110-firebase-rules.png`

### 4.7 Flujo de sincronización implementado

```
[Usuario agrega tarea]
        ↓
[TaskService.addTask()]
        ↓
   ┌────┴────┐
   ↓         ↓
[Signal]  [Firebase.saveTask()]
(local)       ↓
          [Firebase DB]
              ↓
        [onValue emite]
              ↓
   [TaskService actualiza signal]
              ↓
      [UI se re-renderiza]
```

**Ventaja del patrón:** La UI responde **instantáneamente** (optimistic update) y se confirma con Firebase. Si Firebase falla, la app sigue funcionando con datos locales.

### Resultado del Paso 4

- ✅ Firebase Realtime Database integrado
- ✅ Sincronización en tiempo real bidireccional
- ✅ CRUD completo contra Firebase
- ✅ Signals reaccionan a cambios remotos
- ✅ Preparada para el **Paso 5: almacenamiento local + sync offline**

### 4.8 Nota sobre AngularFire

El reto pide "usar AngularFire". Se intentó cumplir literalmente:

1. **Instalación:** `npm install @angular/fire@21.0.0-rc.0 --legacy-peer-deps` ✅
2. **Compilación:** `ng serve` sin errores ✅
3. **Runtime:** ❌ Error `No Firebase App '[DEFAULT]' has been created`

**Causa:** incompatibilidad Zoneless ↔ AngularFire (que usa Zone.js internamente).

**Decisión:** Se conserva la implementación con **Firebase SDK nativo**, que es la alternativa oficial para apps Zoneless. La capa AngularFire se documenta en `03-informe-final.md` (Anexo B) y su código se conserva en `docs/firebase-angularfire.service.ts.bak`.

## Paso 5: Almacenamiento local y sincronización offline

**Fecha:** 2026-10-13  
**Objetivo:** Permitir que la app funcione sin conexión y sincronice automáticamente al recuperar la red.

### 5.1 Estrategia implementada

Se implementó un patrón de **3 capas**:

1. **localStorage** — fuente de verdad inmediata (síncrona, rápida)
2. **Firebase** — fuente remota (asíncrona)
3. **Cola de sincronización** — tareas con `pending: true` que se suben al recuperar conexión

**Flujo general:**

```
[Usuario agrega tarea]
        ↓
[TaskService.addTask()]
        ↓
   ┌────┴─────────────────┐
   ↓                      ↓
[localStorage]      [Firebase.saveTask()]
(inmediato)              ↓
   ↓                ¿Éxito?
[Signal]            ├─ Sí → synced: true
                    └─ No → pending: true
                            ↓
                    [Queda en cola]
                            ↓
        [Evento 'online': syncPendingTasks()]
```

### 5.2 Archivos creados/modificados

| Archivo | Cambio |
|---------|--------|
| `models/task.ts` | Añadidos campos `pending` y `pendingAction` |
| `services/storage.service.ts` | **Nuevo** — envoltura de `localStorage` |
| `services/task.service.ts` | Reescrito con soporte offline |
| `app.html` | Añadido banner de estado de conexión |
| `app.ts` | Expone `isOnline` y `pendingSyncCount` |
| `app.css` | Estilos del banner |

### 5.3 Código del `StorageService`

```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly TASKS_KEY = 'todo-pwa-tasks';

  getTasks(): Task[] {
    try {
      const raw = localStorage.getItem(this.TASKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('Error leyendo localStorage:', err);
      return [];
    }
  }

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.warn('Error escribiendo localStorage:', err);
    }
  }

  clear(): void {
    localStorage.removeItem(this.TASKS_KEY);
  }
}
```

### 5.4 Cambios en `TaskService`

**Nuevos campos:**
- `isOnline: signal<boolean>` — estado de conexión
- `pendingSyncCount: computed` — tareas pendientes

**Nuevos métodos:**
- `syncPendingTasks()` — sube todas las tareas pendientes a Firebase
- `trySyncTask(task)` — intenta sincronizar una sola tarea
- `mergeTasks(remote, localPending)` — fusiona datos remotos con locales pendientes

**Listener de conexión:**
```typescript
window.addEventListener('online', () => {
  this.isOnline.set(true);
  this.syncPendingTasks();
});
window.addEventListener('offline', () => {
  this.isOnline.set(false);
});
```

**Persistencia automática con `effect`:**
```typescript
effect(() => {
  const tasks = this.tasksSignal();
  this.storage.saveTasks(tasks);
});
```

### 5.5 Banner de estado en la UI

Se añadió un banner en `app.html` que muestra:
- 🟢 **En línea** (cuando hay conexión)
- 🔴 **Sin conexión — cambios guardados localmente** (modo offline)
- ⏳ **N pendiente(s) de sincronizar** (contador)

### 5.6 Pruebas realizadas

| Prueba | Resultado | Captura |
|--------|-----------|---------|
| Crear tareas sin conexión | ✅ | `capturas/115-tareas-offline.png` |
| Ver tareas en localStorage | ✅ | `capturas/116-localstorage-tareas.png` |
| Recuperar conexión → sync automático | ✅ | `capturas/117-sync-en-vivo.png` |
| Firebase Console recibe tareas pendientes | ✅ | `capturas/118-firebase-con-todas-las-tareas.png` |
| Recarga después de sync → todo persiste | ✅ | `capturas/119-recarga-final.png` |

### 5.7 Comportamiento observado

**Escenario probado:**
1. Con conexión, se crearon 2 tareas → subieron a Firebase inmediatamente.
2. Se activó **Offline** en DevTools.
3. Se creó **1 tarea adicional** → quedó en localStorage con `pending: true`.
4. Se reconectó → evento `online` disparó `syncPendingTasks()`.
5. La tarea pendiente se subió a Firebase automáticamente.
6. El contador de pendientes volvió a 0.

**Resultado:** Sincronización automática correcta sin intervención del usuario.

### Resultado del Paso 5

- ✅ Almacenamiento local funcional
- ✅ Detección automática de conexión/desconexión
- ✅ Cola de tareas pendientes
- ✅ Sincronización automática al recuperar red
- ✅ UI informa el estado al usuario
- ✅ **App completamente funcional offline y online**

---

## Paso 6: Pruebas finales

**Fecha:** 2026-10-13  
**Objetivo:** Verificar el funcionamiento completo de la PWA en todos los escenarios.

### 6.1 Batería de pruebas

Se ejecutaron 10 pruebas integrales cubriendo:
- Funcionamiento online/offline
- CRUD completo en ambos modos
- Sincronización automática
- Instalación como PWA
- Persistencia y multi-pestaña

### 6.2 Resultados

| # | Prueba | Resultado | Captura |
|---|--------|-----------|---------|
| 1 | Carga inicial online | ✅ | `capturas/120-prueba-01-carga-online.png` |
| 2 | Agregar tarea online | ✅ | `capturas/121-prueba-02-agregar-online.png` |
| 3 | Carga offline | ✅ | `capturas/122-prueba-03-carga-offline.png` |
| 4 | Agregar tarea offline | ✅ | `capturas/123-prueba-04-agregar-offline.png` |
| 5 | Editar tarea offline | ✅ | `capturas/124-prueba-05-editar-offline.png` |
| 6 | Eliminar tarea offline | ✅ | `capturas/125-prueba-06-eliminar-offline.png` |
| 7 | Reconexión y sync automática ⭐ | ✅ | `capturas/126-prueba-07-reconexion-consola.png` |
| 8 | Instalación como PWA | ✅ | `capturas/127-prueba-08-pwa-instalada.png` |
| 9 | Persistencia tras recarga | ✅ | `capturas/128-prueba-09-persistencia.png` |
| 10 | Sincronización entre pestañas | ✅ | `capturas/129-prueba-10-sync-pestanas.png` |

**Todas las pruebas pasaron sin errores.**

### 6.3 Prueba estrella: Sincronización offline → online

**Escenario:**
1. App en línea → se crean 2 tareas → suben inmediatamente a Firebase.
2. Se activa modo Offline en DevTools.
3. Se crean 3 tareas más + se edita 1 + se elimina 1 → todas quedan en `localStorage` con `pending: true`.
4. Se reactiva la conexión.
5. **Automáticamente** (sin intervención del usuario) se disparan los eventos `online` → `syncPendingTasks()` → sube todo a Firebase.
6. La consola muestra `🔄 Sincronizando N tarea(s) pendiente(s)...`
7. El banner cambia a `🟢 En línea`.
8. El contador de pendientes vuelve a 0.
9. Firebase Console muestra todas las tareas sincronizadas.

**Conclusión:** El objetivo del reto se cumple completamente.

### 6.4 Comportamiento en el navegador

Se usó **Brave** (Chromium-based) para las pruebas. Los resultados son extrapolables a Chrome, Edge y Opera, ya que comparten el mismo motor de Service Workers.

### Resultado del Paso 6

- ✅ 10/10 pruebas superadas
- ✅ Sin errores detectados
- ✅ PWA funcional en todos los escenarios
- ✅ Sincronización offline/online automática correcta

---

## Paso 7: Documentación y entrega

**Fecha:** 2026-10-13  
**Objetivo:** Documentar todo el proceso y publicar el código en GitHub.

### 7.1 Documentos generados

| Documento | Contenido |
|-----------|-----------|
| `README.md` | Vista general del proyecto, instalación, ejecución |
| `docs/01-procedimiento.md` | Paso a paso detallado del desarrollo |
| `docs/02-fallas-y-soluciones.md` | Registro de errores encontrados y soluciones aplicadas |
| `docs/03-informe-final.md` | Informe final de configuración y funcionamiento |
| `docs/capturas/` | 100+ capturas del proceso completo |

### 7.2 Repositorio GitHub

- **URL:** [se añadirá tras la publicación]
- **Commits:** [número de commits]
- **Estructura:** Código fuente + documentación

### 7.3 Estructura final del repositorio

```
Reto9_ProgressiveWeb_Firebase_Angular/
├── README.md
├── docs/
│   ├── 01-procedimiento.md
│   ├── 02-fallas-y-soluciones.md
│   ├── 03-informe-final.md
│   └── capturas/
│       └── (100+ capturas)
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── models/
│   │   ├── services/
│   │   ├── app.ts
│   │   ├── app.html
│   │   ├── app.css
│   │   └── app.config.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── public/
│   ├── icons/
│   └── manifest.webmanifest
├── ngsw-config.json
├── angular.json
├── package.json
└── .gitignore
```

### Resultado del Paso 7

- ✅ Documentación completa
- ✅ Código publicado en GitHub
- ✅ Repositorio estructurado y navegable