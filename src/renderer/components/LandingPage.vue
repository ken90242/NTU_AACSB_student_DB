<template>
  <div id="wrapper">
    <kanban activeIndex="1"></kanban>
  </div>
</template>

<script>
  // import SystemInformation from './LandingPage/SystemInformation';
  import kanban from './kanban';
  import eventBus from './eventBus';

  export default {
    name: 'landing-page',
    data() {
      return {
        bus: eventBus,
      };
    },
    components: { kanban },
    methods: {
      open(link) {
        this.$electron.shell.openExternal(link);
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
    width: 100%;
    /*width: 100vw;*/
  }

  #logo {
    height: auto;
    width: 420px;
  }

</style>
