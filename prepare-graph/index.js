'use strict'

const planarize = require('./planarize')
const addDirections = require('./add-directions')

const prepareGraph = (networkGraph) => {
    const planarGraph = planarize(graph)
    const graphWithDirections = addDirections(graph)
    return graphWithDirections
}

module.exports = prepareGraph
