<template>
  <!-- Common snackbar -->
  <v-snackbar :value="show" :color="options.color" @input="$emit('update-show', $event)">
    {{ options.msg }}
    <v-btn text @click.native="$emit('update-show', false)">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  name: 'SnackMsg',
  props: {
    /*
     * Options object contains show, color, msg properties
     */
    options: {
      type: Object,
      required: true
    }
  },
  computed: {
    show() {
      return this.options.show
    }
  }
}
</script>
