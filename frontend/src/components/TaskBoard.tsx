import React from 'react';
import { TaskCard } from './TaskCard';
import { Task, Status } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TaskBoardProps {
  tasks: Task[];
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  selectedIds,
  onSelectToggle,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const columns: { id: Status; title: string; colorClass: string }[] = [
    { id: 'backlog', title: 'Backlog', colorClass: 'col-backlog' },
    { id: 'todo', title: 'Todo', colorClass: 'col-todo' },
    { id: 'in_progress', title: 'In Progress', colorClass: 'col-progress' },
    { id: 'done', title: 'Done', colorClass: 'col-done' },
  ];

  // Group tasks by their status
  const tasksByStatus = columns.reduce(
    (acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<Status, Task[]>
  );

  return (
    <div className="task-board-container">
      <div className="task-board-grid">
        {columns.map((col) => {
          const colTasks = tasksByStatus[col.id] || [];
          return (
            <div key={col.id} className={`board-column ${col.colorClass}`}>
              <div className="column-header">
                <h3 className="column-title">
                  <div className="column-indicator" />
                  {col.title}
                  <span className="column-count-badge">{colTasks.length}</span>
                </h3>
              </div>
              <motion.div
                className="column-body"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
                }}
              >
                <AnimatePresence mode="popLayout">
                  {colTasks.length === 0 ? (
                    <motion.div
                      key="empty"
                      className="empty-column-placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      No tasks in {col.title.toLowerCase()}
                    </motion.div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isSelected={selectedIds.includes(task.id)}
                        onSelectToggle={onSelectToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onStatusChange={onStatusChange}
                      />
                    ))
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
