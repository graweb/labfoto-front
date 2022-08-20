<template>
  <v-app v-if="logged">
    <v-navigation-drawer
      app
      v-if="this.$router.history.current.fullPath != '/'"
      clipped
      mini-variant
      permanent
      class="grey darken-3"
      dark
    >
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-img :src="logo"></v-img>
        </v-list-item-avatar>

        <v-list-item-title>LabFoto</v-list-item-title>

        <v-btn icon @click.stop="mini = !mini">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
          @click="item.action"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on, attrs }">
              <v-list-item-content v-bind="attrs" v-on="on">
                <v-list-item-icon>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-item-icon>
              </v-list-item-content>
            </template>
            <span>{{ item.tooltip }}</span>
          </v-tooltip>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <v-list dense>
          <v-list-item link @click="logout">
            <v-tooltip right>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-content v-bind="attrs" v-on="on">
                  <v-list-item-icon>
                    <v-icon>mdi-logout</v-icon>
                  </v-list-item-icon>
                </v-list-item-content>
              </template>
              <span>Sair do sistema</span>
            </v-tooltip>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container
        fluid
        :class="
          this.$router.history.current.fullPath != '/' ? '' : 'fill-height'
        "
      >
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>

  <v-app v-else>
    <v-main>
      <v-container
        fluid
        :class="
          this.$router.history.current.fullPath != '/' ? '' : 'fill-height'
        "
      >
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import api from "./services/api";

export default {
  name: "App",
  metaInfo: {
    title: "LabFoto",
  },

  data() {
    return {
      logo: require("./assets/logo.svg"),
      logged: false,
      items: [
        {
          title: "Home",
          icon: "mdi-home",
          tooltip: "Home",
          action: () => {
            this.$router.push("/dashboard").catch(() => {});
          },
        },
        {
          title: "Empresas",
          icon: "mdi-domain",
          tooltip: "Empresas",
          action: () => {
            this.$router.push("/enterprises").catch(() => {});
          },
        },
        {
          title: "Pacotes",
          icon: "mdi-semantic-web",
          tooltip: "Pacotes",
          action: () => {
            this.$router.push("/packages").catch(() => {});
          },
        },
        {
          title: "Clientes",
          icon: "mdi-account-multiple",
          tooltip: "Clientes",
          action: () => {
            this.$router.push("/customers").catch(() => {});
          },
        },
        {
          title: "Contratos",
          icon: "mdi-file-document",
          tooltip: "Contratos",
          action: () => {
            this.$router.push("/contracts").catch(() => {});
          },
        },
        /*{
          title: "Agenda",
          icon: "mdi-calendar-check-outline",
          tooltip: "Agenda",
          action: () => {
            this.$router.push("/schedules").catch(() => {});
          },
        },
        {
          title: "Tarefas",
          icon: "mdi-animation",
          tooltip: "Tarefas",
          action: () => {
            this.$router.push("/tasks").catch(() => {});
          },
        },
        {
          title: "Relatórios",
          icon: "mdi-file-chart-outline",
          tooltip: "Relatórios",
          action: () => {
            this.$router.push("/reports").catch(() => {});
          },
        },*/
      ],
    };
  },

  created() {
    this.isLogged();
  },

  methods: {
    isLogged() {
      const urlContract = window.location.href.split("/");
      if (localStorage.getItem("access_token") != null) {
        if (api.isLogged({ token: localStorage.getItem("access_token") })) {
          if(urlContract[3] === "register" || urlContract[3] === "sign_contract") {
            this.logged = false;
          } else {
            this.logged = true;
          }
        }
      } else {
        this.logged = false;
      }
    },

    logout() {
      this.$swal
        .fire({
          title: "Deseja sair do sistema?",
          icon: "question",
          showCancelButton: true,
          cancelButtonColor: "#d33",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.api.logout({ email: localStorage.getItem("user") });
            this.$router.push("/");
          }
        });
    },
  },
};
</script>

<style>
.v-toolbar__content,
.v-toolbar__extension {
  padding: 0 !important;
}

.swal2-title {
  font-size: 14px;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
