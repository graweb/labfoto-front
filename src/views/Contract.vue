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
            :icon="'mdi-email-outline'"
            :tooltip="'Solicitar assinatura'"
            @click="dialogSendContractByEmail = true"
            v-if="selected.length >= 1"
          />
          <Button :icon="'mdi-email-outline'" v-else :disabled="true" />
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

      <template v-slot:[`item.signed`]="{ item }">
        <v-chip v-if="item.signed == 1" color="green lighten-4">
          Assinado
        </v-chip>
        <v-chip v-else color="orange lighten-4"> Aguardando </v-chip>
      </template>
    </v-data-table>

    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-card>
            <v-card-title>
              <span class="text-h5">Informações do Contrato</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-tabs v-model="tab">
                  <v-tab href="#allTab">Gerais</v-tab>
                  <v-tab
                    href="#eventTab"
                    v-if="
                      editedItem.service_type == 7 ||
                      editedItem.service_type == 10 ||
                      editedItem.service_type == 11
                    "
                    >Evento</v-tab
                  >
                  <v-tab
                    href="#registryTab"
                    v-if="
                      editedItem.service_type == 3 ||
                      editedItem.service_type == 9
                    "
                    >Cartório</v-tab
                  >
                  <v-tab
                    href="#churchTab"
                    v-if="
                      editedItem.service_type == 1 ||
                      editedItem.service_type == 5 ||
                      editedItem.service_type == 6 ||
                      editedItem.service_type == 8
                    "
                    >Igreja</v-tab
                  >
                  <v-tab
                    href="#receptionTab"
                    v-if="
                      editedItem.service_type == 2 ||
                      editedItem.service_type == 4 ||
                      editedItem.service_type == 5 ||
                      editedItem.service_type == 8 ||
                      editedItem.service_type == 9
                    "
                    >Recepção</v-tab
                  >
                  <v-tab href="#makingOfTab" v-if="editedItem.service_type == 4"
                    >Making Of</v-tab
                  >
                  <v-tab href="#albumTab">Álbum</v-tab>
                  <v-tab href="#additionalsTab">Adicionais</v-tab>

                  <v-tabs-items :value="tab">
                    <v-tab-item value="allTab">
                      <v-card flat>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12">
                              <v-autocomplete
                                v-model="editedItem.customer_id"
                                :items="customers"
                                label="Cliente *"
                                required
                                item-text="couple_name"
                                item-value="id"
                                :rules="[(v) => !!v || 'Cliente é obrigatório']"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-select
                                v-model="editedItem.service_type"
                                :items="serviceType"
                                label="Serviço *"
                                item-text="service"
                                item-value="id"
                              />
                            </v-col>
                            <v-col cols="8">
                              <v-select
                                v-model="editedItem.package_id"
                                :items="packages"
                                label="Pacote *"
                                return-object
                                required
                                @change="
                                  packageSelected(
                                    `${editedItem.package_id.pendrive}`,
                                    `${editedItem.package_id.online}`,
                                    `${editedItem.package_id.amount}`
                                  )
                                "
                                item-text="name"
                                item-value="id"
                                :rules="[(v) => !!v || 'Pacote é obrigatório']"
                              />
                            </v-col>
                            <v-col cols="4">
                              <v-text-field
                                v-model="totalPackage"
                                label="Valor"
                                disabled="true"
                              />
                            </v-col>
                            <v-col cols="5">
                              <v-text-field
                                v-model="editedItem.professionals_total"
                                label="Nº de Profissionais *"
                                required
                                :rules="[
                                  (v) =>
                                    !!v || 'Nº de Profissionais é obrigatório',
                                ]"
                              />
                            </v-col>
                            <v-col cols="3">
                              <v-switch
                                v-model="editedItem.signed"
                                inset
                                label="Assinado?"
                              ></v-switch>
                            </v-col>
                            <v-col cols="4" v-if="editedItem.signed">
                              <v-menu
                                v-model="menuDateSignedAt"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="signedAt"
                                    label="Assinado em"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="signedAt"
                                  :first-day-of-week="1"
                                  locale="pt-br"
                                  @input="menuDateSignedAt = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                    <v-tab-item
                      value="eventTab"
                      v-if="
                        editedItem.service_type == 7 ||
                        editedItem.service_type == 10 ||
                        editedItem.service_type == 11
                      "
                    >
                      <v-card flat>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12">
                              <v-select
                                v-model="editedItem.event_type"
                                :items="eventType"
                                label="Tipo de Evento"
                                required
                                item-text="event"
                                item-value="id"
                                :rules="[
                                  (v) => !!v || 'Tipo de Evento é obrigatório',
                                ]"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-text-field
                                v-model="editedItem.event_address"
                                label="Endereço Evento *"
                                required
                                :rules="[
                                  (v) => !!v || 'Endereço Evento é obrigatório',
                                ]"
                              />
                            </v-col>
                            <v-col cols="6">
                              <v-menu
                                v-model="menuEventDate"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="eventDate"
                                    label="Data do Evento *"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                    :rules="[
                                      (v) =>
                                        !!v || 'Data do Evento é obrigatório',
                                    ]"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="eventDate"
                                  :first-day-of-week="1"
                                  locale="pt-br"
                                  @input="menuEventDate = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-col>
                            <v-col cols="6">
                              <v-menu
                                ref="menuEventTime"
                                v-model="menuEventTime"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="eventTime"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="eventTime"
                                    label="Horário Evento"
                                    prepend-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                    :rules="[
                                      (v) =>
                                        !!v ||
                                        'Horário do Evento é obrigatório',
                                    ]"
                                  ></v-text-field>
                                </template>
                                <v-time-picker
                                  v-if="menuEventTime"
                                  v-model="eventTime"
                                  format="24hr"
                                  @click:minute="
                                    $refs.menuEventTime.save(eventTime)
                                  "
                                ></v-time-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                    <v-tab-item
                      value="registryTab"
                      v-if="
                        editedItem.service_type == 3 ||
                        editedItem.service_type == 9
                      "
                    >
                      <v-card flat>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12">
                              <v-text-field
                                v-model="editedItem.registry"
                                label="Cartório *"
                                required
                                :rules="[
                                  (v) => !!v || 'Cartório é obrigatório',
                                ]"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-text-field
                                v-model="editedItem.registry_address"
                                label="Endereço do Cartório *"
                                required
                                :rules="[
                                  (v) =>
                                    !!v || 'Endereço do Cartório é obrigatório',
                                ]"
                              />
                            </v-col>
                            <v-col cols="6">
                              <v-menu
                                v-model="menuRegistryDate"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="registryDate"
                                    label="Data do Cartório *"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                    :rules="[
                                      (v) =>
                                        !!v || 'Data do Cartório é obrigatório',
                                    ]"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="registryDate"
                                  :first-day-of-week="1"
                                  locale="pt-br"
                                  @input="menuRegistryDate = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-col>
                            <v-col cols="6">
                              <v-menu
                                ref="menuRegistryTime"
                                v-model="menuRegistryTime"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="registryTime"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="registryTime"
                                    label="Horário Cartório"
                                    prepend-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                    :rules="[
                                      (v) =>
                                        !!v ||
                                        'Horário do Cartório é obrigatório',
                                    ]"
                                  ></v-text-field>
                                </template>
                                <v-time-picker
                                  v-if="menuRegistryTime"
                                  v-model="registryTime"
                                  full-width
                                  format="24hr"
                                  @click:minute="
                                    $refs.menuRegistryTime.save(registryTime)
                                  "
                                ></v-time-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                    <v-tab-item
                      value="churchTab"
                      v-if="
                        editedItem.service_type == 1 ||
                        editedItem.service_type == 5 ||
                        editedItem.service_type == 6 ||
                        editedItem.service_type == 8
                      "
                    >
                      <v-card flat>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12">
                              <v-text-field
                                v-model="editedItem.church"
                                label="Igreja *"
                                required
                                :rules="[(v) => !!v || 'Igreja é obrigatório']"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-text-field
                                v-model="editedItem.church_address"
                                label="Endereço da Igreja *"
                                required
                                :rules="[
                                  (v) =>
                                    !!v || 'Endereço da Igreja é obrigatório',
                                ]"
                              />
                            </v-col>
                            <v-col cols="6">
                              <v-menu
                                v-model="menuChurchDate"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="churchDate"
                                    label="Data Igreja *"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                    :rules="[
                                      (v) =>
                                        !!v || 'Data da Igreja é obrigatório',
                                    ]"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="churchDate"
                                  :first-day-of-week="1"
                                  locale="pt-br"
                                  @input="menuChurchDate = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-col>
                            <v-col cols="6">
                              <v-menu
                                ref="menuChurchTime"
                                v-model="menuChurchTime"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="churchTime"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="churchTime"
                                    label="Horário Igreja"
                                    prepend-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                    :rules="[
                                      (v) =>
                                        !!v ||
                                        'Horário da Igreja é obrigatório',
                                    ]"
                                  ></v-text-field>
                                </template>
                                <v-time-picker
                                  v-if="menuChurchTime"
                                  v-model="churchTime"
                                  full-width
                                  format="24hr"
                                  @click:minute="
                                    $refs.menuChurchTime.save(churchTime)
                                  "
                                ></v-time-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                    <v-tab-item
                      value="receptionTab"
                      v-if="
                        editedItem.service_type == 2 ||
                        editedItem.service_type == 4 ||
                        editedItem.service_type == 5 ||
                        editedItem.service_type == 8 ||
                        editedItem.service_type == 9
                      "
                    >
                      <v-card flat>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12">
                              <v-text-field
                                v-model="editedItem.reception"
                                label="Recepção *"
                                required
                                :rules="[
                                  (v) => !!v || 'Recepção é obrigatório',
                                ]"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-text-field
                                v-model="editedItem.reception_address"
                                label="Endereço da Recepção *"
                                required
                                :rules="[
                                  (v) =>
                                    !!v || 'Endereço da Recepção é obrigatório',
                                ]"
                              />
                            </v-col>
                            <v-col cols="6">
                              <v-menu
                                v-model="menuReceptionDate"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="receptionDate"
                                    label="Data da Recepção *"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                    :rules="[
                                      (v) =>
                                        !!v || 'Data da Recepção é obrigatório',
                                    ]"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="receptionDate"
                                  :first-day-of-week="1"
                                  locale="pt-br"
                                  @input="menuReceptionDate = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-col>
                            <v-col cols="6">
                              <v-menu
                                ref="menuReceptionTime"
                                v-model="menuReceptionTime"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="receptionTime"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="receptionTime"
                                    label="Horário Recepção"
                                    prepend-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                    :rules="[
                                      (v) =>
                                        !!v ||
                                        'Horário da Recepção é obrigatório',
                                    ]"
                                  ></v-text-field>
                                </template>
                                <v-time-picker
                                  v-if="menuReceptionTime"
                                  v-model="receptionTime"
                                  full-width
                                  format="24hr"
                                  @click:minute="
                                    $refs.menuReceptionTime.save(receptionTime)
                                  "
                                ></v-time-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                    <v-tab-item
                      value="makingOfTab"
                      v-if="editedItem.service_type == 4"
                    >
                      <v-card flat>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12">
                              <v-text-field
                                v-model="editedItem.making_of"
                                label="Making Of *"
                                required
                                :rules="[
                                  (v) => !!v || 'Making Of é obrigatório',
                                ]"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-text-field
                                v-model="editedItem.making_of_address"
                                label="Endereço do Making Of *"
                                required
                                :rules="[
                                  (v) =>
                                    !!v ||
                                    'Endereço do Making Of é obrigatório',
                                ]"
                              />
                            </v-col>
                            <v-col cols="6">
                              <v-menu
                                v-model="menuMakingOfDate"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="makingOfDate"
                                    label="Data do Making Of *"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                    :rules="[
                                      (v) =>
                                        !!v ||
                                        'Data do Making Of é obrigatório',
                                    ]"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="makingOfDate"
                                  :first-day-of-week="1"
                                  locale="pt-br"
                                  @input="menuMakingOfDate = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-col>
                            <v-col cols="6">
                              <v-menu
                                ref="menuMakingOfTime"
                                v-model="menuMakingOfTime"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="makingOfTime"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="makingOfTime"
                                    label="Horário Making Of"
                                    prepend-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    required
                                    :rules="[
                                      (v) =>
                                        !!v ||
                                        'Horário do Making Of é obrigatório',
                                    ]"
                                  ></v-text-field>
                                </template>
                                <v-time-picker
                                  v-if="menuMakingOfTime"
                                  v-model="makingOfTime"
                                  full-width
                                  format="24hr"
                                  @click:minute="
                                    $refs.menuMakingOfTime.save(makingOfTime)
                                  "
                                ></v-time-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                    <v-tab-item value="albumTab">
                      <v-card flat>
                        <v-card-text>
                          <v-row>
                            <v-col cols="5">
                              <v-select
                                v-model="editedItem.album_size"
                                :items="albumSize"
                                label="Tamanho"
                                required
                                item-text="size"
                                item-value="id"
                              />
                            </v-col>
                            <v-col cols="7">
                              <v-select
                                v-model="editedItem.album_type"
                                :items="albumType"
                                label="Tipo de Álbum"
                                required
                                item-text="album"
                                item-value="id"
                              />
                            </v-col>
                            <v-col cols="5">
                              <v-select
                                v-model="editedItem.album_blade"
                                :items="albumBlades"
                                label="Nº de Lâminas"
                                required
                                item-text="blade"
                                item-value="id"
                              />
                            </v-col>
                            <v-col cols="7">
                              <v-select
                                v-model="editedItem.delivery_type"
                                :items="deliveryType"
                                label="Tipo de Entrega"
                                required
                                item-text="delivery"
                                item-value="id"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-switch
                                v-model="editedItem.example_photos"
                                inset
                                label="Prova para escolhas das fotos para confecção do álbum"
                              ></v-switch>
                              <v-switch
                                v-model="editedItem.album_case"
                                inset
                                label="Estojo álbum"
                              ></v-switch>
                              <v-select
                                v-if="editedItem.album_case"
                                v-model="editedItem.box_case"
                                :items="boxCases"
                                label="Tipo de Estojo"
                                required
                                item-text="box"
                                item-value="id"
                              />
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                    <v-tab-item value="additionalsTab">
                      <v-card flat>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12">
                              <v-switch
                                v-model="editedItem.trial_photos"
                                inset
                                label="Ensaio Pré evento ou Pós evento"
                              ></v-switch>
                              <v-switch
                                v-model="editedItem.woman_day"
                                inset
                                label="Dia da noiva"
                              ></v-switch>
                              <v-switch
                                v-model="editedItem.man_day"
                                inset
                                label="Dia do noivo"
                              ></v-switch>
                              <v-switch
                                v-model="editedItem.debutante_day"
                                inset
                                label="Dia da debutante"
                              ></v-switch>
                              <v-switch
                                v-model="editedItem.drone_photos"
                                inset
                                label="Drone/fotografias aéreas"
                              ></v-switch>
                              <v-switch
                                v-model="editedItem.external_team"
                                inset
                                label="Equipe Frigoletto’s Fotos"
                              ></v-switch>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                  </v-tabs-items>
                </v-tabs>
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

      <v-dialog v-model="dialogSendContractByEmail" persistent max-width="420">
        <v-card>
          <v-card-title class="text-h5"> Atenção </v-card-title>
          <v-card-text
            >Deseja enviar o(s) contratos(s) selecionado(s) para o e-mail do
            cliente?</v-card-text
          >
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="red darken-1"
              text
              @click="dialogSendContractByEmail = false"
            >
              Não
            </v-btn>
            <v-btn color="primary" @click="sendContractByEmail"> Sim </v-btn>
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
    title: "LabFoto - Contracts",
  },

  components: {
    Button,
  },

  created() {
    this.listCustomers();
    this.listContracts();
    this.listPackages();
  },

  watch: {
    options: {
      handler() {
        this.listCustomers();
        this.listPackages();
      },
      deep: true,
    },
  },

  data() {
    return {
      valid: false,
      dialog: false,
      dialogRemove: false,
      dialogSendContractByEmail: false,
      loading: false,
      selected: [],
      datatable: [],
      customers: [],
      packages: [],
      totalPackage: "",
      tab: "allTab",
      search: "",

      headers: [
        { text: "CASAL", value: "customer.couple_name" },
        { text: "TIPO DE SERVIÇO", value: "service_type_name" },
        { text: "PACOTE", value: "package.name" },
        { text: "DOCUMENTO", value: "customer.document" },
        { text: "TELEFONE", value: "customer.phone_a" },
        { text: "ASSINADO", value: "signed" },
      ],

      editedIndex: -1,
      editedItem: {
        id: "",
        customer_id: "",
        package_id: "",
        service_type: "",
        professionals_total: "",
        event_type: "",
        event_address: "",
        registry: "",
        registry_address: "",
        church: "",
        church_address: "",
        reception: "",
        reception_address: "",
        making_of: "",
        making_of_address: "",
        album_size: "",
        album_type: "",
        album_blade: "",
        delivery_type: "",
        example_photos: false,
        album_case: false,
        box_case: "",
        trial_photos: false,
        woman_day: false,
        man_day: false,
        debutante_day: false,
        drone_photos: false,
        external_team: false,
        status_board: 1,
        signed: false,
      },

      menuDateSignedAt: false,
      signedAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),

      menuEventDate: false,
      eventDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),

      eventTime: null,
      menuEventTime: false,

      menuRegistryDate: false,
      registryDate: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),

      registryTime: null,
      menuRegistryTime: false,

      menuChurchDate: false,
      churchDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),

      churchTime: null,
      menuChurchTime: false,

      menuReceptionDate: false,
      receptionDate: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),

      receptionTime: null,
      menuReceptionTime: false,

      menuMakingOfDate: false,
      makingOfDate: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),

      makingOfTime: null,
      menuMakingOfTime: false,

      eventType: [
        { id: 1, event: "Casamento" },
        { id: 2, event: "15 Anos" },
        { id: 3, event: "Aniversário" },
        { id: 4, event: "Formatura" },
        { id: 5, event: "Batizado" },
      ],

      serviceType: [
        { id: 1, service: "Somente Casamento Religioso" },
        { id: 2, service: "Recepção Casamento" },
        { id: 3, service: "Somente Civil" },
        { id: 4, service: "Casamento e Recepção no Mesmo Local" },
        { id: 5, service: "Casamento e Recepção em Locais Diferentes" },
        { id: 6, service: "Batizado Igreja" },
        { id: 7, service: "Aniversário Infantil" },
        { id: 8, service: "Batizado e Recepção" },
        { id: 9, service: "Civil e Recepção" },
        { id: 10, service: "Corporativo" },
        { id: 11, service: "Aniversário Debutante" },
      ],

      albumType: [
        { id: 1, album: "Fotográfico" },
        { id: 2, album: "Couro" },
        { id: 3, album: "Acrílico" },
        { id: 4, album: "Madeira" },
      ],

      deliveryType: [
        { id: 1, delivery: "Entrega Padrão" },
        { id: 2, delivery: "Caixa Personalizada" },
        { id: 3, delivery: "Box Luxo com Mini Álbum" },
      ],

      albumSize: [
        { id: 1, size: "20cm x 30cm" },
        { id: 2, size: "25cm x 30cm" },
      ],

      albumBlades: [
        { id: 1, blade: "20" },
        { id: 2, blade: "30" },
        { id: 3, blade: "40" },
        { id: 4, blade: "50" },
      ],

      boxCases: [
        { id: 1, box: "Luva" },
        { id: 2, box: "Caixa Luva com Foto" },
        { id: 3, box: "Box com Fita" },
        { id: 4, box: "Caixa Acrílica" },
        { id: 5, box: "Fotográfica" },
        { id: 6, box: "Tecido" },
        { id: 7, box: "Madeira" },
      ],
    };
  },

  methods: {
    packageSelected(pendrive, online, amount) {
      this.totalPackage = amount;
    },

    listCustomers() {
      this.api
        .listCustomers()
        .then(async (res) => {
          this.customers = res.data.data;
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

    listPackages() {
      this.api
        .listPackages()
        .then(async (res) => {
          this.packages = res.data.data;
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

    listContracts() {
      this.api
        .listContracts()
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
      this.editedItem;
      this.dialog = true;
    },

    editDialog() {
      this.editedIndex = this.datatable.indexOf(this.selected);
      this.editedItem = Object.assign({}, this.selected[0]);
      this.tab = "allTab";
      if(this.selected[0].package_id != null) {
        this.totalPackage = this.selected[0].package.amount;
      } else {
        this.totalPackage = "";
      }
      this.dialog = true;
    },

    save() {
      if (this.$refs.form.validate()) {
        this.loading = true;

        const data = {
          enterprise_id: localStorage.getItem("enterprise_id"),
          customer_id: this.editedItem.customer_id,
          package_id: this.editedItem.package_id.id,
          service_type: this.editedItem.service_type,
          professionals_total: this.editedItem.professionals_total,
          event_type: this.editedItem.event_type,
          event_address: this.editedItem.event_address,
          event_date: this.eventDate,
          event_time: this.eventTime,
          registry: this.editedItem.registry,
          registry_address: this.editedItem.registry_address,
          registry_date: this.registryDate,
          registry_time: this.registryTime,
          church: this.editedItem.church,
          church_address: this.editedItem.church_address,
          church_date: this.churchDate,
          church_time: this.churchTime,
          reception: this.editedItem.reception,
          reception_address: this.editedItem.reception_address,
          reception_date: this.receptionDate,
          reception_time: this.receptionTime,
          making_of: this.editedItem.making_of,
          making_of_address: this.editedItem.making_of_address,
          making_of_date: this.makingOfDate,
          making_of_time: this.makingOfTime,
          album_size: this.editedItem.album_size,
          album_type: this.editedItem.album_type,
          album_blade: this.editedItem.album_blade,
          delivery_type: this.editedItem.delivery_type,
          example_photos: this.editedItem.example_photos,
          album_case: this.editedItem.album_case,
          box_case: this.editedItem.box_case,
          trial_photos: this.editedItem.trial_photos,
          woman_day: this.editedItem.woman_day,
          man_day: this.editedItem.man_day,
          debutante_day: this.editedItem.debutante_day,
          drone_photos: this.editedItem.drone_photos,
          external_team: this.editedItem.external_team,
          status_board: 1,
          signed: this.editedItem.signed,
          signed_at: this.signedAt,
        };

        if (this.editedItem.id === "") {
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

              this.listContracts();
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
            .updateContracts(this.editedItem.id, data)
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

              this.listContracts();
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
          .deleteContracts(this.selected[i].id)
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

            this.listContracts();
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

    sendContractByEmail() {
      this.dialogSendContractByEmail = false;

      for (var i = 0; i < this.selected.length; i++) {
        this.loading = true;

        const data = {
          id: this.selected[i].id,
        };

        this.api
          .sendContractByEmail(data)
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