import { Request, Response, NextFunction } from 'express';

export const validateCreateTask = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description, status } = req.body;

  // Validate title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({
      error: {
        message: 'Title is required and must be a non-empty string',
        statusCode: 400,
      },
    });
    return;
  }

  if (title.trim().length < 4) {
    res.status(400).json({
      error: {
        message: 'Title must be at least 4 characters',
        statusCode: 400,
      },
    });
    return;
  }

  if (title.length > 100) {
    res.status(400).json({
      error: {
        message: 'Title must not exceed 100 characters',
        statusCode: 400,
      },
    });
    return;
  }

  // Validate description
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    res.status(400).json({
      error: {
        message: 'Description is required and must be a non-empty string',
        statusCode: 400,
      },
    });
    return;
  }

  if (description.length > 500) {
    res.status(400).json({
      error: {
        message: 'Description must not exceed 500 characters',
        statusCode: 400,
      },
    });
    return;
  }

  // Validate status (optional)
  if (status && !['todo', 'in-progress', 'done'].includes(status)) {
    res.status(400).json({
      error: {
        message: 'Status must be one of: todo, in-progress, done',
        statusCode: 400,
      },
    });
    return;
  }

  next();
};

export const validateUpdateTask = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description, status, priority, dueDate } = req.body;

  // At least one field must be provided
  if (!title && !description && !status && !priority && !dueDate) {
    res.status(400).json({
      error: {
        message: 'At least one field (title, description, status, priority, or dueDate) must be provided',
        statusCode: 400,
      },
    });
    return;
  }

  // Validate title if provided
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({
        error: {
          message: 'Title must be a non-empty string',
          statusCode: 400,
        },
      });
      return;
    }

    if (title.trim().length < 4) {
      res.status(400).json({
        error: {
          message: 'Title must be at least 4 characters',
          statusCode: 400,
        },
      });
      return;
    }

    if (title.length > 100) {
      res.status(400).json({
        error: {
          message: 'Title must not exceed 100 characters',
          statusCode: 400,
        },
      });
      return;
    }
  }

  // Validate description if provided
  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length === 0) {
      res.status(400).json({
        error: {
          message: 'Description must be a non-empty string',
          statusCode: 400,
        },
      });
      return;
    }

    if (description.length > 500) {
      res.status(400).json({
        error: {
          message: 'Description must not exceed 500 characters',
          statusCode: 400,
        },
      });
      return;
    }
  }

  // Validate status if provided
  if (status !== undefined && !['todo', 'in-progress', 'done'].includes(status)) {
    res.status(400).json({
      error: {
        message: 'Status must be one of: todo, in-progress, done',
        statusCode: 400,
      },
    });
    return;
  }
  // Validate priority if provided
  if (priority !== undefined && !['high', 'medium', 'low'].includes(priority)) {
    res.status(400).json({
      error: {
        message: 'Priority must be one of: high, medium, low',
        statusCode: 400,
      },
    });
    return;
  }

  // Validate dueDate if provided
  if (dueDate !== undefined) {
    if (typeof dueDate !== 'string') {
      res.status(400).json({
        error: {
          message: 'Due date must be a valid date string',
          statusCode: 400,
        },
      });
      return;
    }

    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      res.status(400).json({
        error: {
          message: 'Due date must be a valid ISO 8601 date',
          statusCode: 400,
        },
      });
      return;
    }

    // If priority is being updated to high or is already high, validate dueDate
    // We need to check the priority being set or get existing task's priority
    if (priority === 'high') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      if (dueDateObj > sevenDaysFromNow) {
        res.status(400).json({
          error: {
            message: 'High priority tasks must have a due date within the next 7 days',
            statusCode: 400,
          },
        });
        return;
      }
    }
  }
  next();
};

export const validateTaskId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    res.status(400).json({
      error: {
        message: 'Invalid task ID',
        statusCode: 400,
      },
    });
    return;
  }

  next();
};
