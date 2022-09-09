export type NormalizationResult = {
  lat: number | null
  lng: number | null
  format?: string
}

export const affixPresets = {
  jp: ['北緯?','南緯?','東経?','西経?'],
  ko: ['북위?','남위?','동경?','서경?'],
}

export type AffixLocale = keyof typeof affixPresets

export type NormalizeOptions = {
  affixLocales: AffixLocale[]
}

export type Normalize = (latlngStr: string, options?: Partial<NormalizeOptions>) => NormalizationResult[]


const parseAnyNumber = (numberStr: string) => {

  let walker = numberStr
  let sumDegree = 0
  let unit = 1
  let hasDegree = false
  let hasMinute = false
  let hasSecond = false
  const degreeSeparators = ['°', '度', 'DEG', 'DEG.', 'DEGREE', 'DEGREES']
  const minuteSeparators = ['\'', '分', 'MIN', 'MIN.', 'MINUTE', 'MINUTES']
  const secondSeparators = ['"', '秒', 'SEC', 'SEC.', 'SECOND', 'SECONDS']

  while(degreeSeparators.length > 0) {
    const separator = degreeSeparators.shift() as string
    const index = walker.indexOf(separator)
    if(index !== -1) {
      hasDegree = true
      const degree = parseFloat(walker.slice(0, index + 1))
      if(degree < 0) unit = -1
      sumDegree += Number.isNaN(degree) ? 0 : degree
      walker = walker.slice(index + 1)
      break
    }
  }

  // must be decimal
  if(sumDegree === 0) {
    return parseFloat(numberStr)
  }

  while(minuteSeparators.length > 0) {
    const separator = minuteSeparators.shift() as string
    const index = walker.indexOf(separator)
    if(index !== -1) {
      hasMinute = true
      const minute = parseFloat(walker.slice(0, index + 1))
      sumDegree += Number.isNaN(minute) ? 0 : unit * minute / 60
      walker = walker.slice(index + 1)
      break
    }
  }

  while(secondSeparators.length > 0) {
    const separator = secondSeparators.shift() as string
    const index = walker.indexOf(separator)
    if(index !== -1) {
      hasSecond = false
      const second = parseFloat(walker.slice(0, index + 1))
      sumDegree += Number.isNaN(second) ? 0 : unit * second / 3600
      walker = walker.slice(index + 1)
      break
    }
  }

  if(!hasSecond && hasMinute) {
    const second = parseFloat(walker)
    sumDegree += Number.isNaN(second) ? 0 : unit * second / 3600
  } else if (!hasSecond && !hasMinute && hasDegree) {
    const minute = parseFloat(walker)
    sumDegree += Number.isNaN(minute) ? 0 : unit * minute / 60
  }

  return sumDegree
}


export const normalize: Normalize = (latlngStr, options = {}) => {

  const affixRegexPatterns = ['[NSEW]']
  for (const affixLocale of options.affixLocales || ['jp']) {
    affixRegexPatterns.push(...affixPresets[affixLocale])
  }

  const latlngFlagments = latlngStr
    .trim()
    .toUpperCase()
    .replace(/[Ａ-Ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/゜/g, '°')
    .replace(/[＇‘’`｀′]/g, "'")
    .replace(/[＂“”゛″]/g, '"')
    .replace(/''/g, '"')
    .split(/[, \/|、;:\t　]+/g)
    .filter(x => !!x)

  let lat: number | null = null
  let lng: number | null = null
  let useDirectionIdentifier = false

  for (const target of latlngFlagments) {

    let match: RegExpMatchArray | null

    const prefixRegex = new RegExp('^(' + affixRegexPatterns.join('|') + ')(.*)$')
    match = target.match(prefixRegex)
    if(match) {
      useDirectionIdentifier = true
      const prefix = match[1]
      const number = parseAnyNumber(match[2])
      if(prefix === 'N' || prefix[0] === '北' || prefix[0] === '북') {
        lat = number
      } else if (prefix === 'S' || prefix[0] === '南' || prefix[0] === '남') {
        lat = - number
      } else if (prefix === 'E' || prefix[0] === '東' || prefix[0] === '동') {
        lng = number
      } else if (prefix === 'W' || prefix[0] === '西' || prefix[0] === '서') {
        lng = - number
      }
      continue
    }

    const postfixRegex = new RegExp('^(.*)(' + affixRegexPatterns.join('|') + ')$')
    match = target.match(postfixRegex)
    if(match) {
      useDirectionIdentifier = true
      const postfix = match[2]
      const number = parseAnyNumber(match[1])
      if(postfix === 'N' || postfix[0] === '北' || postfix[0] === '북') {
        lat = number
      } else if (postfix === 'S' || postfix[0] === '南' || postfix[0] === '남') {
        lat = - number
      } else if (postfix === 'E' || postfix[0] === '東' || postfix[0] === '동') {
        lng = number
      } else if (postfix === 'W' || postfix[0] === '西' || postfix[0] === '서') {
        lng = - number
      }
      continue
    }
  }

  if(!useDirectionIdentifier) {
    [lat, lng] = latlngFlagments.map(val => parseAnyNumber(val))
  }

  if((typeof lat === 'number' && (lat < -90 ||  lat > 90) || Number.isNaN(lat))) {
    lat = null
  }

  if(typeof lng !== 'number' || Number.isNaN(lng)) {
    lng = null
  } else {
    while (lng < -180 || lng > 180) {
      if(lng < -180) {
        lng += 360
      } else {
        lng -= 360
      }
    }
  }

  return [{ lat, lng }]
}

