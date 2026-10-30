/** Concurrent addressees and turn boundaries must never mix messages. */
import {describe, expect, it} from 'vitest'
import {emptyLane, reduceEvent} from './session'
import {laneKey} from './types'
describe('conversation events', () => {
  it('keeps simultaneous host and specialist text separate', () => {
    const target = {agent:'Raven-Code',handle:'coder'}
    let state = reduceEvent({}, {type:'token.delta',payload:{text:'Host'}})
    state = reduceEvent(state, {type:'token.delta',payload:{text:'Specialist',target}})
    expect(state.host.text).toBe('Host')
    expect(state[laneKey(target)].text).toBe('Specialist')
  })
  it('completes only the addressed lane', () => {
    const target = {agent:'Raven-Code',handle:'coder'}, key = laneKey(target)
    const state = reduceEvent({host:{...emptyLane(),running:true,text:'Host'},[key]:{...emptyLane(),running:true,text:'Done'}}, {type:'message.complete',payload:{target}})
    expect(state.host.running).toBe(true)
    expect(state[key].running).toBe(false)
    expect(state[key].messages[0].text).toBe('Done')
    expect(state[key].text).toBe('')
  })
  it('ignores terminal frames from an older turn', () => {
    const original = {host:{...emptyLane(),running:true,turnId:'new'}}
    expect(reduceEvent(original,{type:'error',payload:{turn_id:'old',message:'old failure'}})).toBe(original)
  })
  it('does not clear accumulated text when duplicate start arrives', () => {
    const result = reduceEvent({host:{...emptyLane(),text:'First token'}},{type:'message.start',payload:{turn_id:'t'}})
    expect(result.host.text).toBe('First token')
    expect(result.host.running).toBe(true)
  })
})
