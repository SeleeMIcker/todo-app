import React, { useState } from 'react'
import './App.css'
import FocusPage from './components/FocusPage'
import PomodoroTimer from './components/PomodoroTimer'
import MonthlyDashboard from './components/MonthlyDashboard'
import MonthlyTimetable from './components/MonthlyTimetable'
import WeeklyPlanner from './components/WeeklyPlanner'
import { useTaskStore } from './contexts/TaskStore.jsx'
import GoalFocusPage from './components/GoalFocusPage'

function App() {
  // Task store
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    getTasksByDay 
  } = useTaskStore()

  // Local state
  const [activeTab, setActiveTab] = useState('todos')
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [todoDuration, setTodoDuration] = useState('1') // Default 1 hour
  const [goals, setGoals] = useState([])
  const [goalInput, setGoalInput] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [newEvent, setNewEvent] = useState({
    day: 'monday',
    startTime: '06:00',
    endTime: '07:00',
    title: '',
    description: ''
  })

  // Timetable navigation state
  const [timetableView, setTimetableView] = useState('dashboard') // 'dashboard', 'monthly', or 'weekly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedDay, setSelectedDay] = useState('monday')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

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

  // Goals view mode state
  const [goalViewMode, setGoalViewMode] = useState('checklist') // 'checklist' or 'timeline'

  // Goal management state
  const [selectedGoalId, setSelectedGoalId] = useState(null)
  const [goalManagementMode, setGoalManagementMode] = useState('list') // 'list' or 'detail'

  // Goal editing state
  const [editingSubTask, setEditingSubTask] = useState(null)
  const [newSubTaskText, setNewSubTaskText] = useState('')

  // Add selectedDate state
  const [selectedDate, setSelectedDate] = useState(null)

  // Add state for focus mode and selected goal for focus
  const [focusGoalId, setFocusGoalId] = useState(null)
  const [focusMode, setFocusMode] = useState(false)

  // Todo functions
  const addTodo = () => {
    if (inputValue.trim() !== '') {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false,
        createdAt: new Date().toISOString(),
        duration: parseInt(todoDuration) || 1
      }])
      setInputValue('')
      setTodoDuration('1')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
    
    // Also remove from matrix if it exists there
    setMatrixTasks(prev => ({
      doFirst: prev.doFirst.filter(t => t.id !== id),
      schedule: prev.schedule.filter(t => t.id !== id),
      delegate: prev.delegate.filter(t => t.id !== id),
      eliminate: prev.eliminate.filter(t => t.id !== id)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  // Goal functions
  const addGoal = () => {
    if (goalInput.trim() !== '' && goalDeadline !== '') {
      const newGoal = {
        id: Date.now(),
        title: goalInput,
        deadline: goalDeadline,
        completed: false,
        progress: 0,
        createdAt: new Date().toISOString(),
        // Sub-tasks for checklist view (user-defined)
        subTasks: [],
        // Milestones for timeline view (default structure)
        milestones: [
          { id: 1, text: 'Start the journey', completed: false, completedAt: null },
          { id: 2, text: 'Make first progress', completed: false, completedAt: null },
          { id: 3, text: 'Reach halfway point', completed: false, completedAt: null },
          { id: 4, text: 'Almost there', completed: false, completedAt: null },
          { id: 5, text: 'Goal achieved!', completed: false, completedAt: null }
        ]
      }
      setGoals([...goals, newGoal])
      setGoalInput('')
      setGoalDeadline('')
    }
  }

  const deleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  // Enhanced goal functions for milestones and sub-tasks
  const toggleMilestone = (goalId, milestoneId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return {
              ...milestone,
              completed: !milestone.completed,
              completedAt: !milestone.completed ? new Date().toISOString() : null
            }
          }
          return milestone
        })
        
        // Calculate progress based on completed milestones
        const completedMilestones = updatedMilestones.filter(m => m.completed).length
        const progress = Math.round((completedMilestones / updatedMilestones.length) * 100)
        
        return {
          ...goal,
          milestones: updatedMilestones,
          progress: progress
        }
      }
      return goal
    }))
  }

  const toggleSubTask = (goalId, subTaskId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedSubTasks = goal.subTasks.map(subTask => {
          if (subTask.id === subTaskId) {
            return {
              ...subTask,
              completed: !subTask.completed,
              completedAt: !subTask.completed ? new Date().toISOString() : null
            }
          }
          return subTask
        })
        
        // Calculate progress based only on completed sub-tasks (not milestones)
        const completedSubTasks = updatedSubTasks.filter(st => st.completed).length
        const progress = updatedSubTasks.length > 0 ? Math.round((completedSubTasks / updatedSubTasks.length) * 100) : 0
        
        return {
          ...goal,
          subTasks: updatedSubTasks,
          progress: progress
        }
      }
      return goal
    }))
  }

  // Enhanced functions for editable sub-tasks and milestones
  const addSubTask = (goalId) => {
    if (newSubTaskText.trim() !== '') {
      setGoals(goals.map(goal => {
        if (goal.id === goalId) {
          const newSubTask = {
            id: Date.now() + Math.random(),
            text: newSubTaskText.trim(),
            completed: false,
            completedAt: null
          }
          const updatedSubTasks = [...goal.subTasks, newSubTask]
          
          // Recalculate progress
          const completedSubTasks = updatedSubTasks.filter(st => st.completed).length
          const progress = updatedSubTasks.length > 0 ? Math.round((completedSubTasks / updatedSubTasks.length) * 100) : 0
          
          return {
            ...goal,
            subTasks: updatedSubTasks,
            progress: progress
          }
        }
        return goal
      }))
      setNewSubTaskText('')
    }
  }

  const editSubTask = (goalId, subTaskId, newText) => {
    if (newText.trim() !== '') {
      setGoals(goals.map(goal => {
        if (goal.id === goalId) {
          const updatedSubTasks = goal.subTasks.map(subTask => {
            if (subTask.id === subTaskId) {
              return { ...subTask, text: newText.trim() }
            }
            return subTask
          })
          return { ...goal, subTasks: updatedSubTasks }
        }
        return goal
      }))
      setEditingSubTask(null)
    }
  }

  const deleteSubTask = (goalId, subTaskId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedSubTasks = goal.subTasks.filter(subTask => subTask.id !== subTaskId)
        
        // Recalculate progress
        const completedSubTasks = updatedSubTasks.filter(st => st.completed).length
        const progress = updatedSubTasks.length > 0 ? Math.round((completedSubTasks / updatedSubTasks.length) * 100) : 0
        
        return {
          ...goal,
          subTasks: updatedSubTasks,
          progress: progress
        }
      }
      return goal
    }))
  }

  // Timetable functions
  const addEvent = () => {
    if (newEvent.title.trim() !== '' && newEvent.startTime < newEvent.endTime) {
      const event = {
        title: newEvent.title,
        description: newEvent.description,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        day: newEvent.day,
        color: '#4CAF50'
      }
      addTask(event)
      setNewEvent({
        day: 'monday',
        startTime: '06:00',
        endTime: '07:00',
        title: '',
        description: ''
      })
    }
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
    
    // Reset the sentToMatrix status of the corresponding todo
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, sentToMatrix: false } : todo
    ))
  }

  // Move todo to matrix
  const sendTodoToMatrix = (todo) => {
    // Instead of removing the todo, mark it as sent to matrix
    setTodos(todos.map(t => 
      t.id === todo.id ? { ...t, sentToMatrix: true } : t
    ))
    setMatrixTasks(prev => ({
      ...prev,
      doFirst: [...prev.doFirst, { id: todo.id, text: todo.text }]
    }))
  }

  // Remove a todo from all matrix quadrants
  const removeTodoFromMatrix = (todoId) => {
    setMatrixTasks(prev => ({
      doFirst: prev.doFirst.filter(t => t.id !== todoId),
      schedule: prev.schedule.filter(t => t.id !== todoId),
      delegate: prev.delegate.filter(t => t.id !== todoId),
      eliminate: prev.eliminate.filter(t => t.id !== todoId)
    }))
  }

  const backToGoalList = () => {
    setGoalManagementMode('list')
    setSelectedGoalId(null)
  }

  const getSelectedGoal = () => {
    return goals.find(goal => goal.id === selectedGoalId)
  }

  const handleDrop = (e, day, timeSlot) => {
    e.preventDefault()
    const eventData = JSON.parse(e.dataTransfer.getData('text/plain'))
    
    const getEndTime = (start, duration) => {
      const idx = timeSlots.indexOf(start)
      const endIdx = idx + Math.max(1, Math.round((duration || 1)))
      return timeSlots[endIdx] || timeSlots[timeSlots.length - 1]
    }

    if (eventData.type === 'todo') {
      const todo = todos.find(t => t.id === eventData.id)
      if (todo) {
        const duration = todo.duration || 1
        const endTime = getEndTime(timeSlot, duration)
        const newEvent = {
          title: todo.text,
          description: todo.description,
          startTime: timeSlot,
          endTime,
          day: day,
          color: '#4CAF50'
        }
        addTask(newEvent)
      }
    } else if (eventData.type === 'timetable') {
      const event = tasks.find(e => e.id === eventData.id)
      if (event) {
        const duration = timeSlots.indexOf(event.endTime) - timeSlots.indexOf(event.startTime)
        const endTime = getEndTime(timeSlot, duration)
        updateTask(event.id, { day, startTime: timeSlot, endTime })
      }
    } else if (eventData.type === 'pool') {
      // Schedule a pool task
      updateTask(eventData.id, { day, startTime: timeSlot })
    }
  }

  const onTodoDragStart = (e, todo) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'todo',
      id: todo.id
    }))
  }

  const handleDragStart = (e, event) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'timetable',
      id: event.id
    }))
  }

  const handleDeleteTask = (eventId) => {
    deleteTask(eventId)
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

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

  // Timetable navigation functions
  const navigateToWeekly = (dateObj) => {
    setSelectedDate(dateObj)
    setTimetableView('weekly')
  }

  const navigateToMonthly = (month) => {
    setSelectedMonth(month)
    setTimetableView('monthly')
  }

  const navigateToDashboard = () => {
    setTimetableView('dashboard')
  }

  // Focus handler
  const focusOnGoal = (goalId) => {
    setFocusGoalId(goalId)
    setFocusMode(true)
  }
  const exitFocusMode = () => {
    setFocusMode(false)
    setFocusGoalId(null)
  }

  return (
    <div className="app">
      <div className="layout">
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
                <select
                  value={todoDuration}
                  onChange={(e) => setTodoDuration(e.target.value)}
                  className="duration-select"
                >
                  <option value="0.5">30 min</option>
                  <option value="1">1 hour</option>
                  <option value="1.5">1.5 hours</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="6">6 hours</option>
                  <option value="8">8 hours</option>
                </select>
                <button onClick={addTodo} className="add-button">
                  Add
                </button>
              </div>

              <div className="todos-list">
                {todos.length === 0 ? (
                  <p className="empty-message">No todos yet. Add one above!</p>
                ) : (
                  todos.map(todo => {
                    const inMatrix = matrixTasks.doFirst.some(t => t.id === todo.id) ||
                                    matrixTasks.schedule.some(t => t.id === todo.id) ||
                                    matrixTasks.delegate.some(t => t.id === todo.id) ||
                                    matrixTasks.eliminate.some(t => t.id === todo.id)
                    return (
                      <div
                        key={todo.id}
                        className={`todo-item ${todo.completed ? 'completed' : ''}`}
                        draggable={!todo.completed}
                        onDragStart={(e) => onTodoDragStart(e, todo)}
                      >
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className="todo-checkbox"
                        />
                        <div className="todo-content">
                          <span className="todo-text">{todo.text}</span>
                          <span className="todo-duration">{todo.duration} hour{todo.duration !== 1 ? 's' : ''}</span>
                        </div>
                        <span className="todo-date">
                          {new Date(todo.createdAt).toLocaleDateString()}
                        </span>
                        <button 
                          onClick={() => deleteTodo(todo.id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                        {inMatrix ? (
                          <button
                            className="add-button send-to-matrix in-matrix"
                            onClick={() => removeTodoFromMatrix(todo.id)}
                            title="Remove from Eisenhower Matrix"
                          >
                            ✅ In Matrix
                          </button>
                        ) : (
                          <button
                            className="add-button send-to-matrix"
                            onClick={() => sendTodoToMatrix(todo)}
                            title="Send to Eisenhower Matrix"
                          >
                            ➡️ Matrix
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {todos.length > 0 && (
                <div className="stats">
                  <p>Total: {todos.length} | Completed: {todos.filter(todo => todo.completed).length}</p>
                </div>
              )}

              {/* Eisenhower Matrix below To-Do List */}
              <div className="eisenhower-matrix" style={{marginTop: 40}}>
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
              {timetableView === 'dashboard' ? (
                <MonthlyDashboard
                  onSelectMonth={navigateToMonthly}
                  onGoToWeekly={() => {
                    const now = new Date();
                    navigateToWeekly({ year: now.getFullYear(), month: now.getMonth(), date: now.getDate() });
                  }}
                />
              ) : timetableView === 'monthly' ? (
                <MonthlyTimetable
                  selectedMonth={selectedMonth}
                  onBackToDashboard={navigateToDashboard}
                  onNavigateToWeekly={navigateToWeekly}
                />
              ) : (
                <WeeklyPlanner
                  todos={todos}
                  onViewMonth={navigateToDashboard}
                  selectedDate={selectedDate}
                  goals={goals}
                />
              )}
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="tab-content">
              {/* Goal Management Header */}
              <div className="goal-management-header">
                <h2>🎯 Goal Management</h2>
                {goalManagementMode === 'detail' && (
                  <button onClick={backToGoalList} className="back-btn">
                    ← Back to Goals
                  </button>
                )}
              </div>
              {/* Focus Mode Page */}
              {focusMode && (
                <GoalFocusPage
                  goal={goals.find(g => g.id === focusGoalId)}
                  newSubTaskText={newSubTaskText}
                  setNewSubTaskText={setNewSubTaskText}
                  editingSubTask={editingSubTask}
                  setEditingSubTask={setEditingSubTask}
                  addSubTask={addSubTask}
                  editSubTask={editSubTask}
                  deleteSubTask={deleteSubTask}
                  toggleSubTask={toggleSubTask}
                  onBack={exitFocusMode}
                />
              )}
              {/* Goal List View and Detail View only if not in focus mode */}
              {!focusMode && (
                <>
                  {goalManagementMode === 'list' && (
                    <div className="goal-list-view">
                      <div className="goal-actions">
                        <div className="goal-input-section">
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
                        <button className="ai-assistant-btn">
                          🤖 AI Goal Assistant
                        </button>
                      </div>
                      <div className="goals-grid">
                        {goals.length === 0 ? (
                          <p className="empty-message">No goals set yet. Create your first goal above!</p>
                        ) : (
                          goals.map(goal => (
                            <div key={goal.id} className={`goal-card ${selectedGoalId === goal.id ? 'selected' : ''}`}>
                              <div className="goal-card-header">
                                <h3>{goal.title}</h3>
                                <div className="goal-card-actions">
                                  <button 
                                    onClick={() => focusOnGoal(goal.id)}
                                    className="focus-btn"
                                    title="Focus on this goal"
                                  >
                                    🎯 Focus
                                  </button>
                                  <button 
                                    onClick={() => deleteGoal(goal.id)}
                                    className="delete-btn"
                                    title="Delete goal"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              <div className="goal-card-info">
                                <div className="goal-deadline">
                                  Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                </div>
                                <div className="goal-progress">
                                  Progress: {goal.progress}%
                                  <div className="progress-bar">
                                    <div 
                                      className="progress-fill" 
                                      style={{width: `${goal.progress}%`}}
                                    ></div>
                                  </div>
                                </div>
                                <div className="goal-stats">
                                  Sub-tasks: {goal.subTasks.filter(st => st.completed).length}/{goal.subTasks.length} done
                                </div>
                              </div>
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
                  {/* Goal Detail View */}
                  {goalManagementMode === 'detail' && getSelectedGoal() && (
                    <div className="goal-detail-view">
                      <div className="selected-goal-header">
                        <h3>🎯 {getSelectedGoal().title}</h3>
                        <div className="selected-goal-info">
                          <span>Deadline: {new Date(getSelectedGoal().deadline).toLocaleDateString()}</span>
                          <span>Progress: {getSelectedGoal().progress}%</span>
                        </div>
                      </div>

                      {/* Goals View Mode Selector */}
                      <div className="goals-view-toggle">
                        <button
                          className={goalViewMode === 'checklist' ? 'toggle-btn active' : 'toggle-btn'}
                          onClick={() => setGoalViewMode('checklist')}
                        >
                          📋 Checklist View
                        </button>
                        <button
                          className={goalViewMode === 'timeline' ? 'toggle-btn active' : 'toggle-btn'}
                          onClick={() => setGoalViewMode('timeline')}
                        >
                          🕐 Timeline View
                        </button>
                      </div>

                      {/* Goal Content */}
                      <div className="goal-content">
                        {!getSelectedGoal().completed && (
                          <div className="progress-section">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{width: `${getSelectedGoal().progress}%`}}
                              ></div>
                            </div>
                            <div className="progress-text">Progress: {getSelectedGoal().progress}%</div>
                          </div>
                        )}

                        {/* Timeline View */}
                        {goalViewMode === 'timeline' && !getSelectedGoal().completed && (
                          <div className="timeline-view">
                            <div className="timeline-container">
                              {getSelectedGoal().milestones.map((milestone) => (
                                <div key={milestone.id} className="timeline-item">
                                  <div className={`timeline-marker ${milestone.completed ? 'completed' : ''}`}>
                                    {milestone.completed ? '✅' : '○'}
                                  </div>
                                  <div className="timeline-content">
                                    <div className="timeline-text">{milestone.text}</div>
                                    {milestone.completedAt && (
                                      <div className="timeline-date">
                                        Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => toggleMilestone(getSelectedGoal().id, milestone.id)}
                                    className="timeline-toggle-btn"
                                  >
                                    {milestone.completed ? 'Undo' : 'Complete'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Enhanced Checklist View */}
                        {goalViewMode === 'checklist' && !getSelectedGoal().completed && (
                          <div className="checklist-view">
                            <div className="sub-tasks-section">
                              <h4>📋 Sub-tasks ({getSelectedGoal().subTasks.filter(st => st.completed).length}/{getSelectedGoal().subTasks.length} done)</h4>
                              
                              {/* Add new sub-task */}
                              <div className="add-item-section">
                                <input
                                  type="text"
                                  value={newSubTaskText}
                                  onChange={(e) => setNewSubTaskText(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addSubTask(getSelectedGoal().id)
                                    }
                                  }}
                                  placeholder="Add a new sub-task..."
                                  className="add-item-input"
                                />
                                <button 
                                  onClick={() => addSubTask(getSelectedGoal().id)}
                                  className="add-item-btn"
                                  disabled={newSubTaskText.trim() === ''}
                                >
                                  +
                                </button>
                              </div>

                              {/* Sub-tasks list */}
                              {getSelectedGoal().subTasks.map(subTask => (
                                <div key={subTask.id} className="sub-task-item">
                                  <input
                                    type="checkbox"
                                    checked={subTask.completed}
                                    onChange={() => toggleSubTask(getSelectedGoal().id, subTask.id)}
                                    className="sub-task-checkbox"
                                  />
                                  
                                  {editingSubTask === subTask.id ? (
                                    <div className="edit-item-section">
                                      <input
                                        type="text"
                                        defaultValue={subTask.text}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            editSubTask(getSelectedGoal().id, subTask.id, e.target.value)
                                          }
                                        }}
                                        onBlur={(e) => editSubTask(getSelectedGoal().id, subTask.id, e.target.value)}
                                        className="edit-item-input"
                                        autoFocus
                                      />
                                      <button 
                                        onClick={() => setEditingSubTask(null)}
                                        className="edit-item-btn"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <span className={`sub-task-text ${subTask.completed ? 'completed' : ''}`}>
                                      {subTask.text}
                                    </span>
                                  )}
                                  
                                  {subTask.completedAt && (
                                    <span className="sub-task-date">
                                      {new Date(subTask.completedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                  
                                  <div className="item-actions">
                                    <button
                                      onClick={() => setEditingSubTask(subTask.id)}
                                      className="edit-btn"
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => deleteSubTask(getSelectedGoal().id, subTask.id)}
                                      className="delete-btn"
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
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
