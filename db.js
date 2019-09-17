const fs = require('fs');

class UserDataBase {
    constructor(settings) {
        this.userPath = settings.userPath;
        this.adminPath = settings.adminPath;

        fs.exists(this.userPath, (exists) => {
            if (exists) {
                fs.readFile(this.userPath, 'utf8', (err, data) => {
                    if(data){
                        this.users = data.split('\n');
                    } else {
                        this.users = [];
                    }
                });
            } else {
                this.users = [];
            }
        });
        fs.exists(this.adminPath, (exists) => {
            if (exists) {
                fs.readFile(this.adminPath, 'utf8', (err, data) => {
                    if(data){
                        this.admins = data.split('\n');
                    } else {
                        this.admins = [];
                    }
                });
            } else {
                this.admins = [];
            }
        })
    }

    AddNewUser(userID) {
        if(!this.CheckUserExistence(userID)){
            this.users.push(userID);
            this.Changed();
        }
    }

    AddNewAdmin(userID) {
        if(!this.IsAdmin(userID)){
            this.admins.push(userID);
            this.Changed();
        }
    }

    DeleteUser(userID) {
        if(this.CheckUserExistence(userID)){
            let index = this.users.findIndex(userID);
            delete this.users[index];
            this.Changed();
        }
        delete this.users[userID];
        this.Changed();
    }

    DeleteAdmin(userID) {
        if(this.IsAdmin(userID)) {
            let index = this.admins.findIndex(userID);
            delete this.admins[index];
            this.Changed();
        }
    }

    CheckUserExistence(userID) {
        for(let i = 0; i < this.users.length; i++){
            if(this.users[i] == userID){
                return true;
            }
        }
        return false;
    }

    GetIds() {
        return this.users;
    }

    GetAdminIds() {
        return this.admins;
    }

    IsAdmin(userID) {
        for(let i = 0; i < this.admins.length; i++){
            if(this.admins[i] == userID){
                return true;
            }
        }
        return false;
    }

    Changed() {
        fs.writeFile(this.userPath, this.users.join('\n'), () => {});
        fs.writeFile(this.adminPath, this.admins.join('\n'), () => {});
    }
}

module.exports = UserDataBase;