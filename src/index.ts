export type NormalizationResult = {
  lat: number | null
  lng: number | null
  format?: string
}
export type Normalize = (latlngStr: string) => NormalizationResult[]

export const normalize: Normalize = (latlngStr) => {

  const latlngFlagments = latlngStr.split(/[, \/|、;:\t　]+/g).filter(x => !!x).slice(0, 2)

  let lat: number | null = null
  let lng: number | null = null
  let useDirectionIdentifier = false

  for (const flg of latlngFlagments) {
    const target = flg.toUpperCase()
      .replace(/[Ａ-Ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))

    let match: RegExpMatchArray | null

    match = target.match(/^([NSEW]|北緯?|南緯?|東経?|西経?)([0-9]+(\.[0-9]+)?)/)
    if(match) {
      useDirectionIdentifier = true
      const prefix = match[1]
      const number = parseFloat(match[2])
      if(prefix === 'N' || prefix[0] === '北') {
        lat = number
      } else if (prefix === 'S' || prefix[0] === '南') {
        lat = - number
      } else if (prefix === 'E' || prefix[0] === '東') {
        lng = number
      } else if (prefix === 'W' || prefix[0] === '西') {
        lng = - number
      }
      continue
    }

    match = target.match(/^([0-9]+(\.[0-9]+)?)([NSEW]|北緯?|南緯?|東経?|西経?)$/)
    if(match) {
      useDirectionIdentifier = true
      const postfix = match[3]
      const number = parseFloat(match[1])
      if(postfix === 'N' || postfix[0] === '北') {
        lat = number
      } else if (postfix === 'S' || postfix[0] === '南') {
        lat = - number
      } else if (postfix === 'E' || postfix[0] === '東') {
        lng = number
      } else if (postfix === 'W' || postfix[0] === '西') {
        lng = - number
      }
      continue
    }
  }

  if(!useDirectionIdentifier) {
    [lat, lng] = latlngFlagments.map(val => parseFloat(val))
  }

  if(typeof lat === 'number' && (lat < -90 ||  lat > 90)) {
    lat = null
  }

  while (typeof lng === 'number' && (lng < -180 || lng > 180)) {
    if(lng < -180) {
      lng += 360
    } else {
      lng -= 360
    }
  }
  return [{ lat, lng }]
}

