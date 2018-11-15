const fs = require('fs')
let ObjectId = require('mongodb').ObjectID
let MongoClient = require('mongodb').MongoClient

class Model {
  constructor(app, options) {
    this.options = options
    this.app = app
  }

  handleResponse(db, callback, error, data) {
    if (error) {
      callback({
        error
      })
    }
    else {
      callback(data)
    }
    db.close()
  }

  list(callback) {
    // Connection URL
    let mongoUrl = this.app.get('mongoUrl')

    let modelName = this.options.modelName
    let options = this.options

    // Use connect method to connect to the server
    MongoClient.connect(mongoUrl, (connectError, db) => {

      try {
        // Get the documents collection
        var collection = db.collection(modelName)

        let idFind = {}
        if(options.hasOwnProperty('find') && options.find.hasOwnProperty('_id')) {

          let objectId = new ObjectId(options.find._id)
          idFind = {
            _id: objectId
          }
        }

        let regexFind = {}
        // Enable regex if requested
        if(options.hasOwnProperty('find')) {
          Object.keys(options.find).forEach((key) => {
            if(key !== '_id') {
              regexFind[key] = { 
                $regex: options.find[key],
                $options: 'i' 
              }
            }
          })
        }

        let findOptions = Object.assign({}, idFind, regexFind)

        let pageIndex = 0
        if(options.hasOwnProperty('page')) {
          pageIndex = parseInt(options.page - 1)
        }

        let sortOptions = {}
        if(options.hasOwnProperty('sort')) {
          sortOptions = options.sort
        }

        console.log({
          findOptions: findOptions,
          sortOptions: sortOptions
        })

        let data = collection.find(findOptions, {sort: sortOptions})

        data.count((countError, count) => {
          let limit = 1000

          if(options.hasOwnProperty('limit')) {
            limit = options.limit
          }

          let numberOfPages = Math.ceil(count / limit)
          let skipCount = limit * pageIndex

          let returnData = {
            page: options.page,
            totalCount: count,
            skipCount: skipCount,
            numberOfPages: numberOfPages,
            itemsPerPage: limit
          }

          data.skip(skipCount).limit(limit).toArray((err, result) => {
            returnData.docs = result
            this.handleResponse(db, callback, err, returnData)
          })
        })
      }
      catch(error) {
        console.log({
          error: error,
          find: options.find
        })

        callback({
          error: error.message
        })

        if(db != null) {
          db.close()
        }
      }
    })
  }

  findBy(callback) {
    // Connection URL
    let mongoUrl = this.app.get('mongoUrl')

    let modelName = this.options.modelName
    let options = this.options

    // Use connect method to connect to the server
    MongoClient.connect(mongoUrl, (connectError, db) => {

      try {
        // Get the documents collection
        var collection = db.collection(modelName)

        let findOptions = {}
        if(options.hasOwnProperty('find') && options.find.hasOwnProperty('by')) {
          findOptions[options.find.by] = options.find.value
        }

        collection.find(findOptions, (err, data) => {
          data.toArray((err, result) => {
            // TODO: Handle err
            let returnData = {
              docs: result
            }
            this.handleResponse(db, callback, err, returnData)
          })
        })
      }
      catch(error) {
        console.log({
          error: error,
          find: options.find
        })

        callback({
          error: error.message
        })

        if(db != null) {
          db.close()
        }
      }
    })
  }

  create(callback) {
    // Connection URL
    let mongoUrl = this.app.get('mongoUrl')

    // Use connect method to connect to the server
    MongoClient.connect(mongoUrl, (connectError, db) => {

      try {
        // Enrich each document with the allFields searchable field
        // TODO: move this code into it's own method because it's also being used in update
        this.options.data.forEach((document) => {
          let allFields = []
          Object.keys(document).forEach((key) => {
            let value = document[key]
            if(typeof value === 'string') {
              allFields.push(document[key])
            }
          })

          document.allFields = allFields
        })
        

        // Get the documents collection
        let collection = db.collection(this.options.modelName)

        // Insert data
        collection.insertMany(this.options.data, (err, data) => {
          this.handleResponse(db, callback, err, data)
        })
      }
      catch(error) {
        console.log({
          error: error
        })

        callback({
          error: error.message
        })

        if(db != null) {
          db.close()
        }
      }
    })
  }

  update(callback) {
    let modelName = this.options.modelName
    let options = this.options

    // Connection URL
    let mongoUrl = this.app.get('mongoUrl')

    // Use connect method to connect to the server
    MongoClient.connect(mongoUrl, (connectError, db) => {
      try {
        // Enrich the document with the allFields searchable field
        // TODO: move this code into it's own method because it's also being used in create
        let document = options.data
        let allFields = []
        Object.keys(document).forEach((key) => {
          let value = document[key]
          if(typeof value === 'string') {
            allFields.push(document[key])
          }
        })

        document.allFields = allFields

        // Get the documents collection
        var collection = db.collection(modelName)

        if(options.hasOwnProperty('find') && options.find.hasOwnProperty('_id')) {
          let objectId = new ObjectId(options.find._id)
          options.find = {
            '$or': [
              // Allow for both string and object forms
              { _id: objectId },
              { _id: options.find._id }
            ]
          }

          // Delete _id in the data (othewise this will crash)
          if(options.data.hasOwnProperty('_id')) {
            delete options.data._id
          }
        }
        collection.update(options.find, options.data, (err, data) => {
          this.handleResponse(db, callback, err, data)
        })
      }
      catch(error) {
        console.log({
          error: error,
          find: options.find
        })

        callback({
          error: error.message
        })

        if(db != null) {
          db.close()
        }
      }
    })
  }

  delete(callback) {
    let modelName = this.options.modelName
    let options = this.options

    // Connection URL
    let mongoUrl = this.app.get('mongoUrl')

    // Use connect method to connect to the server
    MongoClient.connect(mongoUrl, (connectError, db) => {

      try {
        // Get the documents collection
        var collection = db.collection(modelName)

        if(options.hasOwnProperty('find') && options.find.hasOwnProperty('_id')) {
          let objectId = new ObjectId(options.find._id)
          options.find = {
            _id: objectId
          }
        }

        collection.deleteOne(options.find, (err, data) => {
          this.handleResponse(db, callback, err, data)
        })
      }
      catch(error) {
        console.log({
          error: error,
          find: options.find
        })

        callback({
          error: error.message
        })

        if(db != null) {
          db.close()
        }
      }
    })
  }
}

module.exports = Model
