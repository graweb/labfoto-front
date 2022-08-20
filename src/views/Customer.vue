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
          <Button
            :icon="'mdi-file-document-edit-outline'"
            :tooltip="'Gerar Contrato'"
            @click="dialogContract = true"
            v-if="selected.length >= 1"
          />
          <Button :icon="'mdi-file-document-edit-outline'" v-else :disabled="true" />
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
              <span class="text-h5">Informações do Cliente</span>
            </v-card-title>
            <v-card-text>
              <v-container>
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
            >Deseja remover o(s) clientes(s) selecionado(s)?</v-card-text
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

      <v-dialog v-model="dialogContract" persistent max-width="480">
        <v-card>
          <v-card-title class="text-h5"> Atenção </v-card-title>
          <v-card-text
            >Deseja gerar o(s) Contrato(s) para o(s) Cliente(s)
            selecionado(s)?</v-card-text
          >
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="dialogContract = false">
              Não
            </v-btn>
            <v-btn color="primary" @click="saveContract"> Sim </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import Button from "../components/Button.vue";

export default {
  name: "customer-view",
  metaInfo: {
    title: "LabFoto - Customers",
  },

  components: {
    Button,
  },

  created() {
    this.listCustomers();
  },

  data() {
    return {
      valid: false,
      dialog: false,
      dialogRemove: false,
      dialogContract: false,
      loading: false,
      selected: [],
      datatable: [],
      services: [],
      search: "",
      headers: [
        { text: "CASAL", value: "couple_name" },
        { text: "RESPONSÁVEL CONTRATO", value: "contract_responsible" },
        { text: "TELEFONE", value: "phone_a" },
        { text: "E-MAIL", value: "email" },
      ],

      editedIndex: -1,
      editedItem: {
        id: "",
        service_type: "",
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
    listCustomers() {
      this.loading = true;

      this.api
        .listCustomers()
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
        })
        .finally(() => {
          this.loading = false;
        });
    },

    rowClick: function (item, row) {
      let selectState = row.isSelected ? false : true;
      row.select(selectState);
    },

    showDialog() {
      this.editedItem = {
        id: "",
        contract_responsible: "",
        couple_name: "",
        document: "",
        phone_a: "",
        phone_b: "",
        district: "",
        address: "",
        email: "",
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
          contract_responsible: this.editedItem.contract_responsible,
          couple_name: this.editedItem.couple_name,
          document: this.editedItem.document,
          phone_a: this.editedItem.phone_a,
          phone_b: this.editedItem.phone_b,
          district: this.editedItem.district,
          address: this.editedItem.address,
          email: this.editedItem.email,
        };

        if (this.editedItem.id === "") {
          this.api
            .storeCustomers(data)
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

              this.listCustomers();
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
            .updateCustomers(this.editedItem.id, data)
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

              this.listCustomers();
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
          .deleteCustomers(this.selected[i].id)
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

            this.listCustomers();
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

    saveContract() {
      for (var i = 0; i < this.selected.length; i++) {
        this.loading = true;

        const data = {
          enterprise_id: localStorage.getItem("enterprise_id"),
          customer_id: this.selected[i].id,
          signed: false,
          status_board: 1,
        };

        this.api
          .storeContracts(data)
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

            this.listCustomers();
            this.dialogContract = false;
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

            this.dialogContract = false;

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