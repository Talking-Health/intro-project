const people = require( "./people" )

/**
 * Check for a valid API url call and handle.
 * @param { URL } parsedUrl
 * @param { object } res
 * @param { object } req
 * @param { object | undefined } receivedObj
 */
async function handleapi( parsedUrl, res, req, receivedObj ) {
  const { pathname } = parsedUrl

  const calls = {
    "/api/people": { GET: people.get, PUT: people.add },
  }

  if( !( pathname in calls ) || !( req.method in calls[ pathname ] ) ) {
    console.error( "404 file not found: ", pathname )
    res.writeHead( 404, { "Content-Type": "text/plain" } )
    res.end( "404 - Not found" )
    return
  }

  const data = await calls[ pathname ][ req.method ]( parsedUrl, req.method, receivedObj )

  res.writeHead( 200, { "Content-Type": "application/json" } )
  res.end( JSON.stringify( data ) )
}

module.exports = {
  handleapi,
}
