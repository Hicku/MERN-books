const jwt = require('jsonwebtoken');

// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // Middleware functions to handle authentication
  authMiddleware: function ({ req }) {
    // Allows token to be sent via req.body, req.query, or headers
    let token = req.query.token || req.headers.authorization;

    // If the token is sent via the authorization header, extract the token value from the Bearer scheme
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    // If token can be verified, add the decoded user's data to the request
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    // Return the request object with user data
    return req;
  },

  // Generates a token for authentication
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};