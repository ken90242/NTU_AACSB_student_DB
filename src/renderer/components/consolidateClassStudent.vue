<template>
  <div id="wrapper">
    <kanban :activeIndex="conActiveIndex"></kanban>
    <section 
      v-loading.lock="fullscreenLoading"
      element-loading-text="預計耗時數分鐘....請耐心等候">
      <div
        style="display:flex;align-items:center;justify-content:flex-start;width:60%;margin-bottom:10px;">
        <el-input
          type="textarea"
          :rows="4"
          placeholder="請貼上學號列表"
          v-model="pasteSids">
        </el-input>
        <section>
          <div style="margin:10px;">
            <el-button type="primary" @click="addPasteSids">添加(增加新學號在下方"已選取學號"的清單中)</el-button>
          </div>
          <div style="margin:10px;">
            <el-button type="danger" @click="replacePasteSids">覆蓋(取代下方的"已選取學號"的清單)</el-button>
          </div>
        </section>
      </div>
      <div style="display:flex;align-items:center;justify-content:flex-start;">
        <el-transfer
          filterable
          :titles="['未選取學號', '已選取學號']"
          :filter-method="filterMethod"
          filter-placeholder="請輸入學號"
          v-model="value2"
          :data="data2">
        </el-transfer>
        <div style="margin:30px;">
          <el-button @click="createReport">匯出</el-button>
          <a id="link"></a>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
  import moment from 'moment';
  import kanban from './kanban';
  import path from 'path';
  import Excel from 'exceljs';
  import fs from 'fs';
  import os from 'os';
  import { remote } from 'electron';

  export default {
    name: 'consolidate-class-student',
    mixins: [kanban],
    data() {
      return {
        value2: [12,43,54,611,234,123,54,34,252,542,222,556,124,362,212,331],
        filterMethod(query, item) {
          query = query.toLowerCase();
          return item.sid.toLowerCase().indexOf(query) > -1;
        },
        currentIdx: 0,
        fullscreenLoading: false,
        workbook: null,
        worksheet: null,
        pasteSids: 'R00749006\nR00749004\nR00749007\nR00749003\nR00749009\nR00749008',
      };
    },
    components: { kanban },
    methods: {
      addPasteSids() {
        const leftSids = this.data2.map(obj => obj['sid']);
        
        this.manualPasteSids.forEach((sid) => {
          const idxRes = leftSids.indexOf(sid);
          if (idxRes !== -1 && this.value2.indexOf(idxRes) === -1) {
            this.value2.push(idxRes);
          }
        });
        this.pasteSids = '';
      },
      replacePasteSids() {
        const leftSids = this.data2.map(obj => obj['sid']);

        this.value2 = this.manualPasteSids.map((sid) => leftSids.indexOf(sid));
        this.pasteSids = '';
      },
      initialize_excel() {
        this.currentIdx = 0;
        this.workbook = new Excel.Workbook();
        this.worksheet = this.workbook.addWorksheet('待命名');

        const TopLabels = ['#', '分組', 'Student ID', 'Chinese Name', 'English Name', 'Picture', 'Nationality', 'Age', 'Year of work Experience', 'Last Employment', 'Last Job Title', 'Degree', 'School', 'Major', 'non-NTU Email', 'NTU email']
        this.worksheet.addRow(TopLabels);
      },
      createReport() {
        console.time("createRows");
        this.fullscreenLoading = true;
        this.value2.forEach((idx) => {
          const sid = this.data2[idx].sid;
          this.createSingleRow(sid)
        });
        console.timeEnd("createRows");

        this.changeAllStyle();
        const tempFilePath = path.join(os.tmpdir(), '/excel.xlsx');
        console.time("writeFile");
        this.workbook.xlsx.writeFile(tempFilePath)
        .then(() => {
          const newFilePath = remote.dialog.showSaveDialog({
            defaultPath: `file:\/\/\/${tempFilePath}`,
            filters: [{
              name: 'Excel',
              extensions: ['xlsx'],
            }],
          });
          fs.rename(tempFilePath, newFilePath, (err) => {
            if (err) {
              this.$notify({
                title: '錯誤',
                duration: 0,
                message: err,
                type: 'error',
              });
              throw err;
            }
            this.initialize_excel();
            this.fullscreenLoading = false;
            // console.log('done');
            this.$notify({
              title: '匯出',
              duration: 0,
              message: '匯出作業成功！',
              type: 'success',
            });
            console.timeEnd("writeFile");
          });
          // const link = document.getElementById('link');
          // link.setAttribute('download', '');
          // link.setAttribute('href', `file:\/\/\/${tempFilePath}`);
          // link.click();
        });
      },
      createSingleRow(sid) {
        // pois: [obj['學號'], obj['中文姓名'], obj['英文姓名'], obj['國籍'], obj['出生年月日'], obj['結束服務年'], obj['公司中文名稱1'], obj['職稱1'], obj['入學前畢業學校'], obj['入學前畢業系所'], obj['email'], obj['email2']]

        // excel欄位: ['#', '分組', 'Student ID', 'Name', 'Name', 'Picture', 'Nationality', 'Age', 'Year of work Experience', 'Last Employment', 'Last Job Title', 'Degree', 'School', 'Major', 'non-NTU Email', 'NTU email']

        const currentIdx = this.currentIdx;

        const rowValues = [];
        rowValues[1] = currentIdx + 1; // id
        
        const poi = this.pois[sid];

        // 學號
        rowValues[3] = poi[0];
        
        // 中文姓名
        rowValues[4] = poi[1];
        
        // 英文姓名
        rowValues[5] = poi[2];
        
        // 國籍
        rowValues[7] = poi[3];
        
        // 年齡
        rowValues[8] = poi[4];
        
        // 工作年資
        rowValues[9] = poi[5];
        
        // 公司名稱
        rowValues[10] = poi[6];
        
        // 公司職稱
        rowValues[11] = poi[7];
        
        // 學位
        rowValues[12] = poi[8];
        
        // 學校名稱
        rowValues[13] = poi[9];
        
        // 科系
        rowValues[14] = poi[10];
        
        // non ntu mail
        rowValues[15] = poi[11];
        
        // email
        rowValues[16] = poi[12];

        this.worksheet.addRow(rowValues);

        let pic_paths = []
        let default_img_path = '';

        if (fs.existsSync(path.join(this.profilePicFolder, sid))) {
          pic_paths = fs.readdirSync(path.join(this.profilePicFolder, sid))
            .filter(nm => {
              if (path.basename(nm, path.extname(nm)).toLowerCase() === sid.toLowerCase()) {
                default_img_path = nm;
                return false;
              } else if (['.png', '.gif', '.bmp', '.jpg'].indexOf(path.extname(nm)) !== -1) {
                return true;
              }
            })
            .map(fileName => {
              return path.join(this.profilePicFolder, sid, fileName);
            });
        }
        if (fs.existsSync(path.join(this.profilePicFolder, sid, 'compressed'))) {
          fs.readdirSync(path.join(this.profilePicFolder, sid, 'compressed'))
            .forEach(nm => {
              if (path.basename(nm, path.extname(nm)).toLowerCase() === sid.toLowerCase()) {
                default_img_path = nm;
                return false;
              }
            });
        }
        

        if (default_img_path !== '') {
          default_img_path = path.join(this.profilePicFolder, sid, default_img_path);
          pic_paths.unshift(default_img_path)
        }

        if (pic_paths.length > 0) {
          const imageId = this.workbook.addImage({
            filename: pic_paths[0],
            extension: path.extname(pic_paths[0]).replace('\.', ''),
          });
          const pic_pos = `F${ currentIdx + 2 }:F${ currentIdx + 2 }`
          this.worksheet.addImage(imageId, pic_pos);
        }

        const dobRow = this.worksheet.getRow(`${ currentIdx + 2 }`);
        dobRow.alignment = { vertical: 'middle', horizontal: 'center' };
        dobRow.height = 88;
        dobRow.font = { name: 'Calibri', family: 9, size: 12 };

        this.currentIdx += 1;
      },
      changeAllStyle() {
        const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
        const colSetting = {
          'A': { width: 4 },
          'B': { width: 5.67 },
          'C': { width: 12 },
          'D': { width: 13 },
          'E': { width: 20 },
          'F': { width: 15 },
          'G': { width: 16 },
          'H': { width: 6 },
          'I': { width: 14 },
          'J': { width: 40 },
          'K': { width: 35 },
          'L': { width: 19 },
          'M': { width: 42 },
          'N': { width: 36 },
          'O': { width: 32 },
          'P': { width: 32 },
        };
        labels.forEach((label) => {
          // 改變column的寬度
          this.worksheet.getColumn(label).width = colSetting[label].width;

          // 將每個cell加上border
          for(let rowId = 1; rowId <= this.worksheet.lastRow.number; rowId++ ) {
            const cellId = `${ label }${ rowId }`;
            this.worksheet.getCell(cellId).border = {
              top: { style:'thin' },
              left: { style:'thin' },
              bottom: { style:'thin' },
              right: { style:'thin' },
            };
          }
        });

        // 改變worksheet第一列的樣式
        this.worksheet.getRow(1).font = { name: 'Calibri', family: 9, size: 12, bold: true };
        this.worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        this.worksheet.getRow(1).height = 35;

        // 改變worksheet初始化看到的範圍、凍結視窗
        this.worksheet.views = [
          {state: 'frozen', xSplit: 6, ySplit: 1, topLeftCell: 'G2', activeCell: 'A1'}
        ];
    
      },
    },
    mounted() {
      this.initialize_excel();
    },
    computed: {
      manualPasteSids() {
        const res = this.pasteSids.match(/[r|R]\d{8}/g)
        return res;
      },
      conActiveIndex() {
        return this.$route.params.activeIndex;
      },
      data2() {
        const data = [];
        const sids_names = [];
        const sids = [];
        this.profile.data.forEach((obj, idx) => {
          sids[idx] = obj['學號'];
          sids_names[idx] = obj['學號']+obj['中文姓名']+obj['英文姓名'];
        });
        sids_names.forEach((nm, index) => {
          data.push({
            label: nm,
            key: index,
            sid: sids[index]
          });
        });
        return data;
      },
      poisQuestionnaireVersion() {
        const res = {};

        this.questionnaire.data.forEach((obj) => {
          const sid = obj['NTU_ID'];
          const schoolType_Name = `${ obj['highestSchoolType'] }  / ${ obj['highestSchoolName'] }`;

          res[sid] = [obj['NTU_ID'], obj['Chinese_Name'], obj['English_Name'], obj['Nationality'], obj['Age'], obj['Total_working_years'], obj['Last_employment_company'], obj['Job_title'], obj['highestDegree'], schoolType_Name, obj['highestField'], obj['freq_email']];
        });
        return res;
      },
      pois() {
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //
        // 如果之後要分割檔案("需重新維護進yvonne資料.xlsx")要改掉以下資料的來源
        //  obj['結束服務年'], obj['公司中文名稱1'], obj['職稱1'], obj['email2']
        //  obj['入學前畢業學校'], obj['入學前畢業系所'], obj['email'], 
        //
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        const res = {};
        const questionnaireSIds = Object.keys(this.poisQuestionnaireVersion);
        // 被取代：中文姓名, 英文姓名, 國籍, 結束服務年1, 公司中文名稱1, 職稱1, 學位1, 入學前畢業學校, 入學前畢業系所, email
        const list = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11];
        this.profile.data.forEach((obj) => {
          const sid = obj['學號'];
          const age = moment().diff(moment(obj['出生年月日']), 'years', false)
          const ntuMail = `${sid}@ntu.edu.tw`;
          const total_wk_yr = obj['結束服務年1'] !== '-' ? moment().diff(moment(obj['結束服務年1']), 'years', false) : ''

          res[sid] = [obj['學號'], obj['中文姓名'], obj['英文姓名'], obj['國籍'], age, total_wk_yr, obj['公司中文名稱1'], obj['職稱1'], obj['學位1'], obj['入學前畢業學校'], obj['入學前畢業系所'], obj['email'], ntuMail];

          if (questionnaireSIds.indexOf(sid) !== -1) {
            list.forEach((position) => {
              res[sid][position] = this.poisQuestionnaireVersion[sid][position];
            });
          }
        });

        return res;
      },
    },
  };
</script>
<style>
  #wrapper {
    padding: 60px 80px;
    padding-top: 40px;
    height: 100%;
  }

</style>