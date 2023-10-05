const createJWTPayload = (data) => {
  return {
    username: data.username,
    _id: data._id.toString(),
    email: data.email,
    role: data.role
  }
}

module.exports = {
  createJWTPayload,
}