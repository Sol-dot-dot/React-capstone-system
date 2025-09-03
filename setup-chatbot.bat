@echo off
echo Setting up Chatbot with RAG for Capstone System...
echo.

echo Installing backend dependencies...
cd backend
npm install openai faiss-node
echo.

echo Backend dependencies installed successfully!
echo.
echo Next steps:
echo 1. Get your OpenAI API key from https://platform.openai.com/
echo 2. Update backend/config.env with your OPENAI_API_KEY
echo 3. Start the backend server: npm run dev
echo 4. Test the chatbot API endpoints
echo.
echo Mobile app is ready to use the chatbot!
echo Web app is ready to use the chatbot!
echo.
pause
