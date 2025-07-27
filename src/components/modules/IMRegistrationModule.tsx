"use client"

import { useState, useEffect } from "react"
import { IdCard, Save, MapPin, Phone, Mail, Calendar, User, Home, CreditCard, Facebook, Link } from "lucide-react"

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

export default function IMRegistrationModule() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('IM Registration Data:', formData)
    alert('IM Registration submitted successfully!')
  }

  const inputClasses = "w-full px-3 py-2 border border-zinc-300 shadow-sm rounded-md focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent text-blue/90 font-medium bg-white/90"
  const labelClasses = "block text-sm font-medium text-blue/90 mb-1"

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="flex items-center gap-3 mb-6">
        <IdCard className="w-8 h-8 text-blue" />
        <h1 className="text-3xl font-semibold text-blue/90">IM Registration</h1>
      </div>
      
      <div className="bg-gradient-to-t from-blue/5 to-light-blue/10 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Personal Information */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue" />
              <h2 className="text-xl font-semibold text-blue/90">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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
              <div>
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
              <div>
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
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-blue" />
              <h2 className="text-xl font-semibold text-blue/90">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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
              <div>
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
              <div>
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
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-blue" />
              <h2 className="text-xl font-semibold text-blue/90">Address Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClasses}>House No. *</label>
                <input
                  type="text"
                  name="houseNo"
                  value={formData.houseNo}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClasses}>Subdivision</label>
                <input
                  type="text"
                  name="subdivision"
                  value={formData.subdivision}
                  onChange={handleInputChange}
                  className={inputClasses}
                />
              </div>
              <div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
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
                <div></div>
              </div>
            )}
            {isNCR && formData.region && (
              <div className="border border-blue rounded-lg p-3 mb-4">
                <p className="text-sm text-blue">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  NCR (National Capital Region) selected - no province selection needed.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              <div>
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
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue" />
              <h2 className="text-xl font-semibold text-blue/90">Payment Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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
              <div>
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
              <div>
                <label className={labelClasses}>Authorized Receiver</label>
                <input
                  type="text"
                  name="authorizedReceiver"
                  value={formData.authorizedReceiver}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="Full Name"
                />
              </div>
            </div>
          </div>

          {/* Social Media & Files */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Link className="w-5 h-5 text-blue" />
              <h2 className="text-xl font-semibold text-blue/90">Social Media & Files</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              <div>
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-white font-medium rounded-lg hover:bg-blue/80 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Register Independent Manpower
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}