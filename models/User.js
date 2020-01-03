const validator = require("validator");

let User = function(data) {
    this.data = data
    this.errors = []
}

User.prototype.cleanUp = function() {
    if (typeof(this.data.username) != "string") {
        this.data.username = ""
    }
    if (typeof(this.data.email) != "string") {
        this.data.email = ""
    }
    if (typeof(this.data.password) != "string") {
        this.data.password = ""
    }

    // Cleanse data property
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.validate = function() {
    if (this.data.username.length > 0 && this.data.username.length < 3) {
        this.errors.push("Your username needs to be at least 3 characters")
    }
    if (this.data.username != "" && !validator.isAlphaNumeric(this.data.username)) {
        this.errors.push("Username can only contain letters and numbers")
    }
    if (!validator.isEmail(this.data.email)) {
        this.errors.push("You must provide a valid email address.")
    }
    if (this.data.password.length > 0 && this.data.password.length < 8) {
        this.errors.push("Your password needs to be at least 8 characters")
    }
}

User.prototype.register = function() {
    // Validate user data
    this.cleanUp()
    this.validate()

    // If no validation errors save to db
}

module.exports = User;