<template>
  <div id="wrapper">
    <kanban :activeIndex="activeIndex"></kanban>
    <a id="link"></a>
    <div class="left-mainConsole">
      <el-popover
        placement="right"
        trigger="hover"
        content="更換隨機顏色">
        <el-button
          type="primary"
          icon="el-icon-refresh"
          size="small"
          style="margin-left: 0px;"
          slot="reference"
          @click="changeRandomColorSeed"
          round>
        </el-button>
      </el-popover>
      <hr style="margin-top:20px;margin-bottom:20px;opacity:.8;"/>
      <el-popover
        placement="right"
        trigger="hover"
        content="匯出全部圖表">
        <el-button
          type="danger"
          icon="el-icon-download"
          size="small"
          style="margin-left: 0px;"
          slot="reference"
          round>
        </el-button>
      </el-popover>
      <hr style="margin-top:20px;margin-bottom:20px;opacity:.8;"/>
      <el-checkbox
        :indeterminate="isIndeterminate"
        v-model="checkAll"
        @change="handleCheckAllChange"
        style="margin-bottom: 8px;">
        全選
      </el-checkbox>
      <el-checkbox-group v-model="selectYear" @change="handleCheckedYearChange">
        <el-checkbox v-for="yr in bus.enrollYears" :label="yr" name="type"></el-checkbox>
      </el-checkbox-group>
    </div>
    <el-collapse v-model="activeNames" style="margin-left:30px">
      <el-collapse-item title="A. 性別分析" name="1">
        <div class="chartWrapper">
          <div style="width:30%; margin: 10px;">
            <el-table
              :data="totalMF.map((v, idx) => {
                return (idx === 0) ? 
                  { 'label': 'Male',
                    'number': v, 
                    'percentage': (v * 100 / totalMF.reduce((acc, v) => acc + v)).toFixed(1),
                  }
                  :
                  { 'label': 'Female',
                    'number': v,
                    'percentage': (v * 100 / totalMF.reduce((acc, v) => acc + v)).toFixed(1),
                  };
              })"
              :border="true"
              :highlight-current-row="false"
              :show-summary="true"
              sum-text="總計">
              <el-table-column
                prop="label"
                label="性別">
              </el-table-column>
              <el-table-column
                prop="number"
                label="人數">
              </el-table-column>
              <el-table-column
                prop="percentage"
                label="百分比">
                <template slot-scope="scope">
                  {{ scope.row.percentage }}%
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div style="text-align:center;">
            <pie-chart
              id="sex-chart"
              :chart-data="datacollection['sexRatio']"
              :options="{ responsive: false, maintainAspectRatio: false }">
            </pie-chart>
            <el-button type="danger" plain round @click="saveImg('sex-chart')" style="margin:10px">Download</el-button>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="B. 年齡分布" name="2">
        <div class="chartWrapper">
          <div style="width:30%; margin: 10px;">
            <el-table
              :data="Object.keys(age).map((v) => {
                return { 'label': v, 'number': age[v], 'percentage':
                    (age[v] * 100 / Object.keys(age).reduce((acc, v) => acc + age[v], 0)).toFixed(1),};
              })"
              :border="true"
              :highlight-current-row="false"
              :show-summary="true"
              sum-text="總計">
              <el-table-column
                prop="label"
                label="年齡分佈">
              </el-table-column>
              <el-table-column
                prop="number"
                label="人數">
              </el-table-column>
              <el-table-column
                prop="percentage"
                label="百分比">
                <template slot-scope="scope">
                  {{ scope.row.percentage }}%
                </template>
              </el-table-column>
            </el-table>
            <el-card>
              平均年齡：{{ datacollection.ageAverage }}
            </el-card>
          </div>
          <div style="text-align:center;">
            <pie-chart
              id="age-chart"
              :chart-data="datacollection['age']"
              :options="{ responsive: false, maintainAspectRatio: false }">
            </pie-chart>
            <el-button type="danger" plain round @click="saveImg('age-chart')" style="margin:10px">Download</el-button>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="C. 學歷分布" name="3">
        <div class="chartWrapper">
          <div style="width:25%;margin:10px">
            <el-table
              :data="Object.keys(education).map((v) => {
                return { 
                  'label': v,
                  'number': education[v],
                  'percentage':
                    (education[v] * 100 / Object.keys(education).reduce((acc, v) => acc + education[v], 0)).toFixed(1),
                };
              })"
              :border="true"
              :highlight-current-row="false"
              :show-summary="true"
              sum-text="總計">
              <el-table-column
                prop="label"
                label="學歷">
              </el-table-column>
              <el-table-column
                prop="number"
                label="人數"
                width="50px">
              </el-table-column>
              <el-table-column
                prop="percentage"
                label="百分比"
                width="80px">
                <template slot-scope="scope">
                  {{ scope.row.percentage }}%
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div style="text-align:center;">
            <pie-chart
              id="education-chart"
              :chart-data="datacollection['educationRatio']"
              :options="{ responsive: false, maintainAspectRatio: false }">
            </pie-chart>
            <el-button type="danger" plain round @click="saveImg('education-chart')" style="margin:10px">Download</el-button>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="D. 過去最高學歷背景分析" name="4">
        <div class="chartWrapper">
          <div style="width:40%;margin:10px">
            <el-table
              :data="Object.keys(major).map((v) => {
                return { 'label': v, 'number': major[v], 'percentage':
                    (major[v] * 100 / Object.keys(major).reduce((acc, v) => acc + major[v], 0)).toFixed(1),};
              })"
              :border="true"
              :highlight-current-row="false"
              :show-summary="true"
              sum-text="總計">
              <el-table-column
                prop="label"
                label="科系">
              </el-table-column>
              <el-table-column
                prop="number"
                label="人數"
                width="50px">
              </el-table-column>
              <el-table-column
                prop="percentage"
                label="百分比"
                width="80px">
                <template slot-scope="scope">
                  {{ scope.row.percentage }}%
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div style="text-align:center;">
            <pie-chart
              id="major-chart"
              :chart-data="datacollection['majorRatio']"
              :options="{ responsive: false, maintainAspectRatio: false }">
            </pie-chart>
            <el-button type="danger" plain round @click="saveImg('major-chart')" style="margin:10px">Download</el-button>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="E. 工作年資分佈" name="5">
        <div class="chartWrapper">
          <pie-chart
            class="person-chart"
            :chart-data="datacollection['workFieldRatio']"
            :options="{ responsive: false, maintainAspectRatio: false }">
          </pie-chart>
        </div>
      </el-collapse-item>
      <el-collapse-item title="F. 產業別" name="6">
        <div class="chartWrapper">
          <pie-chart
            class="person-chart"
            :chart-data="datacollection['workFieldRatio']"
            :options="{ responsive: false, maintainAspectRatio: false }">
          </pie-chart>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
  import moment from 'moment';
  import kanban from './kanban';
  import eventBus from './eventBus';
  import PieChart from './PieChart.js';
  import randomColor from 'randomcolor';

  export default {
    name: 'statistic-art',
    data() {
      return {
        colorRandomSeed: 15,//1352388, 8215343, 11069834, 18948486, 17332352, 18927824
        activeNames: ['1', '2', '3'],
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
      changeRandomColorSeed() {
        this.colorRandomSeed = Math.floor(Math.random() * Math.floor(20000000));
        console.log(this.colorRandomSeed)
        this.updateData();
      },
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
        const { colorRandomSeed } = this;
        // 性別比例
        this.datacollection.sexRatio = {
          labels: ['Male', 'Female'],
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: 2, luminosity: 'bright', }),//#f87979
            data: this.totalMF,
          }],
        };

        const majorLabels = Object.keys(this.major);
        this.datacollection.majorRatio = {
          labels: majorLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: majorLabels.length, luminosity: 'bright', }),
            data: majorLabels.map(l => this.major[l]),
          }],
        };

        const educationLabels = Object.keys(this.education);
        this.datacollection.educationRatio = {
          labels: educationLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: educationLabels.length, luminosity: 'bright', }),
            data: educationLabels.map(l => this.education[l]),
          }],
        };

        const workFieldLabels = Object.keys(this.workField);
        console.log(this.workField);
        this.datacollection.workFieldRatio = {
          labels: workFieldLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: workFieldLabels.length, luminosity: 'bright', }),
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

        const ageLabels = Object.keys(this.age)
        this.datacollection.age = {
          labels: ageLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: ageLabels.length, luminosity: 'bright', }),
            data: ageLabels.map(l => this.age[l]),
          }],
        }

        // 平均工作年資
        // 最高學歷分佈
        // 學歷專業項目
        // 目前工作產業別
        // 國籍之洲別分佈
      },
      saveImg(chartId) {
        const canvas = document.getElementById(chartId).firstChild;
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
        const res = (m > 0 && f > 0) ? [m, f] : []
        return res;
      },
      age() {
        const res = {
          '22~26': 0,
          '27~31': 0,
          '32~35': 0,
          '36~39': 0,
          '40~44': 0,
          'Over 45': 0,
        };
        const labels = Object.keys(res);
        this.bus.profile.data.forEach((currRow) => {
          if (this.selectYear.indexOf(currRow.enrollYear) !== -1) {
            const birth = currRow['出生年月日'];
            const age = moment().diff(moment(birth), 'years', false);
            if (age >= 22 && age <= 26) {
              res[labels[0]] += 1;
            } else if (age >= 27 && age <= 31) {
              res[labels[1]] += 1;
            } else if (age >= 32 && age <= 35) {
              res[labels[2]] += 1;
            } else if (age >= 36 && age <= 39) {
              res[labels[3]] += 1;
            } else if (age >= 40 && age <= 44) {
              res[labels[4]] += 1;
            } else if (age >= 45) {
              res[labels[5]] += 1;
            } 
          }
        });
        return res;
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

  .left-mainConsole {
    display: absolute;
    position: fixed;
    left: 0px;
    bottom: 0px;
    background: black;
    opacity:1.0;
    width: 80px;
    padding: 15px;
  }

  .chartWrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .el-collapse-item__header {
    font-size: 25px;
  }

  .el-checkbox+.el-checkbox{
    margin-left: 0px;
  }
</style>