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
    <div class="chartWrapper">
      <pie-chart
        :chart-data="datacollection['sexRatio']"
        :options="{ responsive: false, maintainAspectRatio: false }">
      </pie-chart>
    </div>
    平均年齡：{{ datacollection.ageAverage }}
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
          labels: ['January', 'February'],
          datasets: [{
            label: 'Data One',
            backgroundColor: '#f87979',
            data: [40, 20],
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