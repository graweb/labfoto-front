<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        elevation="2"
        class="ml-4 mt-4 mr-0 mb-4"
        outlined
        color="grey darken-3"
        v-on="on"
        v-bind="attrs"
        @click="click"
        :disabled="disabled"
      >
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>
</template>

<script>
export default {
  name: "table-view",
  metaInfo: {
    title: "LabFoto",
  },

  props: {
    icon: String,
    tooltip: String,
    disabled: Boolean
  },

  methods: {
    click() {
      this.$emit("click");
    },
  },
};
</script>

<style>
</style>