const superagent = require('superagent')
const cheerio = require('cheerio')

const nfdcBaseUri =
  'https://www.faa.gov/airports/airport_safety/airportdata_5010'
const nfdcFacilitiesBaseUri = `${nfdcBaseUri}/menu/nfdcfacilitiesexport.cfm`
const nfdcRunwaysBaseUri = `${nfdcBaseUri}/menu/nfdcrunwaysexport.cfm`
const nfdcRemarksBaseUri = `${nfdcBaseUri}/menu/nfdcremarksexport.cfm`
const nfdcSchedulesBaseUri = `${nfdcBaseUri}/menu/nfdcschedulesexport.cfm`

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
 * Main fetching method used for each data type
 */
const fetch = async (url, options = defaultOptions) => {
  const queryParams = Object.assign({}, defaultOptions, options)
  try {
    const response = await superagent
      .get(url)
      .set('Accept', 'text/html')
      .query(queryParams)
      .retry(3)
      .timeout({
        response: 10e3,
        deadline: 30e3
      })
      .buffer()

    if (response.text) {
      return parseData(response.text)
    }
  } catch (err) {
    console.error(`Could not fetch data from ${url}`, err)
  }
}

/**
 * Extract the given form options from a cheerio instance
 */
const extractOptions = ($, id) => {
  const $options = $(`select#${id} > option`)
  const options = []
  $options.each(o => options.push($options[o].attribs.value))
  return options.filter(o => o !== '')
}

const capitalizeWord = str => `${str[0].toUpperCase()}${str.slice(1)}`

/**
 * Main fetching method used for available form select options
 */
const fetchFormOptions = async () => {
  try {
    const response = await superagent
      .get(nfdcBaseUri)
      .set('Accept', 'text/html')
      .timeout({
        response: 10e3,
        deadline: 30e3
      })
      .retry(3)
    if (response.text) {
      const $ = cheerio.load(response.text)
      const options = {}
      Object.keys(defaultOptions).map(optionName => {
        options[optionName] = extractOptions($, capitalizeWord(optionName))
      })
      return options
    }
  } catch (err) {
    console.error(`Could not fetch data from ${nfdcBaseUri}`, err)
  }
}

/**
 * Selection Form Options
 */
exports.regions = async () => {
  const { region } = await fetchFormOptions()
  return { regions: region }
}
exports.districts = async () => {
  const { district } = await fetchFormOptions()
  return { districts: district }
}
exports.states = async () => {
  const { state } = await fetchFormOptions()
  return { states: state }
}
exports.counties = async () => {
  const { county } = await fetchFormOptions()
  return { counties: county }
}
exports.cities = async () => {
  const { city } = await fetchFormOptions()
  return { cities: city }
}
exports.uses = async () => {
  const { use } = await fetchFormOptions()
  return { uses: use }
}
exports.certifications = async () => {
  const { certification } = await fetchFormOptions()
  return { certifications: certification }
}

/**
 * Airport Facilities Data
 */
exports.facilities = async options => fetch(nfdcFacilitiesBaseUri, options)

/**
 * Airport Runways Data
 */
exports.runways = async options => fetch(nfdcRunwaysBaseUri, options)

/**
 * Airport Remarks Data
 */
exports.remarks = async options => fetch(nfdcRemarksBaseUri, options)

/**
 * Airport Schedules Data
 */
exports.schedules = async options => fetch(nfdcSchedulesBaseUri, options)

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
