import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const flight = searchParams.get('flight')

  if (!flight) {
    return NextResponse.json({ error: 'Flight number is required' }, { status: 400 })
  }

  const apiKey = process.env.AVIATIONSTACK_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AviationStack API key not configured' }, { status: 500 })
  }

  try {
    // Fetch both flight data and real-time tracking data
    const [flightResponse, trackingResponse] = await Promise.all([
      // Regular flight data
      fetch(
        `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flight}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      ),
      // Real-time tracking data
      fetch(
        `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flight}&limit=1`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )
    ])

    if (!flightResponse.ok) {
      throw new Error(`AviationStack API error: ${flightResponse.status}`)
    }

    const flightData = await flightResponse.json()

    if (flightData.error) {
      return NextResponse.json({ error: flightData.error.message || 'API error' }, { status: 400 })
    }

    // Merge tracking data if available
    let enhancedData = flightData
    if (trackingResponse.ok) {
      const trackingData = await trackingResponse.json()
      if (trackingData.data && trackingData.data.length > 0 && trackingData.data[0].live) {
        enhancedData = {
          ...flightData,
          data: flightData.data.map((flight: any, index: number) => 
            index === 0 && trackingData.data[0].live 
              ? { ...flight, live: trackingData.data[0].live }
              : flight
          )
        }
      }
    }

    return NextResponse.json(enhancedData)
  } catch (error) {
    console.error('Flight search error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flight data' },
      { status: 500 }
    )
  }
}