import mongoose from "mongoose";
import { Password } from "../services/password";

//Interface that describes
//the properties that are required to create a new User

interface UserAttrs {
  email: string;
  password: string;
}

// Interface that describes
//the properties that the User model has

interface UserModel extends mongoose.Model<USerDoc> {
  build(attrs: UserAttrs): USerDoc;
}

//Interface that describes
//the properties that a User Document has

interface USerDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<USerDoc, UserModel>("User", userSchema);

export { User };
