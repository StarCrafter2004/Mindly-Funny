import fs from "fs/promises";
import path from "path";

export default {
  init() {
    return {
      async upload(file) {
        const uploadPath = path.join(strapi.dirs.static.public, "uploads");
        const fileName = file.name;
        const filePath = path.join(uploadPath, fileName);

        await fs.writeFile(filePath, file.buffer);
        file.url = `/uploads/${fileName}`;
      },

      async delete(file) {
        const filePath = path.join(strapi.dirs.static.public, file.url);
        await fs.unlink(filePath);
      },
    };
  },
};
