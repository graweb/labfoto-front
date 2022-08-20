<template>
  <v-container>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step :complete="step > 1" step="1">
          Dados básicos
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="step > 2" step="2">
          Recebemos seus dados
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-card class="mb-12" elevation="0">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.couple_name"
                    label="Nome do Casal *"
                    required
                    :rules="[(v) => !!v || 'Nome do Casal é obrigatório']"
                  />
                </v-col>
                <v-col cols="8">
                  <v-text-field
                    v-model="editedItem.contract_responsible"
                    label="Responsável contrato *"
                    required
                    :rules="[(v) => !!v || 'Responsável é obrigatório']"
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="editedItem.document"
                    label="CPF *"
                    required
                    :rules="[(v) => !!v || 'CPF é obrigatório']"
                  />
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    v-model="editedItem.phone_a"
                    label="Telefone 1 *"
                    required
                    :rules="[(v) => !!v || 'Telefone é obrigatório']"
                  />
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    v-model="editedItem.phone_b"
                    label="Telefone 2"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="editedItem.district"
                    label="Bairro *"
                    required
                    :rules="[(v) => !!v || 'Bairro é obrigatório']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.address"
                    label="Endereço *"
                    required
                    :rules="[(v) => !!v || 'Endereço é obrigatório']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.email"
                    label="E-mail *"
                    required
                    :rules="emailRules"
                  />
                </v-col>
              </v-row>
              <small style="color: red">* campos obrigatórios</small>
            </v-card>

            <v-btn color="primary" @click="save" :disabled="!valid">
              Enviar dados
            </v-btn>
          </v-form>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card class="mb-12" color="grey lighten-1" height="600px">
            <v-img height="600px" :src="imageSigned" />
          </v-card>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-container>
</template>

<script>
export default {
  name: "customer-register-view",
  metaInfo: {
    title: "LabFoto - Customer Register",
  },

  created() {
    this.imgBackground();
  },

  data() {
    return {
      valid: false,
      step: 1,
      services: [],
      imageSigned: "",
      editedItem: {
        contract_responsible: "",
        couple_name: "",
        document: "",
        phone_a: "",
        phone_b: "",
        district: "",
        address: "",
        email: "",
      },

      emailRules: [
        (v) => !!v || "E-mail é obrigatório",
        (v) => /.+@.+/.test(v) || "E-mail não é válido",
      ],
    };
  },

  methods: {
    imgBackground() {
      this.api.imgBackground().then(async (res) => {
        this.imageSigned = res.data.image_signed;
      });
    },

    save() {
      if (this.$refs.form.validate()) {

        const data = {
          enterprise_id: 1,
          contract_responsible: this.editedItem.contract_responsible,
          couple_name: this.editedItem.couple_name,
          document: this.editedItem.document,
          phone_a: this.editedItem.phone_a,
          phone_b: this.editedItem.phone_b,
          district: this.editedItem.district,
          address: this.editedItem.address,
          email: this.editedItem.email,
        };

        this.api
          .storeNewCustomer(data)
          .then(async (res) => {
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
              icon: "success",
              title: res.data.message,
            });

            this.step = 2;
            this.$refs.form.reset();
          })
          .catch((error) => {
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
              title: error.response.data.message,
            });
          });
      }
    },
  },
};
</script>

<style>
</style>