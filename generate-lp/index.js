'use strict'

const l = require('lodash')
const u = require('./util')

const createOcclusionConstraints = require('./occlusion')
const createOctolinearityConstraints = require('./octolinearity')

// sets left !== right using a boolean variable (note that negativeRight = (-1) * right)
// see: https://math.stackexchange.com/a/1517850
const createNotEqual = (settings) => (left, negativeRight, boolean) => {
    const upperBound = settings.maxEdgeLength + 1
    return [
        `${left} ${negativeRight} - ${upperBound} ${boolean} <= -0.5`,
        `${left} ${negativeRight} - ${upperBound} ${boolean} >= ${0.5 - upperBound}`
    ]
}

const createGenerateLP = (graph, settings) => (outputStream) => {
    const w = u.createWrite(outputStream)
    const wt = u.createWriteTab(outputStream)

    const occlusionConstraints = createOcclusionConstraints(settings)
    const octolinearityConstraints = createOctolinearityConstraints(settings)
    const notEqual = createNotEqual(settings)

    // prepare variables
    const coefficients = {
        q: []
    }
    const continuous = {
        vx: graph.nodes.map(n => `vx${u.nodeIndex(graph, n.id)}`),
        vy: graph.nodes.map(n => `vy${u.nodeIndex(graph, n.id)}`),
        l: graph.edges.map(e => `l${u.edgeIndex(graph, e)}`),
        pa: graph.edges.map(e => `pa${u.edgeIndex(graph, e)}`),
        pb: graph.edges.map(e => `pb${u.edgeIndex(graph, e)}`),
        pc: graph.edges.map(e => `pc${u.edgeIndex(graph, e)}`),
        pd: graph.edges.map(e => `pd${u.edgeIndex(graph, e)}`)
    }
    const integer = {
        q: []
    }
    const binary = {
        a: graph.edges.map(e => `a${u.edgeIndex(graph, e)}`),
        b: graph.edges.map(e => `b${u.edgeIndex(graph, e)}`),
        c: graph.edges.map(e => `c${u.edgeIndex(graph, e)}`),
        d: graph.edges.map(e => `d${u.edgeIndex(graph, e)}`),
        h: [],
        oa: [],
        ob: [],
        oc: [],
        od: [],
        ua: [],
        ub: [],
        uc: [],
        ud: []
    }

    // prepare constraints
    const constraints = []
    const lazyConstraints = []

    // generate model
    // octolinearity and edge length
    graph.edges.forEach(e => constraints.push(...octolinearityConstraints(graph, e)))

    // edge occlusion
    let numAdjacentEdgeConstraints = 0
    for (let o = 0; o < graph.edges.length; o++) {
        for (let i = o+1; i < graph.edges.length; i++) {
            const outer = graph.edges[o]
            const inner = graph.edges[i]

            // check if edges are adjacent
            if (l.intersection([outer.source, outer.target], [inner.source, inner.target]).length > 0) {
                // handle adjacent edges

                // add variables
                binary.h.push(`h${numAdjacentEdgeConstraints}`)
                binary.oa.push(`oa${numAdjacentEdgeConstraints}`)
                binary.ob.push(`ob${numAdjacentEdgeConstraints}`)
                binary.oc.push(`oc${numAdjacentEdgeConstraints}`)
                binary.od.push(`od${numAdjacentEdgeConstraints}`)
                binary.ua.push(`ua${numAdjacentEdgeConstraints}`)
                binary.ub.push(`ub${numAdjacentEdgeConstraints}`)
                binary.uc.push(`uc${numAdjacentEdgeConstraints}`)
                binary.ud.push(`ud${numAdjacentEdgeConstraints}`)
                integer.q.push(`q${numAdjacentEdgeConstraints}`)

                if (l.intersection(outer.metadata.lines, inner.metadata.lines).length > 0) {
                    // line bend
                    coefficients.q.push(1)
                    // only angles >= 90°
                    constraints.push(`q${numAdjacentEdgeConstraints} <= 2`)
                } else {
                    // no line bend
                    coefficients.q.push(.25)
                }

                constraints.push(`q${numAdjacentEdgeConstraints} - oa${numAdjacentEdgeConstraints} - ob${numAdjacentEdgeConstraints} - oc${numAdjacentEdgeConstraints} - od${numAdjacentEdgeConstraints} = 0`)

                // check edge direction
                if (outer.target === inner.source || outer.source === inner.target) {
                    lazyConstraints.push(...notEqual(`3 a${o} - 3 b${o} + c${o} - d${o}`, `+ 3 a${i} - 3 b${i} + c${i} - d${i}`, `h${numAdjacentEdgeConstraints}`))
                    // constraints.push(`a${o} - a${i} - oa${numAdjacentEdgeConstraints} = 0`)
                    constraints.push(`a${o} + a${i} - 2 ua${numAdjacentEdgeConstraints} - oa${numAdjacentEdgeConstraints} = 0`)
                    // constraints.push(`b${o} - b${i} - ob${numAdjacentEdgeConstraints} = 0`)
                    constraints.push(`b${o} + b${i} - 2 ub${numAdjacentEdgeConstraints} - ob${numAdjacentEdgeConstraints} = 0`)
                    // constraints.push(`c${o} - c${i} - oc${numAdjacentEdgeConstraints} = 0`)
                    constraints.push(`c${o} + c${i} - 2 uc${numAdjacentEdgeConstraints} - oc${numAdjacentEdgeConstraints} = 0`)
                    // constraints.push(`d${o} - d${i} - od${numAdjacentEdgeConstraints} = 0`)
                    constraints.push(`d${o} + d${i} - 2 ud${numAdjacentEdgeConstraints} - od${numAdjacentEdgeConstraints} = 0`)
                } else {
                    lazyConstraints.push(...notEqual(`3 a${o} - 3 b${o} + c${o} - d${o}`, `- 3 a${i} + 3 b${i} - c${i} + d${i}`, `h${numAdjacentEdgeConstraints}`))
                    // constraints.push(`a${o} - b${i} - oa${numAdjacentEdgeConstraints} = 0`)
                    constraints.push(`a${o} + b${i} - 2 ua${numAdjacentEdgeConstraints} - oa${numAdjacentEdgeConstraints} = 0`)
                    // constraints.push(`b${o} - a${i} - ob${numAdjacentEdgeConstraints} = 0`)
                    constraints.push(`b${o} + a${i} - 2 ub${numAdjacentEdgeConstraints} - ob${numAdjacentEdgeConstraints} = 0`)
                    // constraints.push(`c${o} - d${i} - oc${numAdjacentEdgeConstraints} = 0`)
                    constraints.push(`c${o} + d${i} - 2 uc${numAdjacentEdgeConstraints} - oc${numAdjacentEdgeConstraints} = 0`)
                    // constraints.push(`d${o} - c${i} - od${numAdjacentEdgeConstraints} = 0`)
                    constraints.push(`d${o} + c${i} - 2 ud${numAdjacentEdgeConstraints} - od${numAdjacentEdgeConstraints} = 0`)
                }
                numAdjacentEdgeConstraints++
            } else {
                // handle non-adjacent edges
                constraints.push(...occlusionConstraints(graph, outer, inner))
            }
        }
    }

    // write model
    // 1. objective function
    w('Minimize')
        // sum of squared edge length variables l_n
        const lengths = continuous.l.map(l => `3 ${l} ^ 2`).join(' + ')
        // sum of angle differences in all "dimensions"
        const angles = integer.q.map((q, index) => `${4 * coefficients.q[index]} ${q}`).join(' + ')
        // write function
        wt(`${angles} + [ ${lengths} ] / 2`)

    // 2. constraints
    w('Subject To')
        // fix one coordinate pair
        wt(`vx0 = ${settings.offset}`)
        wt(`vy0 = ${settings.offset}`)

        constraints.forEach(c => wt(c))

    // 3. lazy constraints
    w('Lazy Constraints')
        lazyConstraints.forEach(l => wt(l))

    // 4. bounds
    w('Bounds')
        // edge length variables l
        continuous.l.forEach(l => wt(`${settings.minEdgeLength} <= ${l} <= ${settings.maxEdgeLength}`))
        // x-coordinate per node
        continuous.vx.forEach(vx => wt(`${settings.offset - settings.maxWidth/2} <= ${vx} <= ${settings.offset + settings.maxWidth/2}`))
        // y-coordinate per node
        continuous.vy.forEach(vy => wt(`${settings.offset - settings.maxHeight/2} <= ${vy} <= ${settings.offset + settings.maxHeight/2}`))
        // helper variables for products with a
        continuous.pa.forEach(pa => wt(`0 <= ${pa}`))
        // helper variables for products with b
        continuous.pb.forEach(pb => wt(`0 <= ${pb}`))
        // helper variables for products with c
        continuous.pc.forEach(pc => wt(`0 <= ${pc}`))
        // helper variables for products with d
        continuous.pd.forEach(pd => wt(`0 <= ${pd}`))
        // third helper variables for edge angles q
        integer.q.forEach(q => wt(`0 <= ${q} <= 3`))

    // 5. integer variables
    w('General')
        // third helper variables for edge angles q
        integer.q.forEach(q => wt(q))

    // 6. binary variables
    w('Binary')
        // first direction helper variables a
        binary.a.forEach(a => wt(a))
        // second direction helper variables b
        binary.b.forEach(b => wt(b))
        // third direction helper variables c
        binary.c.forEach(c => wt(c))
        // fourth direction helper variables d
        binary.d.forEach(d => wt(d))
        // adjacent edge occlusion helper variables h
        binary.h.forEach(h => wt(h))
        // first helper variables for edge angles oa
        binary.oa.forEach(oa => wt(oa))
        // first helper variables for edge angles ob
        binary.ob.forEach(ob => wt(ob))
        // first helper variables for edge angles oc
        binary.oc.forEach(oc => wt(oc))
        // first helper variables for edge angles od
        binary.od.forEach(od => wt(od))
        // second helper variables for edge angles ua
        binary.ua.forEach(ua => wt(ua))
        // second helper variables for edge angles ub
        binary.ub.forEach(ub => wt(ub))
        // second helper variables for edge angles uc
        binary.uc.forEach(uc => wt(uc))
        // second helper variables for edge angles ud
        binary.ud.forEach(ud => wt(ud))

    // 7. end
    w('End')

    return
}

module.exports = createGenerateLP
