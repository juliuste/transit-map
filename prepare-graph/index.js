'use strict'

const planarize = require('./planarize')
const addDirections = require('./add-directions')

const prepareGraph = (networkGraph) => {
    // const planarGraph = planarize(networkGraph)
    const graphWithDirections = addDirections(networkGraph)
    return graphWithDirections
}

module.exports = prepareGraph
