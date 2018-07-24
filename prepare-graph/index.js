'use strict'

const planarize = require('./planarize')
const addDirections = require('./add-directions')

const prepareGraph = (networkGraph) => {
    const planarGraph = planarize(networkGraph)
    const graphWithDirections = addDirections(planarGraph)
    return graphWithDirections
}

module.exports = prepareGraph
