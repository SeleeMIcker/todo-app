import React, { useState } from 'react';
import PomodoroTimer from './PomodoroTimer';

const FocusPage = ({ todos }) => {
  const [selectedTodo, setSelectedTodo] = useState(null);

  // Filter out completed todos for focus mode
  const availableTodos = todos.filter(todo => !todo.completed);

  return (
    <div className="focus-page">
      <h2>Focus Mode</h2>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="todo-select">Select a To-Do to focus on: </label>
        <select
          id="todo-select"
          value={selectedTodo || ''}
          onChange={e => setSelectedTodo(e.target.value)}
        >
          <option value="">-- No Task Selected --</option>
          {availableTodos.map(todo => (
            <option key={todo.id} value={todo.id}>{todo.text}</option>
          ))}
        </select>
      </div>
      {selectedTodo && (
        <div style={{ marginBottom: 24 }}>
          <strong>Focusing on:</strong> {availableTodos.find(t => t.id === parseInt(selectedTodo))?.text}
        </div>
      )}
      <div style={{ marginTop: 32 }}>
        <PomodoroTimer />
      </div>
    </div>
  );
};

export default FocusPage; 