import User , {type IUser} from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import redisClient from "../config/redis.js";

/**
 
 * @param {Object} userBody
 * @returns {Promise<IUser>}
 */

interface Body{
  name?: string;
  email?: string;
  password?: string;
  isEmailVerified?: boolean;
}
const createUser = async (userBody : Body) : Promise<IUser> => {
  if (await User.findOne({ email: userBody.email })) {
    throw new ApiError(400, "Email already taken");
  }
  return User.create(userBody);
};

/**
 
 * @param {string} id
 * @returns {Promise<User>}
 */
const getUserById = async (id : string) => {
  return User.findById(id);
};

/**
 
 * @param {string} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId : string, updateBody : Body ) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (updateBody.email && (await User.findOne({ email: updateBody.email }))) {
    throw new ApiError(400, "Email already taken");
  }

  Object.assign(user, updateBody);

  // If email changed, reset verification
  if (updateBody.email) {
    user.isEmailVerified = false;
  }

  await user.save();


  await redisClient.del(`user_profile:${userId}`);

  return user;
};

export default {
  createUser,
  getUserById,
  updateUserById,
};
