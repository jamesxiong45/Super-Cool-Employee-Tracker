const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const cTable = require('console.table');
const inquirer = require('inquirer');
const fs = require('fs');
const connection = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const choices = ["View all departments", "View all role", "View all employees", "Add a department", "Add a role", "Add an employee", "Update employee role", "Exit"];
const departmentArray = [];

connection.promise().query("SELECT id, dept_name FROM department")
  .then(([rows, fields]) => {
    rows.forEach(row => {
      departmentArray.push({
        id: row.id,
        name: row.name
      });
    });
  })
  .catch(err => console.log(err));


init();

function init() {
    inquirer.prompt({
        name: "selection",
        type: "list",
        message: "Please choose from the following options: ",
        choices: choices
    })
        .then(function (answer) {
            console.log(answer);

            if (answer.selection === choices[0]) {
                viewAllDepts();
            }
            else if (answer.selection === choices[1]) {
                viewAllrole();
            }
            else if (answer.selection === choices[2]) {
                viewAllEmployees();
            }
            else if (answer.selection === choices[3]) {
                newDept();
            }
            else if (answer.selection === choices[4]) {
                newRole();
            }
            else if (answer.selection === choices[5]) {
                newEmployee();
            }
            else if (answer.selection === choices[6]) {
                updateRole();
            }
            else if (answer.selection === choices[7]) {
                console.log("Thank you for checking out! Press CTRL+C to exit!");
            }
            else {
                return;
            }
        });
};

function viewAllDepts() {
    connection.query("SELECT * FROM department", function (err, result, fields) {
        if (err) throw err;
        console.table(result);
        init();
    });
};

function viewAllrole() {
    connection.query("SELECT * FROM role", function (err, result, fields) {
        if (err) throw err;
        console.table(result);
        init();
    });
};

function viewAllEmployees() {
    connection.query("SELECT * FROM employee", function (err, result, fields) {
        if (err) throw err;
        console.table(result);
        init();
    });
};

function newDept() {
    inquirer.prompt([
        {
            name: "dept",
            type: "input",
            message: "Enter the name of the new department: "
        }
    ]).then(function (answer) {
        connection.promise().query("INSERT INTO department (dept_name) VALUES (?)", [answer.dept], function (err, res) {
            if (err) throw err;
            console.table(res)
        }).then(init);


    });
};

function newRole() {
    connection.promise()
      .query("SELECT id, dept_name FROM department")
      .then(([rows, fields]) => {
        const departmentArray = rows.map(row => ({
          name: row.dept_name,
          value: row.id
        }));
  
        inquirer.prompt([
          {
            name: "role",
            type: "input",
            message: "Enter the name of the new role: "
          },
          {
            name: "salary",
            type: "number",
            message: "Enter the new role's salary: "
          },
          {
            name: "dept",
            type: "list",
            message: "Which department is the new role in: ",
            choices: departmentArray
          }
        ]).then(function (answer) {
          connection.promise()
            .query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [answer.role, answer.salary, answer.dept])
            .then(function (res) {
              console.log("New role added successfully: ");
              console.table(res[0]);
              init();
            })
            .catch(function (err) {
              console.log(err);
            });
        });
      })
      .catch(err => console.log(err));
  };
  

  function newEmployee() {
    connection.promise().query("SELECT id, title FROM role")
        .then(([rows, fields]) => {
            const roleArray = rows.map(row => ({
                name: row.title,
                value: row.id
            }));

            inquirer.prompt([
                {
                    name: "first",
                    type: "input",
                    message: "Enter the employee's first name: "
                },
                {
                    name: "last",
                    type: "input",
                    message: "Enter the employee's last name: "
                },
                {
                    name: "role",
                    type: "list",
                    message: "What role will the employee have? ",
                    choices: roleArray
                },
                {
                    name: "manager",
                    type: "confirm",
                    message: "Is the new employee in management? ",
                    default: false
                }

            ]).then(function (answer) {
                const roleId = answer.role;
                const managerId = answer.manager ? null : 1; // Replace 1 with the appropriate manager ID
                
                connection.promise().query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [answer.first, answer.last, roleId, managerId])
                    .then(function (res) {
                        console.table(res[0]);
                        init();
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            });
        })
        .catch(err => console.log(err));
};

  

function updateRole() {
    inquirer.prompt([
      {
        name: "lastName",
        type: "input",
        message: "Enter the last name of the employee to update:",
      },
    ]).then(function (answer) {
      connection.promise().query(
        "SELECT * FROM employee WHERE last_name = ?",
        [answer.lastName]
      ).then(([rows, fields]) => {
        if (rows.length === 0) {
          console.log(`No employees found with last name "${answer.lastName}"`);
          init();
          return;
        }
        console.table(rows);
        inquirer.prompt([
          {
            name: "roleId",
            type: "number",
            message: "Enter the ID of the new role for this employee:",
          },
        ]).then(function (answer) {
          connection.promise().query(
            "UPDATE employee SET role_id = ? WHERE last_name = ?",
            [answer.roleId, answer.lastName]
          ).then(function (res) {
            console.log(`${res.affectedRows} employee updated!`);
            init();
          }).catch(function (err) {
            console.log(err);
          });
        });
      }).catch(function (err) {
        console.log(err);
      });
    });
  }
  


app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT);
