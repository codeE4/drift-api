const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const ObjectId = require('mongodb').ObjectID
const io = require('socket.io-client')
const httpRequest = require('request')
const Model = require('../components/model')
const Error = require('../utils/error')

const error = new Error()

class AppRoutes {
  static getRoutes(app, router) {
    // do
    router.post('/control/do/:id', error.handleErrorsFor((request, response) => {
      let options = request.body
      let serialNumber = request.params.id
      let config = app.get('config')
      let url = `${config.agentUrl}/${serialNumber}/do`

      console.log({
        options: options,
        serialNumber: serialNumber,
        config: config,
        url: url
      })

      httpRequest({
        url: url,
        method: "POST",
        json: true,
        body: options
      }, (error, data, body) => {
        response.json(body)
      });
    }))

    // download report by id
    router.post('/download/report', error.handleErrorsFor((request, response) => {
      let options = request.body
      console.log(options)

      if(options.find.hasOwnProperty("_id")) {

        options.modelName = 'reports'

        let model = new Model(app, options)

        model.list((data) => {
          if(data.totalCount === 0) {
            response.json({
              "error": "Report ${options.find._id} not found"  
            })

          }
          else {
            res.download(data.docs[0].fileName)
            //response.json(data)
          }
        })
      }
      else {
        response.json({
          "error": "_id required"  
        })
      }
    }))


  }
}

module.exports = AppRoutes
