const RouteBase = require("./RouteBase");
const DatabaseManager = require("../lib/database-manager");
const database = new DatabaseManager(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_DATABASE);

const RegEx = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

const path = require('path');
const fs = require('fs-extra');
const mime = require("mime-types");
const { v4: uuid } = require("uuid");

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
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            try {
                console.log("Uploading:", filename);

                let requestId = uuid();

                let fileExt = path.extname(filename);
                let newFilename = `${requestId}${fileExt}`;
                let filePath = `${__dirname}/public/${newFilename}`;
                let fileMime = mime.lookup(filename);

                let stream = fs.createWriteStream(filePath);
                file.pipe(stream);

                stream.on('error', (error) => {
                    console.log(error);
                    res.status(500)
                        .send({
                            status: 500,
                            message: `An error occured: ${error.message}`
                        });
                })

                stream.on('close', function () {
                    console.log("Uploaded: ", filename);

                    database.insert(process.env.UPLOAD_TABLE_V1, {
                        upload_id: requestId,
                        upload_path: filePath,
                        upload_user: "todo",
                        upload_filename: filename,
                        upload_mime: fileMime
                    })
                        .then((r) => {
                            res.set({ "Content-Type": "application/json" }).status(200)
                                .send({
                                    status: 200,
                                    data: {
                                        link: `${(process.env.NODE_ENV === "production" ? "https" : `http`)}://${req.hostname}${(process.env.NODE_ENV === "production" ? "" : `:${process.env.APP_PORT}`)}${process.env.API_V1}/${requestId}`
                                    }
                                });
                        })
                        .catch((error) => {
                            res.status(500)
                                .send({
                                    status: 500,
                                    message: error.message
                                });
                            console.error("Upload successful, but the file was not recorded in the DB.", error);
                        });
                });
            } catch (error) {
                console.log(error);
                res.status(500)
                    .send({
                        status: 500,
                        message: error.message
                    });
            }
        });
    }

    async getFile(req, res) {
        let fileId = req.params.uuid;

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
            view_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            view_id: fileId
        })
            .catch((error) => { console.error(error); });

        if (RegEx.exec(fileId)) {
            database.select("*", process.env.UPLOAD_TABLE_V1, { upload_id: fileId })
                .then((r) => {
                    if (r.length > 0) {
                        let fileData = r[0];
                        let file = fs.createReadStream(fileData.upload_path);
                        let headers = {
                            "Content-Type": `${fileData.upload_mime}`,
                            "Content-Disposition": `filename="${fileData.upload_filename}"`
                        };

                        res.status(200).set(headers);
                        file.pipe(res);
                    } else {
                        res.status(404).send({
                            status: 404,
                            message: "File does not exist"
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500)
                        .send({
                            status: 500,
                            message: error.message
                        });
                });
        } else {
            res.set({ "Content-Type": "application/json" }).status(404)
                .send({
                    status: 404,
                    message: `No file found with id: ${fileId}`
                });
        }
    }


    GetRoutes() {
        return (() => {
            var router = require("express").Router();

            router.get("/:uuid", this.getFile);
            router.post("/", this.uploadFile);

            return router;
        })();
    }
}

module.exports = FileGet;