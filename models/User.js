const userCollection = require('../db').db().collection('users')
const validator = require('validator')
const bcrypt = require('bcryptjs')

let User = function(data){
    this.data = data
    this.errors = []
}

User.prototype.cleanUp = function(){
    if(typeof(this.data.username) != 'string') { this.data.username = "" }
    if(typeof(this.data.email) != 'string') { this.data.email = "" }
    if(typeof(this.data.password) != 'string') { this.data.password = "" }

    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password.trim()
    }
}

User.prototype.validate = function(){
    if(this.data.username == "") { this.errors.push("You must provide a username") }
    if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)) { this.errors.push("Username can only contain letters and numbers.") }
    
    if(!validator.isEmail(this.data.email)) { this.errors.push("You must provide a valid email address.") }

    if(this.data.password == "") { this.errors.push("You must provide a password.") }
    if(this.data.password.length > 0 && this.data.password.length < 8) { this.errors.push("Password must be at least 8 character.") }
    if(this.data.password.length > 15) { this.errors.push("Password must be at most 15 character.") }

    if(this.data.username.length > 0 && this.data.username.length < 3) { this.errors.push("Username must be at least 3 character.") }
    if(this.data.username.length >= 15) { this.errors.push("Username must be at most 15 character.") }

    
}

User.prototype.register = function(){
    this.cleanUp()
    this.validate()

    if(!this.errors.length){
        //hash user password
        let salt = bcrypt.genSaltSync(10)
        this.data.password = bcrypt.hashSync(this.data.password , salt)
        
        //insert to database
        userCollection.insertOne(this.data)
    }
}

User.prototype.login = function(){
    this.cleanUp()
    return new Promise((resolve, reject) => {
        userCollection.findOne({username: this.data.username}).then((attemptedUser) => {
            if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)  )
                resolve("Congrats!!")
            else    
                reject("Invalid Username / Password")
        }).catch(() => reject("Please try again later"))
    })
}

module.exports = User