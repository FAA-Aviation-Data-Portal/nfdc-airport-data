const superagent = require('superagent')
const cheerio = require('cheerio')

// Request URL: https://adip.faa.gov/agisServices/public-api/searchAirportData

const adipBaseUri = 'https://adip.faa.gov/agis/public/#/airportSearch/advanced'
const adipSearchFormUri = 'https://adip.faa.gov/agis/ng-shared/html/airportSearch.html'
const adipFacilitySearchUri = 'https://adip.faa.gov/agisServices/public-api/searchAirportData'
const adipAirportDetailsUri = 'https://adip.faa.gov/agisServices/public-api/getAirportDetails'
const adipApiUri = 'https://adip.faa.gov/agisServices/api/nq'

const adipAuthHeader = 'Basic 3f647d1c-a3e7-415e-96e1-6e8415e6f209-ADIP'

// const nfdcBaseUri = ''
// const nfdcFacilitiesBaseUri = `${nfdcBaseUri}/menu/nfdcfacilitiesexport.cfm`
// const nfdcRunwaysBaseUri = `${nfdcBaseUri}/menu/nfdcrunwaysexport.cfm`
// const nfdcRemarksBaseUri = `${nfdcBaseUri}/menu/nfdcremarksexport.cfm`
// const nfdcSchedulesBaseUri = `${nfdcBaseUri}/menu/nfdcschedulesexport.cfm`

/**
 * Query parameter options; for possible options, see
 * https://adip.faa.gov/agis/public/#/airportSearch/advanced
 */
const defaultOptions = {
  adoCode: 'ANY',
  annualOperationsOperator: 'eq',
  basedAircraftOperator: 'eq',
  controlTower: 'ANY',
  facilityType: 'ANY',
  far139Certification: 'ANY',
  fuelType: 'ANY',
  hubTypeCode: 'ANY',
  otherServices: 'ANY',
  ownershipTypeCode: 'ANY',
  regionId: 'ANY',
  roleId: {},
  roleIds: [],
  runwanEndCloseInObstacle: 'ANY',
  runwayEndElevationOperator: 'eq',
  runwayEndFar77Category: 'ANY',
  runwayEndMarkingCondition: 'ANY',
  runwayEndMarkingType: 'ANY',
  runwayLengthOperator: 'eq',
  runwaySurfaceCondition: 'ANY',
  runwaySurfaceTreatment: 'ANY',
  runwaySurfaceType: 'ANY',
  runwayWidthOperator: 'eq',
  stateId: 'ANY',
  statusCode: 'ANY',
  unicom: 'ANY',
  useCode: 'ANY'
}

const fetchFacilityList = async (options = defaultOptions) => {
  const payload = Object.assign({}, defaultOptions, options)
  try {
    // get the list of all facilities with the given options
    const response = await superagent
      .post(adipFacilitySearchUri)
      .send(payload)
      .set({
        Authorization: adipAuthHeader
      })
      .buffer()

    const parsed = JSON.parse(response.text)
    return parsed.airports
  } catch (err) {
    console.error(`Could not fetch data from ${adipFacilitySearchUri}`, err)
  }
}

const fetchFacilityDetails = async (locId) => {
  try {
    // get the list of all facilities with the given options
    const response = await superagent
      .post(adipAirportDetailsUri)
      .send({ locId: locId })
      .set({
        Authorization: adipAuthHeader
      })
      .buffer()

    const parsed = JSON.parse(response.text)
    return parsed
  } catch (err) {
    console.error(`Could not fetch data from ${adipAirportDetailsUri}`, err)
  }
}

const fetch = async (options = defaultOptions) => {
  const facilityList = await fetchFacilityList(options)

  const facilityDetails = facilityList.map(async facility => fetchFacilityDetails(facility.locId))

  return Promise.all(facilityDetails)
}

// /**
//  * Extract the given form options from a cheerio instance
//  */
// const extractOptions = ($, id) => {
//   const $options = $(`select#${id} > option`)
//   const options = []
//   $options.each(o => options.push($options[o].attribs.value))
//   return options.filter(o => o !== '')
// }

// const capitalizeWord = str => `${str[0].toUpperCase()}${str.slice(1)}`

// /**
//  * Main fetching method used for available form select options
//  */
// const fetchFormOptions = async () => {
//   try {
//     const response = await superagent.get(nfdcBaseUri)
//     if (response.text) {
//       const $ = cheerio.load(response.text)
//       const options = {}
//       Object.keys(defaultOptions).map(optionName => {
//         options[optionName] = extractOptions($, capitalizeWord(optionName))
//       })
//       return options
//     }
//   } catch (err) {
//     console.error(`Could not fetch data from ${nfdcBaseUri}`, err)
//   }
// }

const tmpFetchRegionFormOptions = async () => {
  try {
    const response = await superagent.post(adipApiUri)
      .send({ query: 'allRegions' })
      .set({
        Authorization: adipAuthHeader
      })
    return response.body
  } catch (err) {
    console.error(`Could not fetch data from ${adipBaseUri}`, err)
  }
}

/**
 * Selection Form Options
 */
exports.regions = async () => {
  const regions = await tmpFetchRegionFormOptions()
  return { regions }
}
// exports.districts = async () => {
//   const { district } = await fetchFormOptions()
//   return { districts: district }
// }
// exports.states = async () => {
//   const { state } = await fetchFormOptions()
//   return { states: state }
// }
// exports.counties = async () => {
//   const { county } = await fetchFormOptions()
//   return { counties: county }
// }
// exports.cities = async () => {
//   const { city } = await fetchFormOptions()
//   return { cities: city }
// }
// exports.uses = async () => {
//   const { use } = await fetchFormOptions()
//   return { uses: use }
// }
// exports.certifications = async () => {
//   const { certification } = await fetchFormOptions()
//   return { certifications: certification }
// }

/**
 * Airport Facilities Data
 */
exports.facilities = async options => fetch(options)

// /**
//  * Airport Runways Data
//  */
// exports.runways = async options => fetch(nfdcRunwaysBaseUri, options)

// /**
//  * Airport Remarks Data
//  */
// exports.remarks = async options => fetch(nfdcRemarksBaseUri, options)

// /**
//  * Airport Schedules Data
//  */
// exports.schedules = async options => fetch(nfdcSchedulesBaseUri, options)

// /**
//  * Parse the raw delimited data into an array of objects
//  */
// const parseData = data => {
//   const rows = data
//     .split('\n')
//     .map(row => row.split('\t').map(cell => cell.trim()))

//   const columnTitles = rows[0].map(columnTitle =>
//     columnTitle.replace(/("|\r)/g, '')
//   )

//   const parsed = []
//   rows.slice(1).map(row => {
//     const parsedRow = {}
//     columnTitles.map((title, i) => {
//       parsedRow[title] =
//         row[i] === ''
//           ? null
//           : title === 'LastOwnerInformationDate'
//             ? row[i]
//             : tryParseNumber(row[i])
//       // The documents have single quotes around some fields
//       // that aren't needed so we can remove them here
//       if (parsedRow[title] && typeof parsedRow[title] === 'string') {
//         parsedRow[title] = parsedRow[title].replace(/'/, '')
//       }
//     })
//     // All entries in the 5010 listing have a site number, so this
//     // ensures we don't add any empty rows to the output
//     if (parsedRow.SiteNumber === null || parsedRow.SiteNumber === undefined) {
//       return
//     }
//     parsed.push(parsedRow)
//   })

//   return parsed
// }

// /**
//  * Attempt to parse a string as a number or return the original string
//  */
// const tryParseNumber = str => {
//   const number = Number(str)
//   const float = parseFloat(number)
//   if (float === number) {
//     return float
//   }
//   const int = parseInt(number)
//   if (int === number) {
//     return int
//   }
//   return str
// }
