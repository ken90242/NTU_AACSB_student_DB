<template>
  <div id="wrapper">
    <kanban activeIndex="3"></kanban>
    <div>
      
      <!-- <div class="littlebar"> -->
        <el-tabs v-model="displayType" type="card">
          <el-tab-pane label="A. 研教組年度資料" name="profile"></el-tab-pane>
          <el-tab-pane label="B. 歷年學生修課紀錄" name="course"></el-tab-pane>
          <el-tab-pane label="C. 畢業生論文" name="papers"></el-tab-pane>
          <el-tab-pane label="D. 學生會成員" name="council"></el-tab-pane>
          <el-tab-pane label="E. GMBA線上問卷" name="questionnaire"></el-tab-pane>
        </el-tabs>
        <div class="paginateWrapper">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 50, 100, 300]"
            :page-size="pageSize"
            layout="sizes, total, prev, pager, next"
            :total="totalPages">
          </el-pagination>
        </div>
      <!-- </div> -->
      <div v-if="displayType === 'profile'">
        <el-table
          :data="displayTable"
          stripe
          border
          style="width: 100%">
          <el-table-column
            fixed
            prop="學號"
            label="學號"
            width="180">
          </el-table-column>
          <el-table-column
            v-for="label in bus.profile['head']"
            v-if="label != '學號'"
            :prop="label"
            :label="label">
          </el-table-column>
        </el-table>
      </div>
      <div v-if="displayType === 'course'">
        <el-table
          :data="displayTable"
          stripe
          border
          style="width: 100%">
          <el-table-column
            fixed
            prop="學年學期"
            label="學年學期"
            width="180">
          </el-table-column>
          <el-table-column
            v-for="label in bus.course['head']"
            v-if="label != '異動碼' && label != '學年學期'"
            :prop="label"
            :label="label">
          </el-table-column>
        </el-table>
      </div>
      <div v-if="displayType === 'papers'">
        <el-table
          :data="displayTable"
          stripe
          border
          style="width: 100%">
          <el-table-column
            fixed
            prop="作者學號"
            label="作者學號"
            width="180">
          </el-table-column>
          <el-table-column
            v-for="label in bus.papers['head']"
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
          style="width: 100%">
          <el-table-column
            fixed
            prop="學年"
            label="學年"
            width="180">
          </el-table-column>
          <el-table-column
            v-for="label in bus.council['head']"
            v-if="label != '學年'"
            :prop="label"
            :label="label">
          </el-table-column>
        </el-table>
      </div>
      <div v-if="displayType === 'questionnaire'">
        <el-table
          :data="displayTable"
          stripe
          border
          style="width: 100%">
          <el-table-column
            fixed
            prop="time"
            label="time"
            width="180">
          </el-table-column>
          <el-table-column
            v-for="label in bus.questionnaire['head']"
            v-if="label != 'time'"
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
  import eventBus from './eventBus';

  export default {
    name: 'consolidate-page',
    components: { kanban },
    data() {
      return {
        bus: eventBus,
        displayType: 'profile',
        currentPage: 1,
        pageSize: 10,
      };
    },
    methods: {
      handleCurrentChange(cp) {
        this.currentPage = cp;
      },
      handleSizeChange(size) {
        this.pageSize = size;
      },
    },
    computed: {
      displayTable() {
        return this.bus[this.displayType].data.slice(
          (this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize,
        );
      },
      totalPages() {
        return this.bus[this.displayType].data.length;
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
