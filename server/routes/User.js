const RouteBase = require("./RouteBase");
const DatabaseManager = require("../lib/database-manager");
const database = new DatabaseManager(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_DATABASE);

const FileRegEx = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

const fs = require("fs");
const { S_IFBLK } = require("constants");

class User extends RouteBase {

    constructor() {
        super();
    }

    async getTokens(req, res) {
        let options = {};
        if (req.params.hasOwnProperty("id")) {
            options.token_id = req.params.id;
        }

        res.status(204).send({
            status: 204,
            message: "No content"
        });
    }

    // TODO: Share file logic between public and private get file logic.
    async getFile(req, res) {
        let fileId = req.params.id;
        let download = req.params.download ? true : false;

        if (FileRegEx.exec(fileId)) {
            database.select({
                columns: "*",
                from: process.env.UPLOAD_TABLE_V1,
                where: { id: fileId }
            })
                .then(async (r) => {
                    if (r.length > 0) {
                        let fileData = r[0];
                        try {
                            let stats = fs.statSync(fileData.upload_path);
                            let total = stats.size;

                            if (req.headers.range) {
                                var range = req.headers.range;
                                var parts = range.replace(/bytes=/, "").split("-");
                                var partialStart = parts[0];
                                var partialEnd = parts[1];

                                var start = parseInt(partialStart, 10);
                                var end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
                                var chunkSize = (end - start) + 1;
                                var readStream = fs.createReadStream(fileData.upload_path, { start: start, end: end });

                                res.status(206).set({
                                    'Connection': 'keep-alive',
                                    "Content-Range": "bytes " + start + "-" + end + "/" + total,
                                    "Accept-Ranges": "bytes",
                                    "Content-Length": chunkSize,
                                    "Content-Type": fileData.upload_mime
                                });
                                readStream.pipe(res);
                            } else {
                                let file = fs.createReadStream(fileData.upload_path)
                                file.on('error', function () {
                                    res.status(404).send({
                                        status: 404,
                                        message: "File does not exist"
                                    });
                                });

                                file.on('open', function () {
                                    let headers = {
                                        'Connection': 'keep-alive',
                                        "Content-Length": stats.size,
                                        "Accept-Ranges": "bytes",
                                        "Content-Type": `${fileData.upload_mime}`,
                                        "Content-Disposition": `${download ? "attachment; " : ""}filename="${fileData.upload_filename}"`
                                    };

                                    res.status(200).set(headers);
                                    file.pipe(res);
                                });
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    else {
                        res.status(404).send({
                            status: 404,
                            message: "File does not exist"
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send({
                        status: 500,
                        message: error.message
                    });
                });
        } else {
            res.status(404).send({
                status: 404,
                message: `No file found with id: ${fileId}`
            });
        }
    }

    async getFiles(req, res) {
        let errors = [];
        let options = {};
        if (req.params.id) {
            options[`${process.env.UPLOAD_TABLE_V1}.id`] = req.params.id;
        }

        let files = await database.select({
            columns: `
                ${process.env.UPLOAD_TABLE_V1}.id, 
                ${process.env.UPLOAD_TABLE_V1}.upload_filename, 
                ${process.env.UPLOAD_TABLE_V1}.upload_date, 
                ${process.env.UPLOAD_TABLE_V1}.upload_mime, 
                ${process.env.UPLOAD_TABLE_V1}.upload_url, 
                COUNT(${process.env.VIEW_TABLE_V1}.view_id) as upload_views`,
            from: process.env.UPLOAD_TABLE_V1,
            where: { upload_user: req.user.id, upload_deleted: false, ...options },
            join: {
                mode: "LEFT",
                from: { id: "id" },
                on: { table: process.env.VIEW_TABLE_V1, id: "view_id" },
                groupBy: `${process.env.UPLOAD_TABLE_V1}.id`
            },
            sort: {
                by: `${process.env.UPLOAD_TABLE_V1}.upload_date`,
                mode: "DESC"
            },
            limit: 10,
            offset: 0
        })
            .catch((error) => {
                console.error(error);
                errors.push(error);
            });

        if (files) {
            res.status(200).send({
                status: 200,
                data: [...files]
            });
        } else if (errors.length > 0) {
            res.status(500).send({
                status: 500,
                message: "Internal server error"
            });
        } else {
            res.status(204).send({
                status: 204,
                message: "No content"
            });
        }
    }

    async deleteFiles(req, res) {
        let query = {
            table: process.env.UPLOAD_TABLE_V1,
            set: { upload_deleted: true },
            where: []
        }

        let files = req.body.files;
        if (Array.isArray(files)) {
            files.forEach((file) => {
                query.where.push({
                    id: file
                });
            });

            let results = await database.update(query)
                .catch((error) => {
                    console.error(error);
                    res.status(500).send({
                        status: 500,
                        message: "Internal server error"
                    });
                });

            if (results && results.affectedRows === files.length) {
                res.status(202).send({
                    status: 202,
                    message: "Accepted"
                });
            } else if (results && results.affectedRows < files.length) {
                res.status(202).send({
                    status: 202,
                    message: "Accepted, with warnings",
                    data: {
                        requested: files.length,
                        deleted: results.affectedRows
                    }
                });
            } else {
                res.status(404).send({
                    status: 404,
                    message: "Not found"
                });
            }
        } else {
            res.status(422).send({
                status: 422,
                message: "Unprocessable entity"
            });
        }

    }

    GetRoutes() {
        return (() => {
            var router = require("express").Router();

            router.get("/file/:id/:download?", this.isAuthenticated, this.getFile);
            router.get("/files/:id?", this.isAuthenticated, this.getFiles);
            router.post("/files/delete", this.isAuthenticated, this.deleteFiles);

            router.get("/tokens/:id?", this.isAuthenticated, this.getTokens);

            return router;
        })();
    }
}

module.exports = User;