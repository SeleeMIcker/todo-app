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
    // Return day of week with Monday as 0 and Sunday as 6
    const day = new Date(year, month, 1).getDay()
    return (day === 0) ? 6 : day - 1
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
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const firstDayOfMonth = new Date(currentYear, selectedMonth, 1).getDay()
    // Adjust firstDayOfMonth to be Monday-based (0=Mon, 6=Sun)
    const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1
    const dayOfWeek = (adjustedFirstDay + date - 1) % 7
    return dayNames[dayOfWeek]
  }

  const getTaskCountForDate = (date) => {
    // Get tasks for the current year and selected month
    const monthTasks = taskStore.getTasksByYearAndMonth(currentYear, selectedMonth)
    const daysInMonth = getDaysInMonth(currentYear, selectedMonth)
    
    // Get the day of the week for the 1st of the month (0=Mon, 1=Tue, ..., 6=Sun)
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, selectedMonth) // Monday-based

    // Filter tasks by the specific date
    const dateTasks = monthTasks.filter(task => {
      if (!task.day || !task.week) return false
      
      // Convert day name to day number (0 = Monday, 6 = Sunday)
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const taskDayNumber = dayNames.indexOf(task.day.toLowerCase())
      
      if (taskDayNumber === -1) return false
      
      const weekNumber = task.week || 1
      
      // Calculate the date for this task
      // First, find the first occurrence of this day in the month
      const daysToAdd = (taskDayNumber - firstDayOfMonth + 7) % 7
      const firstOccurrence = 1 + daysToAdd
      
      // Then add weeks to get to the correct week
      const taskDate = firstOccurrence + (weekNumber - 1) * 7
      
      // Check if this task's calculated date matches the current date
      return taskDate === date && date > 0 && date <= daysInMonth
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

  // New: count tasks for any cell by exact date
  const getTaskCountForCell = (year, month, date) => {
    const allTasks = taskStore.getAllTasks()
    return allTasks.filter(task => task.year === year && task.month === month && new Date(task.year, task.month, task.dayNum || task.date || task.day || 0).getDate() === date).length
  }

  const handleDateClick = (date, month = selectedMonth, year = currentYear) => {
    onNavigateToWeekly({ year, month, date })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, selectedMonth)
    // Find the first day of the month (0=Mon, 6=Sun)
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, selectedMonth)
    // Calculate the date of the first Monday to display
    const firstDateObj = new Date(currentYear, selectedMonth, 1)
    const firstMonday = new Date(firstDateObj)
    firstMonday.setDate(firstDateObj.getDate() - firstDayOfMonth)
    // Calculate the date of the last day of the month
    const lastDateObj = new Date(currentYear, selectedMonth, daysInMonth)
    const lastDayOfWeek = lastDateObj.getDay() === 0 ? 6 : lastDateObj.getDay() - 1
    const lastSunday = new Date(lastDateObj)
    lastSunday.setDate(lastDateObj.getDate() + (6 - lastDayOfWeek))

    const calendar = []
    let current = new Date(firstMonday)
    while (current <= lastSunday) {
      const cellYear = current.getFullYear()
      const cellMonth = current.getMonth()
      const cellDate = current.getDate()
      // Use new function for all cells
      const taskCount = getTaskCountForCell(cellYear, cellMonth, cellDate)
      const isCurrentMonth = (cellMonth === selectedMonth && cellYear === currentYear)
      calendar.push(
        <div
          key={`${cellYear}-${cellMonth}-${cellDate}`}
          className={`calendar-day clickable${isCurrentMonth ? '' : ' other-month'}`}
          onClick={() => handleDateClick(cellDate, cellMonth, cellYear)}
          title={`Click to view ${months[cellMonth]} ${cellDate}, ${cellYear} in Weekly Planner`}
        >
          <div className="day-number">{cellDate}</div>
          {taskCount > 0 && (
            <div className="task-count">({taskCount})</div>
          )}
        </div>
      )
      current.setDate(current.getDate() + 1)
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
          <div className="day-label">Mon</div>
          <div className="day-label">Tue</div>
          <div className="day-label">Wed</div>
          <div className="day-label">Thu</div>
          <div className="day-label">Fri</div>
          <div className="day-label">Sat</div>
          <div className="day-label">Sun</div>
        </div>
        <div className="calendar-grid">
          {renderCalendar()}
        </div>
      </div>
    </div>
  )
}

export default MonthlyTimetable 