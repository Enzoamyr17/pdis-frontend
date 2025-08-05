"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { FileText, Save, Plus, Trash2, Building, User, CreditCard, Edit, Search, BookmarkPlus, List, Calendar, Clock, CheckCircle, XCircle, Eye, RefreshCw, Filter, X, Grid3X3, Table, ArrowDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Modal } from "@/components/ui/modal"
import { useProjects, type Project } from "@/hooks/useProjects"
import FormStatus from "../ui/FormStatus"

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


interface CE {
  id: string
  ceID: string
  cepdNumber: string
  version: string
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
  duplicateRemark?: string
  remarks?: string
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

interface IMCFFormListItem {
  id: string
  referenceNumber: string
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  targetReleaseDate: string | null
  coverageFromDate: string | null
  coverageToDate: string | null
  project: {
    projectName: string
    projectID: string
  } | null
  ce: {
    cepdNumber: string
  } | null
  personnel: Array<{
    id: string
    registeredName: string
    position: string
    packagedFee: number
    mondayFee: number
    tuesdayFee: number
    wednesdayFee: number
    thursdayFee: number
    fridayFee: number
    saturdayFee: number
    sundayFee: number
  }>
}

interface DuplicateData {
  formId: string
  referenceNumber: string
  projectName: string
  projectId: string
  coverageFromDate: string
  coverageToDate: string
  personnelName: string
  existingFeeType: 'packaged' | 'daily'
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
  reason: string
  requiresRemark: boolean
  sameProject: boolean
}

interface DuplicateCheckResult {
  hasDuplicates: boolean
  duplicates: DuplicateData[]
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

  const { projects, loading: isLoadingProjects, refresh: refreshProjects } = useProjects()
  const [availableCEs, setAvailableCEs] = useState<CE[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
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
      isSaved: false,
      remarks: ''
    }
  ])

  const [searchResults, setSearchResults] = useState<{ [key: string]: IMSearchResult[] }>({})
  const [showDropdown, setShowDropdown] = useState<{ [key: string]: boolean }>({})
  const [searchTimeouts, setSearchTimeouts] = useState<{ [key: string]: NodeJS.Timeout }>({})
  const [searchCache, setSearchCache] = useState<{ [key: string]: IMSearchResult[] }>({})
  const [isSearching, setIsSearching] = useState<{ [key: string]: boolean }>({})
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [isDraftSaved, setIsDraftSaved] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

  // Tab and list view states
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form')
  const [imcfForms, setImcfForms] = useState<IMCFFormListItem[]>([])
  const [isLoadingForms, setIsLoadingForms] = useState(false)
  const [isLoadingEditForm, setIsLoadingEditForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingFormId, setEditingFormId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isDeletingForm, setIsDeletingForm] = useState(false)

  // Duplicate detection states
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false)
  const [duplicateData, setDuplicateData] = useState<DuplicateCheckResult | null>(null)
  const [pendingPersonnelId, setPendingPersonnelId] = useState<string | null>(null)
  const [duplicateRemark, setDuplicateRemark] = useState('')
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)

  // Personnel view states
  const [personnelViewMode, setPersonnelViewMode] = useState<'card' | 'table'>('card')
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [showStickyActions, setShowStickyActions] = useState(false)
  const personnelContainerRef = useRef<HTMLDivElement>(null)
  const actionButtonsRef = useRef<HTMLDivElement>(null)

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

  // Load list of IMCF forms
  const loadIMCFForms = useCallback(async () => {
    setIsLoadingForms(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: statusFilter
      })
      
      const response = await fetch(`/api/imcf?${params}`)
      if (response.ok) {
        const data = await response.json()
        setImcfForms(data.imcfForms)
        setTotalPages(data.pagination.pages)
      } else {
        toast.error('Failed to load IMCF forms')
      }
    } catch (error) {
      console.error('Error loading IMCF forms:', error)
      toast.error('Error loading IMCF forms')
    } finally {
      setIsLoadingForms(false)
    }
  }, [statusFilter, currentPage])

  const loadProjects = useCallback(async () => {
    try {
      await refreshProjects()
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Error loading projects')
    }
  }, [refreshProjects])

  // Load projects and user data on component mount
  useEffect(() => {
    if (session?.user) {
      loadProjects()
      loadUserDetails()
      if (activeTab === 'list') {
        loadIMCFForms()
      }
    }
  }, [session, loadUserDetails, activeTab, loadIMCFForms, loadProjects])

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
      cepdNumber: ce?.cepdNumber || ''
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
      isSaved: false,
      remarks: ''
    }
    setPersonnelList(prev => [...prev, newPersonnel])
  }

  const removePersonnel = (id: string) => {
    if (personnelList.length > 1) {
      setPersonnelList(prev => prev.filter(person => person.id !== id))
    }
  }

  const savePersonnel = async (id: string) => {
    const person = personnelList.find(p => p.id === id)
    if (!person) return

    // Validate required fields
    if (!person.registeredName || !person.position || !person.outletVenue) {
      toast.error('Please fill in all required fields (Registered Name, Position, Outlet/Venue) before saving.')
      return
    }

    // Final duplicate check before saving
    const duplicateCheck = checkForDuplicateIM(person.registeredName, id)
    if (duplicateCheck.isDuplicate) {
      toast.error(`"${person.registeredName}" is already added to this form as IM #${duplicateCheck.duplicateIndex}. Please enter a different name before saving.`)
      return
    }

    // Check if either packaged fee or at least one daily fee is filled
    const hasFees = person.packagedFee > 0 || Object.values(person.dailyFees).some(fee => fee > 0)
    if (!hasFees) {
      toast.error('Please enter either a packaged fee or daily fees before saving.')
      return
    }

    // Check for external duplicates
    const duplicateResult = await checkForExternalDuplicates(person.registeredName, id)
    
    if (duplicateResult?.hasDuplicates) {
      // Store the data for the confirmation modal
      setDuplicateData(duplicateResult)
      setPendingPersonnelId(id)
      setDuplicateRemark('')
      setShowDuplicateConfirm(true)
      return
    }

    // No duplicates found, proceed with saving
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

  // Handle duplicate confirmation
  const handleDuplicateConfirm = () => {
    if (!pendingPersonnelId) return

    // Check if remark is required
    const requiresRemark = duplicateData?.duplicates.some(d => d.requiresRemark) || false
    
    if (requiresRemark && !duplicateRemark.trim()) {
      toast.error('Please provide a remark for this duplicate scenario.')
      return
    }

    // Save the personnel with the remark if needed
    const person = personnelList.find(p => p.id === pendingPersonnelId)
    if (person) {
      setPersonnelList(prev => prev.map(p => 
        p.id === pendingPersonnelId ? { 
          ...p, 
          isSaved: true,
          duplicateRemark: requiresRemark ? duplicateRemark : undefined
        } : p
      ))
      
      toast.success(`IM #${personnelList.findIndex(p => p.id === pendingPersonnelId) + 1} saved successfully with duplicate acknowledgment!`)
    }

    // Close modal and reset state
    setShowDuplicateConfirm(false)
    setDuplicateData(null)
    setPendingPersonnelId(null)
    setDuplicateRemark('')
  }

  const handleDuplicateCancel = () => {
    setShowDuplicateConfirm(false)
    setDuplicateData(null)
    setPendingPersonnelId(null)
    setDuplicateRemark('')
    toast.info('Personnel save cancelled. Please review and edit the details.')
  }

  const searchIM = useCallback(async (query: string, personnelId: string) => {
    if (query.length < 1) {
      setSearchResults(prev => ({ ...prev, [personnelId]: [] }))
      setShowDropdown(prev => ({ ...prev, [personnelId]: false }))
      setIsSearching(prev => ({ ...prev, [personnelId]: false }))
      return
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim()
    if (searchCache[cacheKey]) {
      const cachedResults = searchCache[cacheKey]
      setSearchResults(prev => ({ ...prev, [personnelId]: cachedResults }))
      setShowDropdown(prev => ({ ...prev, [personnelId]: cachedResults.length > 0 }))
      setIsSearching(prev => ({ ...prev, [personnelId]: false }))
      return
    }

    setIsSearching(prev => ({ ...prev, [personnelId]: true }))
    
    try {
      const response = await fetch(`/api/im/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const results: IMSearchResult[] = await response.json()
        
        // Cache the results
        setSearchCache(prev => ({ ...prev, [cacheKey]: results }))
        setSearchResults(prev => ({ ...prev, [personnelId]: results }))
        setShowDropdown(prev => ({ ...prev, [personnelId]: results.length > 0 }))
      }
    } catch (error) {
      console.error('Error searching IMs:', error)
    } finally {
      setIsSearching(prev => ({ ...prev, [personnelId]: false }))
    }
  }, [searchCache])

  const checkForDuplicateIM = useCallback((newName: string, currentPersonnelId: string): { isDuplicate: boolean; duplicatePerson?: IMPersonnel; duplicateIndex?: number } => {
    // Normalize names for comparison (remove extra spaces, convert to lowercase)
    const normalizedNewName = newName.toLowerCase().trim().replace(/\s+/g, ' ')
    
    const duplicateIndex = personnelList.findIndex(person => {
      if (person.id === currentPersonnelId) return false // Don't compare with self
      const normalizedExistingName = person.registeredName.toLowerCase().trim().replace(/\s+/g, ' ')
      return normalizedExistingName === normalizedNewName && normalizedExistingName !== ''
    })
    
    if (duplicateIndex !== -1) {
      return {
        isDuplicate: true,
        duplicatePerson: personnelList[duplicateIndex],
        duplicateIndex: duplicateIndex + 1 // Add 1 for human-readable IM number
      }
    }
    
    return { isDuplicate: false }
  }, [personnelList])


  const handleNameSearch = useCallback((personnelId: string, value: string) => {
    // Clear any existing timeout
    if (searchTimeouts[personnelId]) {
      clearTimeout(searchTimeouts[personnelId])
    }

    // Update the input value immediately
    handlePersonnelChange(personnelId, 'registeredName', value)

    // Set a new timeout for search with reduced delay
    const timeout = setTimeout(() => {
      searchIM(value, personnelId)
      
      // Also check for duplicates when typing manually (with longer delay)
      if (value.trim()) {
        const duplicateCheck = checkForDuplicateIM(value, personnelId)
        if (duplicateCheck.isDuplicate) {
          setTimeout(() => {
            const recheck = checkForDuplicateIM(value, personnelId)
            if (recheck.isDuplicate) {
              toast.error(`"${value}" is already added to this form as IM #${recheck.duplicateIndex}. Please enter a different name.`)
            }
          }, 300) // Additional delay for duplicate check
        }
      }
    }, 150) // Reduced from 300ms to 150ms for faster response

    setSearchTimeouts(prev => ({ ...prev, [personnelId]: timeout }))
  }, [searchTimeouts, searchIM, checkForDuplicateIM])

  const selectIM = useCallback((personnelId: string, im: IMSearchResult) => {
    // Check for duplicates before adding
    const duplicateCheck = checkForDuplicateIM(im.fullName, personnelId)
    if (duplicateCheck.isDuplicate) {
      toast.error(`"${im.fullName}" is already added to this form as IM #${duplicateCheck.duplicateIndex}. Please select a different IM personnel.`)
      return
    }

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
    toast.success(`${im.fullName} added successfully!`)
  }, [checkForDuplicateIM])

  // Check for duplicates with external IMCFs
  const checkForExternalDuplicates = useCallback(async (
    personnelName: string, 
    personnelId: string
  ): Promise<DuplicateCheckResult | null> => {
    if (!personnelName || !formData.projectId || !formData.coverageFromDate || !formData.coverageToDate) {
      return null
    }

    const person = personnelList.find(p => p.id === personnelId)
    if (!person) return null

    // Determine fee type
    const hasPackagedFee = person.packagedFee > 0
    const feeType = hasPackagedFee ? 'packaged' : 'daily'

    setIsCheckingDuplicates(true)
    try {
      const response = await fetch('/api/imcf/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personnelName,
          projectId: formData.projectId,
          coverageFromDate: formData.coverageFromDate,
          coverageToDate: formData.coverageToDate,
          feeType,
          excludeFormId: editingFormId
        })
      })

      if (response.ok) {
        const result: DuplicateCheckResult = await response.json()
        return result
      } else {
        console.error('Failed to check duplicates')
        return null
      }
    } catch (error) {
      console.error('Error checking duplicates:', error)
      return null
    } finally {
      setIsCheckingDuplicates(false)
    }
  }, [formData.projectId, formData.coverageFromDate, formData.coverageToDate, editingFormId, personnelList])

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

  // Scroll detection for personnel section
  useEffect(() => {
    const handleScroll = () => {
      const container = personnelContainerRef.current
      const actionButtons = actionButtonsRef.current
      
      if (!container || !actionButtons) return
      
      const containerRect = container.getBoundingClientRect()
      const actionRect = actionButtons.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Show scroll to bottom if there are many personnel and we're not at bottom
      const shouldShowScrollToBottom = personnelList.length >= 5 && containerRect.bottom > windowHeight
      setShowScrollToBottom(shouldShowScrollToBottom)
      
      // Show sticky actions if action buttons are out of view
      const shouldShowStickyActions = actionRect.top > windowHeight || actionRect.bottom < 0
      setShowStickyActions(shouldShowStickyActions)
    }

    const handleResize = () => handleScroll()
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    handleScroll() // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [personnelList.length])



  const calculateTotalFees = () => {
    return personnelList.reduce((total, person) => {
      const weeklyTotal = Object.values(person.dailyFees).reduce((sum, fee) => sum + fee, 0)
      return total + person.packagedFee + weeklyTotal
    }, 0)
  }

  // Scroll to bottom function
  const scrollToBottom = () => {
    const actionButtons = actionButtonsRef.current
    if (actionButtons) {
      actionButtons.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Scroll to top of personnel section
  const scrollToTopOfPersonnel = () => {
    const container = personnelContainerRef.current
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Load existing IMCF form for editing
  const loadIMCFForEdit = async (formId: string) => {
    setIsLoadingEditForm(true)
    try {
      const response = await fetch(`/api/imcf/${formId}`)
      if (response.ok) {
        const imcfData = await response.json()
        
        // Populate form data
        setFormData({
          referenceNumber: imcfData.referenceNumber,
          projectId: imcfData.project?.id || '',
          projectName: imcfData.project?.projectName || '',
          ceId: imcfData.ce?.id || '',
          cepdNumber: imcfData.ce?.cepdNumber || '',
          clearanceRequestor: imcfData.requestor?.name || '',
          department: formatDepartment(imcfData.requestor?.department || null),
          group: formatGroup(imcfData.requestor?.group || null),
          dateOfRequest: new Date(imcfData.createdAt).toISOString().split('T')[0],
          targetReleaseDate: imcfData.targetReleaseDate ? new Date(imcfData.targetReleaseDate).toISOString().split('T')[0] : '',
          coverageFromDate: imcfData.coverageFromDate ? new Date(imcfData.coverageFromDate).toISOString().split('T')[0] : '',
          coverageToDate: imcfData.coverageToDate ? new Date(imcfData.coverageToDate).toISOString().split('T')[0] : '',
          clearanceRequestorRemarks: imcfData.clearanceRequestorRemarks || '',
          clearanceReviewerRemarks: imcfData.clearanceReviewerRemarks || '',
          clearanceApproverRemarks: imcfData.clearanceApproverRemarks || '',
          hrdRemarks: imcfData.hrdRemarks || ''
        })

        // Set selected project for CE loading
        const project = projects.find(p => p.id === imcfData.project?.id)
        setSelectedProject(project || null)
        
        // Load CEs if project is set
        if (imcfData.project?.id) {
          await loadCEsForProject(imcfData.project.id)
        }

        // Populate personnel data
        const loadedPersonnel: IMPersonnel[] = imcfData.personnel.map((person: {
          id: string;
          registeredName: string;
          position: string;
          outletVenue: string;
          packagedFee: number;
          mondayFee: number;
          tuesdayFee: number;
          wednesdayFee: number;
          thursdayFee: number;
          fridayFee: number;
          saturdayFee: number;
          sundayFee: number;
          ownGcash: string;
          authGcash: string;
          authGcashAccName: string;
          remarks?: string;
        }, index: number) => ({
          id: person.id || (index + 1).toString(),
          registeredName: person.registeredName,
          position: person.position,
          outletVenue: person.outletVenue,
          packagedFee: Number(person.packagedFee) || 0,
          dailyFees: {
            monday: Number(person.mondayFee) || 0,
            tuesday: Number(person.tuesdayFee) || 0,
            wednesday: Number(person.wednesdayFee) || 0,
            thursday: Number(person.thursdayFee) || 0,
            friday: Number(person.fridayFee) || 0,
            saturday: Number(person.saturdayFee) || 0,
            sunday: Number(person.sundayFee) || 0
          },
          ownGcash: person.ownGcash || '',
          authGcash: person.authGcash || '',
          authGcashAccName: person.authGcashAccName || '',
          isSaved: true,
          remarks: person.remarks || ''
        }))

        setPersonnelList(loadedPersonnel.length > 0 ? loadedPersonnel : [
          {
            id: '1',
            registeredName: '',
            position: '',
            outletVenue: '',
            packagedFee: 0,
            dailyFees: {
              monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
              friday: 0, saturday: 0, sunday: 0
            },
            ownGcash: '',
            authGcash: '',
            authGcashAccName: '',
            isSaved: false,
            remarks: ''
          }
        ])

        setEditingFormId(formId)
        setActiveTab('form')
        toast.success('Form loaded for editing')
      } else {
        toast.error('Failed to load form')
      }
    } catch (error) {
      console.error('Error loading form:', error)
      toast.error('Error loading form')
    } finally {
      setIsLoadingEditForm(false)
    }
  }

  // Create new form
  const createNewForm = () => {
    setFormData({
      referenceNumber: '',
      projectId: '',
      projectName: '',
      ceId: '',
      cepdNumber: '',
      clearanceRequestor: session?.user?.name || '',
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
    
    setPersonnelList([{
      id: '1',
      registeredName: '',
      position: '',
      outletVenue: '',
      packagedFee: 0,
      dailyFees: {
        monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
        friday: 0, saturday: 0, sunday: 0
      },
      ownGcash: '',
      authGcash: '',
      authGcashAccName: '',
      isSaved: false,
      remarks: ''
    }])
    
    setSelectedProject(null)
    setAvailableCEs([])
    setEditingFormId(null)
    setIsDraftSaved(false)
    setLastSavedTime(null)
    setActiveTab('form')
    
    // Reload user details
    loadUserDetails()
  }

  // Delete IMCF form (only drafts)
  const handleDeleteForm = async (formId: string) => {
    setIsDeletingForm(true)
    try {
      const response = await fetch(`/api/imcf/${formId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Draft deleted successfully!')
        setShowDeleteConfirm(null)
        // Refresh the list
        loadIMCFForms()
        // If we're editing this form, clear the editing state
        if (editingFormId === formId) {
          createNewForm()
        }
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to delete draft')
      }
    } catch (error) {
      console.error('Error deleting form:', error)
      toast.error('Error deleting draft')
    } finally {
      setIsDeletingForm(false)
    }
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
      const apiEndpoint = editingFormId ? `/api/imcf/${editingFormId}` : '/api/imcf'
      const method = editingFormId ? 'PUT' : 'POST'
      
      const response = await fetch(apiEndpoint, {
        method: method,
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
            authGcashAccName: person.authGcashAccName,
            duplicateRemark: person.duplicateRemark,
            remarks: person.remarks
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
        // Check if there's a detailed message for duplicates
        const errorMessage = result.message || result.error || 'Failed to submit IMCF form'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error submitting IMCF:', error)
      toast.error('Error submitting IMCF form')
    }
  }

  const handleSaveAsDraft = async () => {
    try {
      const apiEndpoint = editingFormId ? `/api/imcf/${editingFormId}` : '/api/imcf'
      const method = editingFormId ? 'PUT' : 'POST'
      
      const response = await fetch(apiEndpoint, {
        method: method,
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
              authGcashAccName: person.authGcashAccName,
              duplicateRemark: person.duplicateRemark,
              remarks: person.remarks
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
        // Check if there's a detailed message for duplicates
        const errorMessage = result.message || result.error || 'Failed to save draft'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Error saving draft')
    }
  }

  const inputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"
  const disabledInputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed"
  const labelClasses = "block text-xs font-medium text-blue/90 mb-1"

  // Utility functions for status display
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Edit className="w-4 h-4 text-orange" />
      case 'SUBMITTED':
        return <Clock className="w-4 h-4 text-blue" />
      case 'UNDER_REVIEW':
        return <Eye className="w-4 h-4 text-purple-600" />
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-orange/10 text-orange border-orange/20'
      case 'SUBMITTED':
        return 'bg-blue/10 text-blue border-blue/20'
      case 'UNDER_REVIEW':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const dateToday = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });

  const IMCF = [
    { id: 1, name: "Clearance Requestor", date: dateToday, status: 'ongoing' },
    { id: 2, name: "Clearance Receiver" },
    { id: 3, name: "Clearance Approver" },
    { id: 4, name: "AFG Validator" },
    { id: 5, name: "AFG Authorizer" },
    { id: 6, name: "Treasury Requestor" },
    { id: 7, name: "Treasury Approver" },
    { id: 8, name: "GCash Disbursement Requestor" },
    { id: 9, name: "GCash Disbursement Approver" }
  ];

  return (
    <div className="h-full p-4 overflow-auto min-w-[32rem]">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-blue" />
        <h1 className="text-3xl font-semibold text-blue/90">Independent Manpower Clearance Form</h1>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'form'
                  ? 'border-blue text-blue'
                  : 'border-transparent text-blue/90 hover:text-blue/90 hover:border-zinc-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              IMCF Form
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue text-blue'
                  : 'border-transparent text-blue/90 hover:text-blue/90 hover:border-zinc-300'
              }`}
            >
              <List className="w-4 h-4 inline mr-2" />
              My IMCFs
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'form' && (
        <div className="relative">
          {/* Loading Overlay */}
          {isLoadingEditForm && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-lg border">
                <RefreshCw className="w-8 h-8 text-blue animate-spin" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-blue/90">Loading Form for Editing</p>
                  <p className="text-sm text-blue/70">Please wait while we load the form data...</p>
                </div>
              </div>
            </div>
          )}
          {/* Sticky Budget Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue" />
                  <h3 className="text-lg font-semibold text-blue/90">Budget Overview</h3>
                </div>
                {selectedProject && selectedProject.internalBudgetInitial && (
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <div className="text-blue/70">
                        Project Budget: ₱{Number(selectedProject.internalBudgetInitial).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-blue/70">
                        Current Available: ₱{Number(selectedProject.internalBudgetCurrent || selectedProject.internalBudgetInitial).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue/90 font-medium">
                        Total IMCF Fees: ₱{calculateTotalFees().toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`font-semibold ${Number(selectedProject.internalBudgetCurrent || selectedProject.internalBudgetInitial) - calculateTotalFees() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Remaining: ₱{(Number(selectedProject.internalBudgetCurrent || selectedProject.internalBudgetInitial) - calculateTotalFees()).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-b-lg shadow-sm border border-t-0">
            {/* Editing indicator */}
            {editingFormId && (
              <div className="p-3 bg-orange/10 border-b border-orange/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-orange">
                    <Edit className="w-4 h-4" />
                    <span>Editing existing form: {formData.referenceNumber}</span>
                  </div>
                  <button
                    onClick={createNewForm}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue text-white rounded hover:bg-blue/80"
                  >
                    <Plus className="w-3 h-3" />
                    New Form
                  </button>
                </div>
              </div>
            )}
          
          <form onSubmit={handleSubmit} className="p-4 space-y-4">

          <FormStatus request="Request" costCenter="Cost Center" status={IMCF}/> 
          
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
                      {ce.cepdNumber} - v{ce.version}
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
          <div ref={personnelContainerRef} className="p-3 bg-white/50 rounded border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Clearance and Service Fee Details</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPersonnelViewMode('card')}
                    className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
                      personnelViewMode === 'card' 
                        ? 'bg-blue text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Card View"
                  >
                    <Grid3X3 className="w-3 h-3" />
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersonnelViewMode('table')}
                    className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
                      personnelViewMode === 'table' 
                        ? 'bg-blue text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Table View"
                  >
                    <Table className="w-3 h-3" />
                    Table
                  </button>
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
            </div>
            
            {personnelViewMode === 'card' ? (
              // Card View
              <div className="space-y-6">
                {personnelList.map((person, index) => (
              <div key={person.id} data-personnel-id={person.id} className="mb-6 p-4 bg-white/70 rounded-lg border-l-4 border-orange shadow-sm">
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
                        disabled={isCheckingDuplicates}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCheckingDuplicates ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3" />
                            Save IM #{index + 1}
                          </>
                        )}
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
                          onChange={(e) => {
                            const value = e.target.value
                            // Always call handleNameSearch to trigger API search
                            handleNameSearch(person.id, value)
                          }}
                          onFocus={() => {
                            if (person.registeredName.length >= 1) {
                              searchIM(person.registeredName, person.id)
                            }
                          }}
                          onBlur={() => {
                            // Final duplicate check when user leaves the field
                            if (person.registeredName.trim()) {
                              const duplicateCheck = checkForDuplicateIM(person.registeredName, person.id)
                              if (duplicateCheck.isDuplicate) {
                                toast.error(`"${person.registeredName}" is already added to this form as IM #${duplicateCheck.duplicateIndex}. Please enter a different name.`)
                              }
                            }
                          }}
                          className={person.isSaved ? disabledInputClasses : `${inputClasses} pr-8 ${checkForDuplicateIM(person.registeredName, person.id).isDuplicate ? 'border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="Search IM by name..."
                          required
                          disabled={person.isSaved}
                        />
                        {!person.isSaved && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            {isSearching[person.id] ? (
                              <RefreshCw className="w-4 h-4 text-blue animate-spin" />
                            ) : (
                              <Search className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Search Results Dropdown */}
                      {showDropdown[person.id] && searchResults[person.id]?.length > 0 && !person.isSaved && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {searchResults[person.id].slice(0, 10).map((im) => {
                            const isDuplicate = checkForDuplicateIM(im.fullName, person.id).isDuplicate
                            return (
                              <div
                                key={im.id}
                                onClick={() => !isDuplicate && selectIM(person.id, im)}
                                className={`px-3 py-2 border-b border-gray-100 last:border-b-0 transition-colors ${
                                  isDuplicate 
                                    ? 'bg-red-50 text-red-500 cursor-not-allowed opacity-60' 
                                    : 'hover:bg-blue/10 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium">{im.fullName}</div>
                                    <div className="text-xs text-gray-500">IM #{im.imNumber}</div>
                                  </div>
                                  {isDuplicate && (
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                      Already added
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          {searchResults[person.id].length > 10 && (
                            <div className="px-3 py-2 text-xs text-gray-500 text-center border-t">
                              Showing first 10 of {searchResults[person.id].length} results
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Duplicate warning */}
                      {(() => {
                        if (!person.registeredName.trim() || person.isSaved) return null;
                        const duplicateCheck = checkForDuplicateIM(person.registeredName, person.id);
                        if (!duplicateCheck.isDuplicate) return null;
                        return (
                          <div className="absolute z-40 w-full mt-1 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
                            <div className="flex items-center gap-1">
                              <X className="w-3 h-3" />
                              This person is already added as IM #{duplicateCheck.duplicateIndex}
                            </div>
                          </div>
                        );
                      })()}
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
                  
                  {!Object.values(person.dailyFees).some(fee => fee > 0) && (
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
                        className={person.isSaved ? disabledInputClasses : inputClasses}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        disabled={person.isSaved}
                      />
                    </div>
                  )}
                </div>
                
                {/* Daily Fees */}
                {person.packagedFee === 0 && (
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
                            className={person.isSaved ? disabledInputClasses : inputClasses}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={person.isSaved}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
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
                
                {/* Remarks Section */}
                {(person.remarks || person.duplicateRemark) && (
                  <div>
                    <label className="block text-sm font-medium text-blue/90 mb-3">Remarks</label>
                    <div className="w-full">
                      <textarea
                        value={person.remarks || ''}
                        onChange={(e) => handlePersonnelChange(person.id, 'remarks', e.target.value)}
                        className={person.isSaved ? `${disabledInputClasses} h-20 resize-none` : `${inputClasses} h-20 resize-none`}
                        placeholder="Enter remarks about this IM personnel..."
                        disabled={person.isSaved}
                      />
                      {person.duplicateRemark && (
                        <p className="text-xs text-orange mt-1">
                          <strong>Duplicate Remark:</strong> {person.duplicateRemark}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
                ))}
              </div>
            ) : (
              // Table View
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-2 font-semibold text-blue/90">#</th>
                      <th className="text-left p-2 font-semibold text-blue/90 min-w-[200px]">Name</th>
                      <th className="text-left p-2 font-semibold text-blue/90">Position</th>
                      <th className="text-left p-2 font-semibold text-blue/90">Venue</th>
                      {!personnelList.some(person => Object.values(person.dailyFees).some(fee => fee > 0)) && (
                        <th className="text-left p-2 font-semibold text-blue/90">Package Fee</th>
                      )}
                      {!personnelList.some(person => person.packagedFee > 0) && (
                        <th className="text-left p-2 font-semibold text-blue/90">Daily Fees</th>
                      )}
                      <th className="text-left p-2 font-semibold text-blue/90">Own GCash</th>
                      <th className="text-left p-2 font-semibold text-blue/90">Remarks</th>
                      <th className="text-left p-2 font-semibold text-blue/90">Status</th>
                      <th className="text-left p-2 font-semibold text-blue/90">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnelList.map((person, index) => {
                      const dailyTotal = Object.values(person.dailyFees).reduce((sum, fee) => sum + fee, 0)
                      const hasDailyFees = dailyTotal > 0
                      return (
                        <tr key={person.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-2 font-medium">{index + 1}</td>
                          <td className="p-2">
                            <div className="relative" ref={el => { dropdownRefs.current[person.id] = el }}>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={person.registeredName}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    handleNameSearch(person.id, value)
                                  }}
                                  onFocus={() => {
                                    if (person.registeredName.length >= 1) {
                                      searchIM(person.registeredName, person.id)
                                    }
                                  }}
                                  onBlur={() => {
                                    if (person.registeredName.trim()) {
                                      const duplicateCheck = checkForDuplicateIM(person.registeredName, person.id)
                                      if (duplicateCheck.isDuplicate) {
                                        toast.error(`"${person.registeredName}" is already added to this form as IM #${duplicateCheck.duplicateIndex}.`)
                                      }
                                    }
                                  }}
                                  className={person.isSaved ? "w-full px-2 py-1 text-xs border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed" : `w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90 pr-6 ${checkForDuplicateIM(person.registeredName, person.id).isDuplicate ? 'border-red-500 focus:ring-red-500' : ''}`}
                                  placeholder="Search IM..."
                                  required
                                  disabled={person.isSaved}
                                />
                                {!person.isSaved && (
                                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                                    {isSearching[person.id] ? (
                                      <RefreshCw className="w-3 h-3 text-blue animate-spin" />
                                    ) : (
                                      <Search className="w-3 h-3 text-gray-400" />
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Search Results Dropdown */}
                              {showDropdown[person.id] && searchResults[person.id]?.length > 0 && !person.isSaved && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                                  {searchResults[person.id].slice(0, 5).map((im) => {
                                    const isDuplicate = checkForDuplicateIM(im.fullName, person.id).isDuplicate
                                    return (
                                      <div
                                        key={im.id}
                                        onClick={() => !isDuplicate && selectIM(person.id, im)}
                                        className={`px-2 py-1 border-b border-gray-100 last:border-b-0 transition-colors text-xs ${
                                          isDuplicate 
                                            ? 'bg-red-50 text-red-500 cursor-not-allowed opacity-60' 
                                            : 'hover:bg-blue/10 cursor-pointer'
                                        }`}
                                      >
                                        <div className="font-medium truncate">{im.fullName}</div>
                                        <div className="text-gray-500">#{im.imNumber}</div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={person.position}
                              onChange={(e) => handlePersonnelChange(person.id, 'position', e.target.value)}
                              className={person.isSaved ? "w-full px-2 py-1 text-xs border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed" : "w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"}
                              required
                              disabled={person.isSaved}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={person.outletVenue}
                              onChange={(e) => handlePersonnelChange(person.id, 'outletVenue', e.target.value)}
                              className={person.isSaved ? "w-full px-2 py-1 text-xs border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed" : "w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"}
                              required
                              disabled={person.isSaved}
                            />
                          </td>
                          {!personnelList.some(person => Object.values(person.dailyFees).some(fee => fee > 0)) && (
                            <td className="p-2">
                              <input
                                type="number"
                                value={person.packagedFee === 0 ? '' : person.packagedFee}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                                  if (value > 0) {
                                    const clearedDailyFees = {
                                      monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
                                      friday: 0, saturday: 0, sunday: 0
                                    }
                                    handlePersonnelChange(person.id, 'dailyFees', clearedDailyFees)
                                  }
                                  handlePersonnelChange(person.id, 'packagedFee', value)
                                }}
                                className={person.isSaved ? "w-full px-2 py-1 text-xs border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed" : "w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                disabled={person.isSaved}
                              />
                            </td>
                          )}
                          {!personnelList.some(person => person.packagedFee > 0) && (
                            <td className="p-2">
                              {hasDailyFees ? (
                                <div className="text-xs text-blue">
                                  {Object.entries(person.dailyFees)
                                    .filter(([, fee]) => fee > 0)
                                    .map(([day, fee]) => (
                                      <div key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}: ₱{fee}</div>
                                    ))
                                  }
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Switch to card view for detailed daily fee editing
                                    setPersonnelViewMode('card')
                                    // Focus on this person's daily fees section
                                    setTimeout(() => {
                                      const element = document.querySelector(`[data-personnel-id="${person.id}"]`)
                                      if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                      }
                                    }, 100)
                                  }}
                                  className="text-xs text-blue hover:text-blue/80 underline"
                                  disabled={person.isSaved}
                                >
                                  Edit Daily Fees
                                </button>
                              )}
                            </td>
                          )}
                          <td className="p-2">
                            <input
                              type="text"
                              value={person.ownGcash}
                              onChange={(e) => handlePersonnelChange(person.id, 'ownGcash', e.target.value)}
                              className={person.isSaved ? "w-full px-2 py-1 text-xs border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed" : "w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"}
                              placeholder="09XX XXX XXXX"
                              disabled={person.isSaved}
                            />
                          </td>
                          <td className="p-2">
                            {(person.remarks || person.duplicateRemark) ? (
                              <div className="text-xs">
                                {person.remarks && (
                                  <div className="mb-1 text-blue truncate max-w-[120px]" title={person.remarks}>
                                    {person.remarks}
                                  </div>
                                )}
                                {person.duplicateRemark && (
                                  <div className="text-orange truncate max-w-[120px]" title={`Duplicate: ${person.duplicateRemark}`}>
                                    Dup: {person.duplicateRemark}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-2">
                            {person.isSaved ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Saved</span>
                            ) : (
                              <span className="text-xs bg-orange/10 text-orange px-2 py-1 rounded-full">Editing</span>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              {!person.isSaved && (
                                <button
                                  type="button"
                                  onClick={() => savePersonnel(person.id)}
                                  disabled={isCheckingDuplicates}
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  {isCheckingDuplicates ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Save className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                              {person.isSaved && (
                                <button
                                  type="button"
                                  onClick={() => editPersonnel(person.id)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue text-white rounded hover:bg-blue/80"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              )}
                              {personnelList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePersonnel(person.id)}
                                  className="flex items-center gap-1 px-1 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="text-right mt-2 p-2 bg-orange/10 rounded">
              <div className="text-center text-sm text-blue/70">
                <span className="font-medium">
                  {personnelList.length} IM Personnel • Total Fees: ₱{calculateTotalFees().toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
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
          <div ref={actionButtonsRef} className="flex flex-col gap-3 pt-2 pb-8">
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
      )}

      {activeTab === 'list' && (
        <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
          {/* Header with search and refresh */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-blue/90">IMCF Forms</h2>
                  <p className="text-sm text-gray-600">Total: {imcfForms.length} form{imcfForms.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  <button
                    onClick={loadIMCFForms}
                    disabled={isLoadingForms}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue text-white text-sm font-medium rounded-md hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingForms ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={createNewForm}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-orange text-white text-sm font-medium rounded-md hover:bg-orange/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Form
                  </button>
                </div>
              </div>
              
              {/* Search and Filters Row */}
              <div className={`transition-all duration-200 ${showFilters ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  {statusFilter !== 'all' && (
                    <button
                      onClick={() => {
                        setStatusFilter('all')
                        setCurrentPage(1)
                      }}
                      className="inline-flex items-center gap-1 px-2 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Clear filters"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoadingForms ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-blue mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading IMCF forms...</p>
              </div>
            ) : imcfForms.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No IMCF forms found
                </h3>
                <p className="text-gray-500 mb-6">
                  Create your first Independent Manpower Clearance Form to get started
                </p>
                <button
                  onClick={createNewForm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue text-white font-medium rounded-md hover:bg-blue/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create First IMCF
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {imcfForms.map((form) => {
                    const totalFees = form.personnel.reduce((total, person) => 
                      total + Number(person.packagedFee || 0) + Number(person.mondayFee || 0) + Number(person.tuesdayFee || 0) + 
                      Number(person.wednesdayFee || 0) + Number(person.thursdayFee || 0) + Number(person.fridayFee || 0) + 
                      Number(person.saturdayFee || 0) + Number(person.sundayFee || 0), 0
                    )

                    return (
                      <div
                        key={form.id}
                        className="p-4 bg-white/70 rounded-lg border hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-blue/90">{form.referenceNumber}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border ${getStatusColor(form.status)}`}>
                                {getStatusIcon(form.status)}
                                {form.status.replace('_', ' ')}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                <span>{form.project?.projectName || 'No project'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {form.coverageFromDate && form.coverageToDate
                                    ? `${new Date(form.coverageFromDate).toLocaleDateString()} - ${new Date(form.coverageToDate).toLocaleDateString()}`
                                    : 'No coverage dates'
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{form.personnel.length} personnel</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Created: {new Date(form.createdAt).toLocaleDateString()}</span>
                              <span>Total Fees: ₱{totalFees.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {form.status === 'DRAFT' && (
                              <>
                                <button
                                  onClick={() => loadIMCFForEdit(form.id)}
                                  disabled={isLoadingEditForm}
                                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                                    isLoadingEditForm 
                                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                                      : 'bg-blue text-white hover:bg-blue/80'
                                  }`}
                                  title={isLoadingEditForm ? "Loading..." : "Edit Draft"}
                                >
                                  {isLoadingEditForm ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Edit className="w-3 h-3" />
                                  )}
                                  {isLoadingEditForm ? 'Loading...' : 'Edit'}
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(form.id)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                  title="Delete Draft"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                // View details functionality can be added here
                                toast.info('View details feature coming soon')
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                              title="View Details"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    <span className="px-3 py-1 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      {activeTab === 'form' && (
        <>
          {/* Scroll to Bottom Button */}
          {showScrollToBottom && (
            <div className="fixed bottom-6 right-6 z-40">
              <button
                onClick={scrollToBottom}
                className="flex items-center gap-2 px-3 py-2 bg-blue text-white rounded-full shadow-lg hover:bg-blue/80 transition-all duration-200 hover:scale-105"
                title="Scroll to Action Buttons"
              >
                <ArrowDown className="w-4 h-4" />
                <span className="text-sm font-medium">Save Form</span>
              </button>
            </div>
          )}

          {/* Sticky Navigation Bar */}
          {showStickyActions && (
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg md:ml-64 md:left-0">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={scrollToTopOfPersonnel}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue border border-blue rounded hover:bg-blue/10 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                      Back to Personnel
                    </button>
                    <div className="text-sm text-gray-600">
                      {personnelList.length} Personnel • Total: ₱{calculateTotalFees().toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isDraftSaved && lastSavedTime && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
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
                    <button
                      onClick={scrollToBottom}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue text-white rounded hover:bg-blue/80 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                      Go to Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Duplicate Confirmation Dialog */}
      <Modal isOpen={showDuplicateConfirm} onClose={handleDuplicateCancel}>
        <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Duplicate IM Personnel Detected</h3>
              <p className="text-sm text-gray-600">This person already has service fees in other IMCF forms</p>
            </div>
          </div>
          
          {duplicateData && (
            <>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  <strong>{duplicateData.duplicates[0]?.personnelName}</strong> has been found in {duplicateData.duplicates.length} other IMCF form{duplicateData.duplicates.length > 1 ? 's' : ''} with overlapping coverage dates or service fees.
                </p>
                
                <div className="space-y-4">
                  {duplicateData.duplicates.map((duplicate) => (
                    <div key={duplicate.formId} className="p-4 bg-orange/5 rounded-lg border border-orange/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{duplicate.referenceNumber}</h4>
                          <p className="text-sm text-gray-600">{duplicate.projectName}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${duplicate.sameProject ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {duplicate.sameProject ? 'Same Project' : 'Different Project'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Coverage:</span>
                          <br />
                          {new Date(duplicate.coverageFromDate).toLocaleDateString()} - {new Date(duplicate.coverageToDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Fee Type:</span>
                          <br />
                          {duplicate.existingFeeType === 'packaged' ? 
                            `Packaged: ₱${duplicate.packagedFee.toLocaleString()}` :
                            `Daily fees on: ${Object.entries(duplicate.dailyFees)
                              .filter(([, fee]) => fee > 0)
                              .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
                              .join(', ')}`
                          }
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-white rounded border">
                        <span className="font-medium text-gray-700">Conflict:</span>
                        <p className="text-sm text-gray-600">{duplicate.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {duplicateData.duplicates.some(d => d.requiresRemark) && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remark <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={duplicateRemark}
                    onChange={(e) => setDuplicateRemark(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Please provide a reason for proceeding with this duplicate assignment..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A remark is required when there are conflicting service fees for the same period.
                  </p>
                </div>
              )}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Warning
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Proceeding will create overlapping service fee assignments. Please ensure this is intentional and properly justified.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-3">
            <button
              onClick={handleDuplicateCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel & Edit
            </button>
            <button
              onClick={handleDuplicateConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-orange rounded-md hover:bg-orange/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2"
            >
              Proceed Anyway
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)}>
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Draft</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this draft IMCF form? All the information will be permanently removed.
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              disabled={isDeletingForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteForm(showDeleteConfirm!)}
              disabled={isDeletingForm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
            >
              {isDeletingForm ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Draft
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}