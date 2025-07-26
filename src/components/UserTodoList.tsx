"use client"

import { useState, useEffect } from "react"
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Task {
  id: number
  text: string
  completed: boolean
  order: number
}

interface SortableTaskProps {
  task: Task
  toggleTask: (id: number) => void
  deleteTask: (id: number) => void
}

function SortableTask({ task, toggleTask, deleteTask }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center gap-3 p-2 rounded-lg bg-white/40 hover:bg-white/60 transition-colors ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      }`}
    >
      <div
        {...listeners}
        className="flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zM7 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zM7 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zM13 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 2zM13 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zM13 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
        </svg>
      </div>
      <button
        onClick={() => toggleTask(task.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          task.completed 
            ? 'bg-blue border-blue text-white' 
            : 'border-zinc-400 hover:border-blue'
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm whitespace-pre-line ${
        task.completed 
          ? 'line-through text-zinc-500' 
          : 'text-zinc-800'
      }`}>
        {task.text}
      </span>
      <button
        onClick={() => deleteTask(task.id)}
        className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

const initialTasks: Task[] = [
  { id: 1, text: "Review service requests", completed: false, order: 1 },
  { id: 2, text: "Update project documentation", completed: true, order: 2 },
  { id: 3, text: "Schedule team meeting", completed: false, order: 3 },
  { id: 4, text: "Prepare quarterly report", completed: false, order: 4 },
]

export default function UserTodoList() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTask, setNewTask] = useState("")
  const [isClient, setIsClient] = useState(false)

  // Ensure client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Sort tasks: unchecked first (by manual order), then checked (by manual order)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      // If both have same completion status, sort by manual order
      return a.order - b.order
    }
    // Unchecked tasks (false) come before checked tasks (true)
    return a.completed ? 1 : -1
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const addTask = () => {
    if (newTask.trim()) {
      const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1
      const newOrder = tasks.length > 0 ? Math.min(...tasks.filter(t => !t.completed).map(t => t.order), 1) - 1 : 1
      setTasks([...tasks, {
        id: newId,
        text: newTask,
        completed: false,
        order: newOrder
      }])
      setNewTask("")
    }
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTasks((tasks) => {
        const activeTask = tasks.find(task => task.id === active.id)
        const overTask = tasks.find(task => task.id === over.id)
        
        // Only allow reordering within the same completion group
        if (activeTask && overTask && activeTask.completed === overTask.completed) {
          // Find positions in the sorted array
          const oldIndex = sortedTasks.findIndex((task) => task.id === active.id)
          const newIndex = sortedTasks.findIndex((task) => task.id === over.id)

          // Move in the sorted array
          const newSortedTasks = arrayMove(sortedTasks, oldIndex, newIndex)
          
          // Update order values based on new positions
          return tasks.map(task => {
            const newPosition = newSortedTasks.findIndex(t => t.id === task.id)
            return {
              ...task,
              order: newPosition
            }
          })
        }
        
        return tasks
      })
    }
  }

  return (
    <div className="rounded-xl p-4 h-full border border-zinc-500/10 shadow-sm bg-gradient-to-t from-blue/10 to-light-blue/45 overflow-hidden flex flex-col">
      <h1 className="text-lg font-semibold mb-4 text-blue">User To do List</h1>
      
      {/* Add New Task Input */}
      <div className="flex gap-2 mb-4">
        <textarea
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
          className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              e.preventDefault();
              addTask();
            }
          }}
          rows={3}
        />
        <button
          onClick={addTask}
          className="px-4 py-2 bg-blue text-white rounded-lg text-sm hover:bg-blue/90 transition-colors font-medium"
        >
          Add
        </button>
      </div>

      {/* Tasks List with Drag and Drop */}
      <div className="flex-1 overflow-y-auto">
        {isClient ? (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={sortedTasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortedTasks.map(task => (
                  <SortableTask 
                    key={task.id} 
                    task={task} 
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          // Fallback for server-side rendering
          <div className="space-y-2">
            {sortedTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/40 hover:bg-white/60 transition-colors">
                <div className="flex items-center justify-center w-6 h-6 text-zinc-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zM7 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zM7 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zM13 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 2zM13 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zM13 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
                  </svg>
                </div>
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-blue border-blue text-white' 
                      : 'border-zinc-400 hover:border-blue'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <span className={`flex-1 text-sm whitespace-pre-line ${
                  task.completed 
                    ? 'line-through text-zinc-500' 
                    : 'text-zinc-800'
                }`}>
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}