const execSync = require("child_process").execSync;

/*
    cmdExists(name)

    finds out if a command exists in PATH
    returns true or false
*/
const cmdExists = name => {

    const status = execSync(`whereis ${name}`, {encoding: "utf8"}).trim();

    if (status == `${name}:`) {
        return false;
    } else {
        return true;
    }
}

module.exports = cmdExists;