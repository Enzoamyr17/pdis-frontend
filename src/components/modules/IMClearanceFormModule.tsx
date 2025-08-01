"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { FileText, Save, Plus, Trash2, Building, User, CreditCard, Edit, Search, BookmarkPlus } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface IMClearanceFormData {
  referenceNumber: string
  projectId: string
  projectName: string
  ceId: string
  cepdNumber: string
  clearanceRequestor: string
  department: string
  group: string
  dateOfRequest: string
  targetReleaseDate: string
  coverageFromDate: string
  coverageToDate: string
  clearanceRequestorRemarks: string
  clearanceReviewerRemarks: string
  clearanceApproverRemarks: string
  hrdRemarks: string
}

interface Project {
  id: string
  projectID: string
  projectName: string
  displayName: string
  type: string
  brand: string
  projectDate: string
  projectVenue: string
  internalBudgetInitial: number
  internalBudgetCurrent: number
  ces: CE[]
}

interface CE {
  id: string
  ceID: string
  cepdNumber: string
  version: string
  displayName: string
}

interface IMPersonnel {
  id: string
  registeredName: string
  position: string
  outletVenue: string
  packagedFee: number
  dailyFees: {
    monday: number
    tuesday: number
    wednesday: number
    thursday: number
    friday: number
    saturday: number
    sunday: number
  }
  ownGcash: string
  authGcash: string
  authGcashAccName: string
  isSaved: boolean
}

interface IMSearchResult {
  id: string
  imNumber: string
  firstName: string
  middleName: string
  lastName: string
  fullName: string
  ownGcash: string | null
  authorizedGcash: string | null
  authorizedReceiver: string | null
}


export default function IMClearanceFormModule() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState<IMClearanceFormData>({
    referenceNumber: '',
    projectId: '',
    projectName: '',
    ceId: '',
    cepdNumber: '',
    clearanceRequestor: '',
    department: '',
    group: '',
    dateOfRequest: new Date().toISOString().split('T')[0],
    targetReleaseDate: '',
    coverageFromDate: '',
    coverageToDate: '',
    clearanceRequestorRemarks: '',
    clearanceReviewerRemarks: '',
    clearanceApproverRemarks: '',
    hrdRemarks: ''
  })

  const [projects, setProjects] = useState<Project[]>([])
  const [availableCEs, setAvailableCEs] = useState<CE[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isLoadingCEs, setIsLoadingCEs] = useState(false)

  const [personnelList, setPersonnelList] = useState<IMPersonnel[]>([
    {
      id: '1',
      registeredName: '',
      position: '',
      outletVenue: '',
      packagedFee: 0,
      dailyFees: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      },
      ownGcash: '',
      authGcash: '',
      authGcashAccName: '',
      isSaved: false
    }
  ])

  const [searchResults, setSearchResults] = useState<{ [key: string]: IMSearchResult[] }>({})
  const [showDropdown, setShowDropdown] = useState<{ [key: string]: boolean }>({})
  const [searchTimeouts, setSearchTimeouts] = useState<{ [key: string]: NodeJS.Timeout }>({})
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [isDraftSaved, setIsDraftSaved] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

  // Remove unused handler
  // const handleSaveDraft = () => { ... } - replaced by handleSaveAsDraft

  // Format functions to match UserProfile.tsx
  const formatGroup = (group: string | null) => {
    if (!group) return 'Not specified'
    switch (group) {
      case 'ASG':
        return 'Administrative Support Group'
      case 'AFG':
        return 'Accounting Finance Group'
      case 'SOG':
        return 'Sales and Operations Group'
      case 'CG':
        return 'Creatives Group'
      default:
        return group
    }
  }

  const formatDepartment = (department: string | null) => {
    if (!department) return 'Not specified'
    switch (department) {
      case 'ASSETS_AND_PROPERTY_MANAGEMENT':
        return 'Assets and Property Management'
      case 'PEOPLE_MANAGEMENT':
        return 'People Management'
      case 'ACCOUNTS_PAYABLE':
        return 'Accounts Payable'
      case 'ACCOUNTS_RECEIVABLE':
        return 'Accounts Receivable'
      case 'TREASURY':
        return 'Treasury'
      case 'BUSINESS_UNIT_1':
        return 'Business Unit 1'
      case 'BUSINESS_UNIT_2':
        return 'Business Unit 2'
      case 'BUSINESS_DEVELOPMENT':
        return 'Business Development'
      case 'DESIGN_AND_MULTIMEDIA':
        return 'Design and Multimedia'
      case 'COPY_AND_DIGITAL':
        return 'Copy and Digital'
      default:
        return department.replace(/_/g, ' ')
    }
  }

  const loadUserDetails = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        setFormData(prev => ({
          ...prev,
          clearanceRequestor: session?.user?.name || '',
          department: formatDepartment(userData.department),
          group: formatGroup(userData.group)
        }))
      } else {
        // Fallback: just set the requestor name
        setFormData(prev => ({
          ...prev,
          clearanceRequestor: session?.user?.name || ''
        }))
      }
    } catch (error) {
      console.error('Error loading user details:', error)
      // Fallback: just set the requestor name
      setFormData(prev => ({
        ...prev,
        clearanceRequestor: session?.user?.name || ''
      }))
    }
  }, [session?.user?.name])

  // Load projects and user data on component mount
  useEffect(() => {
    if (session?.user) {
      loadProjects()
      loadUserDetails()
    }
  }, [session, loadUserDetails])

  const loadProjects = async () => {
    setIsLoadingProjects(true)
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      } else {
        toast.error('Failed to load projects')
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Error loading projects')
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const loadCEsForProject = async (projectId: string) => {
    if (!projectId) {
      setAvailableCEs([])
      return
    }
    
    setIsLoadingCEs(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/ces`)
      if (response.ok) {
        const data = await response.json()
        setAvailableCEs(data.ces)
      } else {
        toast.error('Failed to load CEs for this project')
        setAvailableCEs([])
      }
    } catch (error) {
      console.error('Error loading CEs:', error)
      toast.error('Error loading CEs')
      setAvailableCEs([])
    } finally {
      setIsLoadingCEs(false)
    }
  }

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value
    const project = projects.find(p => p.id === projectId)
    
    setSelectedProject(project || null)
    setFormData(prev => ({
      ...prev,
      projectId,
      projectName: project?.displayName || '',
      ceId: '',
      cepdNumber: ''
    }))
    
    if (projectId) {
      loadCEsForProject(projectId)
    } else {
      setAvailableCEs([])
    }
  }

  const handleCEChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ceId = e.target.value
    const ce = availableCEs.find(c => c.id === ceId)
    
    setFormData(prev => ({
      ...prev,
      ceId,
      cepdNumber: ce?.displayName || ''
    }))
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'coverageFromDate') {
      const selectedDate = new Date(value)
      const sunday = new Date(selectedDate)
      sunday.setDate(selectedDate.getDate() + 6)
      const sundayString = sunday.toISOString().split('T')[0]
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        coverageToDate: sundayString
      }))
      return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const isMonday = (dateString: string) => {
    if (!dateString) return false
    const date = new Date(dateString)
    return date.getDay() === 1
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) return
    
    const selectedDate = new Date(value)
    const dayOfWeek = selectedDate.getDay()
    
    // Only allow Mondays
    if (dayOfWeek !== 1) {
      e.preventDefault()
      toast.error('Please select a Monday. Only Mondays are allowed for the Coverage From Date.')
      // Clear the input
      setFormData(prev => ({ 
        ...prev, 
        coverageFromDate: '',
        coverageToDate: ''
      }))
      return false
    }
    
    handleInputChange(e)
  }

  const handlePersonnelChange = (id: string, field: keyof IMPersonnel, value: string | number | IMPersonnel['dailyFees']) => {
    setPersonnelList(prev => prev.map(person => 
      person.id === id ? { ...person, [field]: value } : person
    ))
  }

  const addPersonnel = () => {
    // Check if all existing personnel are saved
    const hasUnsavedPersonnel = personnelList.some(person => !person.isSaved)
    if (hasUnsavedPersonnel) {
      toast.error('Please save all existing IM entries before adding a new one.')
      return
    }

    const newPersonnel: IMPersonnel = {
      id: Date.now().toString(),
      registeredName: '',
      position: '',
      outletVenue: '',
      packagedFee: 0,
      dailyFees: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      },
      ownGcash: '',
      authGcash: '',
      authGcashAccName: '',
      isSaved: false
    }
    setPersonnelList(prev => [...prev, newPersonnel])
  }

  const removePersonnel = (id: string) => {
    if (personnelList.length > 1) {
      setPersonnelList(prev => prev.filter(person => person.id !== id))
    }
  }

  const savePersonnel = (id: string) => {
    const person = personnelList.find(p => p.id === id)
    if (!person) return

    // Validate required fields
    if (!person.registeredName || !person.position || !person.outletVenue) {
      toast.error('Please fill in all required fields (Registered Name, Position, Outlet/Venue) before saving.')
      return
    }

    // Check if either packaged fee or at least one daily fee is filled
    const hasFees = person.packagedFee > 0 || Object.values(person.dailyFees).some(fee => fee > 0)
    if (!hasFees) {
      toast.error('Please enter either a packaged fee or daily fees before saving.')
      return
    }

    setPersonnelList(prev => prev.map(p => 
      p.id === id ? { ...p, isSaved: true } : p
    ))
    toast.success(`IM #${personnelList.findIndex(p => p.id === id) + 1} saved successfully!`)
  }

  const editPersonnel = (id: string) => {
    setPersonnelList(prev => prev.map(p => 
      p.id === id ? { ...p, isSaved: false } : p
    ))
  }

  const searchIM = async (query: string, personnelId: string) => {
    if (query.length < 2) {
      setSearchResults(prev => ({ ...prev, [personnelId]: [] }))
      setShowDropdown(prev => ({ ...prev, [personnelId]: false }))
      return
    }

    try {
      const response = await fetch(`/api/im/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const results: IMSearchResult[] = await response.json()
        setSearchResults(prev => ({ ...prev, [personnelId]: results }))
        setShowDropdown(prev => ({ ...prev, [personnelId]: results.length > 0 }))
      }
    } catch (error) {
      console.error('Error searching IMs:', error)
    }
  }

  const handleNameSearch = (personnelId: string, value: string) => {
    // Clear any existing timeout
    if (searchTimeouts[personnelId]) {
      clearTimeout(searchTimeouts[personnelId])
    }

    // Update the input value immediately
    handlePersonnelChange(personnelId, 'registeredName', value)

    // Set a new timeout for search
    const timeout = setTimeout(() => {
      searchIM(value, personnelId)
    }, 300)

    setSearchTimeouts(prev => ({ ...prev, [personnelId]: timeout }))
  }

  const selectIM = (personnelId: string, im: IMSearchResult) => {
    setPersonnelList(prev => prev.map(person => 
      person.id === personnelId ? {
        ...person,
        registeredName: im.fullName,
        ownGcash: im.ownGcash || '',
        authGcash: im.authorizedGcash || '',
        authGcashAccName: im.authorizedReceiver || ''
      } : person
    ))
    setShowDropdown(prev => ({ ...prev, [personnelId]: false }))
    setSearchResults(prev => ({ ...prev, [personnelId]: [] }))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownRefs.current).forEach(personnelId => {
        const ref = dropdownRefs.current[personnelId]
        if (ref && !ref.contains(event.target as Node)) {
          setShowDropdown(prev => ({ ...prev, [personnelId]: false }))
        }
      })
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])



  const calculateTotalFees = () => {
    return personnelList.reduce((total, person) => {
      const weeklyTotal = Object.values(person.dailyFees).reduce((sum, fee) => sum + fee, 0)
      return total + person.packagedFee + weeklyTotal
    }, 0)
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that all personnel are saved
    const hasUnsavedPersonnel = personnelList.some(person => !person.isSaved)
    if (hasUnsavedPersonnel) {
      toast.error('Please save all IM personnel entries before submitting the form.')
      return
    }

    // Validate required fields
    if (!formData.projectId || !formData.ceId || !formData.targetReleaseDate || !formData.coverageFromDate) {
      toast.error('Please fill in all required fields.')
      return
    }
    
    try {
      const response = await fetch('/api/imcf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: formData.projectId,
          ceId: formData.ceId,
          targetReleaseDate: formData.targetReleaseDate,
          coverageFromDate: formData.coverageFromDate,
          coverageToDate: formData.coverageToDate,
          clearanceRequestorRemarks: formData.clearanceRequestorRemarks,
          personnel: personnelList.map(person => ({
            registeredName: person.registeredName,
            position: person.position,
            outletVenue: person.outletVenue,
            packagedFee: person.packagedFee,
            dailyFees: person.dailyFees,
            ownGcash: person.ownGcash,
            authGcash: person.authGcash,
            authGcashAccName: person.authGcashAccName
          })),
          isDraft: false
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Update form data with the generated reference number
        setFormData(prev => ({
          ...prev,
          referenceNumber: result.imcfForm.referenceNumber
        }))
        
        // Clear draft from localStorage if it exists
        localStorage.removeItem(`imcf_draft_${formData.referenceNumber}`)
        
        toast.success(`IMCF submitted successfully! Reference: ${result.imcfForm.referenceNumber}`)
        
        // Reset form or redirect as needed
        // You might want to redirect to a success page or reset the form
      } else {
        toast.error(result.error || 'Failed to submit IMCF form')
      }
    } catch (error) {
      console.error('Error submitting IMCF:', error)
      toast.error('Error submitting IMCF form')
    }
  }

  const handleSaveAsDraft = async () => {
    try {
      const response = await fetch('/api/imcf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: formData.projectId,
          ceId: formData.ceId,
          targetReleaseDate: formData.targetReleaseDate,
          coverageFromDate: formData.coverageFromDate,
          coverageToDate: formData.coverageToDate,
          clearanceRequestorRemarks: formData.clearanceRequestorRemarks,
          personnel: personnelList
            .filter(person => person.registeredName || person.position || person.outletVenue)
            .map(person => ({
              registeredName: person.registeredName,
              position: person.position,
              outletVenue: person.outletVenue,
              packagedFee: person.packagedFee,
              dailyFees: person.dailyFees,
              ownGcash: person.ownGcash,
              authGcash: person.authGcash,
              authGcashAccName: person.authGcashAccName
            })),
          isDraft: true
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Update form data with the generated reference number
        setFormData(prev => ({
          ...prev,
          referenceNumber: result.imcfForm.referenceNumber
        }))
        
        setIsDraftSaved(true)
        setLastSavedTime(new Date())
        toast.success('Draft saved successfully!')
      } else {
        toast.error(result.error || 'Failed to save draft')
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Error saving draft')
    }
  }

  const inputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"
  const disabledInputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed"
  const labelClasses = "block text-xs font-medium text-blue/90 mb-1"

  return (
    <div className="h-full p-4 overflow-auto min-w-[32rem]">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-blue" />
        <h1 className="text-2xl font-semibold text-blue/90">Independent Manpower Clearance Form</h1>
      </div>
      
      <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Reference and Project Information */}
          <div className="flex flex-col gap-2 p-3 bg-white/50 rounded border">
            <div className="flex items-center gap-2 mb-2 w-full">
              <Building className="w-4 h-4 text-blue" />
              <h2 className="text-sm font-semibold text-blue/90">Project Information</h2>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full">
              {formData.referenceNumber && (
                <div className="w-[30%] min-w-[18rem] flex-grow-1">
                  <label className={labelClasses}>Reference Number</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleInputChange}
                    className={inputClasses}
                    readOnly
                  />
                </div>
              )}
              
              <div className="w-[30%] min-w-[18rem] flex-grow-1">
                <label className={labelClasses}>Clearance Requestor</label>
                <input
                  type="text"
                  name="clearanceRequestor"
                  value={formData.clearanceRequestor}
                  onChange={handleInputChange}
                  className={disabledInputClasses}
                  required
                  readOnly
                />
              </div>
              
              <div className="w-[30%] min-w-[18rem] flex-grow-1">
                <label className={labelClasses}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={disabledInputClasses}
                  required
                  readOnly
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full">
              <div className="w-[30%] min-w-[18rem] flex-grow-1">
                <label className={labelClasses}>Group</label>
                <input
                  type="text"
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  className={disabledInputClasses}
                  readOnly
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full">
              <div className="w-[30%] min-w-[18rem] flex-grow-1">
                <label className={labelClasses}>Date of Request</label>
                <input
                  type="date"
                  name="dateOfRequest"
                  value={formData.dateOfRequest}
                  onChange={handleInputChange}
                  className={disabledInputClasses}
                  required
                  readOnly
                />
              </div>
              
              <div className="w-[30%] min-w-[18rem] flex-grow-1">
                <label className={labelClasses}>Target Release Date</label>
                <input
                  type="date"
                  name="targetReleaseDate"
                  value={formData.targetReleaseDate}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                />
              </div>
              
              <div className="w-[30%] min-w-[18rem] flex-grow-1">
                <label className={labelClasses}>Project Name / Budget Code</label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleProjectChange}
                  className={inputClasses}
                  required
                  disabled={isLoadingProjects}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.displayName}
                    </option>
                  ))}
                </select>
                {isLoadingProjects && (
                  <p className="text-xs text-gray-500 mt-1">Loading projects...</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full">
              <div className="w-[46%] min-w-[24rem] flex-grow-1">
                <label className={labelClasses}>CEPD No.</label>
                <select
                  name="ceId"
                  value={formData.ceId}
                  onChange={handleCEChange}
                  className={inputClasses}
                  required
                  disabled={!formData.projectId || isLoadingCEs}
                >
                  <option value="">Select CE</option>
                  {availableCEs.map(ce => (
                    <option key={ce.id} value={ce.id}>
                      {ce.displayName}
                    </option>
                  ))}
                </select>
                {isLoadingCEs && (
                  <p className="text-xs text-gray-500 mt-1">Loading CEs...</p>
                )}
                {!formData.projectId && (
                  <p className="text-xs text-gray-500 mt-1">Please select a project first</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full">
            <div className="w-[46%] min-w-[24rem] flex-grow-1">
              <label className={labelClasses}>Coverage From Date (Mondays only)</label>
              <input
                type="date"
                name="coverageFromDate"
                value={formData.coverageFromDate}
                onChange={handleDateChange}
                className={inputClasses}
                required
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault()
                  }
                }}
                style={{
                  colorScheme: 'light'
                }}
              />
              {formData.coverageFromDate && !isMonday(formData.coverageFromDate) && (
                <p className="text-xs text-red-600 mt-1">Please select a Monday</p>
              )}
            </div>
            
            <div className="w-[46%] min-w-[24rem] flex-grow-1">
              <label className={labelClasses}>Coverage To Date</label>
              <input
                type="date"
                name="coverageToDate"
                value={formData.coverageToDate}
                onChange={handleInputChange}
                className={disabledInputClasses}
                required
                readOnly
              />
            </div>
            </div>
          </div>

          {/* Personnel Details */}
          <div className="p-3 bg-white/50 rounded border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Clearance and Service Fee Details</h2>
              </div>
              <button
                type="button"
                onClick={addPersonnel}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue text-white rounded hover:bg-blue/80"
              >
                <Plus className="w-3 h-3" />
                Add IM Personnel
              </button>
            </div>
            
            {personnelList.map((person, index) => (
              <div key={person.id} className="mb-6 p-4 bg-white/70 rounded-lg border-l-4 border-orange shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-blue/90">IM #{index + 1}</h3>
                    {person.isSaved && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Saved</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!person.isSaved && (
                      <button
                        type="button"
                        onClick={() => savePersonnel(person.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <Save className="w-3 h-3" />
                        Save IM #{index + 1}
                      </button>
                    )}
                    {person.isSaved && (
                      <button
                        type="button"
                        onClick={() => editPersonnel(person.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-blue text-white rounded hover:bg-blue/80"
                      >
                        <Edit className="w-3 h-3" />
                        Edit IM #{index + 1}
                      </button>
                    )}
                    {personnelList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePersonnel(person.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Basic Information */}
                <div className="flex flex-wrap gap-2 w-full mb-4">
                  <div className="w-[23%] min-w-[14rem] flex-grow-1 relative">
                    <label className={labelClasses}>Registered Name</label>
                    <div className="relative" ref={el => { dropdownRefs.current[person.id] = el }}>
                      <div className="relative">
                        <input
                          type="text"
                          value={person.registeredName}
                          onChange={(e) => handleNameSearch(person.id, e.target.value)}
                          onFocus={() => {
                            if (person.registeredName.length >= 2) {
                              searchIM(person.registeredName, person.id)
                            }
                          }}
                          className={person.isSaved ? disabledInputClasses : `${inputClasses} pr-8`}
                          placeholder="Search IM by name..."
                          required
                          disabled={person.isSaved}
                        />
                        {!person.isSaved && (
                          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Search Results Dropdown */}
                      {showDropdown[person.id] && searchResults[person.id]?.length > 0 && !person.isSaved && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {searchResults[person.id].map((im) => (
                            <div
                              key={im.id}
                              onClick={() => selectIM(person.id, im)}
                              className="px-3 py-2 hover:bg-blue/10 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="text-sm font-medium text-gray-900">{im.fullName}</div>
                              <div className="text-xs text-gray-500">IM #{im.imNumber}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-[23%] min-w-[14rem] flex-grow-1">
                    <label className={labelClasses}>Position</label>
                    <input
                      type="text"
                      value={person.position}
                      onChange={(e) => handlePersonnelChange(person.id, 'position', e.target.value)}
                      className={person.isSaved ? disabledInputClasses : inputClasses}
                      required
                      disabled={person.isSaved}
                    />
                  </div>
                  
                  <div className="w-[23%] min-w-[14rem] flex-grow-1">
                    <label className={labelClasses}>Outlet/Venue</label>
                    <input
                      type="text"
                      value={person.outletVenue}
                      onChange={(e) => handlePersonnelChange(person.id, 'outletVenue', e.target.value)}
                      className={person.isSaved ? disabledInputClasses : inputClasses}
                      required
                      disabled={person.isSaved}
                    />
                  </div>
                  
                  <div className="w-[23%] min-w-[14rem] flex-grow-1">
                    <label className={labelClasses}>Packaged Fee (₱)</label>
                    <input
                      type="number"
                      value={person.packagedFee === 0 ? '' : person.packagedFee}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                        if (value > 0) {
                          // Clear all daily fees when packaged fee is entered
                          const clearedDailyFees = {
                            monday: 0,
                            tuesday: 0,
                            wednesday: 0,
                            thursday: 0,
                            friday: 0,
                            saturday: 0,
                            sunday: 0
                          }
                          handlePersonnelChange(person.id, 'dailyFees', clearedDailyFees)
                        }
                        handlePersonnelChange(person.id, 'packagedFee', value)
                      }}
                      className={Object.values(person.dailyFees).some(fee => fee > 0) || person.isSaved ? disabledInputClasses : inputClasses}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={Object.values(person.dailyFees).some(fee => fee > 0) || person.isSaved}
                    />
                  </div>
                </div>
                
                {/* Daily Fees */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-blue/90 mb-3">Daily Fees (₱)</label>
                  <div className="flex flex-wrap justify-center gap-2 w-full mb-4">
                    {Object.entries(person.dailyFees).map(([day, fee]) => (
                      <div key={day} className="flex-grow-1 max-w-[12rem]">
                        <label className={labelClasses}>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                        <input
                          type="number"
                          value={fee === 0 ? '' : fee}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                            if (value > 0) {
                              // Clear packaged fee when daily fee is entered
                              handlePersonnelChange(person.id, 'packagedFee', 0)
                            }
                            const newDailyFees = { ...person.dailyFees, [day]: value }
                            handlePersonnelChange(person.id, 'dailyFees', newDailyFees)
                          }}
                          className={person.packagedFee > 0 || person.isSaved ? disabledInputClasses : inputClasses}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          disabled={person.packagedFee > 0 || person.isSaved}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* GCash Information */}
                <div>
                  <label className="block text-sm font-medium text-blue/90 mb-3">GCash Information</label>
                  <div className="flex flex-wrap gap-2 w-full mb-4">
                    <div className="w-[30%] min-w-[20rem] flex-grow-1">
                      <label className={labelClasses}>Own Gcash</label>
                      <input
                        type="text"
                        value={person.ownGcash}
                        onChange={(e) => handlePersonnelChange(person.id, 'ownGcash', e.target.value)}
                        className={person.isSaved ? disabledInputClasses : inputClasses}
                        placeholder="09XX XXX XXXX"
                        disabled={person.isSaved}
                      />
                    </div>
                    
                    <div className="w-[30%] min-w-[20rem] flex-grow-1">
                      <label className={labelClasses}>Auth Gcash</label>
                      <input
                        type="text"
                        value={person.authGcash}
                        onChange={(e) => handlePersonnelChange(person.id, 'authGcash', e.target.value)}
                        className={person.isSaved ? disabledInputClasses : inputClasses}
                        placeholder="09XX XXX XXXX"
                        disabled={person.isSaved}
                      />
                    </div>
                    
                    <div className="w-[30%] min-w-[20rem] flex-grow-1">
                      <label className={labelClasses}>Auth Gcash Name</label>
                      <input
                        type="text"
                        value={person.authGcashAccName}
                        onChange={(e) => handlePersonnelChange(person.id, 'authGcashAccName', e.target.value)}
                        className={person.isSaved ? disabledInputClasses : inputClasses}
                        placeholder="Full Name"
                        disabled={person.isSaved}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-right mt-2 p-2 bg-orange/10 rounded">
              <div className="flex justify-between items-center">
                <div className="text-left text-sm">
                  {selectedProject && selectedProject.internalBudgetInitial && (
                    <>
                      <div className="text-blue/70">
                        Project Budget: ₱{Number(selectedProject.internalBudgetInitial).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-blue/70">
                        Current Available: ₱{Number(selectedProject.internalBudgetCurrent || selectedProject.internalBudgetInitial).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`font-medium ${Number(selectedProject.internalBudgetCurrent || selectedProject.internalBudgetInitial) - calculateTotalFees() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Remaining after IMCF: ₱{(Number(selectedProject.internalBudgetCurrent || selectedProject.internalBudgetInitial) - calculateTotalFees()).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-blue/90">
                    Total IMCF Fees: ₱{calculateTotalFees().toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clearance Remarks */}
          <div className="flex flex-col p-3 bg-white/50 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue" />
              <h2 className="text-sm font-semibold text-blue/90">Clearance Remarks</h2>
            </div>
            
            <div>
              <label className={labelClasses}>Clearance Requestor</label>
              <textarea
                name="clearanceRequestorRemarks"
                value={formData.clearanceRequestorRemarks}
                onChange={handleInputChange}
                className={`${inputClasses} h-16 resize-none`}
                placeholder="Enter remarks..."
              />
            </div>
            
            <div>
              <label className={labelClasses}>Clearance Reviewer</label>
              <textarea
                name="clearanceReviewerRemarks"
                value={formData.clearanceReviewerRemarks}
                onChange={handleInputChange}
                className={`${disabledInputClasses} h-16 resize-none`}
                placeholder="Will be filled by Clearance Reviewer..."
                disabled
              />
            </div>
            
            <div>
              <label className={labelClasses}>Clearance Approver</label>
              <textarea
                name="clearanceApproverRemarks"
                value={formData.clearanceApproverRemarks}
                onChange={handleInputChange}
                className={`${disabledInputClasses} h-16 resize-none`}
                placeholder="Will be filled by Clearance Approver..."
                disabled
              />
            </div>
            
            <div>
              <label className={labelClasses}>HRD</label>
              <textarea
                name="hrdRemarks"
                value={formData.hrdRemarks}
                onChange={handleInputChange}
                className={`${disabledInputClasses} h-16 resize-none`}
                placeholder="Will be filled by HRD..."
                disabled
              />
            </div>
          </div>
            

          {/* Draft Status and Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {isDraftSaved && lastSavedTime && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                <BookmarkPlus className="w-4 h-4" />
                <span>
                  Draft saved at {lastSavedTime.toLocaleTimeString('en-PH', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </span>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveAsDraft}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange text-white font-medium rounded hover:bg-orange/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors"
              >
                <BookmarkPlus className="w-4 h-4" />
                Save Draft
              </button>
              
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue text-white font-medium rounded hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Submit IMCF
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}