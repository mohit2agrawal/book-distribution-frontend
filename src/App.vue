<script>
import { ref } from "vue";

const thead = ["Book", "Language", "Price", ""];
const tbody = [
    {
        field: "name",
        fixed: "left",
        widht: 20,
    },
    {
        field: "language",
        colClass: "smol",
        widht: 15,
    },
    { slot: "priceInput", fixed: "right", width: 15 },
    { slot: "submitAction", fixed: "right", width: 15 },
];

const transactions_thead = [
    "ID",
    "Timestamp",
    "User",
    "Book",
    "Language",
    "Price",
];
const transactions_tbody = [
    "id",
    "timestamp",
    "userName",
    {
        field: "bookName",
    },
    "language",
    "amount",
];

var books = ref([]);
var users = ref([]);
var transactions = ref([]);
var selectedUserID = ref("");
var newUserName = ref("");
var newUserPhone = ref("");

function show(data) {
    console.log(JSON.stringify(data, null, 4));
}

function fetchTransactions() {
    fetch("/api/transactions")
        .then((data) => data.json())
        .then((data) => {
            data.forEach((transaction) => {
                let d = new Date(transaction.timestamp);
                transaction.timestamp = d.toLocaleString();

                let tUser = users.value.filter(
                    (user) => user.id == transaction.userId
                )[0];
                transaction.userName = tUser.name;

                let tBook = books.value.filter(
                    (book) => book.id == transaction.bookId
                )[0];
                transaction.bookName = tBook.name;
                transaction.language = tBook.language;
            });

            transactions.value = data.reverse();
            // console.log(JSON.stringify(data, null, 4));
        });
}

function submitTransaction(data) {
    let body = JSON.stringify({
        timestamp: new Date(),
        userId: parseInt(selectedUserID.value),
        bookId: parseInt(data.id),
        amount: parseInt(data.price) || data.defaultPrice,
    });

    fetch("/api/transactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: body,
    })
        .then((data) => data.json())
        .then((transaction) => {
            let tUser = users.value.filter(
                (user) => user.id == transaction.userId
            )[0];
            transaction.userName = tUser.name;

            let tBook = books.value.filter(
                (book) => book.id == transaction.bookId
            )[0];
            transaction.bookName = tBook.name;
            transaction.language = tBook.language;

            let d = new Date(transaction.timestamp);
            transaction.timestamp = d.toLocaleString();

            transactions.value.unshift(transaction);
        });
}

function fetchBooks() {
    fetch("/api/books")
        .then((data) => data.json())
        .then((data) => {
            data.forEach((element) => {
                element.defaultPrice = element.price;
            });
            books.value = data;
            // console.log(data);
        });
}

function fetchUsers() {
    fetch("/api/users")
        .then((data) => data.json())
        .then((data) => {
            users.value = data;
            // console.log(JSON.stringify(data, null, 4));
        });
}

function submitUser() {
    let body = JSON.stringify({
        name: newUserName.value,
        phone: newUserPhone.value,
    });

    fetch("/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: body,
    }).then(() => {
        newUserName.value = "";
        newUserPhone.value = "";
        fetchUsers();
    });
}

function socket_test() {
    // console.log("socket test");
    var ws = new WebSocket("ws://localhost:5173/echo");
    // ws.onopen = (evt) => {
    //     console.log("connected!");
    //     // ws.send("hi");
    // };

    ws.onmessage = (evt) => {
        console.log(JSON.parse(evt.data));
    };
}

export default {
    setup() {
        return {
            thead,
            tbody,
            books,
            users,
            selectedUserID,
            transactions,
            transactions_thead,
            transactions_tbody,
            newUserName,
            newUserPhone,
            show,
            submitTransaction,
            // fetchTransactions,
            submitUser,
        };
    },

    mounted() {
        fetchBooks();
        fetchUsers();
        // fetchTransactions();
        socket_test();
    },
};
</script>

<template>
    <div :class="$tt('subtitle1')">Select User</div>
    <div>
        <ui-select
            id="user-select"
            v-model="selectedUserID"
            :options="users"
            :optionFormat="{ label: 'name', value: 'id' }"
        >
        </ui-select>
    </div>

    <br />

    <div :class="$tt('subtitle1')">Create New User</div>

    <ui-form
        nowrap
        item-margin-bottom="16"
        label-width="80"
        action-align="left"
    >
        <template #default="{ itemClass, actionClass }">
            <ui-grid>
                <ui-grid-cell>
                    <ui-form-field>
                        <ui-textfield
                            placeholder="Name"
                            v-model="newUserName"
                            :class="itemClass"
                        ></ui-textfield> </ui-form-field
                ></ui-grid-cell>
                <ui-grid-cell>
                    <ui-form-field>
                        <ui-textfield
                            inputType="number"
                            placeholder="Phone"
                            v-model="newUserPhone"
                            :class="itemClass"
                        ></ui-textfield> </ui-form-field
                ></ui-grid-cell>
            </ui-grid>
            <ui-form-field :class="actionClass">
                <ui-button @click="submitUser()">Submit</ui-button>
            </ui-form-field>
        </template>
    </ui-form>

    <br />

    <div :class="$tt('subtitle1')">Add a new transaction</div>

    <ui-table
        :data="books"
        :thead="thead"
        :tbody="tbody"
        :default-col-width="10"
    >
        <template #priceInput="{ data }">
            <ui-textfield
                inputType="number"
                v-model="data.price"
                :placeholder="data.defaultPrice.toString()"
                :outlined="true"
            >
            </ui-textfield>
        </template>

        <template #submitAction="{ data }">
            <!-- <ui-icon @click="transact(data)">add_circle</ui-icon> -->
            <ui-button
                icon="add_circle"
                @click="submitTransaction(data)"
            ></ui-button>
        </template>
    </ui-table>

    <br />
    <br />
    <div :class="$tt('subtitle1')">Transactions</div>

    <ui-table
        :data="transactions"
        :thead="transactions_thead"
        :tbody="transactions_tbody"
        :default-col-width="20"
    ></ui-table>
</template>

<style scoped>
.smol {
    font-size: 20pt;
    background: black;
}
</style>
