const express = require('express')
const winnerWinnerApp = express()
const request = require('request')
const util = require('util')

const cheerio = require('cheerio')
const fs = require('fs')
const XLSX = require('xlsx')
const jsdom = require('jsdom')
var tabletojson = require('tabletojson')

const { JSDOM } = jsdom

const formatAsTable = html => {
  const $results = cheerio.load(html)
  const $newTable = cheerio.load(
    '<html><head></head><body><table id="results-table"><thead><tr></tr></thead><tbody></tbody></table></body></html>'
  )

  let headers = ''
  $results('.table-row-heading div').each((i, el) => {
    headers += `<th>${$results(el).innerText}</th>`
  })

  $newTable('tr').html(headers)

  let body = ''
  $results('.table-row').each((i, el) => {
    body += '<tr>'

    $results(el)
      .find('div')
      .each((i, td) => {
        body += `<td>${$results(td).html()}</td>`
      })

    body += '</tr>'
  })

  $newTable('tbody').append(body)
  const outputHTML = $newTable('body').html()
  const window = new JSDOM(outputHTML).window

  return window.document
}

const formatAsJson = html => {
  const $ = cheerio.load(formatAsTable(html).body.outerHTML)
  const getTextAtTDIndex = ($tr, index) => {
    return $(
      $($tr)
        .find('td')
        .get(index)
    ).text()
  }
  const fixtures = []

  $('body table tbody tr').each((i, el) => {
    fixtures.push({
      time: getTextAtTDIndex(el, 0),
      comp: getTextAtTDIndex(el, 2),
      home: getTextAtTDIndex(el, 3),
      away: getTextAtTDIndex(el, 4),
      tip: getTextAtTDIndex(el, 5),
      H: getTextAtTDIndex(el, 6),
      D: getTextAtTDIndex(el, 7),
      '1': getTextAtTDIndex(el, 8),
      X: getTextAtTDIndex(el, 9),
      '2': getTextAtTDIndex(el, 10),
      U: getTextAtTDIndex(el, 11),
      O: getTextAtTDIndex(el, 12),
      'u2.5': getTextAtTDIndex(el, 13),
      'o2.5': getTextAtTDIndex(el, 14),
      ft: getTextAtTDIndex(el, 15)
    })
  })

  return JSON.stringify({ fixtures: fixtures })
}

const exportAsSpreadsheet = html => {
  const workbook = XLSX.utils.table_to_book(formatAsTable(html).getElementById('results-table'))

  XLSX.writeFile(workbook, 'out.xlsx')
}

const formatAvailableFixturesAsJson = html => {
  console.log(html)
  const $ = cheerio.load(html)
  const availableFixtures = []

  $('.date-nav li').each((i, el) => {
    $(el).find('a')
    availableFixtures.push({
      label: $(el)
        .find('a')
        .text(),
      apiID: $(el)
        .find('a')
        .attr('href')
        .split('/')[2]
    })
  })

  return JSON.stringify({ availableFixtures: availableFixtures })
}

const returnAsJson = (date, res) => {
  const requestUrl = `https://www.prosoccer.eu/football/${date}`

  return request(requestUrl, (error, response, html) => {
    if (error) throw error

    res.send(formatAsJson(html))
  })
}

const availableFixtures = res => {
  const requestUrl = 'https://www.prosoccer.eu/football/'

  return request(requestUrl, (error, response, html) => {
    if (error) throw error

    res.send(formatAvailableFixturesAsJson(html))
  })
}

winnerWinnerApp.get('/api/fixtures/:date', (req, res) => {
  returnAsJson(req.params.date, res)
})

winnerWinnerApp.get('/api/fixtures/available', (req, res) => {
  console.log('here')
  availableFixtures(res)
})

winnerWinnerApp.listen(5000, () => console.log('winnerWinnerApp Server listening on port 5000!'))
