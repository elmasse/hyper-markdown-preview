
exports.sh = /(?:ba)?sh: ((?:file:\/\/)|(?:\/\/))?(.*): (?:(?:command not found)|(?:No such file or directory))/;
exports.bash = exports.sh;
exports.zsh = /zsh: (?:(?:command not found)|(?:no such file or directory)): ((?:file:\/\/)|(?:\/\/))?([^\r\n]+)/;
exports.fish = /fish: Unknown command '((?:file:\/\/)|(?:\/\/))?([^']+)'/;
