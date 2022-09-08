const { BadRequestError } = require("../expressError");

/** sqlForPartialUpdate: Use to help create a valid sql query for a partial update.
   *
   * sqlForPartial update is expecting data in object format: dataToUpdate = {firstName: "Chester", lastName: "Bennington" }
   * Object.keys creates an array of the properties of the data: ["firstName", "lastName"]
   * if no data was given return a BadRequestError
   * 
   * Otherwise map keys array (and get its index plus 1) and turn into a SQL query. While also using 
   * the jsToSql that was given to make the JS variables into valid SQL {firstName: "first_name"} 
   * creating a query that looks something like: `first_name = $1` with multiples items separted by ','
   * 
   * values: Object.values turns the values of the dataToUpdate into an array: [ "Chester", "Bennington"]
   * 
   * Returns { setCols: `"first_name"=$1 , "last_name"=$2`, values: [ "Chester", "Bennington" ]} 
**/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
