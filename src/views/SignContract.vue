<template>
  <v-container>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step :complete="step > 1" step="1">
          Assinar Contrato
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="step > 2" step="2">
          Visualizar Contrato
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card class="mx-auto">
            <v-img height="280px" :src="imageBack" />

            <v-card-title>Olá {{ customer }}</v-card-title>

            <v-card-text class="text--primary">
              <div>Estamos muito felizes de fazer parte desse dia especial. Clique em Assinar Contrato e depois em continuar.</div>

              <v-switch v-model="signed" inset label="Assinar Contrato" />
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" @click="signContract" :disabled="!signed">
                Continuar
              </v-btn>
              <v-btn color="grey" @click="contractGenerate(0)">
                Contrato
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card class="mb-12" color="grey lighten-1" height="600px">
            <v-img height="600px" :src="imageSigned" />
          </v-card>

          <v-btn color="primary" @click="contractGenerate(1)"> Ver contrato assinado </v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-container>
</template>

<script>
export default {
  name: "sign-contract-view",
  metaInfo: {
    title: "LabFoto - Sign Contract",
  },

  created() {
    this.contractCustomer();
    this.imgBackground();
  },

  data() {
    return {
      step: 1,
      signed: false,
      contract: [],
      imageBack: '',
      imageSigned: '',
      customer: '',
    };
  },

  methods: {
    contractCustomer() {
      const urlContract = window.location.href.split("/");
      this.api.contractCustomer(urlContract[4]).then(async (res) => {

        if(res.data.signed) {
          this.step = 2
        }

        this.customer = res.data.customer.contract_responsible
        this.contract = res.data;
      });
    },

    contractGenerate(sign) {
      const urlContract = window.location.href.split("/");
      window.open(process.env.VUE_APP_API_URL + 'api/contract_generate/' + urlContract[4] + '/' + sign)
    },

    imgBackground() {
      this.api.imgBackground().then(async (res) => {
        this.imageBack = res.data.image_back
        this.imageSigned = res.data.image_signed
      });
    },

    signContract() {
      const urlContract = window.location.href.split("/");
      this.api.contractGenerate(urlContract[4], 1).then(async (res) => {
        console.log(res.data)
      });
      this.step = 2
    }
  },
};
</script>

<style>
</style>