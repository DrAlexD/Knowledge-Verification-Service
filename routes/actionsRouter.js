const path = require('path');
const express = require('express');
const mysql = require('mysql');

const actionsRouter = express.Router();

const con = mysql.createConnection({
    user: "root",
    password: "1234",
    database: "knowledge_verification_service"
});

con.connect(err => err ? console.error(err) : console.log("ActionsRouter connected to MySQL database!"));

actionsRouter.get('/', (req, res) => {
    res.redirect('/login');
});

actionsRouter.get('/session/info.json', (req, res) => {
    res.status(200).json(req.session.user);
});

actionsRouter.get('/logout', (req, res) => {
    if (typeof req.session.user != 'undefined') {
        console.log(`Success log out: ${req.session.user.type}`);
        req.session.destroy();
    }
    res.end();
});

actionsRouter.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/actions/log_in_page.html'));
});

actionsRouter.post('/login', (req, res) => {
    if (req.body.username !== "" && req.body.password !== "") {
        if (req.body.username === "admin") {
            if (req.body.password === "admin") {
                req.session.user = {
                    type: "admin",
                    id: "0"
                };
                console.log("Success log in: admin");
                res.end();
            } else {
                res.status(400).json("Неправильный пароль для пользователя: admin");
            }
        } else {
            con.query(`SELECT * FROM student WHERE Login='${req.body.username}' AND Password='${req.body.password}'`,
                function (err, result) {
                    if (err)
                        console.error(err);
                    else {
                        if (typeof result[0] != 'undefined') {
                            req.session.user = {
                                type: "student",
                                id: result[0].Student_id
                            };
                            console.log(`Success log in: ${result[0].Login}`);
                            res.end();
                        } else {
                            con.query(`SELECT * FROM professor WHERE Login='${req.body.username}' AND Password='${req.body.password}'`,
                                function (err2, result2) {
                                    if (err2)
                                        console.error(err2);
                                    else {
                                        if (typeof result2[0] != 'undefined') {
                                            req.session.user = {
                                                type: "professor",
                                                id: result2[0].Professor_id
                                            };
                                            console.log(`Success log in: ${result2[0].Login}`);
                                            res.end();
                                        } else {
                                            res.status(400).json("Неправильный логин или пароль");
                                        }
                                    }
                                }
                            );
                        }
                    }
                }
            );
        }
    } else {
        res.status(400).json("Не введены логин или пароль");
    }
});

actionsRouter.get('/actions', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/actions/actions_page.html'));
});

actionsRouter.get('/add/student', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/actions/add_student_page.html'));
});

actionsRouter.post('/add/student', (req, res) => {
    if (req.body.firstName !== "" && req.body.secondName !== "" && req.body.studentGroup !== "") {
        let log = `${req.body.firstName} ${req.body.secondName}`.replace(" ", "").toLowerCase();
        log += (req.body.studentGroup).slice(-2);
        let pas = `123456`;
        if (log !== "admin") {
            con.query("INSERT INTO student (`First_name`, `Second_name`, `Student_group`, `Login`, `Password`) " + `VALUES ('${req.body.firstName}', '${req.body.secondName}', '${req.body.studentGroup}', '${log}', '${pas}')`,
                function (err1) {
                    if (err1) {
                        console.error(err1);
                        res.status(400).json("Копия имеющегося студента");
                    } else {
                        con.query(`SELECT * FROM student WHERE First_name='${req.body.firstName}' AND Second_name='${req.body.secondName}'`,
                            function (err2, result) {
                                if (err2)
                                    console.error(err2);
                                else {
                                    res.status(200).json(result[0]);
                                }
                            }
                        );
                    }
                }
            );
        } else {
            res.status(400).json("Недопустимый логин: admin");
        }
    } else {
        res.status(400).json("Не введены имя, фамилия или группа");
    }
});

actionsRouter.get('/students', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/actions/students_page.html'));
});

actionsRouter.get('/students/all.json', (req, res) => {
    con.query(`SELECT * FROM student`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.status(200).json(result);
                } else {
                    res.status(404).json(`Не найдены студенты`);
                }
            }
        }
    );
});

actionsRouter.post('/students', (req, res) => {
    if (req.body.firstName !== "") {
        if (req.body.secondName !== "") {
            if (req.body.studentGroup !== "") {
                con.query(`SELECT * FROM student WHERE First_name='${req.body.firstName}' AND Second_name='${req.body.secondName}' AND Student_group='${req.body.studentGroup}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены студенты`);
                            }
                        }
                    }
                );
            } else {
                con.query(`SELECT * FROM student WHERE First_name='${req.body.firstName}' AND Second_name='${req.body.secondName}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены студенты`);
                            }
                        }
                    }
                );
            }
        } else {
            if (req.body.studentGroup !== "") {
                con.query(`SELECT * FROM student WHERE First_name='${req.body.firstName}' AND Student_group='${req.body.studentGroup}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены студенты`);
                            }
                        }
                    }
                );
            } else {
                con.query(`SELECT * FROM student WHERE First_name='${req.body.firstName}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены студенты`);
                            }
                        }
                    }
                );
            }
        }
    } else {
        if (req.body.secondName !== "") {
            if (req.body.studentGroup !== "") {
                con.query(`SELECT * FROM student WHERE Second_name='${req.body.secondName}' AND Student_group='${req.body.studentGroup}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены студенты`);
                            }
                        }
                    }
                );
            } else {
                con.query(`SELECT * FROM student WHERE Second_name='${req.body.secondName}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены студенты`);
                            }
                        }
                    }
                );
            }
        } else {
            if (req.body.studentGroup !== "") {
                con.query(`SELECT * FROM student WHERE Student_group='${req.body.studentGroup}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены студенты`);
                            }
                        }
                    }
                );
            } else {
                res.status(400).json("Не введены имя, фамилия или группа");
            }
        }
    }
});

actionsRouter.get('/add/professor', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/actions/add_professor_page.html'));
});

actionsRouter.post('/add/professor', (req, res) => {
    if (req.body.firstName !== "" && req.body.secondName !== "") {
        let log = `${req.body.firstName} ${req.body.secondName}`.replace(" ", "").toLowerCase();
        let pas = `123456`;
        if (log !== "admin") {
            con.query("INSERT INTO professor (`First_name`, `Second_name`, `Login`, `Password`) " + `VALUES ('${req.body.firstName}', '${req.body.secondName}', '${log}', '${pas}')`,
                function (err1) {
                    if (err1) {
                        console.error(err1);
                        res.status(400).json("Копия имеющегося преподавателя");
                    } else {
                        con.query(`SELECT * FROM professor WHERE First_name='${req.body.firstName}' AND Second_name='${req.body.secondName}'`,
                            function (err2, result) {
                                if (err2)
                                    console.error(err2);
                                else {
                                    res.status(200).json(result[0]);
                                }
                            }
                        );
                    }
                }
            );
        } else {
            res.status(400).json("Недопустимый логин: admin");
        }
    } else {
        res.status(400).json("Не введены имя или фамилия");
    }
});

actionsRouter.get('/professors', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/actions/professors_page.html'));
});

actionsRouter.get('/professors/all.json', (req, res) => {
    con.query(`SELECT * FROM professor`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.status(200).json(result);
                } else {
                    res.status(404).json(`Не найдены преподаватели`);
                }
            }
        }
    );
});

actionsRouter.post('/professors', (req, res) => {
    if (req.body.firstName !== "") {
        if (req.body.secondName !== "") {
            con.query(`SELECT * FROM professor WHERE First_name='${req.body.firstName}' AND Second_name='${req.body.secondName}'`,
                function (err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        if (typeof result[0] != 'undefined') {
                            res.status(200).json(result);
                        } else {
                            res.status(404).json(`Не найдены преподаватели`);
                        }
                    }
                }
            );
        } else {
            con.query(`SELECT * FROM professor WHERE First_name='${req.body.firstName}'`,
                function (err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        if (typeof result[0] != 'undefined') {
                            res.status(200).json(result);
                        } else {
                            res.status(404).json(`Не найдены преподаватели`);
                        }
                    }
                }
            );
        }
    } else {
        if (req.body.secondName !== "") {
            con.query(`SELECT * FROM professor WHERE Second_name='${req.body.secondName}'`,
                function (err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        if (typeof result[0] != 'undefined') {
                            res.status(200).json(result);
                        } else {
                            res.status(404).json(`Не найдены преподаватели`);
                        }
                    }
                }
            );
        } else {
            res.status(400).json("Не введены имя или фамилия");
        }
    }
});

actionsRouter.get('/tests', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/actions/tests_page.html'));
});

actionsRouter.get('/tests/all.json', (req, res) => {
    con.query(`SELECT * FROM test`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.status(200).json(result);
                } else {
                    res.status(404).json(`Не найдены тесты`);
                }
            }
        }
    );
});

actionsRouter.post('/tests', (req, res) => {
    if (req.body.professorId !== "") {
        if (req.body.title !== "") {
            if (req.body.subject !== "") {
                con.query(`SELECT * FROM test WHERE Professor_id='${req.body.professorId}'` +
                    ` AND Title='${req.body.title}' AND Subject_title='${req.body.subject}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены тесты`);
                            }
                        }
                    }
                );
            } else {
                con.query(`SELECT * FROM test WHERE Professor_id='${req.body.professorId}'` +
                    ` AND Title='${req.body.title}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены тесты`);
                            }
                        }
                    }
                );
            }
        } else {
            if (req.body.subject !== "") {
                con.query(`SELECT * FROM test WHERE Professor_id='${req.body.professorId}'` +
                    ` AND Subject_title='${req.body.subject}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены тесты`);
                            }
                        }
                    }
                );
            } else {
                con.query(`SELECT * FROM test WHERE Professor_id='${req.body.professorId}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены тесты`);
                            }
                        }
                    }
                );
            }
        }
    } else {
        if (req.body.title !== "") {
            if (req.body.subject !== "") {
                con.query(`SELECT * FROM test WHERE Title='${req.body.title}'` +
                    ` AND Subject_title='${req.body.subject}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены тесты`);
                            }
                        }
                    }
                );
            } else {
                con.query(`SELECT * FROM test WHERE Title='${req.body.title}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены тесты`);
                            }
                        }
                    }
                );
            }
        } else {
            if (req.body.subject !== "") {
                con.query(`SELECT * FROM test WHERE Subject_title='${req.body.subject}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).json(result);
                            } else {
                                res.status(404).json(`Не найдены тесты`);
                            }
                        }
                    }
                );
            } else {
                res.status(400).json("Не введены имя, фамилия, название или предмет");
            }
        }
    }
});

actionsRouter.get('/add/student/professor/:id/test/:code', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/actions/add_student_to_test_page.html'));
});

module.exports = actionsRouter;