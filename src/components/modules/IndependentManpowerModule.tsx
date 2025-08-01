"use client"

import { useState, useEffect } from "react"
import { IdCard, Save, MapPin, Phone, Mail, Calendar, User, Home, CreditCard, Facebook, Link, Users, List, Search, Trash2, Eye, RefreshCw, ArrowLeft, ToggleLeft, ToggleRight, Filter, X, Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FormData {
  lastName: string
  firstName: string
  middleName: string
  birthday: string
  contactNo: string
  email: string
  houseNo: string
  street: string
  subdivision: string
  region: string
  province: string
  cityMunicipality: string
  barangay: string
  ownGcash: string
  authorizedGcash: string
  authorizedReceiver: string
  fbLink: string
  imFilesLink: string
}

interface Region {
  psgc_id: string
  name: string
  population: string
}

interface Province {
  psgc_id: string
  name: string
  region_psgc_id: string
  population: string
}

interface City {
  psgc_id: string
  name: string
  province_psgc_id: string
  population: string
}

interface Barangay {
  psgc_id: string
  name: string
  municipal_city_psgc_id: string
  population: string
}

interface IMData extends FormData {
  id: string
  imNumber: string
  registrationDate: string
  status: 'ACTIVE' | 'INACTIVE' | null
  fullName: string
  fullAddress: string
}

export default function IndependentManpowerModule() {
  const [activeTab, setActiveTab] = useState<'registration' | 'list'>('registration')
  const [currentView, setCurrentView] = useState<'main' | 'details' | 'edit'>('main')
  const [imList, setImList] = useState<IMData[]>([])
  const [filteredImList, setFilteredImList] = useState<IMData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [selectedIM, setSelectedIM] = useState<IMData | null>(null)
  const [editData, setEditData] = useState<FormData | null>(null)
  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    lastName: "",
    firstName: "",
    middleName: "",
    birthday: "",
    contactNo: "",
    email: "",
    houseNo: "",
    street: "",
    subdivision: "",
    region: "",
    province: "",
    cityMunicipality: "",
    barangay: "",
    ownGcash: "",
    authorizedGcash: "",
    authorizedReceiver: "",
    fbLink: "",
    imFilesLink: ""
  })

  const [regions, setRegions] = useState<Region[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loading, setLoading] = useState({
    regions: false,
    provinces: false,
    cities: false,
    barangays: false
  })

  useEffect(() => {
    loadRegions()
    if (activeTab === 'list') {
      loadIMList()
    }
  }, [activeTab])

  useEffect(() => {
    // Filter IM list based on search term and status
    let filtered = imList
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(im => 
        im.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        im.imNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        im.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        im.contactNo.includes(searchTerm) ||
        im.fullAddress.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(im => (im.status || 'ACTIVE') === statusFilter)
    }
    
    setFilteredImList(filtered)
  }, [searchTerm, statusFilter, imList])

  const loadIMList = async () => {
    setIsLoadingList(true)
    try {
      const response = await fetch('/api/im')
      if (response.ok) {
        const data = await response.json()
        // Transform the data to include computed fields
        const transformedData = data.map((im: IMData) => ({
          ...im,
          fullName: `${im.firstName} ${im.middleName ? im.middleName + ' ' : ''}${im.lastName}`,
          fullAddress: `${im.houseNo} ${im.street}, ${im.subdivision ? im.subdivision + ', ' : ''}${im.barangay}, ${im.cityMunicipality}, ${im.province ? im.province + ', ' : ''}${im.region}`
        }))
        setImList(transformedData)
      } else {
        console.error('Failed to load IM list')
      }
    } catch (error) {
      console.error('Error loading IM list:', error)
    } finally {
      setIsLoadingList(false)
    }
  }

  const loadRegions = async () => {
    setLoading(prev => ({ ...prev, regions: true }))
    try {
      const response = await fetch('https://psgc.rootscratch.com/region')
      const data = await response.json()
      setRegions(data || [])
    } catch (error) {
      console.error('Error loading regions:', error)
    } finally {
      setLoading(prev => ({ ...prev, regions: false }))
    }
  }

  const loadProvinces = async (regionId: string) => {
    if (!regionId) return
    setLoading(prev => ({ ...prev, provinces: true }))
    try {
      const response = await fetch(`https://psgc.rootscratch.com/province?id=${regionId}`)
      const data = await response.json()
      setProvinces(data || [])
      setCities([])
      setBarangays([])
      setFormData(prev => ({ ...prev, province: "", cityMunicipality: "", barangay: "" }))
      
      // Special handling for NCR - if no provinces, load cities directly
      if (!data || data.length === 0) {
        loadCities(regionId)
      }
    } catch (error) {
      console.error('Error loading provinces:', error)
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }))
    }
  }

  const loadCities = async (provinceId: string) => {
    if (!provinceId) return
    setLoading(prev => ({ ...prev, cities: true }))
    try {
      const response = await fetch(`https://psgc.rootscratch.com/municipal-city?id=${provinceId}`)
      const data = await response.json()
      setCities(data || [])
      setBarangays([])
      setFormData(prev => ({ ...prev, cityMunicipality: "", barangay: "" }))
    } catch (error) {
      console.error('Error loading cities:', error)
    } finally {
      setLoading(prev => ({ ...prev, cities: false }))
    }
  }

  const loadBarangays = async (cityId: string) => {
    if (!cityId) return
    setLoading(prev => ({ ...prev, barangays: true }))
    try {
      const response = await fetch(`https://psgc.rootscratch.com/barangay?id=${cityId}`)
      const data = await response.json()
      setBarangays(data || [])
      setFormData(prev => ({ ...prev, barangay: "" }))
    } catch (error) {
      console.error('Error loading barangays:', error)
    } finally {
      setLoading(prev => ({ ...prev, barangays: false }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'region') {
      const selectedRegion = regions.find(r => r.name === value)
      if (selectedRegion) {
        loadProvinces(selectedRegion.psgc_id)
      }
    } else if (name === 'province') {
      const selectedProvince = provinces.find(p => p.name === value)
      if (selectedProvince) {
        loadCities(selectedProvince.psgc_id)
      }
    } else if (name === 'cityMunicipality') {
      const selectedCity = cities.find(c => c.name === value)
      if (selectedCity) {
        loadBarangays(selectedCity.psgc_id)
      }
    }
  }

  // Helper function to check if current region has provinces
  const hasProvinces = provinces.length > 0
  const isNCR = formData.region.includes('NCR') || formData.region.includes('National Capital Region')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateGcashFields = () => {
    const hasOwnGcash = formData.ownGcash.trim() !== ""
    const hasAuthorizedGcash = formData.authorizedGcash.trim() !== ""
    const hasAuthorizedReceiver = formData.authorizedReceiver.trim() !== ""

    if (!hasOwnGcash && !hasAuthorizedGcash) {
      toast.error('Please provide either Own Gcash or Authorized Gcash number.')
      return false
    }

    if (hasAuthorizedGcash && !hasAuthorizedReceiver) {
      toast.error('Authorized Receiver name is required when providing Authorized Gcash.')
      return false
    }

    return true
  }

  const handleDeleteIM = async (imId: string) => {
    if (!confirm('Are you sure you want to delete this IM record?')) {
      return
    }

    try {
      const response = await fetch(`/api/im/${imId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('IM record deleted successfully!')
        handleBackToList() // Go back to list
        loadIMList() // Refresh the list
      } else {
        const errorText = await response.text()
        toast.error(`Error deleting IM record: ${errorText}`)
      }
    } catch (error) {
      console.error('Error deleting IM record:', error)
      toast.error('Error deleting IM record. Please try again.')
    }
  }

  const handleToggleStatus = async (imId: string, currentStatus: 'ACTIVE' | 'INACTIVE' | null) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'inactive' : 'active'
    const newPrismaStatus: 'ACTIVE' | 'INACTIVE' = newStatus === 'active' ? 'ACTIVE' : 'INACTIVE'
    
    // Set loading state
    setStatusLoading(imId)
    
    // Optimistic update - immediately update the UI
    const optimisticUpdate = (items: IMData[]) => 
      items.map(im => im.id === imId ? { ...im, status: newPrismaStatus } : im)
    
    setImList(prev => optimisticUpdate(prev))
    setFilteredImList(prev => optimisticUpdate(prev))
    
    // Update selected IM if it's currently being viewed
    if (selectedIM && selectedIM.id === imId) {
      setSelectedIM(prev => prev ? { ...prev, status: newPrismaStatus } : null)
    }
    
    try {
      const response = await fetch(`/api/im/${imId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedIM = await response.json()
        
        // Update with actual server response
        const serverUpdate = (items: IMData[]) => 
          items.map(im => im.id === imId ? {
            ...updatedIM,
            fullName: `${updatedIM.firstName} ${updatedIM.middleName ? updatedIM.middleName + ' ' : ''}${updatedIM.lastName}`,
            fullAddress: `${updatedIM.houseNo} ${updatedIM.street}, ${updatedIM.subdivision ? updatedIM.subdivision + ', ' : ''}${updatedIM.barangay}, ${updatedIM.cityMunicipality}, ${updatedIM.province ? updatedIM.province + ', ' : ''}${updatedIM.region}`
          } : im)
        
        setImList(prev => serverUpdate(prev))
        setFilteredImList(prev => serverUpdate(prev))
        
        // Update selected IM with server data
        if (selectedIM && selectedIM.id === imId) {
          setSelectedIM({
            ...updatedIM,
            fullName: `${updatedIM.firstName} ${updatedIM.middleName ? updatedIM.middleName + ' ' : ''}${updatedIM.lastName}`,
            fullAddress: `${updatedIM.houseNo} ${updatedIM.street}, ${updatedIM.subdivision ? updatedIM.subdivision + ', ' : ''}${updatedIM.barangay}, ${updatedIM.cityMunicipality}, ${updatedIM.province ? updatedIM.province + ', ' : ''}${updatedIM.region}`
          })
        }
        
        // Show success message
        const displayStatus = newPrismaStatus === 'ACTIVE' ? 'Active' : 'Inactive'
        toast.success(`IM status changed to ${displayStatus}!`)
      } else {
        // Revert optimistic update on error
        const revertUpdate = (items: IMData[]) => 
          items.map(im => im.id === imId ? { ...im, status: currentStatus } : im)
        
        setImList(prev => revertUpdate(prev))
        setFilteredImList(prev => revertUpdate(prev))
        
        if (selectedIM && selectedIM.id === imId) {
          setSelectedIM(prev => prev ? { ...prev, status: currentStatus } : null)
        }
        
        const errorText = await response.text()
        toast.error(`Error changing status: ${errorText}`)
      }
    } catch (error) {
      // Revert optimistic update on error
      const revertUpdate = (items: IMData[]) => 
        items.map(im => im.id === imId ? { ...im, status: currentStatus } : im)
      
      setImList(prev => revertUpdate(prev))
      setFilteredImList(prev => revertUpdate(prev))
      
      if (selectedIM && selectedIM.id === imId) {
        setSelectedIM(prev => prev ? { ...prev, status: currentStatus } : null)
      }
      
      console.error('Error changing IM status:', error)
      toast.error('Error changing status. Please try again.')
    } finally {
      setStatusLoading(null)
    }
  }

  const handleEditIM = (im: IMData) => {
    setEditData({
      lastName: im.lastName,
      firstName: im.firstName,
      middleName: im.middleName || '',
      birthday: new Date(im.birthday).toISOString().split('T')[0],
      contactNo: im.contactNo,
      email: im.email,
      houseNo: im.houseNo,
      street: im.street,
      subdivision: im.subdivision || '',
      region: im.region,
      province: im.province || '',
      cityMunicipality: im.cityMunicipality,
      barangay: im.barangay,
      ownGcash: im.ownGcash || '',
      authorizedGcash: im.authorizedGcash || '',
      authorizedReceiver: im.authorizedReceiver || '',
      fbLink: im.fbLink || '',
      imFilesLink: im.imFilesLink || ''
    })
    setSelectedIM(im)
    setCurrentView('edit')
  }

  const handleUpdateIM = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedIM || !editData) return
    
    if (!validateGcashFields()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/im/${selectedIM.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const updatedIM = await response.json()
        toast.success('IM record updated successfully!')
        
        // Update the selected IM with computed fields
        const transformedIM = {
          ...updatedIM,
          fullName: `${updatedIM.firstName} ${updatedIM.middleName ? updatedIM.middleName + ' ' : ''}${updatedIM.lastName}`,
          fullAddress: `${updatedIM.houseNo} ${updatedIM.street}, ${updatedIM.subdivision ? updatedIM.subdivision + ', ' : ''}${updatedIM.barangay}, ${updatedIM.cityMunicipality}, ${updatedIM.province ? updatedIM.province + ', ' : ''}${updatedIM.region}`
        }
        
        setSelectedIM(transformedIM)
        setCurrentView('details')
        loadIMList() // Refresh the list
      } else {
        const errorText = await response.text()
        toast.error(`Error updating IM record: ${errorText}`)
      }
    } catch (error) {
      console.error('Error updating IM record:', error)
      toast.error('Error updating IM record. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewIM = (im: IMData) => {
    setSelectedIM(im)
    setCurrentView('details')
  }

  const handleBackToList = () => {
    setCurrentView('main')
    setSelectedIM(null)
  }

  const getStatusBadge = (status: string | null) => {
    const normalizedStatus = status || 'ACTIVE'
    const statusClasses = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      INACTIVE: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const displayStatus = normalizedStatus === 'ACTIVE' ? 'Active' : 'Inactive'
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusClasses[normalizedStatus as keyof typeof statusClasses] || statusClasses.ACTIVE}`}>
        {displayStatus}
      </span>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateGcashFields()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/im', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newIM = await response.json()
        toast.success(`IM Registration submitted successfully! IM Number: ${newIM.imNumber}`)
        
        // Reset form
        setFormData({
          lastName: "",
          firstName: "",
          middleName: "",
          birthday: "",
          contactNo: "",
          email: "",
          houseNo: "",
          street: "",
          subdivision: "",
          region: "",
          province: "",
          cityMunicipality: "",
          barangay: "",
          ownGcash: "",
          authorizedGcash: "",
          authorizedReceiver: "",
          fbLink: "",
          imFilesLink: ""
        })
        
        // Reset location dropdowns
        setProvinces([])
        setCities([])
        setBarangays([])

        // Refresh IM list if we're currently on that tab
        if (activeTab === 'list') {
          loadIMList()
        }
      } else {
        const errorText = await response.text()
        toast.error(`Error submitting registration: ${errorText}`)
      }
    } catch (error) {
      console.error('Error submitting IM registration:', error)
      toast.error('Error submitting registration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"
  const labelClasses = "block text-xs font-medium text-blue/90 mb-1"

  // Show IM Edit view
  if (currentView === 'edit' && selectedIM && editData) {
    return (
      <div className="h-full p-4 overflow-auto min-w-[32rem]">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setCurrentView('details')}
            className="flex items-center gap-2 px-3 py-2 text-blue hover:text-blue/80 hover:bg-blue/10 rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Details
          </button>
        </div>

        <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue/10 flex items-center justify-center">
                <Edit className="h-6 w-6 text-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-blue/90">Edit IM Record</h1>
                <p className="text-gray-600">IM#{selectedIM.imNumber}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateIM} className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="flex flex-col gap-4 p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Personal Information</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editData.lastName}
                    onChange={(e) => setEditData(prev => prev ? {...prev, lastName: e.target.value} : null)}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editData.firstName}
                    onChange={(e) => setEditData(prev => prev ? {...prev, firstName: e.target.value} : null)}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={editData.middleName}
                    onChange={(e) => setEditData(prev => prev ? {...prev, middleName: e.target.value} : null)}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-4 p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Contact Information</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Birthday *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="birthday"
                      value={editData.birthday}
                      onChange={(e) => setEditData(prev => prev ? {...prev, birthday: e.target.value} : null)}
                      className={`${inputClasses} pl-10`}
                      required
                    />
                  </div>
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Contact No. *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="contactNo"
                      value={editData.contactNo}
                      onChange={(e) => setEditData(prev => prev ? {...prev, contactNo: e.target.value} : null)}
                      className={`${inputClasses} pl-10`}
                      placeholder="+63 9XX XXX XXXX"
                      required
                    />
                  </div>
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => prev ? {...prev, email: e.target.value} : null)}
                      className={`${inputClasses} pl-10`}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="flex flex-col gap-4 p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Payment Information</h2>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You must provide either your own GCash number OR an authorized GCash number with receiver name.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Own Gcash</label>
                  <input
                    type="text"
                    name="ownGcash"
                    value={editData.ownGcash}
                    onChange={(e) => setEditData(prev => prev ? {...prev, ownGcash: e.target.value} : null)}
                    className={inputClasses}
                    placeholder="09XX XXX XXXX"
                  />
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Authorized Gcash</label>
                  <input
                    type="text"
                    name="authorizedGcash"
                    value={editData.authorizedGcash}
                    onChange={(e) => setEditData(prev => prev ? {...prev, authorizedGcash: e.target.value} : null)}
                    className={inputClasses}
                    placeholder="09XX XXX XXXX"
                  />
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>
                    Authorized Receiver {editData.authorizedGcash && "*"}
                  </label>
                  <input
                    type="text"
                    name="authorizedReceiver"
                    value={editData.authorizedReceiver}
                    onChange={(e) => setEditData(prev => prev ? {...prev, authorizedReceiver: e.target.value} : null)}
                    className={inputClasses}
                    placeholder="Full Name"
                    required={!!editData.authorizedGcash}
                  />
                </div>
              </div>
            </div>

            {/* Social Media & Files */}
            <div className="flex flex-col gap-4 p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Link className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Social Media & Files</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-[48%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>FB Link</label>
                  <div className="relative">
                    <Facebook className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="url"
                      name="fbLink"
                      value={editData.fbLink}
                      onChange={(e) => setEditData(prev => prev ? {...prev, fbLink: e.target.value} : null)}
                      className={`${inputClasses} pl-10`}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                </div>
                <div className="w-[48%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>IM Files Link</label>
                  <div className="relative">
                    <Link className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="url"
                      name="imFilesLink"
                      value={editData.imFilesLink}
                      onChange={(e) => setEditData(prev => prev ? {...prev, imFilesLink: e.target.value} : null)}
                      className={`${inputClasses} pl-10`}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setCurrentView('details')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-white font-medium rounded-lg hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Updating...' : 'Update IM Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Show IM Details view
  if (currentView === 'details' && selectedIM) {
    return (
      <div className="h-full p-4 overflow-auto min-w-[32rem]">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-3 py-2 text-blue hover:text-blue/80 hover:bg-blue/10 rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to IM List
          </button>
        </div>

        <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue/10 flex items-center justify-center">
                <User className="h-6 w-6 text-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-blue/90">{selectedIM.fullName}</h1>
                <p className="text-gray-600">IM#{selectedIM.imNumber} • {getStatusBadge(selectedIM.status)}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-white/50 rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-blue/90 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="text-base text-gray-900">{selectedIM.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">IM Number</dt>
                    <dd className="text-base text-gray-900">IM#{selectedIM.imNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Birthday</dt>
                    <dd className="text-base text-gray-900">{new Date(selectedIM.birthday).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                    <dd className="text-base text-gray-900">{new Date(selectedIM.registrationDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-base text-gray-900">{getStatusBadge(selectedIM.status)}</dd>
                  </div>
                </dl>
              </div>

              {/* Contact Information */}
              <div className="bg-white/50 rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-blue/90 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                    <dd className="text-base text-gray-900">{selectedIM.contactNo}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-base text-gray-900">{selectedIM.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="text-base text-gray-900">{selectedIM.fullAddress}</dd>
                  </div>
                </dl>
              </div>

              {/* Payment Information */}
              <div className="bg-white/50 rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-blue/90 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h3>
                <dl className="space-y-3">
                  {selectedIM.ownGcash ? (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Own GCash</dt>
                      <dd className="text-base text-gray-900">{selectedIM.ownGcash}</dd>
                    </div>
                  ) : (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Authorized GCash</dt>
                        <dd className="text-base text-gray-900">{selectedIM.authorizedGcash}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Authorized Receiver</dt>
                        <dd className="text-base text-gray-900">{selectedIM.authorizedReceiver}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>

              {/* Links */}
              <div className="bg-white/50 rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-blue/90 mb-4 flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Links & Files
                </h3>
                <dl className="space-y-3">
                  {selectedIM.fbLink ? (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Facebook</dt>
                      <dd className="text-base">
                        <a 
                          href={selectedIM.fbLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue hover:text-blue/80 break-all underline"
                        >
                          {selectedIM.fbLink}
                        </a>
                      </dd>
                    </div>
                  ) : (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Facebook</dt>
                      <dd className="text-base text-gray-400">Not provided</dd>
                    </div>
                  )}
                  {selectedIM.imFilesLink ? (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">IM Files</dt>
                      <dd className="text-base">
                        <a 
                          href={selectedIM.imFilesLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue hover:text-blue/80 break-all underline"
                        >
                          {selectedIM.imFilesLink}
                        </a>
                      </dd>
                    </div>
                  ) : (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">IM Files</dt>
                      <dd className="text-base text-gray-400">Not provided</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleStatus(selectedIM.id, selectedIM.status)}
                  disabled={statusLoading === selectedIM.id}
                  className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    (selectedIM.status || 'ACTIVE') === 'ACTIVE'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                      : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500'
                  }`}
                >
                  {statusLoading === selectedIM.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Updating...</>
                  ) : (selectedIM.status || 'ACTIVE') === 'ACTIVE' ? (
                    <><ToggleRight className="w-4 h-4" />Set Inactive</>
                  ) : (
                    <><ToggleLeft className="w-4 h-4" />Set Active</>
                  )}
                </button>
                
                <button
                  onClick={() => handleEditIM(selectedIM)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue text-white font-medium rounded-md hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit IM
                </button>
              </div>
              
              <button
                onClick={() => handleDeleteIM(selectedIM.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete IM
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-4 overflow-auto min-w-[32rem]">
      <div className="flex items-center gap-3 mb-6">
        <IdCard className="w-8 h-8 text-blue" />
        <h1 className="text-3xl font-semibold text-blue/90">Independent Manpower</h1>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('registration')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'registration'
                  ? 'border-blue text-blue'
                  : 'border-transparent text-blue/90 hover:text-blue/90 hover:border-zinc-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              IM Registration
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
              IM List
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'registration' && (
        <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Personal Information */}
            <div className="flex flex-col gap-4 p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Personal Information</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-4 p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Contact Information</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Birthday *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      required
                    />
                  </div>
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Contact No. *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="+63 9XX XXX XXXX"
                      required
                    />
                  </div>
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="flex flex-col gap-4 p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Address Information</h2>
              </div>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="w-[48%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>Building/Unit/House No. *</label>
                  <input
                    type="text"
                    name="houseNo"
                    value={formData.houseNo}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className="w-[48%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>Street *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="w-[48%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>Subdivision</label>
                  <input
                    type="text"
                    name="subdivision"
                    value={formData.subdivision}
                    onChange={handleInputChange}
                    className={inputClasses}
                  />
                </div>
                <div className="w-[48%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>Region *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      required
                      disabled={loading.regions}
                    >
                      <option value="">
                        {loading.regions ? "Loading regions..." : "Select Region"}
                      </option>
                      {regions.map(region => (
                        <option key={region.psgc_id} value={region.name}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {hasProvinces && !isNCR && (
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="w-[48%] min-w-[24rem] flex-grow-1">
                    <label className={labelClasses}>Province *</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                      disabled={!formData.region || loading.provinces}
                    >
                      <option value="">
                        {loading.provinces ? "Loading provinces..." : "Select Province"}
                      </option>
                      {provinces.map(province => (
                        <option key={province.psgc_id} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                <div className="w-[48%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>City/Municipality *</label>
                  <select
                    name="cityMunicipality"
                    value={formData.cityMunicipality}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                    disabled={
                      (!formData.region || loading.cities) || 
                      (hasProvinces && !isNCR && !formData.province)
                    }
                  >
                    <option value="">
                      {loading.cities ? "Loading cities..." : "Select City/Municipality"}
                    </option>
                    {cities.map(city => (
                      <option key={city.psgc_id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-[48%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>Barangay *</label>
                  <select
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                    disabled={!formData.cityMunicipality || loading.barangays}
                  >
                    <option value="">
                      {loading.barangays ? "Loading barangays..." : "Select Barangay"}
                    </option>
                    {barangays.map(barangay => (
                      <option key={barangay.psgc_id} value={barangay.name}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="flex flex-col gap-4 p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Payment Information</h2>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You must provide either your own GCash number OR an authorized GCash number with receiver name.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Own Gcash</label>
                  <input
                    type="text"
                    name="ownGcash"
                    value={formData.ownGcash}
                    onChange={handleInputChange}
                    className={inputClasses}
                    placeholder="09XX XXX XXXX"
                  />
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>Authorized Gcash</label>
                  <input
                    type="text"
                    name="authorizedGcash"
                    value={formData.authorizedGcash}
                    onChange={handleInputChange}
                    className={inputClasses}
                    placeholder="09XX XXX XXXX"
                  />
                </div>
                <div className="w-[30%] min-w-[22rem] flex-grow-1">
                  <label className={labelClasses}>
                    Authorized Receiver {formData.authorizedGcash && "*"}
                  </label>
                  <input
                    type="text"
                    name="authorizedReceiver"
                    value={formData.authorizedReceiver}
                    onChange={handleInputChange}
                    className={inputClasses}
                    placeholder="Full Name"
                    required={!!formData.authorizedGcash}
                  />
                </div>
              </div>
            </div>

            {/* Social Media & Files */}
            <div className="flex flex-col gap-4 p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Link className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Social Media & Files</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-[48%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>FB Link</label>
                  <div className="relative">
                    <Facebook className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="url"
                      name="fbLink"
                      value={formData.fbLink}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                </div>
                <div className="w-[48%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>IM Files Link</label>
                  <div className="relative">
                    <Link className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="url"
                      name="imFilesLink"
                      value={formData.imFilesLink}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-white font-medium rounded-lg hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Registering...' : 'Register Independent Manpower'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
          {/* Header with search and refresh */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-blue/90">Independent Manpower List</h2>
                  <p className="text-sm text-gray-600">Total: {filteredImList.length} IM{filteredImList.length !== 1 ? 's' : ''}</p>
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
                    onClick={loadIMList}
                    disabled={isLoadingList}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue text-white text-sm font-medium rounded-md hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Search and Filters Row */}
              <div className={`transition-all duration-200 ${showFilters ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search by name, IM number, email, contact, or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white text-sm w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | 'ACTIVE' | 'INACTIVE')}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  {(searchTerm || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                      }}
                      className="inline-flex items-center gap-1 px-2 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Clear filters"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Always visible search for mobile */}
              <div className={`${showFilters ? 'hidden' : 'block sm:hidden'}`}>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search IMs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white text-sm w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoadingList ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-blue mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading IM records...</p>
              </div>
            ) : filteredImList.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {searchTerm ? 'No matching records found' : 'No IM records yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Register your first Independent Manpower to get started'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setActiveTab('registration')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue text-white font-medium rounded-md hover:bg-blue/80 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Register First IM
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IM Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredImList.map((im) => (
                      <tr key={im.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{im.fullName}</div>
                              <div className="text-sm text-gray-500">IM#{im.imNumber}</div>
                              <div className="text-xs text-gray-400">
                                Registered: {new Date(im.registrationDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{im.contactNo}</div>
                          <div className="text-sm text-gray-500">{im.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {im.ownGcash ? (
                              <div>
                                <span className="text-xs text-gray-500">Own:</span> {im.ownGcash}
                              </div>
                            ) : (
                              <div>
                                <span className="text-xs text-gray-500">Auth:</span> {im.authorizedGcash}
                                <div className="text-xs text-gray-400">{im.authorizedReceiver}</div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(im.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewIM(im)}
                              className="text-blue hover:text-blue/80 p-1 rounded hover:bg-blue/10 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(im.id, im.status)}
                              disabled={statusLoading === im.id}
                              className={`p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                (im.status || 'ACTIVE') === 'ACTIVE'
                                  ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                  : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                              }`}
                              title={statusLoading === im.id ? 'Updating...' : `Set ${(im.status || 'ACTIVE') === 'ACTIVE' ? 'Inactive' : 'Active'}`}
                            >
                              {statusLoading === im.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (im.status || 'ACTIVE') === 'ACTIVE' ? (
                                <ToggleRight className="w-4 h-4" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteIM(im.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}