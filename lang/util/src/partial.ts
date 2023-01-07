function assertNumberOfArgs(numArgs: number, expectedNumberOfArgs: number) {
  if (numArgs !== expectedNumberOfArgs) {
    throw new Error(`Expected ${expectedNumberOfArgs} arguments, got ${numArgs}`)
  }
}

function _1_of_1<A, R>(theA: A, f: (a: A) => R): () => R {
  return function () {
    assertNumberOfArgs(arguments.length, 0)
    return f(theA)
  }
}

function _1_of_2<A, B, R>(theA: A, f: (a: A, b: B) => R): (b: B) => R {
  return function (b: B) {
    assertNumberOfArgs(arguments.length, 1)
    return f(theA, b)
  }
}

function _1_of_3<A, B, C, R>(theA: A, f: (a: A, b: B, c: C) => R): (b: B, c: C) => R {
  return function (b: B, c: C) {
    assertNumberOfArgs(arguments.length, 2)
    return f(theA, b, c)
  }
}

function _1_of_4<A, B, C, D, R>(
  theA: A,
  f: (a: A, b: B, c: C, d: D) => R,
): (b: B, c: C, d: D) => R {
  return function (b: B, c: C, d: D) {
    assertNumberOfArgs(arguments.length, 3)
    return f(theA, b, c, d)
  }
}

function _1_of_5<A, B, C, D, E, R>(
  theA: A,
  f: (a: A, b: B, c: C, d: D, e: E) => R,
): (b: B, c: C, d: D, e: E) => R {
  return function (b: B, c: C, d: D, e: E) {
    assertNumberOfArgs(arguments.length, 4)
    return f(theA, b, c, d, e)
  }
}

function _1_of_6<A, B, C, D, E, F, R>(
  theA: A,
  func: (a: A, b: B, c: C, d: D, e: E, f: F) => R,
): (b: B, c: C, d: D, e: E, f: F) => R {
  return function (b: B, c: C, d: D, e: E, f: F) {
    assertNumberOfArgs(arguments.length, 5)
    return func(theA, b, c, d, e, f)
  }
}

function _1_of_7<A, B, C, D, E, F, G, R>(
  theA: A,
  func: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R,
): (b: B, c: C, d: D, e: E, f: F, g: G) => R {
  return function (b: B, c: C, d: D, e: E, f: F, g: G) {
    assertNumberOfArgs(arguments.length, 6)
    return func(theA, b, c, d, e, f, g)
  }
}

function _1_of_8<A, B, C, D, E, F, G, H, R>(
  theA: A,
  func: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R,
): (b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R {
  return function (b: B, c: C, d: D, e: E, f: F, g: G, h: H) {
    assertNumberOfArgs(arguments.length, 7)
    return func(theA, b, c, d, e, f, g, h)
  }
}

export const partial1 = {
  of1: _1_of_1,
  of2: _1_of_2,
  of3: _1_of_3,
  of4: _1_of_4,
  of5: _1_of_5,
  of6: _1_of_6,
  of7: _1_of_7,
  of8: _1_of_8,
}

function _2_of_4<A, B, C, D, R>(
  theA: A,
  theB: B,
  f: (a: A, b: B, c: C, d: D) => R,
): (c: C, d: D) => R {
  return function (c: C, d: D) {
    assertNumberOfArgs(arguments.length, 2)
    return f(theA, theB, c, d)
  }
}

export const partial2 = {
  of4: _2_of_4,
}
