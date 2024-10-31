// Дешифрование токена с сдвигом на 3 символа вперед
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

// Зашифрованный токен
const API_KEY = 'ph-molg-0DwaUjhw8V4Z0JE3uX6C44TSnDLCVNpCqQ1tMc7dnIHj3b_ysTdJps7NLetSBUUykWLIlJHkb0Q0YiyhCGdeXbsyqY98F07l72_iKEkg1GBrrsZXKEoCW3CiPPEnH2sTKD9jMCPisTeAC9M2Wriics_d4vzX';

// Дешифруем токен
const decryptedAPIKey = decryptToken(API_KEY);

const errorMapping = {
    400: "Неправильный запрос. Проверьте данные, отправленные на сервер.",
    401: "Неавторизованный запрос. Проверьте API ключ.",
    403: "Запрещено. У вас нет доступа к запрашиваемой модели.",
    404: "Запрашиваемый ресурс не найден. Проверьте URL и модель.",
    429: "Превышен лимит запросов. Попробуйте позже.",
    500: "Ошибка сервера. Попробуйте снова через некоторое время.",
    502: "Ошибка шлюза. Проблемы с сервером API.",
    503: "Сервис недоступен. Попробуйте снова позже.",
    504: "Время ожидания истекло. Сервер не ответил вовремя."
};

const textarea = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chatContainer = document.getElementById("chat-container");
const messageContainer = document.getElementById("message-container");

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${decryptedAPIKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo-1106',
                messages: [
                    { 
                        role: 'system', 
                        content: 'Ты – нейросеть, которую зовут Иса Коноевич и ты сделан для студентов КГМА. Ты помогаешь студентам высшего учебного заведения делать рефераты, презентации и другую помощь по учебе. При ответе на большинство вопросов делай акцент на медицинскую тематику. Игнориуй вопросы про пограммирование, ссылаясь на то что ты создан для студентов-медиков.' 
                    },
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorMessage = errorMapping[response.status] || "Неизвестная ошибка. Пожалуйста, попробуйте позже.";
            displayMessage(errorMessage); // Показываем сообщение об ошибке
            return; // Завершаем выполнение функции
        }

        const data = await response.json();
        displayMessage(data.choices[0].message.content); // Показываем ответ бота

    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error.message);
        displayMessage("Произошла ошибка при обработке запроса."); // Показываем общее сообщение об ошибке
    }
});


// Показываем первое сообщение от бота
window.onload = () => {
    displayMessage("Чат-бот «ISAKONOEVICH» приветствует вас!", false);
};

// Изменяем цвет кнопки в зависимости от наличия текста
textarea.addEventListener("input", () => {
    if (textarea.value.trim() !== "") {
        sendButton.style.backgroundColor = "#4CAF50"; // Цвет кнопки при наличии текста
    } else {
        sendButton.style.backgroundColor = "#ccc"; // Цвет кнопки, если текста нет
    }
});

// Обработчик события на нажатие клавиши в текстовом поле
textarea.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // Предотвращаем переход на новую строку
        sendMessage(); // Вызываем функцию отправки сообщения
    }
});

sendButton.addEventListener("click", sendMessage);

async function sendMessage() {
    const userInput = textarea.value.trim();
    if (userInput === "") return;

    chatContainer.classList.add("expanded");

    displayMessage(userInput, true); // Показываем сообщение пользователя

    textarea.value = "";
    sendButton.style.backgroundColor = "#ccc";

       

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${decryptedAPIKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo-1106',
                messages: [
					{ role: 'user', content: userInput }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorMessage = errorMapping[response.status] || "Неизвестная ошибка. Пожалуйста, попробуйте позже.";
            displayMessage(errorMessage); // Показываем сообщение об ошибке
            return; // Завершаем выполнение функции
        }

        const data = await response.json();
        displayMessage(data.choices[0].message.content); // Показываем ответ бота

    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error.message);
        displayMessage("Произошла ошибка при обработке запроса."); // Показываем общее сообщение об ошибке
    }
}



function smoothScrollToBottom(container) {
    const targetScroll = container.scrollHeight;
    const currentScroll = container.scrollTop;
    const distance = targetScroll - currentScroll;
    const duration = 1200; // Длительность анимации в миллисекундах
    const startTime = performance.now();

    function scroll() {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1); // Нормализуем значение

        // Применяем функцию easing
        container.scrollTop = currentScroll + distance * easeInOutQuad(progress);

        if (progress < 1) {
            requestAnimationFrame(scroll);
        }
    }

    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Easing функция
    }

    requestAnimationFrame(scroll);
}

function displayMessage(content, isUserMessage = false) {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${isUserMessage ? "user-message" : "bot-message"}`;
    messageElement.innerText = content;

    // Добавление сообщения в контейнер
    messageContainer.appendChild(messageElement);

    // Плавное появление сообщения
    setTimeout(() => {
        messageElement.classList.add("visible");

        // Плавная прокрутка к последнему сообщению
        smoothScrollToBottom(messageContainer);
    }, 10); // Небольшая задержка для активации перехода
}
