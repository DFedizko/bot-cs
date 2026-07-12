/* eslint-disable @typescript-eslint/no-explicit-any */

import { shallowEqual } from 'shallow-equal'

interface ValueObjectProps {
  [index: string]: any
}

export abstract class ValueObject<Props extends ValueObjectProps> {
  constructor(protected readonly props: Props) {
    this.props = Object.freeze({ ...props })
  }

  equals(vo: ValueObject<Props>): boolean {
    if (vo === undefined) return false
    if (vo.props === undefined || vo.props === null) return false
    return shallowEqual(vo, this)
  }
}
