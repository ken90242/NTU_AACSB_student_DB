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
        <br/><br/>
        <h2>(2) 歷年必修課程</h2>
        <br/>
        <div class="paginateWrapper">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[5, 15, 50, 100, 300]"
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
            label="學年">
          </el-table-column>
          <el-table-column
            v-for="label in graduateStandard.specific['head']"
            v-if="label != '學年'"
            :prop="label"
            :label="label">
          </el-table-column>
        </el-table>
      </section>
      <div v-else class="paginateWrapper">
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
            prop="作者學號"
            label="作者學號"
            width="180">
          </el-table-column>
          <el-table-column
            v-for="label in papers['head']"
            v-if="label != '作者學號'"
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
      
    </div>
  </div>
</template>

<script>
  import kanban from './kanban';
  import StoreConfig from '../../renderer/storeConfig.js'

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
        displayType: 'profile',
        currentPage: 1,
        pageSize: 5,
        tableMaxHeight: window.innerHeight - 300,
      };
    },
    methods: {
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
      })
    },
    computed: {
      displayTable() {
        if (this.displayType === 'graduateStandard') {
          return {
            'score': this[this.displayType].score.data,
            'specific': this[this.displayType].specific.data.slice(
              (this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize,
            ),
          };
        } else {
          return this[this.displayType].data.slice(
            (this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize,
          );
        }
      },
      totalPages() {
        if (this.displayType === 'graduateStandard') {
          return this[this.displayType].specific.data.length;
        } else {
          return this[this.displayType].data.length;
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


  /*.el-table__body-wrapper::-webkit-scrollbar {*/
    /*-webkit-appearance: none;*/
  /*}*/

  /*.el-table__body-wrapper::-webkit-scrollbar:horizontal {*/
    /*height: 20px;*/
    /*width: 240px;*/
  /*}*/

  /*.el-table__body-wrapper::-webkit-scrollbar-thumb {*/
    /*border-radius: 8px;*/
    /*border: 2px solid white;  /*should match background, can't be transparent */
    /*background-color: rgba(0, 0, 0, .5);
  }*/

  .freezeTop {

  }
</style>
