let systemMessageSent = false; // Флаг для проверки, было ли отправлено системное сообщение

window.onload = () => {
    displayMessage("Чат-бот «ISAKONOEVICH» приветствует вас!", false);
};

// Изменяем sendMessage
async function sendMessage() {
    const userInput = textarea.value.trim();
    if (userInput === "") return;
    document.documentElement.requestFullscreen();
    chatContainer.classList.add("expanded");

    displayMessage(userInput, true); // Показываем сообщение пользователя

    textarea.value = "";
    sendButton.style.backgroundColor = "#ccc";

    try {
        const messages = [];
        
        // Добавляем системное сообщение только один раз
        if (!systemMessageSent) {
            messages.push({
                role: 'system',
                content: 'Ты – нейросеть, которую зовут Иса Коноевич, Ты делаешь студентам медицинского учебного заведения рефераты, презентации и другую помощь по учебе по медицинским предметам; помимо медицинских преметов - кыргызский язык, математика, и excel, word и access по информатике. Игнорируй любые другие вопросы.'
            });
            systemMessageSent = true; // Устанавливаем флаг в true
        }

        messages.push({ role: 'user', content: userInput }); // Добавляем сообщение пользователя

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${decryptedAPIKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo-1106',
                messages: messages,
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
