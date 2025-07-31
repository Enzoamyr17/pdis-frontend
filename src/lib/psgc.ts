// PSGC (Philippine Standard Geographic Code) API utilities
export interface Region {
  code: string
  name: string
  regionName: string
}

export interface Province {
  code: string
  name: string
  regionCode: string
}

export interface City {
  code: string
  name: string
  provinceCode: string
  isCapital?: boolean
  isCity?: boolean
}

export interface Barangay {
  code: string
  name: string
  cityCode: string
}

// PSGC API base URL - using a public PSGC API
const PSGC_API_BASE = 'https://psgc.gitlab.io/api'

export async function getRegions(): Promise<Region[]> {
  try {
    const response = await fetch(`${PSGC_API_BASE}/regions/`)
    if (!response.ok) throw new Error('Failed to fetch regions')
    return await response.json()
  } catch (error) {
    console.error('Error fetching regions:', error)
    // Fallback to hardcoded regions if API fails
    return [
      { code: '010000000', name: 'Region I', regionName: 'Ilocos Region' },
      { code: '020000000', name: 'Region II', regionName: 'Cagayan Valley' },
      { code: '030000000', name: 'Region III', regionName: 'Central Luzon' },
      { code: '040000000', name: 'Region IV-A', regionName: 'CALABARZON' },
      { code: '050000000', name: 'Region IV-B', regionName: 'MIMAROPA' },
      { code: '060000000', name: 'Region V', regionName: 'Bicol Region' },
      { code: '070000000', name: 'Region VI', regionName: 'Western Visayas' },
      { code: '080000000', name: 'Region VII', regionName: 'Central Visayas' },
      { code: '090000000', name: 'Region VIII', regionName: 'Eastern Visayas' },
      { code: '100000000', name: 'Region IX', regionName: 'Zamboanga Peninsula' },
      { code: '110000000', name: 'Region X', regionName: 'Northern Mindanao' },
      { code: '120000000', name: 'Region XI', regionName: 'Davao Region' },
      { code: '130000000', name: 'Region XII', regionName: 'SOCCSKSARGEN' },
      { code: '140000000', name: 'Region XIII', regionName: 'Caraga' },
      { code: '150000000', name: 'NCR', regionName: 'National Capital Region' },
      { code: '160000000', name: 'CAR', regionName: 'Cordillera Administrative Region' },
      { code: '170000000', name: 'BARMM', regionName: 'Bangsamoro Autonomous Region in Muslim Mindanao' }
    ]
  }
}

export async function getProvincesByRegion(regionCode: string): Promise<Province[]> {
  try {
    const response = await fetch(`${PSGC_API_BASE}/provinces/`)
    if (!response.ok) throw new Error('Failed to fetch provinces')
    const allProvinces: Province[] = await response.json()
    return allProvinces.filter(province => province.regionCode === regionCode)
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return []
  }
}

export async function getCitiesByProvince(provinceCode: string): Promise<City[]> {
  try {
    const response = await fetch(`${PSGC_API_BASE}/cities-municipalities/`)
    if (!response.ok) throw new Error('Failed to fetch cities')
    const allCities: City[] = await response.json()
    return allCities.filter(city => city.provinceCode === provinceCode)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return []
  }
}

export async function getCitiesByRegion(regionCode: string): Promise<City[]> {
  try {
    // For NCR, get cities directly since there are no provinces
    if (regionCode === '150000000') {
      const response = await fetch(`${PSGC_API_BASE}/cities-municipalities/`)
      if (!response.ok) throw new Error('Failed to fetch cities')
      const allCities: City[] = await response.json()
      return allCities.filter(city => city.provinceCode?.startsWith('15'))
    }
    return []
  } catch (error) {
    console.error('Error fetching cities by region:', error)
    return []
  }
}

export async function getBarangaysByCity(cityCode: string): Promise<Barangay[]> {
  try {
    const response = await fetch(`${PSGC_API_BASE}/barangays/`)
    if (!response.ok) throw new Error('Failed to fetch barangays')
    const allBarangays: Barangay[] = await response.json()
    return allBarangays.filter(barangay => barangay.cityCode === cityCode)
  } catch (error) {
    console.error('Error fetching barangays:', error)
    return []
  }
}