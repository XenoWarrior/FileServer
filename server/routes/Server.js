const RouteBase = require("./RouteBase");
const Database = require("../lib/database-manager");
const database = new Database(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_DATABASE);

const GitInfo = require('git-repo-info');
const gitInfo = GitInfo();

class Server extends RouteBase {

    constructor() {
        super();
    }

    async getStats(req, res) {
        let errors = [];
        let fileCount = await database.select({
            columns: "COUNT(id) as files",
            from: process.env.UPLOAD_TABLE_V1,
            options: {
                singleItem: true
            }
        })
            .catch((error) => {
                errors.push(error);
            });

        let viewCount = await database.select({
            columns: "COUNT(id) as views",
            from: process.env.VIEW_TABLE_V1,
            options: {
                singleItem: true
            }
        })
            .catch((error) => {
                errors.push(error);
            });

        if (errors.length === 0) {
            res.status(200).send({
                status: 200,
                data: {
                    ...fileCount,
                    ...viewCount,
                    version: gitInfo.sha,
                    branch: gitInfo.branch
                }
            });
        } else {
            res.status(500).send({
                status: 500,
                message: "Internal server error"
            });
        }
    }

    GetRoutes() {
        return (() => {
            var router = require("express").Router();

            router.get("/stats", this.getStats);

            return router;
        })();
    }
}

module.exports = Server;