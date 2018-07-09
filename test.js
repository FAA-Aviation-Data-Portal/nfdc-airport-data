/* global describe, it */

const assert = require('chai').assert
const airportData = require('./')

describe('airport-data', () => {
  it('should exist', done => {
    assert(airportData !== undefined)
    done()
  })
  it('should fetch facilities data', async () => {
    const data = await airportData.facilities({ city: 'Anchorage' })
    assert(data.length > 0)
  })
  it('should fetch runways data', async () => {
    const data = await airportData.runways({ city: 'Anchorage' })
    assert(data.length > 0)
  })
  it('should fetch remarks data', async () => {
    const data = await airportData.remarks({ city: 'Anchorage' })
    assert(data.length > 0)
  })
  it('should fetch schedules data', async () => {
    const data = await airportData.schedules({ city: 'Anchorage' })
    assert(data.length > 0)
  })
})
