import { error } from 'itty-router-extras'

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  let response

  try {
    response = await resolve(event)
    .then(async (res) => {
      if (res.ok)
        return res
      else {
        throw res
      }
    })
  } catch (err) {
    try {
      err = await err.json()
    } catch {
      err = await err.text()
    }

    response = error(err?.status ?? 500, err)
  }

  return response
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error: err }) {
  try { err = JSON.parse(err.message) } 
  catch {}
  return err
}