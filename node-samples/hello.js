console.dir('Hello')
console.log('Starting app.');

const fs = require('fs');
const os = require('os');

var user = os.userInfo();



fs.appendFile('greetings.txt', `Hello ${user.username}!`, (err) => {
    if(err) throw err;
    else
    console.log('Ok')
});
