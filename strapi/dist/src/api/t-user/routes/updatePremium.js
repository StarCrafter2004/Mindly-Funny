"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: "PUT",
            path: "/t-users/update-premium/:id",
            handler: "t-user.updatePremium",
        },
        {
            method: "POST",
            path: "/free-reports",
            handler: "t-user.updateFreeReportCounter",
        },
        {
            method: "POST",
            path: "/free-tests",
            handler: "t-user.updateFreeTestCounter",
        },
    ],
};
