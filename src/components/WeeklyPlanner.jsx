import React, { useState, useEffect } from 'react'
import { useTaskStore } from '../contexts/TaskStore'

const WeeklyPlanner = ({ 
  todos, 
  onViewMonth,
  initialWeek,
  initialDay,
  initialMonth,
  initialYear
}) => {
  const taskStore = useTaskStore()
  const [currentWeek, setCurrentWeek] = useState(initialWeek || 1)
  const [timetableMode, setTimetableMode] = useState('day')
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(initialYear || new Date().getFullYear())
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [newEvent, setNewEvent] = useState({
    day: initialDay || 'monday',
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
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ]

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
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

  // Update newEvent day when initialDay changes (navigation from monthly view)
  useEffect(() => {
    if (initialDay) {
      setNewEvent(prev => ({
        ...prev,
        day: initialDay
      }))
    }
  }, [initialDay])

  // Add event function
  const addEvent = () => {
    if (newEvent.title.trim() !== '' && isTimeBefore(newEvent.startTime, newEvent.endTime)) {
      const event = {
        title: newEvent.title,
        description: newEvent.description,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        day: newEvent.day,
        color: '#4CAF50',
        week: currentWeek, // Add week information
        year: selectedYear, // Add year information
        month: selectedMonth // Add month information
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
          color: '#4CAF50',
          week: currentWeek, // Add week information
          year: selectedYear, // Add year information
          month: selectedMonth // Add month information
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
    const monthTasks = taskStore.getTasksByYearAndMonth(selectedYear, selectedMonth)
    // Then filter by day and week
    const filteredTasks = monthTasks.filter(task => 
      task.day.toLowerCase() === day.toLowerCase() && task.week === currentWeek
    )
    
    // Debug logging
    console.log(`WeeklyPlanner - ${months[selectedMonth]} ${selectedYear}, Week ${currentWeek}, ${day}:`, {
      totalMonthTasks: monthTasks.length,
      filteredTasks: filteredTasks.length,
      tasks: filteredTasks
    })
    
    return filteredTasks
  }

  // Handle month selection
  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex)
    setShowMonthDropdown(false)
  }

  // Handle year change
  const handleYearChange = (direction) => {
    setSelectedYear(prev => prev + direction)
  }

  // Get current month and date
  const getCurrentMonthAndDate = () => {
    const now = new Date()
    const month = now.toLocaleString('default', { month: 'long' })
    const date = now.getDate()
    const year = now.getFullYear()
    return `${month} ${date}, ${year}`
  }

  return (
    <div className="weekly-planner">
      <div className="weekly-planner-layout">
        {/* Left Week Switcher */}
        <div className="week-switcher">
          <div className="week-list">
            {weeks.map(week => (
              <button
                key={week.id}
                className={`week-button ${currentWeek === week.id ? 'active' : ''}`}
                onClick={() => setCurrentWeek(week.id)}
              >
                ◀ {week.label}
              </button>
            ))}
          </div>
          <button 
            className="view-month-button"
            onClick={onViewMonth}
          >
            📅 View Month
          </button>
        </div>

        {/* Right Calendar View */}
        <div className="weekly-calendar">
          {/* Month Selector and Mode Toggle */}
          <div className="weekly-header">
            <div className="month-selector">
              <button 
                className="month-selector-button"
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              >
                📅 {months[selectedMonth]} {selectedYear}
              </button>
              {showMonthDropdown && (
                <div className="month-dropdown">
                  <div className="year-controls">
                    <button onClick={() => handleYearChange(-1)}>◀</button>
                    <span>{selectedYear}</span>
                    <button onClick={() => handleYearChange(1)}>▶</button>
                  </div>
                  <div className="months-grid">
                    {months.map((month, index) => (
                      <button
                        key={month}
                        className={`month-option ${selectedMonth === index ? 'active' : ''}`}
                        onClick={() => handleMonthSelect(index)}
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
              <div className="time-column-header"></div>
              {days.map(day => (
                <div key={day} className="day-header">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </div>
              ))}
            </div>
            <div className="weekly-timetable-grid">
              {timeSlots.map((timeSlot, timeIndex) => (
                <React.Fragment key={timeSlot}>
                  <div className="time-slot-header">{timeSlot}</div>
                  {days.map(day => (
                    <div
                      key={`${day}-${timeSlot}`}
                      className="timetable-cell"
                      onDrop={(e) => handleDrop(e, day, timeSlot)}
                      onDragOver={(e) => e.preventDefault()}
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