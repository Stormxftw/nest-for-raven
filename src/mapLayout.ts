import type {XYPosition} from '@xyflow/react'

type LayoutTask = {id: string; parents: string[]}
export const CARD_HEIGHT = 104

/** A fixed hierarchy. Status, selection and snapshot order never affect placement. */
export function placeTaskNodes(tasks: LayoutTask[], compact = false) {
  const nodeWidth = compact ? 146 : 188
  const columnGap = compact ? 20 : 32
  const rowHeight = CARD_HEIGHT + 36
  const ids = [...new Set(tasks.map(task => task.id))].sort()
  const parents = new Map(tasks.map(task => [task.id, [...new Set(task.parents)].filter(id => ids.includes(id) && id !== task.id).sort()]))
  const depth = new Map<string, number>([['host', 0]])
  const pending = new Set(ids)
  while (pending.size) {
    const ready = [...pending].filter(id => parents.get(id)!.every(parent => depth.has(parent)))
    // A malformed cyclic graph still needs a bounded, inspectable layout.
    if (!ready.length) {
      const lastRow = Math.max(...depth.values()) + 1
      for (const id of pending) depth.set(id, lastRow)
      break
    }
    for (const id of ready) {
      depth.set(id, 1 + Math.max(0, ...parents.get(id)!.map(parent => depth.get(parent)!)))
      pending.delete(id)
    }
  }
  const children = new Map<string, string[]>(['host', ...ids].map(id => [id, []]))
  for (const id of ids) {
    // Use the deepest prerequisite for the tree spine; retain every edge in the UI.
    const parent = parents.get(id)!.filter(parent => depth.get(parent)! < depth.get(id)!)
      .sort((a, b) => depth.get(b)! - depth.get(a)! || a.localeCompare(b))[0] || 'host'
    children.get(parent)!.push(id)
  }
  const branchDepth = new Map<string, number>()
  for (const id of [...ids, 'host'].sort((a, b) => depth.get(b)! - depth.get(a)!)) {
    branchDepth.set(id, Math.max(0, ...children.get(id)!.map(child => 1 + branchDepth.get(child)!)))
    children.get(id)!.sort((a, b) => branchDepth.get(b)! - branchDepth.get(a)! || a.localeCompare(b))
  }
  const positions: Record<string, XYPosition> = Object.create(null)
  let leaf = 0
  const place = (id: string): number => {
    const xs = children.get(id)!.map(place)
    const x = xs.length ? (xs[0] + xs[xs.length - 1]) / 2 : leaf++ * (nodeWidth + columnGap)
    positions[id] = {x, y:depth.get(id)! * rowHeight}
    return x
  }
  place('host')
  return {
    positions, nodeWidth,
    width: Math.max(...Object.values(positions).map(point => point.x)) + nodeWidth + 20,
    height: Math.max(...Object.values(positions).map(point => point.y)) + CARD_HEIGHT + 48,
  }
}
