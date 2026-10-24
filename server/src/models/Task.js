const mongoose = require('mongoose');

/**
 * Task Schema Definition
 * Represents a single to-do item in MongoDB.
 */
const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user']
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Task title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Task description cannot exceed 1000 characters'],
      default: ''
    },
    dueDate: {
      type: Date,
      default: null
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority. Must be Low, Medium, or High.'
      },
      default: 'Medium'
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // Automatically creates and manages createdAt & updatedAt fields
  }
);

// High-performance compound index for user task queries and sorting
taskSchema.index({ user: 1, completed: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
