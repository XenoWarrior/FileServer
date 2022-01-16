// Base Class
const RouteBase = require("./RouteBase");

// Database
const DatabaseManager = require("../lib/database-manager");
const database = new DatabaseManager(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_DATABASE);

// BCrypt
const bcrypt = require('bcrypt');

// UUID
const { v4: uuid } = require("uuid");

class Authentication extends RouteBase {
    constructor() {
        super();
    }

    async validateInputs(request) {
        let validateEmail = /.+@.+\..+/.test(request.email);
        let validateUsername = /^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*$/.test(request.username);

        let invalid = [];
        if (!validateEmail) {
            invalid.push("user_email");
        }
        if (!validateUsername) {
            invalid.push("user_name");
        }

        return {
            valid: (invalid.length === 0),
            data: invalid
        };
    }

    async checkDuplicates(request) {
        return new Promise(async (resolve, reject) => {
            let errors = [];
            let check = await database.select({
                columns: "user_name, user_email",
                from: process.env.USER_TABLE_V1,
                where: [
                    { user_name: request.username },
                    { user_email: request.email }
                ],
                options: {
                    singleItem: true
                }
            })
                .catch((error) => {
                    reject(error);
                    errors.push(error);
                });

            if (errors.length > 0) {
                reject(errors);
            } else {
                let conflicts = [];
                if (check.hasOwnProperty("user_name") && check.user_name === request.username) {
                    conflicts.push("user_name");
                }
                if (check.hasOwnProperty("user_email") && check.user_email === request.email) {
                    conflicts.push("user_email");
                }

                resolve({
                    valid: (conflicts.length === 0),
                    data: conflicts
                });
            }
        });
    }

    async check(req, res) {
        res.status(200).send({
            status: 200,
            message: "Success",
            data: req.user
        });
    }

    async login(req, res) {
        if (req.user) {
            let user = {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email
            };

            req.login(user, (error) => {
                if (error) {
                    res.status(500).send({
                        status: 500,
                        message: "Internal server error"
                    });
                } else {
                    res.status(202).send({
                        status: 202,
                        message: "Login successful",
                        data: {
                            id: req.user.id,
                            username: req.user.username,
                            email: req.user.email
                        }
                    })
                }
            });
        } else {
            res.status(401).send({
                status: 401,
                message: "Invalid credentials"
            })
        }
    }

    async logout(req, res) {
        req.logout();

        res.clearCookie('connect.sid', { path: '/' }).status(200)
            .send({
                status: 200,
                message: `Logged out`
            });
    }

    async register(req, res) {
        let errors = [];
        let inputCheck = await this.validateInputs(req.body);
        if (!inputCheck.valid) {
            res.status(422).send({
                status: 422,
                message: "Invalid data provided",
                data: inputCheck.data
            });
            return;
        }

        let duplicateCheck = await this.checkDuplicates(req.body)
            .catch((error) => {
                errors.push(error);
                res.status(500).send({
                    status: 500,
                    message: "Internal server error"
                });
            });

        if (errors.length > 0) {
            return;
        }

        if (!duplicateCheck.valid) {
            res.status(409).send({
                status: 409,
                message: "An account with that username or email already exists",
                data: duplicateCheck.data
            });
            return;
        }

        bcrypt.hash(req.body.password, 10)
            .then(async (hash) => {
                await database.insert(process.env.USER_TABLE_V1, {
                    id: uuid(),
                    user_name: req.body.username,
                    user_pass: hash,
                    user_email: req.body.email,
                    user_permission: JSON.stringify({}),
                    user_creation: new Date().toISOString().slice(0, 19).replace('T', ' ')
                })
                    .then((r) => {
                        if (r.affectedRows === 1) {
                            res.status(201).send({
                                status: 201,
                                message: "Account created"
                            })
                        } else {
                            res.status(409).send({
                                status: 409,
                                message: JSON.stringify(r)
                            })
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send({
                            status: 500,
                            message: "Internal server error"
                        });
                    });
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send({
                    status: 500,
                    message: "Internal server error"
                });
            });
    }

    GetRoutes() {
        return (() => {
            var router = require("express").Router();

            router.get("/check", this.isAuthenticated, this.check);
            router.post("/login", this.passport.authenticate('local'), this.login);

            router.post("/register", (req, res) => { this.register(req, res); });
            router.get("/logout", this.isAuthenticated, (req, res) => { this.logout(req, res); });

            return router;
        })();
    }
}

module.exports = Authentication;