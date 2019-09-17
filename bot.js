const EasyVk = require('easyvk');
const UserDB = require('./db.js');
const Settings = require('./settings');

const help = [
    '+help — список команд',
    '+ntf  — подписаться на новостную рассылку',
    '-ntf  — отписаться от новостной рассылки'
//    '+tt   — подписаться на рассылку расписания на следующий день',
//    '-tt   — отписаться от рассылки расписания'
].join('\n');

var dataBase;
var vkConnection;
var botConnection;
var newPosts;

function SelectCommand(userID, type, text, attachment) {
    switch (type) {
        case 'hello':
            vkConnection.post('messages.send', {
                user_id: userID,
                message: help
            }).catch((err) => console.log(err));
            break;
        case 'news':
            vkConnection.post('messages.send', {
                user_ids: dataBase.GetIds().join(','),
                message: text,
                attachment: attachment.map((att) => `${att.type}${att[att.type].owner_id}_${att[att.type].id}_${att[att.type].access_key}`).join(',')
            }).catch((err) => console.log(err));
            break;
        case 'react':
            let command = text.substr(1, 5);
            switch (text[0]) {
                case '+':
                    switch (command) {
                        case 'help':
                            vkConnection.post('messages.send', {
                                user_id: userID,
                                message: help
                            }).catch((err) => console.log(err));
                            break;
                        case 'ntf':
                            let exist = dataBase.CheckUserExistence(userID);
                            if (!exist) {
                                dataBase.AddNewUser(userID);
                            }
                            vkConnection.post('messages.send', {
                                user_id: userID,
                                message: 'Подписка ✅'
                            }).catch((err) => console.log(err));
                            break;
                        case 'tt':
                            vkConnection.post('messages.send', {
                                user_id: userID,
                                message: 'В разработке...'
                            }).catch((err) => console.log(err));
                            break;
                        case 'post':
                            if (dataBase.IsAdmin(userID)) {
                                if (newPosts[userID]) {
                                    break;
                                } else {
                                    newPosts[userID] = { time: new Date(), post: {}, end: false };
                                    vkConnection.post('messages.send', {
                                        user_id: userID,
                                        message: 'Напишите новое глобальное сообщение'
                                    }).catch((err) => console.log(err));
                                }
                            }
                            break;
                        case 'admin':
                            if (userID == '491103689') {
                                dataBase.AddNewAdmin(text.substr(7));
                                vkConnection.post('messages.send', {
                                    user_id: userID,
                                    message: 'Новый админ добавлен'
                                }).catch((err) => console.log(err));
                                break;
                            }
                            vkConnection.post('messages.send', {
                                user_id: userID,
                                message: 'Неправильная команда'
                            }).catch((err) => console.log(err));
                            break;
                        default:
                            vkConnection.post('messages.send', {
                                user_id: userID,
                                message: 'Неправильная команда'
                            }).catch((err) => console.log(err));
                            break;
                    }
                    break;
                case '-':
                    switch (command) {
                        case 'ntf':
                            let exist = dataBase.CheckUserExistence(userID);
                            if (!exist) {
                                dataBase.AddNewUser(userID);
                            }
                            vkConnection.post('messages.send', {
                                user_id: userID,
                                message: 'Отписка ✅'
                            }).catch((err) => console.log(err));
                            break;
                        case 'tt':
                            vkConnection.post('messages.send', {
                                user_id: userID,
                                message: 'В разработке...'
                            }).catch((err) => console.log(err));
                            break;
                        case 'admin':
                            if (userID == '491103689') {
                                dataBase.DeleteAdmin(text.substr(7));
                                vkConnection.post('messages.send', {
                                    user_id: userID,
                                    message: 'Админ удалён'
                                }).catch((err) => console.log(err));
                                break;
                            }
                            vkConnection.post('messages.send', {
                                user_id: userID,
                                message: 'Неправильная команда'
                            }).catch((err) => console.log(err));
                            break;
                        default:
                            vkConnection.post('messages.send', {
                                user_id: userID,
                                message: 'Неправильная команда'
                            }).catch((err) => console.log(err));
                            break;
                    }
                    break;
                default:
                    if (newPosts[userID]) {
                        if (newPosts[userID].end) {
                            switch (text.toLowerCase()) {
                                case 'да':
                                    vkConnection.post('messages.send', newPosts[userID].post).catch((err) => console.log(err));
                                    delete newPosts[userID];
                                    break;
                                case 'нет':
                                    newPosts[userID].end = false;
                                    newPosts[userID].post = {};

                                    vkConnection.post('messages.send', {
                                        user_id: userID,
                                        message: 'Напишите новое глобальное сообщение'
                                    }).catch((err) => console.log(err));
                                    break;
                                case 'отмена':
                                    delete newPosts[userID];
                                    break;
                                default:
                                    vkConnection.post('messages.send', {
                                        user_id: userID,
                                        message: 'Отправить это сообщение? (да/нет/отмена)'
                                    }).catch((err) => console.log(err));
                                    break;
                            }
                        } else {
                            newPosts[userID].post = {
                                user_ids: dataBase.GetIds().join(','),
                                message: text,
                                attachment: attachment.map((att) => `${att.type}${att[att.type].owner_id}_${att[att.type].id}_${att[att.type].access_key}`).join(',')
                            };
                            newPosts[userID].end = true;
                            vkConnection.post('messages.send', {
                                user_id: userID,
                                message: 'Отправить это сообщение? (да/нет/отмена)'
                            }).catch((err) => console.log(err));
                        }
                    } else {
                        if (text.toLowerCase() == 'начать') {
                            SelectCommand(userID, 'help');
                        }
                    }
                    break;
            }
    }
}

const settings = Settings();
const lpSettings = {
    forGetLongPollServer: {},
    forLongPollServer: {}
};

dataBase = new UserDB(settings);
newPosts = {};

EasyVk({
    access_token: settings.token,
    utils: {
        bots: true
    }
}).then((vk) => {
    vkConnection = vk;
    vkConnection.bots.longpoll.connect(lpSettings).then(({ connection }) => {
        botConnection = connection;

        botConnection.on('message_new', (response) => SelectCommand(response.from_id, 'react', response.text, response.attachments));
        botConnection.on('message_allow', (response) => SelectCommand(response.user_id, 'hello'));
        botConnection.on('message_deny', (response) => dataBase.DeleteUser(response.user_id));
        botConnection.on('group_leave', (response) => dataBase.DeleteUser(response.user_id));
        botConnection.on('group_join', (response) => SelectCommand(response.user_id, 'hello'));
        botConnection.on('wall_post_new', (response) => SelectCommand(null, 'news', response.text, response.attachments))

        setInterval(() => {
            let ids = Object.getOwnPropertyNames(newPosts);
            let time = new Date();
            ids.forEach((id) =>{
                if(time - newPosts[id].time >= 1800000) {
                    delete newPosts[id];
                    vkConnection.post('messages.send', {
                        user_id : id,
                        message : 'Время ожидания сообщения истекло'
                    }).catch((err) => console.log(err));
                }
            })
        }, 60000);
    });
});