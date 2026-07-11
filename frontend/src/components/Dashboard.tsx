import React from 'react';
import { CheckCircle2, AlertCircle, ListTodo, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  stats: {
    total: number;
    completed: number;
    backlog: number;
    todo: number;
    inProgress: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    completionRate: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { ease: [0.23, 1, 0.32, 1] as const, duration: 0.6 } }
};

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <motion.div 
      className="dashboard-grid"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Total Tasks Card */}
      <motion.div className="dashboard-card" variants={itemVariants}>
        <div className="card-header-flex">
          <div>
            <p className="card-label">Total Tasks</p>
            <h3 className="card-value">{stats.total}</h3>
          </div>
          <div className="card-icon" style={{ color: 'var(--info)' }}>
            <Layers size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="card-footer" style={{ color: 'var(--text-secondary)' }}>
          {stats.todo} Todo · {stats.inProgress} In Progress · {stats.backlog} Backlog
        </div>
      </motion.div>

      {/* Completion Rate Card */}
      <motion.div className="dashboard-card" variants={itemVariants}>
        <div className="card-header-flex">
          <div>
            <p className="card-label">Completion Rate</p>
            <h3 className="card-value">{stats.completionRate}%</h3>
          </div>
          <div className="card-icon" style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="card-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="progress-bar-container">
            <motion.div 
              className="progress-bar-fill" 
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionRate}%` }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] as const, delay: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* High Priority Card */}
      <motion.div className="dashboard-card" variants={itemVariants}>
        <div className="card-header-flex">
          <div>
            <p className="card-label">High Priority Issues</p>
            <h3 className="card-value" style={{ color: stats.highPriority > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {stats.highPriority}
            </h3>
          </div>
          <div className="card-icon" style={{ color: 'var(--danger)' }}>
            <AlertCircle size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="card-footer" style={{ color: 'var(--text-secondary)' }}>
          Active high-priority tasks requiring attention
        </div>
      </motion.div>

      {/* Current Load Card */}
      <motion.div className="dashboard-card" variants={itemVariants}>
        <div className="card-header-flex">
          <div>
            <p className="card-label">Active Workload</p>
            <h3 className="card-value">{stats.todo + stats.inProgress}</h3>
          </div>
          <div className="card-icon" style={{ color: 'var(--warning)' }}>
            <ListTodo size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="card-footer" style={{ color: 'var(--text-secondary)' }}>
          {stats.mediumPriority} medium priority · {stats.lowPriority} low priority
        </div>
      </motion.div>
    </motion.div>
  );
};
