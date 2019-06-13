const airportData = require('./')

const example = async () => {
  const facilities = await airportData.facilities({ city: 'Anchorage' })
  console.log(facilities[0])

  const runways = await airportData.runways({ city: 'Anchorage' })
  console.log(runways[0])

  const remarks = await airportData.remarks({ city: 'Anchorage' })
  console.log(remarks[0])

  const schedules = await airportData.schedules({ city: 'Anchorage' })
  console.log(schedules[0])

  console.log(await airportData.regions())
  console.log(await airportData.districts())
  console.log(await airportData.states())
  console.log(await airportData.counties())
  console.log(await airportData.cities())
  console.log(await airportData.uses())
  console.log(await airportData.certifications())
}

;(async () => example())()
