// Imports required modules
const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

// Defines the resolvers
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // Checks if the user has been authenticated/logged in
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });

      if (!user) {
        throw new Error('Something went wrong!');
      }
      const token = signToken(user);
      return { token, user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ $or: [{ username: email }, { email }] });
      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new Error('Wrong password!');
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error('You need to be logged in!');
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new Error('Error saving the book!');
      }
    },
    removeBook: async (parent, { bookId }, context) => {
      // Removes a book from user's savedBooks
      if (context.user) {
        const updateUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updateUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;