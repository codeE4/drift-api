let express = require('express')
let bodyParser = require('body-parser')
let cors = require('cors')

let ModelJsonRoutes = require('./routes/model-json-routes')
let AppRoutes = require('./routes/app-routes')
let AppUtils = require('./utils/app-utils')
let Config = require('./config/config')
let stringify = require('json-stringify-safe')
let fileUpload = require('express-fileupload')

let app = express()

app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

app.use(fileUpload(
  {
    limits: { 
      fileSize: 50 * 1024 * 1024 
    }
  }
))

app.use(cors())
app.use('/files', express.static('files'))

let router = express.Router()

// Mongo Connection URL
let mongoUrl = 'mongodb://10.65.147.67/drift'
app.set('mongoUrl', mongoUrl)

let config = new Config()
app.set('config', config)

app.set('port', process.env.PORT || 4000)

ModelJsonRoutes.getRoutes(app, router)
AppRoutes.getRoutes(app, router)
AppUtils.getAppDetails(app)

app.use('/', router)

// Start server
try {
  let server = app.listen(app.get('port'), function() {
    console.log(`Express is running on port ${app.get('port')}`)
  })
}
catch (err) {
  const errorString = typeof(err) === 'object' ? stringify(err, null, '\t') : err
  console.error(`The drift-api server has crashed for an unexpected reason. Error = ${errorString}`)
}
