const events = require('./events.json');
const users = require('./users.json');
const moment = require('moment');
const chalk = require('chalk');
// import users from './users'

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

// create a function to find all available times 
// create a switch that 
function getUsersFromInput() {
  const inputNames = process.argv.slice(2)
  const capitalizeName = inputNames.map(name => toTitleCase(name))
  const userList = users.filter(user => capitalizeName.includes(user.name));
  if (userList.length !== inputNames.length) {
    console.log(chalk.red("Could not find all of those names. Please make sure they were spelled correctly."));
  }
  return userList;
}

function getUsersTimes() {
  const users = getUsersFromInput()
  const newEvents = []
  const getTimesList = users.forEach(user => {
    return events.map(event => {
      if (event.user_id === user.id) {
        newEvents.push(event)
      }
      return newEvents;
    })
  })

  return newEvents
}

const cal = getUsersTimes()
console.log(cal)