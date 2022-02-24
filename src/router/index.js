import { createRouter, createWebHashHistory } from "vue-router";
const markPage = () => import("@/pages/markPage")

export default createRouter({
    history: createWebHashHistory(),
    routes: [{
            path: '/',
            redirect: "/mark"
        },
        {
            path: '/mark',
            name: "mark",
            component: markPage
        }
    ]
})
