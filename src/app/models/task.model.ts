export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  synced: boolean; // ← la usaremos después para saber si está sincronizada con Firebase
}