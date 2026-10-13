import { Injectable } from '@angular/core';
import { Task } from '../models/task';

@Injectable({ providedIn: 'root' })
export class StorageService {

  private readonly TASKS_KEY = 'todo-pwa-tasks';

  /** Lee todas las tareas de localStorage */
  getTasks(): Task[] {
    try {
      const raw = localStorage.getItem(this.TASKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('Error leyendo localStorage:', err);
      return [];
    }
  }

  /** Guarda todas las tareas en localStorage */
  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.warn('Error escribiendo localStorage:', err);
    }
  }

  /** Borra todo (útil para pruebas) */
  clear(): void {
    localStorage.removeItem(this.TASKS_KEY);
  }
}