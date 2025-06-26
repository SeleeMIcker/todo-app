import React from 'react'
import { useTaskStore } from '../contexts/TaskStore'

const MonthlyDashboard = ({ onSelectMonth }) => {
  const taskStore = useTaskStore()
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const getTaskCountForMonth = (monthIndex) => {
    const monthTasks = taskStore.getTasksByYearAndMonth(currentYear, monthIndex)
    return monthTasks.length
  }

  return (
    <div className="monthly-dashboard">
      <div className="dashboard-header">
        <h2>📅 Monthly Timetables</h2>
        <p>Select a month to view and manage your schedule</p>
      </div>
      
      <div className="months-grid">
        {months.map((month, index) => {
          const taskCount = getTaskCountForMonth(index)
          return (
            <div
              key={month}
              className={`month-card ${index === currentMonth ? 'current-month' : ''}`}
              onClick={() => onSelectMonth(index)}
            >
              <div className="month-name">{month}</div>
              <div className="month-year">{currentYear}</div>
              <div className="month-task-count">Tasks: {taskCount}</div>
              {index === currentMonth && (
                <div className="current-indicator">Current</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MonthlyDashboard 