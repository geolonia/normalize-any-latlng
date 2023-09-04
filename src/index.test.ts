import { NormalizationResult, normalize } from './index';

const separators = [...new Set(',|\t :;　/'.split('').reduce<string[]>((prev, _s) => {
  prev.push(_s, `${_s} `, ` ${_s}`, `${_s}${_s}`);
  return prev;
}, []))];

type Case = { title: string, input: string, output: NormalizationResult[] };

const successCases: Case[] = [
  // separators
  ...separators.map((sep) => ({ title: `Separator: "${sep}"`, input: `35.1234${sep}135.6789`, output: [{ lat: 35.1234, lng: 135.6789 }] })),

  // float
  { title: 'Only Float, order: lat -> lng', input: '35.1234, 135.6789', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Only Float, order: lng -> lat', input: '135.6789, 35.1234', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Only Float, order: lat -> lng, lng, overflow +1π', input: '35.1234, 315.6789', output: [{ lat: 35.1234, lng: -44.3211 }] },
  { title: 'Only Float, order: lat -> lng, lng, overflow +2π', input: '35.1234, 495.6789', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Only Float, order: lat -> lng, lng, overflow -1π', input: '35.1234, -44.3211', output: [{ lat: 35.1234, lng: -44.3211 }] },
  { title: 'Only Float, order: lat -> lng, lng, overflow -2π', input: '35.1234, -224.3211', output: [{ lat: 35.1234, lng: 135.6789 }] },

  // prefix
  { title: 'NEWS Prefix, order: N -> E', input: 'N35.1234, E135.6789', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'NEWS Prefix, order: E -> N', input: 'E135.6789, N35.1234', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'NEWS Prefix, order: N -> W', input: 'N35.1234, W135.6789', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'NEWS Prefix, order: W -> N', input: 'W135.6789, N35.1234', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'NEWS Prefix, order: S -> E', input: 'S35.1234, E135.6789', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'NEWS Prefix, order: E -> S', input: 'E135.6789, S35.1234', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'NEWS Prefix, order: S -> W', input: 'S35.1234, W135.6789', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'NEWS Prefix, order: W -> S', input: 'W135.6789, S35.1234', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'NEWS Prefix, order: N -> E, overflow +1π', input: 'N35.1234, E315.6789', output: [{ lat: 35.1234, lng: -44.3211 }] },
  { title: 'NEWS Prefix, order: n -> e', input: 'n35.1234, e135.6789', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'NEWS Prefix, order: w -> s', input: 'w135.6789, s35.1234', output: [{ lat: -35.1234, lng: -135.6789 }] },

  { title: 'Japanese Prefix, order: 北緯 -> 東経', input: '北緯35.1234, 東経135.6789', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Japanese Prefix, order: 東経 -> 北緯', input: '東経135.6789, 北緯35.1234', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Japanese Prefix, order: 北緯 -> 西経', input: '北緯35.1234, 西経135.6789', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'Japanese Prefix, order: 西経 -> 北緯', input: '西経135.6789, 北緯35.1234', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'Japanese Prefix, order: 南緯 -> 東経', input: '南緯35.1234, 東経135.6789', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'Japanese Prefix, order: 東経 -> 南緯', input: '東経135.6789, 南緯35.1234', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'Japanese Prefix, order: 南緯 -> 西経', input: '南緯35.1234, 西経135.6789', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'Japanese Prefix, order: 西経 -> 南緯', input: '西経135.6789, 南緯35.1234', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'Japanese Prefix, order: 北緯 -> 東経, overflow +1π', input: '北緯35.1234, 東経315.6789', output: [{ lat: 35.1234, lng: -44.3211 }] },

  { title: 'Japanese Prefix, order: 北 -> 東', input: '北35.1234, 東135.6789', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Japanese Prefix, order: 東 -> 北', input: '東135.6789, 北35.1234', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Japanese Prefix, order: 北 -> 西', input: '北35.1234, 西135.6789', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'Japanese Prefix, order: 西 -> 北', input: '西135.6789, 北35.1234', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'Japanese Prefix, order: 南 -> 東', input: '南35.1234, 東135.6789', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'Japanese Prefix, order: 東 -> 南', input: '東135.6789, 南35.1234', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'Japanese Prefix, order: 南 -> 西', input: '南35.1234, 西135.6789', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'Japanese Prefix, order: 西 -> 南', input: '西135.6789, 南35.1234', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'Japanese Prefix, order: 北 -> 東, overflow +1π', input: '北35.1234, 東315.6789', output: [{ lat: 35.1234, lng: -44.3211 }] },

  // postfix
  { title: 'NEWS Postfix, order: N -> E', input: '35.1234N, 135.6789E', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'NEWS Postfix, order: E -> N', input: '135.6789E, 35.1234N', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'NEWS Postfix, order: N -> W', input: '35.1234N, 135.6789W', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'NEWS Postfix, order: W -> N', input: '135.6789W, 35.1234N', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'NEWS Postfix, order: S -> E', input: '35.1234S, 135.6789E', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'NEWS Postfix, order: E -> S', input: '135.6789E, 35.1234S', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'NEWS Postfix, order: S -> W', input: '35.1234S, 135.6789W', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'NEWS Postfix, order: W -> S', input: '135.6789W, 35.1234S', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'NEWS Postfix, order: N -> E, overflow +1π', input: '35.1234N, 315.6789E', output: [{ lat: 35.1234, lng: -44.3211 }] },
  { title: 'NEWS Postfix, order: n -> e', input: '35.1234n, 135.6789e', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'NEWS Postfix, order: w -> s', input: '135.6789w, 35.1234s', output: [{ lat: -35.1234, lng: -135.6789 }] },

  { title: 'Japanese Postfix, order: 北緯 -> 東経', input: '35.1234北緯, 135.6789東経', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Japanese Postfix, order: 東経 -> 北緯', input: '135.6789東経, 35.1234北緯', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Japanese Postfix, order: 北緯 -> 西経', input: '35.1234北緯, 135.6789西経', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'Japanese Postfix, order: 西経 -> 北緯', input: '135.6789西経, 35.1234北緯', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'Japanese Postfix, order: 南緯 -> 東経', input: '35.1234南緯, 135.6789東経', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'Japanese Postfix, order: 東経 -> 南緯', input: '135.6789東経, 35.1234南緯', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'Japanese Postfix, order: 南緯 -> 西経', input: '35.1234南緯, 135.6789西経', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'Japanese Postfix, order: 西経 -> 南緯', input: '135.6789西経, 35.1234南緯', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'Japanese Postfix, order: 北緯 -> 東経, overflow +1π', input: '35.1234北緯, 315.6789東経', output: [{ lat: 35.1234, lng: -44.3211 }] },

  { title: 'Japanese Postfix, order: 北 -> 東', input: '北35.1234, 東135.6789', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Japanese Postfix, order: 東 -> 北', input: '東135.6789, 北35.1234', output: [{ lat: 35.1234, lng: 135.6789 }] },
  { title: 'Japanese Postfix, order: 北 -> 西', input: '北35.1234, 西135.6789', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'Japanese Postfix, order: 西 -> 北', input: '西135.6789, 北35.1234', output: [{ lat: 35.1234, lng: -135.6789 }] },
  { title: 'Japanese Postfix, order: 南 -> 東', input: '南35.1234, 東135.6789', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'Japanese Postfix, order: 東 -> 南', input: '東135.6789, 南35.1234', output: [{ lat: -35.1234, lng: 135.6789 }] },
  { title: 'Japanese Postfix, order: 南 -> 西', input: '南35.1234, 西135.6789', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'Japanese Postfix, order: 西 -> 南', input: '西135.6789, 南35.1234', output: [{ lat: -35.1234, lng: -135.6789 }] },
  { title: 'Japanese Postfix, order: 北 -> 東, overflow +1π', input: '北35.1234, 東315.6789', output: [{ lat: 35.1234, lng: -44.3211 }] },

  // DD.DDD°
  { title: 'DD.DDD°, order: N -> E', input: 'N35.1234°, E135.6789°', output: [{ lat: 35.1234, lng: 135.6789 }] },

  // DD°MM'SS"
  { title: 'DD°MM\'SS", order: lat -> lng', input: '35°12\'34", 135°43\'21.01"', output: [{ lat: 35 + 12 / 60 + 34 / 3600, lng: 135 + 43 / 60 + 21.01 / 3600 }] },
  { title: 'DD°MM\'SS", order: lng -> lat', input: '135°43\'21.01", 35°12\'34"', output: [{ lat: 35 + 12 / 60 + 34 / 3600, lng: 135 + 43 / 60 + 21.01 / 3600 }] },
  { title: 'DD°MM\'SS", order: lat -> lng', input: '-35°12\'34", -135°43\'21.01"', output: [{ lat: -(35 + 12 / 60 + 34 / 3600), lng: -(135 + 43 / 60 + 21.01 / 3600) }] },
  { title: 'DD°MM\'SS", order: lng -> lat', input: '-135°43\'21.01", -35°12\'34"', output: [{ lat: -(35 + 12 / 60 + 34 / 3600), lng: -(135 + 43 / 60 + 21.01 / 3600) }] },
  { title: 'DD°MM\'SS", order: lat -> lng, lng, overflow +1π', input: '35°12\'34", 315°43\'21.01"', output: [{ lat: 35 + 12 / 60 + 34 / 3600, lng: 315 + 43 / 60 + 21.01 / 3600 - 360 }] },
  { title: 'DD°MM\'SS", order: N -> E', input: 'N35°12\'34", E135°43\'21.01"', output: [{ lat: 35 + 12 / 60 + 34 / 3600, lng: 135 + 43 / 60 + 21.01 / 3600 }] },
  { title: 'DD°MM\'SS", order: 南緯 -> 西経', input: '南緯35°12\'34", 西経135°43\'21.01"', output: [{ lat: -(35 + 12 / 60 + 34 / 3600), lng: -(135 + 43 / 60 + 21.01 / 3600) }] },

  { title: 'DD°MM\'SS", order: lat -> lng', input: '35°12\'34, 135°43\'21.01', output: [{ lat: 35 + 12 / 60 + 34 / 3600, lng: 135 + 43 / 60 + 21.01 / 3600 }] },
  { title: 'DD°MM\'SS", order: lat -> lng', input: '-35°12\'34, -135°43\'21.01', output: [{ lat: -(35 + 12 / 60 + 34 / 3600), lng: -(135 + 43 / 60 + 21.01 / 3600) }] },
  { title: 'DD°MM\'SS", order: lat -> lng, lng, overflow +1π', input: '35°12\'34, 315°43\'21.01', output: [{ lat: 35 + 12 / 60 + 34 / 3600, lng: 315 + 43 / 60 + 21.01 / 3600 - 360 }] },
  { title: 'DD°MM\'SS", order: N -> E', input: 'N35°12\'34, E135°43\'21.01', output: [{ lat: 35 + 12 / 60 + 34 / 3600, lng: 135 + 43 / 60 + 21.01 / 3600 }] },
  { title: 'DD°MM\'SS", order: 南緯 -> 西経', input: '南緯35°12\'34, 西経135°43\'21.01', output: [{ lat: -(35 + 12 / 60 + 34 / 3600), lng: -(135 + 43 / 60 + 21.01 / 3600) }] },

  { title: 'DD°MM\'SS", order: lat -> lng', input: '35°12, 135°43.21', output: [{ lat: 35 + 12 / 60, lng: 135 + 43.21 / 60 }] },
  { title: 'DD°MM\'SS", order: lat -> lng', input: '-35°12, -135°43.21', output: [{ lat: -(35 + 12 / 60), lng: -(135 + 43.21 / 60) }] },
  { title: 'DD°MM\'SS", order: lat -> lng, lng, overflow +1π', input: '35°12, 315°43.21', output: [{ lat: 35 + 12 / 60, lng: 315 + 43.21 / 60 - 360 }] },
  { title: 'DD°MM\'SS", order: N -> E', input: 'N35°12, E135°43.21', output: [{ lat: 35 + 12 / 60, lng: 135 + 43.21 / 60 }] },
  { title: 'DD°MM\'SS", order: 南緯 -> 西経', input: '南緯35°12, 西経135°43.21', output: [{ lat: -(35 + 12 / 60), lng: -(135 + 43.21 / 60) }] },

  { title: 'DD°MM\'SS\'\', order: lat -> lng', input: '35°12\'34\'\', 135°43\'21.01\'\'', output: [{ lat: 35 + 12 / 60 + 34 / 3600, lng: 135 + 43 / 60 + 21.01 / 3600 }] },

  // examples
  { title: 'https://en.wikipedia.org/wiki/Aqaba', input: '29°31′55″N 35°00′20″E', output: [{ lat: 29 + 31 / 60 + 55 / 3600, lng: 35 + 0 / 60 + 20 / 3600 }] },
  { title: 'https://ko.wikipedia.org/wiki/서울특별시', input: '북위37°34′00″ 동경126°58′41″', output: [{ lat: 37 + 34 / 60 + 0 / 3600, lng: 126 + 58 / 60 + 41 / 3600 }] },
  { title: 'https://ko.wikipedia.org/wiki/부에노스아이레스', input: '남위34°36′12″ 서경58°22′54″', output: [{ lat: -1 * (34 + 36 / 60 + 12 / 3600), lng: -1 * (58 + 22 / 60 + 54 / 3600) }] },
  { title: 'https://ja.wikipedia.org/wiki/諫早湾', input: '北緯32度53分9.35秒 東経130度11分9.34秒', output: [{ lat: 32 + 53 / 60 + 9.35 / 3600, lng: 130 + 11 / 60 + 9.34 / 3600 }] },
  { title: 'https://en.wikipedia.org/wiki/Canada', input: '45°24′N 75°40′W', output: [{ lat: 45 + 24 / 60, lng: -1 * (75 + 40 / 60) }] },

  // https://github.com/geolonia/normalize-any-latlng/issues/2
  { title: '「度分秒.秒」 type', input: '北緯360613.58925　東経1400516.27815', output: [ { lat: 36 + 6 / 60 + 13.58925 / 3600, lng: 140 + 5 / 60 + 16.27815 / 3600 } ] },
  { title: '「度分秒.秒」 type', input: '南緯360613.58925　西経1400516.27815', output: [ { lat: -36 - 6 / 60 - 13.58925 / 3600, lng: -140 - 5 / 60 - 16.27815 / 3600 } ] },

  // errors
  { title: 'invalid latlng', input: 'aaa bbb ccc', output: [{lat: null, lng: null}] },
];

describe('success cases', () => {
  const hasOnly = successCases.some(({ title }) => title.startsWith('[only]'));
  for (const { title, input, output } of successCases) {
    const isOnly = title.startsWith('[only]');
    if (hasOnly && !isOnly) continue;
    test(title, () => {
      expect(normalize(input)).toEqual(output);
    });
  }
});
