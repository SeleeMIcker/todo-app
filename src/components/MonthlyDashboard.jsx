import React, { useState } from 'react'
import { useTaskStore } from '../contexts/TaskStore'

const MonthlyDashboard = ({ onSelectMonth, onGoToWeekly }) => {
  const taskStore = useTaskStore()
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ]

  const thisYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const [selectedYear, setSelectedYear] = useState(thisYear)

  const getTaskCountForMonth = (monthIndex) => {
    const monthTasks = taskStore.getTasksByYearAndMonth(selectedYear, monthIndex)
    return monthTasks.length
  }

  return (
    <div className="monthly-dashboard">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div
          className="dashboard-header-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '8px 0 20px 0',
            borderBottom: '1.5px solid #e0e0e0',
            marginBottom: 18
          }}
        >
          {/* Year Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setSelectedYear(selectedYear - 1)}
              className="year-nav"
              style={{
                fontSize: '1.5rem',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: '#f5f5f5',
                cursor: 'pointer',
                transition: 'background 0.2s',
                marginRight: 2
              }}
              aria-label="Previous year"
            >
              ◀
            </button>
            <span
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                letterSpacing: 1,
                minWidth: 70,
                textAlign: 'center',
                color: '#222'
              }}
            >
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear(selectedYear + 1)}
              className="year-nav"
              style={{
                fontSize: '1.5rem',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: '#f5f5f5',
                cursor: 'pointer',
                transition: 'background 0.2s',
                marginLeft: 2
              }}
              aria-label="Next year"
            >
              ▶
            </button>
          </div>

          {/* Dashboard Title */}
          <h2 style={{
            margin: 0,
            fontSize: '1.7rem',
            fontWeight: 700,
            letterSpacing: 1,
            color: '#2d3a4a',
            flex: 1,
            textAlign: 'center',
            userSelect: 'none'
          }}>
            📅 Monthly Timetables
          </h2>

          {/* Weekly Timetable Button */}
          <button
            className="weekly-timetables-btn"
            style={{
              padding: '10px 22px',
              fontSize: '1.08rem',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              transition: 'background 0.2s, box-shadow 0.2s',
              minWidth: 160
            }}
            onClick={onGoToWeekly}
          >
            📅 Weekly Timetable
          </button>
        </div>
        <p style={{ textAlign: 'center', color: '#666', margin: '10px 0 0 0', fontSize: '1.08rem' }}>
          Select a month to view and manage your schedule
        </p>
      </div>
      <div className="months-grid">
        {months.map((month, index) => {
          const taskCount = getTaskCountForMonth(index)
          return (
            <div
              key={month}
              className={`month-card ${index === currentMonth && selectedYear === thisYear ? 'current-month' : ''}`}
              onClick={() => onSelectMonth(index)}
            >
              <div className="month-name">{month}</div>
              <div className="month-year">{selectedYear}</div>
              <div className="month-task-count">Tasks: {taskCount}</div>
              {index === currentMonth && selectedYear === thisYear && (
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