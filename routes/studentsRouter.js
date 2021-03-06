const path = require('path');
const express = require('express');
const mysql = require('mysql');

const studentsRouter = express.Router();

const con = mysql.createConnection({
    user: "root",
    password: "1234",
    database: "knowledge_verification_service"
});

con.connect(err => err ? console.error(err) : console.log("StudentsRouter connected to MySQL database!"));

studentsRouter.get('/:id', (req, res) => {
    con.query(`SELECT * FROM student WHERE Student_id='${req.params.id}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined')
                    res.sendFile(path.join(__dirname, '../pages/students/student_page.html'));
                else
                    res.redirect('/students');
            }
        }
    );
});

studentsRouter.get('/:id/info.json', (req, res) => {
    con.query(`SELECT * FROM student WHERE Student_id='${req.params.id}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined')
                    res.status(200).json(result[0]);
                else
                    res.redirect('/students');
            }
        }
    );

});

studentsRouter.get('/:id/delete', (req, res) => {
    con.query(`DELETE FROM student WHERE Student_id='${req.params.id}'`, err => {
        if (err)
            console.error(err);
        else
            res.end();
    });
});

studentsRouter.get('/:id/edit', (req, res) => {
    con.query(`SELECT * FROM student WHERE Student_id='${req.params.id}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.sendFile(path.join(__dirname, '../pages/students/student_edit_page.html'));
                } else {
                    res.redirect('/students');
                }
            }
        }
    );

});

studentsRouter.post('/:id/edit', (req, res) => {
    if (req.body.login !== "") {
        if (req.body.login === "admin") {
            res.status(400).json("Недопустимый логин: admin");
        } else {
            con.query("UPDATE student SET Login" + `='${req.body.login}' WHERE Student_id='${req.params.id}'`, err => {
                if (err)
                    res.status(400).json("Копия имеющегося студента");
                else
                    res.end();
            });
        }
    } else
        res.end();

    if (req.body.firstName !== "") {
        con.query("UPDATE student SET First_name" + `='${req.body.firstName}' WHERE Student_id='${req.params.id}'`, err => {
            if (err)
                console.error(err);
        });
    }

    if (req.body.secondName !== "") {
        con.query("UPDATE student SET Second_name" + `='${req.body.secondName}' WHERE Student_id='${req.params.id}'`, err => {
            if (err)
                console.error(err);
        });
    }

    if (req.body.studentGroup !== "") {
        con.query("UPDATE student SET `Student_group`" + `='${req.body.studentGroup}' WHERE Student_id='${req.params.id}'`, err => {
            if (err)
                console.error(err);
        });
    }

    if (req.body.password !== "") {
        con.query("UPDATE student SET Password" + `='${req.body.password}' WHERE Student_id='${req.params.id}'`, err => {
            if (err)
                console.error(err);
        });
    }
});

studentsRouter.get('/:id/tests/info.json', (req, res) => {
    con.query(`SELECT * FROM student_test WHERE Student_id='${req.params.id}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.status(200).json(result);
                } else {
                    res.status(404).send("Не найдены тесты студента");
                }
            }
        }
    );
});

studentsRouter.get('/:id/test/:code/:attempt', (req, res) => {
    con.query(`SELECT * FROM student_test WHERE Student_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}'AND Attempt_number='${req.params.attempt}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined')
                    res.sendFile(path.join(__dirname, '../pages/students/student_test_page.html'));
                else
                    res.redirect(`/student/${req.params.id}`);
            }
        }
    );
});

studentsRouter.get('/:id/test/:code/:attempt/info.json', (req, res) => {
    con.query(`SELECT * FROM student_test WHERE Student_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}' AND Attempt_number='${req.params.attempt}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.status(200).json(result[0]);
                } else {
                    res.redirect(`/student/${req.params.id}`);
                }
            }
        }
    );

});

studentsRouter.get('/:id/add/test', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/students/add_test_to_student_page.html'));
});

studentsRouter.post('/:id/add/test', (req, res) => {
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    let randomQuestionAdding = function (questionsIds) {
        con.query(`SELECT * FROM question WHERE Professor_id='${req.body.professorId}' AND Test_id='${req.body.testId}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        let mask = [];
                        for (let i = 0; i < result.length; i++) {
                            mask.push(0);
                        }
                        let current_number = 0;
                        while (current_number !== req.body.number) {
                            for (let i = 0; i < result.length; i++) {
                                if (current_number !== req.body.number) {
                                    if (mask[i] === 0 && getRandomInt(result.length / req.body.number + 1) === 0) {
                                        mask[i] = 1;
                                        current_number++;
                                    }
                                } else
                                    break;
                            }
                        }

                        let posMask = []

                        function isHasPos(randomPos) {
                            for (let i = 0; i < posMask.length; i++) {
                                if (posMask[i] === randomPos)
                                    return true
                            }
                            return false
                        }

                        for (let i = 0; i < result.length; i++) {
                            if (mask[i] === 1) {
                                let randomPos = getRandomInt(req.body.number)
                                while (isHasPos(randomPos)) {
                                    randomPos = getRandomInt(req.body.number)
                                }
                                posMask.push(randomPos)
                            } else
                                posMask.push(-1);
                        }

                        for (let i = 0; i < result.length; i++) {
                            if (posMask[i] !== -1) {
                                questionsIds[posMask[i]] = result[i].Question_id
                            }
                        }

                        for (let j = 0; j < questionsIds.length; j++) {
                            con.query("INSERT INTO student_question (`Attempt_number`,`Student_id`,`Test_id`,`Professor_id`,`Question_id`) "
                                + `VALUES ('${req.body.attempt}','${req.params.id}', '${req.body.testId}', '${req.body.professorId}', '${questionsIds[j]}')`,
                                function (err1) {
                                    if (err1)
                                        console.error(err1);
                                    else
                                        randomAnswerAdding(questionsIds, j)
                                }
                            );
                        }
                    } else {
                        console.error("Не найдены вопросы у теста преподавателя");
                    }
                }
            }
        );
    }

    let randomAnswerAdding = function (questionsIds, j) {
        let answersIds = [];
        con.query(`SELECT * FROM student_question WHERE Student_id='${req.params.id}'` +
            ` AND Test_id='${req.body.testId}' AND Attempt_number='${req.body.attempt}'` +
            ` AND Question_id='${questionsIds[j]}'`,
            function (err, result1) {
                if (err)
                    console.error(err);
                else {
                    con.query(`SELECT * FROM answer WHERE Professor_id='${req.body.professorId}' AND Test_id='${req.body.testId}'` +
                        `AND Question_id='${questionsIds[j]}'`,
                        function (err, result2) {
                            if (err)
                                console.error(err);
                            else {
                                if (typeof result2[0] != 'undefined') {
                                    let mask = [];
                                    for (let i = 0; i < result2.length; i++) {
                                        mask.push(1);
                                    }

                                    let right_number = 0;
                                    let wrong_number = 0;
                                    while (right_number < 1 || wrong_number < 1) {
                                        right_number = 0;
                                        wrong_number = 0;
                                        for (let i = 0; i < result2.length; i++) {
                                            mask[i] = 1;
                                            if (getRandomInt(result2.length < 8 ? 10 - result2.length : 2) === 0) {
                                                mask[i] = 0;
                                            } else {
                                                if (result2[i].Is_correct_answer === 1)
                                                    right_number++;
                                                else
                                                    wrong_number++;
                                            }
                                        }
                                    }

                                    let posMask = []

                                    function isHasPos(randomPos) {
                                        for (let i = 0; i < posMask.length; i++) {
                                            if (posMask[i] === randomPos)
                                                return true
                                        }
                                        return false
                                    }

                                    for (let i = 0; i < result2.length; i++) {
                                        if (mask[i] === 1) {
                                            let randomPos = getRandomInt(right_number + wrong_number)
                                            while (isHasPos(randomPos)) {
                                                randomPos = getRandomInt(right_number + wrong_number)
                                            }
                                            posMask.push(randomPos)
                                        } else
                                            posMask.push(-1);
                                    }

                                    for (let i = 0; i < right_number + wrong_number; i++) {
                                        answersIds.push(0);
                                    }

                                    for (let i = 0; i < result2.length; i++) {
                                        if (posMask[i] !== -1) {
                                            answersIds[posMask[i]] = result2[i].Answer_id
                                        }
                                    }

                                    for (let i = 0; i < answersIds.length; i++) {
                                        con.query("INSERT INTO student_answer (`Student_question_id`,`Attempt_number`,`Student_id`,`Test_id`,`Professor_id`,`Question_id`,`Answer_id`) "
                                            + `VALUES ('${result1[0].Student_question_id}','${req.body.attempt}','${req.params.id}', '${req.body.testId}', '${req.body.professorId}', '${questionsIds[j]}', '${answersIds[i]}')`,
                                            function (err1) {
                                                if (err1)
                                                    console.error(err1);
                                            }
                                        );
                                    }
                                } else {
                                    console.error("Не найдены ответы у вопроса из теста преподавателя");
                                }
                            }
                        }
                    );
                }
            }
        );
    }

    if (req.body.number !== "") {
        con.query("INSERT INTO student_test (`Attempt_number`,`Student_id`,`Test_id`,`Professor_id`,`Created_by_id`,`Number_of_questions_in_test`) "
            + `VALUES ('${req.body.attempt}','${req.params.id}', '${req.body.testId}', '${req.body.professorId}','${req.body.createdById}', '${req.body.number}')`,
            function (err1) {
                if (err1)
                    console.error(err1);
            }
        );

        let questionsIds = [];
        for (let i = 0; i < req.body.number; i++) {
            questionsIds.push(0);
        }

        randomQuestionAdding(questionsIds);

        res.end();
    } else {
        res.status(400).json("Не введено количество вопросов в тесте");
    }
});

studentsRouter.get('/:id/test/:code/:attempt/delete', (req, res) => {
    con.query(`DELETE FROM student_test WHERE Student_id='${req.params.id}' AND Test_id='${req.params.code}'` +
        ` AND Attempt_number='${req.params.attempt}'`, err => {
        if (err)
            console.error(err);
        else
            res.end();
    });
});

studentsRouter.get('/:id/test/:code/:attempt/questions/info.json', (req, res) => {
    con.query(`SELECT * FROM student_question WHERE Student_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}'  AND Attempt_number='${req.params.attempt}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.status(200).json(result);
                } else {
                    res.status(404).send("Не найдены вопросы студента");
                }
            }
        }
    );

});

studentsRouter.get('/:id/test/:code/:attempt/question/:numb', (req, res) => {
    con.query(`SELECT * FROM student_question WHERE Student_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}'AND Attempt_number='${req.params.attempt}'` +
        ` AND Question_id='${req.params.numb}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined')
                    res.sendFile(path.join(__dirname, '../pages/students/student_question_page.html'));
                else
                    res.redirect(`/student/${req.params.id}/test/${req.params.code}/${req.params.attempt}`);
            }
        }
    );
});

studentsRouter.get('/:id/test/:code/:attempt/question/:numb/info.json', (req, res) => {
    con.query(`SELECT * FROM student_question WHERE Student_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}' AND Attempt_number='${req.params.attempt}'` +
        ` AND Question_id='${req.params.numb}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.status(200).json(result[0]);
                } else {
                    res.redirect(`/student/${req.params.id}/test/${req.params.code}/${req.params.attempt}`);
                }
            }
        }
    );
});

studentsRouter.get('/:id/test/:code/:attempt/question/:numb/answers/info.json', (req, res) => {
    con.query(`SELECT * FROM student_answer WHERE Student_id='${req.params.id}' AND Test_id='${req.params.code}'` +
        ` AND Attempt_number='${req.params.attempt}' AND Question_id='${req.params.numb}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    res.status(200).json(result);
                } else {
                    res.status(404).send("Не найдены ответы студента");
                }
            }
        }
    );
});

studentsRouter.post('/:id/test/:code/:attempt/question/:numb/solve', (req, res) => {
    let answers = req.body.answers;

    for (let i = 0; i < answers.length; i++) {
        con.query("UPDATE student_answer SET Is_selected_answer" + `='${answers[i].sel ? 1 : 0}' WHERE Student_id='${req.params.id}'` +
            ` AND Test_id='${req.params.code}' AND Attempt_number='${req.params.attempt}' AND Question_id='${req.params.numb}'` +
            ` AND Answer_id='${answers[i].id}'`,
            function (err) {
                if (err)
                    console.error(err);
            }
        );
    }

    con.query(`SELECT * FROM answer WHERE Test_id='${req.params.code}' AND Question_id='${req.params.numb}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                let f = true;
                for (let i = 0; i < result.length; i++) {
                    for (let j = 0; j < answers.length; j++) {
                        if (result[i].Answer_id === answers[j].id) {
                            if ((result[i].Is_correct_answer === 1 && !answers[j].sel) || (result[i].Is_correct_answer === 0 && answers[j].sel)) {
                                f = false;
                                break;
                            }
                        }
                    }
                    if (!f)
                        break;
                }

                con.query("UPDATE student_question SET Is_correct_answer_to_question" + `='${f ? 1 : 0}' WHERE Student_id='${req.params.id}'` +
                    ` AND Test_id='${req.params.code}' AND Attempt_number='${req.params.attempt}' AND Question_id='${req.params.numb}'`,
                    function (err) {
                        if (err)
                            console.error(err);
                        else
                            res.end();
                    }
                );
            }
        }
    );
});

studentsRouter.post('/:id/test/:code/:attempt/solve', (req, res) => {
    con.query("UPDATE student_test SET Number_of_correct_answers" + `='${req.body.correct_answers}' WHERE Student_id='${req.params.id}'` +
        ` AND Test_id='${req.params.code}' AND Attempt_number='${req.params.attempt}'`,
        function (err) {
            if (err)
                console.error(err);
            else
                res.end();
        }
    );
});

module.exports = studentsRouter;