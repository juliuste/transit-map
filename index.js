'use strict'

const prepareGraph = require('./prepare-graph')
const createGenerateLP = require('./generate-lp')

const settings = {
    offset: 10000,
    maxWidth: 300,
    maxHeight: 300,
    minEdgeLength: 1,
    maxEdgeLength: 8
}

const TransitMapSolver = (networkGraph) => {
    const graph = prepareGraph(networkGraph)
    const generateLP = createGenerateLP(graph, settings)

    return ({generateLP})
}

module.exports = TransitMapSolver
