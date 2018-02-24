'use strict';

const jwt = require('jsonwebtoken');

const secret = 'wohoo';

const expiredToken = jwt.sign({'username':'Evan', exp: 1512416144}, secret);


console.log(expiredToken);



jwt.verify(expiredToken,secret, (err,info) => {
  if (err) {
    console.log(err);
  }
  console.log(info);
});
