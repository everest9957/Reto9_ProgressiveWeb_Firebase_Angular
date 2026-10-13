import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Task } from '../models/task';
import { FirebaseService } from './firebase.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private firebase = inject(FirebaseService);
  private storage = inject(StorageService);

  private tasksSignal = signal<Task[]>([]);
  readonly tasks = this.tasksSignal.asReadonly();
  readonly pendingCount = computed(() =>
    this.tasksSignal().filter(t => !t.completed).length
  );
  readonly pendingSyncCount = computed(() =>
    this.tasksSignal().filter(t => t.pending).length
  );
  readonly isOnline = signal<boolean>(navigator.onLine);

  constructor() {
    // 1️⃣ Cargar primero desde localStorage (instantáneo)
    const localTasks = this.storage.getTasks();
    this.tasksSignal.set(localTasks);

    // 2️⃣ Intentar conectar con Firebase
    this.connectToFirebase();

    // 3️⃣ Escuchar cambios de conexión
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.syncPendingTasks();
    });
    window.addEventListener('offline', () => {
      this.isOnline.set(false);
    });

    // 4️⃣ Persistir automáticamente en localStorage cuando cambie el signal
    effect(() => {
      const tasks = this.tasksSignal();
      this.storage.saveTasks(tasks);
    });
  }

  private connectToFirebase(): void {
    this.firebase.getTasks().subscribe({
      next: (remoteTasks) => {
        // Fusionar: priorizar locales con `pending: true`, luego remotos
        const localPending = this.tasksSignal().filter(t => t.pending);
        const merged = this.mergeTasks(remoteTasks, localPending);
        this.tasksSignal.set(merged);
      },
      error: (err) => {
        console.warn('⚠️ Sin conexión a Firebase. Modo offline activo.', err);
      }
    });
  }

  private mergeTasks(remote: Task[], localPending: Task[]): Task[] {
    const map = new Map<string, Task>();
    // Primero los remotos
    for (const t of remote) {
      map.set(t.id, { ...t, synced: true, pending: false });
    }
    // Sobrescribir con pendientes locales (tienen prioridad)
    for (const t of localPending) {
      map.set(t.id, t);
    }
    return Array.from(map.values());
  }

  addTask(title: string, description?: string): void {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
      pending: true,
      pendingAction: 'create'
    };

    this.tasksSignal.update(tasks => [...tasks, newTask]);
    this.trySyncTask(newTask);
  }

  updateTask(id: string, changes: Partial<Task>): void {
    this.tasksSignal.update(tasks =>
      tasks.map(t =>
        t.id === id
          ? {
              ...t,
              ...changes,
              updatedAt: Date.now(),
              synced: false,
              pending: true,
              pendingAction: t.pendingAction === 'create' ? 'create' : 'update'
            }
          : t
      )
    );

    const task = this.tasksSignal().find(t => t.id === id);
    if (task) this.trySyncTask(task);
  }

  deleteTask(id: string): void {
    // Si aún no se había sincronizado, simplemente lo quitamos de la cola
    const task = this.tasksSignal().find(t => t.id === id);

    if (task?.pending && task.pendingAction === 'create') {
      // Nunca llegó a Firebase, no hay nada que borrar remotamente
      this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
      return;
    }

    // Marcar como pending delete
    this.tasksSignal.update(tasks =>
      tasks.map(t =>
        t.id === id
          ? { ...t, pending: true, pendingAction: 'delete', updatedAt: Date.now() }
          : t
      )
    );

    // Intentar borrar en Firebase
    this.firebase.deleteTask(id)
      .then(() => {
        // Si tuvo éxito, eliminar definitivamente del signal
        this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
      })
      .catch(err => console.warn('No se pudo borrar en Firebase, queda pendiente:', err));
  }

  toggleComplete(id: string): void {
    const task = this.tasksSignal().find(t => t.id === id);
    if (task) {
      this.updateTask(id, { completed: !task.completed });
    }
  }

  /** Intenta sincronizar una sola tarea con Firebase */
  private async trySyncTask(task: Task): Promise<void> {
    if (!this.isOnline()) return;

    try {
      if (task.pendingAction === 'create' || task.pendingAction === 'update') {
        await this.firebase.saveTask(task);
      }
      this.markSynced(task.id);
    } catch (err) {
      console.warn(`No se pudo sincronizar "${task.title}", queda pendiente.`, err);
    }
  }

  /** Sube todas las tareas pendientes (al recuperar conexión) */
  async syncPendingTasks(): Promise<void> {
    const pending = this.tasksSignal().filter(t => t.pending);
    if (pending.length === 0) return;

    console.log(`🔄 Sincronizando ${pending.length} tarea(s) pendiente(s)...`);

    for (const task of pending) {
      try {
        if (task.pendingAction === 'delete') {
          await this.firebase.deleteTask(task.id);
          this.tasksSignal.update(tasks => tasks.filter(t => t.id !== task.id));
        } else {
          await this.firebase.saveTask(task);
          this.markSynced(task.id);
        }
      } catch (err) {
        console.warn(`Error sincronizando "${task.title}":`, err);
      }
    }
  }

  private markSynced(id: string): void {
    this.tasksSignal.update(tasks =>
      tasks.map(t =>
        t.id === id ? { ...t, synced: true, pending: false, pendingAction: undefined } : t
      )
    );
  }
}