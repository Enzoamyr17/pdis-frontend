"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Plus, X, Edit2, ChevronDown, ChevronRight, Calendar, User, Flag, FileText } from 'lucide-react'

interface Column {
  id: string
  name: string
  type: 'text' | 'person' | 'status' | 'priority' | 'date'
  width: number
}

interface Subtask {
  id: number
  task?: string
  assignee?: string
  status?: string
  priority?: string
  date?: string
  notes?: string
  [key: string]: string | number | undefined
}

interface Row {
  id: number
  task?: string
  assignee?: string
  status?: string
  priority?: string
  date?: string
  notes?: string
  subtasks: Subtask[]
  [key: string]: string | number | Subtask[] | undefined
}

interface Group {
  id: string
  name: string
  color: string
  collapsed: boolean
  rows: Row[]
}

interface EditingCell {
  groupId: string
  rowId: number
  columnId: string
  isSubtask: boolean
  parentRowId: number | null
}

const statusColors: Record<string, string> = {
  'Not started': 'bg-gray-100 text-gray-700',
  'Working on it': 'bg-blue-100 text-blue-700',
  'Stuck': 'bg-red-100 text-red-700',
  'Done': 'bg-green-100 text-green-700'
}

const priorityColors: Record<string, string> = {
  'Low': 'bg-gray-100 text-gray-600',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'High': 'bg-orange-100 text-orange-700',
  'Critical': 'bg-red-100 text-red-700'
}

export default function CreationOfPEPModule() {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'task', name: 'Task', type: 'text', width: 250 },
    { id: 'assignee', name: 'Person', type: 'person', width: 120 },
    { id: 'status', name: 'Status', type: 'status', width: 120 },
    { id: 'priority', name: 'Priority', type: 'priority', width: 100 },
    { id: 'date', name: 'Due Date', type: 'date', width: 120 },
    { id: 'notes', name: 'Notes', type: 'text', width: 150 }
  ])

  const [groups, setGroups] = useState<Group[]>([])

  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editingHeader, setEditingHeader] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set<number>())
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  useEffect(() => {
    if ((editingCell || editingGroup) && inputRef.current) {
      inputRef.current.focus()
      if ('select' in inputRef.current) {
        inputRef.current.select()
      }
    }
  }, [editingCell, editingGroup])

  const statusOptions = ['Not started', 'Working on it', 'Stuck', 'Done']
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical']
  const groupColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500']

  const addColumn = () => {
    const newColumn: Column = {
      id: `col_${Date.now()}`,
      name: 'New Column',
      type: 'text',
      width: 120
    }
    setColumns([...columns, newColumn])
  }

  const addGroup = () => {
    const newGroup: Group = {
      id: `group_${Date.now()}`,
      name: 'New Group',
      color: groupColors[groups.length % groupColors.length],
      collapsed: false,
      rows: []
    }
    setGroups([...groups, newGroup])
  }

  const addRow = (groupId: string) => {
    const newRow: Row = {
      id: Date.now(),
      subtasks: [],
      ...columns.reduce((acc, col) => ({
        ...acc,
        [col.id]: col.type === 'status' ? 'Not started' : col.type === 'priority' ? 'Medium' : ''
      }), {})
    }
    
    setGroups(groups.map(group =>
      group.id === groupId 
        ? { ...group, rows: [...group.rows, newRow] }
        : group
    ))
  }

  const addSubtask = (groupId: string, parentRowId: number) => {
    const newSubtask: Subtask = {
      id: Date.now(),
      ...columns.reduce((acc, col) => ({
        ...acc,
        [col.id]: col.type === 'status' ? 'Not started' : col.type === 'priority' ? 'Medium' : ''
      }), {})
    }

    setGroups(groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            rows: group.rows.map(row =>
              row.id === parentRowId
                ? { ...row, subtasks: [...row.subtasks, newSubtask] }
                : row
            )
          }
        : group
    ))
    
    setExpandedRows(prev => new Set([...prev, parentRowId]))
  }

  const deleteColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId))
  }

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId))
  }

  const deleteRow = (groupId: string, rowId: number) => {
    setGroups(groups.map(group =>
      group.id === groupId
        ? { ...group, rows: group.rows.filter(row => row.id !== rowId) }
        : group
    ))
  }

  const deleteSubtask = (groupId: string, parentRowId: number, subtaskId: number) => {
    setGroups(groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            rows: group.rows.map(row =>
              row.id === parentRowId
                ? { ...row, subtasks: row.subtasks.filter(subtask => subtask.id !== subtaskId) }
                : row
            )
          }
        : group
    ))
  }

  const toggleGroup = (groupId: string) => {
    setGroups(groups.map(group =>
      group.id === groupId ? { ...group, collapsed: !group.collapsed } : group
    ))
  }

  const toggleRowExpansion = (rowId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }

  const updateCell = (groupId: string, rowId: number, columnId: string, value: string, isSubtask = false, parentRowId: number | null = null) => {
    setGroups(groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            rows: group.rows.map(row => {
              if (isSubtask && row.id === parentRowId) {
                return {
                  ...row,
                  subtasks: row.subtasks.map(subtask =>
                    subtask.id === rowId ? { ...subtask, [columnId]: value } : subtask
                  )
                }
              }
              return row.id === rowId ? { ...row, [columnId]: value } : row
            })
          }
        : group
    ))
  }

  const updateColumnName = (columnId: string, newName: string) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, name: newName } : col
    ))
  }

  const updateGroupName = (groupId: string, newName: string) => {
    setGroups(groups.map(group =>
      group.id === groupId ? { ...group, name: newName } : group
    ))
  }

  const handleCellClick = (groupId: string, rowId: number, columnId: string, currentValue: string | undefined, isSubtask = false, parentRowId: number | null = null) => {
    setEditingCell({ groupId, rowId, columnId, isSubtask, parentRowId })
    setTempValue(currentValue || '')
  }

  const handleCellSave = () => {
    if (editingCell) {
      updateCell(
        editingCell.groupId,
        editingCell.rowId,
        editingCell.columnId,
        tempValue,
        editingCell.isSubtask,
        editingCell.parentRowId
      )
      setEditingCell(null)
      setTempValue('')
    }
  }

  const handleCellCancel = () => {
    setEditingCell(null)
    setTempValue('')
  }

  const handleGroupEdit = (groupId: string, currentName: string) => {
    setEditingGroup(groupId)
    setTempValue(currentName)
  }

  const handleGroupSave = () => {
    if (editingGroup) {
      updateGroupName(editingGroup, tempValue)
      setEditingGroup(null)
      setTempValue('')
    }
  }

  const renderCell = (row: Row | Subtask, column: Column, groupId: string, isSubtask = false) => {
    const isEditing = editingCell?.groupId === groupId && 
                     editingCell?.rowId === row.id && 
                     editingCell?.columnId === column.id &&
                     editingCell?.isSubtask === isSubtask
    const value = (row[column.id] as string) || ''

    if (isEditing) {
      if (column.type === 'status') {
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleCellSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCellSave()
              if (e.key === 'Escape') handleCellCancel()
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      }

      if (column.type === 'priority') {
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleCellSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCellSave()
              if (e.key === 'Escape') handleCellCancel()
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
          >
            {priorityOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      }

      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={column.type === 'date' ? 'date' : 'text'}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleCellSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCellSave()
            if (e.key === 'Escape') handleCellCancel()
          }}
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
        />
      )
    }

    if (column.type === 'status') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-600'}`}>
          {value}
        </span>
      )
    }

    if (column.type === 'priority') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[value] || 'bg-gray-100 text-gray-600'}`}>
          {value}
        </span>
      )
    }

    if (column.type === 'person') {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {value?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="text-sm">{value}</span>
        </div>
      )
    }

    return (
      <span className="text-sm text-gray-800">{value}</span>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <FileText className="h-6 w-6 text-blue" />
        <h1 className="text-xl font-semibold text-gray-900">Creation of PEP</h1>
      </div>
      
      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">PEP Project Board</h2>
            <p className="text-gray-600">Manage your PEP tasks with groups and subtasks</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="flex bg-gray-50 border-b sticky top-0 z-10">
              <div className="w-8 flex-shrink-0 border-r border-gray-200"></div>
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="border-r border-gray-200 p-3 font-medium text-gray-700 relative group"
                  style={{ minWidth: column.width }}
                >
                  {editingHeader === column.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => {
                          updateColumnName(column.id, tempValue)
                          setEditingHeader(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateColumnName(column.id, tempValue)
                            setEditingHeader(null)
                          }
                          if (e.key === 'Escape') setEditingHeader(null)
                        }}
                        className="flex-1 px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        {column.type === 'person' && <User size={14} />}
                        {column.type === 'date' && <Calendar size={14} />}
                        {column.type === 'priority' && <Flag size={14} />}
                        <span>{column.name}</span>
                      </span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2
                          size={14}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                          onClick={() => {
                            setEditingHeader(column.id)
                            setTempValue(column.name)
                          }}
                        />
                        {columns.length > 1 && (
                          <X
                            size={14}
                            className="text-gray-400 hover:text-red-600 cursor-pointer"
                            onClick={() => deleteColumn(column.id)}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="p-3">
                <button
                  onClick={addColumn}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
                >
                  <Plus size={14} />
                  <span>Add Column</span>
                </button>
              </div>
            </div>

            {groups.map((group) => (
              <div key={group.id}>
                <div className={`flex items-center ${group.color} text-white p-3 group cursor-pointer`}>
                  <div className="w-8 flex-shrink-0 flex justify-center">
                    <button onClick={() => toggleGroup(group.id)}>
                      {group.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    {editingGroup === group.id ? (
                      <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={handleGroupSave}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleGroupSave()
                          if (e.key === 'Escape') setEditingGroup(null)
                        }}
                        className="bg-white text-gray-900 px-2 py-1 rounded text-sm focus:outline-none"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{group.name}</span>
                        <span className="text-xs opacity-75">({group.rows.length} items)</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2
                        size={14}
                        className="hover:bg-white hover:bg-opacity-20 p-1 rounded cursor-pointer"
                        onClick={() => handleGroupEdit(group.id, group.name)}
                      />
                      <Plus
                        size={14}
                        className="hover:bg-white hover:bg-opacity-20 p-1 rounded cursor-pointer"
                        onClick={() => addRow(group.id)}
                      />
                      {groups.length > 1 && (
                        <X
                          size={14}
                          className="hover:bg-white hover:bg-opacity-20 p-1 rounded cursor-pointer"
                          onClick={() => deleteGroup(group.id)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {!group.collapsed && group.rows.map((row, rowIndex) => (
                  <div key={row.id}>
                    <div className="flex hover:bg-gray-50 group border-b border-gray-100">
                      <div className="w-8 flex-shrink-0 border-r border-gray-200 p-2 text-center text-xs text-gray-400 bg-gray-50">
                        <div className="flex items-center justify-center h-full relative">
                          <span>{rowIndex + 1}</span>
                          <div className="absolute right-0 top-0 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => addSubtask(group.id, row.id)}
                              title="Add subtask"
                              className="p-0 hover:bg-transparent"
                            >
                              <Plus
                                size={10}
                                className="text-gray-400 hover:text-blue-500 cursor-pointer"
                              />
                            </button>
                            <button
                              onClick={() => deleteRow(group.id, row.id)}
                              title="Delete row"
                              className="p-0 hover:bg-transparent"
                            >
                              <X
                                size={10}
                                className="text-gray-400 hover:text-red-500 cursor-pointer"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      {columns.map((column) => (
                        <div
                          key={column.id}
                          className="border-r border-gray-200 p-3 cursor-pointer hover:bg-blue-50 flex items-center"
                          style={{ minWidth: column.width }}
                          onClick={() => handleCellClick(group.id, row.id, column.id, row[column.id] as string)}
                        >
                          {column.id === 'task' && row.subtasks?.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleRowExpansion(row.id)
                              }}
                              className="mr-2 p-1 hover:bg-gray-200 rounded"
                            >
                              {expandedRows.has(row.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          )}
                          {renderCell(row, column, group.id)}
                        </div>
                      ))}
                      <div className="p-3 flex-1"></div>
                    </div>

                    {expandedRows.has(row.id) && row.subtasks?.map((subtask) => (
                      <div key={subtask.id} className="flex hover:bg-blue-25 bg-blue-50 group border-b border-gray-100">
                        <div className="w-8 flex-shrink-0 border-r border-gray-200 p-2 text-center text-xs text-gray-400 bg-gray-100">
                          <div className="flex items-center justify-center h-full relative">
                            <span className="text-xs">↳</span>
                            <button
                              onClick={() => deleteSubtask(group.id, row.id, subtask.id)}
                              title="Delete subtask"
                              className="absolute right-0 top-0 p-0 hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X
                                size={10}
                                className="text-gray-400 hover:text-red-500 cursor-pointer"
                              />
                            </button>
                          </div>
                        </div>
                        {columns.map((column) => (
                          <div
                            key={column.id}
                            className="border-r border-gray-200 p-3 cursor-pointer hover:bg-blue-100"
                            style={{ minWidth: column.width, paddingLeft: column.id === 'task' ? '2rem' : '0.75rem' }}
                            onClick={() => handleCellClick(group.id, subtask.id, column.id, subtask[column.id] as string, true, row.id)}
                          >
                            {renderCell(subtask, column, group.id, true)}
                          </div>
                        ))}
                        <div className="p-3 flex-1"></div>
                      </div>
                    ))}
                  </div>
                ))}

                {!group.collapsed && (
                  <div className="flex bg-gray-25 border-b border-gray-200">
                    <div className="w-8 flex-shrink-0 border-r border-gray-200"></div>
                    <div className="p-3">
                      <button
                        onClick={() => addRow(group.id)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 text-sm"
                      >
                        <Plus size={16} />
                        <span>Add Item</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="p-4 border-t">
              <button
                onClick={addGroup}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                <Plus size={16} />
                <span>Add Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}