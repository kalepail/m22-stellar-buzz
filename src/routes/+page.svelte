<script>
  import colors from '@/final-colors.json'
  import { onMount } from 'svelte';
  import { handleResponse } from '@/helpers/utils'

  export let data

  const w = 600
  const h = 320
  const alph = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  let arr = data.arr
  let code = ''
  let input = ''
  let error = null
  let errorEl
  let loading = false
  let success = false
  let assets = []

  $: {
    code = ''
    success = false
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
  let server

  onMount(async () => {
    albedo = await import('@albedo-link/intent').then((pkg) => pkg.default)
    StellarSdk = await import('stellar-sdk')

    const { Server } = StellarSdk

    server = new Server(import.meta.env.VITE_HORIZON)

    getAssets()
  })

  async function getAssets() {
    return server
    .assets()
    .forIssuer(import.meta.env.VITE_ISSUER_PK)
    .call()
    .then(({ records }) => assets = records)
  }

  async function handleSubmit() {
    try {
      loading = true

      const { Transaction } = StellarSdk

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
          code,
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

      success = true
    } 
    
    catch(err) {
      console.error(err)
      error = typeof err === 'string' ? err : JSON.stringify(err, null, 2)
    } 
    
    finally {
      loading = false
    }
  }

  function closeError(event) {
    if (event.target.contains(errorEl))
      error = null
  }
</script>

{#if error}
  <div class="absolute flex items-center justify-center bg-black/50 top-0 left-0 bottom-0 right-0" bind:this={errorEl} on:click="{(e) => closeError(e)}">
    <pre class="border border-red-500 p-4 px-6 text-white text-xs overflow-y-auto m-2" style:background-color="{'#8a7979'}" style:max-width="{'600px'}">{@html error}</pre>
  </div>
{/if}

<h1 class="text-3xl font-semibold">Build Your Own</h1>
<h2 class="text-xl mb-4">Stellar Meridian 2022 NFT</h2>

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

  <button class="bg-black text-white p-2 flex items-center justify-center disabled:bg-gray-500" type="submit" disabled="{success || loading}">
    {#if loading}
      ...
    {:else}
      Mint 
      <code class="text-xs bg-white text-black mx-2 rounded-full px-2">{code}</code> 
      {#if success}
        <aside>✅</aside>
      {/if}
    {/if}
  </button>
</form>

<h1 class="mt-4 mb-1">Minted NFTs</h1>
<ul class="bg-black p-2 flex flex-wrap w-full">
{#each assets as asset}
  <li class="mr-2" style:max-width="100px">
    <a href="https://stellar.expert/explorer/{(import.meta.env.VITE_NETWORK).toLowerCase()}/asset/{asset.asset_code}-{asset.asset_issuer}">
      <img src="/img/{asset.asset_code}.svg" />
    </a>
  </li>
{/each}
</ul>