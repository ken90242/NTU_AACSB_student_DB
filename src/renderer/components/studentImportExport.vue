<template>
  <div id="wrapper">
    <kanban :activeIndex="conActiveIndex"></kanban>
    <section class="sectionWrapper">
      <div>
        <h2>(1) 畢業人數簡表</h2>
        <font color="blue">左方為入學年，上方為畢業/退學/休學年</font>
        <el-table
          :data="graduate_table"
          style="width: 100%">
          <el-table-column
            prop="#"
            label=""
            :width="50">
          </el-table-column>
          <el-table-column
            v-for="col in columns"
            :label="col"
            :prop="col"
            :width="50">
          </el-table-column>
        </el-table>
      </div>
      <br/>
      <div>
        <h2>(2) 休學人數簡表</h2>
        <font color="blue">
        皆為學年制，9~1月為第一學期，2~8月為第二學期
        <br/>
        ex:
        <br/>
        1021 -> 101學年度，第一學期
        <br/>
        1027 -> 101學年度，第二學期
        <br/>
        1028 -> 102學年度，第一學期
        </font>
        <el-table
          :data="suspension_table"
          style="width: 100%">
          <el-table-column
            prop="#"
            label=""
            :width="50">
          </el-table-column>
          <el-table-column
            v-for="col in columns"
            :label="col"
            :prop="col"
            :width="50">
          </el-table-column>
        </el-table>
      </div>
      <br/>
      <div>
        <h2>(3) 退學人數簡表</h2>
        <font color="blue">
          先由註冊組表格中的異動碼來判別：G畢業、O退學、B休學
          <br/><br/>
          畢業&退學從"異動學期"欄位來紀錄時間
          <br/><br/>
          休學則由"第N次休學"紀錄時間
        </font>
        <el-table
          :data="dropout_table"
          style="width: 100%">
          <el-table-column
            prop="#"
            label=""
            :width="50">
          </el-table-column>
          <el-table-column
            v-for="col in columns"
            :label="col"
            :prop="col"
            :width="50">
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>
<script>
  import moment from 'moment';
  import kanban from './kanban';
  import path from 'path';
  import { remote } from 'electron';

  export default {
    name: 'student-import-export',
    mixins: [kanban],
    data() {
      return {
        
      };
    },
    components: { kanban },
    methods: {
      getSchoolSemester(grad_year, grad_month) {
        // 民國年
        let school_yr = ''
        let grad_semester = ''
        if (grad_month < 2) {
          school_yr =  grad_year - 1
          grad_semester = '1'
        } else if (grad_month < 8) {
          school_yr =  grad_year - 1
          grad_semester = '2'
        } else {
          school_yr = grad_year
          grad_semester = '1'
        }
        // return school_yr + grad_semester
        return school_yr + grad_semester
      },
      schoolSteps(row) { // 在學狀態
        const steps = [];
        const seq = ['一', '二', '三', '四', '五', '六', '七', '八'];

        steps.push({
          // date: row.enrollYear + '年度',
          date: row.enrollYear,
          state: '入學',
        });
  
        seq.forEach((w) => {
          const label1 = `第${w}次休學`;

          if (row[label1].trim() !== '-' && row[label1].trim() !== '') {
            steps.push({
              date: row[label1],
              state: '休學',
            });
          }
        });
        let school_semester = ''
        switch (row['異動碼']) {
          case 'G':
            const grad_month = parseInt(row['畢業年月'].slice(3), 10);
            const grad_year = parseInt(row['畢業年月'].slice(0,3), 10);
            school_semester = this.getSchoolSemester(grad_year, grad_month);
            
            steps.push({
              // date:  school_semester + '(' + grad_year + '年' + grad_month + '月)',
              date:  school_semester,
              state: '畢業',
            });
            break;
          case 'O':
            steps.push({
              date: parseInt(row['異動學期']).toString(),
              state: '退學',
            });
            break;
          case 'B':
            break;
          default:
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear() - 1911;
            school_semester = this.getSchoolSemester(year, month);
            steps.push({
              // date: school_semester + '(' + year + '年' + month + '月)',
              date: school_semester,
              state: '在學',
            });
        }
        // 第一個是9 -> 取前兩個數字 //第一個是1 -> 取前三個
        if (steps[steps.length-1]['date'][0] === '1' ) {
          steps[steps.length-1]['date'] = steps[steps.length-1]['date'].substring(0, 3)
        } else if (steps[steps.length-1]['date'][0] === '9' ) {
          steps[steps.length-1]['date'] = steps[steps.length-1]['date'].substring(0, 2)
        }

        const last = steps.length-1
        return {'category': steps[last]['state'], 'start': steps[0]['date'], 'end': steps[last]['date']};
      },
    },
    computed: {
      columns() {
        return Array.from({length: this.lastest_gradYear + 1 - this.earliest_gradYear }, (v, k) => (k + this.earliest_gradYear).toString())
      },
      all_groups () {
        const { profile, schoolSteps } = this;
        return profile.data.map((v) => { 
          return schoolSteps(v);
        });
      },
      graduate_table() {
        const import_students = this.columns.map(v => {
          const obj = { '#': v };
          this.columns.forEach(col => {
            obj[col] = 0;
          })
          return obj;
        });


        this.all_groups.filter(v => {
          return v['category'] === '畢業';
        }).forEach(v => {
          const import_student = import_students[this.columns.indexOf(v['start'])]
          import_student[v['end']] += 1;
        });

        return import_students;
      },
      suspension_table() {
        const import_students = this.columns.map(v => {
          const obj = { '#': v };
          this.columns.forEach(col => {
            obj[col] = 0;
          })
          return obj;
        });


        this.all_groups.filter(v => {
          return v['category'] === '休學';
        }).forEach(v => {
          const import_student = import_students[this.columns.indexOf(v['start'])]
          import_student[v['end']] += 1;
        });

        return import_students;
      },
      dropout_table() {
        const import_students = this.columns.map(v => {
          const obj = { '#': v };
          this.columns.forEach(col => {
            obj[col] = 0;
          })
          return obj;
        });


        this.all_groups.filter(v => {
          return v['category'] === '退學';
        }).forEach(v => {
          const import_student = import_students[this.columns.indexOf(v['start'])]
          import_student[v['end']] += 1;
        });

        return import_students;
      },
      earliest_gradYear() {
        return 95;
      },
      lastest_gradYear() {
        return moment().year() - 1911;
      },
      conActiveIndex() {
        return this.$route.params.activeIndex;
      },
    },
  };
</script>
<style>
  .sectionWrapper {
    /*display:flex;
    width: 100%;*/
  }
  #wrapper {
    padding: 60px 80px;
    padding-top: 40px;
    height: 100%;
  }

</style>