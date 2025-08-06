"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// src/lib/prisma.ts
const prisma_1 = require("../generated/prisma");
exports.prisma = new prisma_1.PrismaClient();
