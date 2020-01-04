const postsCollection = require('../db').db().collection("posts");
const ObjectID = require('mongodb').ObjectID;
const User = require("./User");

let Post = function(data, userid) {
    this.data = data
    this.userid = userid
    this.errors = []
}

Post.prototype.cleanUp = function() {
    if (typeof(this.data.title) != "string") {this.data.title = ""}
    if (typeof(this.data.body) != "string") {this.data.body = ""}

    // Cleanse submitted form
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        createdDate: new Date(),
        author: ObjectID(this.userid)
    }
}

Post.prototype.validate = function() {
    if (this.data.title == "") {this.errors.push("What's the title of your journal?")}
    if (this.data.body == "") {this.errors.push("There's nothing to read in your journal!")}
}

Post.prototype.create = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()

        if (!this.errors.length) {
            // Save post into database
            postsCollection.insertOne(this.data).then(() => {
                resolve()
            }).catch(() => {
                this.errors.push("Ooops! We weren't able to save your journal log, we hope you had a copy of it!")
                reject(this.errors)
            })
        } else {
            reject(this.errors)
        }
    })
}

Post.findSingleById = function(id) {
    return new Promise(async function(resolve, reject) {
      if (typeof(id) != "string" || !ObjectID.isValid(id)) {
        reject()
        return
      }
      
      let posts = await postsCollection.aggregate([
        {$match: {_id: new ObjectID(id)}},
        {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
        {$project: {
          title: 1,
          body: 1,
          createdDate: 1,
          author: {$arrayElemAt: ["$authorDocument", 0]}
        }}
      ]).toArray()
      console.log("1", posts)
      
      // clean up author property in each post object
      posts = posts.map(function(post) {
        posts.author = {
          username: post.author.username,
          avatar: new User(post.author, true).avatar
        }  
        console.log("2", post)
        return post
      })
  
      if (posts.length) {
        console.log("3", posts[0])
        resolve(posts[0])
      } else {
        reject()
      }
    })
  }

module.exports = Post;