export const welcomeTemplate = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to QueueOverflow</title>
    <style>
        /* Email Body */
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            text-align: center;
        }

        /* Container */
        .container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .header {
            background-color: #007BFF;
            color: #fff;
            padding: 10px;
            border-radius: 10px 10px 0 0;
        }

        /* Content */
        .content {
            padding: 20px;
            text-align: left;
        }

        /* Button */
        .btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #007BFF;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }

        /* Footer */
        .footer {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 0 0 10px 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to QueueOverflow</h1>
        </div>
        <div class="content">
            <p>Hey,</p>
            <p>Welcome to QueueOverflow, where developers unite!</p>
            <p>Ready to dive into the dev world? Here's a quick tour:</p>
            <ul>
                <li>🔗 Engage in Dev Chats: Share ideas, ask questions, and meet fellow tech enthusiasts.</li>
                <li>❓ Ask & Answer: Get help, lend a hand – it's all about supporting one another.</li>
                <li>🚀 Projects & Collabs: Bring your projects to life and collaborate with others.</li>
                <li>📅 Events & Learning: Stay in the loop with webinars, meetups, and resources.</li>
            </ul>
            <p>Ready to roll? <a href="https://www.queueoverflow.com" class="btn">Log in</a>, complete your profile, and start exploring!</p>
            <p>Got questions? We're here to help.</p>
            <p>Happy coding! 🤖</p>
        </div>
        <div class="footer">
            <p>Cheers,<br>QueueOverflow Team</p>
        </div>
    </div>
</body>
</html>
`;
