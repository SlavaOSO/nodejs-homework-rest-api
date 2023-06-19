const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const gravatar = require("gravatar");

const fs = require("fs/promises");

const path = require("path");

const Jimp = require("jimp");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const { SECRET_KEY, PROJECT_URL } = process.env;

const { ctrlWrapper } = require("../utils");

const { HttpError } = require("../helpers");

const { User } = require("../models/user");

const { nanoid } = require("nanoid");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  
  const avatarURL = gravatar.url(email);
    
  const verificationCode = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationCode,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="bllank" href="${PROJECT_URL}/api/auth/verify/${verificationCode}">Click verify email </a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const verify = async (req, res) => {
  const { verificationCode } = req.body;
  const user = await User.findOne(verificationCode);
  if (!user) {
    throw HttpError(404);
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: "",
  });

  res.json({
    message: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404);
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="bllank" href="${PROJECT_URL}/api/auth/verify/${user.verificationCode}">Click verify email </a>`,
  };
  await sendEmail(verifyEmail);

  res.json({
    message: "Verify email sent",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  if (!user.verify) {
    throw HttpError(401, "User is not verified");
  }
    
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "Logout success",
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, filename } = req.file;
  const avatarName = `${_id}_${filename}`;
  const resultUpload = path.join(avatarsDir, avatarName);

  await Jimp.read(tempUpload)
    .then((img) => {
      return img.resize(250, 250).write(tempUpload);
    })

    .catch((err) => {
      console.error(err);
    });
  await fs.rename(tempUpload, resultUpload);

  const avatarURL = path.join("avatars", avatarName);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({ avatarURL });
};

module.exports = {
    register: ctrlWrapper(register),
    verify: ctrlWrapper(verify),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
};