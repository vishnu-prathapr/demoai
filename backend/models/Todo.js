import mongoose from 'mongoose';

// Each document is one row in the "todos" collection.
const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

export default mongoose.model('Todo', todoSchema);
