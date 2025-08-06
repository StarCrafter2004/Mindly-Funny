"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
exports.default = {
    init() {
        return {
            async upload(file) {
                const uploadPath = path_1.default.join(strapi.dirs.static.public, "uploads");
                const fileName = file.name;
                const filePath = path_1.default.join(uploadPath, fileName);
                await promises_1.default.writeFile(filePath, file.buffer);
                file.url = `/uploads/${fileName}`;
            },
            async delete(file) {
                const filePath = path_1.default.join(strapi.dirs.static.public, file.url);
                await promises_1.default.unlink(filePath);
            },
        };
    },
};
