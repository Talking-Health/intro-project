/**
 * Wrapper to test API functions
 * Replicates the logic from public/js/api.js for testing
 */

const rooturl = `${global.window.location.protocol}//${global.window.location.host}/api/`

/**
 * Wrapper for all API GET requests
 * @param { string } api 
 * @returns { Promise< object > }
 */
async function getdata( api ) {
  try {
    const url = rooturl + api

    const response = await fetch( url )

    if( response.ok ) {
      const data = await response.json()
      return data
    } else {
      throw new Error( `Request failed with status: ${response.status}` )
    }
  } catch (error) {
    console.error( 'Error fetching data:', error.message )
  }
}

/**
 * @param { string } api
 * @param { object } data
 * @returns { Promise }
 */
async function putdata( api, data ) {
  const request = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify( data )
  }

  const url = rooturl + api
  await fetch( url, request )
}

module.exports = {
  getdata,
  putdata
};

