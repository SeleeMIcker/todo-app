import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { TASK_ACTIONS } from './taskStoreConstants.js'

// Task store context
const TaskStoreContext = createContext()

// Initial state
const initialState = {
  tasks: []
}

// Reducer function
const taskReducer = (state, action) => {
  switch (action.type) {
    case TASK_ACTIONS.ADD_TASK:
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      }
    
    case TASK_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id 
            ? { ...task, ...action.payload.updates }
            : task
        )
      }
    
    case TASK_ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      }
    
    case TASK_ACTIONS.LOAD_TASKS:
      return {
        ...state,
        tasks: action.payload
      }
    
    default:
      return state
  }
}

// Task store provider component
export const TaskStoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('timetable-tasks')
    if (savedTasks) {
      try {
        const tasks = JSON.parse(savedTasks)
        dispatch({ type: TASK_ACTIONS.LOAD_TASKS, payload: tasks })
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error)
      }
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('timetable-tasks', JSON.stringify(state.tasks))
  }, [state.tasks])

  // Helper function to check if a time is within a shift
  const isTimeInShift = (timeString, shiftType) => {
    const hour = parseInt(timeString.split(':')[0])
    
    if (shiftType === 'day') {
      return hour >= 6 && hour <= 22
    } else if (shiftType === 'night') {
      return hour >= 23 || hour <= 5
    }
    return false
  }

  // Store functions
  const addTask = (task) => {
    const now = new Date()
    const newTask = {
      id: Date.now(),
      ...task,
      createdAt: now.toISOString(),
      year: task.year !== undefined ? task.year : now.getFullYear(),
      month: task.month !== undefined ? task.month : now.getMonth() // 0-11 for January-December
    }
    dispatch({ type: TASK_ACTIONS.ADD_TASK, payload: newTask })
  }

  const updateTask = (id, updates) => {
    dispatch({ 
      type: TASK_ACTIONS.UPDATE_TASK, 
      payload: { id, updates } 
    })
  }

  const deleteTask = (id) => {
    dispatch({ type: TASK_ACTIONS.DELETE_TASK, payload: id })
  }

  const getTasksForShift = (shiftType) => {
    return state.tasks.filter(task => isTimeInShift(task.startTime, shiftType))
  }

  const getTasksByDay = (day) => {
    return state.tasks.filter(task => 
      task.day.toLowerCase() === day.toLowerCase()
    )
  }

  // New function to get tasks by year and month
  const getTasksByYearAndMonth = (year, month) => {
    return state.tasks.filter(task => 
      task.year === year && task.month === month
    )
  }

  const getAllTasks = () => {
    return state.tasks
  }

  const getTaskById = (id) => {
    return state.tasks.find(task => task.id === id)
  }

  const value = {
    tasks: state.tasks,
    addTask,
    updateTask,
    deleteTask,
    getTasksForShift,
    getTasksByDay,
    getTasksByYearAndMonth,
    getAllTasks,
    getTaskById
  }

  return (
    <TaskStoreContext.Provider value={value}>
      {children}
    </TaskStoreContext.Provider>
  )
}

// Custom hook to use the task store
export const useTaskStore = () => {
  const context = useContext(TaskStoreContext)
  if (!context) {
    throw new Error('useTaskStore must be used within a TaskStoreProvider')
  }
  return context
} 