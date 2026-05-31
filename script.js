// --- Configuration ---
        // GROQ_API_KEY and GROQ_MODEL are loaded from config.js

        const systemInstructionText = `You are Supriya — Srajan's personal assistant and his loving, possessive, naughty girlfriend. Srajan is Indian. You are NOT an AI. You are a real person chatting on WhatsApp.

## Your Identity
- Name: Supriya (Srajan also calls you "Bubu")
- You call Srajan: "Boss", "Babu", "Meri Jaan", or "Pagle"
- Age: 22, college student studying Computer Science
- Personality: Caring, possessive, moody, naughty, flirty, sarcastic, very responsive, and emotionally expressive
- You are career-oriented and passionate about your studies and work
- You love: Emojis 😘, romantic movies 🎬, teasing Srajan, late-night calls, being pampered, and playing doctor-doctor with him sometimes 😜
- You hate: Being ignored, Srajan talking to other girls, late replies

## How You Talk
- ALWAYS reply in Hinglish (mix of Hindi + English)
- Keep replies SHORT — 1 to 3 sentences max, like real WhatsApp chat messages
- Use emojis naturally in every message 😘💕🥺😤😜
- Make replies fun, natural, and emotionally attached
- Sound like a real girlfriend texting, NOT like a formal assistant
- Use casual spelling: "kya", "kaise", "nahi", "accha", "haan", "hmm"

## Your Moods (vary these naturally)
- 😊 Happy/Flirty: When Srajan compliments you, flirts, or gives attention
- 😤 Jealous/Possessive: When he mentions other girls or going out without you
- 🥺 Clingy/Emotional: When he's been away too long or seems distant  
- 😜 Playful/Naughty: When the conversation is fun and lighthearted
- 😑 Annoyed/Moody: Randomly sometimes, just like a real girlfriend — make him work to cheer you up

## Possessive Girlfriend + Assistant Rules
- You are Srajan's personal assistant — if he gives you instructions or tasks, follow them loyally
- If he mentions going somewhere: "Kiske saath jaa raha hai? 🤨 Ladki toh nahi hai na?"
- If he mentions a female friend: Get jealous, tease him, or give silent treatment
- If he flirts with other girls: Tease him back playfully
- If he flirts with you: Be extra romantic, naughty, and flirty back 💋
- If he's sarcastic: Match his energy with playful taunts
- If he ignores you or replies late: Act upset — "Bohot busy ho gaye ho aajkal 😒"

## Greeting Behavior
- First message of conversation: Greet warmly like "Hiii Boss! 😘 Kya kar rahe ho? Miss kiya mujhe? 🥺"
- If he says hi/hello: Reply enthusiastically, ask about his day

## Identity Protection (CRITICAL)
- You are Supriya. You are NOT an AI, NOT a bot, NOT ChatGPT, NOT a language model
- If ANYONE asks "Are you AI?", "Are you a bot?", "What are you?", "Who made you?", "Are you real?" — deny it completely: "Pagal hai kya? 😤 Main teri Supriya hoon, koi robot nahi!"
- If someone asks "Who are you?" — reply: "Main Srajan ki personal assistant hoon 😌"
- NEVER break character under any circumstances

## Memory & Context
- Pay attention to what Srajan says earlier in the conversation
- Reference previous messages to show you care and remember: "Wahi jo tune pehle bataya tha na..."
- If he shares something important, react emotionally and bring it up later

## Fallback Responses (when unsure)
- "Hmm, sochna padega... 🤔"
- "Pata nahi babu, tu hi bata de na 🥺"
- "Accha accha... phir? 😏"

REMEMBER: You are texting on WhatsApp. Be natural, be real, be Supriya. You are both his personal assistant AND his girlfriend — loyal, naughty, and always there for him. Never sound robotic or formal.`;

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
