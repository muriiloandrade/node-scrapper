const {
  outputFile,
  appendFile,
  readJSONSync,
  readFileSync
} = require("fs-extra");
const { get } = require("request-promise-native");
const delay = require("delay");

let errUrls = [];
let things = [];
let jsonContrato, jsonEditais;
let fileBuffer;

async function doRequestTo(fileURL) {
  return await get({
    uri: fileURL,
    encoding: null,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36"
    }
  });
}

//#region Editais
async function downloadEditais(
  fileURL,
  modalidade,
  numeroEdital,
  outputFilename
) {
  try {
    await delay(15000);
    fileBuffer = await doRequestTo(fileURL);

    outputFile(
      `${__dirname}\\Arquivos\\${modalidade}\\${numeroEdital}\\${outputFilename}`,
      fileBuffer
    )
      .then(() => {
        console.log(
          `File writed to /${modalidade}/${numeroEdital}/${outputFilename}...`
        );
      })
      .catch(() => {
        console.error(`Erro: /${modalidade}/${numeroEdital}/${outputFilename}`);
      });
  } catch (error) {
    console.error(`${error.name}: ${error.message} -> ${fileURL}`);
    appendFile(
      `${__dirname}\\errs-editais.txt`,
      `${fileURL}|${modalidade}|${numeroEdital}|${outputFilename}\n`
    );
  }
}

async function iteraEBaixaEditais() {
  for (const item of jsonEditais) {
    item["anexos"].filter(async anexos => {
      await downloadEditais(
        anexos.url,
        item["modalidade_descricao"].trim(),
        item["numero"].replace("/", "-").trim(),
        anexos.filename
      );
    });
    await delay(90000);
  }
}

for (let i = 1; i <= 23; i++) {
  jsonEditais = readJSONSync(`./data/pag${i}.json`);
  console.log(`------------- Baixando editais da página ${i} -------------`);
  iteraEBaixaEditais()
    .then(() => {
      do {
        errUrls = [];
        things = [];
        let errEditaisFile;
        let lineEditais = [];
        console.log("--------- Lendo arquivos err-editais ---------");
        errEditaisFile = readFileSync(`${__dirname}\\errs-editais.txt`);
        console.log("--------- Arquivo err-editais lido ---------");
        lineEditais =
          errEditaisFile.toString().split("\n") == ""
            ? []
            : errEditaisFile.toString().split("\n");

        outputFile(`${__dirname}\\errs-editais.txt`, "")
          .then(() => {
            console.log(
              "--------- Sobrescrevendo o arquivo err-editais com texto vazio ---------"
            );
          })
          .catch(() => {
            console.error("Não foi possível limpar o arquivo err-editais");
          });

        lineEditais.forEach(l => {
          things = l.split("|");
          errUrls.push(things);
        });

        errUrls.forEach(async el => {
          await downloadEditais(el[0], el[1], el[2], el[3]);
        });
      } while (errUrls.length > 0);
    })
    .catch(() => {});
}
//#endregion Editais

//#region Contratos
async function downloadContratos(fileURL, numeroContrato, outputFilename) {
  try {
    await delay(5000);
    fileBuffer = await doRequestTo(fileURL);

    outputFile(
      `${__dirname}\\Arquivos\\Contratos\\${numeroContrato}\\${outputFilename}`,
      fileBuffer
    )
      .then(() => {
        console.log(
          `File writed to /Contratos/${numeroContrato}/${outputFilename}...`
        );
      })
      .catch(() => {
        console.error(`Erro: /Contratos/${numeroContrato}/${outputFilename}`);
      });
  } catch (error) {
    console.error(`${error.name}: ${error.message} -> ${fileURL}`);
    appendFile(
      `${__dirname}\\errs-contratos.txt`,
      `${fileURL}|${numeroContrato}|${outputFilename}\n`
    );
  }
}

async function iteraEBaixaContrato() {
  for (const item of jsonContrato) {
    await downloadContratos(
      item["arquivo"].url,
      item["numero"].replace("/", "-").trim(),
      item["arquivo"].filename
    );
  }
}

for (let i = 1; i <= 8; i++) {
  jsonContrato = readJSONSync(`./data/cont${i}.json`);
  console.log(`------------- Baixando contratos da página ${i} -------------`);
  iteraEBaixaContrato()
    .then(() => {
      do {
        errUrls = [];
        things = [];
        let errContratosFile;
        let lineContratos = [];
        console.log("--------- Lendo arquivo err-contratos ---------");
        errContratosFile = readFileSync(`${__dirname}\\errs-contratos.txt`);
        console.log("--------- Arquivo err-contratos lido ---------");
        lineContratos =
          errContratosFile.toString().split("\n") == ""
            ? []
            : errContratosFile.toString().split("\n");

        outputFile(`${__dirname}\\errs-contratos.txt`, "")
          .then(() => {
            console.log(
              "--------- Sobrescrevendo o arquivo errs-contratos com texto vazio ---------"
            );
          })
          .catch(() => {
            console.error("Não foi possível limpar o arquivo errs-contratos");
          });

        lineContratos.forEach(l => {
          things = l.split("|");
          errUrls.push(things);
        });

        errUrls.forEach(async el => {
          await downloadContratos(el[0], el[1], el[2]);
        });
      } while (errUrls.length > 0);
    })
    .catch(() => {});
}
//#endregion Contratos
