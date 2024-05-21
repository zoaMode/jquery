
const app = Vue.createApp({
    data() {
        return {
            contents: [],
            curuser: ""
        };
    },
    mounted() {
        this.fetchPost();
        this.curuser = localStorage.getItem('user_id');
    },
     methods: {
        fetchPost() {
            const cuid = localStorage.getItem('user_id');
            fetch(`api/content/get_content.php?fuid=${cuid}&cuid=${cuid}`)
            .then((response) => response.json())
            .then((data) => {
                this.contents = data.map(content => ({
                    ...content,
                    isEditing: false,
                    editedContent: content.content
                }));
            })
            .catch((error) => {
              console.error("Error fetching data:", error);
            });
        },
        editContent(id){
            this.contents = this.contents.map(content => ({
                ...content,
                isEditing: content.post_id === id
            }));
        },
        cancelEditContent(item) {
            item.isEditing = false;
            item.editedContent = item.content;
        },

        saveEditedContent(item) {
            fetch(`api/content/edit_content.php?postid=${item.post_id}&content=${item.editedContent}`)
                .then(() => {
                    location.reload();
                });
        },
        deletePost(id) {
            fetch(`api/content/delete_content.php?post_id=${id}`)
            .then(() => {
                location.reload();
            });
        }
  }
});

const search = Vue.createApp({
    data() {
        return {
            results: [],
            searchText: ''
        }
    },
    mounted() {
        this.fetchUserX();
    },
    methods: {
        fetchUserX() {
            fetch("api/user/search_user.php")
            .then((response) => response.json())
            .then((data) => {
                this.results = data;
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
        },
        performSearch() {
            this.resultsFiltered = this.results.filter(item =>
                item.fullname.toLowerCase().includes(this.searchText.toLowerCase())
            );
        },
        updateURL() {
            const params = new URLSearchParams(window.location.search);
            params.set('search', this.searchText);
            window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
        }
    },
    computed: {
        resultsFiltered() {
            return this.results.filter(item =>
                item.fullname.toLowerCase().includes(this.searchText.toLowerCase())
            );
        }
    }
});

const comment = Vue.createApp({
    data() {
        return {
            comments: [],
            owner: ""
        }
    },
    mounted() {
        this.fetchComment();
        this.owner = localStorage.getItem('user_id');
    },
    methods: {
        fetchComment() {
            const postId = new URLSearchParams(window.location.search).get('post');
            fetch(`api/comment/get_comment.php?postid=${postId}`)
                .then(response => response.json())
                .then(data => {
                    this.comments = data.map(comment => ({
                        ...comment,
                        isEditing: false,
                        editedComment: comment.comment_text
                    }));

                    console.log(data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        },

        editComment(id){
            this.comments = this.comments.map(comment => ({
                ...comment,
                isEditing: comment.comment_id === id
            }));
        },

        cancelEdit(item) {
            item.isEditing = false;
            item.editedComment = item.comment_text;
        },

        saveEditedComment(item) {
            fetch(`api/comment/edit_comment.php?cid=${item.comment_id}&comment=${item.editedComment}`)
                .then(() => {
                    location.reload();
                });
        },

        deleteComment(id) {
            fetch(`api/comment/delete_comment.php?cid=${id}`)
                .then(() => {
                    location.reload();
                });
        }
    }
});

const profile = Vue.createApp({
    data() {
        return {
            items: [],
            mepost: [],
            following: "",
            cuser: false,
        }
    },
    mounted() {
        const suid = localStorage.getItem('user_id');
        const uid = new URLSearchParams(window.location.search).get('uid');

        if(uid == suid) {
            this.cuser = true;
        }

        this.fetchMePost();

        fetch(`api/follow/get_follow.php?uid=${uid}`)
        .then(response => response.json())
        .then(data => {
            this.items = data[0];
        })

        fetch(`api/follow/get_follow.php?uid=${suid}`)
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].following_id == uid) {
                    this.following = true;
                    console.error(data);
                    break;
                }
            }
        })
    },
    methods: {
        followToggle() {
            const fsuid = localStorage.getItem('user_id');
            const fuid = new URLSearchParams(window.location.search).get('uid');
        
            if (this.following) {
                fetch(`api/follow/remove_follow.php?uid=${fsuid}&suid=${fuid}`)
                .then(() => {
                    this.following = false;
                });
            } else {
                fetch(`api/follow/user_follow.php?uid=${fsuid}&suid=${fuid}`)
                .then(() => {
                    this.following = true;
                });
            }
        },

        fetchMePost() {

            const muid = new URLSearchParams(window.location.search).get('uid');

            fetch(`api/content/get_content.php?cuid=${muid}`)
            .then((response) => response.json())
            .then((data) => {
              this.mepost = data;
            })
            .catch((error) => {
              console.error("Error fetching data:", error);
            });
        } 
    }
});

const main = Vue.createApp({
    data() {
        return {
            uid: "",
            sugg: [],
        }
    },
    created() {
        this.uid = localStorage.getItem('user_id');
        this.suggestions();
    },
    methods: {
        suggestions() {
            const cuid = localStorage.getItem('user_id');
            fetch(`api/user/suggest_user.php?uid=${cuid}`)
            .then((data) => data.json())
            .then((result) => {
                this.sugg = result;
            });
        }
    }
});

app.mount("#homepage");
profile.mount('#profile');
comment.mount('#comment');
search.mount('#search');
main.mount('#main');
