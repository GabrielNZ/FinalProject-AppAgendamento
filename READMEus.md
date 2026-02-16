# 📆 SchedulingApp Project
[![NPM](https://img.shields.io/npm/l/react)](https://github.com/GabrielNZ/FinalProject-AppAgendamento/blob/main/LICENSE)

# en-US 🇺🇸

### About the project

Before starting my university journey, I really wanted to apply everything I had learned in this 1 year of study into a big real project. **Here it is!**
After 3 months of daily programming, I present my first **Full Stack** project.

Unfortunately, when I started this project, I automatically began coding in my native language, Portuguese. I only realized this halfway through the development. To maintain consistency and avoid having a codebase split between two languages, I decided to finish the project in Portuguese. However, all project documentation and explanations here on GitHub will be provided in English."

It consists of an application in which, through a dashboard, clients and providers can organize service scheduling, that is:
- Provider -> Creates service and weekly availability.
- Client -> Requests the scheduling of a service at an available time.

**More in-depth explanation below and in the demonstration video**

### ⚙️ Back end
- I believe I was able to apply my main knowledge (Backend) in a satisfactory way.
  
- The project logic was created by me; the use of AI was exclusively for code optimization and applying new knowledge:

> Ex:
> My JWT knowledge used in previous projects became outdated for this project,
> therefore, I used AI to update my knowledge.
- [How is the BackEnd structured?](./STRUCTUREbackendus.md)

### ✨ Front end
- I was not able to acquire enough knowledge to use a framework on the front-end yet, so I decided to apply only what I knew (HTML, CSS & JS).
- When analyzing the code, it is easy to notice the lack of organization and the use of simple and direct tools, however considering that I studied little in this area and my focus is on the back-end,
I consider it a great achievement that the code is functional.

Still without knowledge of a framework, I used fetch for REST requests and HTML manipulation with JS for the website.

# 🚦 Running the Project
### 🛠 Prerequisites
- Git
- Docker
### 🚀 How to run it on my machine?
1. Clone the repository: `git clone https://github.com/GabrielNZ/FinalProject-AppAgendamento.git` && `cd FinalProject-AppAgendamento`.
2. Set up the environment variables in the `.env` file.
3. Run docker `docker compose up -d --build` in your terminal.<br>
(The first initialization may take a few minutes.)
4. Open the `Frontend/html/loginpage.html` file in your browser.

### 💡 Troubleshooting:
If you encounter an error related to the `minimum Docker version`:
1. Open your Docker Desktop.
2. Go to `Settings` > `Docker Engine` > and add the following line: `"min-api-version": "1.24"`
<img width="500" height="500" alt="image" src="https://github.com/user-attachments/assets/56b5e336-1ac2-4f8d-8d74-863fc1fe3d34" />

## 🎯 Tecnologies
### Back end
- Java
- JPA
- Spring Boot
- Spring Web
- Spring Security
- Spring Cloud
- JWT
### Front end
- JavaScript
- Html
- Css
### Implementation
- DataBase: MySQL
- Messaging
  - RabbitMQ
  - AMQP
- JavaMailSender
- Docker
## Autor

Gabriel Nicolodi Zimmermann


[https://www.linkedin.com/in/gabriel-n-zimmermann-aba618338/]
