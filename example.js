const airportData = require('./')

airportData.facilities({ city: 'Anchorage' }).then(results => {
  console.log(results[0])
})

airportData.runways({ city: 'Anchorage' }).then(results => {
  console.log(results[0])
})

airportData.remarks({ city: 'Anchorage' }).then(results => {
  console.log(results[0])
})

airportData.schedules({ city: 'Anchorage' }).then(results => {
  console.log(results[0])
})
