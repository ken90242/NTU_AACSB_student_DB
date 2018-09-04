<template>
  <div id="wrapper">
    <kanban :activeIndex="activeIndex"></kanban>
    <div class="functionWrapper">
      <el-form :inline="true" class="demo-form-inline">
        <a id="link"></a>
        <el-form-item>
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange">
            全選
          </el-checkbox>
          <el-checkbox-group v-model="selectYear" @change="handleCheckedYearChange">
            <el-checkbox v-for="yr in bus.enrollYears" :label="yr" name="type"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button @click="saveImg">Download</el-button>
        </el-form-item>
      </el-form>
    </div>
    平均年齡：{{ datacollection.ageAverage }}
    <div class="chartWrapper">
      <pie-chart
        :chart-data="datacollection['sexRatio']"
        :options="{ responsive: false, maintainAspectRatio: false }">
      </pie-chart>
    </div>
    <div class="chartWrapper">
      <pie-chart
        :chart-data="datacollection['majorRatio']"
        :options="{ responsive: false, maintainAspectRatio: false }">
      </pie-chart>
    </div>
    <div class="chartWrapper">
      <pie-chart
        :chart-data="datacollection['educationRatio']"
        :options="{ responsive: false, maintainAspectRatio: false }">
      </pie-chart>
    </div>
    <div class="chartWrapper">
      <pie-chart
        :chart-data="datacollection['workFieldRatio']"
        :options="{ responsive: false, maintainAspectRatio: false }">
      </pie-chart>
    </div>
  </div>
</template>
<script>
  import moment from 'moment';
  import kanban from './kanban';
  import eventBus from './eventBus';
  import PieChart from './PieChart.js';

  export default {
    name: 'statistic-art',
    data() {
      return {
        bus: eventBus,
        checkAll: false,
        isIndeterminate: false,
        selectYear: [],
        datacollection: {
          sexRatio: {},
        },
      };
    },
    components: { PieChart, kanban },
    methods: {
      handleCheckAllChange(val) {
        this.selectYear = val ? this.bus.enrollYears : [];
        this.isIndeterminate = false;
        this.updateData();
      },
      handleCheckedYearChange(value) {
        const checkedCount = value.length;
        this.checkAll = checkedCount === this.bus.enrollYears.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.bus.enrollYears.length;
        this.updateData();
      },
      updateData() {
        // 性別比例
        this.datacollection.sexRatio = {
          labels: ['Male', 'Female'],
          datasets: [{
            label: 'Data One',
            backgroundColor: '#f87979',
            data: this.totalMF,
          }],
        };

        const majorLabels = Object.keys(this.major);
        this.datacollection.majorRatio = {
          labels: majorLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: '#f87979',
            data: majorLabels.map(l => this.major[l]),
          }],
        };

        const educationLabels = Object.keys(this.education);
        this.datacollection.educationRatio = {
          labels: educationLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: '#f87979',
            data: educationLabels.map(l => this.education[l]),
          }],
        };

        const workFieldLabels = Object.keys(this.workField);
        console.log(workFieldLabels);
        this.datacollection.workFieldRatio = {
          labels: workFieldLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: '#f87979',
            data: workFieldLabels.map(l => this.workField[l]),
          }],
        };

        // 平均年齡
        let totalNum = 0;
        this.datacollection.ageAverage = (this.bus.profile.data.reduce((acc, currRow) => {
          if (this.selectYear.indexOf(currRow.enrollYear) === -1) {
            return acc;
          }
          const birth = currRow['出生年月日'];
          const age = moment().diff(moment(birth), 'years', false);
          totalNum += 1;
          return acc + age;
        }, 0) / totalNum).toFixed(2);

        // 平均工作年資
        // 最高學歷分佈
        // 學歷專業項目
        // 目前工作產業別
        // 國籍之洲別分佈
      },
      saveImg() {
        const canvas = document.getElementById('line-chart');
        const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');

        const link = document.getElementById('link');
        link.setAttribute('download', 'image.png');
        link.setAttribute('href', image);
        link.click();
      },
    },
    mounted() {
      this.checkAll = true;
      this.selectYear = this.bus.enrollYears;

      this.updateData();
    },
    computed: {
      totalMF() {
        console.log(this.bus.profile);
        let m = 0;
        let f = 0;
        this.bus.profile.data.forEach((curV) => {
          if (this.selectYear.indexOf(curV.enrollYear) !== -1) {
            switch (curV['性別']) {
              case 'M':
                m += 1;
                break;
              case 'F':
                f += 1;
                break;
              default:
            }
          }
        });
        return [m, f];
      },
      major() {
        const res = {};
        this.bus.profile.data.forEach((curV) => {
          if (this.selectYear.indexOf(curV.enrollYear) !== -1) {
            const label = curV['主修1'];
            if (label !== '-' && label !== undefined) {
              res[label] = res[label] ? res[label] + 1 : 1;
            }
          }
        });
        return res;
      },
      education() {
        const res = {};
        this.bus.profile.data.forEach((curV) => {
          if (this.selectYear.indexOf(curV.enrollYear) !== -1) {
            const label = curV['學位1'];
            if (label !== '-' && label !== undefined) {
              res[label] = res[label] ? res[label] + 1 : 1;
            }
          }
        });
        return res;
      },
      workField() {
        const res = {};
        this.bus.profile.data.forEach((curV) => {
          if (this.selectYear.indexOf(curV.enrollYear) !== -1) {
            const label = curV['公司行業別'];
            if (label !== '-' && label !== undefined) {
              res[label] = res[label] ? res[label] + 1 : 1;
            }
          }
        });
        return res;
      },
      activeIndex() {
        return this.$route.params.activeIndex;
      },
      charType() {
        return this.$route.params.chart;
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

  .chartWrapper {
    display: flex;
    justify-content: center;
  }

  .functionWrapper {
    display: flex;
    justify-content: center; 
  }
</style>