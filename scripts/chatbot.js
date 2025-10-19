// scripts/chatbot.js - FinBot AI Assistant Logic
// UPGRADED with a dedicated close button and smarter toggle icon.

document.addEventListener('DOMContentLoaded', () => {
    // 1. Create and inject the chatbot UI with the new close button
    const chatbotHTML = `
        <div class="chatbot-container">
            <div class="chat-window" id="chat-window">
                <div class="chat-header">
                    <span>FinBot Assistant</span>
                    <button class="close-btn" id="close-chatbot" aria-label="Close Chat">&times;</button>
                </div>
                <div class="chat-messages" id="chat-messages"></div>
                <form class="chat-input-form" id="chatbot-form">
                    <input type="text" id="chatbot-input" placeholder="Ask about 'inflation', 'SIP'..." autocomplete="off">
                    <button type="submit" id="chatbot-submit" aria-label="Send">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                    </button>
                </form>
            </div>
            <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Toggle Chatbot">
                <div class="icon icon-chat">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </div>
                <div class="icon icon-close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                </div>
            </button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // 2. Get references to the DOM elements
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const closeChatbotBtn = document.getElementById('close-chatbot');
    const chatWindow = document.getElementById('chat-window');
    const chatMessages = document.getElementById('chat-messages');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');

    // 3. Function to toggle chat window visibility
    function toggleChatWindow() {
        chatWindow.classList.toggle('open');
        chatbotToggle.classList.toggle('open');
    }

    // Add event listeners for both the main toggle and the new close button
    chatbotToggle.addEventListener('click', toggleChatWindow);
    closeChatbotBtn.addEventListener('click', toggleChatWindow);

    // 4. Handle form submission
    chatbotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userInput = chatbotInput.value.trim();
        if (userInput) {
            addMessage(userInput, 'user');
            chatbotInput.value = '';
            setTimeout(() => {
                const botResponse = getBotResponse(userInput);
                addMessage(botResponse, 'bot');
            }, 500);
        }
    });

    // 5. Function to add a message to the chat window
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`;
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 6. The "AI" Logic (Rule-based for demo)
    function getBotResponse(userInput) {
        const lowerInput = userInput.toLowerCase();
        
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
            return "Hello! I'm FinBot. How can I help you with your financial questions today? Try asking me about a term like 'mutual funds'.";
        }
        
        const financialTerms = window.FW?.TERMS || [];
        for (const term of financialTerms) {
            if (lowerInput.includes(term.k.toLowerCase())) {
                return `You asked about "${term.k}". Here's what that means: ${term.d}`;
            }
        }
        
        return "I'm sorry, I'm not sure how to answer that. I'm best at defining financial terms. For example, you can ask me 'What is SIP?' or 'Tell me about diversification'.";
    }

    // Add initial welcome message from the bot
    addMessage("Welcome to FinWise! I'm FinBot. Ask me to define any financial term.", 'bot');
});