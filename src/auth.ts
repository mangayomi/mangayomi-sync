import { Express } from "express";
import { User } from "./model/user.js";
import { UserDTO, validateDto } from "./dto/dto.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export function registerEndpoints(app: Express): void {
  /**
   * @author Schnitzel5
   * @version 1.0
   * This endpoint is the entrypoint to retrieve the JWT token required
   * for all other secured endpoints (upload, download, ...).
   */
  app.post("/login", async (req, res) => {
    const dto = new UserDTO();
    dto.email = req.body.email;
    dto.password = req.body.password;
    const valid = await validateDto(dto);
    if (!valid) {
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }
    try {
      let user = await User.findOne({
        where: {
          email: req.body.email,
        },
      });
      if (user == null) {
        user = await User.create({
          email: dto.email,
          passwordHash: await bcrypt.hash(dto.password, 10),
        });
      } else {
        const pwMatch = await bcrypt.compare(
          dto.password,
          user.passwordHash.toString()
        );
        if (!pwMatch) {
          res.status(400).json({ error: "Invalid password" });
          return;
        }
      }
      dto.password = "";
      const token = jwt.sign(
        {
          uuid: user.id,
          email: user.email,
          mangaSourcesListUrl: process.env.MANGA_SOURCE_LIST_URL ?? null,
          animeSourcesListUrl: process.env.ANIME_SOURCE_LIST_URL ?? null,
        },
        process.env.JWT_SECRET_KEY ?? "mangayomi",
        {
          expiresIn: `${process.env.JWT_EXPIRATION_DAYS ?? "365"}d`,
        }
      );
      res.status(200).json({ token: token });
    } catch (error: any) {
      console.log("Login failed: ", error);
      res.status(500).json({ error: "Server error" });
    }
  });
}
