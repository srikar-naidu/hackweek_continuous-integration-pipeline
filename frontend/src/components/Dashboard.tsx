import React from 'react';
import { CheckCircle2, AlertCircle, ListTodo, Layers } from 'lucide-react';

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

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="dashboard-grid">
      {/* Total Tasks Card */}
      <div className="dashboard-card shadow-sm">
        <div className="card-header-flex">
          <div>
            <p className="card-label">Total Tasks</p>
            <h3 className="card-value">{stats.total}</h3>
          </div>
          <div className="card-icon bg-blue-light">
            <Layers className="text-blue" size={20} />
          </div>
        </div>
        <div className="card-footer">
          <span className="footer-label">
            {stats.todo} Todo · {stats.inProgress} In Progress · {stats.backlog} Backlog
          </span>
        </div>
      </div>

      {/* Completion Rate Card */}
      <div className="dashboard-card shadow-sm">
        <div className="card-header-flex">
          <div>
            <p className="card-label">Completion Rate</p>
            <h3 className="card-value">{stats.completionRate}%</h3>
          </div>
          <div className="card-icon bg-green-light">
            <CheckCircle2 className="text-green" size={20} />
          </div>
        </div>
        <div className="card-footer">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${stats.completionRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* High Priority Card */}
      <div className="dashboard-card shadow-sm">
        <div className="card-header-flex">
          <div>
            <p className="card-label">High Priority Issues</p>
            <h3 className="card-value">{stats.highPriority}</h3>
          </div>
          <div className="card-icon bg-orange-light">
            <AlertCircle className="text-orange" size={20} />
          </div>
        </div>
        <div className="card-footer">
          <span className="footer-label">Active high-priority tasks requiring attention</span>
        </div>
      </div>

      {/* Current Load Card */}
      <div className="dashboard-card shadow-sm">
        <div className="card-header-flex">
          <div>
            <p className="card-label">Active Workload</p>
            <h3 className="card-value">{stats.todo + stats.inProgress}</h3>
          </div>
          <div className="card-icon bg-purple-light">
            <ListTodo className="text-purple" size={20} />
          </div>
        </div>
        <div className="card-footer">
          <span className="footer-label">
            {stats.mediumPriority} medium priority · {stats.lowPriority} low priority
          </span>
        </div>
      </div>
    </div>
  );
};
