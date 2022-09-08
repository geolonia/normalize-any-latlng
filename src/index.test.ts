import { NormalizationResult, normalize } from './index'

const separators = [...new Set(',|\t :;'.split('').reduce<string[]>((prev, _s) => {
  prev.push(_s, `${_s} `, ` ${_s}`, `${_s}${_s}`)
  return prev
}, []))]

const successCases: { title: string, input: string, output: NormalizationResult[] }[] = separators.map(_s => [
  // float
  { title: `Only Float, separator: "${_s}", order: lat -> lng`, input: `35.1234${_s}135.6789`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `Only Float, separator: "${_s}", order: lat -> lng, lng, overflow +1π`, input: `35.1234${_s}315.6789`, output: [{ lat: 35.1234, lng: -44.3211 }] },
  { title: `Only Float, separator: "${_s}", order: lat -> lng, lng, overflow +2π`, input: `35.1234${_s}495.6789`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `Only Float, separator: "${_s}", order: lat -> lng, lng, overflow -1π`, input: `35.1234${_s}-44.3211`, output: [{ lat: 35.1234, lng: -44.3211 }] },
  { title: `Only Float, separator: "${_s}", order: lat -> lng, lng, overflow -2π`, input: `35.1234${_s}-224.3211`, output: [{ lat: 35.1234, lng: 135.6789 }] },

  // prefix
  { title: `NEWS Prefix, separator: "${_s}", order: N -> E`, input: `N35.1234${_s}E135.6789`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `NEWS Prefix, separator: "${_s}", order: E -> N`, input: `E135.6789${_s}N35.1234`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `NEWS Prefix, separator: "${_s}", order: N -> W`, input: `N35.1234${_s}W135.6789`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `NEWS Prefix, separator: "${_s}", order: W -> N`, input: `W135.6789${_s}N35.1234`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `NEWS Prefix, separator: "${_s}", order: S -> E`, input: `S35.1234${_s}E135.6789`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `NEWS Prefix, separator: "${_s}", order: E -> S`, input: `E135.6789${_s}S35.1234`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `NEWS Prefix, separator: "${_s}", order: S -> W`, input: `S35.1234${_s}W135.6789`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `NEWS Prefix, separator: "${_s}", order: W -> S`, input: `W135.6789${_s}S35.1234`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `NEWS Prefix, separator: "${_s}", order: N -> E, overflow +1π`, input: `N35.1234${_s}E315.6789`, output: [{ lat: 35.1234, lng: -44.3211 }] },
  { title: `NEWS Prefix, separator: "${_s}", order: n -> e`, input: `n35.1234${_s}e135.6789`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `NEWS Prefix, separator: "${_s}", order: w -> s`, input: `w135.6789${_s}s35.1234`, output: [{ lat: -35.1234, lng: -135.6789 }] },

  { title: `Japanese Prefix, separator: "${_s}", order: 北緯 -> 東経`, input: `北緯35.1234${_s}東経135.6789`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 東経 -> 北緯`, input: `東経135.6789${_s}北緯35.1234`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 北緯 -> 西経`, input: `北緯35.1234${_s}西経135.6789`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 西経 -> 北緯`, input: `西経135.6789${_s}北緯35.1234`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 南緯 -> 東経`, input: `南緯35.1234${_s}東経135.6789`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 東経 -> 南緯`, input: `東経135.6789${_s}南緯35.1234`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 南緯 -> 西経`, input: `南緯35.1234${_s}西経135.6789`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 西経 -> 南緯`, input: `西経135.6789${_s}南緯35.1234`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 北緯 -> 東経, overflow +1π`, input: `北緯35.1234${_s}東経315.6789`, output: [{ lat: 35.1234, lng: -44.3211 }] },

  { title: `Japanese Prefix, separator: "${_s}", order: 北 -> 東`, input: `北35.1234${_s}東135.6789`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 東 -> 北`, input: `東135.6789${_s}北35.1234`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 北 -> 西`, input: `北35.1234${_s}西135.6789`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 西 -> 北`, input: `西135.6789${_s}北35.1234`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 南 -> 東`, input: `南35.1234${_s}東135.6789`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 東 -> 南`, input: `東135.6789${_s}南35.1234`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 南 -> 西`, input: `南35.1234${_s}西135.6789`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 西 -> 南`, input: `西135.6789${_s}南35.1234`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `Japanese Prefix, separator: "${_s}", order: 北 -> 東, overflow +1π`, input: `北35.1234${_s}東315.6789`, output: [{ lat: 35.1234, lng: -44.3211 }] },

  // postfix
  { title: `NEWS Postfix, separator: "${_s}", order: N -> E`, input: `35.1234N${_s}135.6789E`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `NEWS Postfix, separator: "${_s}", order: E -> N`, input: `135.6789E${_s}35.1234N`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `NEWS Postfix, separator: "${_s}", order: N -> W`, input: `35.1234N${_s}135.6789W`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `NEWS Postfix, separator: "${_s}", order: W -> N`, input: `135.6789W${_s}35.1234N`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `NEWS Postfix, separator: "${_s}", order: S -> E`, input: `35.1234S${_s}135.6789E`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `NEWS Postfix, separator: "${_s}", order: E -> S`, input: `135.6789E${_s}35.1234S`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `NEWS Postfix, separator: "${_s}", order: S -> W`, input: `35.1234S${_s}135.6789W`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `NEWS Postfix, separator: "${_s}", order: W -> S`, input: `135.6789W${_s}35.1234S`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `NEWS Postfix, separator: "${_s}", order: N -> E, overflow +1π`, input: `35.1234N${_s}315.6789E`, output: [{ lat: 35.1234, lng: -44.3211 }] },
  { title: `NEWS Postfix, separator: "${_s}", order: n -> e`, input: `35.1234n${_s}135.6789e`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `NEWS Postfix, separator: "${_s}", order: w -> s`, input: `135.6789w${_s}35.1234s`, output: [{ lat: -35.1234, lng: -135.6789 }] },

  { title: `Japanese Postfix, separator: "${_s}", order: 北緯 -> 東経`, input: `35.1234北緯${_s}135.6789東経`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 東経 -> 北緯`, input: `135.6789東経${_s}35.1234北緯`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 北緯 -> 西経`, input: `35.1234北緯${_s}135.6789西経`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 西経 -> 北緯`, input: `135.6789西経${_s}35.1234北緯`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 南緯 -> 東経`, input: `35.1234南緯${_s}135.6789東経`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 東経 -> 南緯`, input: `135.6789東経${_s}35.1234南緯`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 南緯 -> 西経`, input: `35.1234南緯${_s}135.6789西経`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 西経 -> 南緯`, input: `135.6789西経${_s}35.1234南緯`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 北緯 -> 東経, overflow +1π`, input: `35.1234北緯${_s}315.6789東経`, output: [{ lat: 35.1234, lng: -44.3211 }] },

  { title: `Japanese Postfix, separator: "${_s}", order: 北 -> 東`, input: `北35.1234${_s}東135.6789`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 東 -> 北`, input: `東135.6789${_s}北35.1234`, output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 北 -> 西`, input: `北35.1234${_s}西135.6789`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 西 -> 北`, input: `西135.6789${_s}北35.1234`, output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 南 -> 東`, input: `南35.1234${_s}東135.6789`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 東 -> 南`, input: `東135.6789${_s}南35.1234`, output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 南 -> 西`, input: `南35.1234${_s}西135.6789`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 西 -> 南`, input: `西135.6789${_s}南35.1234`, output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: `Japanese Postfix, separator: "${_s}", order: 北 -> 東, overflow +1π`, input: `北35.1234${_s}東315.6789`, output: [{ lat: 35.1234, lng: -44.3211 }] },


  // DD°MM'SS"
  // { title: 'DD°MM\'SS", order: lat -> lng', input: '35°12\'34", 135°67\'89"', output: [{ lat: 35.1234, lng: 135.6789 }] },
]).flat()

const failureCases: { title: string, input: string, error: any }[] = []

describe('success cases', () => {
  for (const { title, input, output } of successCases) {
    test(title, () => {
      expect(normalize(input)).toEqual(output)
    })
  }
})

describe('failure cases', () => {
  for (const { title, input, error } of failureCases) {
    test(title, () => {
      expect(() => normalize(input)).toThrow(error)
    })
  }
})
