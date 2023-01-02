import {test, expect} from 'vitest'
import {dates} from "../src";

test("can format a date as ISO 8601 string", () => {
  expect(dates.toIso8601DateOnlyString(new Date(2021, 0, 11))).toBe("2021-01-11")
  expect(dates.toIso8601DateOnlyString(new Date(2021, 0, 1))).toBe("2021-01-01")

  expect(dates.toIso8601DateOnlyString(new Date(2021, 10, 11))).toBe("2021-11-11")
  expect(dates.toIso8601DateOnlyString(new Date(2021, 10, 1))).toBe("2021-11-01")
})

test("can format a date with time as ISO 8601 string", () => {
  expect(dates.toIso8601DateTimeString(new Date(2021, 0, 11, 9, 14))).toBe("2021-01-11T09:14:00.000Z")
})

test("can parse an ISO 8601 string", () => {
  expect(dates.fromIso8601String("2021-01-11T00:00:00.000Z")).toMatchObject(new Date(2021, 0, 11))
  expect(dates.fromIso8601String("2021-01-11")).toMatchObject(new Date(2021, 0, 11))
  expect(dates.fromIso8601String("2021-01-01T00:00:00.000Z")).toMatchObject(new Date(2021, 0, 1))

  expect(dates.fromIso8601String("2021-11-11T00:00:00.000Z")).toMatchObject(new Date(2021, 10, 11))
  expect(dates.fromIso8601String("2021-11-01T00:00:00.000Z")).toMatchObject(new Date(2021, 10, 1))
  expect(dates.fromIso8601String("2021-11-01T09:14:00.000Z")).toMatchObject(new Date(2021, 10, 1, 9, 14))
})

test("looks like a data object", () => {
  expect(dates.looksLikeADateObject(null)).toBe(false)
  expect(dates.looksLikeADateObject(undefined)).toBe(false)
  expect(dates.looksLikeADateObject("X")).toBe(false)
  expect(dates.looksLikeADateObject(2022)).toBe(false)
  expect(dates.looksLikeADateObject(new Date())).toBe(true)
})
