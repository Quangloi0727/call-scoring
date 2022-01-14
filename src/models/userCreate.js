class User {
  constructor(fullname, username, extension, password, role, createAt, createBy) {
    this.fullname = fullname;
    this.username = username;
    this.password = password;
    this.role = role;
    this.extension = extension;
    this.createAt = createAt;
    this.createBy = createBy
  }
}

module.exports = {
  User: User
}