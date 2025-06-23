import React, { useState } from 'react';
import PomodoroTimer from './PomodoroTimer';

const FocusPage = ({ todos }) => {
  const [selectedTodo, setSelectedTodo] = useState(null);

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
          {todos.map(todo => (
            <option key={todo.id} value={todo.id}>{todo.text}</option>
          ))}
        </select>
      </div>
      {selectedTodo && (
        <div style={{ marginBottom: 24 }}>
          <strong>Focusing on:</strong> {todos.find(t => t.id == selectedTodo)?.text}
        </div>
      )}
      <div style={{ marginTop: 32 }}>
        <PomodoroTimer />
      </div>
    </div>
  );
};

export default FocusPage; 