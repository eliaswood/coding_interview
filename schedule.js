const events = require('./events.json');
const users = require('./users.json');
const chalk = require('chalk');

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

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
  users.forEach(user => {
    return events.map(event => {
      if (event.user_id === user.id) {
        newEvents.push({ startTime: `${event.start_time}Z`, endTime: `${event.end_time}Z` })
      }
      return newEvents;
    })
  })

  const sortedEvents = newEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

  const combinedEvents = sortedEvents.reduce((acc, event) => {
      if (acc.length === 0) {
        return [event];
      }
  
      const prev = acc.pop();
  
      if (event.endTime <= prev.endTime) {
        return [...acc, prev];
      }

      if (event.startTime <= prev.endTime) {
        return [...acc, { startTime: prev.startTime, endTime: event.endTime }];
      }

      return [...acc, prev, event];
    }, []);

    return combinedEvents;
}

function separateDays() {
  const combinedEvents = getUsersTimes()
  let prevInd = 0
  const separateDay = combinedEvents.reduce((acc, date, i) => {
    let day = new Date(date.endTime);
    let nextDay = i + 1 < combinedEvents.length ? new Date(combinedEvents[i+1].endTime) : day;

    if (day.getDate() !== nextDay.getDate()) {
      acc.push(combinedEvents.slice(prevInd, i+1))
      prevInd = i + 1
    }
    if (i === combinedEvents.length-1) {
      acc.push(combinedEvents.slice(prevInd))
    }

    return acc;
  }, [])

  return separateDay;
}

function getAvailableTimes() {
  const busyTimes = separateDays();
  const availableTimeArray = []

  busyTimes.map(day => {
    const setDate = new Date(day[0].startTime)
    const extractDate = setDate.toISOString().slice(0, 11)

    let endTimeFarthest = new Date(`${extractDate}21:00Z`)
    let startTimeMinimum = new Date(`${extractDate}13:00Z`)

    day.forEach((element, i) => {
      let currentEndTime = new Date(element.endTime)
      let currentStartTime = new Date(element.startTime)

      if (i === day.length - 1) {
        if (day.length === 1) {
          return availableTimeArray.push({
            start: startTimeMinimum.toISOString(),
            end: endTimeFarthest.toISOString()
          })
         }
         availableTimeArray.push({
          start: currentEndTime.toISOString(),
          end: endTimeFarthest.toISOString()
         })

      } else {
        const nextBusyTime = day[i + 1]
        const nextStartTime = new Date(nextBusyTime.startTime)

        if (i === 0) {
          if (currentStartTime.getTime() === startTimeMinimum.getTime()) {
            return availableTimeArray.push({
              start: currentEndTime.toISOString(),
              end: nextStartTime.toISOString()
            })
          }
          availableTimeArray.push({
            start: startTimeMinimum .toISOString(),
            end: nextStartTime.toISOString()
          })
        }
        let endTimeToCompare = currentEndTime < endTimeFarthest 
          ? currentEndTime
          : endTimeFarthest;
        
        if (endTimeToCompare < nextStartTime) {
          availableTimeArray.push({
            start: endTimeToCompare.toISOString(),
            end: nextStartTime.toISOString()
          })
        }
        }
      })
    })

  return availableTimeArray
}

const run = getAvailableTimes()
console.log(run)