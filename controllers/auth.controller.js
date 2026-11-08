import * as z from "zod";
import bcrypt from "bcrypt";

export const RegisterUser = async (req, res) => {
  try {
    const userSchema = z.object({
      fullname: z.string().min(1, "Full name is required"),
      username: z.string().min(1, "Username is required"),
      email: z
        .string()
        .email("Email should be a valid email for example: user@example.com"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    });

    const validate = userSchema.parse(req.body);

    const emailExsisting = await prisma.user.findUnique({
      where: {
        email: validate.email,
      },
    });

    if (emailExsisting) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const usernameExisting = await prisma.user.findUnique({
      where: {
        username: validate.username,
      },
    });

    if (usernameExisting) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Enkripsi password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(validate.password, salt);

    const newUser = await prisma.user.create({
      data: {
        fullname: validate.fullname,
        username: validate.username,
        email: validate.email,
        password: hashedPassword,
        bio: validate.bio,
      },
    });

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        id: newUser.id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    if (err instanceof Error && "issues" in err) {
      const errors = err.issues.map((i) => i.message);
      return res.status(400).json({
        message: errors,
      });
    }
    // express
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const LoginUser = (req, res) => {
  res.json({ message: "User logged in successfully" });
};
