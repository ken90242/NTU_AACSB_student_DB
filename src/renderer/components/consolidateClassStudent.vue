<template>
  <div id="wrapper">
    <kanban :activeIndex="activeIndex"></kanban>
    <div 
      style="display:flex;align-items:center;justify-content:space-around"
      v-loading.lock="fullscreenLoading">
      <el-transfer
        filterable
        :titles="['未選取學號', '已選取學號']"
        :filter-method="filterMethod"
        filter-placeholder="請輸入學號"
        v-model="value2"
        :data="data2">
      </el-transfer>
      <div>
        <el-button @click="createReport">製作</el-button>
        <el-button @click="saveFile">匯出</el-button>
        <a id="link"></a>
      </div>
    </div>
  </div>
</template>
<script>
  import moment from 'moment';
  import kanban from './kanban';
  import eventBus from './eventBus';
  import path from 'path';
  import Excel from 'exceljs';
  import fs from 'fs';
  import os from 'os';

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('待命名');

  const TopLabels = ['#', '分組', 'Student ID', 'Name', 'Name', 'Picture', 'Nationality', 'Age', 'Year of work Experience', 'Last Employment', 'Last Job Title', 'Degree', 'School', 'Major', 'non-NTU Email', 'NTU email']
  worksheet.addRow(TopLabels);

  export default {
    name: 'consolidate-class-student',
    data() {
      return {
        value2: [],
        filterMethod(query, item) {
          query = query.toLowerCase();
          return item.sid.toLowerCase().indexOf(query) > -1;
        },
        bus: eventBus,
        currentIdx: 0,
        fullscreenLoading: false,
      };
    },
    components: { kanban },
    methods: {
      saveFile() {
        this.changeAllStyle();
        const tempFilePath = path.join(os.tmpdir(), '/report.xlsx');
        this.fullscreenLoading = true;
        if (fs.existsSync(tempFilePath)) {
          const link = document.getElementById('link');
          link.setAttribute('download', 'excel.xlsx');
          link.setAttribute('href', `file:\/\/\/${tempFilePath}`);
          link.click();
          this.fullscreenLoading = false;
          console.log('done');
        } else {
          workbook.xlsx.writeFile(tempFilePath)
          .then(() => {
            const link = document.getElementById('link');
            link.setAttribute('download', 'excel.xlsx');
            link.setAttribute('href', `file:\/\/\/${tempFilePath}`);
            link.click();
            this.fullscreenLoading = false;
            console.log('done');
          });
        }
      },
      createReport() {
        this.fullscreenLoading = true;
        this.value2.forEach((idx) => {
          const sid = this.data2[idx].sid;
          this.createSingleRow(sid)
        });
        this.$notify({
          title: '成功',
          message: '製作完成！',
          type: 'success',
          duration: 15000,
        });
        this.fullscreenLoading = false;
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
        const birth = poi[4];
        rowValues[8] = moment().diff(moment(birth), 'years', false);
        
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

        worksheet.addRow(rowValues);

        // !!!!!!!!這邊學號要改變
        sid = 'R06725053';
        const pic_paths = fs.readdirSync(path.join(this.bus.profilePicFolder, sid)).map(fileName => {
          return path.join(this.bus.profilePicFolder, sid, fileName);
        });
        
        if (pic_paths.length > 0) {
          const imageId = workbook.addImage({
            filename: pic_paths[0],
            extension: path.extname(pic_paths[0]).replace('\.', ''),
          });
          const pic_pos = `F${ currentIdx + 2 }:F${ currentIdx + 2 }`
          worksheet.addImage(imageId, pic_pos);
        }

        const dobRow = worksheet.getRow(`${ currentIdx + 2 }`);
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
          'K': { width: 30 },
          'L': { width: 19 },
          'M': { width: 40 },
          'N': { width: 36 },
          'O': { width: 32 },
          'P': { width: 32 },
        };
        labels.forEach((label) => {
          // 改變column的寬度
          worksheet.getColumn(label).width = colSetting[label].width;

          // 將每個cell加上border
          for(let rowId = 1; rowId <= worksheet.lastRow.number; rowId++ ) {
            const cellId = `${ label }${ rowId }`;
            worksheet.getCell(cellId).border = {
              top: { style:'thin' },
              left: { style:'thin' },
              bottom: { style:'thin' },
              right: { style:'thin' },
            };
          }
        });

        // 改變worksheet第一列的樣式
        worksheet.getRow(1).font = { name: 'Calibri', family: 9, size: 12, bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 35;

        // 改變worksheet初始化看到的範圍、凍結視窗
        worksheet.views = [
          {state: 'frozen', xSplit: 6, ySplit: 1, topLeftCell: 'G2', activeCell: 'A1'}
        ];
    
      },
    },
    mounted() {
      // console.log(this.bus.profile.head)
      
    },
    computed: {
      activeIndex() {
        return this.$route.params.activeIndex;
      },
      data2() {
        const data = [];
        const sids_names = [];
        const sids = [];
        this.bus.profile.data.forEach((obj, idx) => {
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
      pois() {
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //
        // 如果之後要分割檔案("需重新維護進yvonne資料.xlsx")要改掉以下資料的來源
        //  obj['結束服務年'], obj['公司中文名稱1'], obj['職稱1'], obj['email2']
        //  obj['入學前畢業學校'], obj['入學前畢業系所'], obj['email'], 
        //
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        const res = {};
        this.bus.profile.data.forEach((obj) => {
          const sid = obj['學號'];
          res[sid] = [obj['學號'], obj['中文姓名'], obj['英文姓名'], obj['國籍'], obj['出生年月日'], obj['結束服務年1'], obj['公司中文名稱1'], obj['職稱1'], obj['學位1'], obj['入學前畢業學校'], obj['入學前畢業系所'], obj['email'], obj['email2']];
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