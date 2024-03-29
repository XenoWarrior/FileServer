const RouteBase = require("./RouteBase");

const DatabaseManager = require("../lib/database-manager");
const database = new DatabaseManager(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_DATABASE);

const FileRegEx = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

const path = require('path');
const fs = require('fs');
const mime = require("mime-types");
const { v4: uuid } = require("uuid");
const moment = require("moment");

class FileGet extends RouteBase {

    constructor() {
        super();
    }

    /**
     * Upload File
     * @param {object} req | Incoming request data
     * @param {object} res | Handle responses
     */
    async uploadFile(req, res) {
        if ((req.headers.hasOwnProperty("authorization") || req.headers.hasOwnProperty("Authorization")) && FileRegEx.exec(req.headers.authorization)) {
            if (!req.headers["content-type"].includes("multipart/form-data")) {
                return res.status(400).send({
                    status: 400,
                    message: "Bad request"
                })
            }

            let incomingToken = req.headers.authorization;
            let token = await database.select({
                columns: "token_revoked, token_user",
                from: process.env.TOKEN_TABLE_V1,
                where: { token_value: incomingToken },
                options: {
                    singleItem: true
                }
            })
                .catch((error) => {
                    console.log(error);
                    res.status(500).send({
                        status: 500,
                        message: "Internal server error"
                    });
                });

            if (token && token.hasOwnProperty("token_user") && !token.token_revoked) {
                req.pipe(req.busboy);

                req.busboy.on('field', function (fieldname, file, filename) {
                    res.status(400).send({
                        status: 400,
                        message: `Bad request.`
                    });
                });

                req.busboy.on('file', function (fieldname, file, filename) {
                    try {
                        let requestId = uuid();
                        let fileExt = path.extname(filename.filename);
                        let newFilename = `${requestId}${fileExt}`;
                        let filePath = `${__dirname}/public/${newFilename}`;
                        let uploadUrl = `${(process.env.NODE_ENV === "production" ? "https" : `http`)}://${req.hostname}${(process.env.NODE_ENV === "production" ? "" : `:${process.env.APP_PORT}`)}${process.env.API_V1}/${requestId}`;
                        let fileMime = mime.lookup(filename.filename);

                        let stream = fs.createWriteStream(filePath);
                        file.pipe(stream);

                        stream.on('error', (error) => {
                            console.log(error);
                            res.status(500).send({
                                status: 500,
                                message: `Internal server error`
                            });
                        })

                        stream.on('close', function () {
                            database.insert(process.env.UPLOAD_TABLE_V1, {
                                id: requestId,
                                upload_path: filePath,
                                upload_url: uploadUrl,
                                upload_user: token.token_user,
                                upload_filename: filename.filename,
                                upload_mime: fileMime,
                                upload_date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            })
                                .then((r) => {
                                    res.status(200).send({
                                        status: 200,
                                        data: {
                                            link: uploadUrl
                                        }
                                    });
                                })
                                .catch((error) => {
                                    console.log(error);
                                    res.status(500).send({
                                        status: 500,
                                        message: "Internal server error."
                                    });
                                });

                            database.increment(process.env.TOKEN_TABLE_V1, "token_usage", { token_value: incomingToken })
                                .catch((error) => {
                                    console.error(error);
                                })
                        });
                    } catch (error) {
                        console.log(error);
                        res.status(500).send({
                            status: 500,
                            message: "Internal server error."
                        });
                    }
                });
            } else {
                res.status(401).send({
                    status: 401,
                    message: `Authorization token is invalid.`
                });
            }
        } else {
            res.status(401).send({
                status: 401,
                message: `Please provide an Authorization token.`
            });
        }
    }

    async getFile(req, res) {
        let fileId = req.params.id;

        if (fileId.includes("..") || fileId.includes("...") || fileId.includes("%2F") || fileId.includes("%5C")) {
            res.status(404).send({
                status: 404,
                message: "File not found."
            });
            return;
        }

        if (FileRegEx.exec(fileId)) {
            let fileData = await database.select({
                columns: "*",
                from: process.env.UPLOAD_TABLE_V1,
                where: { id: fileId },
                options: {
                    singleItem: true
                }
            });

            if (fileData) {
                try {
                    let stats;

                    try {
                        stats = fs.statSync(fileData.upload_path);
                    } catch (e) {
                        res.status(404).send({
                            status: 404,
                            message: "File not found."
                        });
                        return;
                    }
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
                                message: "File not found."
                            });
                        });

                        file.on('open', function () {
                            let headers = {
                                'Connection': 'keep-alive',
                                "Content-Length": stats.size,
                                "Accept-Ranges": "bytes",
                                "Content-Type": `${fileData.upload_mime}`,
                                "Content-Disposition": `filename="${fileData.upload_filename}"`
                            };

                            res.status(200).set(headers);
                            file.pipe(res);
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                res.status(404).send({
                    status: 404,
                    message: "File not found."
                });
            }
        } else {
            res.status(404).send({
                status: 404,
                message: `File not found.`
            });
        }

        // Log the interaction after the request
        database.insert(process.env.VIEW_TABLE_V1, {
            view_data: JSON.stringify({
                method: req.method,
                originalUrl: req.originalUrl,
                baseUrl: req.baseUrl,
                headers: req.headers,
                rawHeaders: req.rawHeaders,
                httpVersion: req.httpVersion,
                hostname: req.hostname,
                params: req.params,
                ip: req.ip,
                ips: req.ips,
                body: req.body,
                fresh: req.fresh,
                destroyed: req.destroyed,
                complete: req.complete,
                secure: req.secure,
                xhr: req.xhr
            }),
            view_date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            view_id: fileId
        })
            .catch((error) => { console.error(error); });
    }

    GetRoutes() {
        return (() => {
            var router = require("express").Router();

            router.get("/:id", this.getFile);
            router.post("/", this.uploadFile);

            return router;
        })();
    }
}

module.exports = FileGet;