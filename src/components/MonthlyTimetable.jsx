import React, { useState } from 'react'
import { useTaskStore } from '../contexts/TaskStore'

const MonthlyTimetable = ({ selectedMonth, onBackToDashboard, onNavigateToWeekly }) => {
  const taskStore = useTaskStore()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ]

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  // Calculate which week of the month a date belongs to
  const getWeekOfMonth = (date) => {
    const firstDayOfMonth = new Date(currentYear, selectedMonth, 1).getDay()
    const firstWeekStart = 1 - firstDayOfMonth
    const weekNumber = Math.ceil((date - firstWeekStart) / 7)
    return Math.max(1, Math.min(4, weekNumber)) // Ensure week is between 1-4
  }

  // Get the day name for a specific date
  const getDayName = (date) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const firstDayOfMonth = new Date(currentYear, selectedMonth, 1).getDay()
    const dayOfWeek = (firstDayOfMonth + date - 1) % 7
    return dayNames[dayOfWeek]
  }

  const getTaskCountForDate = (date) => {
    // Get tasks for the current year and selected month
    const monthTasks = taskStore.getTasksByYearAndMonth(currentYear, selectedMonth)
    
    // Filter tasks by the specific date
    const dateTasks = monthTasks.filter(task => {
      if (!task.day || !task.week) return false
      
      // Convert day name to day number (0 = Sunday, 1 = Monday, etc.)
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const taskDayNumber = dayNames.indexOf(task.day.toLowerCase())
      
      if (taskDayNumber === -1) return false
      
      // Calculate which week of the month this task belongs to
      const weekNumber = task.week || 1
      
      // Calculate the date for this task
      // First, find the first occurrence of this day in the month
      const firstDayOfMonth = new Date(currentYear, selectedMonth, 1).getDay()
      const daysToAdd = (taskDayNumber - firstDayOfMonth + 7) % 7
      const firstOccurrence = 1 + daysToAdd
      
      // Then add weeks to get to the correct week
      const taskDate = firstOccurrence + (weekNumber - 1) * 7
      
      // Check if this task's calculated date matches the current date
      return taskDate === date
    })
    
    // Debug logging
    if (dateTasks.length > 0) {
      console.log(`MonthlyTimetable - ${months[selectedMonth]} ${currentYear}, Date ${date}:`, {
        totalMonthTasks: monthTasks.length,
        dateTasks: dateTasks.length,
        tasks: dateTasks
      })
    }
    
    return dateTasks.length
  }

  const handleDateClick = (date) => {
    const weekNumber = getWeekOfMonth(date)
    const dayName = getDayName(date)
    
    console.log(`MonthlyTimetable - Clicked date ${date}, navigating to week ${weekNumber}, day ${dayName}`)
    
    // Navigate to weekly planner with the correct week and day
    onNavigateToWeekly(weekNumber, dayName, selectedMonth, currentYear)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, selectedMonth)
    const firstDay = getFirstDayOfMonth(currentYear, selectedMonth)
    const calendar = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const taskCount = getTaskCountForDate(day)
      calendar.push(
        <div 
          key={day} 
          className="calendar-day clickable"
          onClick={() => handleDateClick(day)}
          title={`Click to view ${months[selectedMonth]} ${day}, ${currentYear} in Weekly Planner`}
        >
          <div className="day-number">{day}</div>
          {taskCount > 0 && (
            <div className="task-count">({taskCount})</div>
          )}
        </div>
      )
    }
    
    return calendar
  }

  // Get tasks for the current month
  const currentMonthTasks = taskStore.getTasksByYearAndMonth(currentYear, selectedMonth)

  // Group tasks by day
  const tasksByDay = currentMonthTasks.reduce((acc, task) => {
    const day = task.day
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(task)
    return acc
  }, {})

  return (
    <div className="monthly-timetable">
      <div className="monthly-header">
        <button onClick={onBackToDashboard} className="back-button">
          ← Back to Months
        </button>
        <div className="month-year-controls">
          <button onClick={() => setCurrentYear(currentYear - 1)} className="year-nav">◀</button>
          <select
            value={currentYear}
            onChange={e => setCurrentYear(Number(e.target.value))}
            className="year-select"
            style={{margin: '0 10px', padding: '6px 12px', borderRadius: '6px', fontSize: '1rem'}}
          >
            {Array.from({length: 11}, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button onClick={() => setCurrentYear(currentYear + 1)} className="year-nav">▶</button>
          <h2>📅 {months[selectedMonth]} {currentYear}</h2>
        </div>
      </div>
      
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="day-label">Sun</div>
          <div className="day-label">Mon</div>
          <div className="day-label">Tue</div>
          <div className="day-label">Wed</div>
          <div className="day-label">Thu</div>
          <div className="day-label">Fri</div>
          <div className="day-label">Sat</div>
        </div>
        <div className="calendar-grid">
          {renderCalendar()}
        </div>
      </div>
    </div>
  )
}

export default MonthlyTimetable 