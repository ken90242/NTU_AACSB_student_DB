import Vue from 'vue';
import path from 'path';
import XLSX from 'xlsx';
import moment from 'moment';
import fs from 'fs';
import { remote } from 'electron';
import StoreConfig from '../../storeConfig.js'

function getExcelContent2List(xlsxPath) {
  try {
    const filledUpFields = function filledUpFields(rowData, keys) {
      Object.entries(keys).forEach(([, label]) => { // [symbol, label]
        rowData[label] = rowData[label] || '-';
      });
      return rowData;
    };

    const workbook = XLSX.readFile(xlsxPath);
    const sheetNameList = workbook.SheetNames;

    let currentSheetRes = {};
    const multiSheetsRes = {};

    /* iterate through sheets */
    sheetNameList.forEach((sheetname) => {
      const totalDataFields = [];
      const totalHeadFields = [];
      const worksheet = workbook.Sheets[sheetname];
      const keys = {};
      const re = new RegExp('(\\D+)(\\d+)');
      const symbols_arr = [];

      let lastSymbol = null;
      let rowData = {};

      Object.keys(worksheet)
        /* 带!的属性（比如!ref）是表格的特殊属性，用来输出表格的信息，不是表格的内容，所以去掉 */
        .forEach((z) => {
          // symbol為第column ID(A,B,...), seq為第幾列
          // [source, symbol, seq, ...]
          if (z[0] !== '!') {
            const [, symbol, seq] = re.exec(z);
            const cellVal = worksheet[z].v.toString().trim();

            // 把標頭取下
            if (seq === '1') {
              keys[symbol] = cellVal;
              totalHeadFields.push(cellVal);
              symbols_arr.push(symbol); // 在第一列上一直更新，找最後一個column symbol, ex: A, B, ...
            } else {
              const label = keys[symbol];
              // 換行，column id = 'A', 同時避免初始化rowData還沒資料的問題
              if (sheetname == 'gmba學籍資料_1220' && seq == 613) {
                // console.log(cellVal, symbol)
                // console.log(rowData)
              }
              if (sheetname == 'courses') {
                // console.log(cellVal, symbol)
                // console.log(rowData)
              }

              if (lastSymbol !== null &&
                  symbols_arr.indexOf(symbol) <= symbols_arr.indexOf(lastSymbol) &&
                  seq >= 2) {
                totalDataFields.push(filledUpFields(rowData, keys));
                rowData = {};
              }
              rowData[label] = cellVal;
              lastSymbol = symbol;
            }
          }
        });
      // 補上最後一個row的資料，並清空
      totalDataFields.push(filledUpFields(rowData, keys));
      rowData = {};

      currentSheetRes = {
        head: totalHeadFields,
        data: totalDataFields,
        excel_path: xlsxPath,
      };
      multiSheetsRes[sheetname] = currentSheetRes;
    });
  
    if (Object.keys(multiSheetsRes).length === 1) {
      // basic_infos, course_standatd
      return currentSheetRes;
    }
    console.log(xlsxPath)
    // graduate_standard 
    multiSheetsRes.excel_path = xlsxPath;
    return multiSheetsRes;
  } catch(e) {
    throw e;
  }
}

function profileDataProcess(rawData, public_file_path) {
  rawData.data = rawData.data.map((row) => {

    // EXCEL表格從1899開始計算
    const valDiff = moment('1899-12-30').add(parseInt(row['出生年月日'], 10), 'day');
    row['出生年月日'] = moment(valDiff).format('YYYY/MM/DD');
    row['年齡'] = moment().diff(row['出生年月日'], 'years');

    // EXCEL預設年齡為118歲
    if(row['年齡'] > 117) {
      row['出生年月日'] = '-';
      row['年齡'] = undefined;
    }

    const detectRawYear = row['學號'].match(/\w(\d{2})\d+/);
    if (detectRawYear) {
      const rawYear = detectRawYear[1];
      const processedYear = parseInt(rawYear, 10) < 94 ? `1${rawYear}`.toString() : rawYear.toString();
      row.enrollYear = processedYear;
    }
    return row;
  });

  const artificialMaintain = getExcelContent2List(path.join(public_file_path, '/excels/需重新維護進yvonne資料.xlsx'));
  console.log(path.join(public_file_path, '/excels/需重新維護進yvonne資料.xlsx'));
  // console.log(path.join(remote.app.getAppPath(), '../../../../', 'usable.xlsx'))
  console.log(artificialMaintain);
  // combined data
  artificialMaintain.head.forEach((v) => {
    if (rawData.head.indexOf(v) === -1) {
      rawData.head.push(v);
    }
  });
  artificialMaintain.data.forEach((v) => {
    rawData.data.forEach((w) => {
      if (w['學號'] === v['學號']) {
        v = Object.assign(w, v);
      }
    });
    return v;
  });

  return rawData;
}

const storeConfig = new StoreConfig({ configName: 'user-setting', });

const default_public_file_path = storeConfig.get('production_path') && fs.existsSync(storeConfig.get('production_path')) ?
  storeConfig.get('production_path') : path.join(__static, 'initialize_public');
  // production_path : path.join(__static, 'initialize_public');

const state = {
  profile: null,
  course: null,
  council: null,
  papers: null,
  questionnaire: null,
  graduateStandard: null,
  shareDataExisted: false,
  public_file_path: null,
  enrollYears: null,
  profilePicFolder: null,
  loadExcelDate: 0,
  isSyncingData: false,
};

const mutations = {
  loadData(state, { dataName, excel_where }) {
    if(dataName === 'graduate_standard') {
      state['graduateStandard'] = getExcelContent2List(excel_where);
    } else if (dataName === 'profile') {
      state[dataName] = profileDataProcess(getExcelContent2List(excel_where), state.public_file_path);
      // updateEnrollYears
      const years = state.profile.data.map(row => row.enrollYear);
      state.enrollYears = [...new Set(years)].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    } else if (dataName === 'questionnaire') {
      state[dataName] = getExcelContent2List(excel_where);
      state[dataName].data = state[dataName].data.map((v) => {
        const detectRawYear = v['NTU_ID'].match(/\w(\d{2})\d+/);
        if (detectRawYear) {
          const rawYear = detectRawYear[1];
          const processedYear = parseInt(rawYear, 10) < 94 ? `1${rawYear}`.toString() : rawYear.toString();
          v.enrollYear = processedYear;
        } else {
          throw 'questionnaire detectRawYear doesnt exist'
        }
        return v;
      });
    } else {
      state[dataName] = getExcelContent2List(excel_where);
    }
    state.loadExcelDate = moment.now();
  },
  updateShareDataStatus(state) {
    const p = storeConfig.get('production_path');
    const dirLs = fs.readdirSync(p);

    const parentFolderExist = ['excels', 'profile_pics'].every((dir) => dirLs.indexOf(dir) !== -1)
    const childernDataExist = dirLs.filter(v => v === 'excels' ).map((v) => {
      return fs.readdirSync(path.join(default_public_file_path, v));
    }).reduce((acc, list) => { 
      return acc || 
        ['basic_info.xlsx', 'course_record.xlsx', 'graduate_standard.xlsx', 'papers.xlsx', 'student_council.xlsx', 'yvonne_questionnaire.xlsx'].every((v) => list.indexOf(v) !== -1);
    }, false);

    state.shareDataExisted = p && fs.existsSync(p) && parentFolderExist && childernDataExist;
  },
  updatePublicFilePath(state) {
    const public_file_path = state.shareDataExisted ? default_public_file_path : path.join(__static, 'initialize_public');

    state.public_file_path = public_file_path;
    state.profilePicFolder = path.join(public_file_path, 'profile_pics/')
  },
  chgSyncingData(state, { status }) {
    state.isSyncingData = status;
  }
};

const actions = {
  initialLoadData({ commit }) {
    const excel_pos = {
      'profile': '/excels/basic_info.xlsx',
      'course': '/excels/course_record.xlsx',
      'council': '/excels/student_council.xlsx',
      'papers': '/excels/papers.xlsx',
      'questionnaire': '/excels/yvonne_questionnaire.xlsx',
      'graduate_standard': '/excels/graduate_standard.xlsx',
    };

    ['profile', 'course', 'council', 'papers', 'questionnaire', 'graduate_standard'].forEach((dataName) => {
      commit('loadData', { dataName, excel_where: path.join(state.public_file_path, excel_pos[dataName]) });
    })
  },
};

export default {
  state,
  mutations,
  actions,
};
