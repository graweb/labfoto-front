<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md3>
      <div style="text-align: center">
        <img :src="logo" width="80" />
      </div>
      <v-card>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-card-title>Bem vindo(a) ao LabFoto</v-card-title>
          <v-divider />
          <v-card-text>
            <v-text-field
              type="email"
              label="E-mail"
              required
              v-model="email"
              :rules="emailRules"
            />
            <v-text-field
              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show1 ? 'text' : 'password'"
              label="Senha"
              required
              :counter="10"
              v-model="password"
              :rules="passwordRules"
              @click:append="show1 = !show1"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" block tile :disabled="!valid" @click="login">
              Login
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: "login-view",
  metaInfo: {
    title: "LabFoto - Login",
  },

  data() {
    return {
      logo: require("../assets/logo.svg"),

      // VALIDATION FORM
      valid: true,
      email: "",
      password: "",
      show1: false,

      emailRules: [
        (v) => !!v || "E-mail é obrigatório",
        (v) => /.+@.+/.test(v) || "E-mail não é válido",
      ],

      passwordRules: [
        (v) => !!v || "Senha é obrigatório",
        (v) => v.length <= 10 || "Máximo 10 caracteres",
      ],
    };
  },

  methods: {
    login() {
      this.$refs.form.validate();

      const isLoading = this.$loading.show();

      this.api
        .login({
          email: this.email,
          password: this.password,
        })
        .then(async (res) => {
          localStorage.setItem("enterprise_id", res.data.user.enterprise_id);
          localStorage.setItem("user", res.data.user.name);
          localStorage.setItem("email", res.data.user.email);
          localStorage.setItem("type", res.data.user.type);
          localStorage.setItem("access_token", res.data.token);
          window.location.href = "dashboard";
        })
        .catch(() => {
          const Toast = this.$swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", this.$swal.stopTimer);
              toast.addEventListener("mouseleave", this.$swal.resumeTimer);
            },
          });

          Toast.fire({
            icon: "error",
            title: "Dados inválidos",
          });
        })
        .finally(() => {
          isLoading.hide();
        });
    },
  },
};
</script>

<style>
</style>