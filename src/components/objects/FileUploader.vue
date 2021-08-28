<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" dark v-bind="attrs" v-on="on">Upload Files</v-btn>
            </template>
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="dialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Uploader</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn dark text @click="dialog = false">Confirm</v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-list three-line subheader>
                    <v-subheader>File Select</v-subheader>
                    <v-list-item>
                        <v-list-item-content>
                            <file-form></file-form>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
                <v-divider></v-divider>
                <!-- <v-list three-line subheader>
                    <v-subheader>Upload Settings</v-subheader>
                    <v-list-item>
                        <v-list-item-action>
                            <v-checkbox v-model="this.private"></v-checkbox>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>Private</v-list-item-title>
                            <v-list-item-subtitle>Make these uploads private, anyone accessing the files will require permission or token link. You can always change this in the file settings.</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list> -->
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
import FileForm from "../forms/FileForm.vue";
export default {
    name: "file-uploader",
    components: {
        FileForm
    },
    data() {
        return {
            dialog: false
        };
    }
};
</script>