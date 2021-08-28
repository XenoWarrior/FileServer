<template>
    <v-container>
        <v-layout column>
            <v-subheader>My Profile</v-subheader>
            <v-card>
                <v-card-text>
                    <v-flex class="mb-3">
                        <v-avatar size="64" class="mr-4">
                            <img :src="'https://via.placeholder.com/150'" alt="Avatar" />
                        </v-avatar>
                        Welcome, {{ this.$store.getters.getUsername }}
                    </v-flex>
                </v-card-text>
                <v-card-actions>
                    <v-btn text>Security</v-btn>
                    <v-btn text>Privacy</v-btn>
                    <v-btn text color="error" @click="logout()">Logout</v-btn>
                </v-card-actions>
            </v-card>
        </v-layout>
    </v-container>
</template>

<script>
export default {
    name: "user-profile",
    methods: {
        logout() {
            this.$router.push("logout");
        }
    }
};
</script>