document.addEventListener("DOMContentLoaded", main);

let isEditing = false;
let editingPostId = null;

function main() {
    displayPosts();
    setupFormHandler();
    setupCancelButton();
}

function displayPosts() {
    fetch("http://localhost:3000/posts")
        .then((res) => res.json())
        .then((posts) => {
            const postList = document.getElementById("post-list");
            postList.innerHTML = "";

            posts.forEach((post) => {
                const div = document.createElement("div");
                div.textContent = post.title;
                div.addEventListener("click", () => handlePostClick(post.id));
                postList.appendChild(div);
            });

            if (posts.length) handlePostClick(posts[0].id);
        });
}

function handlePostClick(id) {
    fetch(`http://localhost:3000/posts/${id}`)
        .then((res) => res.json())
        .then((post) => {
            const detail = document.getElementById("post-detail");
            detail.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>Author:</strong> ${post.author}</p>
        <p>${post.content}</p>
        <button id="edit-btn">Edit</button>
        <button id="delete-btn">Delete</button>
      `;

            document.getElementById("edit-btn").addEventListener("click", () => startEditing(post));
            document.getElementById("delete-btn").addEventListener("click", () => deletePost(post.id));
        });
}

function setupFormHandler() {
    const form = document.getElementById("post-form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = document.getElementById("form-title-input").value;
        const content = document.getElementById("form-content").value;
        const author = document.getElementById("form-author").value;

        const postData = { title, content, author };

        if (isEditing && editingPostId !== null) {
            // Editing mode
            fetch(`http://localhost:3000/posts/${editingPostId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData),
            })
                .then((res) => res.json())
                .then(() => {
                    resetForm();
                    displayPosts();
                });
        } else {
            fetch("http://localhost:3000/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData),
            })
                .then((res) => res.json())
                .then(() => {
                    resetForm();
                    displayPosts();
                });
        }
    });
}

function startEditing(post) {
    isEditing = true;
    editingPostId = post.id;

    document.getElementById("form-title").textContent = "Edit Post";
    document.getElementById("submit-btn").textContent = "Update Post";
    document.getElementById("cancel-btn").classList.remove("hidden");

    document.getElementById("form-title-input").value = post.title;
    document.getElementById("form-content").value = post.content;
    document.getElementById("form-author").value = post.author;
}

function setupCancelButton() {
    document.getElementById("cancel-btn").addEventListener("click", resetForm);
}

function resetForm() {
    isEditing = false;
    editingPostId = null;

    document.getElementById("post-form").reset();
    document.getElementById("form-title").textContent = "New Post";
    document.getElementById("submit-btn").textContent = "Add Post";
    document.getElementById("cancel-btn").classList.add("hidden");
}

function deletePost(id) {
    fetch(`http://localhost:3000/posts/${id}`, {
        method: "DELETE",
    }).then(() => {
        resetForm();
        document.getElementById("post-detail").innerHTML = "<p>Select a post to view its details.</p>";
        displayPosts();
    });
}
