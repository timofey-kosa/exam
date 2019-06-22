'use strict';

const url = require('url');
const request = require('request');
const { JSDOM } = require('jsdom');

const URL = 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx';
const parsedURL = URL.includes('//') ?
  url.parse(URL) : url.parse('//' + URL, false, true);

const start = function start(group) {
  console.log(parsedURL.href);
  return getGroupURL(parsedURL.href, group).then(groupURL => {
    console.log(`Group schedules URL: ${groupURL}`);
    return parse(groupURL);
  },
  error => {
    console.log(error.host);
  });
};

function getGroupURL(URL, group) {
  return JSDOM.fromURL(URL).then(dom => {
    const document = dom.window.document;
    const formElement = document.getElementById('aspnetForm');
    const hiddenInputs = formElement.querySelectorAll('input[type="hidden"]');

    const FORM = {
      ctl00$MainContent$ctl00$txtboxGroup: group,
      ctl00$MainContent$ctl00$btnShowSchedule: 'Розклад занять'
    };

    [...hiddenInputs].forEach(elem => {
      FORM[elem.name] = elem.value;
    });

    return new Promise(resolve => {
      request.post({
        url: URL,
        form: FORM
      }, (err, res) => {
        resolve(`http://rozklad.kpi.ua${res.headers.location}`);
      });
    });
  });
}
/*
function getPage(obj, URL) {
  obj.get(URL, res => {
    let data = '';

    res.on('data', chunck => {
      data += chunck;
    });

    res.on('end', () => {
      console.log('\tWe have received data!');
      return data;
      // console.log('\tWe have parsed data!');
    });
  }).on('error', err => {
    //console.log(Object.getOwnPropertyNames(err));
    const errObj = {
      'StatusCode': err.code,
      'hostname': err.hostname,
      'host': err.host,
      'port': err.port,
      'message': err.message,
    };
    console.error('We have an error: \n', errObj);
  });
}
*/
function parse(groupURL) {
  return JSDOM.fromURL(groupURL).then(dom => {
    const schedules = {};

    const firstWeek = dom.window.document
      .getElementById('ctl00_MainContent_FirstScheduleTable');
    const secondWeek = dom.window.document
      .getElementById('ctl00_MainContent_SecondScheduleTable');

    const allTrFirstWeek = firstWeek.querySelectorAll('tr');
    const allTrSecondWeek = secondWeek.querySelectorAll('tr');

    // tr[0] - day of week
    // tr[1] td[0] - time
    // const schedules = {};
    const week1 = parseWeek(allTrFirstWeek);
    const week2 = parseWeek(allTrSecondWeek);

    schedules['Перший тиждень'] = week1;
    schedules['Другий тиждень'] = week2;

    return new Promise(resolve => {
      resolve(schedules);
    });
  });
}

function parseWeek(allTr) {
  const week = {};
  const days = {};
  let time = undefined;

  for (let i = 0; i < allTr.length; i++) {
    const allTd = allTr[i].querySelectorAll('td');
    for (let j = 0; j < allTd.length; j++) {
      const td = allTd[j];
      if (i === 0) {
        if (td.textContent.trim() === '') {
          continue;
        }
        week[td.textContent.trim()] = {};
        days[j] = td.textContent.trim();
      } else {
        if (j === 0) {
          for (const day in week) {
            week[day][td.textContent.trim().slice(1)] = '';
          }
          time = td.textContent.trim().slice(1);
        } else {
          if (td.textContent.trim() === '') {
            delete week[days[j]][time];
          } else {
            week[days[j]][time] = td.textContent.trim();
          }
          // console.log('');
        }
        // console.log('');
      }
      //console.log(td.textContent.trim());
    }
  }

  return week;
}

module.exports = { start };
//
// bot.telegram.setWebhook(`${DOMAIN_ALIAS_URL}bot${token}`);
// module.exports = bot.startWebhook(`/bot${token}`, null, 2000);

// bot.launch({
//   webhook: {
//     domain: DOMAIN_ALIAS_URL,
//     port: 3000
//   }
// });


// bot.telegram.setWebhook(DOMAIN_ALIAS_URL);
//
// module.exports = bot.webhookCallback('/');


// start('ІС-72')
//   .then(result => {
//     let someText = '';
//     for (const week in result) {
//       someText += week + ':\n\n';
//       someText += '-------------------------------\n\n';
//       for (const day in result[week]) {
//         someText += '\t\t\t' + day + ':\n\n';
//         for (const time in result[week][day]) {
//           someText += '\t\t\t\t\t\t' + time + ': ' +
//               result[week][day][time] + '\n\n';
//         }
//         someText += '\n\n';
//       }
//       someText += '-------------------------------\n\n';
//     }
//     console.log(someText);
//   },
//   error => {
//     console.log(error.href);
//   });






// bot.onText(/^[А-ЯІа-яі]{2}-[1-9а-яі]{2,5}$/, (msg, match) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message
//
//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"
//
//   // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, resp);
// });
//
// // Listen for any kind of message. There are different kinds of
// // messages.
//
// bot.onText(/\/start/, (msg) => {
//
//   bot.sendMessage(msg.chat.id, 'Welcome');
//
// });
//
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   let someText = '';
//
//
//   if (msg['text'] === 'full') {
//     for (const week in schedules) {
//       someText += week + ':\n\n';
//       someText += '-------------------------------\n\n';
//       for (const day in schedules[week]) {
//         someText += '\t\t\t' + day + ':\n\n';
//         for (const time in schedules[week][day]) {
//           someText += '\t\t\t\t\t\t' + time + ': ' +
//            schedules[week][day][time] + '\n\n';
//         }
//         someText += '\n\n';
//       }
//       someText += '-------------------------------\n\n';
//     }
//   } else {
//     someText = 'I can\'t find this command';
//   }
//
//   // send a message to the chat acknowledging receipt of their message
//   if (someText.length > 33) {
//     bot.sendMessage(chatId, someText.slice(0, -33));
//   } else {
//     bot.sendMessage(chatId, someText);
//   }
// });
