import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  Database,
  ref,
  onValue,
  set,
  update,
  remove,
  off,
  DataSnapshot
} from 'firebase/database';
import { Observable } from 'rxjs';
import { Task } from '../models/task';
import { environment } from '../../environments/environment';

const firebaseConfig = environment.firebase;

@Injectable({ providedIn: 'root' })
export class FirebaseService {

  private app: FirebaseApp;
  private db: Database;
  private readonly TASKS_PATH = 'tasks';

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
  }

  getTasks(): Observable<Task[]> {
    return new Observable<Task[]>(subscriber => {
      const tasksRef = ref(this.db, this.TASKS_PATH);
      const callback = (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        const tasks: Task[] = data
          ? Object.keys(data).map(key => ({ ...data[key], id: key }))
          : [];
        subscriber.next(tasks);
      };
      onValue(tasksRef, callback, (error) => subscriber.error(error));
      return () => off(tasksRef, 'value', callback);
    });
  }

  saveTask(task: Task): Promise<void> {
    const taskRef = ref(this.db, `${this.TASKS_PATH}/${task.id}`);
    return set(taskRef, {
      title: task.title,
      description: task.description ?? '',
      completed: task.completed,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    });
  }

  updateTask(id: string, changes: Partial<Task>): Promise<void> {
    const taskRef = ref(this.db, `${this.TASKS_PATH}/${id}`);
    return update(taskRef, {
      ...changes,
      updatedAt: Date.now()
    });
  }

  deleteTask(id: string): Promise<void> {
    const taskRef = ref(this.db, `${this.TASKS_PATH}/${id}`);
    return remove(taskRef);
  }
}