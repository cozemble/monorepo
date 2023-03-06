export {}
declare global {
  namespace jest {
    interface Matchers<R> {
      toEqualIgnoringWhitespace(s: string): R
    }

    interface Expect {
      toEqualIgnoringWhitespace: (s: string) => void
    }
  }
}

// interface CustomMatchers<R = unknown> {
//   toEqualIgnoringWhitespace(): R
// }

// declare namespace global {
//   namespace Vi {
//     type Assertion = CustomMatchers
//     type AsymmetricMatchersContaining = CustomMatchers
//   }

//   // Note: augmenting jest.Matchers interface will also work.
// }
