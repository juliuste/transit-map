'use strict'

const l = require('lodash')
const determinant = require('robust-determinant')
const hasIntersection = require('robust-segment-intersect')
const getIntersection = require('segseg')
const randomString = require('randomatic')

const clone = x => JSON.parse(JSON.stringify(x))
const round = x => l.round(x, 8)

const planarize = (networkGraph) => {
    const graph = clone(networkGraph)

    // check for nodes with the same coordinates and round node coordinates
    for (let o = 0; o < graph.nodes.length; o++) {
        const outer = graph.nodes[o].metadata
        outer.x = round(outer.x)
        outer.y = round(outer.y)
        for (let i = o+1; i < graph.nodes.length; i++) {
            const inner = graph.nodes[i].metadata
            inner.x = round(inner.x)
            inner.y = round(inner.y)
            const xDiff = round(outer.x-inner.x)
            const yDiff = round(outer.y-inner.y)
            if (xDiff === 0 && yDiff === 0) throw new Error('Two separate stations cannot share the same geocoordinates.')
        }
    }

    loopEdges: while (true) {
        // loop all edges, check for intersections
        for (let f = 0; f < graph.edges.length; f++) {
            for (let s = f+1; s < graph.edges.length; s++) {
                const first = graph.edges[f]
                const firstSource = graph.nodes.find(n => n.id === first.source).metadata
                const firstTarget = graph.nodes.find(n => n.id === first.target).metadata

                const second = graph.edges[s]
                const secondSource = graph.nodes.find(n => n.id === second.source).metadata
                const secondTarget = graph.nodes.find(n => n.id === second.target).metadata

                const sharedEndPoints = l.intersection([first.source, first.target], [second.source, second.target])
                if (sharedEndPoints.length > 1) throw new Error('Two separate edges cannot share more than one station.')

                // check if lines overlap / intersect
                const haveIntersection = hasIntersection([firstSource.x, firstSource.y], [firstTarget.x, firstTarget.y], [secondSource.x, secondSource.y], [secondTarget.x, secondTarget.y])

                // check if lines are parallel
                const firstDirection = [round(firstSource.x-firstTarget.x), round(firstSource.y-firstTarget.y)]
                const secondDirection = [round(secondSource.x-secondTarget.x), round(secondSource.y-secondTarget.y)]
                const matrix = [
                    [firstDirection[0], secondDirection[0]],
                    [firstDirection[1], secondDirection[1]]
                ]
                const areParallel = (determinant(matrix) === 0)

                if (haveIntersection && areParallel) {
                    if (sharedEndPoints.length === 0) throw new Error('Two separate edges cannot overlap in more than one point.')
                    if (sharedEndPoints.length === 1) throw new Error('Two separate edges cannot overlap in more than one point. Todo.')
                } else if (haveIntersection && sharedEndPoints.length === 0) {
                    // insert dummy node and repeat the loop
                    const [x,y] = getIntersection(firstSource.x, firstSource.y, firstTarget.x, firstTarget.y, secondSource.x, secondSource.y, secondTarget.x, secondTarget.y)
                    if (!l.isNumber(x) || !l.isNumber(y)) throw new Error('Weird error. Please report this issue.')

                    // create dummy node
                    const dummyNode = {
                        id: randomString('*', 11),
                        label: null,
                        dummy: true,
                        metadata: {
                            x,
                            y
                        }
                    }

                    graph.nodes.push(dummyNode)

                    // create new edges
                    const firstA = clone(first)
                    firstA.target = dummyNode.id
                    const firstB = clone(first)
                    firstB.source = dummyNode.id
                    const secondA = clone(second)
                    secondA.target = dummyNode.id
                    const secondB = clone(second)
                    secondB.source = dummyNode.id

                    // remove old edges
                    graph.edges = graph.edges.filter(e => !(e.source === first.source && e.target === first.target) && !(e.source === second.source && e.target === second.target))

                    // insert new edges
                    graph.edges.push(firstA, firstB, secondA, secondB)

                    // repeat the loop (until all intersections were replaced)
                    continue loopEdges
                }
            }
        }

        break
    }

    return graph
}

module.exports = planarize
