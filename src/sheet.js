const { google, GoogleSpreadsheet} = require('googleapis');
const { default: axios } = require("axios");
const { GoogleAuth } = require('google-auth-library');
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const data = require('./data.json')
const fs = require('fs');
const path = require('path');

const flattenObject = (obj, prefix = '') => {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
  }
  return result;
};

const convertTo2DArray = (data) => {
  if (!Array.isArray(data)) {
    data = [data];
  }

  if (data.length === 0) return [[]];
  const flattenedData = data.map(item => flattenObject(item));
  const allKeys = Array.from(new Set(flattenedData.flatMap(Object.keys)));

  const headerRow = allKeys;

  const rows = flattenedData.map(item => 
    allKeys.map(key => item[key] || '')
  );

  return [headerRow, ...rows];
};


const Gsapi = async (data) => {
  const {ssid, range, url} = data;
  const auth = new GoogleAuth({
      keyFile: 'src/key.json',
      scopes: SCOPES
  });
  const client = await auth.getClient();
  const gsapi = new google.sheets({version:'v4', auth:client });


  const apiData = await axios.get(url);

  
  const rows = convertTo2DArray(apiData.data);

  const updateOptions = {
    spreadsheetId: ssid,
    range: range,
    valueInputOption: 'USER_ENTERED',
    resource: { values: rows }
  };
  
  let resp = await gsapi.spreadsheets.values.update(updateOptions);
  if (resp.config.status != 200) {
    stopGsApi()
  }
  console.log('sheet updated');
}

let intervalId = null;

function runGsApi(dataa) {
  if (intervalId === null) {
    let gsData = {};

    if (dataa != null) {
      saveData(dataa);
      gsData = dataa;
    } else if (typeof data !== 'undefined' && data !== null) {
      gsData = data;
    } else {
      return "Error";
    }

    intervalId = setInterval(() => Gsapi(gsData), 6000);
    return `Running ....\nSSID : ${gsData.ssid}\nRange: ${gsData.range}\nAPI URL: ${gsData.url}`;
  }
}

function stopGsApi() {
  if (intervalId !== null) {
    console.log("logging stop");
    clearInterval(intervalId);
    intervalId = null;
  }
}

function saveData(data) {
  const jsonData = JSON.stringify(data, null, 2);
  const filePath = path.resolve(__dirname, 'data.json');

  console.log(`Attempting to save file at: ${filePath}`);

  fs.writeFile(filePath, jsonData, 'utf8', (err) => {
      if (err) {
          console.error("An error occurred while writing JSON to file", err);
      } else {
          console.log("JSON file has been saved.");
      }
  });
}

module.exports = { runGsApi, stopGsApi };