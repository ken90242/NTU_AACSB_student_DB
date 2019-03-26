<template>
  <div id="wrapper" style="padding: 0px 80px;padding-top: 40px;">
    <kanban activeIndex="3"></kanban>
    <div class="freezeTop">
      <el-tabs v-model="displayType" type="card" style="width:100%">
        <el-tab-pane label="A. 研教組年度資料" name="profile"></el-tab-pane>
        <el-tab-pane label="B. 歷年學生修課紀錄" name="course"></el-tab-pane>
        <el-tab-pane label="C. 畢業生論文" name="papers"></el-tab-pane>
        <el-tab-pane label="D. 學生會成員" name="council"></el-tab-pane>
        <el-tab-pane label="E. GMBA線上問卷" name="questionnaire"></el-tab-pane>
        <el-tab-pane label="F. 畢業標準" name="graduateStandard"></el-tab-pane>
        <el-tab-pane label="G. 歷年學生採計學分數" name="graduate_credits"></el-tab-pane>
      </el-tabs>
      <section v-if="displayType==='graduateStandard'">
        <h2>(1) 歷年必選修學分數</h2>
        <el-table
          :data="displayTable['score']"
          stripe
          border
          style="width: 60%;margin:20px;">
          <el-table-column
            fixed
            prop="學年"
            label="學年">
          </el-table-column>
          <el-table-column
            v-for="label in graduateStandard.score['head']"
            v-if="label != '學年'"
            :prop="label"
            :label="label">
          </el-table-column>
        </el-table>
        <h2>(2) 歷年必修課程</h2>
        <br/>
        <div class="paginateWrapper">
          <el-dropdown @command="handleCommand" size="mini">
            <el-button type="danger" size="mini" round>
              {{ selectYear === 'all' ? '全部年度' : selectYear + '年度' }}<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="all">全部年度</el-dropdown-item>
              <el-dropdown-item v-for="enrollYear in displayYearsList" :command="enrollYear">
                {{ enrollYear + ' 年度'}} 
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[5]"
            :page-size="pageSize"
            layout="sizes, total, prev, pager, next"
            :total="totalPages">
          </el-pagination>
        </div>
        <el-table
          v-if="displayType === 'graduateStandard'"
          :data="displayTable['specific']"
          stripe
          border
          style="width: 90%;margin:10px;"
          :max-height="tableMaxHeight">
          <el-table-column
            fixed
            prop="學年"
            width="60"
            label="學年">
          </el-table-column>
          <el-table-column
            prop="課號"
            label="課號">
          </el-table-column>
          <el-table-column
            prop="課程識別碼"
            label="課程識別碼">
          </el-table-column>
          <el-table-column
            prop="課程中文名稱"
            width="150"
            label="課程中文名稱">
          </el-table-column>
          <el-table-column
            prop="課程英文名稱"
            width="180"
            label="課程英文名稱">
          </el-table-column>
          <el-table-column
            prop="學分數"
            width="75"
            label="學分數">
          </el-table-column>
          <el-table-column
            prop="群組別"
            width="75"
            label="群組別">
          </el-table-column>
          <el-table-column
            prop="併修"
            width="60"
            label="併修">
          </el-table-column>
          <el-table-column
            prop="必修認可範圍"
            label="必修認可範圍">
          </el-table-column>
       <!--    <el-table-column
            v-for="label in graduateStandard.specific['head']"
            v-if="label != '學年'"
            :prop="label"
            :label="label">
          </el-table-column> -->
        </el-table>
      </section>
      <div v-else class="paginateWrapper">
        <el-dropdown @command="handleCommand" size="mini">
          <el-button type="danger" size="mini" round>
            {{ selectYear === 'all' ? '全部年度' : selectYear + '年度' }}<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="all">全部年度</el-dropdown-item>
            <el-dropdown-item v-for="enrollYear in displayYearsList" :command="enrollYear">
              {{ enrollYear + ' 年度'}} 
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[5, 15, 50, 100, 300]"
          :page-size="pageSize"
          layout="sizes, total, prev, pager, next"
          :total="totalPages">
        </el-pagination>
        <span style="display:flex;color:red"></span>
      </div>
      <div v-if="displayType === 'profile'">
        <el-tooltip :content="hotKeyReminder" :offset="50" placement="top-end">
          <el-table
            :data="displayTable"
            stripe
            border
            style="width: 100%;margin:0px;"
            :max-height="tableMaxHeight">
            <el-table-column
              fixed
              prop="學號"
              label="學號"
              width="180">
            </el-table-column>
            <el-table-column
              v-for="label in profile['head']"
              v-if="label != '學號'"
              :prop="label"
              :label="label">
            </el-table-column>
          </el-table>
        </el-tooltip>
      </div>
      <div v-if="displayType === 'course'">
        <el-tooltip :content="hotKeyReminder" :offset="50" placement="top-end">
          <el-table
            :data="displayTable"
            stripe
            border
            style="width: 100%"
            :max-height="tableMaxHeight">
            <el-table-column
              fixed
              prop="學年學期"
              label="學年學期"
              width="180">
            </el-table-column>
            <el-table-column
              v-for="label in course['head']"
              v-if="label != '異動碼' && label != '學年學期'"
              :prop="label"
              :label="label">
            </el-table-column>
          </el-table>
        </el-tooltip>
      </div>
      <div v-if="displayType === 'papers'">
        <el-table
          :data="displayTable"
          stripe
          border
          style="width: 100%"
          :max-height="tableMaxHeight">
          <el-table-column
            fixed
            prop="年份"
            label="年份"
            width="180">
          </el-table-column>
          <el-table-column
            v-for="label in papers['head']"
            v-if="label != '年份'"
            :prop="label"
            :label="label">
          </el-table-column>
        </el-table>
      </div>
      <div v-if="displayType === 'council'">
        <el-table
          :data="displayTable"
          stripe
          border
          style="width: 100%"
          :max-height="tableMaxHeight">
          <el-table-column
            fixed
            prop="學年"
            label="學年"
            width="180">
          </el-table-column>
          <el-table-column
            v-for="label in council['head']"
            v-if="label != '學年'"
            :prop="label"
            :label="label">
          </el-table-column>
        </el-table>
      </div>
      <div v-if="displayType === 'questionnaire'">
        <el-tooltip :content="hotKeyReminder" :offset="50" placement="top-end">
          <el-table
            :data="displayTable"
            stripe
            border
            style="width: 100%"
            :max-height="tableMaxHeight">
            <el-table-column
              fixed
              prop="time"
              label="time"
              width="180">
            </el-table-column>
            <el-table-column
              v-for="label in questionnaire['head']"
              v-if="label != 'time'"
              :prop="label"
              :label="label">
            </el-table-column>
          </el-table>
        </el-tooltip>
      </div>
      <div v-if="displayType === 'graduate_credits'">
        <el-table
          :data="displayTable"
          stripe
          border
          style="width: 100%"
          :max-height="tableMaxHeight">
          <el-table-column
            v-for="label in graduate_credits['head']"
            :prop="label"
            :label="label">
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
  import kanban from './kanban';
  import StoreConfig from '../../renderer/storeConfig.js'
  import moment from 'moment';

  const storeConfig = new StoreConfig({
    // We'll call our data file 'user-preferences'
    configName: 'user-setting',
    defaults: {
      windowBounds: { width: 1000, height: 600 },
    }
  });

  export default {
    name: 'consolidate-page',
    mixins: [kanban],
    components: { kanban },
    data() {
      return {
        hotKeyReminder: '按住 <SHIFT鍵> 後滾動 <滑鼠滾輪> 即可左右滑動捲軸',
        currentPage: 1,
        pageSize: 50,
        tableMaxHeight: window.innerHeight - 300,
        selectYear: 'all',
        displayTypeStoredValue: 'profile',
      };
    },
    methods: {
      handleCommand(command) {
        this.selectYear = command;
      },
      handleCurrentChange(cp) {
        this.currentPage = cp;
      },
      handleSizeChange(size) {
        this.pageSize = size;
      },
      assignTableMaxHeight() {
        this.tableMaxHeight = window.innerHeight - 300
      },
    },
    mounted() {
      this.$nextTick(() => {
        window.addEventListener('resize', this.assignTableMaxHeight);
        this.assignTableMaxHeight();
      });
      this.selectYear = this.displayYearsList.reduce((largest, v) => {
          return parseInt(largest) < parseInt(v) ? v : largest
      }, this.displayYearsList[0]);
    },
    computed: {
      displayType: {
        get(){
          //this function will determine what is displayed in the input
          if (this.displayTypeStoredValue === 'graduateStandard') {
            this.pageSize = 5;
          } else {
            this.pageSize = 50;
          }
          return this.displayTypeStoredValue;
        },
        set(newVal){
          //this function will run whenever the input changes
          this.displayTypeStoredValue = newVal;
          this.selectYear = this.displayYearsList.reduce((largest, v) => {
            return parseInt(largest) < parseInt(v) ? v : largest
          }, this.displayYearsList[0]);
        }
      },
      displayYearsList() {
        let yrs = [];
        if (this.displayType === 'profile') {
          yrs = this[this.displayType].data.map((obj) => {
            return parseInt(obj.enrollYear, 10);
          });
        } else if (this.displayType === 'course') {
          yrs = this[this.displayType].data.map((obj) => {
            return parseInt(obj['學年學期'].replace('上', '').replace('下', ''), 10);
          });
        } else if (this.displayType === 'papers') {
          yrs = this[this.displayType].data.map((obj) => {
            return parseInt(obj['年份'], 10);
          });
        } else if (this.displayType === 'council') {
          yrs = this[this.displayType].data.map((obj) => {
            return parseInt(obj['學年'], 10);
          });
        } else if (this.displayType === 'questionnaire') {
          yrs = this[this.displayType].data.map((obj) => {
            return parseInt(moment(obj['time']).year(), 10);
          });
        } else if(this.displayType === 'graduateStandard') {
          yrs = this[this.displayType]['specific'].data.map((obj) => {
            return parseInt(obj['學年'], 10);
          });
        } else if(this.displayType === 'graduate_credits') {
          yrs = this[this.displayType].data.map((obj) => {
            return parseInt(obj['採計學年學期'], 10);
          });
        }
        return [...new Set(yrs)].sort((a, b) => a - b).map(v => v.toString());  
      },
      displayTable() {
        if (this.displayType === 'graduateStandard') {
          return {
            'score': this[this.displayType].score.data,
            'specific': this[this.displayType].specific.data.filter((obj) => {
              if (this.selectYear === 'all') {
                return true;
              }
              return parseInt(obj['學年'], 10) === parseInt(this.selectYear, 10);
            }).slice(
              (this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize,
            ),
          };
        } else {
          return this[this.displayType].data.filter((obj) => {
            if (this.selectYear === 'all') {
              return true;
            } else if (this.displayType === 'profile') {
              return parseInt(obj.enrollYear, 10) === parseInt(this.selectYear, 10);
            } else if (this.displayType === 'course') {
              return parseInt(obj['學年學期'].replace('上', '').replace('下', '')) === parseInt(this.selectYear, 10);
            } else if (this.displayType === 'council') {
              return parseInt(obj['學年'], 10) === parseInt(this.selectYear, 10);
            } else if (this.displayType === 'papers') {
              return parseInt(obj['年份'], 10) === parseInt(this.selectYear, 10);
            } else if (this.displayType === 'questionnaire') {
              return parseInt(moment(obj['time']).year(), 10) === parseInt(this.selectYear, 10);
            } else if (this.displayType === 'graduateStandard') {
              return parseInt(obj['學年'], 10) === parseInt(this.selectYear, 10);
            } else if (this.displayType == 'graduate_credits') {
              return parseInt(obj['採計學年學期'], 10) === parseInt(this.selectYear, 10);
            }
          }).slice(
            (this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize,
          );
        }
      },
      totalPages() {
        if (this.displayType === 'graduateStandard') {
          return this[this.displayType].specific.data.filter((obj) => {
            if (this.selectYear === 'all') {
              return true;
            } else {
              return parseInt(obj['學年'], 10) === parseInt(this.selectYear, 10);
            }
          }).length;
        } else {
          return this[this.displayType].data.filter((obj) => {
            if (this.selectYear === 'all') {
              return true;
            } else if(this.displayType === 'profile') {
              return parseInt(obj.enrollYear, 10) === parseInt(this.selectYear, 10);
            } else if(this.displayType === 'course') {
              return parseInt(obj['學年學期'].replace('上', '').replace('下', '')) === parseInt(this.selectYear, 10);
            } else if (this.displayType === 'council') {
              return parseInt(obj['學年'], 10) === parseInt(this.selectYear, 10);
            } else if (this.displayType === 'papers') {
              return parseInt(obj['年份'], 10) === parseInt(this.selectYear, 10);
            } else if (this.displayType === 'questionnaire') {
              return parseInt(moment(obj['time']).year(), 10) === parseInt(this.selectYear, 10);
            } else if (this.displayType === 'graduate_credits') {
              return parseInt(obj['採計學年學期'], 10) === parseInt(this.selectYear, 10);
            }
          }).length;
        }
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
  
  .paginateWrapper {
    display: flex;
    align-items: center;
  }

  #wrapper {
    padding: 0px 80px;
    padding-top: 40px;
  }

  .littlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .switchWrapper {
    padding: 12px;
    border: 3px solid;
    border-radius: 20px;
  }

</style>
