import {describe, expect, it} from 'vitest'
import {CARD_HEIGHT, placeTaskNodes} from './mapLayout'

const tasks = [
  {id:'research', parents:[]}, {id:'design', parents:['research']},
  {id:'build', parents:['design']}, {id:'review', parents:['build']},
  {id:'brief', parents:['research']},
]

describe('fixed task hierarchy', () => {
  it('puts prerequisites above dependents and aligns the main branch', () => {
    const {positions: p} = placeTaskNodes(tasks)
    for (const task of tasks) for (const parent of task.parents.length ? task.parents : ['host']) {
      expect(p[task.id].y).toBeGreaterThan(p[parent].y + CARD_HEIGHT)
    }
    expect(p.design.y).toBe(p.brief.y)
    expect(p.build.x).toBe(p.design.x)
    expect(p.review.x).toBe(p.build.x)
    expect(p.research.x).toBe((p.design.x + p.brief.x) / 2)
    expect(p.host.x).toBe(p.research.x)
  })
  it('is independent of incoming snapshot order', () => {
    expect(placeTaskNodes([...tasks].reverse())).toEqual(placeTaskNodes(tasks))
  })
  it('places a join below every prerequisite without overlapping cards', () => {
    const graph = [...tasks, {id:'ship', parents:['review','brief']}]
    for (const compact of [false, true]) {
      const {positions: p, nodeWidth} = placeTaskNodes(graph, compact)
      for (const parent of ['review','brief']) expect(p.ship.y).toBeGreaterThan(p[parent].y)
      const points = Object.values(p)
      points.forEach((a, i) => points.slice(i + 1).forEach(b => {
        expect(Math.abs(a.x-b.x) >= nodeWidth || Math.abs(a.y-b.y) >= CARD_HEIGHT).toBe(true)
      }))
    }
  })
  it('does not shift an existing chain when a dependent task arrives', () => {
    const before = placeTaskNodes(tasks.slice(0, 3)).positions
    const after = placeTaskNodes(tasks.slice(0, 4)).positions
    for (const id of Object.keys(before)) expect(after[id]).toEqual(before[id])
  })
  it('keeps separate missions distinct and handles missing dependencies', () => {
    const {positions:p} = placeTaskNodes([{id:'a/work',parents:['missing']},{id:'b/work',parents:[]}])
    expect(p['a/work'].y).toBe(p['b/work'].y)
    expect(p['a/work'].x).not.toBe(p['b/work'].x)
    expect(Object.keys(p).sort()).toEqual(['a/work','b/work','host'])
  })
  it('has finite positions for empty or malformed cyclic snapshots', () => {
    expect(placeTaskNodes([]).positions.host).toEqual({x:0,y:0})
    const {positions:p} = placeTaskNodes([{id:'a',parents:['b']},{id:'b',parents:['a']}])
    expect(Object.values(p).every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true)
    expect(p.a.x).not.toBe(p.b.x)
  })
})
