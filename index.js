const http = require( "http" )
const fs = require( "fs" )
const path = require( "path" )

const api = require( "./lib/api" )

const publicDirectory = path.join( __dirname, "public" )

/**
 * Function to serve static files (HTML, CSS, JS)
 * @param { object } res
 * @param { string } filePath
 * @param { string } contentType
 */
function serveStaticFile( res, filePath, contentType ) {
  fs.readFile( filePath, ( err, content ) => {
    if( err ) {
      console.error( "404 file not found: ", filePath )
      res.writeHead( 404, { "Content-Type": "text/plain" } )
      res.end( "404 - Not found" )
      return
    }

    res.writeHead( 200, { "Content-Type": contentType } )
    res.end( content, "utf-8" )
  } )
}

/**
 * Create and start our server
 */
const server = http.createServer( async ( req, res ) => {
  const headers = req.headers
  // @ts-ignore (tls socket encrypted does exist)
  const protocol = headers[ "x-forwarded-proto" ] || ( req.socket.encrypted ? "https" : "http" )
  const host = headers[ "x-forwarded-host" ] || headers.host
  const baseUrl = `${protocol}://${host}`

  const parsedUrl = new URL( req.url, baseUrl )
  const { pathname } = parsedUrl

  let data = ""
  req.on( "data", ( chunk ) => {
    data += chunk
  } )

  let receivedObj
  req.on( "end", async () => {
    try {
      receivedObj = JSON.parse( data )
    } catch ( error ) {
      receivedObj = undefined
    }

    if( 0 === pathname.indexOf( "/api/" ) ) {
      await api.handleapi( parsedUrl, res, req, receivedObj )
      return
    }

    // If the request is for a static file (HTML, CSS, JS)
    const filePath = path.join(
      publicDirectory,
      "/" === pathname ? "/index.html" : pathname
    )
    const extName = path.extname( filePath )
    let contentType = "text/html"

    const types = {
      ".js": "text/javascript",
      ".css": "text/css",
    }

    if( extName in types ) {
      contentType = types[ extName ]
    }

    serveStaticFile( res, filePath, contentType )
  } )
} )

const port = process.env.PORT || 3000
server.listen( port, () => {
  console.log( `Server is running on port ${port}` )
} )
