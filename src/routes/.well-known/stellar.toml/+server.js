import { Networks } from "stellar-base"
import { NETWORK, ISSUER_PK } from '$env/static/private'
import { error } from 'itty-router-extras'

export async function GET({ url, platform }) {
  const { env } = platform
  const { NFTS } = env

  const domain = url.host.split('.')
  const { keys } = await NFTS.list()

  if (!keys?.length)
    return error(400, 'No NFTs')

  let toml = `VERSION="2.1.0"

NETWORK_PASSPHRASE="${Networks[NETWORK]}"

ACCOUNTS=[
  "${ISSUER_PK}"
]

[DOCUMENTATION]
ORG_NAME="Stellar Development Foundation"
ORG_URL="https://m22.stellar.buzz"
ORG_SUPPORT_EMAIL="ecosystem@stellar.org"

[[PRINCIPALS]]
name="Tyler van der Hoeven"
email="tyler@stellar.org"
keybase="tyvdh"
twitter="tyvdh"
github="tyvdh"
discord="kalepail#8891"

${keys.map((key) => `[[CURRENCIES]]
code="${key.name}"
issuer="${ISSUER_PK}"
image="${url.protocol}//${domain.join('.')}/img/${key.name}.svg"`
).join('\n\n')}
`

  return new Response(toml, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': toml.length,
      'Cache-Control': 'public, max-age=5',
    },
  })
}