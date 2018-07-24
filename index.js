'use strict'

const prepareGraph = require('./prepare-graph')
const createGenerateLP = require('./generate-lp')

const TransitMapSolver = (networkGraph) => {
    const graph = prepareGraph(networkGraph)
    const generateLP = createGenerateLP(graph)

    return ({generateLP})
}

module.exports = TransitMapSolver
