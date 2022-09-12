# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i


Test coverage at the start of project after running `jest -i --coverage`:`


--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   97.44 |    95.79 |   95.71 |   97.53 |                   
 express-jobly            |   96.36 |       85 |    87.5 |   96.29 |                   
  app.js                  |     100 |      100 |     100 |     100 |                   
  config.js               |     100 |      100 |     100 |     100 |                   
  db.js                   |   85.71 |       50 |     100 |   85.71 | 9                 
  expressError.js         |    87.5 |       50 |      80 |    87.5 | 43                
 express-jobly/helpers    |     100 |      100 |     100 |     100 |                   
  sql.js                  |     100 |      100 |     100 |     100 |                   
  tokens.js               |     100 |      100 |     100 |     100 |                   
 express-jobly/middleware |     100 |      100 |     100 |     100 |                   
  auth.js                 |     100 |      100 |     100 |     100 |                   
 express-jobly/models     |     100 |      100 |     100 |     100 |                   
  _testCommon.js          |     100 |      100 |     100 |     100 |                   
  company.js              |     100 |      100 |     100 |     100 |                   
  job.js                  |     100 |      100 |     100 |     100 |                   
  user.js                 |     100 |      100 |     100 |     100 |                   
 express-jobly/routes     |   95.41 |     92.3 |   93.75 |   95.67 |                   
  _testCommon.js          |     100 |      100 |     100 |     100 |                   
  auth.js                 |     100 |      100 |     100 |     100 |                   
  companies.js            |     100 |      100 |     100 |     100 |                   
  jobs.js                 |   83.33 |       75 |      75 |   84.31 | 75-85             
  users.js                |   98.07 |      100 |     100 |      98 | 55                
--------------------------|---------|----------|---------|---------|-------------------
