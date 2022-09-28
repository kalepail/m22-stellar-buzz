<script>
import { random } from 'lodash-es'
import { enhance } from '$app/forms';
import colors from '../final-colors.json'

let w = 600
let h = 320
let alph = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
let arr = new Array(12).fill(0).map(() => random(0, 61))
let code = ''

$: {
  code = ''
  arr.forEach((value) => code += alph[value])
}
</script>

<svg class="border border-black w-full h-auto" style:max-width="{w}px" viewBox="0 0 {w} {h}" width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg">
  <!-- background -->
  <!-- 0 size -->
  <!-- 1 color -->
  <rect 
    x="0" 
    y="0"
    width="600" 
    height="320"
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
    width="600" 
    height="320"
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
    x2="600" 
    y2="{h / 61 * arr[10]}" 
    stroke="{colors[arr[11]]}" 
    stroke-width="5"
  />
</svg>

<form class="flex flex-col" style:width="{h}px" method="POST" use:enhance>
  <input type="hidden" bind:value="{arr}" name="arr">
  <input type="hidden" bind:value="{code}" name="code">

  <div class="my-4">
    {#each arr as value, i}
      <label class="flex mb-2 last:mb-0">
        <input class="w-full" type="range" min="0" max="61" bind:value="{value}" name="{i}">
      </label>
    {/each}
  </div>

  <button class="bg-black text-white p-2 flex items-center justify-center" type="submit">Mint <code class="text-xs bg-white text-black ml-2 rounded-full px-2">{code}</code></button>
</form>