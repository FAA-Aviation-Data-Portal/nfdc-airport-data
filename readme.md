# nfdc-airport-data

National Flight Data Center’s (NFDC) 28 Day NASR Subscription, Airports and Other Landing Facilities

[![NPM Version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Coverage][coveralls-image]][coveralls-url]

## Installation

```console
$ npm install --save @faa-aviation-data-portal/nfdc-airport-data
```

## Usage

```js
const airportData = require('nfdc-airport-data')

airportData.facilities({ city: 'Anchorage' }).then(results => {
  console.log(results[0])
})
```

Partial output:

```js
{
  SiteNumber: '50033.1*H',
  Type: 'HELIPORT',
  LocationID: '2OK',
  EffectiveDate: '06/21/2018',
  Region: 'AAL',
  DistrictOffice: 'NONE',
  State: 'AK',
  StateName: 'ALASKA',
  County: 'ANCHORAGE',
  CountyState: 'AK',
  City: 'ANCHORAGE',
  FacilityName: 'ALASKA RGNL HOSPITAL',
  Ownership: 'PU',
  ...
}
```

## API

### `airportData.facilities(options)`

### `airportData.runways(options)`

### `airportData.remarks(options)`

### `airportData.schedules(options)`

#### `options`

Type: `object`

```js
const defaultOptions = {
  region: '',
  district: '',
  state: '',
  county: '',
  city: '',
  use: '',
  certification: ''
}
```

All options values can be empty for searching all regions, districts, etc. You can also see currently available options using the following methods:

##### `airportData.regions()`
##### `airportData.districts()`
##### `airportData.states()`
##### `airportData.counties()`
##### `airportData.cities()`
##### `airportData.uses()`
##### `airportData.certifications()`

## License

MIT © [Forrest Desjardins](https://github.com/fdesjardins)

[build-url]: https://github.com/FAA-Aviation-Data-Portal/nfdc-airport-data/actions?query=workflow%3A%22Node.js+CI%22
[build-image]: https://github.com/FAA-Aviation-Data-Portal/nfdc-airport-data/workflows/Node.js%20CI/badge.svg?branch=master&style=flat
[npm-url]: https://www.npmjs.com/package/@faa-aviation-data-portal/nfdc-airport-data
[npm-image]: https://img.shields.io/npm/v/@faa-aviation-data-portal/nfdc-airport-data.svg?style=flat
[coveralls-url]: https://coveralls.io/r/ResourceDataInc/nfdc-airport-data
[coveralls-image]: https://img.shields.io/coveralls/ResourceDataInc/nfdc-airport-data.svg?style=flat
