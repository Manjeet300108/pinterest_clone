 function togglePassword(id, el) {
                     const input = document.getElementById(id);

                     if (input.type === "password") {
                            input.type = "text";
                            el.textContent = "🙈";
                     } else {
                            input.type = "password";
                            el.textContent = "👁";
                     }
              }

              const password = document.getElementById("password");
              const confirmPassword = document.getElementById("confirmPassword");
              const matchMsg = document.getElementById("matchMsg");

              function checkMatch() {
                     if (!confirmPassword.value) {
                            matchMsg.classList.add("hidden");
                            return;
                     }

                     matchMsg.classList.remove("hidden");

                     if (password.value === confirmPassword.value) {
                            matchMsg.textContent = "✅ Password matched";
                            matchMsg.style.color = "green";
                     } else {
                            matchMsg.textContent = "❌ Password not matched";
                            matchMsg.style.color = "red";
                     }
              }

              password.addEventListener("input", checkMatch);
              confirmPassword.addEventListener("input", checkMatch);