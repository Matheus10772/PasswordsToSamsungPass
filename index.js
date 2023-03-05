const robot = require("robotjs");
const fs = require("fs");
const csv = require("csv");
const clipBoardManager = require("node-clipboardy");
const readLine = require("readline-sync");

const screenSize = robot.getScreenSize();

const globalInitialPosition = {
    x: 167,
    y: 174
}

Object.seal(globalInitialPosition);
Object.seal(screenSize);

const readSourceCSV = async function (sourcePath) {
    return new Promise((resolve, reject) => {
        let dataL = [];
        const csvStream = fs.createReadStream(sourcePath);
        const parser = csv.parse({columns: true, delimiter: ","});
        parser.on("error", (error)=>{reject(error)});
        csvStream.pipe(parser).on("data", (data) => {
            dataL.push(data);
        })
        .on('end', () =>{resolve(dataL)})
        .on("error", (error)=>{reject(error)});
    });
}

const timeSpace =  function (delayTime) {
    if(delayTime > 0)
        return new Promise(resolve => setTimeout(resolve, delayTime*1000));
    else
        return new Promise(resolve => setTimeout(resolve, 1000));
}

const goToAddButton = async function() {
    const positionAddButton = {x: 220, y:84};
    await timeSpace(1);
    robot.dragMouse(positionAddButton.x, positionAddButton.y);
    robot.mouseClick();
}

const goToEntry = async function (initialPosition) {
    const positionOfEntry = {x: 110, y: 500};
    await timeSpace(0.5);
    robot.dragMouse(initialPosition.x, initialPosition.y);
    await timeSpace(0.5);
    robot.scrollMouse(0, 50);
    robot.dragMouse(positionOfEntry.x, positionOfEntry.y);
    robot.mouseClick();
   
}

const moveToPasteOption = function (curretnPosition) {
    const nextPosition = {
        x: 45,
        y: curretnPosition.y-22,
    };

    robot.dragMouse(nextPosition.x, nextPosition.y);
}

const openBuildLogFile = function () {
    const fileStream = fs.createWriteStream("LogImport.txt", {flags: "a"});
    return fileStream;
}

const closeBuildLogFile = function (fileStream) {
    fileStream.end();
}

const buildLog = function(data, fileStream) {
    fileStream.write(data);
}

const returnScreen = function() {
    const returnPosition = {
        x: 23,
        y: 18
    }

    robot.dragMouse(returnPosition.x, returnPosition.y);
    robot.mouseClick();
}

const addInformations = async function (initialPosition, data, fileStreamLog) {
    const positonName = {x: 127, y:168};
    const positonID = {x: 71, y:238};
    const positonPassWord = {x: 55, y:305};
    const positionSaveButton = {x: 218, y:658};

    goToAddButton();
    await timeSpace(2);
    robot.dragMouse(positonName.x, positonName.y);
    robot.mouseClick();
    await timeSpace(1);
    moveToPasteOption(robot.getMousePos());
    await timeSpace(1);
    clipBoardManager.writeSync(data.name);
    await timeSpace(2);
    robot.mouseClick();
    await timeSpace(1);

    robot.dragMouse(positonID.x, positonID.y);
    robot.mouseClick();
    await timeSpace(1);
    robot.mouseClick();
    await timeSpace(1);
    moveToPasteOption(robot.getMousePos());
    await timeSpace(1);
    clipBoardManager.writeSync(data.username);
    await timeSpace(2);
    robot.mouseClick();
    await timeSpace(1);

    robot.dragMouse(positonPassWord.x, positonPassWord.y);
    robot.mouseClick();
    await timeSpace(1);
    robot.mouseClick();
    await timeSpace(1);
    moveToPasteOption(robot.getMousePos());
    await timeSpace(1);
    clipBoardManager.writeSync(data.password);
    await timeSpace(2);
    robot.mouseClick();
    await timeSpace(1);
    returnScreen();
    await timeSpace(1);

    robot.dragMouse(positionSaveButton.x, positionSaveButton.y);
    robot.mouseClick();
    await timeSpace(0.5);
    returnScreen();

    buildLog("A entrada: \n" + JSON.stringify(data) + "\n foi gravada com sucesso!\n", fileStreamLog);

}

const isValidFilePath = function (path) {
    try {
        fs.accessSync(path, fs.constants.F_OK);
        return true;    
    } catch (error) {
        console.log("O caminho digitado não é válido.\n", error);
        return false;
    }
    
}



const exec = async function (tablePath) {
    await timeSpace(5);

    const fileStreamLog = openBuildLogFile();
    let dataFromCSV = [];

    try {
        dataFromCSV = await readSourceCSV(tablePath)    
    } catch (error) {
        console.log("Erro ao fazer leitura do arquivo .CSV: ", error);
        return;
    }

    await goToEntry(globalInitialPosition);
    for(let row of dataFromCSV) {
        await addInformations(globalInitialPosition, row, fileStreamLog);
    }
    
    closeBuildLogFile(fileStreamLog);
}

let tablePath = "";


do {
    tablePath = readLine.question("Digite o caminho para o arquivo .CSV que contém as senhas, ou digite sair para encerrar.\n");
} while (tablePath.toLowerCase() !== "sair" && !isValidFilePath(tablePath));

if(tablePath !== "sair") {
    console.log("\nComeçando em 5 segundos. Não utilize o computador ou o telefone durante a execução do script.\n");
    exec(tablePath);
}