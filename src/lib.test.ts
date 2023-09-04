import { isFatDegreeFormat } from './lib';

test('should be interpreted as DMS', () => {
  const input = 360613.58925;
  const output = isFatDegreeFormat(input);
  expect(output).toStrictEqual({
    degree: 36,
    minute: 6,
    second: 13.58925,
  });
});

test('should be interpreted as DMS', () => {
  const input = -360613.58925;
  const output = isFatDegreeFormat(input);
  expect(output).toStrictEqual({
    degree: -36,
    minute: -6,
    second: -13.58925,
  });
});

test('should be interpreted as DMS', () => {
  const input = 1400516.27815;
  const output = isFatDegreeFormat(input);
  expect(output).toStrictEqual({
    degree: 140,
    minute: 5,
    second: 16.27815,
  });
});

test('should be interpreted as DMS', () => {
  const input = -1400516.27815;
  const output = isFatDegreeFormat(input);
  expect(output).toStrictEqual({
    degree: -140,
    minute: -5,
    second: -16.27815,
  });
});

test('too big number should not be interpreted as DMS', () => {
  const input = 12345654.25;
  const output = isFatDegreeFormat(input);
  expect(output).toBe(false);
});

test('minute < 1 should not be interpreted as DMS', () => {
  const input = 58.9234;
  const output = isFatDegreeFormat(input);
  expect(output).toBe(false);
});

test('minute > -1 should not be interpreted as DMS', () => {
  const input = -58.9234;
  const output = isFatDegreeFormat(input);
  expect(output).toBe(false);
});

test('too small number should not be interpreted as DMS', () => {
  const input = -12345654.25;
  const output = isFatDegreeFormat(input);
  expect(output).toBe(false);
});

test('minute over 59 should not be interpreted as DMS', () => {
  const input = 366059.58925;
  const output = isFatDegreeFormat(input);
  expect(output).toBe(false);
});

test('second over 59 should not be interpreted as DMS', () => {
  const input = 365960.58925;
  const output = isFatDegreeFormat(input);
  expect(output).toBe(false);
});
