"use client"

import { useState } from "react"
import { FileText, Save, Plus, Trash2, Calendar, Building, User, CreditCard } from "lucide-react"

interface IMClearanceFormData {
  referenceNumber: string
  projectName: string
  budgetCode: string
  cepdNumber: string
  clearanceRequestor: string
  department: string
  dateOfRequest: string
  coverageFromDate: string
  coverageToDate: string
  clearanceRequestorRemarks: string
  clearanceReviewerRemarks: string
  clearanceApproverRemarks: string
  hrdRemarks: string
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

export default function IMClearanceFormModule() {
  const [formData, setFormData] = useState<IMClearanceFormData>({
    referenceNumber: `IMCF 24-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
    projectName: '',
    budgetCode: '',
    cepdNumber: `24-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}.1 V1`,
    clearanceRequestor: '',
    department: '',
    dateOfRequest: new Date().toISOString().split('T')[0],
    coverageFromDate: '',
    coverageToDate: '',
    clearanceRequestorRemarks: '',
    clearanceReviewerRemarks: '',
    clearanceApproverRemarks: '',
    hrdRemarks: ''
  })

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
      authGcashAccName: ''
    }
  ])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePersonnelChange = (id: string, field: keyof IMPersonnel, value: string | number | IMPersonnel['dailyFees']) => {
    setPersonnelList(prev => prev.map(person => 
      person.id === id ? { ...person, [field]: value } : person
    ))
  }

  const addPersonnel = () => {
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
      authGcashAccName: ''
    }
    setPersonnelList(prev => [...prev, newPersonnel])
  }

  const removePersonnel = (id: string) => {
    if (personnelList.length > 1) {
      setPersonnelList(prev => prev.filter(person => person.id !== id))
    }
  }


  const calculateTotalFees = () => {
    return personnelList.reduce((total, person) => {
      const weeklyTotal = Object.values(person.dailyFees).reduce((sum, fee) => sum + fee, 0)
      return total + person.packagedFee + weeklyTotal
    }, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('IMCF Data:', { formData, personnelList })
    alert('IM Clearance Form submitted successfully!')
  }

  const inputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"
  const disabledInputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-200 rounded bg-zinc-100 text-zinc-500 cursor-not-allowed"
  const labelClasses = "block text-xs font-medium text-blue/90 mb-1"

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-blue" />
        <h1 className="text-2xl font-semibold text-blue/90">Independent Manpower Clearance Form</h1>
      </div>
      
      <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Reference and Project Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white/50 rounded border">
            <div className="flex items-center gap-2 mb-2 md:col-span-3">
              <Building className="w-4 h-4 text-blue" />
              <h2 className="text-sm font-semibold text-blue/90">Project Information</h2>
            </div>
            
            <div>
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
            
            <div>
              <label className={labelClasses}>Clearance Requestor</label>
              <input
                type="text"
                name="clearanceRequestor"
                value={formData.clearanceRequestor}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            
            <div>
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
            
            <div>
              <label className={labelClasses}>Date of Request</label>
              <input
                type="date"
                name="dateOfRequest"
                value={formData.dateOfRequest}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            
            <div>
              <label className={labelClasses}>Project Name / Budget Code</label>
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
            
            <div>
              <label className={labelClasses}>CEPD No.</label>
              <input
                type="text"
                name="cepdNumber"
                value={formData.cepdNumber}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            
            <div>
              <label className={labelClasses}>Coverage From Date</label>
              <input
                type="date"
                name="coverageFromDate"
                value={formData.coverageFromDate}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            
            <div>
              <label className={labelClasses}>Coverage To Date</label>
              <input
                type="date"
                name="coverageToDate"
                value={formData.coverageToDate}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
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
                Add Personnel
              </button>
            </div>
            
            {personnelList.map((person, index) => (
              <div key={person.id} className="mb-6 p-4 bg-white/70 rounded-lg border-l-4 border-orange shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-blue/90">Personnel #{index + 1}</h3>
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
                
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className={labelClasses}>Registered Name</label>
                    <input
                      type="text"
                      value={person.registeredName}
                      onChange={(e) => handlePersonnelChange(person.id, 'registeredName', e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={labelClasses}>Position</label>
                    <input
                      type="text"
                      value={person.position}
                      onChange={(e) => handlePersonnelChange(person.id, 'position', e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={labelClasses}>Outlet/Venue</label>
                    <input
                      type="text"
                      value={person.outletVenue}
                      onChange={(e) => handlePersonnelChange(person.id, 'outletVenue', e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={labelClasses}>Packaged Fee (₱)</label>
                    <input
                      type="number"
                      value={person.packagedFee}
                      onChange={(e) => handlePersonnelChange(person.id, 'packagedFee', parseFloat(e.target.value) || 0)}
                      className={inputClasses}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                {/* Daily Fees */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-blue/90 mb-3">Daily Fees (₱)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {Object.entries(person.dailyFees).map(([day, fee]) => (
                      <div key={day}>
                        <label className={labelClasses}>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                        <input
                          type="number"
                          value={fee}
                          onChange={(e) => {
                            const newDailyFees = { ...person.dailyFees, [day]: parseFloat(e.target.value) || 0 }
                            handlePersonnelChange(person.id, 'dailyFees', newDailyFees)
                          }}
                          className={inputClasses}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* GCash Information */}
                <div>
                  <label className="block text-sm font-medium text-blue/90 mb-3">GCash Information</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClasses}>Own Gcash</label>
                      <input
                        type="text"
                        value={person.ownGcash}
                        onChange={(e) => handlePersonnelChange(person.id, 'ownGcash', e.target.value)}
                        className={inputClasses}
                        placeholder="09XX XXX XXXX"
                      />
                    </div>
                    
                    <div>
                      <label className={labelClasses}>Auth Gcash</label>
                      <input
                        type="text"
                        value={person.authGcash}
                        onChange={(e) => handlePersonnelChange(person.id, 'authGcash', e.target.value)}
                        className={inputClasses}
                        placeholder="09XX XXX XXXX"
                      />
                    </div>
                    
                    <div>
                      <label className={labelClasses}>Auth Gcash Name</label>
                      <input
                        type="text"
                        value={person.authGcashAccName}
                        onChange={(e) => handlePersonnelChange(person.id, 'authGcashAccName', e.target.value)}
                        className={inputClasses}
                        placeholder="Full Name"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-right mt-2 p-2 bg-orange/10 rounded">
              <span className="text-sm font-semibold text-blue/90">
                Total Fees: ₱{calculateTotalFees().toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Clearance Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white/50 rounded border">
            <div className="flex items-center gap-2 mb-2 md:col-span-2">
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

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue text-white font-medium rounded hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Submit IMCF
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}