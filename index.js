'use strict'

const prepareGraph = require('./prepare-graph')
const createGenerateLP = require('./generate-lp')
const createReviseSolution = require('./revise-solution')

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
    const reviseSolution = createReviseSolution(graph, settings)

    return ({generateLP, reviseSolution})
}

module.exports = TransitMapSolver
