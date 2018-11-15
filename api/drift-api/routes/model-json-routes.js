const fs = require('fs')
let MongoClient = require('mongodb').MongoClient
let assert = require('assert')
let ObjectId = require('mongodb').ObjectID
let Model = require('../components/model')

class ModelJsonRoutes {
  static getRoutes(app, router) {
    //  list
    router.post('/list/:modelName', (request, response) => {
      let modelName = request.params.modelName
      let options = request.body

      options.modelName = modelName

      let model = new Model(app, options)

      model.list((data) => {
        response.json(data)
      })
    })

    //  create
    router.post('/create/:modelName', (request, response) => {
      let modelName = request.params.modelName
      let options = request.body

      options.modelName = modelName

      let model = new Model(app, options)

      model.create((data) => {
        response.json(data)
      })

    })

    //  update
    router.post('/update/:modelName', (request, response) => {
      let modelName = request.params.modelName
      let options = request.body

      options.modelName = modelName

      let model = new Model(app, options)

      model.update((data) => {
        response.json(data)
      })
    })

    //  delete
    router.post('/delete/:modelName', (request, response) => {
      let modelName = request.params.modelName
      let options = request.body

      options.modelName = modelName

      let model = new Model(app, options)

      model.delete((data) => {
        response.json(data)
      })
    })
  }

}

module.exports = ModelJsonRoutes
