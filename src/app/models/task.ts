export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
  pending?: boolean;        // true = hay cambios locales sin subir a Firebase
  pendingAction?: 'create' | 'update' | 'delete';  // qué operación falta
}