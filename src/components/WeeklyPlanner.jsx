import React, { useState, useEffect } from 'react'
import { useTaskStore } from '../contexts/TaskStore'

const WeeklyPlanner = ({ 
  todos, 
  onViewMonth,
  selectedDate,
  goals = [] // pass goals as prop if needed
}) => {
  const taskStore = useTaskStore()
  const [mondayDate, setMondayDate] = useState(null)
  const [timetableMode, setTimetableMode] = useState('day')
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [newEvent, setNewEvent] = useState({
    day: 'monday',
    startTime: '06:00',
    endTime: '07:00',
    title: '',
    description: ''
  })
  
  const weeks = [
    { id: 1, label: 'Week 1' },
    { id: 2, label: 'Week 2' },
    { id: 3, label: 'Week 3' },
    { id: 4, label: 'Week 4' }
  ]

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  // Generate time slots based on mode
  const generateTimeSlots = () => {
    const slots = []
    if (timetableMode === 'night') {
      // Night time: 23:00, 00:00, 01:00, 02:00, 03:00, 04:00, 05:00
      for (let hour = 23; hour < 24; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
      }
      for (let hour = 0; hour <= 5; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
      }
    } else {
      // Day time: 06:00 to 22:00
      for (let hour = 6; hour <= 22; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
      }
    }
    
    // Debug logging for time slots
    console.log(`WeeklyPlanner - Generated time slots for ${timetableMode} mode:`, slots)
    
    return slots
  }
  
  const timeSlots = generateTimeSlots()

  // Helper function to compare times, handling night time correctly
  const isTimeBefore = (time1, time2) => {
    const hour1 = parseInt(time1.split(':')[0])
    const hour2 = parseInt(time2.split(':')[0])
    
    // For night time, 23:00 should be considered before 00:00
    if (timetableMode === 'night') {
      // If time1 is 23 and time2 is 0-5, time1 is before time2
      if (hour1 === 23 && hour2 >= 0 && hour2 <= 5) {
        return true
      }
      // If time1 is 0-5 and time2 is 23, time1 is after time2
      if (hour1 >= 0 && hour1 <= 5 && hour2 === 23) {
        return false
      }
    }
    
    // Normal time comparison
    return hour1 < hour2
  }

  // Reset newEvent times when mode changes
  useEffect(() => {
    const defaultStartTime = timetableMode === 'night' ? '23:00' : '06:00'
    const defaultEndTime = timetableMode === 'night' ? '00:00' : '07:00'
    
    setNewEvent(prev => ({
      ...prev,
      startTime: defaultStartTime,
      endTime: defaultEndTime
    }))
  }, [timetableMode])

  // On mount, calculate the Monday of the week for selectedDate
  useEffect(() => {
    if (selectedDate) {
      const { year, month, date } = selectedDate
      const clicked = new Date(year, month, date)
      const dayOfWeek = clicked.getDay() === 0 ? 6 : clicked.getDay() - 1 // 0=Mon, 6=Sun
      const monday = new Date(clicked)
      monday.setDate(clicked.getDate() - dayOfWeek)
      setMondayDate(monday)
    }
  }, [selectedDate])

  // For each day, get the correct Date object
  const getDateForDay = (dayIndex) => {
    if (!mondayDate) return null
    const d = new Date(mondayDate)
    d.setDate(mondayDate.getDate() + dayIndex)
    return d
  }

  // Add event function
  const addEvent = () => {
    if (newEvent.title.trim() !== '' && isTimeBefore(newEvent.startTime, newEvent.endTime)) {
      // Find the day index for the selected day
      const dayIndex = days.indexOf(newEvent.day.toLowerCase())
      const eventDateObj = getDateForDay(dayIndex)
      const event = {
        title: newEvent.title,
        description: newEvent.description,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        day: newEvent.day,
        color: '#4CAF50',
        week: 1, // Assuming week 1
        year: eventDateObj.getFullYear(),
        month: eventDateObj.getMonth()
      }
      
      // Debug logging for night time events
      console.log(`WeeklyPlanner - Creating event:`, {
        mode: timetableMode,
        event: event,
        timeSlots: timeSlots,
        timeComparison: isTimeBefore(newEvent.startTime, newEvent.endTime)
      })
      
      taskStore.addTask(event)
      setNewEvent({
        day: 'monday',
        startTime: timetableMode === 'night' ? '23:00' : '06:00',
        endTime: timetableMode === 'night' ? '00:00' : '07:00',
        title: '',
        description: ''
      })
    } else {
      console.log(`WeeklyPlanner - Event validation failed:`, {
        title: newEvent.title.trim(),
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        isTimeValid: isTimeBefore(newEvent.startTime, newEvent.endTime),
        mode: timetableMode
      })
    }
  }

  // Drag start for sidebar tasks
  const handleSidebarDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: item.isSubtask ? 'subtask' : 'todo',
      id: item.id,
      goalId: item.goalId || null
    }))
  }

  // Update timetable cell drop handler to accept sidebar tasks
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
        const dayIndex = days.indexOf(day.toLowerCase())
        const eventDateObj = getDateForDay(dayIndex)
        const newEvent = {
          title: todo.text,
          description: todo.description,
          startTime: timeSlot,
          endTime: getEndTime(timeSlot, todo.duration),
          day: day,
          color: '#4CAF50',
          week: 1,
          year: eventDateObj.getFullYear(),
          month: eventDateObj.getMonth()
        }
        taskStore.addTask(newEvent)
      }
    } else if (eventData.type === 'subtask') {
      const subtask = allSubtasks.find(st => st.id === eventData.id)
      if (subtask) {
        const dayIndex = days.indexOf(day.toLowerCase())
        const eventDateObj = getDateForDay(dayIndex)
        const newEvent = {
          title: subtask.text,
          description: '',
          startTime: timeSlot,
          endTime: getEndTime(timeSlot, 1),
          day: day,
          color: '#6c63ff',
          week: 1,
          year: eventDateObj.getFullYear(),
          month: eventDateObj.getMonth()
        }
        taskStore.addTask(newEvent)
      }
    } else if (eventData.type === 'timetable') {
      const event = taskStore.tasks.find(e => e.id === eventData.id)
      if (event) {
        const duration = timeSlots.indexOf(event.endTime) - timeSlots.indexOf(event.startTime)
        const endTime = getEndTime(timeSlot, duration)
        taskStore.updateTask(event.id, { day, startTime: timeSlot, endTime })
      }
    }
  }

  const handleDragStart = (e, event) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'timetable',
      id: event.id
    }))
  }

  const handleDeleteTask = (eventId) => {
    taskStore.deleteTask(eventId)
  }

  // Filter tasks by current week, year, and month
  const getTasksByDayAndWeek = (day) => {
    // First get tasks for the current year and month
    const monthTasks = taskStore.getTasksByYearAndMonth(mondayDate.getFullYear(), mondayDate.getMonth())
    // Then filter by day and week
    const filteredTasks = monthTasks.filter(task => 
      task.day.toLowerCase() === day.toLowerCase() && task.week === 1
    )
    
    // Debug logging
    console.log(`WeeklyPlanner - ${months[mondayDate.getMonth()]} ${mondayDate.getFullYear()}, Week 1, ${day}:`, {
      totalMonthTasks: monthTasks.length,
      filteredTasks: filteredTasks.length,
      tasks: filteredTasks
    })
    
    return filteredTasks
  }

  // Handle month selection
  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(mondayDate)
    newDate.setMonth(monthIndex)
    setMondayDate(newDate)
    setShowMonthDropdown(false)
  }

  // Get current month and date
  const getCurrentMonthAndDate = () => {
    const now = new Date()
    const month = now.toLocaleString('default', { month: 'long' })
    const date = now.getDate()
    const year = now.getFullYear()
    return `${month} ${date}, ${year}`
  }

  // Gather all subtasks from all goals
  const allSubtasks = goals.flatMap(goal =>
    (goal.subTasks || []).map(subtask => ({
      ...subtask,
      goalId: goal.id,
      isSubtask: true,
    }))
  )
  // Mark scheduled/completed status (placeholder logic for now)
  const getStatus = (item) => {
    // TODO: Replace with real logic
    return { scheduled: false, completed: !!item.completed }
  }

  if (!mondayDate) {
    return <div>Loading weekly timetable...</div>;
  }

  return (
    <div className="weekly-planner">
      <div className="weekly-planner-layout">
        {/* Sidebar for Weekly Timetables */}
        <div className="weekly-sidebar">
          <button
            className="view-month-button"
            onClick={onViewMonth}
            style={{marginBottom: '20px', width: '100%', padding: '14px 0', fontSize: '1.1rem', borderRadius: '8px', background: '#007bff', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer'}}
          >
            Monthly Timetable
          </button>
          <div className="global-tasks-section" style={{marginBottom: 24}}>
            <div style={{fontWeight: 700, marginBottom: 8}}>Global Tasks</div>
            <div className="global-tasks-list">
              {todos.map(todo => {
                const status = getStatus(todo)
                return (
                  <div key={todo.id} className={`global-task-item${status.scheduled ? ' scheduled' : ''}${status.completed ? ' completed' : ''}`} style={{display: 'flex', alignItems: 'center', marginBottom: 6, background: status.completed ? '#e0ffe0' : status.scheduled ? '#e6f0ff' : '#fff', borderRadius: 6, padding: '6px 8px'}}>
                    <span style={{marginRight: 8}}>{status.completed ? '✓' : '•'}</span>
                    <span style={{flex: 1}}>{todo.text}</span>
                    <span style={{marginRight: 8, color: '#888', fontSize: 12}}>Todo</span>
                    <button style={{marginRight: 4, cursor: 'grab'}} draggable onDragStart={e => handleSidebarDragStart(e, todo)}>⠿</button>
                    <button style={{color: '#c00', background: 'none', border: 'none', cursor: 'pointer'}}>🗑️</button>
                  </div>
                )
              })}
              {allSubtasks.map(subtask => {
                const status = getStatus(subtask)
                return (
                  <div key={subtask.id} className={`global-task-item${status.scheduled ? ' scheduled' : ''}${status.completed ? ' completed' : ''}`} style={{display: 'flex', alignItems: 'center', marginBottom: 6, background: status.completed ? '#e0ffe0' : status.scheduled ? '#e6f0ff' : '#fff', borderRadius: 6, padding: '6px 8px'}}>
                    <span style={{marginRight: 8}}>{status.completed ? '✓' : 'S'}</span>
                    <span style={{flex: 1}}>{subtask.text}</span>
                    <span style={{marginRight: 8, color: '#888', fontSize: 12}}>Subtask</span>
                    <button style={{marginRight: 4, cursor: 'grab'}} draggable onDragStart={e => handleSidebarDragStart(e, subtask)}>⠿</button>
                    <button style={{color: '#c00', background: 'none', border: 'none', cursor: 'pointer'}}>🗑️</button>
                  </div>
                )
              })}
            </div>
          </div>
          {/* Left Week Switcher (hidden) */}
          <div className="week-switcher" style={{ display: 'none' }}></div>
        </div>

        {/* Right Calendar View */}
        <div className="weekly-calendar">
          {/* Month Selector and Mode Toggle */}
          <div className="weekly-header">
            <div className="month-selector">
              <button
                className="month-selector-button"
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                aria-label="Select month"
              >
                📅 {months[mondayDate.getMonth()]} {mondayDate.getFullYear()}
              </button>
              {showMonthDropdown && (
                <div className="month-dropdown">
                  <div className="year-controls">
                    <button onClick={() => {}} aria-label="Previous year">◀</button>
                    <span>{mondayDate.getFullYear()}</span>
                    <button onClick={() => {}} aria-label="Next year">▶</button>
                  </div>
                  <div className="months-grid-dropdown">
                    {months.map((month, index) => (
                      <button
                        key={month}
                        className={`month-option ${mondayDate.getMonth() === index ? 'active' : ''}`}
                        onClick={() => handleMonthSelect(index)}
                        aria-label={`Select ${month}`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
          </div>

          {/* Add Event Input */}
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
            <select
              value={newEvent.startTime}
              onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
              className="start-time-select"
            >
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            <select
              value={newEvent.endTime}
              onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
              className="end-time-select"
            >
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
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

          {/* Calendar Grid */}
          <div className="weekly-timetable-container">
            <div className="weekly-timetable-header">
              <div className="time-column-header">Time</div>
              {days.map((day, dayIndex) => (
                <div key={day} className="day-header" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <span>{shortDays[dayIndex]}</span>
                  <span className="day-date">{getDateForDay(dayIndex)?.getDate()}</span>
                </div>
              ))}
            </div>
            <div className="weekly-timetable-grid">
              {timeSlots.map((timeSlot, timeIndex) => (
                <React.Fragment key={timeSlot}>
                  <div className="time-slot-header">{timeSlot}</div>
                  {days.map((day, dayIndex) => (
                    <div
                      key={`${day}-${timeSlot}`}
                      className="timetable-cell"
                      onDrop={e => handleDrop(e, day, timeSlot)}
                      onDragOver={e => e.preventDefault()}
                    >
                      {getTasksByDayAndWeek(day)
                        .filter(event => {
                          const eventStartIndex = timeSlots.indexOf(event.startTime)
                          const eventEndIndex = timeSlots.indexOf(event.endTime)
                          return timeIndex >= eventStartIndex && timeIndex < eventEndIndex
                        })
                        .map(event => {
                          const eventStartIndex = timeSlots.indexOf(event.startTime)
                          if (timeIndex !== eventStartIndex) return null
                          // Calculate height based on slot difference
                          const slotDiff = timeSlots.indexOf(event.endTime) - eventStartIndex
                          return (
                            <div
                              key={event.id}
                              className="timetable-event"
                              style={{
                                height: `${slotDiff * 60}px`,
                                backgroundColor: event.color || '#4CAF50',
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                right: '2px',
                                zIndex: 10
                              }}
                              draggable
                              onDragStart={(e) => handleDragStart(e, event)}
                            >
                              <div className="event-title">{event.title}</div>
                              <div className="event-duration">{event.startTime} - {event.endTime}</div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteTask(event.id)
                                }}
                                className="delete-button small"
                                style={{
                                  position: 'absolute',
                                  top: '2px',
                                  right: '2px',
                                  background: 'rgba(255,255,255,0.2)',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '16px',
                                  height: '16px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  color: 'white'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          )
                        })}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyPlanner 