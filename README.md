# Community Web Server: Master
Used in conjunction with https://github.com/IronicPickle/community-server-companion/.
The master server acts as a central hub for data by hosting the web portal, managing the database and querying external APIs.

*Note: Both servers must be hosted simultaneously and must have each other's address configured.*

## Documentation
**Commands**
```
npm run dev - Runs the server in developer mode.
npm run prod - Runs the server in production mode.
npm run stop - Stops the production server.
npm run restart - Restarts the production server.
npm run clean - Cleans the node build directory ' ./build '.
npm run build - Compiles and builds the application.
```

*Note: There are two config files, but you only need to pay attention to backend.json.*

**Backend Config (backend.json)**
```
url: string - The public URL of the web portal.
devUrl: string - The public developer URL of the web portal. [Optional]
port: number - The port the web server will listen on. (8080)

companion:
  url: string - The URL of the companion server. (http://localhost:8081)
  token: string - A unique authorisation token used to authenticate against the companion server. This should match the token configured on the companion server.

discord: 
  clientId: string - A discord client ID generated via the discord developer portal.
  clientSecret: string - A discord client secret generated via the discord developer portal.

dbUrl: string - The URL of the MongoDB server that should be used. (mongodb://localhost/eliteCDB)
sessionSecret: string - A unique secret used by express session.
```
