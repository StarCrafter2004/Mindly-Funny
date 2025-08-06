"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
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
