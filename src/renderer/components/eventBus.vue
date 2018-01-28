<script>
  import Vue from 'vue';
  import path from 'path';
  import XLSX from 'xlsx';
  import moment from 'moment';
  import { remote } from 'electron';

  function getExcelContent2List(xlsxPath) {
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
      let rowData = {};
      const re = new RegExp('(\\D+)(\\d+)');

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
            } else {
              const label = keys[symbol];
              // 換行，column id = 'A', 同時避免初始化rowData還沒資料的問題
              if (symbol === 'A' && seq > 2) {
                totalDataFields.push(filledUpFields(rowData, keys));
                rowData = {};
              }
              rowData[label] = cellVal;
            }
          }
        });

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
  
    // graduate_standard
    multiSheetsRes.excel_path = xlsxPath;
    return multiSheetsRes;
  }
  const bus = new Vue({
    computed: {
      profile() {
        const rawData = getExcelContent2List(path.join(remote.app.getAppPath(), '../../../../', 'basic_info.xlsx'));
        rawData.data = rawData.data.map((row) => {
          const valDiff = moment('1899-12-30').add(parseInt(row['出生年月日'], 10), 'day');
          row['出生年月日'] = moment(valDiff).format('YYYY/MM/DD');

          const rawYear = row['學號'].match(/\w(\d{2})\d+/)[1];
          const processedYear = parseInt(rawYear, 10) < 94 ? `1${rawYear}`.toString() : rawYear.toString();
          row.enrollYear = processedYear;

          return row;
        });

        return rawData;
      },
      course() {
        return getExcelContent2List(path.join(remote.app.getAppPath(), '../../../../', 'course_record.xlsx'));
      },
      graduateStandard() {
        return getExcelContent2List(path.join(remote.app.getAppPath(), '../../../../', 'graduate_standard.xlsx'));
      },
      enrollYears() {
        const years = this.profile.data.map(row => row.enrollYear);

        return [...new Set(years)].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      },
    },
  });


  // 定義 Vue prototype 的 $bus 屬性存取描述器(Accessor descriptor)
  // 方便 event bus 被任何子元件使用
  Object.defineProperty(Vue.prototype, '$bus', {
    get() {
      return this.$root.bus;
    },
  });

  export default bus;
</script>