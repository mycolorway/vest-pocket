import {patchBehaviors} from './behaviors/utils'

export default function (config) {
  return {
    config,
    id: Behavior(patchBehaviors(config)),
    _vest: true
  }
}
