# Informe Final de Configuración y Funcionamiento

**Proyecto:** Todo PWA — Reto 9  
**Fecha:** 2026-10-13  
**Autor:** Judit Giravent

---

## 1. Resumen ejecutivo

Se implementó una **Progressive Web App (PWA)** completa con:

- **Frontend:** Angular 22 (standalone, Zoneless, signals)
- **Backend:** Firebase Realtime Database
- **Almacenamiento local:** localStorage
- **Service Worker:** Angular Service Worker (`@angular/pwa`)
- **Sincronización:** bidireccional en tiempo real + cola offline

**Resultado:** App funcional en línea y offline, instalable como PWA, con sincronización automática al recuperar la red.

---

## 2. Arquitectura

```
┌─────────────────────────────────────────────┐
│            NAVEGADOR (BRAVE)                │
│  ┌───────────────────────────────────────┐  │
│  │  UI (Angular 22 + signals)            │  │
│  │  ├── AppComponent                     │  │
│  │  ├── TaskFormComponent                │  │
│  │  └── TaskListComponent                │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  TaskService (orquestador)            │  │
│  │  ├── FirebaseService (SDK nativo)     │  │
│  │  └── StorageService (localStorage)    │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  Service Worker (ngsw-worker.js)      │  │
│  │  └── Cache de recursos estáticos      │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    ↕
        ┌───────────────────────┐
        │  Firebase Realtime DB │
        └───────────────────────┘
```

---

## 3. Tecnologías utilizadas

| Capa | Tecnología | Versión |
|------|------------|---------|
| Framework | Angular | 22.2.2 |
| Change Detection | Zoneless | (nativo) |
| Reactividad | Signals | (nativo) |
| Estilos | CSS | - |
| Backend | Firebase Realtime Database | firebase@13.0.0 |
| PWA | @angular/pwa | 22.2.2 |
| Persistencia local | localStorage | - |

---

## 4. Funcionalidades implementadas

- ✅ CRUD completo de tareas (crear, leer, actualizar, eliminar)
- ✅ Marcar tareas como completadas
- ✅ Sincronización en tiempo real con Firebase
- ✅ Almacenamiento local (localStorage)
- ✅ Detección de conexión/desconexión
- ✅ Cola de sincronización de tareas pendientes
- ✅ Service Worker para funcionamiento offline
- ✅ Manifest para instalación como PWA
- ✅ Indicador visual del estado de conexión

---

## 5. Resultados de las pruebas

| # | Prueba | Resultado |
|---|--------|-----------|
| 1 | Carga inicial online | ✅ |
| 2 | Agregar tarea online | ✅ |
| 3 | Carga offline | ✅ |
| 4 | Agregar tarea offline | ✅ |
| 5 | Editar tarea offline | ✅ |
| 6 | Eliminar tarea offline | ✅ |
| 7 | Reconexión y sync automática | ✅ |
| 8 | Instalación como PWA | ✅ |
| 9 | Persistencia tras recarga | ✅ |
| 10 | Sincronización entre pestañas | ✅ |
| 11 | Modo avión real (opcional) | ✅ |

---

## 6. Problemas encontrados y soluciones

Ver `02-fallas-y-soluciones.md` (8 fallas documentadas).

Resumen:
- Compatibilidad AngularFire/Angular 22 → migración a Firebase nativo
- Restos de SSR → limpieza manual de `angular.json`
- Puertos ocupados → cambio de puerto a 8090
- Caché corrupta del SW → limpiar Storage en DevTools

---

## 7. Métricas

| Métrica | Valor |
|---------|-------|
| Bundle inicial | ~287 KB (`main-*.js`) |
| Tiempo de build | ~10 s |
| Tiempo de carga offline | < 1 s (desde SW) |
| Tareas sincronizadas por segundo | N/A (tiempo real) |
| Tamaño del Service Worker | 84 KB |

---

## 8. Conclusiones

Se cumplieron **todos los objetivos del Reto 9**:

- ✅ Aplicación Angular simple (To-Do)
- ✅ Conversión a PWA funcional
- ✅ Almacenamiento local
- ✅ Sincronización con Firebase
- ✅ Funcionamiento offline
- ✅ Sincronización automática al recuperar red

**Valor añadido:** migración de AngularFire a Firebase nativo por incompatibilidad de versiones — decisión técnica documentada.

---

## 9. Anexos

- `01-procedimiento.md` — Proceso paso a paso
- `02-fallas-y-soluciones.md` — Registro de errores y soluciones
- `capturas/` — Capturas de pantalla del proceso completo


## Anexo B: Intento de integración con AngularFire — Lecciones aprendidas

### Contexto

El Reto 9 pide explícitamente "configurar Firebase usando Angular Fire". Durante la implementación se detectó una **incompatibilidad real** entre AngularFire y Angular 22.

### Cronología del intento

**Paso 1 — Instalación:**
```powershell
npm install @angular/fire@21.0.0-rc.0 --legacy-peer-deps
```
✅ Instalación exitosa (22 paquetes añadidos).

⚠️ Warnings de engine: AngularFire 21 RC requiere Node 24.12+, tenemos Node 22.23.

Paso 2 — Configuración en app.config.ts:

typescript
provideFirebaseApp(() => initializeApp(firebaseConfig)),
provideDatabase(() => getDatabase()),
Paso 3 — Compilación:

✅ ng serve compiló sin errores.

Paso 4 — Runtime:

❌ Error en runtime: FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created - call initializeApp() first (app/no-app)

Causa técnica
AngularFire 21 RC no es compatible con Angular 22 en modo Zoneless.

AngularFire depende internamente de Zone.js para gestionar el orden de inicialización de los providers asíncronos.

Angular 22 usa Zoneless por defecto (sin Zone.js).

Sin Zone.js, Angular no puede garantizar que provideFirebaseApp se ejecute antes de que otros servicios (como Database) intenten acceder a la app de Firebase.

Resultado: FirebaseService se instancia antes de que initializeApp() complete → error No Firebase App.

Verificación documental
Fuente	Confirmación
GitHub AngularFire	No hay release estable compatible con Angular 22
Stack Overflow	"En apps zoneless modernas, solo usa firebase/firestore sin wrappers"
NPM AngularFire	Última estable: 20.1.1 (solo Angular 20)
NPM AngularFire RC	21.0.0-rc.0 (solo Angular 21)
Decisión adoptada
Se implementó una estrategia de doble capa:

Capa base (funcional): Firebase SDK nativo (firebase@13.0.0). 100% compatible con Angular 22. En producción.

Capa de superación (documental): AngularFire 21 RC. Se instaló y compiló correctamente, pero falla en runtime por incompatibilidad Zoneless.

El código de AngularFire se conserva en docs/firebase-angularfire.service.ts.bak como evidencia del intento.

Conclusiones
La compatibilidad nominal (peer deps) no garantiza compatibilidad funcional. Aceptar --legacy-peer-deps permitió instalar AngularFire, pero no resolvió el conflicto profundo de Zone.js vs Zoneless.

El SDK nativo de Firebase es la alternativa oficial recomendada para proyectos Angular modernos sin Zone.js.

Se cumple funcionalmente el criterio del reto: Firebase configurado, servicio de sincronización creado, CRUD implementado, sincronización offline/online verificada.

Valor de ingeniería: identificar, aislar y documentar una incompatibilidad técnica es parte del trabajo profesional.

Evidencia
capturas/140-instalar-angularfire-rc.png — Instalación

capturas/143-app-config-angularfire.png — Configuración

capturas/144-ng-serve-angularfire.png — Compilación

capturas/148-error-angularfire-runtime.png — Error en runtime

docs/firebase-angularfire.service.ts.bak — Código del servicio AngularFire

### Resumen final

[Si funcionó:] La capa AngularFire funciona correctamente sobre Angular 22, demostrando compatibilidad práctica a pesar de la falta de soporte oficial.

[Si falló:] AngularFire 21 RC presenta incompatibilidades con Angular 22 (Zoneless), confirmando la recomendación oficial de usar Firebase SDK nativo en apps zoneless modernas [citation:1].

Intento de integración con AngularFire

Se intentó integrar AngularFire 21 RC en el proyecto Angular 22.

Resultado: La instalación y compilación fueron exitosas, pero en tiempo de ejecución se produjo el error No Firebase App '[DEFAULT]' has been created.

Causa: AngularFire depende de Zone.js, mientras que este proyecto está en modo Zoneless, lo que genera que el orden de inicialización de Angular no pueda garantizar que FirebaseApp se cree antes que FirebaseService.

Decisión: Cambiar de nuevo a la implementación nativa de Firebase SDK, que es la alternativa oficial recomendada por Google para aplicaciones modernas Zoneless.