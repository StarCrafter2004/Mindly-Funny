"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::test-result.test-result", ({ strapi }) => ({
    async getTestResultWithStats(ctx) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const { id: documentId } = ctx.params;
        const locale = ctx.query.locale || "en";
        const userId = ctx.state.userId;
        // Получаем тест с нужной локалью
        const testResponse = await strapi.documents("api::test.test").findOne({
            documentId,
            populate: {
                questions: {
                    populate: {
                        answers: true,
                    },
                },
                statuses: true,
                statusImages: {
                    populate: {
                        image: true,
                    },
                },
                tresholds: true,
            },
            fields: "type",
            locale,
        });
        // Если не нашли тест — возвращаем 404, но без падения
        if (!testResponse) {
            return ctx.notFound("Test not found for the requested locale.");
        }
        const type = testResponse.type;
        const testResult = await strapi.documents("api::test-result.test-result").findFirst({
            filters: {
                testId: documentId,
                telegram_id: userId,
            },
            populate: {
                answerRecords: true,
            },
        });
        if (!testResult) {
            return ctx.notFound("Test result not found.");
        }
        const questionAnswers = testResponse.questions.map((question, i) => {
            var _a, _b, _c;
            const userRecord = testResult.answerRecords[i];
            const userAnswer = (_a = question.answers) === null || _a === void 0 ? void 0 : _a[userRecord.answerIndex];
            const correctAnswer = (_b = question.answers) === null || _b === void 0 ? void 0 : _b.find((a) => a.isCorrect);
            const base = {
                question: question.text,
                answer: userAnswer,
            };
            if (type === "status-with-threshold") {
                return {
                    ...base,
                    isCorrect: (_c = userAnswer === null || userAnswer === void 0 ? void 0 : userAnswer.isCorrect) !== null && _c !== void 0 ? _c : false,
                    correctAnswer: correctAnswer !== null && correctAnswer !== void 0 ? correctAnswer : null,
                };
            }
            return base;
        });
        let statusIndex = 0;
        if (type === "status-with-threshold") {
            const correctCount = (_b = (_a = testResult.answerRecords) === null || _a === void 0 ? void 0 : _a.filter((r) => {
                var _a;
                const q = testResponse.questions[r.questionIndex];
                const ans = (_a = q.answers) === null || _a === void 0 ? void 0 : _a[r.answerIndex];
                return ans === null || ans === void 0 ? void 0 : ans.isCorrect;
            }).length) !== null && _b !== void 0 ? _b : 0;
            const thresholds = testResponse.tresholds;
            statusIndex =
                (_c = thresholds === null || thresholds === void 0 ? void 0 : thresholds.reduce((acc, th) => {
                    return correctCount >= th.minCorrect ? th.statusIndex : acc;
                }, 0)) !== null && _c !== void 0 ? _c : 0;
        }
        else {
            const freq = {};
            (_d = testResult.answerRecords) === null || _d === void 0 ? void 0 : _d.forEach((r) => {
                var _a;
                const q = testResponse.questions[r.questionIndex];
                const ans = (_a = q.answers) === null || _a === void 0 ? void 0 : _a[r.answerIndex];
                const idx = ans === null || ans === void 0 ? void 0 : ans.statusIndex;
                if (typeof idx === "number") {
                    freq[idx] = (freq[idx] || 0) + 1;
                }
            });
            statusIndex = Object.entries(freq).reduce((maxIdx, [idx, count]) => (count > (freq[maxIdx] || 0) ? Number(idx) : maxIdx), 0);
        }
        const selectedStatus = (_e = testResponse.statuses) === null || _e === void 0 ? void 0 : _e.find((s) => s.statusIndex === statusIndex);
        const selectedImage = (_g = (_f = testResponse.statusImages) === null || _f === void 0 ? void 0 : _f.find((img) => img.index === statusIndex)) !== null && _g !== void 0 ? _g : null;
        return {
            data: {
                status: (_h = selectedStatus === null || selectedStatus === void 0 ? void 0 : selectedStatus.name) !== null && _h !== void 0 ? _h : "",
                description: (_j = selectedStatus === null || selectedStatus === void 0 ? void 0 : selectedStatus.description) !== null && _j !== void 0 ? _j : "",
                type,
                questionAnswers,
                image: (_k = selectedImage === null || selectedImage === void 0 ? void 0 : selectedImage.image) !== null && _k !== void 0 ? _k : null,
            },
        };
    },
}));
