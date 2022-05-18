import dayjs from 'dayjs'
import numeral from 'numeral'

export default {
  /*
   * Determines if the user's browser is IE
   */
  isIE() {
    const UA = window.navigator.userAgent.toLowerCase()
    return UA && /msie|trident/.test(UA)
  },

  /*
   * Determines if the user's browser is Edge
   */
  isEdge() {
    const UA = window.navigator.userAgent.toLowerCase()
    return UA && /edge/.test(UA)
  },

  showSnack(snackOptions, msg, color = 'error') {
    snackOptions.msg = msg
    snackOptions.color = color
    snackOptions.show = true
  },

  /*
   * Formats a time series shared tooltip
   * @param {object} ctx - the graph context object
   */
  formatTimeSeriesSharedTooltip(ctx) {
    // Function to get the graph line symbol
    const getSymbol = (symbolName) => {
      let symbol = ''
      switch (symbolName) {
        case 'circle':
          symbol = '●'
          break
        case 'diamond':
          symbol = '♦'
          break
        case 'square':
          symbol = '■'
          break
        case 'triangle':
          symbol = '▲'
          break
        case 'triangle-down':
          symbol = '▼'
          break
        default:
      }
      return symbol
    }

    // Format the date
    const formattedDate = dayjs(ctx.points[0].key).format('MMMM YYYY')

    let tooltipMarkup = `<div class="graph-tooltip" style="opacity: 1"><div class="graph-tooltip-inner" style="opacity: 1 z-index: 101"><b>${formattedDate}</b>`
    let value
    let percent
    const { points } = ctx
    let symbolHtml

    // Sort the points by y value descending
    points.sort((pointA, pointB) => pointB.y - pointA.y)

    // Calculate the total of all point values
    const totalValue = points.reduce((total, pt) => total + pt.y, 0)

    // Create the tooltip markup for each point
    points.forEach((point) => {
      value = numeral(point.y).format('$0,0.00')
      percent = totalValue ? numeral(point.y / totalValue).format('0.00%') : 0

      if (point.series.legendSymbol) {
        if (this.isIE()) {
          symbolHtml = new XMLSerializer().serializeToString(point.series.legendSymbol.element)
        } else {
          symbolHtml = point.series.legendSymbol.element.outerHTML
        }

        tooltipMarkup +=
          `${
            '<div class="tooltip-row symbolhtml" style="display: flex; justify-content: space-between;">' +
            '  <div class="tooltip-label" style="padding-right: 30px;">' +
            '    <svg width="16" height="16" color="'
          }${point.series.color}">${symbolHtml}</svg> ${point.series.name}: ` +
          '  </div>' +
          `  <div class="tooltip-value"><b>${value} (${percent})</b></div>` +
          '</div>'
      } else {
        tooltipMarkup +=
          `${
            '<div class="tooltip-row symbol" style="display: flex; justify-content: space-between;">' +
            '  <div class="tooltip-label" style="padding-right: 30px;">' +
            '    <div class="tooltip-symbol" style="color: '
          }${point.series.color}">${getSymbol(point.series.symbol)}</div> ${point.series.name}: ` +
          '  </div>' +
          `  <div class="tooltip-value"><b>${value} (${percent})</b></div>` +
          '</div>'
      }
    })
    tooltipMarkup +=
      `${
        '<div class="tooltip-row" style="display: flex; justify-content: space-between; margin-top: 8px">' +
        '  <div class="tooltip-label">Total:</div>' +
        '  <div class="tooltip-value">'
      }${numeral(totalValue).format('$0,0.00')}</div>` + '</div>'
    tooltipMarkup += '</div></div>'

    return tooltipMarkup
  }
}
