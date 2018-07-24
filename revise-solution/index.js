'use strict'

const l = require('lodash')
const parseGurobiSolution = require('parse-gurobi-solution')

const clone = x => JSON.parse(JSON.stringify(x))
const round = x => l.round(x, 5)

const createReviseSolution = (inputGraph, settings) => async (solutionStream) => {
    const graph = clone(inputGraph)
    const solution = await parseGurobiSolution(solutionStream)

    // write new coordinates
    for (let index in graph.nodes) {
        const node = graph.nodes[+index]
        node.metadata.x = round(solution[`vx${index}`]-settings.offset)
        node.metadata.y = round(solution[`vy${index}`]-settings.offset)
    }

    return graph
}

module.exports = createReviseSolution
