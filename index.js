const child_process = require("child_process");
const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({"input": process.stdin, "output": process.stdout});

var whoami = child_process.execSync("whoami").toString();
var isWindoze = process.platform == "win32" ? true : false;
var user = isWindoze ? process.env.USERNAME : whoami;
var hostname = isWindoze ? process.env.COMPUTERNAME : child_process.execSync("hostname").toString();
var homeDirectory = isWindoze ? process.env.HOMEDRIVE.concat(process.env.HOMEPATH) : "/home/".concat(whoami);
var directory = homeDirectory;

if(process.platform === "win32")
	child_process.execSync("chcp 65001 > nul");

process.chdir(directory);

function getDir(){
	return directory === homeDirectory ? "~" : directory;
};

function isAdmin(){
	if(isWindoze){
		let writeTest = (()=>{try{cp.execSync("echo hello >> %windir%\\aLittleTestFile.txt");return true;}catch{return false;}})();
		writeTest ? cp.execSync("erase %windir%\\aLittleTestFile.txt") : null;
		return writeTest;
	}
	else{
		let readTest = (()=>{try{cp.execSync("cat /etc/shadow");return true;}catch{return false;}})();
		return readTest;
	};
};

function main(){
	rl.question(user + "@" + hostname + " " + getDir() + " " + (isAdmin() ? "# " : "$ "), function(command){
		let args = command.match(/[^\s"']+|"([^"]*)"|'([^']*)'[^\s"']+|"([^"]*)"|'([^']*)'/g);
		args.unshift(directory);
		let switchs = [];
		args.map(function(arg){
			if(arg.startsWith("-"))
				switchs.push(arg.replace("-", String()).split(String()));
			return arg;
		});
		switch(args[1]){
			case "dog":
				let file = args[2].replace(/\"/g, String()).replace(/\'/g, String());
				fs.stat(file, function(err, stats){
					if(err){
						process.stderr.write("Can't read the file: ".concat(err));
						return main();
					}
					else{
						if(stats.isDirectory()){
							process.stderr.write("Can't read the file `"+file+"`: It's a directory");
							return main();
						}
						else{
							fs.access(file, fs.constants.R_OK, function(theError){
								if(theError){
									process.stderr.write(file+"is not readble");
									return main();
								}
								else{
									fs.readFile(file, "UTF-8", function(error, data){
										if(error)
											process.stderr.write("Can't read the file: ".concat(error));
										else
											process.stdout.write(data.concat("\n"));
										return main();
									});
								}
							});
						}
					};
				});
			break;
			case "ls":
				fs.readdir(directory, function(err, sectors){
					sectors.forEach(function(sector){
						if(switchs.includes('a'))
							sectors.unshift(".", "..");
						if(fs.statSync(sector).isDirectory())
							process.stdout.write(sector+"/\n");
						else
							process.stdout.write(sector+"\n");
					});
					main();
				});
			break;
			case "printf":
				if(args.length === 3){
					console.log(args[2]);
					main();
				}
				else{
					process.stderr.write("Usage: printf <text>\nExemple: \"Hello World !\\n\"\n")
					main();
				};
			break;
			default:
				process.stdout.write(child_process.execSync(command).toString());
				main();
		};
	});
};

main();