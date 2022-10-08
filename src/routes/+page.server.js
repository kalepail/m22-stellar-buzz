import { random } from 'lodash-es'

export async function load() {
  return {
    arr: new Array(12).fill(0).map(() => random(0, 61))
  }
}