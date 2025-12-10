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
// Зашифрованный Arli API ключ
// -----------------------------
const ARLI_API_KEY_ENC = "686cby5z-78y8-1366-6y63-12815a6z947c";

// Расшифрованный ключ
const arliApiKey = decryptToken(ARLI_API_KEY_ENC);

// -----------------------------
const errorMapping = {
    400: "Неправильный запрос. Проверьте данные.",
    401: "Неавторизовано. Убедитесь в правильности API ключа.",
    403: "Доступ запрещён.",
    404: "Модель не найдена.",
    429: "Слишком много запросов.",
    500: "Ошибка сервера Arli.",
    503: "Сервис временно недоступен."
};

// -----------------------------
const textarea = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chatContainer = document.getElementById("chat-container");
const messageContainer = document.getElementById("message-container");

const chatHistory = []; // история в формате OpenAI (Arli)

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
// Основная функция
// -----------------------------
async function sendMessage() {
    const userInput = textarea.value.trim();
    if (!userInput) return;

    chatContainer.classList.add("expanded");

    displayMessage(userInput, true);
    textarea.value = "";
    sendButton.style.backgroundColor = "#ccc";

    // Добавляем в историю (формат OpenAI/Arli)
    chatHistory.push({
        role: "user",
        content: userInput
    });

    showTyping();

    try {
        const body = {
            model: "arli-7b", // или любая другая доступная модель
            messages: chatHistory,
            temperature: 0.7
        };


		
		const response = await fetch("isakonoevichai.itismynickname9.workers.dev", {
		  method: "POST",
		  headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${arliApiKey}`
		  },
		  body: JSON.stringify(body)
		});


        hideTyping();

        if (!response.ok) {
            const err = errorMapping[response.status] || "Неизвестная ошибка Arli.";
            displayMessage(err);
            return;
        }

        const data = await response.json();

        const botReply =
            data.choices?.[0]?.message?.content || "Пустой ответ от Arli.";

        displayMessage(botReply);

        // Добавляем ответ бота
        chatHistory.push({
            role: "assistant",
            content: botReply
        });

    } catch (error) {
        hideTyping();
        console.error("Ошибка запроса Arli:", error);
        displayMessage("Ошибка при обращении к Arli API.");
    }
}

// -----------------------------
// UI функции
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

    msg.innerHTML = marked.parse(content);

    messageContainer.appendChild(msg);

    setTimeout(() => {
        msg.classList.add("visible");
        smoothScrollToBottom(messageContainer);
    }, 10);
}
