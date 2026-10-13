# Todo PWA — Reto 9

**Progressive Web App** construida con **Angular 22 + Firebase** para el Reto 9 del curso Desarrollo Web Frameworks (Código Samurái).

![Angular](https://img.shields.io/badge/Angular-22.2.2-red)
![Firebase](https://img.shields.io/badge/Firebase-13.0.0-orange)
![PWA](https://img.shields.io/badge/PWA-Service%20Worker-blue)

---

## 📖 Descripción

Aplicación de **lista de tareas (To-Do)** que cumple con los siguientes requisitos:

- ✅ **CRUD completo**: crear, leer, editar, eliminar tareas
- ✅ **Progressive Web App**: instalable y funcional offline
- ✅ **Almacenamiento local**: persistencia con `localStorage`
- ✅ **Sincronización con Firebase**: en tiempo real, bidireccional
- ✅ **Cola de pendientes**: sincroniza automáticamente al recuperar conexión
- ✅ **Indicador de conexión**: muestra el estado en línea/offline

---

## 🚀 Demo

Ejecuta localmente:

```bash
npm install
ng serve -o
```

Abre `http://localhost:4200`.

Para probar la PWA en modo producción:

```bash
ng build
npx http-server dist/todo-pwa/browser -p 8090
```

Abre `http://localhost:8090`.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|------------|
| Framework | Angular 22.2.2 |
| Change Detection | Zoneless + signals |
| Backend | Firebase Realtime Database |
| SDK Firebase | `firebase@13.0.0` (nativo) |
| PWA | `@angular/pwa` + Service Worker |
| Persistencia local | `localStorage` |
| Estilos | CSS |

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── task-form/          # Formulario de creación
│   │   └── task-list/          # Lista con edición/eliminación
│   ├── models/
│   │   └── task.ts             # Interfaz Task
│   ├── services/
│   │   ├── task.service.ts     # Orquestador (local + remoto)
│   │   ├── firebase.service.ts # Firebase Realtime Database
│   │   └── storage.service.ts  # localStorage
│   ├── app.ts                  # Componente raíz
│   ├── app.html
│   ├── app.css
│   └── app.config.ts
├── public/
│   ├── icons/                  # Íconos PWA
│   └── manifest.webmanifest
├── ngsw-config.json            # Configuración del SW
└── ...
```

---

## 🎯 Funcionalidades

### CRUD de tareas
- Crear tareas con título y descripción
- Editar el título de una tarea existente
- Marcar como completada
- Eliminar tareas

### Sincronización
- **Online**: las operaciones se envían inmediatamente a Firebase
- **Offline**: se guardan en `localStorage` con `pending: true`
- **Reconexión**: subida automática de tareas pendientes
- **Tiempo real**: cambios en Firebase se reflejan en la app sin recargar

### PWA
- Service Worker cachea recursos estáticos
- Funciona sin conexión
- Instalable en el escritorio
- Manifest con íconos y colores

---

## 🧪 Pruebas

Se ejecutaron **10 pruebas integrales** (ver `docs/03-informe-final.md`):

| # | Prueba | Estado |
|---|--------|--------|
| 1 | Carga inicial online | ✅ |
| 2 | Agregar tarea online | ✅ |
| 3 | Carga offline | ✅ |
| 4 | Agregar tarea offline | ✅ |
| 5 | Editar tarea offline | ✅ |
| 6 | Eliminar tarea offline | ✅ |
| 7 | Reconexión + sync automática | ✅ |
| 8 | Instalación como PWA | ✅ |
| 9 | Persistencia tras recarga | ✅ |
| 10 | Sincronización entre pestañas | ✅ |

---

## 📚 Documentación

- [`docs/01-procedimiento.md`](docs/01-procedimiento.md) — Paso a paso del desarrollo
- [`docs/02-fallas-y-soluciones.md`](docs/02-fallas-y-soluciones.md) — 8 fallas documentadas y resueltas
- [`docs/03-informe-final.md`](docs/03-informe-final.md) — Informe final
- [`docs/capturas/`](docs/capturas/) — Capturas del proceso

---

## ⚠️ Notas técnicas

### AngularFire vs Firebase nativo
Aunque el reto menciona AngularFire, se optó por usar el **SDK nativo de Firebase** porque **AngularFire no es compatible con Angular 22**. Ver `docs/02-fallas-y-soluciones.md` (Falla 8) para más detalles.

### Reglas de seguridad de Firebase
El proyecto usa reglas en **modo prueba** (lectura/escritura sin autenticación). Para producción habría que implementar Firebase Auth y reglas basadas en `auth.uid`.

### Zoneless
Angular 22 usa **Zoneless** por defecto. Toda la reactividad se basa en **signals**. No se usa `zone.js`.

---

## 👤 Autor

**Judit Giravent**  
Curso: Desarrollo Web Frameworks  
Reto 9 — Código Samurái

---

## 📄 Licencia

Uso educativo.