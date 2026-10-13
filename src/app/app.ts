import { Component, inject } from '@angular/core';
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
  private taskService = inject(TaskService);

  isOnline = this.taskService.isOnline;
  pendingSyncCount = this.taskService.pendingSyncCount;

  onTaskAdded(event: { title: string; description?: string }): void {
    this.taskService.addTask(event.title, event.description);
  }
}