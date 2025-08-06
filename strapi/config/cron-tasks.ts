export default {
  myJob: {
    task: async ({ strapi }) => {
      // ваша логика
    },
    options: {
      rule: "0 0 1 * * 1",
    },
  },

  deleteTempImages: {
    task: async ({ strapi }) => {
      const cutoff = new Date(Date.now() - 2 * 60 * 1000);

      const folders = await strapi.entityService.findMany("plugin::upload.folder", {
        filters: { name: "API Uploads" },
        fields: ["id"],
      });
      if (folders.length === 0) return;
      const folderId = folders[0].id;

      const files = await strapi.entityService.findMany("plugin::upload.file", {
        filters: {
          folder: folderId,
          createdAt: { $lt: cutoff },
        },
        fields: ["id", "name"],
      });

      for (const file of files) {
        await strapi.plugin("upload").service("upload").remove(file);
        strapi.log.info(`Auto‑deleted temp image: ${file.name}`);
      }
    },
    options: {
      rule: "*/1 * * * *", // запуск каждую минуту
    },
  },
};
