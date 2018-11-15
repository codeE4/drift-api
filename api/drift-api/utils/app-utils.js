const fs = require('fs')
let MongoClient = require('mongodb').MongoClient
let assert = require('assert')
let ObjectId = require('mongodb').ObjectID
let io = require('socket.io-client')
let httpRequest = require('request')
let Model = require('../components/model')

class AppUtils {
  static getAppDetails(app) {

    // Connection URL
    let mongoUrl = app.get('mongoUrl')

    // Get views
    let modelOptions = {
      modelName: 'appDetails',
      find: {},
      limit: 9999
    }

    let model = new Model(app, modelOptions)

    model.list((data) => {
      app.set('appDetails', data.docs)
    })
  }
}

module.exports = AppUtils
