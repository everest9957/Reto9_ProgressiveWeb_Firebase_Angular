import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent {
  private taskService = inject(TaskService);
  tasks = this.taskService.tasks;

  toggle(task: Task): void {
    this.taskService.toggleComplete(task.id);
  }

  delete(id: string): void {
    if (confirm('¿Eliminar esta tarea?')) {
      this.taskService.deleteTask(id);
    }
  }

  edit(task: Task): void {
    const newTitle = prompt('Nuevo título:', task.title);
    if (newTitle && newTitle.trim()) {
      this.taskService.updateTask(task.id, { title: newTitle.trim() });
    }
  }
}
