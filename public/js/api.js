const rootUrl = `${window.location.protocol}//${window.location.host}/api/`

/**
 * Wrapper for all API GET requests
 * @param { string } api
 * @returns { Promise< object | undefined > }
 */
export async function getdata( api ) {
  try {
    const url = rootUrl + api

    const response = await fetch( url )

    if( response.ok ) {
      const data = await response.json()
      return data
    }

    throw new Error( `Request failed with status: ${response.status}` )
  } catch ( error ) {
    console.error( "Error fetching data:", error.message )
    return undefined
  }
}

/**
 * TODO check result
 * @param { string } api
 * @param { object } data
 * @returns { Promise< Response > }
 */
export async function putdata( api, data ) {
  const request = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( data ),
  }

  const url = rootUrl + api
  return fetch( url, request )
}
