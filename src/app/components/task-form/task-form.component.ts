import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent {
  @Output() taskAdded = new EventEmitter<{ title: string; description?: string }>();

  title = '' ;
  description = '';

  onSubmit(): void {
    if (!this.title.trim()) return;
    this.taskAdded.emit({ title: this.title, description: this.description });
    this.title = '';
    this.description = '';
  }
}
