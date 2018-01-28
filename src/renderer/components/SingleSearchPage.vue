<template>
  <div id="wrapper">
    <kanban activeIndex="2"></kanban>
    <main>
      <div class="left-side">
        <div class="searchCondWrapper">
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="查詢對象">
              <el-select class="searchCond" v-model="searchCondition" placeholder="請選擇篩選條件">
                <el-option
                  v-for="item in searchConditionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="查詢關鍵字">
              <el-input
                class="searchCond"
                v-model="rawSearchInput"
                :placeholder="searchCondition === 'sid' ? '學號' : '課號, 識別碼, 課程名稱'">
              </el-input>
            </el-form-item>
          </el-form>
        </div>
        <div>
        <el-table
          :data="searchedTableData['student']"
          v-if="searchCondition === 'sid'"
          :default-expand-all="true"
          style="width: 100%;">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-steps
                :active="schoolSteps.length - 1"
                finish-status="success"
                :process-status="'B,O'.indexOf(searchedTableData['student'][0]['異動碼']) == -1 ? 'success' : 'error'"
                align-center>
                <el-step
                  v-for="step in schoolSteps"
                  :title="step.state"
                  :description="`${ step.date } ${ step.desc }`">
                </el-step>
              </el-steps>

              <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item label="國籍">
                  <span>{{ props.row['國籍'] }}</span>
                </el-form-item>
                <el-form-item label="出生年月日">
                  <span>{{ props.row['出生年月日'] }}</span>
                </el-form-item>
                <el-form-item label="入學前學籍資訊">
                  <span>
                    {{ props.row['入學前畢業年月'] }} / {{ props.row['入學前畢業學校'] }} - 
                    {{ props.row['入學前畢業系所'] }}
                  </span>
                </el-form-item>
                <el-form-item label="家裡電話">
                  <span>{{ props.row['家裡電話'] }} / {{ props.row['電話3'] }}</span>
                </el-form-item>
                <el-form-item label="手機">
                  <span>{{ props.row['手機'] }}</span>
                </el-form-item>
                <el-form-item label="email">
                  <span>{{ props.row['email'] }}</span>
                </el-form-item>
                <el-form-item label="系定必修">
                  <span
                    :style="{
                      'color': personalGraduateScore['totalRequiredScore'] < personalGradStandard['score']['系定必修'] ? 'red' : 'black'
                    }">
                    {{ personalGraduateScore['totalRequiredScore'] }}
                  </span>
                  <span>
                    /
                  </span>
                  <span>
                    {{ personalGradStandard['score']['系定必修'] }}
                  </span>
                </el-form-item>
                <el-form-item label="選修">
                  <span
                    :style="{
                      'color': personalGraduateScore['totalSelectableScore'] < personalGradStandard['score']['選修'] ? 'red' : 'black'
                    }">
                    {{ personalGraduateScore['totalSelectableScore'] }}
                  </span>
                  <span>/</span>
                  <span>
                    {{ personalGradStandard['score']['選修'] }}
                  </span>
                </el-form-item>
                <el-form-item label="應修最低畢業學分">
                  <span
                    :style="{
                      'color': personalGraduateScore['totalSelectableScore'] + personalGraduateScore['totalRequiredScore'] < personalGradStandard['score']['應修最低畢業學分'] ? 'red' : 'black'
                    }">
                    {{ personalGraduateScore['totalSelectableScore'] + personalGraduateScore['totalRequiredScore'] }}
                  </span>
                  <span>
                    /
                  </span>
                  <span>
                    {{ personalGradStandard['score']['應修最低畢業學分'] }}
                  </span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column
            label="學號"
            prop="學號">
          </el-table-column>
          <el-table-column
            label="中文姓名"
            prop="中文姓名">
          </el-table-column>
          <el-table-column
            label="英文姓名"
            prop="英文姓名">
          </el-table-column>
          <el-table-column
            label="畢業年月"
            prop="畢業年月">
          </el-table-column>
        </el-table>
      </div>
        <el-table
          :data="searchedTableData['course']"
          highlight-current-row
          style="width: 100%">
          <el-table-column
            prop="學年學期"
            label="學年學期"
            width="180">
          </el-table-column>
          <el-table-column
            prop="課程名稱"
            label="課程名稱"
            width="180">
          </el-table-column>
          <el-table-column
            prop="學分"
            label="學分">
          </el-table-column>
          <el-table-column
            prop="課程識別碼"
            label="課程識別碼">
          </el-table-column>
          <el-table-column
            prop="課號"
            label="課號">
          </el-table-column>
          <el-table-column
            v-if="searchCondition === 'cid'"
            prop="meanScore"
            label="平均成績">
          </el-table-column>
          <el-table-column
            v-else-if="searchCondition === 'sid'"
            prop="中位數成績"
            label="中位數成績">
          </el-table-column>
          <el-table-column
            v-if="searchCondition === 'cid'"
            prop="elements.length"
            label="修課人數">
          </el-table-column>
          <el-table-column
            key="courseCategory"
            v-if="searchCondition === 'sid'"
            label="類別">
            <template slot-scope="scope">
              <el-tag 
                v-if="isCourseDeptRequired(scope.row) === true"
                type="danger"
                size="medium">
                {{ '系定必修' }}
              </el-tag>
              <el-tag 
                v-else-if="'操行,碩士論文'.indexOf(scope.row['課程名稱']) === -1"
                size="medium">
                {{ '選修' }}
              </el-tag>
              <el-tag 
                v-else
                type="info"
                size="medium">
                {{ '其他' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

      </div>
    </main>
  </div>
</template>

<script>
  import kanban from './kanban';
  import eventBus from './eventBus';

  export default {
    components: { kanban },
    data() {
      return {
        bus: eventBus,
        searchConditionOptions: [{
          value: 'sid',
          label: '學生',
        },
        {
          value: 'cid',
          label: '課程',
        },
        ],
        searchCondition: 'sid',
        rawSearchInput: 'R96749024',
        currentPage: 1,
        pageSize: 10,
      };
    },
    methods: {
      isCourseDeptRequired(row) {
        let flag = false;
        const requireCourseClassId1 = this.personalGradStandard.specific.map(row => row['課號']);
        const requireCourseClassId2 = this.personalGradStandard.specific.map(row => row['課程識別碼']);
        const requireCourseClassName = this.personalGradStandard.specific.map(row => row['課程中文名稱']);

        if (requireCourseClassId1.indexOf(row['課號']) !== -1) {
          flag = true;
        } else if (requireCourseClassId2.indexOf(row['課程識別碼']) !== -1) {
          flag = true;
        } else if (requireCourseClassName.indexOf(row['課程名稱']) !== -1) {
          flag = true;
        }

        /**
         *
           只要課號 / 課程識別碼 / 課程名稱一致，即判定為系定必修。
           { true: '系定必修', false: '選修' }
         *
        * */
        return flag;
      },
      searchBaseOnKeywordACondition(searchInput, searchCondition) {
        const { profile, course } = this.bus;

        const res = {
          student: null,
          course: [],
        };

        switch (searchCondition) {
          // 以學生為本
          case 'sid':
            for (let i = 0; i < profile.data.length; i += 1) {
              if (profile.data[i]['學號'] === searchInput) {
                res.student = [profile.data[i]];
                break;
              }
            }

            for (let i = 0; i < course.data.length; i += 1) {
              if (course.data[i]['學號'] === searchInput) {
                res.course.push(course.data[i]);
              }
            }
            break;
  
          // 以課程為本
          case 'cid': {
            const keysMap = [];

            const insertNewClassIntoKeyMaps = function insertNewClassIntoKeyMaps(targetObj) {
              const obj = {};

              obj['課號'] = targetObj['課號'];
              obj['課程識別碼'] = targetObj['課程識別碼'];
              obj['課程名稱'] = targetObj['課程名稱'];
              obj['學年學期'] = targetObj['學年學期'];
              obj['學分'] = targetObj['學分'];
              obj.elements = [targetObj];

              keysMap.push(obj);
            };

            const hasSameClassInKeyMaps = function hasSameClassInKeyMaps(targetObj) {
              let flag = false;
              let idx = -1;
              for (let j = 0; j < keysMap.length; j += 1) {
                if (keysMap[j]['學年學期'] === targetObj['學年學期'] &&
                    keysMap[j]['課號'] === targetObj['課號'] &&
                    keysMap[j]['課程識別碼'] === targetObj['課程識別碼'] &&
                    keysMap[j]['課程名稱'] === targetObj['課程名稱']) {
                  flag = true;
                  idx = j;
                  break;
                }
              }

              return { flag, idx };
            };

            for (let i = 0; i < course.data.length; i += 1) {
              const targetObj = course.data[i];
              if (targetObj['課號'] === searchInput ||
                  targetObj['課程識別碼'] === searchInput ||
                  targetObj['課程名稱'] === searchInput) {
                if (keysMap.length === 0) {
                  insertNewClassIntoKeyMaps(targetObj);
                }

                const { flag, idx } = hasSameClassInKeyMaps(targetObj);

                if (flag === true) {
                  keysMap[idx].elements.push(targetObj);
                } else {
                  insertNewClassIntoKeyMaps(targetObj);
                }
              }
            }

            keysMap.forEach((course) => {
              const scoresList = course.elements
                .map(element => element['中位數成績'])
                .filter(v => !isNaN(v));

              if (scoresList.length === 0) {
                course.meanScore = '無';
              } else {
                const rawSumScore = scoresList.reduce((a, b) => parseFloat(a) + parseFloat(b));
                course.meanScore = (rawSumScore / scoresList.length).toFixed(2);
              }
            });

            res.course = keysMap;
            break;
          }
          default: {
            break;
          }
        }

        return res;
      },
    },
    computed: {
      searchInput() {
        return this.rawSearchInput.trim().toUpperCase();
      },
      searchedTableData() {
        /*
          res = {
            'student': {} or null,
            'course': [],
          }
        */
        return this.searchBaseOnKeywordACondition(this.searchInput, this.searchCondition);
      },
      displayTable() {
        return this[this.displayType].data.slice(
          (this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize,
        );
      },
      totalPages() {
        return this[this.displayType].data.length;
      },
      personalGradStandard() {
        // assume rawSearchInput is student id
        const enrollYear = this.searchedTableData.student[0].enrollYear;
        const standard = {
          score: null,
          specific: [],
        };

        this.bus.graduateStandard.score.data.forEach((row) => {
          if (row['學年'] === enrollYear) {
            standard.score = row;
          }
        });

        this.bus.graduateStandard.specific.data.forEach((row) => {
          if (row['學年'] === enrollYear) {
            standard.specific.push(row);
          }
        });
        return standard;
      },
      personalGraduateScore() {
        let totalRequiredScore = 0;
        let totalSelectableScore = 0;
        this.searchedTableData.course.forEach((row) => {
          if (this.isCourseDeptRequired(row) === true) {
            totalRequiredScore += parseInt(row['學分'], 10);
          } else {
            totalSelectableScore += parseInt(row['學分'], 10);
          }
        });
        return { totalRequiredScore, totalSelectableScore };
      },
      schoolSteps() { // 在學狀態
        const row = this.searchedTableData.student[0];
        const steps = [];
        const seq = ['一', '二', '三', '四', '五', '六', '七', '八'];

        steps.push({
          date: row.enrollYear,
          state: '入學',
          desc: '入學',
        });
  
        seq.forEach((w) => {
          const label1 = `第${w}次休學`;
          const label2 = `${label1}原因`;

          if (row[label1].trim() !== '-' && row[label1].trim() !== '') {
            steps.push({
              date: row[label1],
              state: '休學',
              desc: row[label2],
            });
          }
        });
  
        switch (row['異動碼']) {
          case 'G':
            steps.push({
              date: row['畢業年月'],
              state: '畢業',
              desc: '畢業',
            });
            break;
          case 'O':
            steps.push({
              date: row['異動學期'],
              state: '退學',
              desc: row['退學原因'],
            });
            break;
          case 'B':
            break;
          default:
            steps.push({
              date: new Date().getYear() - 11,
              state: '在學',
              desc: '在學中',
            });
        }

        return steps;
      },
    },
  };
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    padding: 60px 80px;
    padding-top: 40px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  .left-side {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    color: #99a9bf;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }

  .el-table__row .expanded:hover {
    background-color:red!important;
  }

  .el-table__expanded-cell {
    background-color:#f5f7fa!important;
  }

  .searchCondWrapper {
    padding-top: 2.5%;
    border: 3px solid rgba(0, 0, 0, .15);
    border-radius: 20px;
    display: flex;
    justify-content:center;
  }
</style>
