<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="datatable"
      item-key="id"
      show-select
      class="elevation-1"
      :search="search"
      :loading="loading"
      loading-text="Carregando..."
      @click:row="rowClick"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <Button :icon="'mdi-plus'" :tooltip="'Novo'" @click="showDialog" />
          <Button
            :icon="'mdi-pencil'"
            :tooltip="'Editar'"
            @click="editDialog"
            v-if="selected.length == 1"
          />
          <Button :icon="'mdi-pencil'" v-else :disabled="true" />
          <Button
            :icon="'mdi-close'"
            :tooltip="'Remover'"
            @click="dialogRemove = true"
            v-if="selected.length >= 1"
          />
          <Button :icon="'mdi-close'" v-else :disabled="true" />
        </v-toolbar>

        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Buscar"
            single-line
            hide-details
          />
        </v-card-title>
      </template>
    </v-data-table>

    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-card>
            <v-card-title>
              <span class="text-h5">Informações da Empresa</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.name"
                      label="Nome da Empresa *"
                      required
                      :rules="[(v) => !!v || 'Nome da Empresa é obrigatório']"
                    />
                  </v-col>
                  <v-col cols="8">
                    <v-text-field
                      v-model="editedItem.responsible"
                      label="Responsável *"
                      required
                      :rules="[(v) => !!v || 'Responsável é obrigatório']"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="editedItem.cnpj"
                      label="CNPJ *"
                      required
                      :rules="[(v) => !!v || 'CNPJ é obrigatório']"
                    />
                  </v-col>
                  <v-col cols="8">
                    <v-text-field
                      v-model="editedItem.address"
                      label="Endereço *"
                      required
                      :rules="[(v) => !!v || 'Endereço é obrigatório']"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="editedItem.district"
                      label="Bairro *"
                      required
                      :rules="[(v) => !!v || 'Bairro é obrigatório']"
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
              </v-container>
              <small style="color: red">* campos obrigatórios</small>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" text @click="dialog = false">
                Fechar
              </v-btn>
              <v-btn color="primary" :disabled="!valid" @click="save">
                Salvar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-dialog v-model="dialogRemove" persistent max-width="420">
        <v-card>
          <v-card-title class="text-h5"> Atenção </v-card-title>
          <v-card-text
            >Deseja remover a(s) empresa(s) selecionado(s)?</v-card-text
          >
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="dialogRemove = false">
              Não
            </v-btn>
            <v-btn color="primary" @click="saveDelete"> Sim </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import Button from "../components/Button.vue";

export default {
  name: "package-view",
  metaInfo: {
    title: "LabFoto - Packages",
  },

  components: {
    Button,
  },

  created() {
    this.listEnterprises();
  },

  data() {
    return {
      valid: false,
      dialog: false,
      dialogRemove: false,
      loading: false,
      selected: [],
      datatable: [],
      search: "",
      headers: [
        { text: "EMPRESA", value: "name" },
        { text: "CNPJ", value: "cnpj" },
        { text: "RESPONSÁVEL", value: "responsible" },
        { text: "E-MAIL", value: "email" },
      ],

      editedIndex: -1,
      editedItem: {
        id: "",
        name: "",
        cnpj: "",
        responsible: "",
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
    listEnterprises() {
      this.api
        .listEnterprises()
        .then(async (res) => {
          this.datatable = res.data.data;
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
    },

    rowClick: function (item, row) {
      let selectState = row.isSelected ? false : true;
      row.select(selectState);
    },

    showDialog() {
      this.editedItem = {
        id: "",
        name: "",
        cnpj: "",
        responsible: "",
        district: "",
        address: "",
        email: "",
      };
      this.dialog = true;
    },

    editDialog() {
      this.editedIndex = this.datatable.indexOf(this.selected);
      this.editedItem = Object.assign({}, this.selected[0]);
      this.dialog = true;
    },

    save() {
      if (this.$refs.form.validate()) {
        this.loading = true;

        const data = {
          name: this.editedItem.name,
          cnpj: this.editedItem.cnpj,
          responsible: this.editedItem.responsible,
          district: this.editedItem.district,
          address: this.editedItem.address,
          email: this.editedItem.email,
        };

        if (this.editedItem.id === "") {
          this.api
            .storeEnterprises(data)
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

              this.listEnterprises();
              this.dialog = false;
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
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          this.api
            .updateEnterprises(this.editedItem.id, data)
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

              this.listEnterprises();
              this.dialog = false;
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
            })
            .finally(() => {
              this.loading = false;
            });
        }

        this.selected = [];
      }
    },

    saveDelete() {
      for (var i = 0; i < this.selected.length; i++) {
        this.loading = true;

        this.api
          .deleteEnterprises(this.selected[i].id)
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

            this.listEnterprises();
            this.dialogRemove = false;
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
              title: error.response.data,
            });
          })
          .finally(() => {
            this.loading = false;
          });
      }

      this.selected = [];
    },
  },
};
</script>

<style>
</style>