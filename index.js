const inquirer = require("inquirer");
const fs = require('fs');

const questions = [
    {
        type: "list",
        name: "user-questions",
        message: "Please choose one of the following options:",
        choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update employee role"],
    },
];