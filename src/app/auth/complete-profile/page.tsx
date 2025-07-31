"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { getRegions, getProvincesByRegion, getCitiesByProvince, getCitiesByRegion, getBarangaysByCity, type Region, type Province, type City, type Barangay } from "@/lib/psgc"

const offices = [
  { value: "PROJECT_DUO_GENERAL_ADMINISTRATION", label: "Project Duo General Administration" },
  { value: "PROJECT_DUO_GENERAL_OPERATIONS", label: "Project Duo General Operations" }
]

const groups = {
  PROJECT_DUO_GENERAL_ADMINISTRATION: [
    { value: "ASG", label: "Administrative Support Group (ASG)" },
    { value: "AFG", label: "Accounting Finance Group (AFG)" }
  ],
  PROJECT_DUO_GENERAL_OPERATIONS: [
    { value: "SOG", label: "Sales and Operations Group (SOG)" },
    { value: "CG", label: "Creatives Group (CG)" }
  ]
}

const departments = {
  ASG: [
    { value: "ASSETS_AND_PROPERTY_MANAGEMENT", label: "Assets and Property Management (APM)" },
    { value: "PEOPLE_MANAGEMENT", label: "People Management (PM)" }
  ],
  AFG: [
    { value: "ACCOUNTS_PAYABLE", label: "Accounts Payable (AP)" },
    { value: "ACCOUNTS_RECEIVABLE", label: "Accounts Receivable (AR)" },
    { value: "TREASURY", label: "Treasury" }
  ],
  SOG: [
    { value: "BUSINESS_UNIT_1", label: "Business Unit 1 (BU1)" },
    { value: "BUSINESS_UNIT_2", label: "Business Unit 2 (BU2)" },
    { value: "BUSINESS_DEVELOPMENT", label: "Business Development" }
  ],
  CG: [
    { value: "DESIGN_AND_MULTIMEDIA", label: "Design and Multimedia" },
    { value: "COPY_AND_DIGITAL", label: "Copy and Digital" }
  ]
}

// PSGC data will be loaded dynamically

export default function CompleteProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    position: "",
    idNumber: "",
    employmentDate: "",
    office: "",
    group: "",
    department: "",
    contactNumber: "",
    pdEmail: session?.user?.email || "", // Default to login email
    personalEmail: "",
    birthdate: "",
    password: "",
    confirmPassword: "",
    address: {
      houseNo: "",
      street: "",
      subdivision: "",
      region: "",
      province: "",
      cityMunicipality: "",
      barangay: ""
    }
  })

  const [selectedGroupType, setSelectedGroupType] = useState("")
  
  // PSGC data state
  const [regions, setRegions] = useState<Region[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [selectedRegionCode, setSelectedRegionCode] = useState("")
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("")
  const [selectedCityCode, setSelectedCityCode] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }
    if (session?.user?.profileCompleted) {
      router.push("/dashboard")
      return
    }
    
    // Set PD email to user's login email when session loads
    if (session?.user?.email && !formData.pdEmail) {
      setFormData(prev => ({
        ...prev,
        pdEmail: session?.user?.email || ""
      }))
    }
  }, [session, status, router, formData.pdEmail])

  // Load regions on component mount
  useEffect(() => {
    const loadRegions = async () => {
      const regionData = await getRegions()
      setRegions(regionData)
    }
    loadRegions()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleOfficeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      office: value,
      group: "",
      department: ""
    }))
    setSelectedGroupType("")
  }

  const handleGroupChange = (value: string) => {
    const groupType = value // Now value is directly "ASG", "AFG", "SOG", or "CG"
    
    setFormData(prev => ({
      ...prev,
      group: value, // Store the group value directly
      department: ""
    }))
    setSelectedGroupType(groupType)
  }

  const handleRegionChange = async (regionCode: string, regionName: string) => {
    setSelectedRegionCode(regionCode)
    setSelectedProvinceCode("")
    setSelectedCityCode("")
    setProvinces([])
    setCities([])
    setBarangays([])
    
    handleInputChange("address.region", regionName)
    handleInputChange("address.province", "")
    handleInputChange("address.cityMunicipality", "")
    handleInputChange("address.barangay", "")

    // Load provinces for selected region (except NCR)
    if (regionCode !== '150000000') { // Not NCR
      const provinceData = await getProvincesByRegion(regionCode)
      setProvinces(provinceData)
    } else {
      // For NCR, load cities directly
      const cityData = await getCitiesByRegion(regionCode)
      setCities(cityData)
    }
  }

  const handleProvinceChange = async (provinceCode: string, provinceName: string) => {
    setSelectedProvinceCode(provinceCode)
    setSelectedCityCode("")
    setCities([])
    setBarangays([])
    
    handleInputChange("address.province", provinceName)
    handleInputChange("address.cityMunicipality", "")
    handleInputChange("address.barangay", "")

    // Load cities for selected province
    const cityData = await getCitiesByProvince(provinceCode)
    setCities(cityData)
  }

  const handleCityChange = async (cityCode: string, cityName: string) => {
    setSelectedCityCode(cityCode)
    setBarangays([])
    
    handleInputChange("address.cityMunicipality", cityName)
    handleInputChange("address.barangay", "")

    // Load barangays for selected city
    const barangayData = await getBarangaysByCity(cityCode)
    setBarangays(barangayData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/profile/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Profile completion failed")
      }

      router.push("/dashboard")
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Image
            src="/assets/PD/colored_square_logo.png"
            alt="Project Duo Logo"
            width={60}
            height={60}
            className="mx-auto"
          />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please provide your employee information to access the system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
              <Input
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={(e) => handleInputChange("middleName", e.target.value)}
                required
              />
            </div>
            <Input
              type="date"
              placeholder="Birthdate"
              value={formData.birthdate}
              onChange={(e) => handleInputChange("birthdate", e.target.value)}
              required
            />
          </div>

          {/* Password Setup */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Password Setup</h3>
            <p className="text-sm text-gray-600">Choose a password for your account</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                minLength={6}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Position"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                required
              />
              <Input
                placeholder="ID Number"
                value={formData.idNumber}
                onChange={(e) => handleInputChange("idNumber", e.target.value)}
                required
              />
            </div>
            <Input
              type="date"
              placeholder="Employment Date"
              value={formData.employmentDate}
              onChange={(e) => handleInputChange("employmentDate", e.target.value)}
              required
            />
            
            <select
              className="w-full p-3 border border-gray-300 rounded-md"
              value={formData.office}
              onChange={(e) => handleOfficeChange(e.target.value)}
              required
            >
              <option value="">Select Office</option>
              {offices.map((office) => (
                <option key={office.value} value={office.value}>
                  {office.label}
                </option>
              ))}
            </select>

            {formData.office && (
              <select
                className="w-full p-3 border border-gray-300 rounded-md"
                value={formData.group}
                onChange={(e) => handleGroupChange(e.target.value)}
                required
              >
                <option value="">Select Group</option>
                {groups[formData.office as keyof typeof groups]?.map((group) => (
                  <option key={group.value} value={group.value}>
                    {group.label}
                  </option>
                ))}
              </select>
            )}

            {selectedGroupType && (
              <select
                className="w-full p-3 border border-gray-300 rounded-md"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments[selectedGroupType as keyof typeof departments]?.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            <Input
              type="tel"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange("contactNumber", e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="PD Email (Work Email)"
              value={formData.pdEmail}
              onChange={(e) => handleInputChange("pdEmail", e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Personal Email"
              value={formData.personalEmail}
              onChange={(e) => handleInputChange("personalEmail", e.target.value)}
              required
            />
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="House No."
                value={formData.address.houseNo}
                onChange={(e) => handleInputChange("address.houseNo", e.target.value)}
                required
              />
              <Input
                placeholder="Street"
                value={formData.address.street}
                onChange={(e) => handleInputChange("address.street", e.target.value)}
                required
              />
              <Input
                placeholder="Subdivision (Optional)"
                value={formData.address.subdivision}
                onChange={(e) => handleInputChange("address.subdivision", e.target.value)}
              />
              <select
                className="p-3 border border-gray-300 rounded-md"
                value={selectedRegionCode}
                onChange={(e) => {
                  const region = regions.find(r => r.code === e.target.value)
                  if (region) {
                    handleRegionChange(region.code, region.regionName)
                  }
                }}
                required
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.regionName}
                  </option>
                ))}
              </select>
              {selectedRegionCode !== "150000000" && provinces.length > 0 && (
                <select
                  className="p-3 border border-gray-300 rounded-md"
                  value={selectedProvinceCode}
                  onChange={(e) => {
                    const province = provinces.find(p => p.code === e.target.value)
                    if (province) {
                      handleProvinceChange(province.code, province.name)
                    }
                  }}
                  required
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              )}
              {cities.length > 0 && (
                <select
                  className="p-3 border border-gray-300 rounded-md"
                  value={selectedCityCode}
                  onChange={(e) => {
                    const city = cities.find(c => c.code === e.target.value)
                    if (city) {
                      handleCityChange(city.code, city.name)
                    }
                  }}
                  required
                >
                  <option value="">Select City/Municipality</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>
              )}
              {barangays.length > 0 && (
                <select
                  className="p-3 border border-gray-300 rounded-md"
                  value={formData.address.barangay}
                  onChange={(e) => handleInputChange("address.barangay", e.target.value)}
                  required
                >
                  <option value="">Select Barangay</option>
                  {barangays.map((barangay) => (
                    <option key={barangay.code} value={barangay.name}>
                      {barangay.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Completing Profile..." : "Complete Profile"}
          </Button>
        </form>
      </div>
    </div>
  )
}