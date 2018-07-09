const superagent = require('superagent')

const nfdcFacilitiesBaseUri =
  'https://www.faa.gov/airports/airport_safety/airportdata_5010/menu/nfdcfacilitiesexport.cfm'
const nfdcRunwaysBaseUri =
  'https://www.faa.gov/airports/airport_safety/airportdata_5010/menu/nfdcrunwaysexport.cfm'
const nfdcRemarksBaseUri =
  'https://www.faa.gov/airports/airport_safety/airportdata_5010/menu/nfdcremarksexport.cfm'
const nfdcSchedulesBaseUri =
  'https://www.faa.gov/airports/airport_safety/airportdata_5010/menu/nfdcschedulesexport.cfm'

/**
 * Query parameter options; for possible options, see
 * https://www.faa.gov/airports/airport_safety/airportdata_5010/menu/
 */
const defaultOptions = {
  region: '',
  district: '',
  state: '',
  county: '',
  city: '',
  use: '',
  certification: ''
}

/**
 * Airport Facilities Data
 */
exports.facilities = async (options = defaultOptions) => {
  const queryParams = Object.assign({}, defaultOptions, options)

  try {
    const data = await superagent
      .get(nfdcFacilitiesBaseUri)
      .query(queryParams)
      .buffer()

    if (data.text) {
      return parseData(data.text)
    }
  } catch (err) {
    console.error('Could not fetch facilities data', err)
  }
}

/**
 * Airport Runways Data
 */
exports.runways = async (options = defaultOptions) => {
  const queryParams = Object.assign({}, defaultOptions, options)

  try {
    const data = await superagent
      .get(nfdcRunwaysBaseUri)
      .query(queryParams)
      .buffer()

    if (data.text) {
      return parseData(data.text)
    }
  } catch (err) {
    console.error('Could not fetch runways data', err)
  }
}

/**
 * Airport Remarks Data
 */
exports.remarks = async (options = defaultOptions) => {
  const queryParams = Object.assign({}, defaultOptions, options)

  try {
    const data = await superagent
      .get(nfdcRemarksBaseUri)
      .query(queryParams)
      .buffer()

    if (data.text) {
      return parseData(data.text)
    }
  } catch (err) {
    console.error('Could not fetch remarks data', err)
  }
}

/**
 * Airport Schedules Data
 */
exports.schedules = async (options = defaultOptions) => {
  const queryParams = Object.assign({}, defaultOptions, options)

  try {
    const data = await superagent
      .get(nfdcSchedulesBaseUri)
      .query(queryParams)
      .buffer()

    if (data.text) {
      return parseData(data.text)
    }
  } catch (err) {
    console.error('Could not fetch schedules data', err)
  }
}

/**
 * Parse the raw delimited data into an array of objects
 */
const parseData = data => {
  const rows = data
    .split('\n')
    .map(row => row.split('\t').map(cell => cell.trim()))

  const columnTitles = rows[0].map(columnTitle =>
    columnTitle.replace(/("|\r)/g, '')
  )

  const parsed = []
  rows.slice(1).map(row => {
    const parsedRow = {}
    columnTitles.map((title, i) => {
      parsedRow[title] =
        row[i] === ''
          ? null
          : title === 'LastOwnerInformationDate'
            ? row[i]
            : tryParseNumber(row[i])

      // The documents have single quotes around some fields
      // that aren't needed so we can remove them here
      if (parsedRow[title] && typeof parsedRow[title] === 'string') {
        parsedRow[title] = parsedRow[title].replace(/'/, '')
      }
    })
    // All entries in the 5010 listing have a site number, so this
    // ensures we don't add any empty rows to the output
    if (parsedRow.SiteNumber === null || parsedRow.SiteNumber === undefined) {
      return
    }

    parsed.push(parsedRow)
  })

  return parsed
}

/**
 * Attempt to parse a string as a number or return the original string
 */
const tryParseNumber = str => {
  const number = Number(str)
  const float = parseFloat(number)
  if (float === number) {
    return float
  }
  const int = parseInt(number)
  if (int === number) {
    return int
  }
  return str
}
