import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const usuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (valor) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
        },
        message: "El correo electronico no tiene un formato valido",
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (valor) => {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,18}$/.test(
            valor,
          );
        },
        message:
          "La contrasena debe tener entre 8 y 18 caracteres e incluir mayuscula, minuscula, numero y caracter especial",
      },
    },
    rol: {
      type: String,
      required: true,
      enum: ["admin", "cliente"],
      default: "cliente",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

usuarioSchema.pre("save", async function () {
  console.log('estamos por hashear el password')
  if (!this.isModified("password")) {
    return ;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error(error)
    throw error
  }
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
