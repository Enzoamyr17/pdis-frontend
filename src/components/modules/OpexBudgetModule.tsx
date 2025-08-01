"use client"

import { useState } from "react"
import { PieChart, Save, Building, Plus, Trash2, FileText, User } from "lucide-react"
import { toast } from "sonner"

interface OpexBudgetFormData {
  referenceNumber: string
  projectName: string
  department: string
  requestedBy: string
  requestDate: string
  targetDate: string
  requestorRemarks: string
  reviewerRemarks: string
  approverRemarks: string
  financeRemarks: string
}

interface BudgetLine {
  id: string
  costCenter: string
  budgetCode: string
  description: string
  components: string
  finalBudget: number
  remarks: string
}


const organizationalStructure = {
  PGOS: {
    'Sales and Operations Group (SOG)': [
      'Business Unit 1',
      'Business Unit 2',
      'Business Development'
    ],
    'Creatives Group (CG)': [
      'Design and Multimedia',
      'Copy and Digital'
    ]
  },
  PGAS: {
    'Administrative Support Group (ASG)': [
      'Assets & Property Management',
      'People Management'
    ],
    'Accounting and Finance Group (AFG)': [
      'Accounts Payable',
      'Accounts Receivable',
      'Treasury'
    ]
  }
}

const getAllDepartments = () => {
  const allDepts: string[] = []
  Object.values(organizationalStructure).forEach(office => {
    Object.entries(office).forEach(([group, departments]) => {
      departments.forEach(dept => {
        allDepts.push(`${group} - ${dept}`)
      })
    })
  })
  return allDepts
}

const projectNames = [
  'Project Alpha - PA001',
  'Project Beta - PB002', 
  'Project Charlie - PC003',
  'Project Delta - PD004',
  'Project Echo - PE005'
]

const budgetCodes = [
  { code: 'OPEX-001', description: 'Office Supplies', availableBudget: 50000 },
  { code: 'OPEX-002', description: 'Marketing Expenses', availableBudget: 100000 },
  { code: 'OPEX-003', description: 'Travel & Transportation', availableBudget: 75000 },
  { code: 'OPEX-004', description: 'Professional Services', availableBudget: 200000 },
  { code: 'OPEX-005', description: 'Utilities', availableBudget: 80000 }
]

export default function OpexBudgetModule() {
  const [formData, setFormData] = useState<OpexBudgetFormData>({
    referenceNumber: `OPEX 25-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
    projectName: '',
    department: '',
    requestedBy: '',
    requestDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    requestorRemarks: '',
    reviewerRemarks: '',
    approverRemarks: '',
    financeRemarks: ''
  })

  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([
    {
      id: '1',
      costCenter: '',
      budgetCode: '',
      description: '',
      components: '',
      finalBudget: 0,
      remarks: ''
    }
  ])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBudgetLineChange = (id: string, field: keyof BudgetLine, value: string | number) => {
    setBudgetLines(prev => prev.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ))
  }

  const addBudgetLine = () => {
    const newBudgetLine: BudgetLine = {
      id: Date.now().toString(),
      costCenter: '',
      budgetCode: '',
      description: '',
      components: '',
      finalBudget: 0,
      remarks: ''
    }
    setBudgetLines(prev => [...prev, newBudgetLine])
  }

  const removeBudgetLine = (id: string) => {
    if (budgetLines.length > 1) {
      setBudgetLines(prev => prev.filter(line => line.id !== id))
    }
  }


  const calculateTotalBudget = () => {
    return budgetLines.reduce((total, line) => total + line.finalBudget, 0)
  }

  const getBudgetValidation = (budgetCode: string, amount: number) => {
    const budgetData = budgetCodes.find(bc => bc.code === budgetCode)
    if (!budgetData) return { isValid: true, availableBudget: 0 }
    return {
      isValid: amount <= budgetData.availableBudget,
      availableBudget: budgetData.availableBudget
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('OPEX Budget Data:', { formData, budgetLines })
    toast.success('OPEX Budget request submitted successfully!')
  }

  const inputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"
  const disabledInputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed"
  const labelClasses = "block text-xs font-medium text-blue/90 mb-1"

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-6 h-6 text-blue" />
        <h1 className="text-2xl font-semibold text-blue/90">OPEX Budget Creation (GenAd PEP)</h1>
      </div>
      
      <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Reference and Project Information */}
          <div className="flex flex-col gap-2 w-full mb-4 p-3 bg-white/50 rounded border">
            <div className="flex items-center gap-2 mb-2 md:col-span-3">
              <Building className="w-4 h-4 text-blue" />
              <h2 className="text-sm font-semibold text-blue/90">Project Information</h2>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full mb-4">
              <div className="w-[30%] min-w-[20rem] flex-grow-1">
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
              
              <div className="w-[30%] min-w-[20rem] flex-grow-1">
                <label className={labelClasses}>Requested By</label>
                <input
                  type="text"
                  name="requestedBy"
                  value={formData.requestedBy}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="Department Head Name"
                  required
                />
              </div>
              
              <div className="w-[30%] min-w-[20rem] flex-grow-1">
                <label className={labelClasses}>Department/Group</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                >
                  <option value="">Select Department</option>
                  {getAllDepartments().map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full mb-4">
              <div className="w-[30%] min-w-[20rem] flex-grow-1">
                <label className={labelClasses}>Request Date</label>
                <input
                  type="date"
                  name="requestDate"
                  value={formData.requestDate}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                />
              </div>
              
              <div className="w-[30%] min-w-[20rem] flex-grow-1">
                <label className={labelClasses}>Project Name</label>
                <select
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                >
                  <option value="">Select Project</option>
                  {projectNames.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-[30%] min-w-[20rem] flex-grow-1">
                <label className={labelClasses}>Target Completion Date</label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Budget Lines */}
          <div className="p-3 bg-white/50 rounded border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">OPEX Budget Lines</h2>
              </div>
              <button
                type="button"
                onClick={addBudgetLine}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue text-white rounded hover:bg-blue/80"
              >
                <Plus className="w-3 h-3" />
                Add Budget Line
              </button>
            </div>
            
            {budgetLines.map((line, index) => (
              <div key={line.id} className="mb-6 p-4 bg-white/70 rounded-lg border-l-4 border-orange shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-blue/90">Budget Line #{index + 1}</h3>
                  {budgetLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBudgetLine(line.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  )}
                </div>
                
                {/* Budget Line Basic Info */}
                <div className="flex flex-wrap gap-2 w-full mb-4">
                  <div className="w-[23%] min-w-[14rem] flex-grow-1">
                    <label className={labelClasses}>Cost Center</label>
                    <input
                      type="text"
                      value={line.costCenter}
                      onChange={(e) => handleBudgetLineChange(line.id, 'costCenter', e.target.value)}
                      className={inputClasses}
                      placeholder="CC001"
                      required
                    />
                  </div>
                  
                  <div className="w-[23%] min-w-[14rem] flex-grow-1">
                    <label className={labelClasses}>Budget Code</label>
                    <select
                      value={line.budgetCode}
                      onChange={(e) => handleBudgetLineChange(line.id, 'budgetCode', e.target.value)}
                      className={inputClasses}
                      required
                    >
                      <option value="">Select Budget Code</option>
                      {budgetCodes.map(budget => (
                        <option key={budget.code} value={budget.code}>
                          {budget.code} - {budget.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-[23%] min-w-[14rem] flex-grow-1">
                    <label className={labelClasses}>Final Budget (₱)</label>
                    <input
                      type="number"
                      value={line.finalBudget || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        handleBudgetLineChange(line.id, 'finalBudget', value)
                      }}
                      className={`${inputClasses} ${
                        line.budgetCode && !getBudgetValidation(line.budgetCode, line.finalBudget).isValid 
                          ? 'border-red-500' 
                          : line.budgetCode && getBudgetValidation(line.budgetCode, line.finalBudget).isValid 
                            ? 'border-green-500' 
                            : ''
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                    {line.budgetCode && (
                      <div className="mt-1">
                        {!getBudgetValidation(line.budgetCode, line.finalBudget).isValid ? (
                          <p className="text-xs text-red-600">
                            Exceeds available budget: ₱{getBudgetValidation(line.budgetCode, line.finalBudget).availableBudget.toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-xs text-green-600">
                            Available budget: ₱{getBudgetValidation(line.budgetCode, line.finalBudget).availableBudget.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-[23%] min-w-[14rem] flex-grow-1">
                    <label className={labelClasses}>Remarks</label>
                    <input
                      type="text"
                      value={line.remarks}
                      onChange={(e) => handleBudgetLineChange(line.id, 'remarks', e.target.value)}
                      className={inputClasses}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                
                {/* Description and Components */}
                <div className="flex flex-wrap gap-2 w-full mb-4">
                  <div className="w-[46%] min-w-[24rem] flex-grow-1">
                    <label className={labelClasses}>Description</label>
                    <textarea
                      value={line.description}
                      onChange={(e) => handleBudgetLineChange(line.id, 'description', e.target.value)}
                      className={`${inputClasses} h-20 resize-none`}
                      placeholder="Detailed description of the budget item"
                      required
                    />
                  </div>
                  
                  <div className="w-[46%] min-w-[24rem] flex-grow-1">
                    <label className={labelClasses}>Components</label>
                    <textarea
                      value={line.components}
                      onChange={(e) => handleBudgetLineChange(line.id, 'components', e.target.value)}
                      className={`${inputClasses} h-20 resize-none`}
                      placeholder="Components or breakdown of expenses"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-right mt-2 p-2 bg-orange/10 rounded">
              <span className="text-sm font-semibold text-blue/90">
                Total Budget: ₱{calculateTotalBudget().toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Budget Remarks */}
          <div className="flex flex-col gap-2 w-full mb-4 p-3 bg-white/50 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue" />
              <h2 className="text-sm font-semibold text-blue/90">Budget Remarks</h2>
            </div>
            
            <div>
              <label className={labelClasses}>Budget Requestor</label>
              <textarea
                name="requestorRemarks"
                value={formData.requestorRemarks}
                onChange={handleInputChange}
                className={`${inputClasses} h-16 resize-none`}
                placeholder="Enter remarks..."
              />
            </div>
            
            <div>
              <label className={labelClasses}>Budget Reviewer</label>
              <textarea
                name="reviewerRemarks"
                value={formData.reviewerRemarks}
                onChange={handleInputChange}
                className={`${disabledInputClasses} h-16 resize-none`}
                placeholder="Will be filled by Budget Reviewer..."
                disabled
              />
            </div>
            
            <div>
              <label className={labelClasses}>Budget Approver</label>
              <textarea
                name="approverRemarks"
                value={formData.approverRemarks}
                onChange={handleInputChange}
                className={`${disabledInputClasses} h-16 resize-none`}
                placeholder="Will be filled by Budget Approver..."
                disabled
              />
            </div>
            
            <div>
              <label className={labelClasses}>Finance</label>
              <textarea
                name="financeRemarks"
                value={formData.financeRemarks}
                onChange={handleInputChange}
                className={`${disabledInputClasses} h-16 resize-none`}
                placeholder="Will be filled by Finance..."
                disabled
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue text-white font-medium rounded hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Submit OPEX Budget Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}