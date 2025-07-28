"use client"

import { useState } from "react"
import { Shield, User, Search, CheckCircle, Edit, Users, Copy, RotateCcw } from "lucide-react"
import { moduleRegistry } from "./modules/ModuleRegistry"

interface UserPermission {
  userId: string
  moduleId: string
  roles: ('requestor' | 'approver')[]
}

interface UserPermissionsTabProps {
  className?: string
}

export default function UserPermissionsTab({ className = "" }: UserPermissionsTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [massEditMode, setMassEditMode] = useState(false)
  const [copyFromUser, setCopyFromUser] = useState<string>("")

  // Mock users from UserContext (we'll need to expose all users, not just current user)
  const mockUsers = [
    {
      id: 'PDID14-00001',
      name: 'Von Aaron Torres Mauleon',
      position: 'President and Chief Executive Officer',
      email: 'von.mauleon@projectduo.com.ph'
    },
    {
      id: 'PDID18-00045',
      name: 'Alma Vida Mauleon Gerado',
      position: 'Director for Administrative Support Group',
      email: 'vida.gerado@projectduo.com.ph'
    },
    {
      id: 'PDID18-00039',
      name: 'Julie Anne Ingao Mendoza',
      position: 'Associate Head for Business Unit 1',
      email: 'julie.mendoza@projectduo.com.ph'
    }
  ]

  // Get all modules from the registry
  const allModules = Object.values(moduleRegistry)

  // Filter users based on search term
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get user's permissions for a specific module
  const getUserPermissions = (userId: string, moduleId: string): ('requestor' | 'approver')[] => {
    const permission = permissions.find(p => p.userId === userId && p.moduleId === moduleId)
    return permission?.roles || []
  }

  // Check if user has a specific role for a module
  const hasRole = (userId: string, moduleId: string, role: 'requestor' | 'approver'): boolean => {
    const userPermissions = getUserPermissions(userId, moduleId)
    return userPermissions.includes(role)
  }

  // Toggle user role for a module
  const toggleRole = (userId: string, moduleId: string, role: 'requestor' | 'approver') => {
    setPermissions(prev => {
      const existing = prev.find(p => p.userId === userId && p.moduleId === moduleId)
      if (existing) {
        const newRoles = existing.roles.includes(role)
          ? existing.roles.filter(r => r !== role)
          : [...existing.roles, role]
        
        if (newRoles.length === 0) {
          // Remove permission entry if no roles remain
          return prev.filter(p => !(p.userId === userId && p.moduleId === moduleId))
        } else {
          return prev.map(p => 
            p.userId === userId && p.moduleId === moduleId 
              ? { ...p, roles: newRoles }
              : p
          )
        }
      } else {
        // Create new permission with the role
        return [...prev, { userId, moduleId, roles: [role] }]
      }
    })
  }

  // Mass edit functions
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(user => user.id))
  }

  const clearUserSelection = () => {
    setSelectedUsers([])
  }

  const massSetRole = (moduleId: string, role: 'requestor' | 'approver', enable: boolean) => {
    selectedUsers.forEach(userId => {
      setPermissions(prev => {
        const existing = prev.find(p => p.userId === userId && p.moduleId === moduleId)
        if (existing) {
          const newRoles = enable
            ? existing.roles.includes(role) ? existing.roles : [...existing.roles, role]
            : existing.roles.filter(r => r !== role)
          
          if (newRoles.length === 0) {
            return prev.filter(p => !(p.userId === userId && p.moduleId === moduleId))
          } else {
            return prev.map(p => 
              p.userId === userId && p.moduleId === moduleId 
                ? { ...p, roles: newRoles }
                : p
            )
          }
        } else if (enable) {
          return [...prev, { userId, moduleId, roles: [role] }]
        } else {
          return prev
        }
      })
    })
  }

  const massClearAllRoles = (moduleId: string) => {
    selectedUsers.forEach(userId => {
      setPermissions(prev => 
        prev.filter(p => !(p.userId === userId && p.moduleId === moduleId))
      )
    })
  }

  const copyPermissionsFromUser = (fromUserId: string, toUserIds: string[]) => {
    const fromUserPermissions = permissions.filter(p => p.userId === fromUserId)
    
    toUserIds.forEach(toUserId => {
      fromUserPermissions.forEach(permission => {
        setPermissions(prev => {
          const existing = prev.find(p => p.userId === toUserId && p.moduleId === permission.moduleId)
          if (existing) {
            return prev.map(p => 
              p.userId === toUserId && p.moduleId === permission.moduleId 
                ? { ...p, roles: [...permission.roles] }
                : p
            )
          } else {
            return [...prev, { userId: toUserId, moduleId: permission.moduleId, roles: [...permission.roles] }]
          }
        })
      })
    })
  }

  const resetPermissions = (userIds: string[]) => {
    setPermissions(prev => 
      prev.filter(p => !userIds.includes(p.userId))
    )
  }

  // Helper functions for mass edit visual feedback
  const getMassEditRoleState = (moduleId: string, role: 'requestor' | 'approver'): 'all' | 'some' | 'none' => {
    if (selectedUsers.length === 0) return 'none'
    
    const usersWithRole = selectedUsers.filter(userId => hasRole(userId, moduleId, role))
    
    if (usersWithRole.length === selectedUsers.length) return 'all'
    if (usersWithRole.length > 0) return 'some'
    return 'none'
  }

  const toggleMassRole = (moduleId: string, role: 'requestor' | 'approver') => {
    const currentState = getMassEditRoleState(moduleId, role)
    const shouldEnable = currentState !== 'all'
    massSetRole(moduleId, role, shouldEnable)
  }

  const inputClasses = "w-full bg-white/90 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"

  return (
    <div className={`bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border ${className} min-w-[32rem]`}>
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue" />
          <h2 className="text-xl font-semibold text-blue">User Permissions Management</h2>
        </div>
        <p className="text-blue text-sm">
          Manage user permissions for different modules. Users can have multiple roles - they can be both requestors and approvers for each module.
        </p>
      </div>

      {/* Edit Mode Selection */}
      <div className="flex justify-between items-center gap-4 w-[28rem] pl-8">
        <label className="block text-sm font-semibold text-blue">Edit Mode</label>
          <button
            onClick={() => {
              setMassEditMode(false)
              setSelectedUsers([])
            }}
            className={` px-2 min-w-36 py-2 flex gap-2 justify-center items-center rounded-lg ${
              !massEditMode
                ? 'bg-blue text-white border-blue'
                : 'bg-white text-blue border-gray-300 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4" />
            Single
          </button>
          <button
            onClick={() => {
              setMassEditMode(true)
              setSelectedUser("")
            }}
            className={` px-2 min-w-36 py-2 flex gap-2 justify-center items-center rounded-lg ${
              massEditMode
                ? 'bg-blue text-white border-blue'
                : 'bg-white text-blue border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Mass
          </button>
      </div>

      <div className="p-6">
        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-lg font-semibold text-blue mb-2">Search Users</label>
              <div className="relative">
                <Search className="w-4 h-4 text-blue absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, email, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClasses} pl-10 max-w-[32rem]`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mass Edit Controls */}
        {massEditMode && (
          <div className="mb-6 p-4 bg-white border border-light-blue/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue/90">Mass Edit Mode</h4>
              <div className="flex gap-2">
                <button
                  onClick={selectAllUsers}
                  className="text-sm text-blue/90 hover:text-blue font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={clearUserSelection}
                  className="text-sm text-blue/90 hover:text-blue font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue/90 mb-2">Copy Permissions From</label>
                <select
                  value={copyFromUser}
                  onChange={(e) => setCopyFromUser(e.target.value)}
                  className={inputClasses}
                >
                  <option value="">Select user to copy from</option>
                  {filteredUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    if (copyFromUser && selectedUsers.length > 0) {
                      copyPermissionsFromUser(copyFromUser, selectedUsers)
                      alert(`Copied permissions from ${filteredUsers.find(u => u.id === copyFromUser)?.name} to ${selectedUsers.length} users`)
                    }
                  }}
                  disabled={!copyFromUser || selectedUsers.length === 0}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Copy className="w-4 h-4 inline mr-1" />
                  Copy
                </button>
                <button
                  onClick={() => {
                    if (selectedUsers.length > 0) {
                      resetPermissions(selectedUsers)
                      alert(`Reset permissions for ${selectedUsers.length} users`)
                    }
                  }}
                  disabled={selectedUsers.length === 0}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  Reset
                </button>
              </div>
            </div>
            {selectedUsers.length > 0 && (
              <div className="mt-3 p-2 bg-white rounded border">
                <p className="text-sm text-blue">
                  <strong>{selectedUsers.length}</strong> user{selectedUsers.length !== 1 ? 's' : ''} selected for mass editing
                </p>
              </div>
            )}
          </div>
        )}

        {/* Users List */}
        <div className="flex flex-col mb-6">
          <h3 className="text-lg font-semibold text-blue mb-4">Current Users</h3>
          <div className="m-auto flex flex-wrap justify-start items-start gap-1 overflow-y-auto max-h-[15rem] max-w-[59rem] min-w-[29rem]">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className={`p-1 px-3 border rounded-full cursor-pointer transition-all w-[24rem] ${
                  massEditMode
                    ? selectedUsers.includes(user.id)
                      ? 'border-blue bg-blue'
                      : 'border-light-blue/50 bg-white hover:border-gray-300'
                    : selectedUser === user.id
                      ? 'border-blue bg-blue'
                      : 'border-light-blue/50 bg-white hover:border-gray-300'
                }`}
                onClick={() => massEditMode ? toggleUserSelection(user.id) : setSelectedUser(user.id)}
              >
                <div className="flex items-start gap-2">
                  {massEditMode && (
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="m-auto ml-2 size-5 appearance-none rounded-full border-2 border-gray-300 bg-white checked:bg-blue checked:border-white focus:ring-2 focus:ring-blue/20 cursor-pointer relative before:content-['✓'] before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-white before:text-xs before:font-bold before:opacity-0 checked:before:opacity-100 duration-400"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <div className="m-auto w-7 h-7 bg-orange/80 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue/80" />
                  </div>
                  <div className="flex-1 text-sm min-w-0">
                    <h4 className={`font-semibold truncate
                      ${massEditMode
                        ? selectedUsers.includes(user.id)
                          ? 'text-white'
                          : 'text-blue/90'
                        : selectedUser === user.id
                          ? 'text-white'
                          : 'text-blue/90'
                      }`}>{user.name}</h4>
                    <p className={`truncate
                      ${massEditMode
                        ? selectedUsers.includes(user.id)
                          ? 'text-white'
                          : 'text-blue/90'
                        : selectedUser === user.id
                          ? 'text-white'
                          : 'text-blue/90'
                      }`}>{user.position}</p>
                  </div>
                  {massEditMode && selectedUsers.includes(user.id) && (
                    <CheckCircle className="w-4 h-4 text-blue" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Permissions Table */}
        {(selectedUser || (massEditMode && selectedUsers.length > 0)) && (
          <div>
            <h3 className="text-lg font-semibold text-blue mb-4">
              {massEditMode 
                ? `Module Permissions for ${selectedUsers.length} Selected User${selectedUsers.length !== 1 ? 's' : ''}`
                : `Module Permissions for ${filteredUsers.find(u => u.id === selectedUser)?.name}`
              }
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue border-b">Module</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-blue border-b">
                      Clear All
                      {massEditMode && (
                        <div className="mt-1">
                          <button
                            onClick={() => allModules.forEach(module => massClearAllRoles(module.id))}
                            className="text-xs text-red-600 hover:text-red-800 font-normal"
                          >
                            All
                          </button>
                        </div>
                      )}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-blue border-b">
                      Requestor
                      {massEditMode && (
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length > 0 && allModules.every(module => getMassEditRoleState(module.id, 'requestor') === 'all')}
                            ref={(el) => {
                              if (el && selectedUsers.length > 0) {
                                const states = allModules.map(module => getMassEditRoleState(module.id, 'requestor'))
                                const hasAll = states.every(state => state === 'all')
                                const hasNone = states.every(state => state === 'none')
                                el.indeterminate = !hasAll && !hasNone
                              }
                            }}
                            onChange={() => {
                              const shouldEnable = !allModules.every(module => getMassEditRoleState(module.id, 'requestor') === 'all')
                              allModules.forEach(module => massSetRole(module.id, 'requestor', shouldEnable))
                            }}
                            className="w-4 h-4 text-blue focus:ring-blue border-gray-300 rounded"
                            disabled={selectedUsers.length === 0}
                          />
                        </div>
                      )}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-blue border-b">
                      Approver
                      {massEditMode && (
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length > 0 && allModules.every(module => getMassEditRoleState(module.id, 'approver') === 'all')}
                            ref={(el) => {
                              if (el && selectedUsers.length > 0) {
                                const states = allModules.map(module => getMassEditRoleState(module.id, 'approver'))
                                const hasAll = states.every(state => state === 'all')
                                const hasNone = states.every(state => state === 'none')
                                el.indeterminate = !hasAll && !hasNone
                              }
                            }}
                            onChange={() => {
                              const shouldEnable = !allModules.every(module => getMassEditRoleState(module.id, 'approver') === 'all')
                              allModules.forEach(module => massSetRole(module.id, 'approver', shouldEnable))
                            }}
                            className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            disabled={selectedUsers.length === 0}
                          />
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allModules.map(module => {
                    const userPermissions = massEditMode ? [] : getUserPermissions(selectedUser, module.id)
                    const hasRequestor = massEditMode ? false : hasRole(selectedUser, module.id, 'requestor')
                    const hasApprover = massEditMode ? false : hasRole(selectedUser, module.id, 'approver')
                    
                    return (
                      <tr key={module.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-blue/90">
                          {module.title}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {massEditMode ? (
                            <button
                              onClick={() => massClearAllRoles(module.id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Clear All
                            </button>
                          ) : (
                            <span className="text-sm text-blue">
                              {userPermissions.length === 0 ? 'No Access' : 'Has Access'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {massEditMode ? (
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={getMassEditRoleState(module.id, 'requestor') === 'all'}
                                ref={(el) => {
                                  if (el) el.indeterminate = getMassEditRoleState(module.id, 'requestor') === 'some'
                                }}
                                onChange={() => toggleMassRole(module.id, 'requestor')}
                                className="w-4 h-4 text-blue focus:ring-blue border-gray-300 rounded"
                                disabled={selectedUsers.length === 0}
                              />
                            </div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={hasRequestor}
                              onChange={() => toggleRole(selectedUser, module.id, 'requestor')}
                              className="w-4 h-4 text-blue focus:ring-blue border-gray-300 rounded"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {massEditMode ? (
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={getMassEditRoleState(module.id, 'approver') === 'all'}
                                ref={(el) => {
                                  if (el) el.indeterminate = getMassEditRoleState(module.id, 'approver') === 'some'
                                }}
                                onChange={() => toggleMassRole(module.id, 'approver')}
                                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                disabled={selectedUsers.length === 0}
                              />
                            </div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={hasApprover}
                              onChange={() => toggleRole(selectedUser, module.id, 'approver')}
                              className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Save Changes Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  if (massEditMode) {
                    console.log('Saving mass permissions:', permissions.filter(p => selectedUsers.includes(p.userId)))
                    alert(`Permissions saved for ${selectedUsers.length} users successfully!`)
                  } else {
                    console.log('Saving permissions:', permissions.filter(p => p.userId === selectedUser))
                    alert('Permissions saved successfully!')
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-white font-medium rounded-lg hover:bg-blue focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {massEditMode ? `Save Permissions (${selectedUsers.length} users)` : 'Save Permissions'}
              </button>
            </div>
          </div>
        )}

        {/* Summary Section */}
        {permissions.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-blue mb-2">Permissions Summary</h4>
            <div className="text-sm text-blue">
              <p>Total permissions configured: <span className="font-medium">{permissions.length}</span></p>
              <p>Users with permissions: <span className="font-medium">{new Set(permissions.map(p => p.userId)).size}</span></p>
              <p>Modules with permissions: <span className="font-medium">{new Set(permissions.map(p => p.moduleId)).size}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}