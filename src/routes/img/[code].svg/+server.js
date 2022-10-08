import colors from '@/final-colors.json'

export async function GET({ params }) {
  const w = 600
  const h = 320
  const alph = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const { code } = params
  const arr = new Array(code.length).fill(0).map((_, i) => alph.indexOf(code[i]))

  if (arr.includes(-1))
    throw new Error('Invalid code')

  const svg = (
  `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <!-- background -->
    <!-- 0 size -->
    <!-- 1 color -->
    <rect 
      x="0" 
      y="0"
      width="${w}" 
      height="${h}"
      stroke="white"
      fill="${colors[arr[1]]}"
      stroke-width="${h - (h / 61 * arr[0])}"
    />

    <!-- circle -->
    <!-- 2 size -->
    <!-- 3 cx -->
    <!-- 4 cy -->
    <!-- 5 color -->
    <circle 
      cx="${w / 61 * arr[3]}" 
      cy="${h / 61 * arr[4]}"    
      r="${h / 61 * arr[2] / 2}" 
      fill="${colors[arr[5]]}"
    />

    <!-- rotating line -->
    <!-- 6 rotation -->
    <!-- 7 color -->
    <line 
      x1="${w / 2 / 61 * arr[6]}"
      y1="0"
      x2="${w / 2 - (w / 2 / 61 * arr[6])}"
      y2="${h}"
      stroke="${colors[arr[7]]}" 
      stroke-width="5"
    />

    <!-- border -->
    <!-- 8 size -->
    <!-- 9 color -->
    <rect 
      x="0" 
      y="0"
      width="${w}" 
      height="${h}"
      stroke="${colors[arr[9]]}"
      fill="transparent"
      stroke-width="${h / 61 * arr[8] / 2}"
    />

    <!-- horizontal line -->
    <!-- 10 y1/y2 -->
    <!-- 11 color -->
    <line 
      x1="0" 
      y1="${h / 61 * arr[10]}" 
      x2="${w}" 
      y2="${h / 61 * arr[10]}" 
      stroke="${colors[arr[11]]}" 
      stroke-width="5"
    />
  </svg>`
  )

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Length': svg.length,
      'Cache-Control': 'public, max-age=5',
    }
  })
}