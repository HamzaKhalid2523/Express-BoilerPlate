import { NextFunction } from "express";
import mongoosePaginate from "mongoose-paginate";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const User = new Schema({
  created_by: { type: String },
  created_by_role: { type: String },
  username: { type: String, unique: true },
  password: { type: String },
  status: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false }
},
{
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  },
});

User.plugin(mongoosePaginate);

User.index({ username: "text" });
User.index({ "$**": "text" });

User.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

User.pre('save', async function(this: any, next: NextFunction) {
  if (this.isModified('password')) {
    const password = this.password;

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
  
    this.password = hash;
  }
  this.username = this.username.toLowerCase();

  next();
});

module.exports = mongoose.model("User", User);

