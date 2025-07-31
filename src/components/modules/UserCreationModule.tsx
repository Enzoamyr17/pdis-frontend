"use client"

import { useState, useEffect } from "react"
import { UserCheck, User, Calendar, MapPin, Phone, Mail, Building, Shield, Upload, Save } from "lucide-react"
import UserPermissionsTab from "../UserPermissionsTab"

interface EmployeeFormData {
  picture: string
  name: string
  position: string
  idNumber: string
  employmentDate: string
  office: 'PGAS' | 'PGOS' | ''
  group: string
  department: string
  contactNumber: string
  pdEmail: string
  personalEmail: string
  birthdate: string
  houseNo: string
  street: string
  subdivision: string
  region: string
  province: string
  cityMunicipality: string
  barangay: string
  emailGroup: string
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

export default function UserCreationModule() {
  const [activeTab, setActiveTab] = useState<'encoding' | 'permissions'>('encoding')
  const [formData, setFormData] = useState<EmployeeFormData>({
    picture: '',
    name: '',
    position: '',
    idNumber: '',
    employmentDate: '',
    office: '',
    group: '',
    department: '',
    contactNumber: '',
    pdEmail: '',
    personalEmail: '',
    birthdate: '',
    houseNo: '',
    street: '',
    subdivision: '',
    region: '',
    province: '',
    cityMunicipality: '',
    barangay: '',
    emailGroup: ''
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
  }, [])

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
    } else if (name === 'office') {
      setFormData(prev => ({ ...prev, group: '', department: '' }))
    } else if (name === 'group') {
      setFormData(prev => ({ ...prev, department: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Employee Data:', formData)
    alert('Employee data submitted successfully!')
  }

  const hasProvinces = provinces.length > 0
  const isNCR = formData.region.includes('NCR') || formData.region.includes('National Capital Region')
  const availableGroups = formData.office ? organizationalStructure[formData.office as keyof typeof organizationalStructure] : {}
  const availableDepartments = formData.group && formData.office ? 
    (organizationalStructure[formData.office as keyof typeof organizationalStructure] as Record<string, string[]>)[formData.group] || [] : []

  const inputClasses = "w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent bg-white/90"
  const labelClasses = "block text-xs font-medium text-blue/90 mb-1"

  return (
    <div className="h-full p-4 overflow-auto min-w-[32rem]">
      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="w-8 h-8 text-blue" />
        <h1 className="text-3xl font-semibold text-blue/90">User Creation (Org Chart)</h1>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('encoding')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'encoding'
                  ? 'border-blue text-blue'
                  : 'border-transparent text-blue/90 hover:text-blue/90 hover:border-zinc-300'
              }`}
            >
              <UserCheck className="w-4 h-4 inline mr-2" />
              Employee Encoding
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-blue text-blue'
                  : 'border-transparent text-blue/90 hover:text-blue/90 hover:border-zinc-300'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              User Permissions
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'encoding' && (
        <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Basic Information */}
            <div className="p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Basic Information</h2>
              </div>
              
              {/* Picture Upload */}
              <div className="mb-4">
                <label className={labelClasses}>Employee Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 border border-zinc-300 shadow-sm rounded-lg flex items-center justify-center">
                    {formData.picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.picture} alt="Employee" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <User className="w-8 h-8 text-blue/90" />
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-zinc-300 shadow-sm rounded-md hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Picture
                    </button>
                    <p className="text-xs text-blue/90 mt-1">JPG, PNG up to 2MB</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full min-w-[24rem]">
                <div className="w-full">
                  <label className={labelClasses}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className="w-full">
                  <label className={labelClasses}>Position *</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className="w-full">
                  <label className={labelClasses}>ID Number *</label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Employment Date *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="employmentDate"
                      value={formData.employmentDate}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Organization Information</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-[46%] min-w-[24rem] flex-grow-1"> 
                  <label className={labelClasses}>Office *</label>
                  <select
                    name="office"
                    value={formData.office}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  >
                    <option value="">Select Office</option>
                    <option value="PGAS">PGAS - Project Duo General Administration</option>
                    <option value="PGOS">PGOS - Project Duo General Operations</option>
                  </select>
                </div>
                <div className="w-[46%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>Group *</label>
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                    disabled={!formData.office}
                  >
                    <option value="">Select Group</option>
                    {Object.keys(availableGroups).map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                <div className="w-[46%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                    disabled={!formData.group}
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="w-[46%] min-w-[24rem] flex-grow-1">
                  <label className={labelClasses}>Email Group</label>
                  <input
                    type="text"
                    name="emailGroup"
                    value={formData.emailGroup}
                    onChange={handleInputChange}
                    className={inputClasses}
                    placeholder="e.g., sog@projectduo.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Contact Information</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-[30%] min-w-[18rem] flex-grow-1">
                  <label className={labelClasses}>Contact Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="+63 9XX XXX XXXX"
                      required
                    />
                  </div>
                </div>
                <div className="w-[30%] min-w-[18rem] flex-grow-1">
                  <label className={labelClasses}>PD Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="pdEmail"
                      value={formData.pdEmail}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="employee@projectduo.com"
                      required
                    />
                  </div>
                </div>
                <div className="w-[30%] min-w-[18rem] flex-grow-1">
                  <label className={labelClasses}>Personal Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="personalEmail"
                      value={formData.personalEmail}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="personal@gmail.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="flex flex-col gap-4 p-3 bg-white/50 rounded border mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue" />
                <h2 className="text-sm font-semibold text-blue/90">Personal Information</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-full flex-grow-1">
                  <label className={labelClasses}>Birthdate *</label>
                  <div className="relative w-full">
                    <Calendar className="w-4 h-4 text-blue/90 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      className={`${inputClasses} pl-10`}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Individual Address Fields */}
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
              <div className="flex flex-wrap gap-4">
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
              </div>

              {/* Address Selection using PSGC API */}
              <div className="flex flex-wrap gap-4">
                <div className="w-[46%] min-w-[24rem] flex-grow-1">
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

              

              <div className="flex flex-wrap gap-4">
              {hasProvinces && !isNCR && (
                      <div className="w-[30%] min-w-[18rem] flex-grow-1">
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
                  )}
                <div className="w-[30%] min-w-[18rem] flex-grow-1">
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
                <div className="w-[30%] min-w-[18rem] flex-grow-1">
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

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-white font-medium rounded-lg hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Employee
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'permissions' && (
        <UserPermissionsTab />
      )}
    </div>
  )
}