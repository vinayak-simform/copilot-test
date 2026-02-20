import { Request, Response, NextFunction } from 'express';
import taskService from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../models/task.model';

export const getAllTasks = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { status } = req.query;

    // Filter by status if provided
    if (status && typeof status === 'string') {
      if (!['todo', 'in-progress', 'done'].includes(status)) {
        res.status(400).json({
          error: {
            message: 'Invalid status filter. Must be one of: todo, in-progress, done',
            statusCode: 400,
          },
        });
        return;
      }
      const tasks = taskService.getTasksByStatus(status as 'todo' | 'in-progress' | 'done');
      res.status(200).json(tasks);
      return;
    }

    const tasks = taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { id } = req.params;
    const task = taskService.getTaskById(id);

    if (!task) {
      res.status(404).json({
        error: {
          message: `Task with ID ${id} not found`,
          statusCode: 404,
        },
      });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskData: CreateTaskDto = req.body;
    const newTask = await taskService.createTask(taskData);

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const taskData: UpdateTaskDto = req.body;

    // First, get the existing task
    const existingTask = taskService.getTaskById(id);

    if (!existingTask) {
      res.status(404).json({
        error: {
          message: `Task with ID ${id} not found`,
          statusCode: 404,
        },
      });
      return;
    }

    // Check if task is completed and user is trying to update fields other than status
    if (existingTask.status === 'done') {
      // If only status is being updated to 'todo' or 'in-progress', allow it
      const isOnlyStatusChange = Object.keys(taskData).length === 1 && 
                                  taskData.status !== undefined &&
                                  (taskData.status === 'todo' || taskData.status === 'in-progress');
      
      // If status is being updated to 'done' again along with other fields, block it
      const isStatusRemainingDone = taskData.status === undefined || taskData.status === 'done';

      if (isStatusRemainingDone) {
        res.status(400).json({
          error: {
            message: 'Cannot update a completed task. Please change the status to "todo" or "in-progress" first.',
            statusCode: 400,
          },
        });
        return;
      }
    }

    const updatedTask = await taskService.updateTask(id, taskData);

    if (!updatedTask) {
      res.status(404).json({
        error: {
          message: `Task with ID ${id} not found`,
          statusCode: 404,
        },
      });
      return;
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await taskService.deleteTask(id);

    if (!deleted) {
      res.status(404).json({
        error: {
          message: `Task with ID ${id} not found`,
          statusCode: 404,
        },
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
