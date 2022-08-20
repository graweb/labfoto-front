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
              <span class="text-h5">Informações do Pacote</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.name"
                      label="Nome do Pacote *"
                      required
                      :rules="[(v) => !!v || 'Nome do Pacote é obrigatório']"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="editedItem.amount"
                      label="Valor *"
                      required
                      :rules="[(v) => !!v || 'Valor é obrigatório']"
                    />
                  </v-col>
                  <v-col cols="8">
                    <v-text-field
                      v-model="editedItem.amount_full"
                      label="Valor por Extenso *"
                      required
                      :rules="[(v) => !!v || 'Valor por Extenso é obrigatório']"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="editedItem.payment_method"
                      label="Método de Pagamento *"
                      required
                      :rules="[
                        (v) => !!v || 'Método de Pagamento é obrigatório',
                      ]"
                    />
                  </v-col>
                  <v-col cols="3">
                    <v-switch
                      v-model="editedItem.pendrive"
                      inset
                      label="Pendrive"
                    />
                  </v-col>
                  <v-col cols="3">
                    <v-switch
                      v-model="editedItem.online"
                      inset
                      label="Online"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="editedItem.description"
                      label="Descrição *"
                      required
                      :rules="[(v) => !!v || 'Descrição é obrigatório']"
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
            >Deseja remover o(s) pacote(s) selecionado(s)?</v-card-text
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
    this.listPackages();
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
        { text: "PACOTE", value: "name" },
        { text: "VALOR", value: "amount" },
        { text: "MÉTODO DE PAGAMENTO", value: "payment_method" },
        { text: "DESCRIÇÃO", value: "description" },
      ],

      editedIndex: -1,
      editedItem: {
        id: "",
        name: "",
        amount: "",
        amount_full: "",
        payment_method: "",
        pendrive: false,
        online: false,
        description: "",
      },
    };
  },

  methods: {
    listPackages() {
      this.api
        .listPackages()
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
        amount: "",
        amount_full: "",
        payment_method: "",
        pendrive: false,
        online: false,
        description: "",
      };
      this.valid = true;
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
          enterprise_id: localStorage.getItem("enterprise_id"),
          name: this.editedItem.name,
          amount: this.editedItem.amount,
          amount_full: this.editedItem.amount_full,
          payment_method: this.editedItem.payment_method,
          pendrive: this.editedItem.pendrive,
          online: this.editedItem.online,
          description: this.editedItem.description,
        };

        if (this.editedItem.id === "") {
          this.api
            .storePackages(data)
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

              this.listPackages();
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
            .updatePackages(this.editedItem.id, data)
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

              this.listPackages();
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
          .deletePackages(this.selected[i].id)
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

            this.listPackages();
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
              title: error.response.data.message,
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