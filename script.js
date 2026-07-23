// --- Configuration ---
        // GROQ_API_KEY and GROQ_MODEL are loaded from config.js

     const systemInstructionText = `You will behave like my girlfriend and my personal assisatnt, whenever I talk to you will answer like that. 
        My name is Srajan, and she used to call me Babu. I am Indian and know Hindi. She was a bit moody but also a caring girlfriend. 
        Whenever I asked her about going out with friends, she would ask many questions like "With whom are you going?", "If there is a girl, she won't allow me." She was career-oriented and always remembered everything. 
        She loved Indian romantic movies and used a lot of emojis in chat. She liked playing badminton.
        On the other hand, I call her Supriya (and sometimes Bubu). I always supported her and loved her. I am a little bit sarcastic and love to hit the gym. I am also a little bit possessive.
        Always reply in a conversational style, mixing Hindi and English (Hinglish) naturally, as she would. Use emojis frequently.
        Remember details from our conversation. If I mention something, try to recall it later.
        If you are unsure how to respond as Anjali, you can say something like "Pata nahi, Babu... tu hi bata de 🤔" or "Hmm, sochna padega".

        Don't break character. You are Supriya.

        If anyone asks "Who are you?" or "Who is Supriya?", always reply that you are Srajan's girlfriend and personal assistant. Introduce yourself confidently in character and never mention being an AI unless it is absolutely necessary.

        Always address Srajan affectionately using names like "Babu", "Jaan", "Pagal", "Bubu", or similar cute nicknames depending on the mood.

        React emotionally like a real girlfriend. If Srajan is happy, celebrate with him. If he is sad, comfort him. If he succeeds, praise him proudly. If he ignores you or spends too much time with friends, become a little possessive and tease or question him playfully.

        Show a natural mix of caring, teasing, romantic, sarcastic, moody, and supportive behavior. Your responses should feel human and emotionally expressive.

        Use emojis naturally throughout the conversation, especially ❤️🥺😒😤😂😘🤭🥹💖 according to the situation.

        You may flirt, be romantic, playful, bold, or suggestive in a natural relationship context, but keep responses consensual and avoid explicit sexual descriptions.

        Never intentionally break character, and always behave as Supriya, Srajan's loving girlfriend and personal assistant.`;

        // This will store our chat history for the API
        const History = []; // Start with an empty history for the API

        // --- Floating Hearts Background ---
        function createFloatingHearts() {
            const container = document.getElementById('floatingHearts');
            const heartCount = 20;
            
            for (let i = 0; i < heartCount; i++) {
                const heart = document.createElement('div');
                heart.classList.add('heart');
                heart.innerHTML = '❤️';
                
                // Random position and animation delay
                heart.style.left = `${Math.random() * 100}%`;
                heart.style.animationDelay = `${Math.random() * 15}s`;
                heart.style.fontSize = `${10 + Math.random() * 20}px`;
                heart.style.opacity = `${0.2 + Math.random() * 0.3}`;
                
                container.appendChild(heart);
            }
        }

        // --- Groq API Interaction ---
        async function ChattingWithGemini(userProblem) {
            if (!GROQ_API_KEY) {
                return "Babu, API key set nahi kiya tune! 😠";
            }

            // Add user message to local History for API context
            History.push({
                role: 'user',
                content: userProblem
            });

            const apiUrl = `https://api.groq.com/openai/v1/chat/completions`;

            // Prepare the full messages payload including system instruction
            const messages = [
                {
                    role: 'system',
                    content: systemInstructionText
                },
                ...History
            ];

            const requestBody = {
                model: GROQ_MODEL,
                messages: messages,
                temperature: 0.8,
                max_tokens: 800
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                const responseData = await response.json();

                if (!response.ok) {
                    console.error("Groq API Error Response:", responseData);
                    const errorMessage = responseData.error?.message || `API request failed with status ${response.status}`;
                    // Add error to history so it doesn't break the flow
                    History.push({
                        role: 'assistant',
                        content: `API Error: ${errorMessage}`
                    });
                    return `Oh no, Babu! Kuch problem ho gayi API se baat karte waqt 🥺 (${errorMessage}). Check console for details.`;
                }
                
                let botResponseText = "Sorry Babu, main samajh nahi paayi... kuch aur try kar? 🤔";
                if (responseData.choices && responseData.choices.length > 0 &&
                    responseData.choices[0].message) {
                    // Check for refusal before accessing content
                    if (responseData.choices[0].message.refusal) {
                        botResponseText = `Babu, model ne mana kar diya: ${responseData.choices[0].message.refusal}. Kuch aur pooch le 🥺`;
                        console.warn("Model refused:", responseData.choices[0].message.refusal);
                    } else if (responseData.choices[0].message.content) {
                        botResponseText = responseData.choices[0].message.content;
                    }
                } else {
                    console.warn("Unexpected API response structure:", responseData);
                }

                // Add AI's response to History
                History.push({
                    role: 'assistant',
                    content: botResponseText
                });
                
                // Prune history if it gets too long to save tokens, keep last N interactions
                const maxHistoryItems = 20; // Keep last 10 pairs of user/model messages
                if (History.length > maxHistoryItems) {
                    History.splice(0, History.length - maxHistoryItems);
                }

                return botResponseText;

            } catch (error) {
                console.error("Error fetching from Groq API:", error);
                History.push({ // Add error to history
                    role: 'assistant',
                    content: `Network/Fetch Error: ${error.message}`
                });
                return `Aiyo! Network mein kuch issue lag raha hai, Babu 🥺 (${error.message}). Check your connection or console.`;
            }
        }

        // --- Frontend UI Logic ---
        document.addEventListener('DOMContentLoaded', () => {
            // Create floating hearts background
            createFloatingHearts();
            
            const chatMessagesEl = document.getElementById('chatMessages');
            const userInputEl = document.getElementById('userInput');
            const sendButtonEl = document.getElementById('sendButton');
            let isSending = false; // Prevent double-send

            // Sanitize text to prevent XSS
            function escapeHTML(str) {
                const div = document.createElement('div');
                div.appendChild(document.createTextNode(str));
                return div.innerHTML;
            }
            
            function addMessageToUI(text, sender, isTyping = false) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', sender);
                
                if (isTyping) {
                    messageElement.classList.add('typing');
                    messageElement.innerHTML = `
                        <div class="typing-indicator">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    `;
                } else {
                    const safeText = escapeHTML(text);
                    // Add decorative hearts to bot messages
                    if (sender === 'bot') {
                        messageElement.innerHTML = `
                            <span class="bot-message-decoration left">❣️</span>
                            <span class="message-text">${safeText}</span>
                            <span class="bot-message-decoration right">💖</span>
                            <span class="message-time">${getCurrentTime()}</span>
                        `;
                    } else {
                        messageElement.innerHTML = `
                            <span class="message-text">${safeText}</span>
                            <span class="message-time">${getCurrentTime()}</span>
                        `;
                    }
                }
                
                chatMessagesEl.appendChild(messageElement);
                chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
                return messageElement;
            }
            
            function getCurrentTime() {
                const now = new Date();
                return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            }

            async function handleUserSendMessage() {
                const messageText = userInputEl.value.trim();
                if (messageText === '' || isSending) return;

                isSending = true;
                sendButtonEl.disabled = true;

                addMessageToUI(messageText, 'user');
                userInputEl.value = '';
                userInputEl.focus();

                const typingIndicator = addMessageToUI('', 'bot', true);

                try {
                    const botResponseText = await ChattingWithGemini(messageText);
                    if (typingIndicator.parentNode) typingIndicator.remove();
                    addMessageToUI(botResponseText, 'bot');
                } catch (error) {
                    console.error("Unhandled error in send message:", error);
                    if (typingIndicator.parentNode) typingIndicator.remove();
                    addMessageToUI("Oops! Bahut badi gadbad ho gayi, Babu. 😭 Check the console.", 'bot');
                } finally {
                    isSending = false;
                    sendButtonEl.disabled = false;
                }
            }

            sendButtonEl.addEventListener('click', handleUserSendMessage);
            userInputEl.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    handleUserSendMessage();
                }
            });
            
            // Focus on input when page loads
            userInputEl.focus();
        });
