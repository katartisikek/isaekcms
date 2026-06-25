import React from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  User, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';

export default function TaskBoard({ tasks = [], onAddTaskClick, onEditTaskClick, onDeleteTask, onUpdateTask }) {

  // Status columns
  const COLUMNS = [
    { id: 'Εκκρεμεί', title: 'Εκκρεμεί', class: 'col-pending', color: '#64748b' },
    { id: 'Σε Εξέλιξη', title: 'Σε Εξέλιξη', class: 'col-progress', color: '#f59e0b' },
    { id: 'Ολοκληρώθηκε', title: 'Ολοκληρώθηκε', class: 'col-completed', color: '#10b981' }
  ];

  // Group tasks by column status
  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  // Quick move handlers
  const handleMoveLeft = (task) => {
    let newStatus = '';
    if (task.status === 'Σε Εξέλιξη') newStatus = 'Εκκρεμεί';
    else if (task.status === 'Ολοκληρώθηκε') newStatus = 'Σε Εξέλιξη';
    
    if (newStatus) {
      onUpdateTask({ ...task, status: newStatus });
    }
  };

  const handleMoveRight = (task) => {
    let newStatus = '';
    if (task.status === 'Εκκρεμεί') newStatus = 'Σε Εξέλιξη';
    else if (task.status === 'Σε Εξέλιξη') newStatus = 'Ολοκληρώθηκε';
    
    if (newStatus) {
      onUpdateTask({ ...task, status: newStatus });
    }
  };

  // Form handlers
  const handleAddNewClick = () => {
    onAddTaskClick();
  };

  const handleEditClick = (task) => {
    onEditTaskClick(task);
  };

  const handleDeleteClick = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (window.confirm(`Επιβεβαίωση Διαγραφής:\nΕίστε βέβαιοι ότι θέλετε να διαγράψετε την εργασία "${task.title}";`)) {
      onDeleteTask(taskId);
    }
  };

  return (
    <div className="kanban-workspace">
      {/* 1. Kanban Ribbon Toolbar */}
      <div className="desktop-toolbar" style={{ borderBottom: '1px solid #cbd5e1' }}>
        <div className="toolbar-group">
          <FolderOpen size={14} color="#4b5563" />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563' }}>
            Διαχείριση Εργασιών Γραμματείας (Kanban)
          </span>
        </div>
        <div className="toolbar-group">
          <button className="btn-sys primary" onClick={handleAddNewClick}>
            <Plus size={14} />
            <span>Νέα Εργασία</span>
          </button>
        </div>
      </div>

      {/* 2. Board Columns Layout */}
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const colTasks = getTasksByStatus(col.id);
          return (
            <div key={col.id} className={`kanban-col ${col.class}`}>
              <div className="kanban-col-header" style={{ borderTopColor: col.color }}>
                <span className="kanban-col-title">{col.title}</span>
                <span className="kanban-col-badge">{colTasks.length}</span>
              </div>

              <div className="kanban-col-content">
                {colTasks.length === 0 ? (
                  <div className="kanban-col-empty">
                    <span>Δεν υπάρχουν εργασίες</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isUrgent = task.priority === 'Επείγον';
                    return (
                      <div 
                        key={task.id} 
                        className={`task-card ${isUrgent ? 'urgent' : ''}`}
                      >
                        {/* Task Card Priority Indicator Accent */}
                        {isUrgent && (
                          <div className="task-priority-tag">
                            <AlertCircle size={10} style={{ marginRight: '3px' }} />
                            <span>ΕΠΕΙΓΟΝ</span>
                          </div>
                        )}

                        <h4 className="task-card-title">{task.title}</h4>
                        
                        {task.description && (
                          <p className="task-card-desc">{task.description}</p>
                        )}

                        <div className="task-card-footer">
                          {/* Assignee element */}
                          <div className="task-meta assignee" title="Υπεύθυνος">
                            <div className="avatar-mini">
                              {task.assignee ? task.assignee.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="meta-text">{task.assignee || 'Ανέθετο'}</span>
                          </div>

                          {/* Due Date element */}
                          {task.dueDate && (
                            <div className="task-meta duedate" title="Προθεσμία">
                              <Clock size={12} className="meta-icon" />
                              <span className="meta-text">{task.dueDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Task Card Actions Row */}
                        <div className="task-card-actions">
                          {/* Quick movement controls */}
                          <div className="quick-shifts">
                            <button
                              type="button"
                              className="btn-shift"
                              onClick={() => handleMoveLeft(task)}
                              disabled={task.status === 'Εκκρεμεί'}
                              title="Μετακίνηση αριστερά"
                            >
                              <ArrowLeft size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn-shift"
                              onClick={() => handleMoveRight(task)}
                              disabled={task.status === 'Ολοκληρώθηκε'}
                              title="Μετακίνηση δεξιά"
                            >
                              <ArrowRight size={12} />
                            </button>
                          </div>

                          {/* Standard edit/delete controls */}
                          <div className="card-crud">
                            <button
                              type="button"
                              className="btn-card-action edit"
                              onClick={() => handleEditClick(task)}
                              title="Επεξεργασία"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn-card-action delete"
                              onClick={() => handleDeleteClick(task.id)}
                              title="Διαγραφή"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
