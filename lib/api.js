const people = require( "./people" )
const landlords = require( "./landlords" )
const buildings = require( "./buildings" )

/**
 * Check for a valid API url call and handle.
 * @param { URL } parsedurl
 * @param { object } res
 * @param { object } req
 * @param { object } receivedobj
 */
async function handleapi( parsedurl, res, req, receivedobj ) {
  const pathname = parsedurl.pathname

  const calls = {
    "/api/people": { GET: people.get, PUT: people.add, DELETE: people.deletePerson },
    "/api/people/schedule": { PUT: people.updateSchedule },
    "/api/landlords": { GET: landlords.get, PUT: landlords.add, DELETE: landlords.deleteLandlord },
    "/api/landlords/building": { PUT: landlords.addBuilding },
    "/api/buildings": { GET: buildings.get, PUT: buildings.add, DELETE: buildings.deleteBuilding },
    "/api/buildings/room": { PUT: buildings.addRoom },
    "/api/buildings/room/update": { PUT: buildings.updateRoom },
    "/api/buildings/room/delete": { PUT: buildings.removeRoom },
  }

  if( !( pathname in calls ) || !( req.method in calls[pathname] ) ) {
    console.error( "404 file not found: ", pathname )
    res.writeHead( 404, { "Content-Type": "text/plain" } )
    res.end( "404 - Not found" )
    return
  }

  try {
    let data
    if( "DELETE" === req.method ) {
      // For DELETE requests, pass only the ID from the request body
      data = await calls[pathname][req.method]( receivedobj.id )
    } else {
      // For other methods, use the existing pattern
      data = await calls[pathname][req.method](
        parsedurl,
        req.method,
        receivedobj
      )
    }

    res.writeHead( 200, { "Content-Type": "application/json" } )
    res.end( JSON.stringify( data ) )
  } catch ( error ) {
    console.error( "API Error:", error.message )
    res.writeHead( 400, { "Content-Type": "application/json" } )
    res.end( JSON.stringify( { error: error.message } ) )
  }
}

module.exports = {
  handleapi,
}
