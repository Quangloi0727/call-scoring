class User {
  constructor(firstName, lastName, userName, extension, password, role) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.userName = userName;
    this.password = password;
    this.role = role;
    this.extension = extension;
  }
}

module.exports = {
  User: User
}