import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

class TaskService {
  private tasks: Map<string, Task> = new Map();
  private readonly dataFilePath: string;

  constructor() {
    // Store tasks.json in backend root folder
    this.dataFilePath = path.join(__dirname, '../../tasks.json');
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      // Try to read existing tasks from file
      const fileContent = await fs.readFile(this.dataFilePath, 'utf-8');
      const tasksArray: Task[] = JSON.parse(fileContent);
      
      // Load tasks into Map
      tasksArray.forEach(task => {
        this.tasks.set(task.id, task);
      });
      
      console.log(`Loaded ${tasksArray.length} tasks from storage`);
    } catch (error: any) {
      // If file doesn't exist, create it with a sample task
      if (error.code === 'ENOENT') {
        console.log('No existing tasks file found, creating new one with sample task');
        const sampleTask: Task = {
          id: '1',
          title: 'Sample Task',
          description: 'This is a sample task',
          status: 'todo',
          priority: 'medium',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.tasks.set(sampleTask.id, sampleTask);
        await this.saveToDisk();
      } else {
        console.error('Error initializing storage:', error);
      }
    }
  }

  private async saveToDisk(): Promise<void> {
    try {
      const tasksArray = Array.from(this.tasks.values());
      await fs.writeFile(
        this.dataFilePath,
        JSON.stringify(tasksArray, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving tasks to disk:', error);
      throw error;
    }
  }

  getAllTasks(): Task[] {
    // Get all tasks and sort by due date (earliest first)
    return Array.from(this.tasks.values()).sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  async createTask(taskData: CreateTaskDto): Promise<Task> {
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'todo',
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(newTask.id, newTask);
    await this.saveToDisk();
    return newTask;
  }

  async updateTask(id: string, taskData: UpdateTaskDto): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    
    if (!existingTask) {
      return undefined;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...taskData,
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(id, updatedTask);
    await this.saveToDisk();
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      await this.saveToDisk();
    }
    return deleted;
  }

  getTasksByStatus(status: 'todo' | 'in-progress' | 'done'): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }
}

export default new TaskService();
