export interface SuccessfulOutcome<T = any> {
  _type: 'successful.outcome'
  value: T
}

export interface UnsuccessfulOutcome<E = any> {
  _type: 'unsuccessful.outcome'
  error: E
}

// Why I am making Either?
export type Outcome<T = any, E = any> = SuccessfulOutcome<T> | UnsuccessfulOutcome<E>

export const outcomeFns = {
  successful: <T>(value: T): SuccessfulOutcome<T> => ({ _type: 'successful.outcome', value }),
  unsuccessful: <E>(error: E): UnsuccessfulOutcome<E> => ({ _type: 'unsuccessful.outcome', error }),
}
