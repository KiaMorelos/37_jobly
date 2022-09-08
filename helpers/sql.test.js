const {sqlForPartialUpdate} = require("./sql");

describe("tests for sql generation helper function, sqlForPartialUpdate", function(){
    test("test when given valid data that needs conversion from js to sql", function(){
        
        const data = { firstName: "Mike", lastName: "Shinoda" };
        const jsToSql = { firstName: "first_name", lastName: "last_name" };

        const sqlColsAndValues = sqlForPartialUpdate(data, jsToSql);

        expect(sqlColsAndValues).toEqual({setCols: `"first_name"=$1, "last_name"=$2`, values: ["Mike", "Shinoda",]})

    });

    test("test when given data includes something that is not a string", function(){
        
        const data = { age: 42, occupation: "musician" };
        const jsToSql = { age: "age", occupation: "occupation" };

        const sqlColsAndValues = sqlForPartialUpdate(data, jsToSql);

        expect(sqlColsAndValues).toEqual({setCols: `"age"=$1, "occupation"=$2`, values: [42, "musician",]})

    });
});