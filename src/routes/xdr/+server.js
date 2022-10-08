import { ISSUER_PK, ISSUER_SK, NETWORK, HORIZON } from '$env/static/private'
import albedoLinkSignatureVerification from '@albedo-link/signature-verification'
import { handleResponse } from '@/helpers/utils'
import BigNumber from 'bignumber.js'
import { Keypair, Account, TransactionBuilder, Networks, Operation, Asset, Transaction } from 'stellar-base'

const { verifyMessageSignature } = albedoLinkSignatureVerification

const issuerKeypair = Keypair.fromSecret(ISSUER_SK)

export async function POST({ platform, request }) {
  const body = await request.json()
  const { 
    code, pubkey, signature, signed_message,
    signed_envelope_xdr, key
  } = body

  if (key) {
    const { env } = platform
    const { NFTS } = env

    const transaction = new Transaction(signed_envelope_xdr, Networks[NETWORK])
    const keyIsValid = issuerKeypair.verify(transaction.hash(), Buffer.from(key, 'base64'))

    if (!keyIsValid)
      throw new Error('Invalid key')

    transaction.sign(issuerKeypair)

    console.log(code)
    await NFTS.put(code, 'OK')

    return new Response(
      JSON.stringify({
        xdr: transaction.toXDR()
      }), 
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  else if (signature) {
    if (code.length !== 12)
      throw new Error('Invalid code')

    const signatureIsValid = verifyMessageSignature(
      pubkey,
      signed_message,
      signature
    )
    
    if (!signatureIsValid)
      throw new Error('Invalid signature')

    const accountLoaded = await fetch(`${HORIZON}/accounts/${pubkey}`).then(handleResponse)
    const { sequence } = accountLoaded

    const NFT = new Asset(code, ISSUER_PK)
    const stroop = new BigNumber('0.0000001').toFixed(7)
    const account = new Account(pubkey, sequence)
    const transaction = new TransactionBuilder(account, { 
      fee: new BigNumber(1_000_000).toFixed(0), 
      networkPassphrase: Networks[NETWORK] 
    })
    .addOperation(Operation.changeTrust({
      asset: NFT,
      limit: stroop
    }))
    .addOperation(Operation.payment({
      destination: pubkey,
      amount: stroop,
      asset: NFT,
      source: ISSUER_PK
    }))
    .setTimeout(0)
    .build()

    return new Response(
      JSON.stringify({
        xdr: transaction.toXDR(),
        key: issuerKeypair.sign(transaction.hash()).toString('base64')
      }), 
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  else
    throw new Error('Invalid request')
}