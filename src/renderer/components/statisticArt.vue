<template>
  <div id="wrapper">
    <kanban :activeIndex="artActiveIndex"></kanban>
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
          @click="DownloadImageSet"
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
        <el-checkbox v-for="yr in enrollYears" :label="yr" name="type"></el-checkbox>
      </el-checkbox-group>
    </div>
    <el-collapse v-model="activeNames" style="margin-left:30px">
      <el-collapse-item title="A. 性別分析" name="1">
        <div class="chartWrapper">
          <div style="width:30%; margin: 10px;">
            <el-table
              :data="totalMF.tableDisplaylabels.map((label) => {
                return { 
                    'label': label,
                    'number': totalMF[label],
                    'percentage': (totalMF[label] * 100 / totalMF.tableDisplaylabels.reduce((acc, label) => acc + totalMF[label], 0)).toFixed(1),
                  };
              })"
              :border="true"
              :summary-method="getSummaries"
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
          <div style="text-align:center;border:rgba(0,0,0,0.1) 1px solid;">
            <pie-chart
              id="sex-chart"
              :chart-data="datacollection['sexRatio']"
              :options="{ responsive: false, maintainAspectRatio: false }">
            </pie-chart>
            <el-button
              type="danger"
              :disabled="hasChartDownloadButton('totalMF')"
              plain round
              @click="saveImg('sex-chart')"
              style="margin:10px">
              Download
            </el-button>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="B. 入學年齡分布" name="2">
        <div class="chartWrapper">
          <div style="width:30%; margin: 10px;">
            <el-table
              :data="entry_age_stats.tableDisplaylabels.map((v) => {
                return { 'label': v, 'number': entry_age_stats[v], 'percentage':
                    (entry_age_stats[v] * 100 / entry_age_stats.tableDisplaylabels.reduce((acc, v) => acc + entry_age_stats[v], 0)).toFixed(1),};
              })"
              :border="true"
              :highlight-current-row="false"
              :summary-method="getSummaries"
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
              平均入學年齡：{{ datacollection.ageAverage }}
            </el-card>
          </div>
          <div style="text-align:center;border:rgba(0,0,0,0.1) 1px solid;">
            <pie-chart
              id="age-chart"
              :chart-data="datacollection['entry_age_stats']"
              :options="{ responsive: false, maintainAspectRatio: false }">
            </pie-chart>
            <el-button :disabled="hasChartDownloadButton('entry_age_stats')" type="danger" plain round @click="saveImg('age-chart')" style="margin:10px">Download</el-button>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="C. 學歷分布" name="3">
        <div class="chartWrapper">
          <div style="width:60%;margin:10px">
            <el-table
              :data="educationTable"
              :border="true"
              :highlight-current-row="false"
              :show-summary="true"
              :summary-method="getSummaries"
              :span-method="objectSpanMethod"
              sum-text="總計">
              <el-table-column
                prop="label"
                label="學歷">
              </el-table-column>
              <el-table-column
                prop="number"
                label="人數">
              </el-table-column>
              <el-table-column
                prop="percentage"
                label="百分比"
                width="70px">
                <template slot-scope="scope">
                  {{ scope.row.percentage }}%
                </template>
              </el-table-column>
              <el-table-column
                prop="type"
                label="">
              </el-table-column>
              <el-table-column
                prop="type_number"
                label="人數">
              </el-table-column>
              <el-table-column
                prop="type_percentage"
                label="百分比">
                <template slot-scope="scope">
                  {{ scope.row.type_percentage }}%
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div style="text-align:center;border:rgba(0,0,0,0.1) 1px solid;">
            <pie-chart
              id="education-chart"
              :chart-data="datacollection['educationRatio']"
              :options="{ responsive: false, maintainAspectRatio: false }">
            </pie-chart>
            <el-button :disabled="hasChartDownloadButton('education')" type="danger" plain round @click="saveImg('education-chart')" style="margin:10px">Download</el-button>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="D. 過去最高學歷背景分析" name="4">
        <div class="chartWrapper">
          <div style="width:40%;margin:10px">
            <el-table
              :data="major.tableDisplaylabels.map((v) => {
                return { 'label': v, 'number': major[v], 'percentage':
                    (major[v] * 100 / major.tableDisplaylabels.reduce((acc, v) => acc + major[v], 0)).toFixed(1),};
              })"
              :border="true"
              :highlight-current-row="false"
              :summary-method="getSummaries"
              :show-summary="true"
              sum-text="總計">
              <el-table-column
                prop="label"
                label="科系">
              </el-table-column>
              <el-table-column
                prop="number"
                label="人數"
                width="60px">
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
          <div style="text-align:center;border:rgba(0,0,0,0.1) 1px solid;">
            <pie-chart
              id="major-chart"
              :chart-data="datacollection['majorRatio']"
              :options="{ responsive: false, maintainAspectRatio: false }">
            </pie-chart>
            <el-button :disabled="hasChartDownloadButton('major')" type="danger" plain round @click="saveImg('major-chart')" style="margin:10px">Download</el-button>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="E. 工作年資分佈" name="5">
        <div class="chartWrapper">
          <div style="width:40%;margin:10px">
            <el-table
              :data="workYears.tableDisplaylabels.map((v) => {
                return { 'label': v, 'number': workYears[v], 'percentage':
                    (workYears[v] * 100 / workYears.tableDisplaylabels.reduce((acc, v) => acc + workYears[v], 0)).toFixed(1),};
              })"
              :border="true"
              :highlight-current-row="false"
              :show-summary="true"
              :summary-method="getSummaries"
              sum-text="總計">
              <el-table-column
                prop="label"
                label="科系">
              </el-table-column>
              <el-table-column
                prop="number"
                label="人數"
                width="60px">
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
            <el-card>
              平均年資：{{ datacollection.workYearsAverage }}
            </el-card>
          </div>
          <div style="text-align:center;border:rgba(0,0,0,0.1) 1px solid;">
            <pie-chart
              id="workYears-chart"
              class="person-chart"
              :chart-data="datacollection['workYearsRatio']"
              :options="{ responsive: false, maintainAspectRatio: false }">
            </pie-chart>
            <el-button :disabled="hasChartDownloadButton('workYears')" type="danger" plain round @click="saveImg('workYears-chart')" style="margin:10px">Download</el-button>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="F. 產業別" name="6">
        <div class="chartWrapper">
          <div style="width:40%;margin:10px">
            <el-table
              :data="workField.tableDisplaylabels.map((v) => {
                return { 'label': v, 'number': workField[v], 'percentage':
                    (workField[v] * 100 / workField.tableDisplaylabels.reduce((acc, v) => acc + workField[v], 0)).toFixed(1),};
              })"
              :border="true"
              :highlight-current-row="false"
              :summary-method="getSummaries"
              :show-summary="true"
              sum-text="總計">
              <el-table-column
                prop="label"
                label="科系">
              </el-table-column>
              <el-table-column
                prop="number"
                label="人數"
                width="60px">
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
          <div style="text-align:center;border:rgba(0,0,0,0.1) 1px solid;">
            <pie-chart
              id="workField-chart"
              class="person-chart"
              :chart-data="datacollection['workFieldRatio']"
              :options="{ responsive: false, maintainAspectRatio: false }">
            </pie-chart>
            <el-button :disabled="hasChartDownloadButton('workField')" type="danger" plain round @click="saveImg('workField-chart')" style="margin:10px">Download</el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
  import moment from 'moment';
  import kanban from './kanban';
  import PieChart from './PieChart.js';
  import JSZip from 'jszip';
  import { saveAs } from 'file-saver';
  import randomColor from 'randomcolor';

  export default {
    name: 'statistic-art',
    mixins: [kanban],
    data() {
      return {
        colorRandomSeed: 15,//1352388, 8215343, 11069834, 18948486, 17332352, 18927824, 8344352, 804851, 8209390
        activeNames: ['1', '2', '3', '4', '5', '6'],
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
      getSummaries(param) {
        const { columns, data } = param;
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '總計';
            return;
          }
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0)
            if (column.label === '百分比') {
              sums[index] = sums[index].toFixed(1)
              sums[index] += '%';
            } else if (column.label === '人數') {
              sums[index] += ' 人';
            }
          } else {
            sums[index] = '';
          }
        });

        return sums;
      },
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex <= 2) {
          if (rowIndex % 2 === 0) {
            return {
              rowspan: 2,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
      },
      hasChartDownloadButton(chartDataType) {
        if (chartDataType === 'education') {
          return this[chartDataType][0].tableDisplaylabels.every(l => this[chartDataType][l] === 0);
        }
        return this[chartDataType].tableDisplaylabels.every(l => this[chartDataType][l] === 0);
      },
      changeRandomColorSeed() {
        this.colorRandomSeed = Math.floor(Math.random() * Math.floor(20000000));
        console.log(this.colorRandomSeed)
        this.updateData();
      },
      handleCheckAllChange(val) {
        this.selectYear = val ? this.enrollYears : [];
        this.isIndeterminate = false;
        this.updateData();
      },
      handleCheckedYearChange(value) {
        const checkedCount = value.length;
        this.checkAll = checkedCount === this.enrollYears.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.enrollYears.length;
        this.updateData();
      },
      updateData() {
        const { colorRandomSeed } = this;
        // 性別比例
        this.datacollection.sexRatio = {
          labels: this.totalMF.chartDisplayLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: 2, luminosity: 'bright', }),//#f87979
            data: this.totalMF.chartDisplayLabels.map(l => this.totalMF[l]),
          }],
        };

        // 入學年齡統計
        this.datacollection.entry_age_stats = {
          labels: this.entry_age_stats.chartDisplayLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: this.entry_age_stats.chartDisplayLabels.length, luminosity: 'bright', }),
            data: this.entry_age_stats.chartDisplayLabels.map(l => this.entry_age_stats[l]),
          }],
        };

        // 平均年齡
        let totalNum = 0;
        this.datacollection.ageAverage = (this.profile.data.reduce((acc, currRow) => {
          if (this.selectYear.indexOf(currRow.enrollYear) === -1) {
            return acc;
          }
          const birth = currRow['出生年月日'];
          const entry_age = moment(`09-01-${ 1911 + parseInt(currRow.enrollYear) }`, "MM-DD-YYYY").diff(moment(birth), 'years', false);
          totalNum += 1;
          return acc + entry_age;
        }, 0) / totalNum).toFixed(2);

        // 最高學歷分佈
        this.datacollection.educationRatio = {
          labels: this.education[0].chartDisplayLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: this.education[0].chartDisplayLabels.length, luminosity: 'bright', }),
            data: this.education[0].chartDisplayLabels.map(l => this.education[0][l]),
          }],
        };

        // 學歷專業項目
        this.datacollection.majorRatio = {
          labels: this.major.chartDisplayLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: this.major.chartDisplayLabels.length, luminosity: 'bright', }),
            data: this.major.chartDisplayLabels.map(l => this.major[l]),
          }],
        };

        // 年資分佈
        this.datacollection.workYearsRatio = {
          labels: this.workYears.chartDisplayLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: this.workYears.chartDisplayLabels.length, luminosity: 'bright', }),
            data: this.workYears.chartDisplayLabels.map(l => this.workYears[l]),
          }],
        };

        //平均年資
        this.datacollection.workYearsAverage = (this.workYears.chartDisplayLabels.reduce((acc, l) => {
          let res = 0.0;
          if (l === '2~3') {
            res = (2.5 * this.workYears[l]);
          } else if (l === '4~5') {
            res = (4.5 * this.workYears[l]);
          } else if (l === '6~9') {
            res = (7.5 * this.workYears[l]);
          } else if (l === '10~11') {
            res = (10.5 * this.workYears[l]);
          } else if (l === '12~15') {
            res = (13.5 * this.workYears[l]);
          } else if (l === 'Over 16') {
            res = (16 * this.workYears[l]);
          };
          return acc + res
        }, 0.0) / this.workYears.chartDisplayLabels.reduce((acc, l) => {
          return acc + this.workYears[l];
        }, 0.0)).toFixed(2).toString() + '\t(超過16年以16年計算)';
        //this.datacollection.workYearsAverage = (res / total).toFixed(2) + '_(Over 16以16年計算)';
        
        // 目前工作產業別
        this.datacollection.workFieldRatio = {
          labels: this.workField.chartDisplayLabels,
          datasets: [{
            label: 'Data One',
            backgroundColor: randomColor({ seed: colorRandomSeed, count: this.workField.chartDisplayLabels.length, luminosity: 'bright', }),
            data: this.workField.chartDisplayLabels.map(l => this.workField[l]),
          }],
        };
      },
      saveImg(chartId) {
        const canvas = document.getElementById(chartId).firstChild;
        canvas.toBlob((image) => {
          saveAs(image, `${chartId}.png`);
        }, 'image/png')
      },
      DownloadImageSet() {
        const zip = new JSZip();
        const folder = zip.folder('Charts');
        const chartIds = ['age-chart', 'education-chart', 'sex-chart', 'major-chart'];
        chartIds.forEach((chartId) => {
          const canvas = document.getElementById(chartId).firstChild;
          const image = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
          folder.file(chartId, image, { base64: true });
        })

        zip.generateAsync({ type:"blob" })
          .then(function(content) {
            saveAs(content, "charts.zip");
        });
      },
    },
    mounted() {
      this.checkAll = true;

      const years = this.questionnaire.data.map(row => row.enrollYear);
      this.selectYear = [...new Set(years)].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

      this.updateData();
    },
    computed: {
      educationTable() {
        let res = []
        const education = this.education[0];
        const education_where = this.education[1];

        education.tableDisplaylabels.forEach((v) => {
          const x = {
            'label': v,
            'number': education[v],
            'percentage':
              (education[v] * 100 / education.tableDisplaylabels.reduce((acc, v) => acc + education[v], 0)).toFixed(1),
            'type': '國內',
            'type_number': education_where[`${v}_T_School`],
            'type_percentage': (education_where[`${v}_T_School`] * 100 / education.tableDisplaylabels.reduce((acc, v) => acc + education[v], 0)).toFixed(1),
            
          };
          const y = {
            'label': v,
            'number': 0,
            'percentage': 0.00,
            'type': '國外',
            'type_number': education_where[`${v}_NT_School`],
            'type_percentage': (education_where[`${v}_NT_School`] * 100 / education.tableDisplaylabels.reduce((acc, v) => acc + education[v], 0)).toFixed(1),
            
          };
          res.push(x);
          res.push(y);
        });

        return res
      },
      totalMF() {
        const res = {
          'Male': 0,
          'Female': 0,
          'tableDisplaylabels': ['Male', 'Female'],
          'chartDisplayLabels': [],
        };

        this.questionnaire.data.forEach((curV) => {
          if (this.selectYear.indexOf(curV.enrollYear) !== -1) {
            switch (curV['Gender']) {
              case 'M':
                res.Male += 1;
                break;
              case 'F':
                res.Female += 1;
                break;
              default:
            }
          }
        });
        res.chartDisplayLabels = res.tableDisplaylabels.filter(label => res[label] > 0);

        return res;
      },
      entry_age_stats() {
        const res = {
          'tableDisplaylabels': ['22~26', '27~31', '32~35', '36~39', '40~44', 'Over 45'],
          'chartDisplayLabels': [],
        };

        res.tableDisplaylabels.forEach((l) => {
          res[l] = 0
        });
        this.questionnaire.data.forEach((currRow) => {
          if (this.selectYear.indexOf(currRow.enrollYear) !== -1) {
            const birth = currRow['出生年月日'];
            const entry_age = currRow['Age']
            //moment(`09-01-${ 1911 + parseInt(currRow.enrollYear) }`, "MM-DD-YYYY").diff(moment(birth), 'years', false);

            if (entry_age >= 22 && entry_age <= 26) {
              res[res.tableDisplaylabels[0]] += 1;
            } else if (entry_age >= 27 && entry_age <= 31) {
              res[res.tableDisplaylabels[1]] += 1;
            } else if (entry_age >= 32 && entry_age <= 35) {
              res[res.tableDisplaylabels[2]] += 1;
            } else if (entry_age >= 36 && entry_age <= 39) {
              res[res.tableDisplaylabels[3]] += 1;
            } else if (entry_age >= 40 && entry_age <= 44) {
              res[res.tableDisplaylabels[4]] += 1;
            } else if (entry_age >= 45) {
              res[res.tableDisplaylabels[5]] += 1;
            }
          }
        });
        res.chartDisplayLabels = res.tableDisplaylabels.filter(label => res[label] > 0);

        return res;
      },
      education() {
        const res = { 'PhD': 0, 'Master': 0, 'Bachelor': 0 };
        const res_where = { 'PhD_T_School': 0, 'PhD_NT_School': 0, 'Master_T_School': 0, 'Master_NT_School': 0, 'Bachelor_T_School': 0, 'Bachelor_NT_School': 0 };
        this.questionnaire.data.forEach((curV) => {
          if (this.selectYear.indexOf(curV.enrollYear) !== -1) {
            /*const label = curV['學位1'];
            if (label !== '-' && label !== undefined) {
              res[label] = res[label] ? res[label] + 1 : 1;
            }*/
            Object.keys(res).forEach((label) => {
              if (curV[label] === 'Yes') {
                res[label] += 1;
                if (curV[`${label.toLowerCase()}_School`] === 'Taiwanese school') {
                  res_where[`${label}_T_School`] += 1;
                } else {
                  res_where[`${label}_NT_School`] += 1
                }
              }
            })
          }
        });
        res['Master'] -= res['PhD']
        res['Bachelor'] -= res['Master']
        res['Bachelor'] -= res['PhD']
        res_where['Master_T_School'] -= res_where['PhD_T_School'];
        res_where['Master_NT_School'] -= res_where['PhD_NT_School'];
        res_where['Bachelor_T_School'] -= res_where['Master_T_School'];
        res_where['Bachelor_NT_School'] -= res_where['Master_NT_School'];
        res_where['Bachelor_T_School'] -= res_where['PhD_T_School'];
        res_where['Bachelor_NT_School'] -= res_where['PhD_NT_School'];
        
        res.tableDisplaylabels = Object.keys(res);
        res.chartDisplayLabels = res.tableDisplaylabels.filter(label => res[label] > 0);

        return [res, res_where];
      },
      major() {
        const res = {};

        this.questionnaire.data.forEach((curV) => {
          if (this.selectYear.indexOf(curV.enrollYear) !== -1) {
            if (curV['phd_Fields'] !== '-' && curV['phd_Fields'] !== undefined) {
              res[curV['phd_Fields']] = res[curV['phd_Fields']] ? res[curV['phd_Fields']] + 1 : 1;
            } else if (curV['master_Fields'] !== '-' && curV['master_Fields'] !== undefined) {
              res[curV['master_Fields']] = res[curV['master_Fields']] ? res[curV['master_Fields']] + 1 : 1;
            } else if (curV['bachelor_Fields'] !== '-' && curV['bachelor_Fields'] !== undefined) {
              res[curV['bachelor_Fields']] = res[curV['bachelor_Fields']] ? res[curV['bachelor_Fields']] + 1 : 1;
            } 
          }
        });
        res.tableDisplaylabels = Object.keys(res);
        res.chartDisplayLabels = res.tableDisplaylabels.filter(label => res[label] > 0);

        return res;
      },
      workYears() {
        const res = {};
        this.questionnaire.data.forEach((curV) => {
          if (this.selectYear.indexOf(curV.enrollYear) !== -1) {
            const label = curV['Total_working_years'];
            if (label !== '-' && label !== undefined) {
              res[label] = res[label] ? res[label] + 1 : 1;
            }
          }
        });

        const sortFunc = (a, b) => {
          let groups = a.match(/\w*(\d+)(?!~{1}\d.)?/g);
          const aV = groups.reduce((acc, v) => { return acc += parseInt(v) }, 0) / (groups.length);
          groups = b.match(/\w*(\d+)(?!~{1}\d.)?/g);
          const bV = groups.reduce((acc, v) => { return acc += parseInt(v) }, 0) / (groups.length);
          return aV - bV;
        }

        res.tableDisplaylabels = Object.keys(res).sort(sortFunc);
        res.chartDisplayLabels = res.tableDisplaylabels.filter(label => res[label] > 0);
        return res;
      },
      workField() {
        const res = {};
        this.questionnaire.data.forEach((curV) => {
          if (this.selectYear.indexOf(curV.enrollYear) !== -1) {
            const label = curV['Field_of_company'];
            if (label !== '-' && label !== undefined) {
              res[label] = res[label] ? res[label] + 1 : 1;
            }
          }
        });
        res.tableDisplaylabels = Object.keys(res);
        res.chartDisplayLabels = res.tableDisplaylabels.filter(label => res[label] > 0);
        return res;
      },
      artActiveIndex() {
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