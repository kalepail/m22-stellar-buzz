import { Keypair } from 'stellar-base'

export function GET() {
  return new Response(
    // 'Hello World'
    Keypair.random().publicKey()
  )
}