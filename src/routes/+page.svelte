<script>
  import { random } from 'lodash-es'
  import colors from '@/final-colors.json'
  import { onMount } from 'svelte';
  import { handleResponse } from '@/helpers/utils'
  // import { Server, Transaction } from 'stellar-sdk';

  const w = 600
  const h = 320
  const alph = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  let arr = new Array(12).fill(0).map(() => random(0, 61))
  let code = ''
  let input = ''

  $: {
    code = ''
    arr.forEach((value) => code += alph[value])
  }
  $: {
    input.split('').slice(0, 12).forEach((char, i) => {
      const index = alph.indexOf(char)
      
      if (index > -1) {
        arr.splice(i, 1, index)
        arr = arr
      }
    })
  }

  let albedo
  let StellarSdk

  onMount(async () => {
    albedo = await import('@albedo-link/intent').then((pkg) => pkg.default)
    StellarSdk = await import('stellar-sdk')
  })

  async function handleSubmit() {
    const { Server, Transaction } = StellarSdk
    const server = new Server(import.meta.env.VITE_HORIZON)

    const albedoPublicKey = await albedo.publicKey()
    const { pubkey } = albedoPublicKey

    const getXdrResponse = await fetch('/xdr', {
      method: 'POST',
      body: JSON.stringify({
        ...albedoPublicKey,
        code,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(handleResponse)
    const { xdr: unsignedXdr, key } = getXdrResponse

    const alebedoTx = await albedo.tx({
      pubkey,
      xdr: unsignedXdr,
      network: import.meta.env.VITE_NETWORK,
      description: 'Mint Meridian 2022 NFT',
      submit: false
    })

    const submitXdrResponse = await fetch('/xdr', {
      method: 'POST',
      body: JSON.stringify({
        ...alebedoTx,
        key
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(handleResponse)
    const { xdr: signedXdr } = submitXdrResponse

    const transaction = new Transaction(signedXdr, import.meta.env.VITE_NETWORK)
    const horizonResponse = await server.submitTransaction(transaction)

    console.log(horizonResponse)
  }
</script>

<svg class="border border-black w-full h-auto" style:max-width="{w}px" viewBox="0 0 {w} {h}" width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg">
  <!-- background -->
  <!-- 0 size -->
  <!-- 1 color -->
  <rect 
    x="0" 
    y="0"
    width="{w}" 
    height="{h}"
    stroke="white"
    fill="{colors[arr[1]]}"
    stroke-width="{h - (h / 61 * arr[0])}"
  />

  <!-- circle -->
  <!-- 2 size -->
  <!-- 3 cx -->
  <!-- 4 cy -->
  <!-- 5 color -->
  <circle 
    cx="{w / 61 * arr[3]}" 
    cy="{h / 61 * arr[4]}"    
    r="{h / 61 * arr[2] / 2}" 
    fill="{colors[arr[5]]}"
  />

  <!-- rotating line -->
  <!-- 6 rotation -->
  <!-- 7 color -->
  <line 
    x1="{w / 2 / 61 * arr[6]}"
    y1="0"
    x2="{w / 2 - (w / 2 / 61 * arr[6])}"
    y2="{h}"
    stroke="{colors[arr[7]]}" 
    stroke-width="5"
  />

  <!-- border -->
  <!-- 8 size -->
  <!-- 9 color -->
  <rect 
    x="0" 
    y="0"
    width="{w}" 
    height="{h}"
    stroke="{colors[arr[9]]}"
    fill="transparent"
    stroke-width="{h / 61 * arr[8] / 2}"
  />

  <!-- horizontal line -->
  <!-- 10 y1/y2 -->
  <!-- 11 color -->
  <line 
    x1="0" 
    y1="{h / 61 * arr[10]}" 
    x2="{w}" 
    y2="{h / 61 * arr[10]}" 
    stroke="{colors[arr[11]]}" 
    stroke-width="5"
  />
</svg>

<form class="flex flex-col" style:width="{h}px" method="POST" on:submit|preventDefault="{handleSubmit}">
  <input class="border border-blue-500 rounded mt-4 px-2" type="text" bind:value="{input}" placeholder="Type here...">

  <div class="my-4">
    {#each arr as value, i}
      <label class="flex mb-2 last:mb-0">
        <input class="w-full" type="range" min="0" max="61" bind:value="{value}" name="{i}" disabled="{alph.indexOf(input[i]) > -1}">
      </label>
    {/each}
  </div>

  <button class="bg-black text-white p-2 flex items-center justify-center" type="submit">
    Mint <code class="text-xs bg-white text-black ml-2 rounded-full px-2">{code}</code>
  </button>
</form>