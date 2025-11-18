// -----------------------------
// Дешифрование токена (сдвиг +3)
// -----------------------------
function decryptToken(encryptedToken) {
    let decrypted = "";
    for (const char of encryptedToken) {
        if ('0' <= char && char <= '9') {
            decrypted += String.fromCharCode((char.charCodeAt(0) - '0'.charCodeAt(0) + 3) % 10 + '0'.charCodeAt(0));
        } else if ('a' <= char && char <= 'z') {
            decrypted += String.fromCharCode((char.charCodeAt(0) - 'a'.charCodeAt(0) + 3) % 26 + 'a'.charCodeAt(0));
        } else if ('A' <= char && char <= 'Z') {
            decrypted += String.fromCharCode((char.charCodeAt(0) - 'A'.charCodeAt(0) + 3) % 26 + 'A'.charCodeAt(0));
        } else {
            decrypted += char;
        }
    }
    return decrypted;
}

// -----------------------------
// Твой зашифрованный Gemini API-ключ
// -----------------------------
const GEMINI_API_KEY_ENC = "FxwXTvZ5TzZjaaar0TYIYxdCOxDQjpzEq652nDX";

// Расшифрованный
const geminiApiKey = decryptToken(GEMINI_API_KEY_ENC);

// -----------------------------
const errorMapping = {
    400: "Неправильный запрос. Проверьте данные, отправленные на сервер.",
    401: "Неавторизованный запрос. Проверьте API ключ.",
    403: "Доступ запрещён. Проверьте модель или ключ.",
    404: "Модель или ресурс не найден.",
    429: "Слишком много запросов. Подождите немного.",
    500: "Ошибка сервера Gemini.",
    503: "Сервис временно недоступен."
};

// -----------------------------
const textarea = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chatContainer = document.getElementById("chat-container");
const messageContainer = document.getElementById("message-container");

const chatHistory = []; // хранит всю историю (как требует Gemini)

// Приветствие
window.onload = () => {
    displayMessage("Чат-бот «ISAKONOEVICH» приветствует вас!", false);
};

// -----------------------------
// Цвет кнопки
// -----------------------------
textarea.addEventListener("input", () => {
    sendButton.style.backgroundColor = textarea.value.trim() ? "#4CAF50" : "#ccc";
});

// Отправка по Enter
textarea.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

sendButton.addEventListener("click", sendMessage);

// -----------------------------
// Индикатор "печатает..."
// -----------------------------
let typingIndicator;

function showTyping() {
    typingIndicator = document.createElement("div");
    typingIndicator.className = "message bot-message visible";
    typingIndicator.innerHTML = `<div class="loader"></div>`;
    messageContainer.appendChild(typingIndicator);
    smoothScrollToBottom(messageContainer);
}

function hideTyping() {
    if (typingIndicator) {
        messageContainer.removeChild(typingIndicator);
        typingIndicator = null;
    }
}

// -----------------------------
// Основная функция отправки
// -----------------------------
async function sendMessage() {
    const userInput = textarea.value.trim();
    if (!userInput) return;

    chatContainer.classList.add("expanded");

    displayMessage(userInput, true);
    textarea.value = "";
    sendButton.style.backgroundColor = "#ccc";

    // Добавляем в историю (в формате Gemini)
    chatHistory.push({
        role: "user",
        parts: [{ text: userInput }]
    });

    showTyping();

    try {
        const body = {
            contents: chatHistory,
            generationConfig: {
                temperature: 0.7
            }
        };

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": geminiApiKey
                },
                body: JSON.stringify(body)
            }
        );

        hideTyping();

        if (!response.ok) {
            const err = errorMapping[response.status] || "Неизвестная ошибка Gemini.";
            displayMessage(err);
            return;
        }

        const data = await response.json();

        const botReply =
            data.candidates?.[0]?.content?.parts
                ?.map(p => p.text)
                .join("") || "Пустой ответ от модели.";

        displayMessage(botReply);

        // Добавляем ответ бота в историю
        chatHistory.push({
            role: "model",
            parts: [{ text: botReply }]
        });

    } catch (error) {
        hideTyping();
        console.error("Ошибка запроса Gemini:", error);
        displayMessage("Произошла ошибка при обращении к Gemini API.");
    }
}

// -----------------------------
// Вспомогательные функции UI
// -----------------------------
function smoothScrollToBottom(container) {
    const targetScroll = container.scrollHeight;
    const startScroll = container.scrollTop;
    const distance = targetScroll - startScroll;
    const duration = 1200;
    const startTime = performance.now();

    function animate() {
        const now = performance.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        container.scrollTop = startScroll + distance * ease;

        if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

function displayMessage(content, isUserMessage = false) {
    const msg = document.createElement("div");
    msg.className = `message ${isUserMessage ? "user-message" : "bot-message"}`;
    msg.innerText = content;

    messageContainer.appendChild(msg);

    setTimeout(() => {
        msg.classList.add("visible");
        smoothScrollToBottom(messageContainer);
    }, 10);
}
