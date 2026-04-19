const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const form = document.getElementById("postForm");
const submitBtn = document.getElementById("submitBtn");
const errorMsg = document.getElementById("errorMsg");

// 🖼 Image Preview
imageInput.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.classList.remove("hidden");
  }
});

// 🚀 Form Validation + Loading
form.addEventListener("submit", function (e) {
  const title = document.getElementById("title").value.trim();

  if (!imageInput.files[0]) {
    e.preventDefault();
    errorMsg.innerText = "Please upload an image";
    errorMsg.classList.remove("hidden");
    return;
  }

  if (title.length < 3) {
    e.preventDefault();
    errorMsg.innerText = "Title must be at least 3 characters";
    errorMsg.classList.remove("hidden");
    return;
  }

  // 🔄 Loading State
  submitBtn.innerText = "Uploading...";
  submitBtn.disabled = true;
});


