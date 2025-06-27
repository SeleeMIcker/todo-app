import React from 'react'

const GoalFocusPage = ({ goal, newSubTaskText, setNewSubTaskText, editingSubTask, setEditingSubTask, addSubTask, editSubTask, deleteSubTask, toggleSubTask, onBack }) => {
  if (!goal) return <div>No goal selected.</div>

  return (
    <div className="goal-focus-page" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <button onClick={onBack} className="back-btn" style={{ marginBottom: 16 }}>← Back to Goals</button>
      <h2 style={{ marginBottom: 8 }}>🎯 {goal.title}</h2>
      <div style={{ color: '#6c757d', marginBottom: 16 }}>Deadline: {new Date(goal.deadline).toLocaleDateString()}</div>
      <div className="progress-section" style={{ marginBottom: 24 }}>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${goal.progress}%` }}></div>
        </div>
        <div className="progress-text">Progress: {goal.progress}%</div>
      </div>
      <div className="sub-tasks-section">
        <h4>📋 Sub-tasks ({goal.subTasks.filter(st => st.completed).length}/{goal.subTasks.length} done)</h4>
        <div className="add-item-section">
          <input
            type="text"
            value={newSubTaskText}
            onChange={e => setNewSubTaskText(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') addSubTask(goal.id)
            }}
            placeholder="Add a new sub-task..."
            className="add-item-input"
          />
          <button
            onClick={() => addSubTask(goal.id)}
            className="add-item-btn"
            disabled={newSubTaskText.trim() === ''}
          >
            +
          </button>
        </div>
        {goal.subTasks.map(subTask => (
          <div key={subTask.id} className="sub-task-item">
            <input
              type="checkbox"
              checked={subTask.completed}
              onChange={() => toggleSubTask(goal.id, subTask.id)}
              className="sub-task-checkbox"
            />
            {editingSubTask === subTask.id ? (
              <div className="edit-item-section">
                <input
                  type="text"
                  defaultValue={subTask.text}
                  onKeyPress={e => {
                    if (e.key === 'Enter') editSubTask(goal.id, subTask.id, e.target.value)
                  }}
                  onBlur={e => editSubTask(goal.id, subTask.id, e.target.value)}
                  className="edit-item-input"
                  autoFocus
                />
                <button onClick={() => setEditingSubTask(null)} className="edit-item-btn">✕</button>
              </div>
            ) : (
              <span className={`sub-task-text ${subTask.completed ? 'completed' : ''}`}>{subTask.text}</span>
            )}
            {subTask.completedAt && (
              <span className="sub-task-date">{new Date(subTask.completedAt).toLocaleDateString()}</span>
            )}
            <div className="item-actions">
              <button onClick={() => setEditingSubTask(subTask.id)} className="edit-btn" title="Edit">✏️</button>
              <button onClick={() => deleteSubTask(goal.id, subTask.id)} className="delete-btn" title="Delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GoalFocusPage 