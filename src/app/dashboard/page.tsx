'use client'

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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

interface Task {
  id: number
  text: string
  completed: boolean
}

interface SortableTaskProps {
  task: Task
  toggleTask: (id: number) => void
}

function SortableTask({ task, toggleTask }: SortableTaskProps) {
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
      <span className={`flex-1 text-sm ${
        task.completed 
          ? 'line-through text-zinc-500' 
          : 'text-zinc-800'
      }`}>
        {task.text}
      </span>
    </div>
  )
}

const initialTasks: Task[] = [
  { id: 1, text: "Review service requests", completed: false },
  { id: 2, text: "Update project documentation", completed: true },
  { id: 3, text: "Schedule team meeting", completed: false },
  { id: 4, text: "Prepare quarterly report", completed: false },
]

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTask, setNewTask] = useState("")
  const [isClient, setIsClient] = useState(false)

  // Ensure client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

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
      setTasks([...tasks, {
        id: newId,
        text: newTask.trim(),
        completed: false
      }])
      setNewTask("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask()
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTasks((tasks) => {
        const oldIndex = tasks.findIndex((task) => task.id === active.id)
        const newIndex = tasks.findIndex((task) => task.id === over.id)

        return arrayMove(tasks, oldIndex, newIndex)
      })
    }
  }

  return (
    // wag galawin ung className !!! "m-auto w-full h-full"
    <div className="m-auto w-full h-full">
      <ResizablePanelGroup direction="horizontal">

        <ResizablePanel>
          {/* Widget Bar */}
          <div className="flex flex-col gap-2 h-full overflow-y-auto max-w-full px-3 py-1 scrollbar-left">
            <div className="bg-blue/20 rounded-xl p-2 min-h-64">
              <h1>User Profile</h1>
            </div>
            <div className="bg-blue/20 rounded-xl p-2 min-h-54">
              <h1>Service Request Tracker</h1>
            </div>
            <div className="bg-blue/20 rounded-xl p-2 min-h-54">
              <h1>Approval Center</h1>
            </div>
            <div className="bg-blue/20 rounded-xl p-2 min-h-54">
              <h1>Bulletin Board</h1>
            </div>
            <div className="bg-blue/20 rounded-xl p-2 min-h-54">
              <h1>Calendar</h1>
            </div>
            <div className="bg-blue/20 rounded-xl p-2 min-h-54">
              <h1>Advisory Center</h1>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle/>
        <ResizablePanel>
          {/* Main Work Area */}
          <div className="flex flex-col h-full gap-2 p-2">
            <div className="rounded-xl p-2 h-1/2 border border-zinc-400/20 bg-gradient-to-br from-light-blue/10 to-light-blue/20">
              <h1>Service Request Tracker and Approval Center</h1>
            </div>
            <div className="rounded-xl p-4 h-1/2 border border-zinc-400/20 bg-gradient-to-br from-light-blue/10 to-light-blue/20 overflow-hidden flex flex-col">
              <h1 className="text-lg font-semibold mb-4 text-blue">User To do List</h1>
              
              {/* Add New Task Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add new task..."
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30"
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
                      items={tasks.map(task => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {tasks.map(task => (
                          <SortableTask 
                            key={task.id} 
                            task={task} 
                            toggleTask={toggleTask}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  // Fallback for server-side rendering
                  <div className="space-y-2">
                    {tasks.map(task => (
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
                        <span className={`flex-1 text-sm ${
                          task.completed 
                            ? 'line-through text-zinc-500' 
                            : 'text-zinc-800'
                        }`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>

      

      

    </div>
  );
}