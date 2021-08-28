<template>
    <v-container>
        <v-layout column>
            <v-subheader>
                My Files
                <v-btn :loading="loading" :disabled="loading" icon color="green" @click="loader = 'loading'; getFiles()">
                    <v-icon>mdi-cached</v-icon>
                    <template v-slot:loader>
                        <span class="custom-loader">
                            <v-icon light>cached</v-icon>
                        </span>
                    </template>
                </v-btn>
                <v-btn @click="fileOperation('download')" v-if="selected.length > 0" icon color="green">
                    <v-icon>mdi-download</v-icon>
                </v-btn>
                <v-btn @click="fileOperation('edit')" v-if="selected.length > 0" icon color="green">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn @click="fileOperation('delete')" v-if="selected.length > 0" icon color="red">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </v-subheader>

            <v-row v-if="error">
                <v-col cols="12" sm="12">
                    <v-alert dismissible type="error">{{ error }}</v-alert>
                </v-col>
            </v-row>

            <v-data-table
                :loading="loading"
                :headers="headers"
                :items="this.$store.getters.myFiles"
                :show-select="!isMobile"
                v-model="selected"
                loading-text="Please wait..."
                v-resize="onResize"
            >
                <template v-slot:item.upload_filename="{ item }">
                    <v-btn v-on:click="viewFile(item)" text small>
                        <v-icon left dark>mdi-{{ getMimeIcon(item.upload_mime )}}</v-icon>
                        {{ item.upload_filename }}
                    </v-btn>
                </template>

                <template v-slot:item.upload_date="{ item }">
                    <span>{{ moment(item.upload_date).fromNow() }}</span>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-icon v-on="on" medium class="mr-2" @click="fileOperation('copy-link', item)">mdi-content-copy</v-icon>
                        </template>
                        <span>Copy Link</span>
                    </v-tooltip>

                    <v-snackbar color="success" v-model="copied.done">
                        Link for "{{ copied.name }}" copied.
                        <template v-slot:action="{ attrs }">
                            <v-btn color="secondary" text v-bind="attrs" @click="copied.done = false; copied.name = null;">Close</v-btn>
                        </template>
                    </v-snackbar>

                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-icon v-on="on" medium class="mr-2" @click="fileOperation('download', item)">mdi-download</v-icon>
                        </template>
                        <span>Download File</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-icon v-on="on" medium class="mr-2" @click="fileOperation('edit', item)">mdi-pencil</v-icon>
                        </template>
                        <span>Edit File Settings</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-icon v-on="on" medium color="red" @click="fileOperation('delete', item)">mdi-delete</v-icon>
                        </template>
                        <span>Delete File</span>
                    </v-tooltip>
                </template>

                <v-input v-model="copyText" hidden></v-input>
            </v-data-table>
            <file-editor></file-editor>
        </v-layout>
    </v-container>
</template>

<script>
import MimeTypes from "../../plugins/mimetypes";
import FileEditor from "../objects/FileEditor.vue";

export default {
    name: "file-list",
    data() {
        return {
            loader: null,
            loading: true,
            copied: {
                done: false,
                name: null,
            },
            preview: {
                open: false,
                url: null,
                mime: null,
            },
            error: "",
            selected: [],
            modes: ["download", "edit", "delete", "copy-link"],
            mobile: null,
            copyText: null,
        };
    },
    created() {
        this.getFiles();
    },
    components: {
        FileEditor,
    },
    computed: {
        headers() {
            let headers = [
                { text: "File Name", align: "start", value: "upload_filename" },
            ];

            if (!this.isMobile) {
                headers.push({
                    text: "Views",
                    value: "upload_views",
                    sortable: true,
                });
            }

            headers.push({
                text: "Uploaded",
                value: "upload_date",
                sortable: true,
            });
            headers.push({
                text: "Actions",
                value: "actions",
                sortable: false,
                align: "right",
            });

            return headers;
        },
        isMobile() {
            this.mobile = window.innerWidth < 940;
            return this.mobile;
        },
    },
    watch: {
        loader() {
            let l = this.loader;
            this[l] = !this[l];

            this.loader = null;
        },
    },
    methods: {
        getIdsFromObject(data) {
            let items = [];

            if (Array.isArray(data)) {
                items = data.map((item) => {
                    return item.id;
                });
            } else {
                items.push(data.id);
            }

            return items;
        },
        getUrlsFromObject(data) {
            let items = [];

            if (Array.isArray(data)) {
                items = data.map((item) => {
                    return item.upload_url;
                });
            } else {
                items.push(data.upload_url);
            }

            return items;
        },

        fileOperation(mode, data) {
            if (this.modes.includes(mode)) {
                if (!data) {
                    data = this.selected;
                }

                switch (mode) {
                    case "copy-link":
                        let input = document.createElement("input");
                        input.id = "copy-text";
                        input.value = data.upload_url;

                        try {
                            document.querySelector("#app").appendChild(input);
                            input.select();
                            document.execCommand("copy");

                            this.copied.done = true;
                            this.copied.name = data.upload_filename;
                        } catch (ex) {
                            console.error(ex);
                        }

                        input.remove();
                        break;
                    default:
                        this.$store
                            .dispatch("fileOperation", {
                                mode: mode,
                                data: this.getIdsFromObject(data),
                                self: this,
                            })
                            .catch((error) => {
                                this.error =
                                    "File operation failed, please try again later.";
                                setTimeout(() => (this.loading = false), 1000);
                            });
                        this.selected = [];
                        break;
                }
            }
        },

        getFiles() {
            this.error = "";

            this.$store
                .dispatch("getFiles", { self: this })
                .then(() => {
                    setTimeout(() => (this.loading = false), 1000);
                })
                .catch(() => {
                    this.error = "Failed to get files, please try again later.";
                    setTimeout(() => (this.loading = false), 1000);
                });
        },
        viewFile(item) {
            this.$router.push({
                name: `view-file`,
                params: { file: item.id, mime: item.upload_mime },
            });
        },

        onResize() {
            this.mobile = window.innerWidth < 940;
        },

        getMimeIcon(mime) {
            try {
                return MimeTypes.hasOwnProperty(mime)
                    ? MimeTypes[mime]
                    : "help-circle-outline";
            } catch (e) {
                return "help-circle-outline";
            }
        },
    },
};
</script>

<style lang="scss">
@import "../styles/_loader.scss";
</style>