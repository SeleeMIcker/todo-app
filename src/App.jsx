import { useState, useEffect } from 'react'
import './App.css'
import FocusPage from './components/FocusPage'

function App() {
  const [activeTab, setActiveTab] = useState('todos')
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [goals, setGoals] = useState([])
  const [goalInput, setGoalInput] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [timetable, setTimetable] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  })
  const [newEvent, setNewEvent] = useState({
    day: 'monday',
    time: '09:00',
    title: '',
    description: ''
  })

  // Eisenhower Matrix state
  const eisenhowerColors = {
    'doFirst': '#ff6b6b',      // Red
    'schedule': '#ffd93d',     // Yellow
    'delegate': '#6bcB77',     // Green
    'eliminate': '#4d96ff'     // Blue
  }
  const [matrixTasks, setMatrixTasks] = useState({
    doFirst: [],
    schedule: [],
    delegate: [],
    eliminate: []
  })
  const [matrixInput, setMatrixInput] = useState('')
  const [draggedTask, setDraggedTask] = useState(null)
  const [draggedFrom, setDraggedFrom] = useState(null)

  // Timetable mode state
  const [timetableMode, setTimetableMode] = useState('day') // 'day' or 'night'

  // Notepad state
  const [notepad, setNotepad] = useState(() => localStorage.getItem('notepad') || '')
  useEffect(() => { localStorage.setItem('notepad', notepad) }, [notepad])

  // Todo functions
  const addTodo = () => {
    if (inputValue.trim() !== '') {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false,
        createdAt: new Date().toISOString()
      }])
      setInputValue('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  // Goal functions
  const addGoal = () => {
    if (goalInput.trim() !== '' && goalDeadline !== '') {
      setGoals([...goals, {
        id: Date.now(),
        title: goalInput,
        deadline: goalDeadline,
        completed: false,
        progress: 0,
        createdAt: new Date().toISOString()
      }])
      setGoalInput('')
      setGoalDeadline('')
    }
  }

  const toggleGoal = (id) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))
  }

  const updateGoalProgress = (id, progress) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, progress: Math.min(100, Math.max(0, progress)) } : goal
    ))
  }

  const deleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  // Timetable functions
  const addEvent = () => {
    if (newEvent.title.trim() !== '') {
      setTimetable({
        ...timetable,
        [newEvent.day]: [...timetable[newEvent.day], {
          id: Date.now(),
          time: newEvent.time,
          title: newEvent.title,
          description: newEvent.description
        }]
      })
      setNewEvent({
        day: 'monday',
        time: '09:00',
        title: '',
        description: ''
      })
    }
  }

  const deleteEvent = (day, eventId) => {
    setTimetable({
      ...timetable,
      [day]: timetable[day].filter(event => event.id !== eventId)
    })
  }

  // Generate time slots based on mode
  const generateTimeSlots = () => {
    const slots = []
    if (timetableMode === 'night') {
      for (let hour = 23; hour < 24; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
      }
      for (let hour = 0; hour <= 5; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
      }
    } else {
      for (let hour = 6; hour <= 22; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
      }
    }
    return slots
  }
  const timeSlots = generateTimeSlots()
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  // Get events for a specific day and time slot
  const getEventsForTimeSlot = (day, timeSlot) => {
    return timetable[day].filter(event => event.time === timeSlot)
  }

  // Eisenhower Matrix functions
  const addMatrixTask = () => {
    if (matrixInput.trim() !== '') {
      setMatrixTasks({
        ...matrixTasks,
        doFirst: [...matrixTasks.doFirst, { id: Date.now(), text: matrixInput }]
      })
      setMatrixInput('')
    }
  }

  const onDragStart = (task, fromQuadrant) => {
    setDraggedTask(task)
    setDraggedFrom(fromQuadrant)
  }

  const onDrop = (toQuadrant) => {
    if (draggedTask && draggedFrom && toQuadrant !== draggedFrom) {
      setMatrixTasks(prev => {
        const newFrom = prev[draggedFrom].filter(t => t.id !== draggedTask.id)
        const newTo = [...prev[toQuadrant], draggedTask]
        return { ...prev, [draggedFrom]: newFrom, [toQuadrant]: newTo }
      })
    }
    setDraggedTask(null)
    setDraggedFrom(null)
  }

  const deleteMatrixTask = (quadrant, id) => {
    setMatrixTasks(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].filter(t => t.id !== id)
    }))
  }

  // Move todo to matrix
  const sendTodoToMatrix = (todo) => {
    setTodos(todos.filter(t => t.id !== todo.id))
    setMatrixTasks(prev => ({
      ...prev,
      doFirst: [...prev.doFirst, { id: todo.id, text: todo.text }]
    }))
  }

  return (
    <div className="app">
      <div className="layout">
        <div className="notepad-panel">
          <h2>Notepad</h2>
          <textarea
            className="notepad-textarea"
            value={notepad}
            onChange={e => setNotepad(e.target.value)}
            placeholder="Take notes here..."
          />
        </div>
        <div className="main-content">
          <h1>Productivity Hub</h1>
          
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'todos' ? 'active' : ''}`}
              onClick={() => setActiveTab('todos')}
            >
              📝 Todos
            </button>
            <button 
              className={`tab ${activeTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              📅 Weekly Timetable
            </button>
            <button 
              className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => setActiveTab('goals')}
            >
              🎯 Goals
            </button>
            <button 
              className={`tab ${activeTab === 'focus' ? 'active' : ''}`}
              onClick={() => setActiveTab('focus')}
            >
              ⏳ Focus
            </button>
          </div>

          {/* Todos Tab */}
          {activeTab === 'todos' && (
            <div className="tab-content">
              <div className="input-section">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a new todo..."
                  className="todo-input"
                />
                <button onClick={addTodo} className="add-button">
                  Add
                </button>
              </div>

              <div className="todos-list">
                {todos.length === 0 ? (
                  <p className="empty-message">No todos yet. Add one above!</p>
                ) : (
                  todos.map(todo => (
                    <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="todo-checkbox"
                      />
                      <span className="todo-text">{todo.text}</span>
                      <span className="todo-date">
                        {new Date(todo.createdAt).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                      <button
                        className="add-button send-to-matrix"
                        onClick={() => sendTodoToMatrix(todo)}
                        title="Send to Eisenhower Matrix"
                      >
                        ➡️ Matrix
                      </button>
                    </div>
                  ))
                )}
              </div>

              {todos.length > 0 && (
                <div className="stats">
                  <p>Total: {todos.length} | Completed: {todos.filter(todo => todo.completed).length}</p>
                </div>
              )}

              {/* Eisenhower Matrix below To-Do List */}
              <div className="eisenhower-matrix" style={{marginTop: 40}}>
                <div className="matrix-input-section">
                  <input
                    type="text"
                    value={matrixInput}
                    onChange={(e) => setMatrixInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && matrixInput.trim() !== '') {
                        addMatrixTask()
                      }
                    }}
                    placeholder="Add a task to the matrix..."
                    className="matrix-input"
                  />
                  <button 
                    onClick={addMatrixTask} 
                    className="add-button"
                    disabled={matrixInput.trim() === ''}
                  >
                    Add to Matrix
                  </button>
                </div>
                <div className="matrix-row">
                  <div
                    className="matrix-quadrant"
                    style={{ background: eisenhowerColors.doFirst }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop('doFirst')}
                  >
                    <div className="matrix-title">Do First<br /><span>(Urgent & Important)</span></div>
                    {matrixTasks.doFirst.map(task => (
                      <div
                        key={task.id}
                        className="matrix-task"
                        draggable
                        onDragStart={() => onDragStart(task, 'doFirst')}
                      >
                        <span>{task.text}</span>
                        <button className="delete-button small" onClick={() => deleteMatrixTask('doFirst', task.id)}>×</button>
                      </div>
                    ))}
                  </div>
                  <div
                    className="matrix-quadrant"
                    style={{ background: eisenhowerColors.schedule }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop('schedule')}
                  >
                    <div className="matrix-title">Schedule<br /><span>(Not Urgent & Important)</span></div>
                    {matrixTasks.schedule.map(task => (
                      <div
                        key={task.id}
                        className="matrix-task"
                        draggable
                        onDragStart={() => onDragStart(task, 'schedule')}
                      >
                        <span>{task.text}</span>
                        <button className="delete-button small" onClick={() => deleteMatrixTask('schedule', task.id)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="matrix-row">
                  <div
                    className="matrix-quadrant"
                    style={{ background: eisenhowerColors.delegate }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop('delegate')}
                  >
                    <div className="matrix-title">Delegate<br /><span>(Urgent & Not Important)</span></div>
                    {matrixTasks.delegate.map(task => (
                      <div
                        key={task.id}
                        className="matrix-task"
                        draggable
                        onDragStart={() => onDragStart(task, 'delegate')}
                      >
                        <span>{task.text}</span>
                        <button className="delete-button small" onClick={() => deleteMatrixTask('delegate', task.id)}>×</button>
                      </div>
                    ))}
                  </div>
                  <div
                    className="matrix-quadrant"
                    style={{ background: eisenhowerColors.eliminate }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop('eliminate')}
                  >
                    <div className="matrix-title">Eliminate<br /><span>(Not Urgent & Not Important)</span></div>
                    {matrixTasks.eliminate.map(task => (
                      <div
                        key={task.id}
                        className="matrix-task"
                        draggable
                        onDragStart={() => onDragStart(task, 'eliminate')}
                      >
                        <span>{task.text}</span>
                        <button className="delete-button small" onClick={() => deleteMatrixTask('eliminate', task.id)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timetable Tab */}
          {activeTab === 'timetable' && (
            <div className="tab-content">
              <div className="timetable-mode-toggle">
                <button
                  className={timetableMode === 'day' ? 'toggle-btn active' : 'toggle-btn'}
                  onClick={() => setTimetableMode('day')}
                >
                  Day (6:00-22:00)
                </button>
                <button
                  className={timetableMode === 'night' ? 'toggle-btn active' : 'toggle-btn'}
                  onClick={() => setTimetableMode('night')}
                >
                  Night (23:00-5:00)
                </button>
              </div>
              <div className="timetable-input">
                <select 
                  value={newEvent.day} 
                  onChange={(e) => setNewEvent({...newEvent, day: e.target.value})}
                  className="day-select"
                >
                  {days.map(day => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  className="time-input"
                />
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Event title"
                  className="event-title-input"
                />
                <input
                  type="text"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Description (optional)"
                  className="event-desc-input"
                />
                <button onClick={addEvent} className="add-button">
                  Add Event
                </button>
              </div>

              <div className="timetable-container">
                <div className="timetable-header">
                  <div className="time-column-header">Time</div>
                  {days.map(day => (
                    <div key={day} className="day-header">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </div>
                  ))}
                </div>
                
                <div className="timetable-body">
                  {timeSlots.map(timeSlot => (
                    <div key={timeSlot} className="time-row">
                      <div className="time-slot">{timeSlot}</div>
                      {days.map(day => (
                        <div key={`${day}-${timeSlot}`} className="day-cell">
                          {getEventsForTimeSlot(day, timeSlot).map(event => (
                            <div key={event.id} className="event-item">
                              <div className="event-content">
                                <div className="event-title">{event.title}</div>
                                {event.description && (
                                  <div className="event-description">{event.description}</div>
                                )}
                              </div>
                              <button 
                                onClick={() => deleteEvent(day, event.id)}
                                className="delete-button small"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="tab-content">
              <div className="goals-input">
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="Enter your goal..."
                  className="goal-input"
                />
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="deadline-input"
                />
                <button onClick={addGoal} className="add-button">
                  Add Goal
                </button>
              </div>

              <div className="goals-list">
                {goals.length === 0 ? (
                  <p className="empty-message">No goals set yet. Set your first goal above!</p>
                ) : (
                  goals.map(goal => (
                    <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                      <div className="goal-header">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={() => toggleGoal(goal.id)}
                          className="goal-checkbox"
                        />
                        <div className="goal-info">
                          <div className="goal-title">{goal.title}</div>
                          <div className="goal-deadline">
                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteGoal(goal.id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                      
                      {!goal.completed && (
                        <div className="progress-section">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{width: `${goal.progress}%`}}
                            ></div>
                          </div>
                          <div className="progress-controls">
                            <button 
                              onClick={() => updateGoalProgress(goal.id, goal.progress - 10)}
                              className="progress-btn"
                            >
                              -10%
                            </button>
                            <span className="progress-text">{goal.progress}%</span>
                            <button 
                              onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                              className="progress-btn"
                            >
                              +10%
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {goals.length > 0 && (
                <div className="stats">
                  <p>
                    Total Goals: {goals.length} | 
                    Completed: {goals.filter(goal => goal.completed).length} | 
                    Average Progress: {Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Focus Tab */}
          {activeTab === 'focus' && (
            <div className="tab-content">
              <FocusPage todos={todos} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
