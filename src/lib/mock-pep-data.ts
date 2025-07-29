export interface BudgetLine {
  id: string
  costCenter: string
  budgetCode: string
  description: string
  components: string
  finalBudget: number
  remarks: string
}

export interface PEPFormData {
  id: string
  projectName: string
  department: 'APM' | 'HR' | 'AR' | ''
  requestedBy: string
  requestDate: string
  targetDate: string
  budgetLines: BudgetLine[]
  totalBudget: number
  status: 'draft' | 'requested' | 'reviewed' | 'approved' | 'rejected'
  reviewedBy: string
  reviewDate: string
  reviewNotes: string
  approvedBy: string
  approvalDate: string
  approvalNotes: string
  createdAt: string
  updatedAt: string
}

const mockPEPDatabase: PEPFormData[] = [
  {
    id: 'PEP-001',
    projectName: 'Office Renovation Phase 1',
    department: 'APM',
    requestedBy: 'John Doe',
    requestDate: '2024-01-15',
    targetDate: '2024-03-15',
    budgetLines: [
      {
        id: '1',
        costCenter: 'CC001',
        budgetCode: 'BGT001 - Office Equipment',
        description: 'New desks and chairs for office renovation',
        components: '10 desks, 10 ergonomic chairs, 5 filing cabinets',
        finalBudget: 125000,
        remarks: 'High priority for Q1'
      }
    ],
    totalBudget: 125000,
    status: 'approved',
    reviewedBy: 'Jane Smith',
    reviewDate: '2024-01-20',
    reviewNotes: 'Budget allocation approved for facility improvement',
    approvedBy: 'CEO Mike Wilson',
    approvalDate: '2024-01-22',
    approvalNotes: 'Approved for immediate execution',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-22T14:30:00Z'
  },
  {
    id: 'PEP-002',
    projectName: 'IT Infrastructure Upgrade',
    department: 'HR',
    requestedBy: 'Sarah Connor',
    requestDate: '2024-01-20',
    targetDate: '2024-04-20',
    budgetLines: [
      {
        id: '1',
        costCenter: 'CC002',
        budgetCode: 'BGT002 - IT Hardware',
        description: 'Server upgrade and network equipment',
        components: '2 servers, network switches, cables, installation',
        finalBudget: 180000,
        remarks: 'Critical for system performance'
      }
    ],
    totalBudget: 180000,
    status: 'reviewed',
    reviewedBy: 'Tech Director Alex Lee',
    reviewDate: '2024-01-25',
    reviewNotes: 'Technical specifications approved, awaiting CEO approval',
    approvedBy: '',
    approvalDate: '',
    approvalNotes: '',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  }
]

export const mockPEPService = {
  getAllPEPs: (): PEPFormData[] => {
    return mockPEPDatabase
  },

  getPEPById: (id: string): PEPFormData | undefined => {
    return mockPEPDatabase.find(pep => pep.id === id)
  },

  createPEP: (pepData: Omit<PEPFormData, 'id' | 'createdAt' | 'updatedAt'>): PEPFormData => {
    const newPEP: PEPFormData = {
      ...pepData,
      id: `PEP-${String(mockPEPDatabase.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockPEPDatabase.push(newPEP)
    return newPEP
  },

  updatePEP: (id: string, updates: Partial<PEPFormData>): PEPFormData | null => {
    const index = mockPEPDatabase.findIndex(pep => pep.id === id)
    if (index === -1) return null

    mockPEPDatabase[index] = {
      ...mockPEPDatabase[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return mockPEPDatabase[index]
  },

  deletePEP: (id: string): boolean => {
    const index = mockPEPDatabase.findIndex(pep => pep.id === id)
    if (index === -1) return false

    mockPEPDatabase.splice(index, 1)
    return true
  },

  approvePEP: (id: string, approverName: string, notes: string = ''): PEPFormData | null => {
    const pep = mockPEPDatabase.find(p => p.id === id)
    if (!pep) return null

    pep.status = 'approved'
    pep.approvedBy = approverName
    pep.approvalDate = new Date().toISOString().split('T')[0]
    pep.approvalNotes = notes
    pep.updatedAt = new Date().toISOString()

    return pep
  },

  rejectPEP: (id: string, reviewerName: string, notes: string = ''): PEPFormData | null => {
    const pep = mockPEPDatabase.find(p => p.id === id)
    if (!pep) return null

    pep.status = 'rejected'
    pep.reviewedBy = reviewerName
    pep.reviewDate = new Date().toISOString().split('T')[0]
    pep.reviewNotes = notes
    pep.updatedAt = new Date().toISOString()

    return pep
  }
}

export const mockProjects = [
  { id: 'PROJ001', name: 'Office Renovation Phase 1', defaultCostCenter: 'CC001', defaultBudget: 150000 },
  { id: 'PROJ002', name: 'IT Infrastructure Upgrade', defaultCostCenter: 'CC002', defaultBudget: 200000 },
  { id: 'PROJ003', name: 'Marketing Campaign Q1', defaultCostCenter: 'CC003', defaultBudget: 75000 }
]

export const mockBudgetCodes = [
  { code: 'BGT001 - Office Equipment', availableBudget: 200000 },
  { code: 'BGT002 - IT Hardware', availableBudget: 300000 },
  { code: 'BGT003 - Marketing Materials', availableBudget: 100000 },
  { code: 'BGT004 - Facility Maintenance', availableBudget: 150000 },
  { code: 'BGT005 - Professional Services', availableBudget: 250000 }
]

export const departments = [
  { value: 'APM', label: 'Asset & Property Management' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'AR', label: 'Accounts Receivable' }
]