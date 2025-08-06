export default {
  formatFileInfo(file) {
    const { name, ext } = file;
    return {
      name,
      ext,
      hash: "", // Отключаем хеш
      mime: file.mime,
      size: file.size,
    };
  },
};
