USE employee_db;

INSERT INTO department (id, dept_name)
VALUES (1, "Sales"),
       (2, "Retail");

INSERT INTO role (id, title, salary, department_id)
VALUES (1, "Sales Associate", 35000, 1),
       (2, "Shelf Stocker", 30000, 1);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1, "Jane", "Doe", 2, 0),
       (2, "John", "Doe", 1, 1);
